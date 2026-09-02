/**
 * PLE-CC2 OSPE Practice System — Google Apps Script Backend (v3.0)
 * File: Code.gs
 * ========================================================
 * ติดตั้งใน script.google.com ของบัญชีที่มีสิทธิ์เข้าถึง Sheet และ Docs
 * เชื่อมกับ Sheet ID: 1Fuakz3nCXa7klgQznrtGUNVRvNp_g9BJRfWNHD0awxI
 * 
 * ความสามารถเวอร์ชัน 3.0:
 * 1. ดึงภาพ Inline ใน Google Docs และแปลงเป็น Base64 Data URI อัตโนมัติ
 * 2. ค้นหาแบบสลักรหัสเคสมาตรฐาน (OSPE-CL001, OSPE-PD001, OSPE-SP001)
 * 3. ระบบสำรองข้อมูลกรณีไม่มี Sheet (DEFAULT_CASES Fallback)
 * 4. ระบบรองรับการตั้งค่าบิลด์เนื้อหา Docs ตัวอย่าง (setupDocs)
 * 5. ฟังก์ชันรองรับ Google Form onFormSubmit ดึงรูปภาพประกอบเคสเข้า Doc
 */

// คอนฟิกหลักของระบบ
const CONFIG = {
  spreadsheetId: '1Fuakz3nCXa7klgQznrtGUNVRvNp_g9BJRfWNHD0awxI',
  adminPasscode: 'rxcu', // รหัสผ่านสำหรับป้องกันการ Sync และจัดการระบบใน Google Sheet
  sheets: {
    caseLibrary: 'CaseLibrary',
    mainGroups: 'MainGroups',
    settings: 'Settings',
    lobbyRooms: 'LobbyRooms',
    caseReports: 'CaseReports',
    // ─── Room Booking System ───────────────────────
    roomBookings: 'RoomBookings',
    bookingHistory: 'BookingHistory'
  },
  defaultExamRatio: {
    clinic: 8,
    product: 6,
    sap: 2
  }
};

// ฐานข้อมูลเคสเริ่มต้น (Fallback กรณี Sheet ว่างเปล่าหรือไม่ถูกสร้าง)
const DEFAULT_CASES = [
  // ══════════════════════════════════════════════
  // CLINIC CASES (CL001 – CL002)
  // ══════════════════════════════════════════════
  {
    caseId: 'OSPE-CL001',
    title: 'Warfarin Counseling — AF ใหม่',
    category: 'Clinic',
    mainGroup: 'Anticoagulation',
    disease: 'Atrial Fibrillation, Warfarin',
    difficulty: 3,
    docId: '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g',
    author: 'Lin',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  },
  {
    caseId: 'OSPE-CL002',
    title: 'Warfarin Counseling — AF เปลี่ยนมาจาก NOAC',
    category: 'Clinic',
    mainGroup: 'Anticoagulation',
    disease: 'Atrial Fibrillation, Warfarin, Drug Switching',
    difficulty: 4,
    docId: '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g',
    author: 'Lin',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  },
  // ══════════════════════════════════════════════
  // PRODUCT CASES (PD001 – PD002)
  // ══════════════════════════════════════════════
  {
    caseId: 'OSPE-PD001',
    title: 'Compounding — Cold Cream & Labeling',
    category: 'Product',
    mainGroup: 'Compounding - Topical',
    disease: 'Dry Skin, Cold Cream',
    difficulty: 2,
    docId: '1vgahUG5RDdSfTN4b97W2dB0aDTjEAnCOruH-S1lvWrw',
    author: 'Fon',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  },
  {
    caseId: 'OSPE-PD002',
    title: 'Compounding — Oral Suspension & Labeling',
    category: 'Product',
    mainGroup: 'Compounding - Liquid',
    disease: 'Pediatric Fever, Paracetamol Suspension',
    difficulty: 3,
    docId: '1vgahUG5RDdSfTN4b97W2dB0aDTjEAnCOruH-S1lvWrw',
    author: 'Fon',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  },
  // ══════════════════════════════════════════════
  // SAP CASES (SP001 – SP002)
  // ══════════════════════════════════════════════
  {
    caseId: 'OSPE-SP001',
    title: 'Pharmacy Law — ยาควบคุมพิเศษ',
    category: 'SAP',
    mainGroup: 'Pharmacy Law',
    disease: 'Special Controlled Drugs Regulation',
    difficulty: 2,
    docId: '1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg',
    author: 'Irene',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  },
  {
    caseId: 'OSPE-SP002',
    title: 'Pharmacy Law — ยาเสพติดให้โทษประเภท 3',
    category: 'SAP',
    mainGroup: 'Pharmacy Law',
    disease: 'Narcotic Drug, Codeine Prescription',
    difficulty: 3,
    docId: '1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg',
    author: 'Irene',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  }
];

/**
 * ──────────────────────────────────────────────────────────────
 * 1. Entry Point (HTTP GET)
 * ──────────────────────────────────────────────────────────────
 */
function doGet(e) {
  const action = e.parameter.action;
  const page = e.parameter.page;
  
  // 1. ถ้ามีการขอหน้าเว็บ (เช่น ?page=case-library)
  if (page) {
    try {
      const template = HtmlService.createTemplateFromFile(page);
      template.webAppUrl = ScriptApp.getService().getUrl();
      return template.evaluate()
        .setTitle('RxCU OSPE System | RxCU 84-85')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    } catch (err) {
      return HtmlService.createHtmlOutput(`<h1>Error Loading Page: ${page}</h1><p>${err.toString()}</p>`);
    }
  }
  
  // 2. ถ้ามีการส่ง action (เช่น ?action=getCaseList)
  if (action) {
    try {
      switch (action) {
        case 'ping':
          return buildResponse({ message: 'pong', status: 'ready', timestamp: new Date().toISOString() });
          
        case 'getCaseList':
          return buildResponse(getCaseList(e.parameter));
          
        case 'getCase':
          return buildResponse(getCase(e.parameter.id));
          
        case 'getCourseGroups':
          return buildResponse(getCourseGroups(e.parameter.category));
          
        case 'getExamSet':
          return buildResponse(generateExamSet(e.parameter));
          
        case 'getStats':
          return buildResponse(getSystemStats());
          
        case 'createRoom':
          return buildResponse(createRoom(e.parameter));
          
        case 'joinRoom':
          return buildResponse(joinRoom(e.parameter));
          
        case 'getOpenRooms':
          return buildResponse(getOpenRooms());
          
        case 'getRoomStatus':
          return buildResponse(getRoomStatus(e.parameter.roomId));
          
        case 'updateRoomStatus':
          return buildResponse(updateRoomStatus(e.parameter.roomId, e.parameter));
        
        case 'submitReport':
          return buildResponse(submitCaseReport(e.parameter));
          
        case 'getReports':
          return buildResponse(getCaseReports(e.parameter));
          
        default:
          return buildResponse({ error: 'Invalid action parameter' }, 400);
      }
    } catch (error) {
      Logger.log('Error in doGet: ' + error.toString());
      return buildResponse({ error: error.toString(), stack: error.stack }, 500);
    }
  }
  
  // 3. หน้าเริ่มต้น (Default Page)
  try {
    const template = HtmlService.createTemplateFromFile('index');
    template.webAppUrl = ScriptApp.getService().getUrl();
    return template.evaluate()
      .setTitle('RxCU OSPE System | RxCU 84-85')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  } catch (err) {
    return HtmlService.createHtmlOutput(`<h1>Error loading index page</h1><p>${err.toString()}</p>`);
  }
}

/**
 * ฟังก์ชันสร้าง JSON Response
 */
function buildResponse(data, statusCode = 200) {
  const output = {
    success: statusCode >= 200 && statusCode < 300,
    statusCode: statusCode,
    generatedAt: new Date().toISOString(),
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * เปิด Spreadsheet
 */
function getSpreadsheet() {
  if (!CONFIG.spreadsheetId) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
  try {
    return SpreadsheetApp.openById(CONFIG.spreadsheetId);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * ──────────────────────────────────────────────────────────────
 * 2. Case Library Functions
 * ──────────────────────────────────────────────────────────────
 */
function getCaseList(params = {}) {
  let cases = [];
  let loadedFromSheet = false;
  
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.sheets.caseLibrary);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        const headers = ['caseId', 'title', 'category', 'mainGroup', 'subTopic', 'disease', 'difficulty', 'docId', 'author', 'createdDate', 'isActive', 'linkedNextCase', 'linkedFromCase'];
        const rows = data.length > 2 ? data.slice(2) : [];
        
        cases = rows.map(row => {
          const item = {};
          headers.forEach((header, index) => {
            item[header] = row[index];
          });
          return item;
        }).filter(c => c.caseId && c.isActive !== false && c.isActive !== 'FALSE' && String(c.isActive).toUpperCase() !== 'FALSE');
        loadedFromSheet = true;
      }
    }
  } catch (e) {
    Logger.log('ไม่สามารถเข้าถึงสเปรดชีทได้ ใช้โหมดข้อมูลออฟไลน์: ' + e.toString());
  }
  
  // หากเข้าถึงชีทไม่ได้ หรือชีทว่างเปล่า ให้ใช้ข้อมูลเคสดีฟอลต์ (DEFAULT_CASES)
  if (cases.length === 0) {
    cases = [...DEFAULT_CASES];
  }
  
  // กรองข้อมูลตาม Parameters
  if (params.category && params.category !== 'All') {
    cases = cases.filter(c => c.category === params.category);
  }
  if (params.mainGroup && params.mainGroup !== 'All') {
    cases = cases.filter(c => c.mainGroup === params.mainGroup);
  }
  if (params.difficulty && params.difficulty !== 'All') {
    cases = cases.filter(c => String(c.difficulty) === String(params.difficulty));
  }
  if (params.search) {
    const search = params.search.toLowerCase();
    cases = cases.filter(c => 
      c.title.toLowerCase().includes(search) || 
      (c.disease && c.disease.toLowerCase().includes(search)) ||
      (c.caseId && c.caseId.toLowerCase().includes(search))
    );
  }
  
  return {
    count: cases.length,
    cases: cases,
    source: loadedFromSheet ? 'Google Sheets' : 'Hardcoded Defaults'
  };
}

function getCase(caseId) {
  if (!caseId) throw new Error('caseId parameter is required');
  
  const listResult = getCaseList();
  const matchedCase = listResult.cases.find(c => c.caseId === caseId);
  if (!matchedCase) throw new Error('Case not found: ' + caseId);
  
  if (matchedCase.docId) {
    let docData = null;
    try {
      // ✅ Primary: Docs REST API — รองรับ inline images ทุกรูปแบบ (เหมือน Python compiler)
      docData = getCaseContentViaDocsRestApi(matchedCase.docId, caseId);
    } catch (e) {
      Logger.log('REST API failed (' + e + '), falling back to Document Service');
      try {
        docData = getCaseContentFromDoc(matchedCase.docId, caseId);
      } catch (e2) {
        Logger.log('Document Service also failed: ' + e2);
        docData = {
          contentHtml: '<p style="color:red">โหลดเนื้อหาไม่ได้: ' + e2.toString() + '</p>',
          checklist: [], noteHtml: '', patientInfoHtml: '', equipmentHtml: '', scenario: ''
        };
      }
    }
    matchedCase.contentHtml    = docData.contentHtml;
    matchedCase.content        = docData.contentHtml;
    matchedCase.checklist      = docData.checklist;
    matchedCase.noteHtml       = docData.noteHtml;
    matchedCase.note           = docData.noteHtml;
    matchedCase.patientInfoHtml = docData.patientInfoHtml;
    matchedCase.equipmentHtml  = docData.equipmentHtml;
    matchedCase.scenario       = docData.scenario;
  } else {
    matchedCase.contentHtml = '<p>ไม่มีลิงก์เอกสาร Google Doc กำหนดไว้</p>';
    matchedCase.checklist = [];
  }
  
  return matchedCase;
}

// ============================================================
// getCaseContentViaDocsRestApi
// ใช้ Google Docs REST API — รองรับ inline images ทุกรูปแบบ
// ============================================================
function getCaseContentViaDocsRestApi(docId, targetCaseId) {
  const token = ScriptApp.getOAuthToken();
  const resp = UrlFetchApp.fetch(
    'https://docs.googleapis.com/v1/documents/' + docId + '?includeTabsContent=true',
    { headers: { 'Authorization': 'Bearer ' + token }, muteHttpExceptions: true }
  );
  if (resp.getResponseCode() !== 200) {
    throw new Error('Docs REST API ' + resp.getResponseCode() + ': ' + resp.getContentText().substring(0, 200));
  }
  const docJson = JSON.parse(resp.getContentText());
  const cleanTarget = targetCaseId.trim();

  // Collect all tab sections
  const sections = [];
  function addTabSec_(tab) {
    const dt = tab.documentTab;
    if (dt && dt.body && dt.body.content) {
      sections.push({ content: dt.body.content, inlineObjects: dt.inlineObjects || {}, lists: dt.lists || docJson.lists || {} });
    }
    (tab.childTabs || []).forEach(addTabSec_);
  }
  if (docJson.tabs && docJson.tabs.length > 0) {
    docJson.tabs.forEach(addTabSec_);
  } else {
    sections.push({ content: (docJson.body && docJson.body.content) || [], inlineObjects: docJson.inlineObjects || {}, lists: docJson.lists || {} });
  }

  // Image cache
  const _ic = {};
  function fetchImg_(inlineObjects, objId) {
    if (_ic[objId] !== undefined) return _ic[objId];
    const obj = inlineObjects[objId];
    if (!obj) { _ic[objId] = null; return null; }
    const uri = obj.inlineObjectProperties
      && obj.inlineObjectProperties.embeddedObject
      && obj.inlineObjectProperties.embeddedObject.imageProperties
      && obj.inlineObjectProperties.embeddedObject.imageProperties.contentUri;
    if (!uri) { _ic[objId] = null; return null; }
    try {
      const ir = UrlFetchApp.fetch(uri, { headers: { 'Authorization': 'Bearer ' + token }, muteHttpExceptions: true });
      if (ir.getResponseCode() !== 200) { _ic[objId] = null; return null; }
      const b64 = Utilities.base64Encode(ir.getContent());
      const ct = ((ir.getHeaders()['Content-Type'] || ir.getHeaders()['content-type'] || 'image/png') + '').split(';')[0];
      _ic[objId] = 'data:' + ct + ';base64,' + b64;
      return _ic[objId];
    } catch(e) { _ic[objId] = null; return null; }
  }

  function applyTs_(ts, txt) {
    if (!ts || !txt || txt === '\n') return escapeHtml(txt || '');
    let s = escapeHtml(txt);
    if (ts.bold) s = '<strong>' + s + '</strong>';
    if (ts.italic) s = '<em>' + s + '</em>';
    if (ts.underline) s = '<u>' + s + '</u>';
    if (ts.strikethrough) s = '<del>' + s + '</del>';
    if (ts.foregroundColor && ts.foregroundColor.color && ts.foregroundColor.color.rgbColor) {
      const rgb = ts.foregroundColor.color.rgbColor;
      s = '<span style="color:rgb(' + Math.round((rgb.red||0)*255) + ',' + Math.round((rgb.green||0)*255) + ',' + Math.round((rgb.blue||0)*255) + ')">' + s + '</span>';
    }
    if (ts.link && ts.link.url) s = '<a href="' + ts.link.url + '" target="_blank" rel="noopener">' + s + '</a>';
    return s;
  }

  function getParaTxt_(para) {
    return (para.elements || []).map(el => (el.textRun && el.textRun.content) || '').join('').trim();
  }

  function renderEls_(elements, inlineObjects) {
    let html = ''; let hasImg = false;
    for (const el of (elements || [])) {
      if (el.textRun) {
        const t = el.textRun.content || '';
        if (t === '\n') continue;
        html += applyTs_(el.textRun.textStyle, t);
      } else if (el.inlineObjectElement) {
        const dataUri = fetchImg_(inlineObjects, el.inlineObjectElement.inlineObjectId);
        if (dataUri) {
          hasImg = true;
          html += '</p><div class="case-image-wrapper" style="text-align:center;margin:12px 0;"><img src="' + dataUri + '" class="case-image" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" alt="รูปภาพประกอบเคส"/></div><p>';
        }
      }
    }
    return { html: html, hasImg: hasImg };
  }

  function wrapListItemsInHtml_(htmlStr) {
    if (!htmlStr || htmlStr.indexOf('<li') === -1) return htmlStr;
    const tokens = htmlStr.split(/(<li[^>]*>.*?<\/li>)/);
    const out = [];
    let currentListType = null;
    let currentListItems = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (!tok) continue;
      const m = tok.match(/<li(?:\s+data-list-type="([^"]*)")?[^>]*>(.*?)<\/li>/);
      if (m) {
        const lType = m[1] || 'ul';
        const content = m[2];
        if (currentListType && currentListType !== lType) {
          const tag = currentListType === 'ol' ? 'ol' : 'ul';
          const cls = currentListType === 'ol' ? 'ordered-list' : 'bullet-list';
          out.push('<' + tag + ' class="' + cls + '">' + currentListItems.join('') + '</' + tag + '>');
          currentListItems = [];
        }
        currentListType = lType;
        currentListItems.push('<li>' + content + '</li>');
      } else {
        if (tok.trim()) {
          if (currentListItems.length > 0) {
            const tag = currentListType === 'ol' ? 'ol' : 'ul';
            const cls = currentListType === 'ol' ? 'ordered-list' : 'bullet-list';
            out.push('<' + tag + ' class="' + cls + '">' + currentListItems.join('') + '</' + tag + '>');
            currentListItems = [];
            currentListType = null;
          }
          out.push(tok);
        }
      }
    }
    if (currentListItems.length > 0) {
      const tag = currentListType === 'ol' ? 'ol' : 'ul';
      const cls = currentListType === 'ol' ? 'ordered-list' : 'bullet-list';
      out.push('<' + tag + ' class="' + cls + '">' + currentListItems.join('') + '</' + tag + '>');
    }
    return out.join('');
  }

  function parsePara_(para, inlineObjects, listsDict) {
    if (!para.elements || para.elements.length === 0) return '';
    const { html, hasImg } = renderEls_(para.elements, inlineObjects);
    const trimmed = html.trim();
    if (!trimmed && !hasImg) return '';

    // If paragraph contains 2 or more images side-by-side without substantive text
    const imgCount = (para.elements || []).filter(el => el.inlineObjectElement).length;
    const textContent = (para.elements || []).map(el => (el.textRun && el.textRun.content) || '').join('').trim();
    if (imgCount >= 2 && !textContent) {
      const rowHtml = '<div class="case-images-row">' + trimmed + '</div>';
      if (para.bullet) return '<li data-list-type="ul">' + rowHtml + '</li>';
      return rowHtml;
    }
    
    if (para.bullet) {
      const lid = para.bullet.listId;
      let glyph = 'GLYPH_TYPE_UNSPECIFIED';
      if (listsDict && listsDict[lid]) {
        const nestLvl = para.bullet.nestingLevel || 0;
        const nestLvls = (listsDict[lid].listProperties && listsDict[lid].listProperties.nestingLevels) || [];
        if (nestLvl < nestLvls.length) {
          glyph = nestLvls[nestLvl].glyphType || 'GLYPH_TYPE_UNSPECIFIED';
        }
      }
      const lType = (glyph === 'DECIMAL' || glyph === 'DECIMAL_ENCLOSED_PARENTHESIS' || glyph === 'DECIMAL_RAW') ? 'ol' : 'ul';
      return '<li data-list-type="' + lType + '">' + trimmed + '</li>';
    } else {
      return ('<p>' + trimmed + '</p>').replace(/<p><\/p>/g, '').replace(/<p>\s*<\/p>/g, '');
    }
  }

  function parseTable_(table, inlineObjects, listsDict) {
    const rows = table.tableRows || [];
    if (rows.length === 0) return '';

    // Check if table contains images
    let hasImages = false;
    let maxCols = 1;
    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r].tableCells || [];
      if (cells.length > maxCols) maxCols = cells.length;
      for (let c = 0; c < cells.length; c++) {
        for (const cnt of (cells[c].content || [])) {
          if (cnt.paragraph && cnt.paragraph.elements) {
            for (const el of cnt.paragraph.elements) {
              if (el.inlineObjectElement) { hasImages = true; break; }
            }
          }
          if (hasImages) break;
        }
        if (hasImages) break;
      }
      if (hasImages) break;
    }

    const tblClass = hasImages ? 'table-image-grid' : 'table-patient-info';
    const colWidthPct = hasImages ? (100.0 / maxCols).toFixed(1) : null;
    const styleAttr = hasImages ? ' style="width:100%;border-collapse:collapse;table-layout:fixed;"' : ' style="width:100%;border-collapse:collapse;"';

    let h = '<div class="table-responsive"><table class="' + tblClass + '"' + styleAttr + '>';
    for (let r = 0; r < rows.length; r++) {
      h += '<tr>';
      const cells = rows[r].tableCells || [];
      for (const cell of cells) {
        const tag = hasImages ? 'td' : (r === 0 ? 'th' : 'td');
        let cellHtml = '';
        for (const cnt of (cell.content || [])) {
          if (cnt.paragraph) {
            const pRes = renderEls_(cnt.paragraph.elements, inlineObjects);
            if (pRes.html) cellHtml += pRes.html;
          } else if (cnt.table) {
            cellHtml += parseTable_(cnt.table, inlineObjects, listsDict);
          }
        }
        const cellStyle = colWidthPct ? ' style="width:' + colWidthPct + '%;padding:6px;vertical-align:middle;text-align:center;"' : ' style="border:1px solid #e2e8f0;padding:0.5rem 0.75rem;"';
        h += '<' + tag + cellStyle + '>' + cellHtml + '</' + tag + '>';
      }
      h += '</tr>';
    }
    return h + '</table></div>';
  }

  function isHeading_(para) {
    const st = (para.paragraphStyle && para.paragraphStyle.namedStyleType) || '';
    if (st.startsWith('HEADING_')) return true;
    const ft = (para.elements && para.elements[0] && para.elements[0].textRun && para.elements[0].textRun.content) || '';
    return ft.startsWith('## ') || ft.startsWith('# ');
  }

  // Parse each tab section
  for (const { content, inlineObjects, lists } of sections) {
    let recording = false, currentSection = 'SCENARIO';
    let scenario = '', contentHtml = '', patientInfoHtml = '', equipmentHtml = '', noteHtml = '';
    const checklist = []; let currentGroup = '';

    for (const se of content) {
      if (se.paragraph) {
        const para = se.paragraph;
        const text = getParaTxt_(para);
        const cm = text.match(/^#+\s*[\[{]([A-Z0-9\-]+)[\]}]/) || text.match(/^[\[{]([A-Z0-9\-]+)[\]}]/);
        if (cm) {
          if (cm[1].trim() === cleanTarget) { recording = true; currentSection = 'SCENARIO'; }
          else if (recording) break;
          continue;
        }
        if (!recording) continue;

        if (isHeading_(para) && !text.startsWith('(กลุ่ม:') && !text.startsWith('**กลุ่ม:')) {
          const ct = text.replace(/^#+\s*/, '').trim();
          if (ct.includes('ข้อมูลเคส')) currentSection = 'METADATA';
          else if (ct.includes('โจทย์') || ct.includes('สถานการณ์')) currentSection = 'SCENARIO';
          else if (ct.includes('ข้อมูลผู้ป่วย')) currentSection = 'PATIENT_INFO';
          else if (ct.includes('สิ่งที่มีให้') || ct.includes('อุปกรณ์')) currentSection = 'EQUIPMENT';
          else if (ct.toLowerCase().includes('checklist') || ct.includes('ทักษะ') || ct.includes('รายการ') || ct.includes('เกณฑ์') || ct.includes('ประเมิน') || ct.includes('สมรรถนะ')) currentSection = 'CHECKLIST';
          else if (ct.includes('หมายเหตุ') || ct.includes('เฉลย') || ct.includes('ข้อมูลผู้ตรวจ')) currentSection = 'NOTE';
          // Preserve current section if it's a minor subheading within scenario (e.g. "ซองที่ 1", "สูตรตำรับ")
        }

        if (currentSection === 'CHECKLIST') {
          const gm = text.match(/\(กลุ่ม:\s*([^)]+)\)/) || text.match(/กลุ่ม:\s*(.*)$/);
          if (gm) { currentGroup = gm[1].replace(/\*/g,'').trim(); continue; }
        }

        if (currentSection === 'SCENARIO') {
          const ph = parsePara_(para, inlineObjects, lists); if (ph) { contentHtml += ph; scenario += text + '\n'; }
        } else if (currentSection === 'PATIENT_INFO') {
          const ph = parsePara_(para, inlineObjects, lists); if (ph) patientInfoHtml += ph;
        } else if (currentSection === 'EQUIPMENT') {
          const ph = parsePara_(para, inlineObjects, lists); if (ph) equipmentHtml += ph;
        } else if (currentSection === 'NOTE') {
          const ph = parsePara_(para, inlineObjects, lists); if (ph) noteHtml += ph;
        } else if (currentSection === 'CHECKLIST') {
          if (!text) continue;
          let itemText = text;
          for (const pat of [/^\[\s*[x✓✅✔☑]\s*\]\s*(.*)/, /^\[\s*\]\s*(.*)/, /^[☐☑✅✔○]\s*(.*)/, /^[-*]\s+(.*)/, /^\d+\.\s+(.*)/]) {
            const m = text.match(pat); if (m) { itemText = m[1].trim(); break; }
          }
          const sm = itemText.match(/^\((\d+(?:\.\d+)?)\)\s*(.*)/);
          const sc = sm ? parseFloat(sm[1]) : 1;
          if (sm) itemText = sm[2].trim();
          if (!itemText) continue;
          let imgHtml = '';
          for (const el of (para.elements || [])) {
            if (el.inlineObjectElement) {
              const du = fetchImg_(inlineObjects, el.inlineObjectElement.inlineObjectId);
              if (du) imgHtml += '<div class="case-image-wrapper" style="text-align:center;margin:8px 0;"><img src="' + du + '" class="case-image" style="max-width:90%;height:auto;border-radius:6px;" alt="รูปประกอบ"/></div>';
            }
          }
          checklist.push({ id: 'chk_' + simpleHash(itemText).substring(0, 10), text: itemText, score: sc, group: currentGroup, checked: false, imageHtml: imgHtml });
        }

      } else if (se.table) {
        if (!recording) continue;
        const th = parseTable_(se.table);
        if (currentSection === 'PATIENT_INFO') patientInfoHtml += th;
        else if (currentSection === 'NOTE') noteHtml += th;
        else if (currentSection === 'EQUIPMENT') equipmentHtml += th;
        else if (currentSection === 'SCENARIO') contentHtml += th;
      }
    }

    if (recording) {
      return {
        scenario: scenario.trim(),
        contentHtml: wrapListItemsInHtml_(contentHtml),
        patientInfoHtml: wrapListItemsInHtml_(patientInfoHtml),
        equipmentHtml: wrapListItemsInHtml_(equipmentHtml),
        checklist: checklist,
        noteHtml: wrapListItemsInHtml_(noteHtml)
      };
    }
  }

  throw new Error('Case ' + targetCaseId + ' not found in any tab via REST API.');
}

/**
 * 🔍 DEBUG FUNCTION: ทดสอบการอ่านเนื้อหาเคสแบบ step-by-step
 * วิธีใช้: เปิด Apps Script → เลือก testGetCaseContent → กด Run → ดู Execution Log
 */
function testGetCaseContent() {
  const docId = '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g';
  const targetCaseId = 'OSPE-CL999';
  
  Logger.log('=== testGetCaseContent: ' + targetCaseId + ' ===');
  
  const doc = DocumentApp.openById(docId);
  const bodies = getAllDocumentTabBodies(doc);
  Logger.log('Total bodies (tabs): ' + bodies.length);
  
  for (let b = 0; b < bodies.length; b++) {
    const body = bodies[b];
    Logger.log('\n--- Scanning body/tab ' + b + ' (' + body.getText().length + ' chars) ---');
    
    let recording = false;
    let hasFoundCase = false;
    let currentSection = '';
    let scenario = '';
    let checklist = [];
    let patientInfoHtml = '';
    let contentHtml = '';
    let noteHtml = '';
    let currentGroup = 'ทั่วไป';
    
    const numChildren = body.getNumChildren();
    Logger.log('numChildren: ' + numChildren);
    
    for (let i = 0; i < numChildren; i++) {
      const child = body.getChild(i);
      const type = child.getType();
      
      if (type === DocumentApp.ElementType.TABLE) {
        if (recording) Logger.log('[i=' + i + '] TABLE in section=' + currentSection);
        continue;
      }
      
      if (type === DocumentApp.ElementType.PARAGRAPH) {
        const p = child.asParagraph();
        const text = p.getText().trim();
        const heading = p.getHeading();
        
        // Log only when recording or when finding case header
        const caseIdMatch = text.match(/^#+\s*[\[{](OSPE-[A-Z0-9]+)[\]}]/) || text.match(/^[\[{](OSPE-[A-Z0-9]+)[\]}]/);
        if (caseIdMatch) {
          const foundCaseId = caseIdMatch[1];
          Logger.log('[i=' + i + '] CASE HEADER found: ' + foundCaseId + ' | heading=' + heading + ' | text preview: ' + text.substring(0, 60));
          if (foundCaseId === targetCaseId) {
            recording = true;
            hasFoundCase = true;
            currentSection = 'METADATA';
            Logger.log('  → recording=TRUE, currentSection=METADATA');
            continue;
          } else if (recording) {
            Logger.log('  → Found next case, stopping');
            break;
          }
          continue;
        }
        
        if (!recording) continue;
        
        // Log all paragraphs when recording
        Logger.log('[i=' + i + '] PARA | heading=' + heading + ' | section=' + currentSection + ' | text: ' + text.substring(0, 80));
        
        // Section detection
        const isHeadingLevel = (heading === DocumentApp.ParagraphHeading.HEADING1 || 
                                 heading === DocumentApp.ParagraphHeading.HEADING2 ||
                                 heading === DocumentApp.ParagraphHeading.HEADING3 ||
                                 text.startsWith('## ') || text.startsWith('# '));
        
        if (isHeadingLevel && !text.startsWith('(กลุ่ม:') && !text.startsWith('**กลุ่ม:')) {
          const cleanText = text.replace(/^#+\s*/, '').trim();
          let newSection = '';
          if (cleanText.includes('ข้อมูลเคส')) newSection = 'METADATA';
          else if (cleanText.includes('โจทย์') || cleanText.includes('สถานการณ์')) newSection = 'SCENARIO';
          else if (cleanText.includes('ข้อมูลผู้ป่วย')) newSection = 'PATIENT_INFO';
          else if (cleanText.toLowerCase().includes('checklist') || cleanText.includes('ทักษะ') || cleanText.includes('รายการ') || cleanText.includes('เกณฑ์') || cleanText.includes('ประเมิน') || cleanText.includes('สมรรถนะ')) newSection = 'CHECKLIST';
          else if (cleanText.includes('หมายเหตุ') || cleanText.includes('เฉลย') || cleanText.includes('ข้อมูลผู้ตรวจ')) newSection = 'NOTE';
          else newSection = 'OTHER';
          
          Logger.log('  → SECTION CHANGE: ' + currentSection + ' → ' + newSection + ' (cleanText: "' + cleanText + '")');
          currentSection = newSection;
          continue;
        }
      }
      
      if (!recording) continue;
      
      // Content collection logging
      if (currentSection === 'SCENARIO' && type === DocumentApp.ElementType.PARAGRAPH) {
        const t = child.asParagraph().getText().trim();
        if (t) { Logger.log('  → SCENARIO collected: ' + t.substring(0, 60)); scenario += t + '\n'; }
      } else if (currentSection === 'CHECKLIST') {
        let t = '';
        if (type === DocumentApp.ElementType.LIST_ITEM) t = child.asListItem().getText().trim();
        else if (type === DocumentApp.ElementType.PARAGRAPH) t = child.asParagraph().getText().trim();
        if (t) Logger.log('  → CHECKLIST item: ' + t.substring(0, 60));
      } else if (currentSection === 'NOTE' && type === DocumentApp.ElementType.PARAGRAPH) {
        const t = child.asParagraph().getText().trim();
        if (t) Logger.log('  → NOTE collected: ' + t.substring(0, 60));
      }
    }
    
    if (hasFoundCase) {
      Logger.log('\n=== RESULT ===');
      Logger.log('scenario length: ' + scenario.length);
      Logger.log('patientInfoHtml length: ' + patientInfoHtml.length);
      Logger.log('checklist items: ' + checklist.length);
      Logger.log('noteHtml length: ' + noteHtml.length);
      return;
    }
  }
  
  Logger.log('Case NOT FOUND in any tab!');
}

/**
 * 🔍 DEBUG FUNCTION: ทดสอบการอ่าน Tabs ใน Google Doc
 * วิธีใช้: เปิด Apps Script → เลือกฟังก์ชัน testDocTabs → กด Run → ดู Execution Log
 */
function testDocTabs() {
  // ใส่ DocId ของ Doc ที่มีหลาย Tab
  const docId = '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g'; // Clinic Doc
  
  const doc = DocumentApp.openById(docId);
  Logger.log('=== DOC TAB DIAGNOSTIC ===');
  Logger.log('Doc Name: ' + doc.getName());
  Logger.log('Has getTabs method: ' + (typeof doc.getTabs === 'function'));
  
  if (typeof doc.getTabs !== 'function') {
    Logger.log('❌ doc.getTabs() is NOT available in this runtime');
    Logger.log('Fallback: reading doc.getBody() → ' + doc.getBody().getText().substring(0, 100));
    return;
  }
  
  const tabs = doc.getTabs();
  Logger.log('Total tabs returned: ' + tabs.length);
  
  if (tabs.length === 0) {
    Logger.log('❌ getTabs() returned empty array — Tabs API may not be enabled for this doc');
    Logger.log('Fallback body text: ' + doc.getBody().getText().substring(0, 100));
    return;
  }
  
  tabs.forEach(function(tab, idx) {
    try {
      Logger.log('--- Tab ' + idx + ' ---');
      Logger.log('  Title: ' + tab.getTitle());
      Logger.log('  ID: ' + tab.getId());
      Logger.log('  Has asDocumentTab: ' + (typeof tab.asDocumentTab === 'function'));
      
      if (typeof tab.asDocumentTab === 'function') {
        const docTab = tab.asDocumentTab();
        const body = docTab.getBody();
        const text = body.getText();
        Logger.log('  Body length: ' + text.length + ' chars');
        Logger.log('  First 200 chars: ' + text.substring(0, 200));
        
        // ค้นหา Case ID ใน Tab นี้
        const matches = text.match(/[\[({](OSPE-[A-Z0-9]+)[\])}]/g);
        Logger.log('  Case IDs found: ' + (matches ? matches.join(', ') : 'none'));
      }
      
      // ลูก Tab (nested)
      if (typeof tab.getChildTabs === 'function') {
        const children = tab.getChildTabs();
        Logger.log('  Child tabs: ' + children.length);
      }
    } catch (e) {
      Logger.log('  ❌ Error reading tab ' + idx + ': ' + e.toString());
    }
  });
}

/**
 * Helper function to retrieve all Document Tab bodies recursively (supporting nested tabs)
 */
function getAllDocumentTabBodies(doc) {
  const bodies = [];
  
  // ตรวจสอบว่า getTabs API พร้อมใช้งานหรือไม่
  if (typeof doc.getTabs !== 'function') {
    Logger.log('[getAllDocumentTabBodies] doc.getTabs() ไม่พร้อมใช้งาน ใช้ getBody() แทน');
    try {
      const body = doc.getBody();
      if (body) bodies.push(body);
    } catch(e) {}
    return bodies;
  }
  
  const tabs = doc.getTabs();
  Logger.log('[getAllDocumentTabBodies] พบ ' + tabs.length + ' แท็บ');
  
  function traverse(tabList, depth) {
    if (!tabList || tabList.length === 0) return;
    tabList.forEach(function(tab, idx) {
      try {
        Logger.log('[Tab ' + depth + '.' + idx + '] ' + tab.getTitle());
        if (typeof tab.asDocumentTab === 'function') {
          const body = tab.asDocumentTab().getBody();
          if (body) {
            bodies.push(body);
            Logger.log('  → เพิ่ม body สำเร็จ (' + body.getText().length + ' chars)');
          }
        }
      } catch (e) {
        Logger.log('  → ❌ Error: ' + e.toString());
      }
      
      // Traverse nested child tabs
      if (typeof tab.getChildTabs === 'function') {
        const childTabs = tab.getChildTabs();
        if (childTabs && childTabs.length > 0) {
          traverse(childTabs, depth + 1);
        }
      }
    });
  }
  
  if (tabs.length > 0) {
    traverse(tabs, 0);
  }
  
  // Fallback: ถ้าไม่สามารถดึง body ได้จาก getTabs ให้ใช้ getBody() เดิม
  if (bodies.length === 0) {
    Logger.log('[getAllDocumentTabBodies] ไม่ได้รับ body จาก getTabs() — fallback to doc.getBody()');
    try {
      const body = doc.getBody();
      if (body) bodies.push(body);
    } catch (e) {}
  }
  
  return bodies;
}

function getCaseContentFromDoc(docId, targetCaseId) {
  const doc = DocumentApp.openById(docId);
  const bodies = getAllDocumentTabBodies(doc);
  
  for (let b = 0; b < bodies.length; b++) {
    const body = bodies[b];
    let currentSection = '';
    let scenario = '';
    let patientInfoHtml = '';
    let noteHtml = '';
    let contentHtml = '';
    let equipmentHtml = '';
    
    const checklist = [];
    let currentGroup = 'ทั่วไป';
    
    let recording = false;
    let hasFoundCase = false;
    
    const numChildren = body.getNumChildren();
    
    for (let i = 0; i < numChildren; i++) {
      const child = body.getChild(i);
      const type = child.getType();
      
      // 1. ตรวจสอบว่าตารางแม่แบบเขียนเคสหรือไม่ (Table Template)
      if (type === DocumentApp.ElementType.TABLE) {
        const table = child.asTable();
        const isTemplate = checkTableTemplate(table, targetCaseId);
        if (isTemplate) {
          return parseTableTemplateToCaseData(table, targetCaseId);
        }
        
        // ถ้าเป็นตารางทั่วไปที่อยู่ในส่วน ข้อมูลผู้ป่วย หรือ เฉลย
        if (recording) {
          const tableHtml = parseTableToHtml(table);
          if (currentSection === 'PATIENT_INFO') {
            patientInfoHtml += tableHtml;
          } else if (currentSection === 'NOTE') {
            noteHtml += tableHtml;
          } else if (currentSection === 'EQUIPMENT') {
            equipmentHtml += tableHtml;
          } else {
            contentHtml += tableHtml;
          }
        }
        continue;
      }
      
      // 2. ตรวจสอบย่อหน้าหัวข้อต่างๆ
      if (type === DocumentApp.ElementType.PARAGRAPH) {
        const p = child.asParagraph();
        const text = p.getText().trim();
        const heading = p.getHeading();
        
        // ค้นหาการประกาศเคสใหม่ — รองรับทั้ง [OSPE-CL001] และ {OSPE-CL001}
        const caseIdMatch = text.match(/^#+\s*[\[{](OSPE-[A-Z0-9]+)[\]}]/) || text.match(/^[\[{](OSPE-[A-Z0-9]+)[\]}]/);
        if (caseIdMatch) {
          const foundCaseId = caseIdMatch[1];
          if (foundCaseId === targetCaseId) {
            recording = true;
            hasFoundCase = true;
            currentSection = 'METADATA';
            continue;
          } else if (recording) {
            // เจอเคสถัดไปแล้ว หยุดบันทึกแล้ว return ทันที
            return {
              scenario: scenario.trim(),
              patientInfoHtml: patientInfoHtml,
              contentHtml: contentHtml,
              checklist: checklist,
              noteHtml: noteHtml,
              equipmentHtml: equipmentHtml
            };
          }
        }
        
        if (!recording) continue;
        
        // ตรวจสอบหัวข้อหลักย่อย (ต้องไม่ใช่การระบุกลุ่มย่อยของ Checklist เช่น (กลุ่ม: ...))
        if ((heading === DocumentApp.ParagraphHeading.HEADING1 || 
             heading === DocumentApp.ParagraphHeading.HEADING2 || 
             text.startsWith('## ') || 
             text.startsWith('# ')) &&
            !text.startsWith('(กลุ่ม:') &&
            !text.startsWith('**กลุ่ม:')) {
          
          const cleanText = text.replace(/^#+\s*/, '').trim();
          if (cleanText.includes('ข้อมูลเคส')) {
            currentSection = 'METADATA';
          } else if (cleanText.includes('โจทย์') || cleanText.includes('สถานการณ์')) {
            currentSection = 'SCENARIO';
          } else if (cleanText.includes('ข้อมูลผู้ป่วย')) {
            currentSection = 'PATIENT_INFO';
          } else if (cleanText.includes('สิ่งที่มีให้') || cleanText.includes('อุปกรณ์')) {
            currentSection = 'EQUIPMENT';
          } else if (cleanText.includes('Checklist') || cleanText.toLowerCase().includes('checklist') || cleanText.includes('\u0e17\u0e31\u0e01\u0e29\u0e30') || cleanText.includes('\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23') || cleanText.includes('\u0e40\u0e01\u0e13\u0e11') || cleanText.includes('\u0e1b\u0e23\u0e30\u0e40\u0e21\u0e34\u0e19') || cleanText.includes('\u0e2a\u0e21\u0e23\u0e23\u0e16\u0e19\u0e30')) {
            currentSection = 'CHECKLIST';
          } else if (cleanText.includes('หมายเหตุ') || cleanText.includes('เฉลย') || cleanText.includes('ข้อมูลผู้ตรวจ')) {
            currentSection = 'NOTE';
          }
          // Do not switch to 'OTHER' if it's a sub-heading inside scenario or equipment
        }
        
        // ตรวจสอบกลุ่ม Checklist
        if (currentSection === 'CHECKLIST' && 
            (heading === DocumentApp.ParagraphHeading.HEADING2 ||
             heading === DocumentApp.ParagraphHeading.HEADING3 || 
             heading === DocumentApp.ParagraphHeading.HEADING4 || 
             text.startsWith('###') || 
             text.startsWith('**กลุ่ม:') ||
             text.startsWith('(กลุ่ม:'))) {
          
          const groupMatch = text.match(/\(กลุ่ม:\s*([^)]+)\)/) || text.match(/กลุ่ม:\s*([^*]+)/);
          if (groupMatch) {
            currentGroup = groupMatch[1].trim();
          } else {
            currentGroup = text.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
          }
          continue;
        }
      }
      
      if (!recording) continue;
      
      // 3. สะสมข้อมูลข้อความจากย่อหน้า
      if (currentSection === 'SCENARIO') {
        if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
          const item = (type === DocumentApp.ElementType.PARAGRAPH) ? child.asParagraph() : child.asListItem();
          const paragraphHtml = parseParagraphToHtml(item);
          if (paragraphHtml) {
            contentHtml += paragraphHtml;
            scenario += item.getText().trim() + '\n';
          }
        }
      } 
      else if (currentSection === 'PATIENT_INFO') {
        if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
          const item = (type === DocumentApp.ElementType.PARAGRAPH) ? child.asParagraph() : child.asListItem();
          const paragraphHtml = parseParagraphToHtml(item);
          if (paragraphHtml) {
            patientInfoHtml += paragraphHtml;
          }
        }
      } 
      else if (currentSection === 'EQUIPMENT') {
        if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
          const item = (type === DocumentApp.ElementType.PARAGRAPH) ? child.asParagraph() : child.asListItem();
          const paragraphHtml = parseParagraphToHtml(item);
          if (paragraphHtml) {
            equipmentHtml += paragraphHtml;
          }
        }
      } 
      else if (currentSection === 'CHECKLIST') {
        if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
          let text = '';
          let itemImageHtml = '';
          const para = (type === DocumentApp.ElementType.PARAGRAPH) ? child.asParagraph() : child.asListItem();
          text = para.getText().trim();

          // ดึงรูปภาพ inline ที่อยู่ในข้อ checklist ด้วย
          const numParaChildren = para.getNumChildren();
          for (let pi = 0; pi < numParaChildren; pi++) {
            const pc = para.getChild(pi);
            if (pc.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
              try {
                const img = pc.asInlineImage();
                const blob = img.getBlob();
                const base64 = Utilities.base64Encode(blob.getBytes());
                const mime = blob.getContentType() || 'image/png';
                itemImageHtml += `<div class="case-image-wrapper" style="text-align:center;margin:8px 0;"><img src="data:${mime};base64,${base64}" class="case-image" style="max-width:100%;height:auto;border-radius:6px;" alt="รูปประกอบ" /></div>`;
              } catch(e) {}
            }
          }

          const isChecklistItem = type === DocumentApp.ElementType.LIST_ITEM || text.startsWith('[ ]') || text.startsWith('[x]') || text.startsWith('\u2610') || text.startsWith('\u2611') || text.startsWith('\u2705') || text.startsWith('\u2714') || text.startsWith('\u25cb') || text.startsWith('-') || text.startsWith('*') || /^\\d+\\./.test(text);
          if (isChecklistItem && text.length > 3) {
            let cleanText = text.replace(/^([-*\u2022\u2710\u2705\u2714\u2610\u2611]|\[\s*\]|\[x\]|\d+\.)\s*/, '').trim();
            const scoreMatch = cleanText.match(/^\((\d+(\.\d+)?)\)\s*(.*)$/);
            let score = 1;
            let itemText = cleanText;

            if (scoreMatch) {
              score = parseFloat(scoreMatch[1]);
              itemText = scoreMatch[3].trim();
            }

            const itemId = 'chk_' + simpleHash(itemText).substring(0, 10);
            checklist.push({
              id: itemId,
              text: itemText,
              score: score,
              group: currentGroup,
              checked: false,
              imageHtml: itemImageHtml || ''
            });
          }
        }
      } 
      else if (currentSection === 'NOTE') {
        if (type === DocumentApp.ElementType.PARAGRAPH) {
          const paragraphHtml = parseParagraphToHtml(child.asParagraph());
          if (paragraphHtml) {
            noteHtml += paragraphHtml;
          }
        } else if (type === DocumentApp.ElementType.LIST_ITEM) {
          const liHtml = parseParagraphToHtml(child.asListItem());
          noteHtml += `<li>${liHtml}</li>`;
        }
      }
    } // end for i loop
    
    // If we finished scanning a body tab and found the case, return it
    if (hasFoundCase) {
      return {
        scenario: scenario.trim(),
        patientInfoHtml: patientInfoHtml,
        contentHtml: contentHtml,
        checklist: checklist,
        noteHtml: noteHtml,
        equipmentHtml: equipmentHtml
      };
    }
  } // end for b loop
  
  throw new Error('Case ' + targetCaseId + ' not found in any tab of this document.');
}

function checkTableTemplate(table, targetCaseId) {
  try {
    const numRows = table.getNumRows();
    if (numRows < 4) return false;
    
    // ค้นหาหัวข้อรหัสเคสในคอลัมน์แรกเพื่อสกัด ID
    for (let r = 0; r < Math.min(numRows, 4); r++) {
      const row = table.getRow(r);
      if (row.getNumCells() < 2) continue;
      
      const keyText = row.getCell(0).getText().trim().toLowerCase();
      const valText = row.getCell(1).getText().trim();
      
      // ถ้าร้องขอ caseId เจาะจง ให้เช็คตรงกันแบบเป๊ะๆ
      if (targetCaseId) {
        if ((keyText.includes('รหัสเคส') || keyText.includes('case id') || keyText.includes('caseid')) && valText === targetCaseId) {
          return true;
        }
      } else {
        // ถ้าใช้หาทั่วไปใน Doc scan
        if (keyText.includes('รหัสเคส') || keyText.includes('case id') || keyText.includes('caseid')) {
          return true;
        }
      }
    }
  } catch(e) {
    Logger.log('Error checking table template: ' + e.toString());
  }
  return false;
}

function parseTableTemplateToCaseData(table, targetCaseId) {
  let scenario = '';
  let patientInfoHtml = '';
  let noteHtml = '';
  let contentHtml = '';
  const checklist = [];
  
  const numRows = table.getNumRows();
  
  for (let r = 0; r < numRows; r++) {
    const row = table.getRow(r);
    if (row.getNumCells() < 2) continue;
    
    const keyCell = row.getCell(0);
    const valCell = row.getCell(1);
    const keyText = keyCell.getText().trim().toLowerCase();
    
    if (keyText.includes('โจทย์') || keyText.includes('scenario') || keyText.includes('สถานการณ์')) {
      contentHtml = parseCellToHtml(valCell);
      scenario = valCell.getText().trim();
    }
    else if (keyText.includes('ข้อมูลผู้ป่วย') || keyText.includes('patient info')) {
      patientInfoHtml = parseCellToHtml(valCell);
    }
    else if (keyText.includes('checklist') || keyText.includes('เกณฑ์ประเมิน')) {
      const text = valCell.getText();
      const lines = text.split('\n');
      let currentGroup = 'ทั่วไป';
      
      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;
        
        // ค้นหาการประกาศกลุ่มย่อย เช่น (กลุ่ม: การซักประวัติ)
        const groupMatch = cleanLine.match(/\(กลุ่ม:\s*([^)]+)\)/) || cleanLine.match(/กลุ่ม:\s*(.*)$/);
        if (groupMatch && (cleanLine.includes('กลุ่ม:') || cleanLine.startsWith('##'))) {
          currentGroup = groupMatch[1].trim();
          return;
        }
        
         const isChecklistItem = cleanLine.startsWith('[ ]') || cleanLine.startsWith('[x]') || cleanLine.startsWith('\u2610') || cleanLine.startsWith('\u2611') || cleanLine.startsWith('\u2705') || cleanLine.startsWith('\u2714') || cleanLine.startsWith('-') || cleanLine.startsWith('*') || /^\\d+\\./.test(cleanLine);
        if (isChecklistItem && cleanLine.length > 3) {
          let itemTextRaw = cleanLine.replace(/^([-☐☑]|\[\s*\]|\[x\])\s*/, '').trim();
          const scoreMatch = itemTextRaw.match(/^\((\d+(\.\d+)?)\)\s*(.*)$/);
          let score = 1;
          let itemText = itemTextRaw;
          
          if (scoreMatch) {
            score = parseFloat(scoreMatch[1]);
            itemText = scoreMatch[3].trim();
          }
          
          const itemId = 'chk_' + simpleHash(itemText).substring(0, 10);
          checklist.push({
            id: itemId,
            text: itemText,
            score: score,
            group: currentGroup,
            checked: false
          });
        }
      });
    }
    else if (keyText.includes('เฉลย') || keyText.includes('หมายเหตุ') || keyText.includes('notes') || keyText.includes('ข้อมูลผู้ตรวจ')) {
      noteHtml = parseCellToHtml(valCell);
    }
  }
  
  return {
    scenario: scenario,
    patientInfoHtml: patientInfoHtml,
    contentHtml: contentHtml,
    checklist: checklist,
    noteHtml: noteHtml
  };
}

function parseCellToHtml(cell) {
  let html = '';
  const numChildren = cell.getNumChildren();
  for (let i = 0; i < numChildren; i++) {
    const child = cell.getChild(i);
    const type = child.getType();
    
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      html += parseParagraphToHtml(child.asParagraph());
    } else if (type === DocumentApp.ElementType.TABLE) {
      html += parseTableToHtml(child.asTable());
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      html += `<li>${parseParagraphToHtml(child.asListItem())}</li>`;
    }
  }
  return html;
}

/**
 * ฟังก์ชันย่อยแปลงย่อย่อหน้าใน Doc เป็น HTML (รองรับสี ตัวหนา ตัวเอียง ลิงก์ และรูปภาพ)
 */
function parseTextElementToHtml(textElement) {
  const text = textElement.getText();
  if (!text) return '';
  
  try {
    const indices = textElement.getTextAttributeIndices();
    if (!indices || indices.length === 0) return escapeHtml(text);
    
    let html = '';
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i];
      const end = (i + 1 < indices.length) ? indices[i + 1] : text.length;
      const chunk = text.substring(start, end);
      if (!chunk) continue;
      
      let chunkHtml = escapeHtml(chunk);
      const styles = [];
      
      const isBold = textElement.isBold(start);
      const isItalic = textElement.isItalic(start);
      const isUnderline = textElement.isUnderline(start);
      const isStrikethrough = textElement.isStrikethrough(start);
      const fgColor = textElement.getForegroundColor(start);
      const bgColor = textElement.getBackgroundColor(start);
      const linkUrl = textElement.getLinkUrl(start);
      
      if (isBold) styles.push('font-weight: 700;');
      if (isItalic) styles.push('font-style: italic;');
      
      const decors = [];
      if (isUnderline) decors.push('underline');
      if (isStrikethrough) decors.push('line-through');
      if (decors.length > 0) styles.push('text-decoration: ' + decors.join(' ') + ';');
      
      if (fgColor && fgColor !== '#000000') {
        styles.push('color: ' + fgColor + ';');
      }
      if (bgColor && bgColor !== '#ffffff') {
        styles.push('background-color: ' + bgColor + '; padding: 0 2px; border-radius: 3px;');
      }
      
      if (styles.length > 0) {
        chunkHtml = '<span style="' + styles.join(' ') + '">' + chunkHtml + '</span>';
      }
      if (linkUrl) {
        chunkHtml = '<a href="' + escapeHtml(linkUrl) + '" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">' + chunkHtml + '</a>';
      }
      
      html += chunkHtml;
    }
    return html;
  } catch(e) {
    return escapeHtml(text);
  }
}

function parseParagraphToHtml(paragraph) {
  let html = '';
  const numChildren = paragraph.getNumChildren();
  
  if (numChildren === 0) {
    return '';
  }
  
  for (let i = 0; i < numChildren; i++) {
    const child = paragraph.getChild(i);
    const type = child.getType();
    
    if (type === DocumentApp.ElementType.TEXT) {
      html += parseTextElementToHtml(child.asText());
    } else if (type === DocumentApp.ElementType.INLINE_IMAGE) {
      try {
        const image = child.asInlineImage();
        const blob = image.getBlob();
        const bytes = blob.getBytes();
        const base64 = Utilities.base64Encode(bytes);
        const mimeType = blob.getContentType() || 'image/png';
        html += `<div class="case-image-wrapper" style="text-align: center; margin: 12px 0;">
          <img src="data:${mimeType};base64,${base64}" class="case-image" style="max-width:100%; height:auto; border-radius:8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);" alt="รูปภาพประกอบเคส" />
        </div>`;
      } catch (e) {
        html += `<span class="image-error" style="color: red; font-size: 0.8rem;">[ไม่สามารถแสดงรูปภาพได้: ${e.toString()}]</span>`;
      }
    }
  }
  
  return html ? `<p>${html}</p>` : '';
}

/**
 * ฟังก์ชันแปลงตารางใน Doc เป็น HTML
 */
function parseTableToHtml(table) {
  const numRows = table.getNumRows();
  if (numRows === 0) return '';

  let hasImages = false;
  let maxCols = 1;
  for (let r = 0; r < numRows; r++) {
    const row = table.getRow(r);
    const numCells = row.getNumCells();
    if (numCells > maxCols) maxCols = numCells;
    for (let c = 0; c < numCells; c++) {
      const cell = row.getCell(c);
      const numParas = cell.getNumChildren();
      for (let p = 0; p < numParas; p++) {
        const item = cell.getChild(p);
        if (item.getType() === DocumentApp.ElementType.PARAGRAPH || item.getType() === DocumentApp.ElementType.LIST_ITEM) {
          const numGrandChildren = item.asParagraph().getNumChildren();
          for (let gc = 0; gc < numGrandChildren; gc++) {
            if (item.asParagraph().getChild(gc).getType() === DocumentApp.ElementType.INLINE_IMAGE) {
              hasImages = true;
              break;
            }
          }
        }
        if (hasImages) break;
      }
      if (hasImages) break;
    }
    if (hasImages) break;
  }

  const tblClass = hasImages ? 'table-image-grid' : 'table-patient-info';
  const colWidthPct = hasImages ? (100.0 / maxCols).toFixed(1) : null;
  const styleAttr = hasImages ? ' style="width:100%;border-collapse:collapse;table-layout:fixed;"' : '';

  let html = `<div class="table-responsive"><table class="${tblClass}"${styleAttr}>`;

  for (let r = 0; r < numRows; r++) {
    const row = table.getRow(r);
    html += '<tr>';
    const numCells = row.getNumCells();
    const tag = hasImages ? 'td' : ((r === 0 && numRows > 1) ? 'th' : 'td');

    for (let c = 0; c < numCells; c++) {
      const cell = row.getCell(c);
      const cellParas = [];
      const numParas = cell.getNumChildren();
      for (let p = 0; p < numParas; p++) {
        const para = cell.getChild(p);
        if (para.getType() === DocumentApp.ElementType.PARAGRAPH) {
          const paraHtml = parseParagraphToHtml(para.asParagraph());
          if (paraHtml) cellParas.push(paraHtml);
        } else if (para.getType() === DocumentApp.ElementType.LIST_ITEM) {
          const paraHtml = parseParagraphToHtml(para.asListItem());
          if (paraHtml) cellParas.push(paraHtml);
        }
      }
      let cellHtml = cellParas.join('');
      if (!cellHtml) cellHtml = escapeHtml(cell.getText().trim());
      if (cellHtml.startsWith('<p>') && cellHtml.endsWith('</p>') && (cellHtml.match(/<p>/g) || []).length === 1) {
        cellHtml = cellHtml.slice(3, -4);
      }
      const cellStyle = colWidthPct ? ` style="width:${colWidthPct}%;padding:6px;vertical-align:middle;text-align:center;"` : '';
      html += `<${tag}${cellStyle}>${cellHtml}</${tag}>`;
    }
    html += '</tr>';
  }
  html += '</table></div>';
  return html;
}

/**
 * ──────────────────────────────────────────────────────────────
 * 4. Course Groups & Stats
 * ──────────────────────────────────────────────────────────────
 */
function getCourseGroups(category = 'All') {
  let groups = [];
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.sheets.mainGroups);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      if (data.length > 2) {
        const headers = data[1]; // แถวที่ 2 คือ Headers
        const rows = data.slice(2); // ข้ามแถว 1 (แบนเนอร์) และแถว 2 (Headers)
        groups = rows.map(row => {
          const item = {};
          headers.forEach((header, index) => {
            item[header] = row[index];
          });
          return item;
        });
      }
    }
  } catch (e) {
    Logger.log('Error getting course groups: ' + e.toString());
  }
  
  if (groups.length === 0) {
    // ใช้ 15 กลุ่มวิชามาตรฐานตามแผน
    groups = [
      { name: 'Pharmacy Counseling', category: 'Clinic', description: 'การให้คำแนะนำความทั่วไป' },
      { name: 'Anticoagulation', category: 'Clinic', description: 'การจัดการยาละลายลิ่มเลือด' },
      { name: 'Diabetes Mellitus', category: 'Clinic', description: 'การแนะนำเข็มอินซูลินและยาเบาหวาน' },
      { name: 'Asthma & COPD', category: 'Clinic', description: 'การแนะนำอุปกรณ์พ่นยาโรคปอด' },
      { name: 'Hypertension', category: 'Clinic', description: 'การประเมินยาลดความดันโลหิต' },
      { name: 'Dyslipidemia', category: 'Clinic', description: 'การติดตามโรคไขมันอุดตันในเส้นเลือด' },
      { name: 'Drug Information', category: 'Clinic', description: 'การบริการข้อมูลทางยา' },
      { name: 'Compounding - Oral', category: 'Product', description: 'การเตรียมยาน้ำ/ยาผงเตรียมเฉพาะราย' },
      { name: 'Compounding - Topical', category: 'Product', description: 'การเตรียมยาทาผิวครีม/ขี้ผึ้งเฉพาะราย' },
      { name: 'Compounding - Sterile', category: 'Product', description: 'การเตรียมยาฉีดปราศจากเชื้อ/TPN' },
      { name: 'Labeling & Dispensing', category: 'Product', description: 'ทักษะจ่ายยาและอ่านใบสั่งยา' },
      { name: 'QA/QC', category: 'Product', description: 'การประเมินตรวจสอบมาตรฐานผลิตยา' },
      { name: 'Pharmacy Law', category: 'SAP', description: 'ข้อกฎหมายยาและจรรยาบรรณวิชาชีพ' },
      { name: 'Research Methodology', category: 'SAP', description: 'สถิติระบาดวิทยาและการวิเคราะห์ข้อมูลวิจัย' },
      { name: 'Health Economics', category: 'SAP', description: 'หลักประเมินทางเศรษฐศาสตร์สาธารณสุข' }
    ];
  }
  
  if (category && category !== 'All') {
    groups = groups.filter(g => g.category === category);
  }
  
  return groups;
}

function getSystemStats() {
  const listResult = getCaseList();
  const cases = listResult.cases;
  
  const stats = {
    total: cases.length,
    clinic: cases.filter(c => c.category === 'Clinic').length,
    product: cases.filter(c => c.category === 'Product').length,
    sap: cases.filter(c => c.category === 'SAP').length
  };
  
  return stats;
}

/**
 * ──────────────────────────────────────────────────────────────
 * 5. Exam Simulation Engine
 * ──────────────────────────────────────────────────────────────
 */
function generateExamSet(params = {}) {
  const total = parseInt(params.totalStations || 16);
  const clinicCount = parseInt(params.clinicCount || 8);
  const productCount = parseInt(params.productCount || 6);
  const sapCount = parseInt(params.sapCount || 2);
  
  const listResult = getCaseList();
  const cases = listResult.cases;
  
  const pool = {
    Clinic: shuffleArray(cases.filter(c => c.category === 'Clinic')),
    Product: shuffleArray(cases.filter(c => c.category === 'Product')),
    SAP: shuffleArray(cases.filter(c => c.category === 'SAP'))
  };
  
  const selected = [];
  const warnings = [];
  
  const selectFromPool = (cat, count) => {
    const p = pool[cat];
    let added = 0;
    for (let i = 0; i < count; i++) {
      if (p[i]) {
        selected.push(p[i]);
        added++;
      }
    }
    
    // หากเคสไม่พอให้ดึงวนลูป
    if (added < count && p.length > 0) {
      warnings.push(`เคสในหมวด ${cat} มีไม่เพียงพอต่อสัดส่วนที่ระบุ ได้ทำการวนซ้ำเคสเดิม`);
      let idx = 0;
      while (added < count) {
        selected.push(p[idx % p.length]);
        added++;
        idx++;
      }
    }
  };
  
  selectFromPool('Clinic', clinicCount);
  selectFromPool('Product', productCount);
  selectFromPool('SAP', sapCount);
  
  // สุ่มตำแหน่งสถานีใหม่ก่อนส่งกลับ
  const shuffledStations = shuffleArray(selected);
  
  const stations = shuffledStations.map((c, idx) => {
    return {
      stationNumber: idx + 1,
      caseId: c.caseId,
      title: c.title,
      category: c.category,
      mainGroup: c.mainGroup,
      docId: c.docId
    };
  });
  
  return {
    examId: 'EXAM_' + new Date().getTime(),
    stations: stations,
    warnings: warnings,
    config: {
      total: total,
      clinic: clinicCount,
      product: productCount,
      sap: sapCount
    }
  };
}

/**
 * ──────────────────────────────────────────────────────────────
 * 6. Setup Sheets (สร้างแท็บโครงสร้างชีทหลักตาม GEMINI.md)
 * ──────────────────────────────────────────────────────────────
 */
function setupSheets() {
  const ss = getSpreadsheet();
  const results = [];
  
  // 1. ตาราง CaseLibrary
  let sheetLib = ss.getSheetByName(CONFIG.sheets.caseLibrary);
  if (!sheetLib) {
    sheetLib = ss.insertSheet(CONFIG.sheets.caseLibrary);
    const headers = ['caseId', 'title', 'category', 'mainGroup', 'subTopic', 'disease', 'difficulty', 'docId', 'author', 'createdDate', 'isActive'];
    sheetLib.appendRow(headers);
    
    // ใส่ 3 เคสมาตรฐาน
    DEFAULT_CASES.forEach(c => {
      sheetLib.appendRow([c.caseId, c.title, c.category, c.mainGroup, c.subTopic || '', c.disease, c.difficulty, c.docId, c.author, c.createdDate, c.isActive]);
    });
    results.push('สร้างชีท CaseLibrary และเพิ่ม 3 เคสมาตรฐานเรียบร้อย');
  } else {
    results.push('ชีท CaseLibrary มีอยู่แล้ว');
  }
  
  // 2. ตาราง CourseGroups
  let sheetGroups = ss.getSheetByName(CONFIG.sheets.mainGroups);
  if (!sheetGroups) {
    sheetGroups = ss.insertSheet(CONFIG.sheets.mainGroups);
    sheetGroups.appendRow(['name', 'category', 'description']);
    
    // รายชื่อ 15 Course Groups
    const initialGroups = [
      ['Pharmacy Counseling', 'Clinic', 'การให้คำแนะนำความทั่วไป'],
      ['Anticoagulation', 'Clinic', 'การจัดการและประเมินระบบยาละลายลิ่มเลือด'],
      ['Diabetes Mellitus', 'Clinic', 'การประเมินและการแนะนำยาเบาหวานและเข็มอินซูลิน'],
      ['Asthma & COPD', 'Clinic', 'การให้คำแนะนำอุปกรณ์พ่นยาโรคหืดและปอดอุดกั้นเรื้อรัง'],
      ['Hypertension', 'Clinic', 'โรคความดันโลหิตสูงและการเลือกใช้ยาลดความดัน'],
      ['Dyslipidemia', 'Clinic', 'โรคไขมันในเลือดสูงและการติดตามความปลอดภัย'],
      ['Drug Information', 'Clinic', 'การบริการสารสนเทศทางยาและการประเมินวรรณกรรม'],
      ['Compounding - Oral', 'Product', 'การเตรียมยาน้ำ ยาผง หรือรูปแบบยาพร้อมกินเฉพาะราย'],
      ['Compounding - Topical', 'Product', 'การเตรียมยาครีม ขี้ผึ้ง หรือยาทาภายนอกเฉพาะราย'],
      ['Compounding - Sterile', 'Product', 'การคำนวณและเตรียมยาฉีดปราศจากเชื้อและ TPN'],
      ['Labeling & Dispensing', 'Product', 'ทักษะการตรวจสอบใบสั่งยา เขียนฉลาก และจ่ายยา'],
      ['QA/QC', 'Product', 'การประเมินและควบคุมคุณภาพยาระหว่างกระบวนการผลิต'],
      ['Pharmacy Law', 'SAP', 'ความรู้เกี่ยวกับ พ.ร.บ. ยา ยาเสพติด วัตถุออกฤทธิ์ และจรรยาบรรณ'],
      ['Research Methodology', 'SAP', 'การวิจัยทางเภสัชศาสตร์ สถิติ และระบาดวิทยาการแปลผลข้อมูล'],
      ['Health Economics', 'SAP', 'หลักการเศรษฐศาสตร์สาธารณสุขและนโยบายยาแห่งชาติ']
    ];
    
    initialGroups.forEach(g => sheetGroups.appendRow(g));
    results.push('สร้างชีท CourseGroups และลงทะเบียน 15 กลุ่มวิชาเรียบร้อย');
  } else {
    results.push('ชีท CourseGroups มีอยู่แล้ว');
  }
  
  // 3. ตาราง LobbyRooms
  let sheetLobby = ss.getSheetByName(CONFIG.sheets.lobbyRooms);
  if (!sheetLobby) {
    sheetLobby = ss.insertSheet(CONFIG.sheets.lobbyRooms);
    sheetLobby.appendRow(['roomId', 'caseId', 'hostRole', 'examineeName', 'examinerName', 'timerValue', 'timerRunning', 'checklistProgress', 'status', 'lastUpdated', 'examSet']);
    results.push('สร้างชีท LobbyRooms และลงทะเบียนเรียบร้อย');
  } else {
    results.push('ชีท LobbyRooms มีอยู่แล้ว');
  }
  
  // จัด Format แบนเนอร์กลับสู่หน้าแรก (ตามเกณฑ์ข้อกำหนด GEMINI.md ข้อ 3.5)
  decorateHomeBanners(ss);
  
  return {
    message: 'Setup Sheets Completed Successfully!',
    details: results
  };
}

/**
 * ──────────────────────────────────────────────────────────────
 * 7. Setup Sample Docs (บิลด์โครงสร้างลง Google Docs เปล่าทั้ง 3 ตัว)
 * ──────────────────────────────────────────────────────────────
 */
function updateDocsWithSampleContent() {
  const docIds = {
    Clinic: '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g',
    Product: '1vgahUG5RDdSfTN4b97W2dB0aDTjEAnCOruH-S1lvWrw',
    SAP: '1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg'
  };
  
  const results = [];
  
  // 1. เคส Clinic (Warfarin Counseling)
  try {
    const doc = DocumentApp.openById(docIds.Clinic);
    const body = doc.getBody();
    body.clear();
    
    body.appendParagraph('[OSPE-CL001] Warfarin Counseling — AF ใหม่').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- หมวด: Clinic');
    body.appendParagraph('- OSPE Main Group: การบริบาลทางเภสัชกรรม (Pharmaceutical Care)');
    body.appendParagraph('- Station/Sub-topic: Anticoagulation Counseling');
    body.appendParagraph('- Course Group: Anticoagulation');
    body.appendParagraph('- โรค/หัวข้อ: Atrial Fibrillation, Warfarin');
    body.appendParagraph('- ระดับ: 3');
    body.appendParagraph('- ผู้เขียน: Lin');
    body.appendParagraph('- วันที่: 15/06/2026');
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('ผู้ป่วยชายไทยอายุ 65 ปี ได้รับการวินิจฉัยว่าเป็น Non-valvular Atrial Fibrillation และได้รับยา Warfarin 3 mg วันละ 1 ครั้ง เป็นครั้งแรก ให้ท่านทำการประเมินความปลอดภัย ให้คำปรึกษาและแนะนำการปฏิบัติตัวเกี่ยวกับการใช้ยา Warfarin แก่ผู้ป่วยอย่างครบถ้วน (เวลาปฏิบัติการ 4 นาที)');
    
    body.appendParagraph('ข้อมูลผู้ป่วย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const tableData = [
      ['หัวข้อ', 'ข้อมูล'],
      ['ชื่อ-สกุล', 'นายสมนึก รักดี'],
      ['อายุ', '65 ปี'],
      ['โรคประจำตัว', 'Non-valvular Atrial Fibrillation, Hypertension'],
      ['ใบสั่งยา', 'Warfarin 3 mg tab 1 tablet PO QD (at 18:00)'],
      ['ประวัติแพ้ยา', 'NKDA']
    ];
    body.appendTable(tableData);
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('## (กลุ่ม: การซักประวัติและการประเมินความปลอดภัย)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (2) ซักประวัติการแพ้ยา ประวัติโรคประจำตัว และการใช้ยาร่วม (โดยเฉพาะสมุนไพร/อาหารเสริม)');
    body.appendListItem('☐ (1) แจ้งเป้าหมายการรักษาและการออกฤทธิ์ของยา Warfarin (เพื่อป้องกันภาวะลิ่มเลือดอุดตันและหลอดเลือดสมอง)');
    body.appendListItem('☐ (2) อธิบายวิธีรับประทานยาอย่างถูกต้อง (ทานเวลาเดียวกันทุกวัน โดยปกติแนะนำตอนเย็น 18:00 น. ก่อนหรือหลังอาหารก็ได้)');
    body.appendListItem('☐ (1) แนะนำการปฏิบัติเมื่อลืมกินยา (หากไม่เกิน 12 ชั่วโมงให้ทานทันที หากเกิน 12 ชั่วโมงให้ข้ามไปทานมื้อถัดไป ห้ามเพิ่มขนาดยาเป็น 2 เท่า)');
    
    body.appendParagraph('## (กลุ่ม: การจัดการความเสี่ยงและคำแนะนำเพิ่ม)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (2) แนะนำอาการข้างเคียงรุนแรงที่ต้องพบแพทย์ทันที (เลือดออกผิดปกติ เช่น จุดจ้ำเลือดตามตัว ปัสสาวะ/อุจจาระมีสีเข้มหรือมีเลือดปน เลือดกำเดาไหลไม่หยุด)');
    body.appendListItem('☐ (2) แนะนำเรื่องอาหารที่มีวิตามินเคสูง (ผักใบเขียว เช่น ผักคะน้า ผักโขม) ว่าให้รับประทานในปริมาณที่สม่ำเสมอทุกวัน ไม่ลดหรือเพิ่มปริมาณอย่างเฉียบพลัน');
    body.appendListItem('☐ (1) แนะนำการหลีกเลี่ยงพฤติกรรมเสี่ยงที่ทำให้เกิดบาดแผลและเลือดออก เช่น การใช้แปรงสีฟันขนอ่อนนุ่ม ใช้เครื่องโกนหนวดไฟฟ้า');
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- Warfarin มีความเสี่ยงต่อปฏิกิริยาระหว่างยา (Drug Interactions) สูงมาก เช่น ยา NSAIDs, ยาฆ่าเชื้อฆ่าราบางกลุ่ม หรืออาหารเสริมจำพวก แปะก๊วย โสม น้ำมันปลา');
    body.appendParagraph('- ต้องประเมินค่า INR อย่างสม่ำเสมอตามแพทย์นัด (Target INR มักอยู่ที่ 2.0 - 3.0 สำหรับ Non-valvular AF)');
    body.appendParagraph('- เน้นย้ำการพกบัตรผู้ใช้ยา Warfarin ติดตัวไว้เสมอ');
    
    // ── เพิ่มเคส CL002 ต่อท้ายใน Doc เดิม ──
    body.appendHorizontalRule();
    body.appendParagraph('[OSPE-CL002] Warfarin Counseling — AF เปลี่ยนมาจาก NOAC').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- หมวด: Clinic');
    body.appendParagraph('- OSPE Main Group: การบริบาลทางเภสัชกรรม (Pharmaceutical Care)');
    body.appendParagraph('- Station/Sub-topic: Anticoagulation Counseling — Drug Switching');
    body.appendParagraph('- Course Group: Anticoagulation');
    body.appendParagraph('- โรค/หัวข้อ: Atrial Fibrillation, Warfarin, Drug Switching');
    body.appendParagraph('- ระดับ: 4');
    body.appendParagraph('- ผู้เขียน: Lin');
    body.appendParagraph('- วันที่: 15/06/2026');
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('ผู้ป่วยหญิงไทย อายุ 72 ปี มีโรคประจำตัว Non-valvular Atrial Fibrillation และ CKD Stage 3 เคยได้รับ Dabigatran 110 mg วันละ 2 ครั้ง มา 2 ปี แต่ขณะนี้แพทย์ตัดสินใจเปลี่ยนยาต้านการแข็งตัวของเลือดมาเป็น Warfarin เนื่องจากค่า eGFR ลดลงต่อเนื่อง ให้ท่านทำการให้คำปรึกษาผู้ป่วยเรื่องการเปลี่ยนยา ความแตกต่างระหว่างยา 2 ชนิด และข้อควรปฏิบัติสำหรับยา Warfarin ที่เริ่มใช้ใหม่ (เวลาปฏิบัติการ 4 นาที)');
    
    body.appendParagraph('ข้อมูลผู้ป่วย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const tableData2 = [
      ['หัวข้อ', 'ข้อมูล'],
      ['ชื่อ-สกุล', 'นางสุดา มานะชัย'],
      ['อายุ', '72 ปี'],
      ['โรคประจำตัว', 'Non-valvular AF, CKD Stage 3, Hypertension, DM Type 2'],
      ['ค่าไต (eGFR)', '28 mL/min/1.73m² (ล่าสุด)'],
      ['ยาเดิม', 'Dabigatran 110mg PO BID (ใช้มา 2 ปี)'],
      ['ยาใหม่', 'Warfarin 2 mg tab 1 tablet PO QD (at 18:00) — เริ่มวันนี้'],
      ['ยาร่วมอื่น', 'Amlodipine 5mg OD, Metformin 500mg BD, Furosemide 20mg OD'],
      ['ประวัติแพ้ยา', 'NKDA']
    ];
    body.appendTable(tableData2);
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('## (กลุ่ม: การซักประวัติและประเมินความเข้าใจเดิม)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (1) ซักประวัติการใช้ยา Dabigatran และประเมินความสม่ำเสมอในการรับประทานยา');
    body.appendListItem('☐ (2) อธิบายเหตุผลที่ต้องเปลี่ยนยา (ไตเสื่อมลง eGFR < 30 ทำให้ Dabigatran สะสมในร่างกาย เสี่ยงเลือดออกรุนแรง)');
    body.appendListItem('☐ (1) อธิบายความแตกต่างระหว่าง Dabigatran (ขนาดยาคงที่) กับ Warfarin (ต้องติดตาม INR อย่างสม่ำเสมอ)');
    
    body.appendParagraph('## (กลุ่ม: การให้คำแนะนำ Warfarin)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (2) อธิบายวิธีรับประทานยา Warfarin 2mg วันละครั้ง เวลาเดียวกันทุกวัน');
    body.appendListItem('☐ (2) เน้นความสำคัญของการตรวจ INR อย่างสม่ำเสมอ บอกเป้าหมาย Target INR = 2.0-3.0');
    body.appendListItem('☐ (2) แนะนำอาการผิดปกติที่ต้องรีบพบแพทย์ทันที (เลือดออกผิดปกติ, ฉี่มีเลือดปน, อุจจาระดำ)');
    body.appendListItem('☐ (1) แนะนำเรื่องอาหารวิตามินเค (ผักใบเขียว) ให้กินสม่ำเสมอ ไม่เพิ่ม-ลดกระทันหัน');
    body.appendListItem('☐ (1) เน้นห้ามซื้อยาแก้ปวด NSAIDs/Aspirin เองเพราะเพิ่มความเสี่ยงเลือดออก');
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- ข้อบ่งชี้การเปลี่ยนยา: Dabigatran ห้ามใช้เมื่อ CrCl < 30 mL/min เพราะยาถูกขับออกทางไตกว่า 80% หากไตเสื่อม ยาสะสมและเพิ่มความเสี่ยงเลือดออกรุนแรง');
    body.appendParagraph('- การเปลี่ยนยา (Switching): หยุด Dabigatran ตอนเย็น เริ่ม Warfarin วันรุ่งขึ้น และต้องตรวจ INR ซ้ำภายใน 5-7 วัน');
    body.appendParagraph('- Drug interactions สำคัญ: Furosemide + Warfarin อาจเพิ่มฤทธิ์ Warfarin เล็กน้อย ต้องติดตาม INR อย่างใกล้ชิดในช่วงแรก');
    body.appendParagraph('- Metformin ไม่ควรใช้เมื่อ eGFR < 30 ให้แนะนำผู้ป่วยนำใบปรึกษาแพทย์ไปพิจารณาปรับยา DM ด้วย');
    
    results.push('เขียนข้อมูลเคส Clinic (CL001 + CL002) เรียบร้อย');
  } catch (e) {
    results.push('บิลด์เคส Clinic ล้มเหลว: ' + e.toString());
  }

  // 2. เคส Product
  try {
    const doc = DocumentApp.openById(docIds.Product);
    const body = doc.getBody();
    body.clear();
    
    body.appendParagraph('[OSPE-PD001] Compounding — Cold Cream & Labeling').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- หมวด: Product');
    body.appendParagraph('- OSPE Main Group: การเตรียมยาเฉพาะราย (Compounding)');
    body.appendParagraph('- Station/Sub-topic: Cold Cream Preparation & Labeling');
    body.appendParagraph('- Course Group: Compounding - Topical');
    body.appendParagraph('- โรค/หัวข้อ: Dry Skin, Cold Cream');
    body.appendParagraph('- ระดับ: 2');
    body.appendParagraph('- ผู้เขียน: Fon');
    body.appendParagraph('- วันที่: 15/06/2026');
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('ท่านได้รับใบสั่งยาจากแพทย์ให้เตรียมตำรับ Cold Cream ปริมาณ 30 กรัม สำหรับผู้ป่วยเด็กโรคผิวหนังแห้ง (Atopic Dermatitis) โดยให้คำนวณสูตรตำรับ ชั่งตวงสารผสมเนื้อครีม และเขียนฉลากยาควบคุมพิเศษให้ครบถ้วนถูกต้องตามหลักวิชาชีพเภสัชกรรม (เวลาปฏิบัติการ 4 นาที)');
    
    body.appendParagraph('ข้อมูลผู้ป่วย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const tableData = [
      ['หัวข้อ', 'ข้อมูล'],
      ['ชื่อ-สกุล', 'เด็กชายปัญญา ดีเลิศ'],
      ['อายุ', '5 ปี'],
      ['โรคประจำตัว', 'Atopic Dermatitis (ผิวหนังอักเสบภูมิแพ้)'],
      ['ใบสั่งยา', 'Cold Cream 30 g apply to dry areas BID'],
      ['ประวัติแพ้ยา', 'NKDA (ไม่มีประวัติแพ้ยา)']
    ];
    body.appendTable(tableData);
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('## (กลุ่ม: การคำนวณและตั้งตำรับ)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (2) คำนวณปริมาณสารสำคัญในสูตร Cold Cream 30 กรัม ได้ถูกต้อง (Mineral oil 15g, Beeswax 3.6g, Borax 0.24g, Water 7.56g)');
    body.appendListItem('☐ (1) ชั่งน้ำหนักบีกเกอร์และสารเคมีแต่ละชนิดด้วยเครื่องชั่ง 2 ตำแหน่งอย่างถูกต้อง');
    body.appendListItem('☐ (2) อธิบายขั้นตอนการผสมเฟสน้ำ (Aqueous phase) และเฟสน้ำมัน (Oily phase) ที่อุณหภูมิ 70 องศาเซลเซียส');
    body.appendListItem('☐ (1) คนผสมให้เข้ากันจนได้เนื้อครีมขาวเนียนสม่ำเสมอ');
    
    body.appendParagraph('## (กลุ่ม: การเขียนฉลากและจ่ายยา)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (2) เขียนฉลากยาได้ถูกต้องครบถ้วน (ชื่อผู้ป่วย, วิธีใช้: ทาบริเวณผิวแห้งวันละ 2 ครั้ง, วันผลิต, วันหมดอายุ 14 วัน)');
    body.appendListItem('☐ (1) ติดฉลากแดง "ยาใช้ภายนอก ห้ามรับประทาน"');
    body.appendListItem('☐ (1) ส่งมอบยาพร้อมให้คำแนะนำการเก็บรักษายาที่อุณหภูมิห้อง หลีกเลี่ยงแสงแดด');
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- สูตรมาตรฐาน Cold Cream (100g): Mineral oil 50g, Beeswax 12g, Spermaceti 12g, Sodium borate (Borax) 0.8g, Purified water 25.2g.');
    body.appendParagraph('- สำหรับ 30g: Mineral oil 15g, Beeswax 3.6g, Spermaceti 3.6g (หรือใช้วัตถุดิบอื่นทดแทน), Borax 0.24g, Water 7.56g.');
    body.appendParagraph('- การเก็บรักษา: ห้ามแช่แข็ง เก็บในภาชนะปิดสนิทป้องกันแสงแดดและความร้อนเพื่อป้องกันการแยกเฟส');
    
    results.push('เขียนข้อมูลเคส Product เรียบร้อย');
  } catch (e) {
    results.push('บิลด์เคส Product ล้มเหลว: ' + e.toString());
  }
  
  // 3. เคส SAP
  try {
    const doc = DocumentApp.openById(docIds.SAP);
    const body = doc.getBody();
    body.clear();
    
    body.appendParagraph('[OSPE-SP001] Pharmacy Law — ยาควบคุมพิเศษ').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- หมวด: SAP');
    body.appendParagraph('- OSPE Main Group: ความรู้เกี่ยวกับกฎหมายยา');
    body.appendParagraph('- Station/Sub-topic: Prescription Validation & Special Controlled Drugs');
    body.appendParagraph('- Course Group: Pharmacy Law');
    body.appendParagraph('- โรค/หัวข้อ: Special Controlled Drugs Regulation');
    body.appendParagraph('- ระดับ: 2');
    body.appendParagraph('- ผู้เขียน: Irene');
    body.appendParagraph('- วันที่: 15/06/2026');
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('ผู้ป่วยนำใบสั่งยาจากคลินิกเอกชนมาขอซื้อยา Lorazepam 2 mg ในร้านยาของท่าน ให้ท่านทำการตรวจสอบความถูกต้องทางกฎหมายของใบสั่งยา วิเคราะห์ประเภทของยาทางกฎหมาย และปฏิบัติตนตามข้อกำหนดของสำนักงานคณะกรรมการอาหารและยา (อย.) อย่างถูกต้อง (เวลาปฏิบัติการ 4 นาที)');
    
    body.appendParagraph('ข้อมูลผู้ป่วย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const tableData = [
      ['หัวข้อ', 'ข้อมูล'],
      ['ชื่อ-สกุล', 'นางสาวสมศรี มีสุข'],
      ['อายุ', '45 ปี'],
      ['โรคประจำตัว', 'Insomnia (นอนไม่หลับ)'],
      ['ใบสั่งยา', 'Lorazepam 2 mg (15 tablets) Take 1 tablet before bedtime'],
      ['ประวัติแพ้ยา', 'NKDA (ไม่มีประวัติแพ้ยา)']
    ];
    body.appendTable(tableData);
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('## (กลุ่ม: ความรู้กฎหมายและการควบคุม)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (2) ระบุประเภททางกฎหมายของ Lorazepam ได้ถูกต้องว่าเป็น "วัตถุออกฤทธิ์ต่อจิตและประสาทประเภท 4"');
    body.appendListItem('☐ (2) ตรวจสอบใบสั่งยาและแจ้งผู้ป่วยว่า "ร้านขายยาแผนปัจจุบัน (ข.ย.1) ไม่สามารถจ่ายวัตถุออกฤทธิ์ประเภท 4 ตามใบสั่งยาแพทย์จากคลินิกได้"');
    body.appendListItem('☐ (2) แนะนำให้ผู้ป่วยไปรับยาที่โรงพยาบาลหรือสถานพยาบาลที่ได้รับอนุญาตครอบครองวัตถุออกฤทธิ์โดยตรง');
    body.appendListItem('☐ (1) อธิบายข้อกฎหมายที่ห้ามร้านขายยาทั่วไปจำหน่ายวัตถุออกฤทธิ์ประเภท 2 และ 4');
    
    body.appendParagraph('## (กลุ่ม: ทักษะจรรยาบรรณวิชาชีพ)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendListItem('☐ (2) ปฏิเสธการขายยาอย่างสุภาพและแสดงความใส่ใจต่ออาการนอนไม่หลับของผู้ป่วย');
    body.appendListItem('☐ (1) บันทึกข้อมูลการให้คำแนะนำทางกฎหมายลงในแบบฟอร์มบันทึกการให้คำปรึกษาของร้านยา');
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('- วัตถุออกฤทธิ์ต่อจิตและประสาทประเภท 4 (เช่น Diazepam, Lorazepam, Alprazolam) ห้ามจำหน่ายในร้านขายยาทั่วไป ยกเว้นการจ่ายในสถานพยาบาลของรัฐหรือเอกชนที่มีใบอนุญาตเฉพาะ');
    body.appendParagraph('- การฝ่าฝืนขายวัตถุออกฤทธิ์ประเภท 4 ในร้านยามีโทษจำคุกและปรับตาม พ.ร.บ. วัตถุที่ออกฤทธิ์ต่อจิตและประสาท');
    body.appendParagraph('- ให้คำแนะนำผู้ป่วยเสริมด้านสุขวิทยาการนอน (Sleep Hygiene) เช่น หลีกเลี่ยงคาเฟอีนก่อนนอน งดเล่นมือถือ และเข้านอนเป็นเวลา');
    
    results.push('เขียนข้อมูลเคส SAP เรียบร้อย');
  } catch (e) {
    results.push('บิลด์เคส SAP ล้มเหลว: ' + e.toString());
  }
  
  return {
    message: 'Google Docs Population Run Completed!',
    details: results
  };
}

/**
 * ──────────────────────────────────────────────────────────────
 * 8. Google Form Automatic Case Registration Trigger (onFormSubmit)
 * ──────────────────────────────────────────────────────────────
 */
function onFormSubmit(e) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.sheets.caseLibrary);
    if (!sheet) return;
    
    // ดึงค่าคำตอบล่าสุด
    const responseRange = e.range;
    const responseValues = responseRange.getValues()[0];
    const sheetHeaders = responseRange.getSheet().getDataRange().getValues()[0];
    
    const data = {};
    sheetHeaders.forEach((hdr, idx) => {
      data[hdr.trim()] = responseValues[idx];
    });
    
    // แมปข้อมูลคำถามของฟอร์ม (ปรับเปลี่ยนชื่อหัวข้อคำถามให้ตรงกับฟอร์มจริงของคุณ)
    const title = data['ชื่อเคส'] || data['Title'] || 'เคสสอบใหม่';
    const category = data['หมวดวิชา'] || data['Category'] || 'Clinic';
    const mainGroup = data['กลุ่มวิชา'] || data['Course Group'] || 'ทั่วไป';
    const disease = data['โรค/ยา/หัวข้อหลัก'] || data['Disease'] || '';
    const scenario = data['โจทย์/สถานการณ์'] || data['Scenario'] || '';
    const checklistRaw = data['รายการ Checklist'] || data['Checklist'] || '';
    const note = data['เฉลย/หมายเหตุสำหรับผู้ตรวจ'] || data['Notes'] || '';
    const imageUrls = data['แนบรูปภาพภาพประกอบเคส (ถ้ามี)'] || data['Images'] || '';
    
    // 1. สร้างรหัสเคสอัตโนมัติ (OSPE-CLxxx)
    const categoryCode = category === 'Clinic' ? 'CL' : (category === 'Product' ? 'PD' : 'SP');
    const existingRows = sheet.getDataRange().getValues();
    let seq = 1;
    existingRows.forEach(row => {
      if (row[0] && String(row[0]).startsWith('OSPE-' + categoryCode)) {
        seq++;
      }
    });
    const caseId = `OSPE-${categoryCode}${String(seq).padStart(3, '0')}`;
    
    // 2. สร้างไฟล์ Google Doc ใหม่
    const newDoc = DocumentApp.create(caseId + ' ' + title);
    const docId = newDoc.getId();
    const body = newDoc.getBody();
    
    body.appendParagraph(`[${caseId}] ${title}`).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(`- หมวด: ${category}`);
    body.appendParagraph(`- Course Group: ${mainGroup}`);
    body.appendParagraph(`- โรค/หัวข้อ: ${disease}`);
    body.appendParagraph(`- ผู้เขียน: สตาฟเตรียมสอบ`);
    body.appendParagraph(`- วันที่: ${new Date().toLocaleDateString('th-TH')}`);
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(scenario);
    
    // แทรกรูปภาพจากลิงก์ที่อัปโหลดผ่าน Form (หากมี)
    if (imageUrls) {
      const urls = imageUrls.split(',').map(u => u.trim());
      urls.forEach(url => {
        try {
          // สกัดเอา ID ของไฟล์รูปภาพใน Drive จาก URL
          const fileIdMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/);
          if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            const imgBlob = DriveApp.getFileById(fileId).getBlob();
            body.appendParagraph('รูปภาพประกอบข้อสอบ:').setHeading(DocumentApp.ParagraphHeading.HEADING3);
            body.appendImage(imgBlob);
          }
        } catch (imgError) {
          Logger.log('ไม่สามารถดาวน์โหลดหรือแทรกภาพได้: ' + imgError.toString());
        }
      });
    }
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('## (กลุ่ม: การประเมินผล)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const checklistLines = checklistRaw.split('\n');
    checklistLines.forEach(line => {
      if (line.trim()) {
        const cleanLine = line.trim().startsWith('☐') || line.trim().startsWith('-') ? line.trim() : '☐ ' + line.trim();
        body.appendListItem(cleanLine);
      }
    });
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(note);
    
    newDoc.saveAndClose();
    
    // 3. แนบข้อมูลเข้าไปในชีท CaseLibrary
    sheet.appendRow([
      caseId,
      title,
      category,
      mainGroup,
      disease,
      2, // ระดับกลางดีฟอลต์
      docId,
      'Google Form',
      new Date().toLocaleDateString('th-TH'),
      'TRUE'
    ]);
    
    Logger.log(`จดทะเบียนเคสใหม่สำเร็จ: ${caseId}`);
  } catch (error) {
    Logger.log('เกิดข้อผิดพลาดในการรับข้อมูลฟอร์ม: ' + error.toString());
  }
}

/**
 * ──────────────────────────────────────────────────────────────
 * 9. ตกแต่งปุ่มกลับหน้าแรกย่อย ตามกฎ GEMINI.md
 * ──────────────────────────────────────────────────────────────
 */
function decorateHomeBanners(ss) {
  const sheets = ss.getSheets();
  let homeSheet = ss.getSheetByName('Home Page');
  if (!homeSheet && sheets.length > 0) {
    homeSheet = sheets[0];
  }
  
  if (!homeSheet) return;
  const homeGid = homeSheet.getSheetId();
  
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name === 'Home Page') return; // ข้ามหน้าแรก
    
    // ตรวจสอบว่ามีแถบแบนเนอร์แล้วหรือยัง
    const firstVal = sheet.getRange(1, 1).getValue();
    if (String(firstVal).includes('กลับสู่หน้าแรก')) return; // มีแล้ว
    
    // แทรก 1 แถวข้างบนสุด
    sheet.insertRowsBefore(1, 1);
    sheet.setRowHeight(1, 35);
    
    // ผสานเซลล์ A1:F1
    const range = sheet.getRange('A1:F1');
    range.merge();
    
    // ใส่สูตรลิงก์
    const cell = sheet.getRange('A1');
    cell.setFormula(`=HYPERLINK("#gid=${homeGid}", "🏠 กลับสู่หน้าแรก (Go to Home Page)")`);
    
    // ตกแต่ง (Aesthetics - Bai Jamjuree, 10pt หนา, พื้นฟ้าอ่อน, จัดตรงกลาง)
    range.setBackground('#E3F2FD')
         .setFontFamily('Bai Jamjuree')
         .setFontSize(10)
         .setFontWeight('bold')
         .setHorizontalAlignment('center')
         .setVerticalAlignment('middle');
  });
}

/**
 * ──────────────────────────────────────────────────────────────
 * 10. Helpers & แฮชทดแทน CryptoJS
 * ──────────────────────────────────────────────────────────────
 */
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // แปลงเป็น 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * ──────────────────────────────────────────────────────────────
 * 11. Multiplayer Lobby Room Functions
 * ──────────────────────────────────────────────────────────────
 */
function createRoom(params) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.sheets.lobbyRooms);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheets.lobbyRooms);
    sheet.appendRow(['roomId', 'caseId', 'hostRole', 'examineeName', 'examinerName', 'timerValue', 'timerRunning', 'checklistProgress', 'status', 'lastUpdated', 'examSet']);
  }
  
  const roomId = params.roomId || String(Math.floor(1000 + Math.random() * 9000));
  const caseId = params.caseId || '';
  const hostRole = params.hostRole || 'examiner';
  const playerName = params.playerName || 'Host';
  const examSet = params.examSet || '';
  
  const examineeName = hostRole === 'examinee' ? playerName : '';
  const examinerName = hostRole === 'examiner' ? playerName : '';
  const timestamp = new Date().toISOString();
  
  const data = sheet.getDataRange().getValues();
  let foundRowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(roomId)) {
      foundRowIdx = i + 1;
      break;
    }
  }
  
  if (foundRowIdx > -1) {
    sheet.getRange(foundRowIdx, 2, 1, 10).setValues([[caseId, hostRole, examineeName, examinerName, 240, 'FALSE', '', 'setup', timestamp, examSet]]);
  } else {
    sheet.appendRow([roomId, caseId, hostRole, examineeName, examinerName, 240, 'FALSE', '', 'setup', timestamp, examSet]);
  }
  
  return { roomId: roomId, status: 'created', role: hostRole };
}

function joinRoom(params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheets.lobbyRooms);
  if (!sheet) throw new Error('LobbyRooms sheet not initialized');
  
  const roomId = params.roomId;
  const role = params.role; 
  const playerName = params.playerName || 'Player';
  
  const data = sheet.getDataRange().getValues();
  let foundRowIdx = -1;
  let roomData = null;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(roomId)) {
      foundRowIdx = i + 1;
      roomData = data[i];
      break;
    }
  }
  
  if (foundRowIdx === -1) {
    throw new Error('Room not found: ' + roomId);
  }
  
  let caseId = roomData[1];
  let hostRole = roomData[2];
  let examineeName = roomData[3];
  let examinerName = roomData[4];
  
  if (role === 'examinee') {
    examineeName = playerName;
  } else {
    examinerName = playerName;
  }
  
  const timestamp = new Date().toISOString();
  sheet.getRange(foundRowIdx, 4, 1, 2).setValues([[examineeName, examinerName]]);
  sheet.getRange(foundRowIdx, 10).setValue(timestamp);
  
  return { roomId: roomId, status: 'joined', caseId: caseId };
}

function getRoomStatus(roomId) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheets.lobbyRooms);
  if (!sheet) return { error: 'Lobby sheet not found' };
  
  const data = sheet.getDataRange().getValues();
  let room = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(roomId)) {
      room = {
        roomId: String(data[i][0]),
        caseId: data[i][1],
        hostRole: data[i][2],
        examineeName: data[i][3],
        examinerName: data[i][4],
        timerValue: parseInt(data[i][5]) || 0,
        timerRunning: String(data[i][6]) === 'TRUE',
        checklistProgress: data[i][7] ? String(data[i][7]).split(',') : [],
        status: data[i][8],
        lastUpdated: data[i][9],
        examSet: data[i][10] || ''
      };
      break;
    }
  }
  
  if (!room) {
    return { success: false, error: 'Room not found' };
  }
  
  if (room.caseId) {
    try {
      const caseDetail = getCase(room.caseId);
      room.caseDetail = caseDetail;
    } catch (e) {
      room.caseDetail = null;
    }
  }
  
  return room;
}

function getOpenRooms() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheets.lobbyRooms);
  if (!sheet) return { rooms: [] };
  
  const data = sheet.getDataRange().getValues();
  const rooms = [];
  const now = new Date().getTime();
  
  for (let i = 1; i < data.length; i++) {
    const status = data[i][8];
    const lastUpdated = new Date(data[i][9]).getTime();
    
    // Only show rooms in 'setup' status and updated within last 5 minutes (300,000 ms)
    if (status === 'setup' && (now - lastUpdated) < 300000) {
      rooms.push({
        roomId: String(data[i][0]),
        hostRole: data[i][2],
        examineeName: data[i][3],
        examinerName: data[i][4],
        examSet: data[i][10] || ''
      });
    }
  }
  return { rooms: rooms };
}

function updateRoomStatus(roomId, params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheets.lobbyRooms);
  if (!sheet) throw new Error('Lobby sheet not found');
  
  const data = sheet.getDataRange().getValues();
  let foundRowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(roomId)) {
      foundRowIdx = i + 1;
      break;
    }
  }
  
  if (foundRowIdx === -1) {
    throw new Error('Room not found');
  }
  
  const timestamp = new Date().toISOString();
  
  if (params.caseId !== undefined) {
    sheet.getRange(foundRowIdx, 2).setValue(params.caseId);
  }
  if (params.timerValue !== undefined) {
    sheet.getRange(foundRowIdx, 6).setValue(params.timerValue);
  }
  if (params.timerRunning !== undefined) {
    sheet.getRange(foundRowIdx, 7).setValue(params.timerRunning.toUpperCase());
  }
  if (params.checklistProgress !== undefined) {
    sheet.getRange(foundRowIdx, 8).setValue(params.checklistProgress);
  }
  if (params.status !== undefined) {
    sheet.getRange(foundRowIdx, 9).setValue(params.status);
  }
  
  sheet.getRange(foundRowIdx, 10).setValue(timestamp);
  
  return { success: true };
}

/**
 * ──────────────────────────────────────────────────────────────
 * 12. Google Sheets UI Custom Menu Triggers
 * ──────────────────────────────────────────────────────────────
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🥼 RxCU OSPE System')
        .addItem('🔄 Sync Case Library from Docs (ดึงเคสจาก Docs เข้าคลัง)', 'menuSyncCaseLibrary')
        .addToUi();
  } catch (e) {
    Logger.log('Cannot build UI in non-spreadsheet context: ' + e.toString());
  }
}

function menuSyncCaseLibrary() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('🔒 การยืนยันตัวตน (Authentication)', 'กรุณากรอกรหัสผ่าน (Admin Passcode) เพื่อเข้าซิงค์เคสเข้าระบบ:', ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() == ui.Button.OK) {
    const password = response.getResponseText().trim();
    if (password === CONFIG.adminPasscode) {
      const res = syncCaseLibraryFromDocs();
      ui.alert('สำเร็จ!\n' + res.message + '\n\nรายละเอียด:\n' + res.details.join('\n'));
    } else {
      ui.alert('❌ รหัสผ่านไม่ถูกต้อง! คุณไม่ได้รับสิทธิ์ในการเปลี่ยนแปลงข้อมูลคลังเคส');
    }
  }
}

/**
 * ──────────────────────────────────────────────────────────────
 * 13. Sync Case Library from Google Docs (ดึงสแกนเคสจาก Docs ทั้ง 3 ตัว)
 * ──────────────────────────────────────────────────────────────
 */
function syncCaseLibraryFromDocs() {
  const ss = getSpreadsheet();
  let sheetLib = ss.getSheetByName(CONFIG.sheets.caseLibrary);
  if (!sheetLib) {
    sheetLib = ss.insertSheet(CONFIG.sheets.caseLibrary);
    const headers = ['caseId', 'title', 'category', 'mainGroup', 'subTopic', 'disease', 'difficulty', 'docId', 'author', 'createdDate', 'isActive', 'linkedNextCase', 'linkedFromCase'];
    sheetLib.appendRow(headers);
  }
  
  // โหลดรายการเดิมที่มีอยู่ใน Sheet
  const existingCasesMap = {};
  const data = sheetLib.getDataRange().getValues();
  const headers = ['caseId', 'title', 'category', 'mainGroup', 'subTopic', 'disease', 'difficulty', 'docId', 'author', 'createdDate', 'isActive', 'linkedNextCase', 'linkedFromCase'];
  const rows = data.length > 2 ? data.slice(2) : []; // อ่านข้อมูลจากแถว 3 เป็นต้นไป
  rows.forEach(row => {
    const caseId = row[0];
    if (caseId) {
      const item = {};
      headers.forEach((h, idx) => {
        item[h] = row[idx];
      });
      existingCasesMap[caseId] = item;
    }
  });
  
  // รายการเอกสารต้นทางและหมวดค่าเริ่มต้น
  const sourceDocs = [
    { docId: '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g', defaultCat: 'Clinic' },
    { docId: '1vgahUG5RDdSfTN4b97W2dB0aDTjEAnCOruH-S1lvWrw', defaultCat: 'Product' },
    { docId: '1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg', defaultCat: 'SAP' }
  ];
  
  const scannedCases = [];
  const reportDetails = [];
  
  sourceDocs.forEach(source => {
    const docCases = scanDocForCases(source.docId);
    docCases.forEach(c => {
      if (!c.category) c.category = source.defaultCat;
      scannedCases.push(c);
    });
    reportDetails.push(`เอกสาร [${source.defaultCat}] (ID: ${source.docId.substring(0, 6)}...): พบทั้งหมด ${docCases.length} เคส`);
  });
  
  // อัปเดตข้อมูลที่แสกนได้เข้า Map
  scannedCases.forEach(c => {
    existingCasesMap[c.caseId] = {
      caseId: c.caseId,
      title: c.title || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].title : ''),
      category: c.category || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].category : ''),
      mainGroup: c.mainGroup || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].mainGroup : ''),
      subTopic: c.subTopic || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].subTopic : ''),
      disease: c.disease || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].disease : ''),
      difficulty: c.difficulty || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].difficulty : 2),
      docId: c.docId || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].docId : ''),
      author: c.author || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].author : ''),
      createdDate: c.createdDate || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].createdDate : ''),
      isActive: (existingCasesMap[c.caseId] && existingCasesMap[c.caseId].isActive !== undefined) ? existingCasesMap[c.caseId].isActive : 'TRUE',
      linkedFromCase: c.linkedFromCase || (existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].linkedFromCase : ''),
      linkedNextCase: existingCasesMap[c.caseId] ? existingCasesMap[c.caseId].linkedNextCase : ''
    };
  });
  
  // Auto-link next cases based on linkedFromCase
  Object.keys(existingCasesMap).forEach(caseId => {
    const c = existingCasesMap[caseId];
    if (c.linkedFromCase && existingCasesMap[c.linkedFromCase]) {
      existingCasesMap[c.linkedFromCase].linkedNextCase = c.caseId;
    }
  });
  
  // เคลียร์ชีทใต้ส่วนหัว
  // เคลียร์ชีทใต้ส่วนหัวแบนเนอร์ (แถว 2 ลงไปทั้งหมด)
  if (sheetLib.getLastRow() > 1) {
    sheetLib.getRange(2, 1, sheetLib.getLastRow() - 1, sheetLib.getLastColumn()).clearContent();
  }
  
  // เขียน Headers ใหม่ที่แถวที่ 2
  sheetLib.getRange(2, 1, 1, headers.length).setValues([headers]);
  
  // เรียงลำดับ รหัสเคส
  const sortedCaseIds = Object.keys(existingCasesMap).sort();
  
  // เขียนข้อมูลกลับคืนลง Sheet (จะกลายเป็นแถว 3 เป็นต้นไป)
  sortedCaseIds.forEach(caseId => {
    const c = existingCasesMap[caseId];
    sheetLib.appendRow([
      c.caseId,
      c.title,
      c.category,
      c.mainGroup,
      c.subTopic || '',
      c.disease,
      c.difficulty,
      c.docId,
      c.author,
      c.createdDate,
      c.isActive,
      c.linkedNextCase || '',
      c.linkedFromCase || ''
    ]);
  });
  
  // จัด Format แบนเนอร์กลับสู่หน้าแรกอีกครั้ง
  decorateHomeBanners(ss);
  
  return {
    message: `ซิงก์ข้อมูลคลังเคสสำเร็จ! อัปเดตในตาราง CaseLibrary เรียบร้อย รวมทั้งสิ้น ${sortedCaseIds.length} เคส`,
    details: reportDetails
  };
}

function scanDocForCases(docId) {
  const cases = [];
  try {
    const doc = DocumentApp.openById(docId);
    const bodies = getAllDocumentTabBodies(doc);
    
    bodies.forEach(body => {
      const numChildren = body.getNumChildren();
      
      for (let i = 0; i < numChildren; i++) {
        const child = body.getChild(i);
        const type = child.getType();
        
        // Case 1: ตารางแม่แบบ (Table Template)
        if (type === DocumentApp.ElementType.TABLE) {
          const table = child.asTable();
          const numRows = table.getNumRows();
          if (numRows >= 4) {
            let caseId = '';
            let title = '';
            let category = '';
            let mainGroup = '';
            let subTopic = '';
            let disease = '';
            let difficulty = 2;
            let author = '';
            let createdDate = '';
            let isTableCase = false;
            
            for (let r = 0; r < numRows; r++) {
              const row = table.getRow(r);
              if (row.getNumCells() < 2) continue;
              const keyText = row.getCell(0).getText().trim().toLowerCase();
              const valText = row.getCell(1).getText().trim();
              
              if (keyText.includes('รหัสเคส') || keyText.includes('case id') || keyText.includes('caseid')) {
                const match = valText.match(/OSPE-[A-Z0-9]+/i);
                if (match) {
                  caseId = match[0].toUpperCase();
                  isTableCase = true;
                }
              } else if (keyText.includes('ชื่อเคส') || keyText.includes('หัวข้อ') || keyText.includes('title')) {
                title = valText;
              } else if (keyText.includes('หมวด') || keyText.includes('category')) {
                category = valText;
              } else if (keyText.includes('ospe main group') || keyText.includes('กลุ่มวิชา') || keyText.includes('course group') || keyText.includes('mainGroup')) {
                mainGroup = valText;
              } else if (keyText.includes('โรค/หัวข้อ') || keyText.includes('โรค') || keyText.includes('disease')) {
                disease = valText;
              } else if (keyText.includes('ระดับ') || keyText.includes('difficulty')) {
                const diffMatch = valText.match(/\d+/);
                difficulty = diffMatch ? parseInt(diffMatch[0]) : 2;
              } else if (keyText.includes('ผู้เขียน') || keyText.includes('author')) {
                author = valText;
              } else if (keyText.includes('วันที่') || keyText.includes('date')) {
                createdDate = valText;
              }
            }
            
            if (isTableCase && caseId) {
              let linkedFromCase = '';
              const linkMatch = title.match(/\(ต่อจาก\s*(OSPE-[A-Z0-9]+|[A-Z0-9]+)\)/i);
              if (linkMatch) {
                linkedFromCase = linkMatch[1].toUpperCase();
                if (!linkedFromCase.startsWith('OSPE-')) linkedFromCase = 'OSPE-' + linkedFromCase;
              }
              
              cases.push({
                caseId: caseId,
                title: title || 'Untitled Case',
                category: category || '',
                mainGroup: mainGroup || '',
                subTopic: subTopic || '',
                disease: disease || '',
                difficulty: difficulty,
                docId: docId,
                author: author || 'Unknown',
                createdDate: createdDate || new Date().toLocaleDateString('th-TH'),
                isActive: 'TRUE',
                linkedFromCase: linkedFromCase
              });
            }
          }
        }
      
      // Case 2: รูปแบบข้อความธรรมดา (Heading/Paragraph Case)
      if (type === DocumentApp.ElementType.PARAGRAPH) {
        const p = child.asParagraph();
        const text = p.getText().trim();
        const caseIdMatch = text.match(/^#+\s*[\[{](OSPE-[A-Z0-9]+)[\]}]\s*(.*)$/) || text.match(/^[\[{](OSPE-[A-Z0-9]+)[\]}]\s*(.*)$/);
        
        if (caseIdMatch) {
          const caseId = caseIdMatch[1].toUpperCase();
          let title = caseIdMatch[2].replace(/^[-—\s]+/, '').trim();
          let category = '';
          let mainGroup = '';
          let subTopic = '';
          let disease = '';
          let difficulty = 2;
          let author = '';
          let createdDate = '';
          
          let j = i + 1;
          while (j < numChildren) {
            const nextChild = body.getChild(j);
            const nextType = nextChild.getType();
            
            if (nextType === DocumentApp.ElementType.TABLE) {
              const nextTable = nextChild.asTable();
              if (checkTableTemplate(nextTable, "")) {
                break;
              }
            }
            if (nextType === DocumentApp.ElementType.PARAGRAPH || nextType === DocumentApp.ElementType.LIST_ITEM) {
              const nextText = (nextType === DocumentApp.ElementType.PARAGRAPH) ? 
                                nextChild.asParagraph().getText().trim() : 
                                nextChild.asListItem().getText().trim();
              
              if (nextText.match(/^#+\s*[\[{]OSPE-[A-Z0-9]+[\]}]/) || nextText.match(/^[\[{]OSPE-[A-Z0-9]+[\]}]/)) {
                break;
              }
              
              const metaMatch = nextText.match(/^[-*\sข้อมูลเคส]*\s*(หมวด|category|ospe main group|กลุ่มวิชา|course group|mainGroup|โรค\/หัวข้อ|โรค|disease|ระดับ|difficulty|ผู้เขียน|author|วันที่|date)\s*:\s*(.*)$/i);
              if (metaMatch) {
                const key = metaMatch[1].toLowerCase();
                const val = metaMatch[2].trim();
                
                if (key.includes('หมวด') || key.includes('category')) {
                  category = val;
                } else if (key.includes('group') || key.includes('กลุ่มวิชา') || key.includes('course')) {
                  mainGroup = val;
                } else if (key.includes('โรค') || key.includes('disease')) {
                  disease = val;
                } else if (key.includes('ระดับ') || key.includes('difficulty')) {
                  const diffMatch = val.match(/\d+/);
                  difficulty = diffMatch ? parseInt(diffMatch[0]) : 2;
                } else if (key.includes('ผู้เขียน') || key.includes('author')) {
                  author = val;
                } else if (key.includes('วันที่') || key.includes('date')) {
                  createdDate = val;
                }
              }
            }
            j++;
          }
          
          let linkedFromCase = '';
          const linkMatch = title.match(/\(ต่อจาก\s*(OSPE-[A-Z0-9]+|[A-Z0-9]+)\)/i);
          if (linkMatch) {
            linkedFromCase = linkMatch[1].toUpperCase();
            if (!linkedFromCase.startsWith('OSPE-')) linkedFromCase = 'OSPE-' + linkedFromCase;
          }
          
          cases.push({
            caseId: caseId,
            title: title || 'Untitled Case',
            category: category || '',
            mainGroup: mainGroup || '',
            subTopic: subTopic || '',
            disease: disease || '',
            difficulty: difficulty,
            docId: docId,
            author: author || '',
            createdDate: createdDate || new Date().toLocaleDateString('th-TH'),
            isActive: 'TRUE',
            linkedFromCase: linkedFromCase
          });
          
          i = j - 1;
        }
      }
    }
  });
  } catch (e) {
    Logger.log('Error scanning Doc ID ' + docId + ': ' + e.toString());
  }
  return cases;
}

function debugCase() {
  // ทดสอบ Clinic
  const result = getCaseContentFromDoc('1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g', 'OSPE-CL001');
  Logger.log('contentHtml length: ' + (result.contentHtml || '').length);
  Logger.log('checklist count: ' + (result.checklist || []).length);
  Logger.log('scenario: ' + (result.scenario ? result.scenario.substring(0, 100) : 'N/A'));
}


// ══════════════════════════════════════════════════════════════════
// CASE REPORT SYSTEM
// ══════════════════════════════════════════════════════════════════

/**
 * ตั้งค่า Sheet CaseReports พร้อม Headers และ Data Validation Dropdown ที่ Column G
 * เรียกครั้งเดียวจาก Apps Script Editor (ไม่ต้อง Deploy)
 */
function setupReportSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.sheets.caseReports);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheets.caseReports);
    Logger.log('Created new sheet: CaseReports');
  }
  
  // Set Headers row 1
  const headers = [
    'Timestamp', 'ReportID', 'CaseID', 'CaseTitle',
    'ProblemType', 'Description', 'Status', 'StaffNotes'
  ];
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4a90d9');
  headerRange.setFontColor('#ffffff');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Set column widths
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 130); // ReportID
  sheet.setColumnWidth(3, 130); // CaseID
  sheet.setColumnWidth(4, 200); // CaseTitle
  sheet.setColumnWidth(5, 180); // ProblemType
  sheet.setColumnWidth(6, 350); // Description
  sheet.setColumnWidth(7, 140); // Status
  sheet.setColumnWidth(8, 250); // StaffNotes
  
  // Set Data Validation Dropdown on Column G (Status) — rows 2 to 1000
  const statusRange = sheet.getRange(2, 7, 999, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ยังไม่แก้ไข', 'กำลังแก้ไข', 'แก้ไขแล้ว'], true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(rule);
  
  // Pre-fill default status color using conditional formatting
  const rules = sheet.getConditionalFormatRules();
  
  // Red — ยังไม่แก้ไข
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('ยังไม่แก้ไข')
    .setBackground('#f4cccc')
    .setRanges([statusRange])
    .build());
  
  // Yellow — กำลังแก้ไข
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('กำลังแก้ไข')
    .setBackground('#fff2cc')
    .setRanges([statusRange])
    .build());
  
  // Green — แก้ไขแล้ว
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('แก้ไขแล้ว')
    .setBackground('#d9ead3')
    .setRanges([statusRange])
    .build());
  
  sheet.setConditionalFormatRules(rules);
  
  Logger.log('setupReportSheet complete ✅');
  return { success: true, message: 'CaseReports sheet setup complete' };
}

/**
 * บันทึก Report ใหม่เข้า CaseReports Sheet
 * รับ params: caseId, caseTitle, problemType, description
 */
function submitCaseReport(params) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.sheets.caseReports);
    
    // Auto-create sheet if missing
    if (!sheet) {
      setupReportSheet();
      sheet = ss.getSheetByName(CONFIG.sheets.caseReports);
    }
    
    // Validate required fields
    const caseId = (params.caseId || '').trim();
    const problemType = (params.problemType || '').trim();
    const description = (params.description || '').trim();
    const caseTitle = (params.caseTitle || caseId).trim();
    
    if (!caseId || !problemType || !description) {
      return { success: false, error: 'Missing required fields: caseId, problemType, description' };
    }
    
    // Generate short ReportID: RPT-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyyMMdd');
    const randSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const reportId = 'RPT-' + dateStr + '-' + randSuffix;
    
    // Timestamp formatted for Thai timezone
    const timestamp = Utilities.formatDate(now, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    
    // Append row
    sheet.appendRow([
      timestamp,
      reportId,
      caseId,
      caseTitle,
      problemType,
      description,
      'ยังไม่แก้ไข',
      ''
    ]);
    
    Logger.log('New report submitted: ' + reportId + ' for case ' + caseId);
    return {
      success: true,
      reportId: reportId,
      message: 'Report submitted successfully'
    };
    
  } catch (e) {
    Logger.log('submitCaseReport error: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * ดึงรายการ Reports ทั้งหมดจาก CaseReports Sheet
 * รับ params: caseId (optional filter), status (optional filter: ยังไม่แก้ไข/กำลังแก้ไข/แก้ไขแล้ว)
 */
function getCaseReports(params) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.sheets.caseReports);
    
    if (!sheet) {
      return { reports: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { reports: [], total: 0 };
    }
    
    // Skip header row
    const filterCaseId = (params && params.caseId) ? params.caseId.trim() : '';
    const filterStatus = (params && params.status) ? params.status.trim() : '';
    
    const reports = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip empty rows
      if (!row[1]) continue;
      
      const report = {
        timestamp:   row[0] ? row[0].toString() : '',
        reportId:    row[1] ? row[1].toString() : '',
        caseId:      row[2] ? row[2].toString() : '',
        caseTitle:   row[3] ? row[3].toString() : '',
        problemType: row[4] ? row[4].toString() : '',
        description: row[5] ? row[5].toString() : '',
        status:      row[6] ? row[6].toString() : 'ยังไม่แก้ไข',
        staffNotes:  row[7] ? row[7].toString() : ''
      };
      
      // Apply filters
      if (filterCaseId && report.caseId !== filterCaseId) continue;
      if (filterStatus && report.status !== filterStatus) continue;
      
      reports.push(report);
    }
    
    // Sort: newest first (reverse order since appendRow adds at bottom)
    reports.reverse();
    
    return { reports: reports, total: reports.length };
    
  } catch (e) {
    Logger.log('getCaseReports error: ' + e.toString());
    return { reports: [], total: 0, error: e.toString() };
  }
}



// ════════════════════════════════════════════════════════════════════
//  🏠  ROOM BOOKING SYSTEM — ห้อง 7 ดาว CLINIC OSPE
//  ────────────────────────────────────────────────────────────────
//  ฟังก์ชันทั้งหมดในส่วนนี้ใช้สำหรับระบบจองห้อง 7 ดาว
//  Sheets ที่ใช้: RoomBookings, BookingHistory
// ════════════════════════════════════════════════════════════════════

/**
 * setupRoomSheets()
 * ─────────────────
 * สร้าง Sheet "RoomBookings" และ "BookingHistory" พร้อม Header row
 * ใน Spreadsheet เดิม (CONFIG.spreadsheetId)
 * วิธีใช้: เปิด Apps Script Editor → เลือกฟังก์ชัน setupRoomSheets → กด Run
 */
function setupRoomSheets() {
  const ss = getSpreadsheet();

  // ─── RoomBookings Sheet ───────────────────────────────────────
  let bookingSheet = ss.getSheetByName(CONFIG.sheets.roomBookings);
  if (!bookingSheet) {
    bookingSheet = ss.insertSheet(CONFIG.sheets.roomBookings);
    Logger.log('✅ Created sheet: ' + CONFIG.sheets.roomBookings);
  } else {
    Logger.log('ℹ️  Sheet already exists: ' + CONFIG.sheets.roomBookings);
  }

  // Set Headers
  const bookingHeaders = [
    'bookingId',
    'date',
    'timeSlot',
    'tableType',
    'studentIds',
    'bookedBy',
    'bookedAt',
    'status',
    'checkedInAt'    // ← NEW: timestamp เมื่อยืนยันเข้าใช้งาน
  ];
  if (bookingSheet.getLastRow() === 0) {
    bookingSheet.appendRow(bookingHeaders);
    // Style header row
    const headerRange = bookingSheet.getRange(1, 1, 1, bookingHeaders.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1d1d1f');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    bookingSheet.setFrozenRows(1);
    // Set column widths
    bookingSheet.setColumnWidth(1, 160);  // bookingId
    bookingSheet.setColumnWidth(2, 120);  // date
    bookingSheet.setColumnWidth(3, 90);   // timeSlot
    bookingSheet.setColumnWidth(4, 120);  // tableType
    bookingSheet.setColumnWidth(5, 280);  // studentIds
    bookingSheet.setColumnWidth(6, 110);  // bookedBy
    bookingSheet.setColumnWidth(7, 180);  // bookedAt
    bookingSheet.setColumnWidth(8, 90);   // status
    bookingSheet.setColumnWidth(9, 180);  // checkedInAt
    Logger.log('✅ Added headers to RoomBookings');
  }

  // ─── BookingHistory Sheet ─────────────────────────────────────
  let historySheet = ss.getSheetByName(CONFIG.sheets.bookingHistory);
  if (!historySheet) {
    historySheet = ss.insertSheet(CONFIG.sheets.bookingHistory);
    Logger.log('✅ Created sheet: ' + CONFIG.sheets.bookingHistory);
  } else {
    Logger.log('ℹ️  Sheet already exists: ' + CONFIG.sheets.bookingHistory);
  }

  const historyHeaders = [
    'logId',
    'bookingId',
    'action',
    'date',
    'timeSlot',
    'tableType',
    'studentIds',
    'actorId',
    'timestamp'
  ];
  if (historySheet.getLastRow() === 0) {
    historySheet.appendRow(historyHeaders);
    const headerRange = historySheet.getRange(1, 1, 1, historyHeaders.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1d1d1f');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    historySheet.setFrozenRows(1);
    historySheet.setColumnWidth(1, 80);   // logId
    historySheet.setColumnWidth(2, 160);  // bookingId
    historySheet.setColumnWidth(3, 90);   // action
    historySheet.setColumnWidth(4, 120);  // date
    historySheet.setColumnWidth(5, 90);   // timeSlot
    historySheet.setColumnWidth(6, 120);  // tableType
    historySheet.setColumnWidth(7, 280);  // studentIds
    historySheet.setColumnWidth(8, 110);  // actorId
    historySheet.setColumnWidth(9, 180);  // timestamp
    Logger.log('✅ Added headers to BookingHistory');
  }

  Logger.log('🎉 setupRoomSheets() completed successfully!');
  Logger.log('   RoomBookings rows:    ' + bookingSheet.getLastRow());
  Logger.log('   BookingHistory rows:  ' + historySheet.getLastRow());

  return {
    success: true,
    message: 'สร้าง Sheet เรียบร้อยแล้ว! RoomBookings และ BookingHistory พร้อมใช้งาน'
  };
}

// ─────────────────────────────────────────────────────────────────
//  Booking ID Generator
// ─────────────────────────────────────────────────────────────────
function generateBookingId_() {
  const now  = new Date();
  const y    = now.getFullYear();
  const m    = String(now.getMonth()+1).padStart(2,'0');
  const d    = String(now.getDate()).padStart(2,'0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `BK-${y}${m}${d}-${rand}`;
}

// ─────────────────────────────────────────────────────────────────
//  Log ID Generator
// ─────────────────────────────────────────────────────────────────
function generateLogId_(sheet) {
  return sheet.getLastRow(); // rowCount = logId
}

// ─────────────────────────────────────────────────────────────────
//  Internal Date & String Normalizer (Prevents Sheets Date Object Glitches)
// ─────────────────────────────────────────────────────────────────
function _normalizeDateStr(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  return str;
}

function _dateStr(d) {
  if (d instanceof Date) {
    return Utilities.formatDate(d, 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  return _normalizeDateStr(d);
}

// ─────────────────────────────────────────────────────────────────
/**
 * getBookingsForWeek(weekStartDate)
 * ──────────────────────────────────
 * ดึงข้อมูลการจองทั้งสัปดาห์ (พร้อม auto-expire bookings ที่ไม่ check-in)
 * @param {string} weekStartDate - วันจันทร์ของสัปดาห์ เช่น "2026-08-17"
 * @returns {Object} - {
 *   "2026-08-17_08:00": {
 *     outside: { bookingId, ids, status, checkedInAt } | null,
 *     inside:  { bookingId, ids, status, checkedInAt } | null
 *   }, ...
 * }
 */
function getBookingsForWeek(weekStartDate) {
  try {
    const cleanStartDate = _normalizeDateStr(weekStartDate) || _dateStr(new Date());

    // Auto-expire no-show bookings first (non-blocking)
    try {
      autoExpireBookings_();
    } catch (eExp) {
      Logger.log('autoExpireBookings_ non-blocking error: ' + eExp);
    }

    const ss = getSpreadsheet();
    if (!ss) return {};
    const sheet = ss.getSheetByName(CONFIG.sheets.roomBookings);
    if (!sheet || sheet.getLastRow() <= 1) return {};

    // Build week date range (Monday to Sunday)
    const [y, m, d] = cleanStartDate.split('-').map(Number);
    const startDate = new Date(y, m - 1, d);
    const endDate   = new Date(y, m - 1, d + 6);
    const startStr  = cleanStartDate;
    const endStr    = Utilities.formatDate(endDate, 'Asia/Bangkok', 'yyyy-MM-dd');

    const data   = sheet.getDataRange().getValues();
    const result = {};

    for (let i = 1; i < data.length; i++) {
      const row         = data[i];
      const bId         = row[0] ? String(row[0]).trim() : '';
      const date        = _normalizeDateStr(row[1]);
      const time        = row[2] ? String(row[2]).trim() : '';
      const tType       = row[3] ? String(row[3]).trim() : '';
      const sIds        = row[4] ? String(row[4]).trim() : '';
      const status      = row[7] ? String(row[7]).trim() : 'active';
      const checkedInAt = row[8] ? String(row[8]).trim() : '';

      // Skip cancelled / no_show
      if (!bId || status === 'cancelled' || status === 'no_show' || !date || !time) continue;
      if (date < startStr || date > endStr) continue;

      const key = `${date}_${time}`;
      if (!result[key]) result[key] = { outside: null, inside: null };

      const idList = sIds.split(',').map(s => s.trim()).filter(Boolean);
      const entry = { bookingId: bId, ids: idList, status, checkedInAt };

      if (tType === 'outside') result[key].outside = entry;
      else if (tType === 'inside') result[key].inside = entry;
    }

    return result;

  } catch (e) {
    Logger.log('getBookingsForWeek error: ' + e.toString());
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────
/**
 * getDayQuota(date, studentId)
 * ─────────────────────────────
 * ตรวจสอบจำนวนชั่วโมงที่นิสิตจองไปแล้วในวันนั้น
 * @returns {number} - จำนวนชั่วโมง (max 2)
 */
function getDayQuota(date, studentId) {
  try {
    const cleanDate = _normalizeDateStr(date);
    const ss    = getSpreadsheet();
    if (!ss) return 0;
    const sheet = ss.getSheetByName(CONFIG.sheets.roomBookings);
    if (!sheet || sheet.getLastRow() <= 1) return 0;

    const data  = sheet.getDataRange().getValues();
    const sidTrim = String(studentId).trim();
    if (!sidTrim) return 0;
    let count = 0;

    for (let i = 1; i < data.length; i++) {
      const row    = data[i];
      const rDate  = _normalizeDateStr(row[1]);
      const sIds   = row[4] ? String(row[4]).trim() : '';
      const status = row[7] ? String(row[7]).trim() : '';

      if (status === 'cancelled' || status === 'no_show') continue;
      if (rDate !== cleanDate) continue;

      const idList = sIds.split(',').map(s => s.trim());
      if (idList.includes(sidTrim)) count++;
    }

    return count; // 1 booking = 1 ชั่วโมง

  } catch (e) {
    Logger.log('getDayQuota error: ' + e.toString());
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────
/**
 * createBooking(payload)
 * ──────────────────────
 * สร้างการจองใหม่ พร้อม validate ทุก rule
 * @param {Object} payload - { date, timeSlot, tableType, studentIds[], bookedBy }
 * @returns {Object} - { success, bookingId?, error? }
 */
function createBooking(payload) {
  try {
    const { date, timeSlot, tableType, studentIds, bookedBy } = payload;
    const cleanDate = _normalizeDateStr(date);

    // ── Validate required fields ──────────────────────────────
    if (!cleanDate || !timeSlot || !tableType || !studentIds || !bookedBy) {
      return { success: false, error: 'ข้อมูลไม่ครบถ้วน กรุณากรอกให้ครบ' };
    }
    if (!Array.isArray(studentIds) || studentIds.length < 2) {
      return { success: false, error: 'ต้องกรอกรหัสนิสิตอย่างน้อย 2 คน' };
    }
    if (!['outside','inside'].includes(tableType)) {
      return { success: false, error: 'ประเภทโต๊ะไม่ถูกต้อง' };
    }

    // ── Validate date is not in the past ──────────────────────
    const [y, m, d] = cleanDate.split('-').map(Number);
    const [slotHour] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(y, m - 1, d, slotHour + 1, 0, 0);
    if (slotDateTime <= new Date()) {
      return { success: false, error: 'ไม่สามารถจองเวลาที่ผ่านไปแล้ว' };
    }

    // ── Check quota for all students ─────────────────────────
    for (const sid of studentIds) {
      const used = getDayQuota(cleanDate, sid.trim());
      if (used >= 2) {
        return { success: false, error: `รหัสนิสิต ${sid.trim()} ใช้ quota 2 ชม./วันครบแล้ว` };
      }
    }

    // ── Check slot availability ───────────────────────────────
    const ss    = getSpreadsheet();
    if (!ss) return { success: false, error: 'ไม่สามารถเชื่อมต่อ Google Sheet ได้' };
    const sheet = ss.getSheetByName(CONFIG.sheets.roomBookings);
    if (!sheet) {
      return { success: false, error: 'ไม่พบ Sheet RoomBookings กรุณารัน setupRoomSheets() ก่อน' };
    }

    const data  = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row    = data[i];
      const rDate  = _normalizeDateStr(row[1]);
      const rTime  = row[2] ? String(row[2]).trim() : '';
      const rType  = row[3] ? String(row[3]).trim() : '';
      const status = row[7] ? String(row[7]).trim() : '';

      if (status === 'cancelled' || status === 'no_show') continue;
      if (rDate === cleanDate && rTime === timeSlot && rType === tableType) {
        const tName = tableType === 'outside' ? 'โต๊ะกลมด้านนอก' : 'โต๊ะในห้อง';
        return { success: false, error: `${tName} ในช่วงเวลานี้ถูกจองไปแล้ว` };
      }
    }

    // ── Create booking ────────────────────────────────────────
    const bookingId = generateBookingId_();
    const now       = new Date();
    const nowStr    = Utilities.formatDate(now, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mm:ss");

    sheet.appendRow([
      bookingId,
      cleanDate,
      timeSlot,
      tableType,
      studentIds.join(', '),
      String(bookedBy).trim(),
      nowStr,
      'active',
      ''       // checkedInAt — filled by checkInBooking()
    ]);

    // ── Log to BookingHistory ────────────────────────────────
    const historySheet = ss.getSheetByName(CONFIG.sheets.bookingHistory);
    if (historySheet) {
      const logId = historySheet.getLastRow();
      historySheet.appendRow([
        logId,
        bookingId,
        'created',
        cleanDate,
        timeSlot,
        tableType,
        studentIds.join(', '),
        String(bookedBy).trim(),
        nowStr
      ]);
    }

    Logger.log(`✅ Booking created: ${bookingId} | ${cleanDate} ${timeSlot} | ${tableType} | by ${bookedBy}`);
    return { success: true, bookingId: bookingId };

  } catch (e) {
    Logger.log('createBooking error: ' + e.toString());
    return { success: false, error: 'เกิดข้อผิดพลาดในระบบ: ' + e.message };
  }
}

// ─────────────────────────────────────────────────────────────────
/**
 * cancelBooking(bookingId, studentId)
 * ────────────────────────────────────
 * ยกเลิกการจอง โดยตรวจสอบว่า studentId เป็นผู้จองหลักหรือสมาชิกในกลุ่ม
 * @returns {Object} - { success, error? }
 */
function cancelBooking(bookingId, studentId) {
  try {
    const bIdTrim  = String(bookingId).trim().toUpperCase();
    const sidTrim  = String(studentId).trim();

    const ss    = getSpreadsheet();
    if (!ss) return { success: false, error: 'ไม่สามารถเชื่อมต่อ Google Sheet ได้' };
    const sheet = ss.getSheetByName(CONFIG.sheets.roomBookings);
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, error: 'ไม่พบข้อมูลการจอง' };
    }

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row     = data[i];
      const rId     = row[0] ? String(row[0]).trim().toUpperCase() : '';
      const rDate   = _normalizeDateStr(row[1]);
      const rTime   = row[2] ? String(row[2]).trim() : '';
      const rType   = row[3] ? String(row[3]).trim() : '';
      const rSids   = row[4] ? String(row[4]).trim() : '';
      const rBy     = row[5] ? String(row[5]).trim() : '';
      const status  = row[7] ? String(row[7]).trim() : '';

      if (rId !== bIdTrim) continue;

      // Found booking
      if (status === 'cancelled') {
        return { success: false, error: 'การจองนี้ถูกยกเลิกไปแล้ว' };
      }
      const idList = rSids.split(',').map(s => s.trim());
      if (rBy !== sidTrim && !idList.includes(sidTrim)) {
        return { success: false, error: 'รหัสนิสิตไม่ตรงกับผู้จองหรือสมาชิกในกลุ่ม' };
      }

      // Cancel it
      sheet.getRange(i + 1, 8).setValue('cancelled');

      // Log
      const historySheet = ss.getSheetByName(CONFIG.sheets.bookingHistory);
      if (historySheet) {
        const logId = historySheet.getLastRow();
        const nowStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mm:ss");
        historySheet.appendRow([
          logId,
          bookingId,
          'cancelled',
          rDate,
          rTime,
          rType,
          rSids,
          sidTrim,
          nowStr
        ]);
      }

      Logger.log(`🗑️  Booking cancelled: ${bookingId} by ${sidTrim}`);
      return { success: true };
    }

    return { success: false, error: 'ไม่พบ Booking ID นี้ในระบบ' };

  } catch (e) {
    Logger.log('cancelBooking error: ' + e.toString());
    return { success: false, error: 'เกิดข้อผิดพลาดในระบบ: ' + e.message };
  }
}

// ─────────────────────────────────────────────────────────────────
/**
 * autoExpireBookings_()   [Private — called by getBookingsForWeek]
 * ─────────────────────────────────────────────────────────────────
 * สแกนหา bookings ที่ status=active แต่เวลาจอง + 5 นาทีผ่านไปแล้ว
 * (ไม่ได้ check-in ทัน) → เปลี่ยนเป็น no_show + log
 */
function autoExpireBookings_() {
  try {
    const ss    = getSpreadsheet();
    if (!ss) return;
    const sheet = ss.getSheetByName(CONFIG.sheets.roomBookings);
    if (!sheet || sheet.getLastRow() <= 1) return;

    const data = sheet.getDataRange().getValues();
    const now  = new Date();
    const historySheet = ss.getSheetByName(CONFIG.sheets.bookingHistory);

    for (let i = 1; i < data.length; i++) {
      const row    = data[i];
      const bId    = row[0] ? String(row[0]).trim() : '';
      const date   = _normalizeDateStr(row[1]);
      const time   = row[2] ? String(row[2]).trim() : '';
      const tType  = row[3] ? String(row[3]).trim() : '';
      const sIds   = row[4] ? String(row[4]).trim() : '';
      const status = row[7] ? String(row[7]).trim() : 'active';

      if (!bId || status !== 'active' || !date || !time) continue;

      const [slotH] = time.split(':').map(Number);
      if (isNaN(slotH)) continue;

      const [y, m, d] = date.split('-').map(Number);
      const slotStart = new Date(y, m - 1, d, slotH, 0, 0);
      const windowEnd = new Date(slotStart.getTime() + 5 * 60 * 1000); // +5 min

      if (now > windowEnd) {
        sheet.getRange(i + 1, 8).setValue('no_show');

        if (historySheet) {
          const logId  = historySheet.getLastRow();
          const nowStr = Utilities.formatDate(now, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mm:ss");
          historySheet.appendRow([
            logId, bId, 'no_show', date, time, tType, sIds, 'SYSTEM', nowStr
          ]);
        }
        Logger.log(`⏰ No-show expire: ${bId} | ${date} ${time}`);
      }
    }
  } catch (e) {
    Logger.log('autoExpireBookings_ error: ' + e.toString());
  }
}

// ─────────────────────────────────────────────────────────────────
/**
 * checkInBooking(bookingId, studentId)
 * ──────────────────────────────────────
 * ยืนยันการเข้าใช้งาน — ต้องทำภายใน 5 นาทีหลังเริ่ม slot
 * studentId ต้องอยู่ในรายชื่อผู้จอง
 * @returns {Object} - { success, error? }
 */
function checkInBooking(bookingId, studentId) {
  try {
    const bIdTrim = String(bookingId).trim().toUpperCase();
    const sidTrim = String(studentId).trim();

    const ss    = getSpreadsheet();
    if (!ss) return { success: false, error: 'ไม่สามารถเชื่อมต่อ Google Sheet ได้' };
    const sheet = ss.getSheetByName(CONFIG.sheets.roomBookings);
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, error: 'ไม่พบข้อมูลการจอง' };
    }

    const data = sheet.getDataRange().getValues();
    const now  = new Date();

    for (let i = 1; i < data.length; i++) {
      const row    = data[i];
      const rId    = row[0] ? String(row[0]).trim().toUpperCase() : '';
      const rDate  = _normalizeDateStr(row[1]);
      const rTime  = row[2] ? String(row[2]).trim() : '';
      const rType  = row[3] ? String(row[3]).trim() : '';
      const rSids  = row[4] ? String(row[4]).trim() : '';
      const rBy    = row[5] ? String(row[5]).trim() : '';
      const status = row[7] ? String(row[7]).trim() : 'active';

      if (rId !== bIdTrim) continue;

      if (status === 'checked_in') {
        return { success: false, error: 'ยืนยันการเข้าใช้งานไปแล้ว' };
      }
      if (status !== 'active') {
        return { success: false, error: 'การจองนี้ไม่สามารถ check-in ได้ (status: ' + status + ')' };
      }

      const idList = rSids.split(',').map(s => s.trim());
      if (!idList.includes(sidTrim) && rBy !== sidTrim) {
        return { success: false, error: 'รหัสนิสิตไม่อยู่ในรายชื่อผู้จอง' };
      }

      const [slotH] = rTime.split(':').map(Number);
      const [y, m, d] = rDate.split('-').map(Number);
      const slotStart = new Date(y, m - 1, d, slotH, 0, 0);
      const windowEnd = new Date(slotStart.getTime() + 5 * 60 * 1000);
      if (now > windowEnd) {
        return { success: false, error: 'หมดเวลายืนยัน (เกิน 5 นาทีแล้ว) การจองถูกยกเลิกอัตโนมัติ' };
      }
      if (now < slotStart) {
        return { success: false, error: 'ยังไม่ถึงเวลาจอง กรุณารอจนถึงเวลา ' + rTime };
      }

      // ✅ Check-in!
      const nowStr = Utilities.formatDate(now, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mm:ss");
      sheet.getRange(i + 1, 8).setValue('checked_in');
      sheet.getRange(i + 1, 9).setValue(nowStr);

      // Log
      const historySheet = ss.getSheetByName(CONFIG.sheets.bookingHistory);
      if (historySheet) {
        const logId = historySheet.getLastRow();
        historySheet.appendRow([
          logId, bookingId, 'checked_in', rDate, rTime, rType, rSids, sidTrim, nowStr
        ]);
      }

      Logger.log(`✅ Check-in: ${bookingId} by ${sidTrim} at ${nowStr}`);
      return { success: true };
    }

    return { success: false, error: 'ไม่พบ Booking ID นี้ในระบบ' };

  } catch (e) {
    Logger.log('checkInBooking error: ' + e.toString());
    return { success: false, error: 'เกิดข้อผิดพลาดในระบบ: ' + e.message };
  }
}

// ════════════════════════════════════════════════════════════════════
//  END OF ROOM BOOKING SYSTEM
// ════════════════════════════════════════════════════════════════════
