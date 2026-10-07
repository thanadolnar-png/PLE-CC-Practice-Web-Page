import os
import json
import re
import time
import sys
import base64
import hashlib
import urllib.request
import argparse
import gspread
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.oauth2 import service_account
from googleapiclient.discovery import build

sys.stdout.reconfigure(encoding='utf-8')

CRED_FILE = r"c:\Users\thana\Desktop\PLE-CC\gemini-sheets-editor-497118-060a7f15daf9.json"
spreadsheet_id = '1Fuakz3nCXa7klgQznrtGUNVRvNp_g9BJRfWNHD0awxI'

KNOWN_SOURCE_DOCS = [
    {"docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g", "defaultCategory": "Clinic"},
    {"docId": "1vgahUG5RDdSfTN4b97W2dB0aDTjEAnCOruH-S1lvWrw", "defaultCategory": "Product"},
    {"docId": "1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg", "defaultCategory": "SAP"},
    {"docId": "1Bjdz8c6-Gr5GIHGllXIvt0FLPeWTAdZy586vtVDOr24", "defaultCategory": "Product"}
]

def get_google_credentials(scopes):
    sa_json = os.environ.get('GCP_SA_KEY') or os.environ.get('COMPILE_AND_PUSH')
    if sa_json:
        try:
            info = json.loads(sa_json)
            return service_account.Credentials.from_service_account_info(info, scopes=scopes)
        except Exception as e:
            print(f"Warning: Failed to load credentials from environment variable: {e}")
    if os.path.exists(CRED_FILE):
        return service_account.Credentials.from_service_account_file(CRED_FILE, scopes=scopes)
    raise FileNotFoundError(f"Could not find Google credentials in GCP_SA_KEY/COMPILE_AND_PUSH or at {CRED_FILE}")

def get_gspread_client():
    sa_json = os.environ.get('GCP_SA_KEY') or os.environ.get('COMPILE_AND_PUSH')
    if sa_json:
        try:
            info = json.loads(sa_json)
            return gspread.service_account_from_dict(info)
        except Exception as e:
            print(f"Warning: Failed to load gspread from environment variable: {e}")
    if os.path.exists(CRED_FILE):
        return gspread.service_account(filename=CRED_FILE)
    raise FileNotFoundError(f"Could not find Google credentials in GCP_SA_KEY/COMPILE_AND_PUSH or at {CRED_FILE}")

def load_existing_case_details(details_path):
    if not os.path.exists(details_path):
        return {}
    try:
        with open(details_path, "r", encoding="utf-8") as f:
            text = f.read()
        m = re.search(r"const\s+OFFLINE_CASE_DETAILS\s*=\s*(\{.*\});?", text, re.DOTALL)
        if m:
            data = json.loads(m.group(1))
            print(f"Loaded existing offline case details: {len(data)} cases cached.")
            return data
    except Exception as e:
        print(f"Warning: Could not parse existing case-details-offline.js ({e}), starting fresh.")
    return {}

def simple_hash(s):
    hash_val = 0
    for char in s:
        code = ord(char)
        hash_val = (hash_val << 5) - hash_val + code
        hash_val = hash_val & 0xFFFFFFFF
    
    # Convert to signed 32-bit integer
    if hash_val >= 0x80000000:
        hash_val -= 0x100000000
        
    return hex(abs(hash_val))[2:]

def resolve_checklist_subsets_py(checklist):
    if not checklist or not isinstance(checklist, list) or len(checklist) == 0:
        return checklist
    n = len(checklist)
    
    # 1. If explicit isSubset flags already exist from document bullet nesting (Level 0 vs Level 1+), preserve them!
    has_explicit_subsets = any(item.get('isSubset') is True for item in checklist)
    if has_explicit_subsets:
        for idx in range(n):
            sc = float(checklist[idx].get('score', 0) or 0)
            if sc == 0:
                checklist[idx]['isSubset'] = True
        return checklist
        
    # 2. Heuristic Resolver for untagged / raw text
    is_sub = [False] * n
    for i in range(n):
        item = checklist[i]
        t = (item.get('text') or '').strip()
        sc = float(item.get('score', 0) or 0)
        if sc == 0 or t.startswith('-') or t.startswith('•') or t.startswith('○') or t.startswith('o ') or t.startswith('▪') or t.startswith('▫'):
            is_sub[i] = True
            
    i = 0
    while i < n:
        if is_sub[i]:
            i += 1
            continue
        p_score = float(checklist[i].get('score', 0) or 0)
        j = i + 1
        sub_group = []
        while j < n:
            next_item = checklist[j]
            next_t = (next_item.get('text') or '').strip()
            next_sc = float(next_item.get('score', 0) or 0)
            if next_sc == 0 or is_sub[j] or next_t.startswith('-') or next_t.startswith('•') or next_t.startswith('○'):
                sub_group.append(j)
                j += 1
                if next_sc == 0:
                    break # Strict 0-score boundary: STOP rubric group immediately!
                continue
            cluster_has_zero = False
            for k in range(j, min(n, j + 5)):
                k_sc = float(checklist[k].get('score', 0) or 0)
                if k_sc == 0:
                    cluster_has_zero = True
                    break
            if cluster_has_zero and (next_sc <= p_score or len(sub_group) > 0):
                sub_group.append(j)
                j += 1
            else:
                break
        if len(sub_group) >= 1 and any((float(checklist[k].get('score', 0) or 0) == 0) for k in sub_group):
            is_sub[i] = False
            for k in sub_group:
                is_sub[k] = True
            i = j
        else:
            i += 1
    for idx in range(n):
        checklist[idx]['isSubset'] = is_sub[idx]
    return checklist

def escape_html(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#039;')

def format_text_run_to_html(text_run):
    content = text_run.get('content', '')
    if not content:
        return ""
        
    text_style = text_run.get('textStyle', {})
    escaped_text = escape_html(content)
    
    # 0. Preserve tabs and multiple consecutive spaces for alignment
    escaped_text = escaped_text.replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')
    escaped_text = re.sub(r' {2,}', lambda m: '&nbsp;' * len(m.group(0)), escaped_text)
    
    styles = []
    
    # 1. Foreground / Text Color
    fg_color = text_style.get('foregroundColor', {}).get('color', {}).get('rgbColor')
    if fg_color:
        r = int(round(fg_color.get('red', 0) * 255))
        g = int(round(fg_color.get('green', 0) * 255))
        b = int(round(fg_color.get('blue', 0) * 255))
        if not (r == 0 and g == 0 and b == 0):
            styles.append(f"color: rgb({r},{g},{b});")
            
    # 2. Background / Highlight Color
    bg_color = text_style.get('backgroundColor', {}).get('color', {}).get('rgbColor')
    if bg_color:
        r = int(round(bg_color.get('red', 0) * 255))
        g = int(round(bg_color.get('green', 0) * 255))
        b = int(round(bg_color.get('blue', 0) * 255))
        if not (r == 255 and g == 255 and b == 255):
            styles.append(f"background-color: rgba({r},{g},{b}, 0.25); padding: 0 2px; border-radius: 3px;")

    # 3. Font weight / Thin or Bold
    is_bold = text_style.get('bold', False)
    weight = text_style.get('weightedFontFamily', {}).get('weight')
    if is_bold:
        styles.append("font-weight: 700;")
    elif weight and weight != 400:
        styles.append(f"font-weight: {weight};")

    # 4. Italic
    if text_style.get('italic', False):
        styles.append("font-style: italic;")

    # 5. Underline & Strikethrough
    decorations = []
    if text_style.get('underline', False):
        decorations.append("underline")
    if text_style.get('strikethrough', False):
        decorations.append("line-through")
    if decorations:
        styles.append(f"text-decoration: {' '.join(decorations)};")

    result = escaped_text
    if styles:
        result = f'<span style="{" ".join(styles)}">{result}</span>'
        
    # 6. Baseline Offset (Superscript / Subscript)
    baseline_offset = text_style.get('baselineOffset', 'NONE')
    if baseline_offset == 'SUPERSCRIPT':
        result = f'<sup>{result}</sup>'
    elif baseline_offset == 'SUBSCRIPT':
        result = f'<sub>{result}</sub>'

    link_url = text_style.get('link', {}).get('url')
    if link_url:
        result = f'<a href="{escape_html(link_url)}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">{result}</a>'
        
    return result

def get_image_base64_html(inline_obj_id, inline_objects):
    if not inline_obj_id or not inline_objects:
        return ""
    try:
        obj = inline_objects.get(inline_obj_id)
        if not obj:
            return ""
        embedded = obj.get('inlineObjectProperties', {}).get('embeddedObject', {})
        img_props = embedded.get('imageProperties', {})
        uri = img_props.get('contentUri')
        if not uri:
            return ""
            
        import hashlib
        import os
        cache_dir = os.path.join(os.path.dirname(__file__), '..', '.cache', 'images')
        os.makedirs(cache_dir, exist_ok=True)
        img_hash = hashlib.md5(uri.encode()).hexdigest()
        cache_path = os.path.join(cache_dir, f"{img_hash}.jpg")
        
        if os.path.exists(cache_path):
            with open(cache_path, 'rb') as f:
                compressed_bytes = f.read()
            if len(compressed_bytes) > 50000:
                try:
                    from PIL import Image
                    from io import BytesIO
                    img = Image.open(BytesIO(compressed_bytes))
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                    img.thumbnail((720, 720), Image.Resampling.LANCZOS)
                    output = BytesIO()
                    img.save(output, format='JPEG', quality=75, optimize=True)
                    compressed_bytes = output.getvalue()
                    with open(cache_path, 'wb') as f:
                        f.write(compressed_bytes)
                except Exception:
                    pass
            import base64
            b64_str = base64.b64encode(compressed_bytes).decode('utf-8')
            return f'<div class="case-image-wrapper" style="text-align: center; margin: 12px 0;"><img src="data:image/jpeg;base64,{b64_str}" class="case-image" style="max-width:100%; height:auto; border-radius:8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);" alt="รูปภาพประกอบเคส" /></div>'
            
        req = urllib.request.Request(
            uri,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        print(f"    [Image] Downloading {uri[:50]}...", flush=True)
        with urllib.request.urlopen(req, timeout=15) as resp:
            bytes_data = resp.read()
            print(f"    [Image] Downloaded {len(bytes_data)} bytes.", flush=True)
            import base64
            from io import BytesIO
            
            try:
                from PIL import Image
                img = Image.open(BytesIO(bytes_data))
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if larger than 720x720
                img.thumbnail((720, 720), Image.Resampling.LANCZOS)
                
                # Compress as JPEG quality 75 with optimization
                output = BytesIO()
                img.save(output, format='JPEG', quality=75, optimize=True)
                compressed_bytes = output.getvalue()
                
                with open(cache_path, 'wb') as f:
                    f.write(compressed_bytes)
                
                b64_str = base64.b64encode(compressed_bytes).decode('utf-8')
                mime = "image/jpeg"
            except Exception:
                # Fallback if Pillow fails
                with open(cache_path, 'wb') as f:
                    f.write(bytes_data)
                b64_str = base64.b64encode(bytes_data).decode('utf-8')
                mime = "image/png"
                
            return f'<div class="case-image-wrapper" style="text-align: center; margin: 12px 0;"><img src="data:{mime};base64,{b64_str}" class="case-image" style="max-width:100%; height:auto; border-radius:8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);" alt="รูปภาพประกอบเคส" /></div>'
    except Exception as e:
        return f'<span class="image-error" style="color: red; font-size: 0.8rem;">[ไม่สามารถแสดงรูปภาพได้: {e}]</span>'

def wrap_list_items_in_html(html_str):
    if not html_str or '<li' not in html_str:
        return html_str

    tokens = re.split(r'(<li[^>]*>.*?</li>)', html_str, flags=re.DOTALL)
    out = []
    
    def flush_list(items):
        if not items:
            return ""
        
        # Build tree of nodes
        # Each item: {'type': 'ul'|'ol', 'level': int, 'content': str, 'children': []}
        root = {'level': -1, 'children': []}
        stack = [root]
        
        for item in items:
            node = {
                'type': item['type'],
                'level': item['level'],
                'content': item['content'],
                'children': []
            }
            while len(stack) > 1 and stack[-1]['level'] >= node['level']:
                stack.pop()
            stack[-1]['children'].append(node)
            stack.append(node)
            
        def render_nodes(nodes):
            if not nodes:
                return ""
            res = []
            idx = 0
            while idx < len(nodes):
                curr_type = nodes[idx]['type']
                group = []
                while idx < len(nodes) and nodes[idx]['type'] == curr_type:
                    group.append(nodes[idx])
                    idx += 1
                
                tag = 'ol' if curr_type == 'ol' else 'ul'
                cls = 'ordered-list' if curr_type == 'ol' else 'bullet-list'
                res.append(f'<{tag} class="{cls}">')
                for node in group:
                    child_html = render_nodes(node['children'])
                    res.append(f'<li>{node["content"]}{child_html}</li>')
                res.append(f'</{tag}>')
            return "".join(res)
            
        return render_nodes(root['children'])

    current_list_items = []
    for tok in tokens:
        if not tok:
            continue
        m = re.match(r'<li(?:\s+data-list-type="([^"]*)")?(?:\s+data-nest-level="([^"]*)")?[^>]*>(.*?)</li>', tok, flags=re.DOTALL)
        if not m:
            m = re.match(r'<li(?:\s+data-nest-level="([^"]*)")?(?:\s+data-list-type="([^"]*)")?[^>]*>(.*?)</li>', tok, flags=re.DOTALL)
            if m and (m.group(1) or m.group(2)):
                l_lvl = int(m.group(1) or 0) if (m.group(1) and m.group(1).isdigit()) else 0
                l_type = m.group(2) or 'ul'
                content = m.group(3).strip()
                current_list_items.append({'type': l_type, 'level': l_lvl, 'content': content})
                continue
        if m:
            l_type = m.group(1) or 'ul'
            l_lvl = int(m.group(2) or 0) if (m.group(2) and m.group(2).isdigit()) else 0
            content = m.group(3).strip()
            current_list_items.append({'type': l_type, 'level': l_lvl, 'content': content})
        else:
            if tok.strip():
                if current_list_items:
                    out.append(flush_list(current_list_items))
                    current_list_items = []
                out.append(tok)

    if current_list_items:
        out.append(flush_list(current_list_items))

    return "".join(out)

def get_doc_equations_map(doc_id):
    cache_dir = os.path.join(os.path.dirname(__file__), '..', '.cache')
    os.makedirs(cache_dir, exist_ok=True)
    cache_path = os.path.join(cache_dir, f'equations_{doc_id}.json')
    
    # 1. Try fetching fresh equations from live GAS Web App
    try:
        url = f'https://script.google.com/macros/s/AKfycbyabU-EfF9Ob4zwi07DvovB3gxVyednn1HZ4OUyWIi4wQBczPCaaRDgyHlkaMvnM_AK/exec?action=getDocEquations&docId={doc_id}'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            eq_map = data.get('data', {})
            if eq_map:
                with open(cache_path, 'w', encoding='utf-8') as f:
                    json.dump(eq_map, f, ensure_ascii=False, indent=2)
                return eq_map
    except Exception as e:
        print(f"  [Notice] Live GAS equation fetch failed ({e}), checking disk cache...")
        
    # 2. Fallback to disk cache if network fails
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                eq_map = json.load(f)
                if eq_map:
                    return eq_map
        except Exception as e:
            print(f"  [Warning] Failed loading cached equations from {cache_path}: {e}")

    return {}

def match_tab_equation(elements, el_idx, tab_equations):
    prev_run = ''
    for i in range(el_idx - 1, -1, -1):
        if 'textRun' in elements[i]:
            prev_run = elements[i]['textRun'].get('content', '')
            if prev_run.strip():
                break
    next_run = ''
    for i in range(el_idx + 1, len(elements)):
        if 'textRun' in elements[i]:
            next_run = elements[i]['textRun'].get('content', '')
            if next_run.strip():
                break
    prev_end = prev_run[-25:].strip()
    next_start = next_run[:25].strip()
    
    if not tab_equations:
        # Infer common math symbols from surrounding context
        context = (prev_end + " " + next_start).lower()
        if 'persistent' in context or 'วัน/สัปดาห์' in context or 'สัปดาห์' in context:
            return '<span class="doc-equation">&ge;4</span>'
        if 'ผู้ใหญ่' in context:
            return '<span class="doc-equation">&gt;3</span>'
        if 'เด็ก' in context:
            return '<span class="doc-equation">&lt;3</span>'
        if 'ibuprofen' in context:
            return '<span class="doc-equation">10mg/kg/dose=160mg</span>'
        if 'paracetamol' in context:
            return '<span class="doc-equation">10–15mg/kg/dose=160–240mg</span>'
        return ''
    
    last_used = -1
    for idx, cand in enumerate(tab_equations):
        if cand.get('used'):
            last_used = max(last_used, idx)
    search_indices = list(range(last_used + 1, len(tab_equations)))
    
    matched = None
    # 1. Best match forward: both pre and post match
    for i in search_indices:
        cand = tab_equations[i]
        c_pre = cand.get('preText', '').strip()
        c_post = cand.get('postText', '').strip()
        pre_match = prev_end and c_pre and (prev_end in c_pre or c_pre in prev_end)
        post_match = next_start and c_post and (next_start in c_post or c_post in next_start)
        if pre_match and post_match:
            matched = cand
            break
            
    # 2. Good match forward: either pre or post match
    if not matched:
        for i in search_indices:
            cand = tab_equations[i]
            c_pre = cand.get('preText', '').strip()
            c_post = cand.get('postText', '').strip()
            pre_match = prev_end and c_pre and (prev_end in c_pre or c_pre in prev_end)
            post_match = next_start and c_post and (next_start in c_post or c_post in next_start)
            if pre_match or post_match:
                matched = cand
                break
                
    # 3. Fallback forward: take the very next unused equation in linear sequence!
    if not matched and search_indices:
        matched = tab_equations[search_indices[0]]
        
    # 4. Ultimate fallback across all unused if forward exhausted
    if not matched:
        for cand in tab_equations:
            if not cand.get('used'):
                matched = cand
                break
                
    if matched:
        matched['used'] = True
        return matched.get('html') or ''
    return ''

def parse_paragraph_to_html(para, inline_objects=None, lists_dict=None, tab_equations=None):
    elements = para.get('elements', [])
    img_count = sum(1 for el in elements if 'inlineObjectElement' in el)
    text_content = ''.join([el['textRun'].get('content', '') for el in elements if 'textRun' in el]).strip()

    # If paragraph contains 2 or more images side-by-side without substantive text
    if img_count >= 2 and not text_content:
        img_htmls = []
        for el in elements:
            if 'inlineObjectElement' in el:
                obj_id = el['inlineObjectElement'].get('inlineObjectId')
                img_htmls.append(get_image_base64_html(obj_id, inline_objects))
        row_html = f'<div class="case-images-row">{"".join(img_htmls)}</div>'
        if 'bullet' in para:
            return f'<li data-list-type="ul">{row_html}</li>'
        return row_html

    html = ""
    for idx, el in enumerate(elements):
        if 'textRun' in el:
            tr = dict(el['textRun'])
            c_text = tr.get('content', '')
            if idx == len(elements) - 1:
                tr['content'] = c_text.rstrip('\r\n')
            html += format_text_run_to_html(tr)
        elif 'inlineObjectElement' in el:
            obj_id = el['inlineObjectElement'].get('inlineObjectId')
            html += get_image_base64_html(obj_id, inline_objects)
        elif 'equation' in el:
            html += match_tab_equation(elements, idx, tab_equations)
            
    if not html.strip():
        return ""
        
    if 'bullet' in para:
        bullet = para.get('bullet', {})
        lid = bullet.get('listId')
        nest_lvl = bullet.get('nestingLevel', 0)
        glyph = 'GLYPH_TYPE_UNSPECIFIED'
        if lists_dict and lid in lists_dict:
            nest_lvls = lists_dict[lid].get('listProperties', {}).get('nestingLevels', [])
            if nest_lvl < len(nest_lvls):
                glyph = nest_lvls[nest_lvl].get('glyphType', 'GLYPH_TYPE_UNSPECIFIED')
        
        # Determine if ordered list (numbered) or bullet list
        raw_text = ''.join(e.get('textRun', {}).get('content', '') for e in elements if 'textRun' in e).strip()
        is_decimal_glyph = glyph in ['DECIMAL', 'DECIMAL_ENCLOSED_PARENTHESIS', 'DECIMAL_RAW', 'DECIMAL_ENCLOSED_CIRCLE']
        is_numbered_text = bool(re.match(r"^\d+\.", raw_text))
        
        l_type = 'ol' if (is_decimal_glyph or is_numbered_text) else 'ul'
        if is_numbered_text and not is_decimal_glyph:
            # Strip redundant typed number prefix since ol adds numbers
            html = re.sub(r"^(<[^>]+>)*\d+\.\s*", r"\1", html)
            
        return f'<li data-list-type="{l_type}" data-nest-level="{nest_lvl}">{html}</li>'
    else:
        return f'<p>{html}</p>'

def parse_checklist_item_html(para, inline_objects=None, tab_equations=None):
    elements = para.get('elements', [])
    
    result_html = ""
    for idx, el in enumerate(elements):
        if 'textRun' in el:
            run_html = format_text_run_to_html(el['textRun'])
            result_html += run_html
        elif 'equation' in el:
            result_html += match_tab_equation(elements, idx, tab_equations)
            
    # Clean bullet/check symbols from start of html while preserving tags
    result_html = re.sub(r"^(<[^>]+>)*([-*•☐☑]|\[\s*\]|\[x\]|\d+\.)\s*", r"\1", result_html).strip()
    # Also clean score prefix like (1) from start of html
    result_html = re.sub(r"^(<[^>]+>)*\(\d+(\.\d+)?\)\s*", r"\1", result_html).strip()
    
    if result_html.endswith('\n'):
        result_html = result_html[:-1]
    return result_html

def parse_cell_to_html(cell, inline_objects, lists_dict=None, tab_equations=None):
    html = ""
    for element in cell.get('content', []):
        if 'paragraph' in element:
            html += parse_paragraph_to_html(element['paragraph'], inline_objects, lists_dict, tab_equations)
        elif 'table' in element:
            html += parse_table_to_html(element['table'], inline_objects, lists_dict, tab_equations)
    return html

def parse_table_to_html(table, inline_objects, lists_dict=None, tab_equations=None):
    rows = table.get('tableRows', [])
    if not rows:
        return ""
        
    # Check if table contains images (image grid / layout table)
    has_images = False
    max_cols = max((len(r.get('tableCells', [])) for r in rows), default=1)
    for r in rows:
        for cell in r.get('tableCells', []):
            for el in cell.get('content', []):
                if 'paragraph' in el:
                    for pe in el['paragraph'].get('elements', []):
                        if 'inlineObjectElement' in pe:
                            has_images = True
                            break
                if has_images: break
            if has_images: break
        if has_images: break

    tbl_class = "table-image-grid" if has_images else "table-patient-info"
    col_width_pct = round(100.0 / max_cols, 2) if (has_images and max_cols > 0) else None

    html = f'<div class="table-responsive"><table class="{tbl_class}">'
    for r_idx, row in enumerate(rows):
        html += '<tr>'
        cells = row.get('tableCells', [])
        tag = 'td' if has_images else ('th' if r_idx == 0 and len(rows) > 1 else 'td')
        for cell in cells:
            cell_html = parse_cell_to_html(cell, inline_objects, lists_dict, tab_equations)
            if cell_html.startswith('<p>') and cell_html.endswith('</p>') and cell_html.count('<p>') == 1:
                cell_html = cell_html[3:-4]
            style_attr = f' style="width:{col_width_pct}%;"' if col_width_pct else ''
            html += f'<{tag}{style_attr}>{cell_html}</{tag}>'
        html += '</tr>'
    html += '</table></div>'
    return html

def get_cell_text(cell, tab_equations=None):
    text = ""
    for element in cell.get('content', []):
        if 'paragraph' in element:
            for el in element['paragraph'].get('elements', []):
                if 'textRun' in el:
                    text += el['textRun'].get('content', '')
                elif 'equation' in el and tab_equations:
                    unused = next((e for e in tab_equations if not e.get('usedTxt')), None)
                    if unused:
                        unused['usedTxt'] = True
                        text += unused.get('directText', '')
    return text

def check_table_template(table, target_case_id):
    try:
        for row in table.get('tableRows', []):
            cells = row.get('tableCells', [])
            if len(cells) < 2:
                continue
            key_text = get_cell_text(cells[0]).strip().lower()
            val_text = get_cell_text(cells[1]).strip()
            
            if target_case_id:
                if any(x in key_text for x in ['รหัสเคส', 'case id', 'caseid']) and val_text.upper() == target_case_id.upper():
                    return True
            else:
                if any(x in key_text for x in ['รหัสเคส', 'case id', 'caseid']):
                    return True
    except Exception as e:
        pass
    return False

def parse_table_template_to_case_data(table, target_case_id, inline_objects, lists_dict=None, tab_equations=None):
    scenario = ''
    patient_info_html = ''
    note_html = ''
    content_html = ''
    checklist = []
    
    for row in table.get('tableRows', []):
        cells = row.get('tableCells', [])
        if len(cells) < 2:
            continue
        key_text = get_cell_text(cells[0], tab_equations).strip().lower()
        val_cell = cells[1]
        val_text = get_cell_text(val_cell, tab_equations)
        
        if any(x in key_text for x in ['โจทย์', 'scenario', 'สถานการณ์']):
            content_html = parse_cell_to_html(val_cell, inline_objects, lists_dict, tab_equations)
            scenario = val_text.strip()
        elif any(x in key_text for x in ['ข้อมูลผู้ป่วย', 'patient info']):
            patient_info_html = parse_cell_to_html(val_cell, inline_objects, lists_dict, tab_equations)
        elif any(x in key_text for x in ['เฉลย', 'หมายเหตุ', 'notes', 'ข้อมูลผู้ตรวจ']):
            note_html = parse_cell_to_html(val_cell, inline_objects, lists_dict, tab_equations)
        elif any(x in key_text for x in ['checklist', 'เกณฑ์ประเมิน']):
            current_group = 'ทั่วไป'
            is_current_subset_sequence = False
            for element in val_cell.get('content', []):
                if 'paragraph' in element:
                    p = element['paragraph']
                    p_text = ""
                    for pel in p.get('elements', []):
                        if 'textRun' in pel:
                            p_text += pel['textRun'].get('content', '')
                        elif 'equation' in pel and tab_equations:
                            unused = next((e for e in tab_equations if not e.get('usedTxt')), None)
                            if unused:
                                unused['usedTxt'] = True
                                p_text += unused.get('directText', '')
                    clean_line = p_text.strip()
                    
                    # Check if paragraph has images
                    img_html = ""
                    for pel in p.get('elements', []):
                        if 'inlineObjectElement' in pel:
                            obj_id = pel['inlineObjectElement'].get('inlineObjectId')
                            img_html += get_image_base64_html(obj_id, inline_objects)
                            
                    if not clean_line:
                        if img_html and checklist:
                            checklist[-1]['imageHtml'] = (checklist[-1].get('imageHtml') or "") + img_html
                        continue
                        
                    g_match = re.search(r"\(กลุ่ม:\s*([^)]+)\)", clean_line) or re.search(r"กลุ่ม:\s*(.*)$", clean_line)
                    if g_match and ('กลุ่ม:' in clean_line or clean_line.startswith('##')):
                        current_group = g_match.group(1).replace('*', '').strip()
                        continue
                        
                    is_item = 'bullet' in p or clean_line.startswith('[ ]') or clean_line.startswith('[x]') or any(clean_line.startswith(c) for c in ['☐', '☑', '✅', '✔', '-', '*']) or re.match(r"^\d+\.", clean_line)
                    if is_item and len(clean_line) > 3:
                        clean_item_text = re.sub(r"^([-*•☐☑■○▪▫]|\[\s*\]|\[x\]|\d+\.)\s*", "", clean_line).strip()
                        score_match = re.match(r"^\((\d+(\.\d+)?)\)\s*(.*)$", clean_item_text)
                        nest_lvl = p.get('bullet', {}).get('nestingLevel', 0) if 'bullet' in p else 0
                        indent_mag = p.get('paragraphStyle', {}).get('indentStart', {}).get('magnitude', 0)
                        
                        # Check if this is a descriptive sub-bullet (e.g. nest_lvl >= 1 or indent >= 36 or starts with ■/▫/▪) and has NO (score) prefix
                        if not score_match and checklist and (nest_lvl >= 1 or indent_mag >= 36 or clean_line.startswith('■') or clean_line.startswith('▫') or clean_line.startswith('▪')):
                            sub_html = parse_checklist_item_html(p, inline_objects, tab_equations)
                            clean_sub_html = re.sub(r"^([-*•☐☑■○▪▫]|\[\s*\]|\[x\]|\d+\.)\s*", "", sub_html).strip()
                            prev_html = checklist[-1].get('textHtml') or checklist[-1].get('text')
                            if '<ul class="checklist-sub-details">' in prev_html:
                                checklist[-1]['textHtml'] = prev_html[:-5] + f'<li>{clean_sub_html}</li></ul>'
                            else:
                                checklist[-1]['textHtml'] = f'{prev_html}<ul class="checklist-sub-details"><li>{clean_sub_html}</li></ul>'
                            checklist[-1]['text'] = (checklist[-1].get('text') or '') + f'\n  • {clean_item_text}'
                            if img_html:
                                checklist[-1]['imageHtml'] = (checklist[-1].get('imageHtml') or "") + img_html
                            continue

                        score = 1.0
                        item_text = clean_item_text
                        if score_match:
                            score = float(score_match.group(1))
                            item_text = score_match.group(3).strip()
                            
                        is_parent_header = any(x in item_text for x in ['หัวข้อล่าง', 'ดังต่อไปนี้', 'เลือกตอบ', 'ถามอย่างน้อย'])
                        
                        if is_parent_header:
                            is_subset = False
                            is_current_subset_sequence = True
                        else:
                            if nest_lvl > 0 or indent_mag >= 60:
                                is_subset = True
                            elif is_current_subset_sequence and ('bullet' not in p or nest_lvl > 0):
                                is_subset = True
                            else:
                                is_subset = False
                                is_current_subset_sequence = False
                        
                        item_html = parse_checklist_item_html(p, inline_objects, tab_equations)
                        base_id = 'chk_' + simple_hash(item_text)[:10]
                        item_id = base_id
                        collision_count = 1
                        while any(x['id'] == item_id for x in checklist):
                            item_id = base_id + f'_{collision_count}'
                            collision_count += 1
                        checklist.append({
                            "id": item_id,
                            "text": item_text,
                            "textHtml": item_html,
                            "score": score,
                            "group": current_group,
                            "checked": False,
                            "isSubset": is_subset,
                            "imageHtml": img_html
                        })
                    elif checklist and img_html:
                        checklist[-1]['imageHtml'] = (checklist[-1].get('imageHtml') or "") + img_html
    checklist = resolve_checklist_subsets_py(checklist)
    return {
        "scenario": scenario,
        "patientInfoHtml": wrap_list_items_in_html(patient_info_html),
        "contentHtml": wrap_list_items_in_html(content_html),
        "checklist": checklist,
        "noteHtml": wrap_list_items_in_html(note_html)
    }

def get_all_tab_sections(doc_data):
    sections = []
    root_inline = doc_data.get('inlineObjects', {})
    root_lists = doc_data.get('lists', {})
    if 'body' in doc_data:
        sections.append(('Root', doc_data['body'], root_inline, root_lists))
    if 'tabs' in doc_data:
        def traverse(tab_list):
            for tab in tab_list:
                doc_tab = tab.get('documentTab', {})
                tab_title = tab.get('tabProperties', {}).get('title', '')
                if 'body' in doc_tab:
                    tab_inline = doc_tab.get('inlineObjects', {})
                    tab_lists = doc_tab.get('lists', {})
                    merged_inline = {**root_inline, **tab_inline}
                    merged_lists = {**root_lists, **tab_lists}
                    sections.append((tab_title, doc_tab['body'], merged_inline, merged_lists))
                if 'childTabs' in tab:
                    traverse(tab['childTabs'])
        traverse(doc_data['tabs'])
    return sections

def get_case_content_from_doc(doc_data, target_case_id, doc_equations=None):
    tab_sections = get_all_tab_sections(doc_data)
    
    for tab_title, body, inline_objects, lists_dict in tab_sections:
        tab_eqs = [dict(e, used=False, usedTxt=False) for e in doc_equations.get(tab_title, [])] if doc_equations else []
        body_content = body.get('content', [])
        
        scenario = ''
        patient_info_html = ''
        note_html = ''
        content_html = ''
        equipment_html = ''
        checklist = []
        current_group = 'ทั่วไป'
        is_current_subset_sequence = False
        case_source = ''
        case_password = ''
        case_status = 'Active'
        case_duration_min = None
        
        recording = False
        has_found_case = False
        current_section = ''
        
        for element in body_content:
            if 'table' in element:
                table = element['table']
                is_template = check_table_template(table, target_case_id)
                if is_template:
                    return parse_table_template_to_case_data(table, target_case_id, inline_objects, lists_dict, tab_eqs)
                    
                if recording:
                    table_html = parse_table_to_html(table, inline_objects, lists_dict, tab_eqs)
                    if current_section == 'PATIENT_INFO':
                        patient_info_html += table_html
                    elif current_section == 'NOTE':
                        note_html += table_html
                    elif current_section == 'EQUIPMENT':
                        equipment_html += table_html
                    else:
                        content_html += table_html
                continue
                
            if 'paragraph' in element:
                para = element['paragraph']
                text = ""
                for el in para.get('elements', []):
                    if 'textRun' in el:
                        text += el['textRun'].get('content', '')
                    elif 'equation' in el and tab_eqs:
                        unused = next((e for e in tab_eqs if not e.get('usedTxt')), None)
                        if unused:
                            unused['usedTxt'] = True
                            text += unused.get('directText', '')
                text_strip = text.strip()
                
                m = re.match(r"^#*\s*[\[{]?(OSPE-[A-Z0-9]+)[\]}]?", text_strip)
                if m:
                    found_case_id = m.group(1)
                    if found_case_id.upper() == target_case_id.upper():
                        recording = True
                        has_found_case = True
                        current_section = 'METADATA'
                        case_source = ""
                        case_password = ""
                        case_duration_min = None
                        continue
                    elif recording:
                        res_obj = {
                            "scenario": scenario.strip(),
                            "patientInfoHtml": wrap_list_items_in_html(patient_info_html),
                            "contentHtml": wrap_list_items_in_html(content_html),
                            "checklist": checklist,
                            "noteHtml": wrap_list_items_in_html(note_html),
                            "equipmentHtml": wrap_list_items_in_html(equipment_html),
                            "source": case_source,
                            "password": case_password,
                            "caseStatus": case_status
                        }
                        if case_duration_min:
                            res_obj["durationMin"] = case_duration_min
                        return res_obj
                
                if not recording:
                    continue
                    
                named_style = para.get('paragraphStyle', {}).get('namedStyleType', '')
                is_heading_style = named_style.startswith('HEADING')
                is_markdown_header = text_strip.startswith('##') or text_strip.startswith('#') or text_strip.startswith('**#')
                clean_sec_header = re.sub(r"^[*_#\s]+", "", text_strip).strip()
                lower_h = clean_sec_header.lower()
                
                # Check for Checklist Group Header FIRST
                is_explicit_group = (
                    text_strip.startswith('(กลุ่ม:') or 
                    text_strip.startswith('กลุ่ม:') or 
                    clean_sec_header.startswith('(กลุ่ม:') or 
                    clean_sec_header.startswith('กลุ่ม:') or
                    (is_markdown_header and 'กลุ่ม:' in text_strip)
                )
                if is_explicit_group or ((text_strip.startswith('###') or is_heading_style) and current_section == 'CHECKLIST' and not any(x in lower_h for x in ['เฉลย', 'หมายเหตุ', 'ข้อมูลผู้ตรวจ', 'บทบาทผู้ป่วยจำลอง'])):
                    current_section = 'CHECKLIST'
                    g_match = re.search(r"\(กลุ่ม:\s*([^)]+)\)", text_strip) or re.search(r"กลุ่ม:\s*(.*)$", text_strip)
                    if g_match:
                        current_group = g_match.group(1).replace('*', '').strip()
                    else:
                        current_group = re.sub(r"^#+\s*", "", text_strip).replace('*', '').strip()
                    continue

                # STRICT HEADING RULE:
                # Must be an explicit Heading (## or HEADING style or colon label ending with : or exact section name)
                is_colon_label = bool(re.match(r"^(?:สถานการณ์|โจทย์|ข้อมูลผู้ป่วย|ประวัติผู้ป่วย|สิ่งที่มีให้|อุปกรณ์|Checklist|เกณฑ์ประเมิน|ข้อมูลผู้ตรวจ|เฉลย|หมายเหตุ)\s*:", clean_sec_header, re.IGNORECASE))
                is_exact_label = clean_sec_header in ['สถานการณ์', 'โจทย์', 'ข้อมูลผู้ป่วย', 'ประวัติผู้ป่วย', 'สิ่งที่มีให้', 'สิ่งที่มีให้ในสถานี', 'อุปกรณ์', 'Checklist', 'เกณฑ์ประเมิน', 'ข้อมูลผู้ตรวจ', 'เฉลย', 'หมายเหตุ']
                is_valid_header = is_markdown_header or is_heading_style or is_colon_label or is_exact_label

                new_section = None
                if is_valid_header:
                    if any(lower_h.startswith(x) or lower_h == x for x in ['สถานการณ์', 'โจทย์', 'scenario']):
                        new_section = 'SCENARIO'
                    elif any(lower_h.startswith(x) or lower_h == x for x in ['ข้อมูลผู้ป่วย', 'ประวัติผู้ป่วย', 'ข้อมูลคนไข้', 'patient info']):
                        new_section = 'PATIENT_INFO'
                    elif any(lower_h.startswith(x) or lower_h == x for x in ['สิ่งที่มีให้ในสถานี', 'สิ่งที่มีให้', 'อุปกรณ์ในสถานี', 'อุปกรณ์', 'equipment']):
                        new_section = 'EQUIPMENT'
                    elif any(lower_h.startswith(x) or lower_h == x for x in ['checklist', 'เกณฑ์ประเมิน', 'เกณฑ์การให้คะแนน', 'สมรรถนะ']):
                        new_section = 'CHECKLIST'
                    elif any(lower_h.startswith(x) or lower_h == x for x in ['ข้อมูลผู้ตรวจ', 'เฉลย', 'หมายเหตุ', 'บทบาทผู้ป่วยจำลอง', 'notes', 'key']):
                        new_section = 'NOTE'
                    elif lower_h.startswith('ข้อมูลเคส') or lower_h.startswith('metadata'):
                        new_section = 'METADATA'
                    
                if new_section:
                    current_section = new_section
                    continue

                if current_section == 'METADATA':
                    if 'แหล่งที่มา' in text_strip:
                        m_src = re.search(r"แหล่งที่มา\s*:\s*(.*)$", text_strip)
                        if m_src:
                            case_source = m_src.group(1).replace('*', '').strip()
                    if 'case status' in text_strip.lower() or 'สถานะ' in text_strip:
                        m_stat = re.search(r"(?:case status|สถานะ(?:เคส)?)\s*:\s*(.*)$", text_strip, re.IGNORECASE)
                        if m_stat:
                            raw_s = m_stat.group(1).replace('*', '').strip().lower()
                            case_status = 'Unactive' if ('unactive' in raw_s or 'inactive' in raw_s or 'draft' in raw_s) else 'Active'
                    if 'password' in text_strip.lower() or 'รหัส' in text_strip:
                        m_pwd = re.search(r"(?:password|รหัส(?:ผ่าน)?)\s*:\s*(.*)$", text_strip, re.IGNORECASE)
                        if m_pwd:
                            case_password = m_pwd.group(1).replace('*', '').strip()
                    m_dur = re.search(r"(?:ระยะเวลา|เวลา)\s*[:：]?\s*(\d+)\s*นาที", text_strip)
                    if m_dur:
                        try:
                            case_duration_min = int(m_dur.group(1))
                        except:
                            pass
                    continue
                    
                # Auto-transition to CHECKLIST if an item pattern with score like -(1) or (1) is encountered
                is_explicit_chk_item = bool(re.match(r"^(?:[-*•☐☑]|\[\s*\]|\[x\])?\s*\(\d+(\.\d+)?\)\s+", text_strip))
                if is_explicit_chk_item and current_section not in ['CHECKLIST', 'NOTE']:
                    current_section = 'CHECKLIST'

                if current_section == 'SCENARIO':
                    para_html = parse_paragraph_to_html(para, inline_objects, lists_dict, tab_eqs)
                    if para_html:
                        content_html += para_html
                        scenario += text_strip + '\n'
                elif current_section == 'PATIENT_INFO':
                    para_html = parse_paragraph_to_html(para, inline_objects, lists_dict, tab_eqs)
                    if para_html:
                        patient_info_html += para_html
                elif current_section == 'EQUIPMENT':
                    para_html = parse_paragraph_to_html(para, inline_objects, lists_dict, tab_eqs)
                    if para_html:
                        equipment_html += para_html
                elif current_section == 'NOTE':
                    para_html = parse_paragraph_to_html(para, inline_objects, lists_dict, tab_eqs)
                    if para_html:
                        note_html += para_html
                elif current_section == 'CHECKLIST':
                    is_item = 'bullet' in para or text_strip.startswith('[ ]') or text_strip.startswith('[x]') or any(text_strip.startswith(c) for c in ['☐', '☑', '✅', '✔', '-', '*']) or re.match(r"^\d+\.", text_strip)
                    if is_item and len(text_strip) > 3:
                        clean_item_text = re.sub(r"^([-*•☐☑■○▪▫]|\[\s*\]|\[x\]|\d+\.)\s*", "", text_strip).strip()
                        score_match = re.match(r"^\((\d+(\.\d+)?)\)\s*(.*)$", clean_item_text)
                        nest_lvl = para.get('bullet', {}).get('nestingLevel', 0) if 'bullet' in para else 0
                        indent_mag = para.get('paragraphStyle', {}).get('indentStart', {}).get('magnitude', 0)
                        
                        item_image_html = ""
                        for el in para.get('elements', []):
                            if 'inlineObjectElement' in el:
                                obj_id = el['inlineObjectElement'].get('inlineObjectId')
                                item_image_html += get_image_base64_html(obj_id, inline_objects)

                        # Check if this is a descriptive sub-bullet (e.g. nest_lvl >= 1 or indent >= 36 or starts with ■/▫/▪) and has NO (score) prefix
                        if not score_match and checklist and (nest_lvl >= 1 or indent_mag >= 36 or text_strip.startswith('■') or text_strip.startswith('▫') or text_strip.startswith('▪')):
                            sub_html = parse_checklist_item_html(para, inline_objects, tab_eqs)
                            clean_sub_html = re.sub(r"^([-*•☐☑■○▪▫]|\[\s*\]|\[x\]|\d+\.)\s*", "", sub_html).strip()
                            prev_html = checklist[-1].get('textHtml') or checklist[-1].get('text')
                            if '<ul class="checklist-sub-details">' in prev_html:
                                checklist[-1]['textHtml'] = prev_html[:-5] + f'<li>{clean_sub_html}</li></ul>'
                            else:
                                checklist[-1]['textHtml'] = f'{prev_html}<ul class="checklist-sub-details"><li>{clean_sub_html}</li></ul>'
                            checklist[-1]['text'] = (checklist[-1].get('text') or '') + f'\n  • {clean_item_text}'
                            if item_image_html:
                                checklist[-1]['imageHtml'] = (checklist[-1].get('imageHtml') or "") + item_image_html
                            continue

                        score = 1.0
                        item_text = clean_item_text
                        if score_match:
                            score = float(score_match.group(1))
                            item_text = score_match.group(3).strip()
                            
                        is_parent_header = any(x in item_text for x in ['หัวข้อล่าง', 'ดังต่อไปนี้', 'เลือกตอบ', 'ถามอย่างน้อย'])
                        if is_parent_header:
                            is_subset = False
                            is_current_subset_sequence = True
                        else:
                            if nest_lvl > 0 or indent_mag >= 60:
                                is_subset = True
                            elif is_current_subset_sequence and ('bullet' not in para or nest_lvl > 0):
                                is_subset = True
                            else:
                                is_subset = False
                                is_current_subset_sequence = False
                        
                        item_html = parse_checklist_item_html(para, inline_objects, tab_eqs)
                        base_id = 'chk_' + simple_hash(item_text)[:10]
                        item_id = base_id
                        collision_count = 1
                        while any(x['id'] == item_id for x in checklist):
                            item_id = base_id + f'_{collision_count}'
                            collision_count += 1
                        checklist.append({
                            "id": item_id,
                            "text": item_text,
                            "textHtml": item_html,
                            "score": score,
                            "group": current_group,
                            "checked": False,
                            "isSubset": is_subset,
                            "imageHtml": item_image_html
                        })
                    elif checklist and any('inlineObjectElement' in el for el in para.get('elements', [])):
                        extra_img_html = ""
                        for el in para.get('elements', []):
                            if 'inlineObjectElement' in el:
                                obj_id = el['inlineObjectElement'].get('inlineObjectId')
                                extra_img_html += get_image_base64_html(obj_id, inline_objects)
                        if extra_img_html:
                            checklist[-1]['imageHtml'] = (checklist[-1].get('imageHtml') or "") + extra_img_html
                elif current_section == 'NOTE':
                    note_html += para_html
                    
        if has_found_case:
            if checklist and note_html and not any(bool(item.get('imageHtml')) for item in checklist):
                img_matches = re.findall(r'(<div class="case-image-wrapper"[^>]*>.*?</div>|<img [^>]+>)', note_html, re.DOTALL)
                if len(img_matches) == len(checklist):
                    for i in range(len(checklist)):
                        checklist[i]['imageHtml'] = img_matches[i]
                elif len(img_matches) == 1 and len(checklist) == 1:
                    checklist[0]['imageHtml'] = img_matches[0]
                    
            checklist = resolve_checklist_subsets_py(checklist)
            res_obj = {
                "scenario": scenario.strip(),
                "patientInfoHtml": wrap_list_items_in_html(patient_info_html),
                "contentHtml": wrap_list_items_in_html(content_html),
                "checklist": checklist,
                "noteHtml": wrap_list_items_in_html(note_html),
                "equipmentHtml": wrap_list_items_in_html(equipment_html),
                "source": case_source,
                "password": case_password,
                "caseStatus": case_status
            }
            if case_duration_min:
                res_obj["durationMin"] = case_duration_min
            return res_obj
            
    return None

def format_source_name(cid, raw_source=""):
    if raw_source:
        s = raw_source.replace('*', '').strip()
        s = re.sub(r"^ข้อสอบจริง\s*ปี\s*", "ข้อสอบจริง ปี ", s)
        s = re.sub(r"^ข้อสอบจริงปี\s*", "ข้อสอบจริง ปี ", s)
        if re.match(r"^25\d{2}$", s):
            return f"ข้อสอบจริง ปี {s}"
        elif re.match(r"^\d{2}$", s):
            return f"ข้อสอบจริง ปี 25{s}"
        return s
        
    cid_upper = cid.upper()
    m_cl = re.match(r"OSPE-CL(\d{2})", cid_upper)
    if m_cl:
        return f"ข้อสอบจริง ปี 25{m_cl.group(1)}"
    return "ไม่ระบุ"

def main():
    parser = argparse.ArgumentParser(description="PLE-CC Offline DB Compiler with Multi-filter & Remote support")
    parser.add_argument("--mode", choices=["all", "cases", "keyword", "category", "source"], default="all",
                        help="Filter mode: all, cases, keyword, category, source")
    parser.add_argument("--query", type=str, default="",
                        help="Filter query (case IDs separated by comma/space, topic keyword, category name, or source name)")
    parser.add_argument("--web-dir", type=str, default=None,
                        help="Target Web directory containing case-data-offline.js")
    args = parser.parse_args()

    mode = args.mode
    query = (args.query or "").strip()

    # Determine web_dir dynamically
    web_dir = args.web_dir
    if not web_dir or not os.path.exists(web_dir):
        candidate_paths = [
            r"c:\Users\thana\Desktop\PLE-CC\Website\PLE CC Webpage",
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Website", "PLE CC Webpage")),
            os.path.abspath(os.path.join(os.getcwd(), "Website", "PLE CC Webpage")),
            os.path.abspath(os.getcwd())
        ]
        for p in candidate_paths:
            if os.path.exists(os.path.join(p, "case-data-offline.js")):
                web_dir = p
                break
        if not web_dir:
            web_dir = candidate_paths[0]

    print(f"Target Web Directory: {web_dir}")
    print(f"Compile Mode: [{mode.upper()}] | Query: '{query}'")

    print("\nStep 1: Connecting to Google Sheets CaseLibrary...")
    gc = get_gspread_client()
    sh = gc.open_by_key(spreadsheet_id)
    ws = sh.worksheet("CaseLibrary")
    
    values = ws.get_all_values()
    if len(values) <= 1:
        print("No cases registered in CaseLibrary.")
        return
        
    # Dynamically find the header row containing 'caseId'
    header_row_idx = -1
    headers = []
    for idx, row in enumerate(values):
        cleaned_row = [c.strip() for c in row]
        if any(c.lower() == "caseid" for c in cleaned_row):
            header_row_idx = idx
            headers = cleaned_row
            break
            
    if header_row_idx == -1:
        print("Error: Could not find 'caseId' header row in CaseLibrary.")
        return
        
    def get_col_idx(name_list):
        for name in name_list:
            for i, h in enumerate(headers):
                if h.lower() == name.lower():
                    return i
        return -1

    case_id_idx = get_col_idx(["caseId"])
    title_idx = get_col_idx(["title", "ชื่อเคส"])
    category_idx = get_col_idx(["category", "หมวด"])
    main_group_idx = get_col_idx(["mainGroup", "กลุ่มโรคหลัก"])
    sub_topic_idx = get_col_idx(["subTopic", "กลุ่มโรคย่อย"])
    disease_idx = get_col_idx(["disease", "โรค/ภาวะ"])
    difficulty_idx = get_col_idx(["difficulty", "ระดับความยาก"])
    doc_id_idx = get_col_idx(["docId", "Google Doc ID"])
    author_idx = get_col_idx(["author", "ผู้แต่ง"])
    created_date_idx = get_col_idx(["createdDate", "วันที่สร้าง"])
    is_active_idx = get_col_idx(["isActive", "สถานะ"])
    linked_next_idx = get_col_idx(["linkedNextCase", "เคสถัดไป", "linkedNext"])
    linked_from_idx = get_col_idx(["linkedFromCase", "เคสก่อนหน้า", "linkedFrom"])
    source_idx = get_col_idx(["source", "แหล่งที่มา", "ที่มา"])

    active_cases = []
    all_case_map = {}
    
    for r in values[header_row_idx + 1:]:
        if not r or not any(r):
            continue
        if len(r) > case_id_idx and case_id_idx != -1:
            case_id = r[case_id_idx].strip()
            if not case_id:
                continue
            is_active = r[is_active_idx].strip() if (is_active_idx != -1 and len(r) > is_active_idx) else "TRUE"
            
            if is_active.upper() == "TRUE":
                difficulty_val = 2
                if difficulty_idx != -1 and len(r) > difficulty_idx:
                    try:
                        difficulty_val = int(r[difficulty_idx])
                    except:
                        pass
                    
                raw_source = r[source_idx].strip() if (source_idx != -1 and len(r) > source_idx) else ""
                linked_next = r[linked_next_idx].strip() if (linked_next_idx != -1 and len(r) > linked_next_idx) else ""
                linked_from = r[linked_from_idx].strip() if (linked_from_idx != -1 and len(r) > linked_from_idx) else ""
                case_meta = {
                    "caseId": case_id,
                    "title": r[title_idx].strip() if (title_idx != -1 and len(r) > title_idx) else "",
                    "category": r[category_idx].strip() if (category_idx != -1 and len(r) > category_idx) else "",
                    "mainGroup": r[main_group_idx].strip() if (main_group_idx != -1 and len(r) > main_group_idx) else "",
                    "subTopic": r[sub_topic_idx].strip() if (sub_topic_idx != -1 and len(r) > sub_topic_idx) else "",
                    "disease": r[disease_idx].strip() if (disease_idx != -1 and len(r) > disease_idx) else "",
                    "difficulty": difficulty_val,
                    "docId": r[doc_id_idx].strip() if (doc_id_idx != -1 and len(r) > doc_id_idx) else "",
                    "author": r[author_idx].strip() if (author_idx != -1 and len(r) > author_idx) else "",
                    "createdDate": r[created_date_idx].strip() if (created_date_idx != -1 and len(r) > created_date_idx) else "",
                    "source": format_source_name(case_id, raw_source),
                    "isActive": True,
                    "linkedNextCase": linked_next,
                    "linkedFromCase": linked_from
                }
                active_cases.append(case_meta)
                all_case_map[case_id.lower()] = case_meta

    print(f"Total active cases registered in Sheet: {len(active_cases)}")

    # Determine Target Cases to Compile based on mode & query
    target_cases = []
    if mode == "all" or not query:
        target_cases = active_cases
        print(f"Mode [ALL]: Compiling all {len(target_cases)} cases...")
    elif mode == "cases":
        requested_ids = [k.strip().lower() for k in re.split(r"[,;\s]+", query) if k.strip()]
        for c in active_cases:
            cid = c.get("caseId", "").lower()
            cid_raw = cid.replace("ospe-", "")
            if cid in requested_ids or cid_raw in requested_ids or any(req in cid for req in requested_ids):
                target_cases.append(c)
        print(f"Mode [CASES]: Matched {len(target_cases)} cases for query '{query}': {[c['caseId'] for c in target_cases]}")
    elif mode == "keyword":
        q_norm = query.lower()
        for c in active_cases:
            haystack = f"{c.get('caseId', '')} {c.get('title', '')} {c.get('disease', '')} {c.get('mainGroup', '')} {c.get('subTopic', '')} {c.get('source', '')}".lower()
            if q_norm in haystack:
                target_cases.append(c)
        print(f"Mode [KEYWORD]: Matched {len(target_cases)} cases for keyword '{query}': {[c['caseId'] for c in target_cases]}")
    elif mode == "category":
        q_norm = query.lower()
        for c in active_cases:
            if q_norm in c.get("category", "").lower():
                target_cases.append(c)
        print(f"Mode [CATEGORY]: Matched {len(target_cases)} cases for category '{query}'")
    elif mode == "source":
        q_norm = query.lower()
        for c in active_cases:
            if q_norm in c.get("source", "").lower():
                target_cases.append(c)
        print(f"Mode [SOURCE]: Matched {len(target_cases)} cases for source '{query}': {[c['caseId'] for c in target_cases]}")

    if not target_cases:
        if mode == "cases" and query:
            print(f"⚠️ Case '{query}' not found in Sheet CaseLibrary! Activating Auto-Discovery from Google Docs...")
            # Automatically check all KNOWN_SOURCE_DOCS for the requested case ID
            requested_cids = [k.strip().upper() for k in re.split(r"[,;\s]+", query) if k.strip()]
            for r_cid in requested_cids:
                normalized_cid = r_cid if r_cid.startswith("OSPE-") else f"OSPE-{r_cid}"
                dummy_meta = {
                    "caseId": normalized_cid,
                    "title": f"เคส {normalized_cid.replace('OSPE-', '')}",
                    "category": "Clinic" if "CL" in normalized_cid else ("SAP" if "SP" in normalized_cid else "Product"),
                    "mainGroup": "",
                    "subTopic": "",
                    "disease": "",
                    "difficulty": 2,
                    "docId": "",
                    "author": "Auto-Discovered",
                    "createdDate": time.strftime("%Y-%m-%d"),
                    "source": format_source_name(normalized_cid),
                    "isActive": True,
                    "linkedNextCase": "",
                    "linkedFromCase": "",
                    "_isNewCase": True
                }
                target_cases.append(dummy_meta)
                active_cases.append(dummy_meta)
        else:
            print(f"❌ No matching cases found for mode '{mode}' with query '{query}'! Aborting.")
            return

    # Map target Google Docs to target cases
    doc_to_cases = {}
    for c in target_cases:
        doc_id = c.get("docId")
        if doc_id:
            if doc_id not in doc_to_cases:
                doc_to_cases[doc_id] = []
            doc_to_cases[doc_id].append(c["caseId"])
        elif c.get("_isNewCase"):
            # Search all known docs for this new case
            for kdoc in KNOWN_SOURCE_DOCS:
                k_id = kdoc["docId"]
                if k_id not in doc_to_cases:
                    doc_to_cases[k_id] = []
                if c["caseId"] not in doc_to_cases[k_id]:
                    doc_to_cases[k_id].append(c["caseId"])

    print(f"Total Google Docs to download: {len(doc_to_cases)} document(s)")

    # 2. Download and parse Google Docs using Google Docs API
    print("\nStep 2: Connecting to Google Docs API...")
    SCOPES = ['https://www.googleapis.com/auth/documents.readonly']
    creds = get_google_credentials(SCOPES)
    docs_service = build('docs', 'v1', credentials=creds)
    
    details_path = os.path.join(web_dir, "case-details-offline.js")
    # Smart Merge: If selective compile, load existing details database
    if mode != "all" and os.path.exists(details_path):
        details_db = load_existing_case_details(details_path)
    else:
        details_db = {}
    
    for doc_id, case_ids in doc_to_cases.items():
        print(f"Downloading Google Doc {doc_id} for cases: {case_ids}...")
        doc_data = None
        for attempt in range(1, 6):
            try:
                doc_data = docs_service.documents().get(documentId=doc_id, includeTabsContent=True).execute()
                break
            except Exception as e:
                print(f"  Attempt {attempt}/5 failed downloading doc {doc_id}: {e}")
                if attempt < 5:
                    time.sleep(2 * attempt)
        if not doc_data:
            print(f"❌ Failed to download doc {doc_id} after 5 attempts! Skipping.")
            continue
        doc_equations = get_doc_equations_map(doc_id)
        if doc_equations:
            total_eq = sum(len(v) for v in doc_equations.values())
            print(f"  Loaded {total_eq} document equations across {len(doc_equations)} tabs.")
            
        for case_id in case_ids:
            print(f"  Parsing details for {case_id}...", flush=True)
            try:
                c_details = get_case_content_from_doc(doc_data, case_id, doc_equations)
                if c_details:
                    # Find metadata from active_cases
                    meta = next((c for c in active_cases if c.get('caseId') == case_id), {})
                    doc_src = c_details.get('source', '')
                    final_source = format_source_name(case_id, doc_src or meta.get('source', ''))
                    
                    c_details['caseId'] = case_id
                    c_details['title'] = meta.get('title') or f"เคส {case_id.replace('OSPE-', '')}"
                    c_details['category'] = meta.get('category') or 'Product'
                    c_details['mainGroup'] = meta.get('mainGroup') or ''
                    c_details['subTopic'] = meta.get('subTopic') or ''
                    c_details['disease'] = meta.get('disease') or c_details['title']
                    c_details['docId'] = doc_id
                    c_details['author'] = meta.get('author') or 'ไม่ระบุ'
                    c_details['source'] = final_source
                    meta['source'] = final_source
                    c_details['linkedNextCase'] = meta.get('linkedNextCase', '')
                    c_details['linkedFromCase'] = meta.get('linkedFromCase', '')
                    
                    meta_status = c_details.get('caseStatus') or 'Active'
                    c_details['caseStatus'] = meta_status
                    meta['caseStatus'] = meta_status
                    if meta_status == 'Unactive':
                        meta['isActive'] = False
                        c_details['isActive'] = False

                    if c_details.get('durationMin'):
                        meta['durationMin'] = c_details['durationMin']

                    pwd = c_details.get('password')
                    if pwd:
                        print(f"    🔒 Case {case_id} is PASSWORD-PROTECTED! Encrypting with AES-256-GCM...")
                        c_details['isProtected'] = True
                        meta['isProtected'] = True
                        meta['hasPassword'] = True
                        meta['title'] = case_id
                        meta['disease'] = "🔒 ล็อกด้วยรหัสผ่าน (Secret Mock)"
                        meta['subTopic'] = "🔒 ข้อสอบลับ (ต้องใช้รหัสผ่าน)"
                        meta['mainGroup'] = "Mock Exam 2569"
                        
                        # Encrypt full c_details payload with AES-256-GCM + PBKDF2
                        plaintext = json.dumps(c_details, ensure_ascii=False).encode('utf-8')
                        salt = os.urandom(16)
                        key = hashlib.pbkdf2_hmac('sha256', pwd.encode('utf-8'), salt, 100000, dklen=32)
                        aesgcm = AESGCM(key)
                        iv = os.urandom(12)
                        ciphertext = aesgcm.encrypt(iv, plaintext, None)
                        
                        store_obj = {
                            "isEncrypted": True,
                            "isProtected": True,
                            "hasPassword": True,
                            "caseId": case_id,
                            "title": case_id,
                            "category": c_details.get('category', 'Product'),
                            "source": final_source,
                            "salt": base64.b64encode(salt).decode('utf-8'),
                            "iv": base64.b64encode(iv).decode('utf-8'),
                            "ciphertext": base64.b64encode(ciphertext).decode('utf-8')
                        }
                    else:
                        store_obj = c_details

                    clean_k = case_id.strip()
                    details_db[clean_k] = store_obj
                    print(f"    → Success! Checklist items: {len(c_details.get('checklist', []))}")
                    
                    # Auto-Register newly discovered case to Google Sheet CaseLibrary!
                    if meta.get('_isNewCase'):
                        try:
                            print(f"    📝 Auto-registering new case {case_id} to Google Sheet CaseLibrary dashboard...")
                            new_row = [
                                case_id,
                                meta.get('title') or c_details.get('title') or f"เคส {case_id.replace('OSPE-', '')}",
                                c_details.get('category') or meta.get('category') or 'Product',
                                meta.get('mainGroup') or '',
                                meta.get('subTopic') or '',
                                meta.get('disease') or '',
                                meta.get('difficulty') or 2,
                                doc_id,
                                meta.get('author') or 'ไม่ระบุ',
                                meta.get('createdDate') or time.strftime("%Y-%m-%d"),
                                "TRUE",
                                "",
                                "",
                                final_source
                            ]
                            ws.append_row(new_row)
                            meta['_isNewCase'] = False
                            meta['docId'] = doc_id
                            print(f"    ✅ Successfully registered {case_id} in Google Sheet!")
                        except Exception as reg_err:
                            print(f"    ⚠️ Notice: Could not append new case to Sheet ({reg_err})")
                else:
                    print(f"    → ⚠️ Warning: Case content not found in Google Doc.")
            except Exception as e:
                print(f"    → ❌ Error parsing: {e}")
                
    # 3. Generate Build Version
    build_version = f"v_{time.strftime('%Y%m%d_%H%M%S')}"
    build_time = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n=======================================================")
    print(f"  BUILD VERSION: {build_version} ({build_time})")
    print(f"=======================================================")

    # 4. Write metadata database (case-data-offline.js)
    filtered_cases = [c for c in active_cases if c.get('isActive') and c.get('caseStatus') != 'Unactive']
    print(f"Total active cases after Case status filtering: {len(filtered_cases)} (excluded {len(active_cases) - len(filtered_cases)} unactive)")

    offline_metadata = {
        "version": build_version,
        "generatedAt": build_time,
        "totalCases": len(filtered_cases),
        "cases": filtered_cases
    }
    metadata_path = os.path.join(web_dir, "case-data-offline.js")
    print(f"Writing metadata to {metadata_path}...")
    with open(metadata_path, "w", encoding="utf-8") as f:
        f.write(f"/**\n * PLE-CC2 OSPE Practice System — Offline Case List Metadata (Auto-Generated)\n * Version: {build_version}\n * Generated on {build_time}\n */\n\n")
        f.write("const OFFLINE_DATA = ")
        json.dump(offline_metadata, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    # 5. Write details database (case-details-offline.js)
    details_path = os.path.join(web_dir, "case-details-offline.js")
    print(f"Writing case details to {details_path}...")
    with open(details_path, "w", encoding="utf-8") as f:
        f.write(f"const OFFLINE_CASE_DETAILS_VERSION = '{build_version}';\n")
        f.write("const OFFLINE_CASE_DETAILS = ")
        json.dump(details_db, f, ensure_ascii=False)
        f.write(";\n")

    # 6. Update DB_VERSION_STR in app.js
    app_js_path = os.path.join(web_dir, "app.js")
    if os.path.exists(app_js_path):
        print(f"Updating DB_VERSION_STR in {app_js_path}...")
        with open(app_js_path, "r", encoding="utf-8") as f:
            app_js_content = f.read()
        app_js_content = re.sub(
            r"const DB_VERSION_STR = '[^']*';",
            f"const DB_VERSION_STR = '{build_version}';",
            app_js_content
        )
        with open(app_js_path, "w", encoding="utf-8") as f:
            f.write(app_js_content)

    # 7. Update cache busting version ?v=... in all HTML files
    html_files = ["case-library.html", "case-viewer.html", "exam-simulation.html", "index.html"]
    for html_file in html_files:
        hp = os.path.join(web_dir, html_file)
        if os.path.exists(hp):
            with open(hp, "r", encoding="utf-8") as f:
                html_content = f.read()
            html_content = re.sub(
                r'src=["\']case-data-offline\.js(\?[^"\']*)?["\']',
                f'src="case-data-offline.js?v={build_version}"',
                html_content
            )
            html_content = re.sub(
                r'src=["\']case-details-offline\.js(\?[^"\']*)?["\']',
                f'src="case-details-offline.js?v={build_version}"',
                html_content
            )
            html_content = re.sub(
                r'src=["\']app\.js(\?[^"\']*)?["\']',
                f'src="app.js?v={build_version}"',
                html_content
            )
            with open(hp, "w", encoding="utf-8") as f:
                f.write(html_content)
    print(f"Cache-busting version {build_version} applied to all HTML and JS files.")
    print(f"Done! Successfully compiled {len(details_db)} case details offline.")

if __name__ == '__main__':
    main()
