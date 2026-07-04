import os

with open('exam-simulation.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<!-- Examinee Notice Card -->' in line:
        start_idx = i
    if '<!-- Checklist items populated dynamically -->' in line:
        end_idx = i + 2 # include closing div and empty line

if start_idx != -1 and end_idx != -1:
    extracted = lines[start_idx:end_idx]
    del lines[start_idx:end_idx]
    
    insert_idx = -1
    for i, line in enumerate(lines):
        if '<!-- Right Sidebar Pane:' in line:
            insert_idx = i - 1
            break
            
    if insert_idx != -1:
        extracted.insert(0, '\n            <!-- Added margin top for checklist section -->\n            <div style=\"margin-top: 2rem;\"></div>\n')
        lines = lines[:insert_idx] + extracted + lines[insert_idx:]
        
        with open('exam-simulation.html', 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print('exam-simulation.html updated')
    else:
        print('Could not find insert position')
else:
    print('Could not find extract position')
