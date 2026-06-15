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
  sheets: {
    caseLibrary: 'CaseLibrary',
    courseGroups: 'CourseGroups',
    settings: 'Settings'
  },
  defaultExamRatio: {
    clinic: 8,
    product: 6,
    sap: 2
  }
};

// ฐานข้อมูลเคสเริ่มต้น (Fallback กรณี Sheet ว่างเปล่าหรือไม่ถูกสร้าง)
const DEFAULT_CASES = [
  {
    caseId: 'OSPE-CL001',
    title: 'Warfarin Counseling — AF ใหม่',
    category: 'Clinic',
    courseGroup: 'Anticoagulation',
    disease: 'Atrial Fibrillation, Warfarin',
    difficulty: 3,
    docId: '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g',
    author: 'Lin',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  },
  {
    caseId: 'OSPE-PD001',
    title: 'Compounding — Cold Cream & Labeling',
    category: 'Product',
    courseGroup: 'Compounding - Topical',
    disease: 'Dry Skin, Cold Cream',
    difficulty: 2,
    docId: '1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw',
    author: 'Fon',
    createdDate: '15/06/2026',
    isActive: 'TRUE'
  },
  {
    caseId: 'OSPE-SP001',
    title: 'Pharmacy Law — ยาควบคุมพิเศษ',
    category: 'SAP',
    courseGroup: 'Pharmacy Law',
    disease: 'Special Controlled Drugs Regulation',
    difficulty: 2,
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
          
        case 'setupSheets':
          return buildResponse(setupSheets());
          
        case 'setupDocs':
          return buildResponse(updateDocsWithSampleContent());
          
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
        const headers = data[0];
        const rows = data.slice(1);
        
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
  if (params.courseGroup && params.courseGroup !== 'All') {
    cases = cases.filter(c => c.courseGroup === params.courseGroup);
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
  
  if (!matchedCase) {
    throw new Error('Case not found: ' + caseId);
  }
  
  // ดึงข้อมูล HTML และ Checklist จาก Google Doc
  if (matchedCase.docId) {
    try {
      const docData = getCaseContentFromDoc(matchedCase.docId);
      matchedCase.contentHtml = docData.contentHtml;
      matchedCase.content = docData.contentHtml; // รองรับตัวแปรเก่า
      matchedCase.checklist = docData.checklist;
      matchedCase.noteHtml = docData.noteHtml;
      matchedCase.note = docData.noteHtml;       // รองรับตัวแปรเก่า
      matchedCase.patientInfoHtml = docData.patientInfoHtml;
      matchedCase.scenario = docData.scenario;
    } catch (e) {
      Logger.log('Error parsing Doc ' + matchedCase.docId + ': ' + e.toString());
      matchedCase.contentHtml = `<p style="color: red;">ไม่สามารถโหลดเนื้อหาจาก Google Doc ได้: ${e.toString()}</p>`;
      matchedCase.checklist = [];
      matchedCase.noteHtml = '<p>ไม่มีคำอธิบายเพิ่มเติม</p>';
      matchedCase.error = e.toString();
    }
  } else {
    matchedCase.contentHtml = '<p>ไม่มีลิงก์เอกสาร Google Doc กำหนดไว้</p>';
    matchedCase.checklist = [];
  }
  
  return matchedCase;
}

/**
 * ──────────────────────────────────────────────────────────────
 * 3. Google Docs Parser (ดึงข้อความ & รูปภาพภาพประกอบ)
 * ──────────────────────────────────────────────────────────────
 */
function getCaseContentFromDoc(docId) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  
  let currentSection = '';
  let scenario = '';
  let patientInfoHtml = '';
  let noteHtml = '';
  let contentHtml = '';
  
  const checklist = [];
  let currentGroup = 'ทั่วไป';
  
  const numChildren = body.getNumChildren();
  
  for (let i = 0; i < numChildren; i++) {
    const child = body.getChild(i);
    const type = child.getType();
    
    // 1. ตรวจสอบ Heading เพื่อเปลี่ยน Section
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const p = child.asParagraph();
      const text = p.getText().trim();
      const heading = p.getHeading();
      
      // ตรวจสอบ H1 หรือ H2 หรือข้อความที่ขึ้นต้นด้วย # สำหรับสลับ Section
      if (heading === DocumentApp.ParagraphHeading.HEADING_1 || 
          heading === DocumentApp.ParagraphHeading.HEADING_2 || 
          text.startsWith('## ') || 
          text.startsWith('# ')) {
        
        const cleanText = text.replace(/^#+\s*/, '').trim();
        if (cleanText.includes('ข้อมูลเคส')) {
          currentSection = 'METADATA';
        } else if (cleanText.includes('โจทย์') || cleanText.includes('สถานการณ์')) {
          currentSection = 'SCENARIO';
        } else if (cleanText.includes('ข้อมูลผู้ป่วย')) {
          currentSection = 'PATIENT_INFO';
        } else if (cleanText.includes('Checklist') || cleanText.includes('ประเมิน') || cleanText.includes('เกณฑ์')) {
          currentSection = 'CHECKLIST';
        } else if (cleanText.includes('หมายเหตุ') || cleanText.includes('เฉลย') || cleanText.includes('ข้อมูลผู้ตรวจ')) {
          currentSection = 'NOTE';
        } else {
          currentSection = 'OTHER';
        }
        continue;
      }
      
      // ตรวจสอบ H3 หรือกลุ่มใน Checklist
      if (currentSection === 'CHECKLIST' && 
          (heading === DocumentApp.ParagraphHeading.HEADING_3 || 
           heading === DocumentApp.ParagraphHeading.HEADING_4 || 
           text.startsWith('###') || 
           text.startsWith('**กลุ่ม:'))) {
        
        const groupMatch = text.match(/\(กลุ่ม:\s*([^)]+)\)/) || text.match(/กลุ่ม:\s*([^*]+)/);
        if (groupMatch) {
          currentGroup = groupMatch[1].trim();
        } else {
          currentGroup = text.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
        }
        continue;
      }
    }
    
    // 2. ประมวลผลข้อมูลตาม Section ปัจจุบัน
    if (currentSection === 'SCENARIO') {
      if (type === DocumentApp.ElementType.PARAGRAPH) {
        const paragraphHtml = parseParagraphToHtml(child.asParagraph());
        if (paragraphHtml) {
          contentHtml += paragraphHtml;
          scenario += child.asParagraph().getText().trim() + '\n';
        }
      }
    } 
    else if (currentSection === 'PATIENT_INFO') {
      if (type === DocumentApp.ElementType.TABLE) {
        patientInfoHtml += parseTableToHtml(child.asTable());
      } else if (type === DocumentApp.ElementType.PARAGRAPH) {
        const paragraphHtml = parseParagraphToHtml(child.asParagraph());
        if (paragraphHtml) {
          patientInfoHtml += paragraphHtml;
        }
      }
    } 
    else if (currentSection === 'CHECKLIST') {
      if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
        let text = '';
        if (type === DocumentApp.ElementType.PARAGRAPH) {
          text = child.asParagraph().getText().trim();
        } else {
          text = child.asListItem().getText().trim();
        }
        
        // เช็คว่าเป็นเกณฑ์ Checklist หรือไม่ (ขึ้นต้นด้วย [ ], [x], ☐, ☑, -)
        const isChecklistItem = text.startsWith('[ ]') || text.startsWith('[x]') || text.startsWith('☐') || text.startsWith('☑') || text.startsWith('-');
        
        if (isChecklistItem && text.length > 3) {
          let cleanText = text.replace(/^([-☐☑]|\[\s*\]|\[x\])\s*/, '').trim();
          
          // ค้นหาคะแนนในวงเล็บ เช่น (2) แนะนำยาลดความดัน -> score = 2, text = แนะนำยาลดความดัน
          const scoreMatch = cleanText.match(/^\((\d+)\)\s*(.*)$/);
          let score = 1;
          let itemText = cleanText;
          
          if (scoreMatch) {
            score = parseInt(scoreMatch[1]);
            itemText = scoreMatch[2].trim();
          }
          
          // ใช้ simpleHash แทน CryptoJS เพื่อป้องกันไลบรารีขาดหาย
          const itemId = 'chk_' + simpleHash(itemText).substring(0, 10);
          
          checklist.push({
            id: itemId,
            text: itemText,
            score: score,
            group: currentGroup,
            checked: false
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
        const liHtml = parseParagraphToHtml(child.asParagraph());
        noteHtml += `<li>${liHtml}</li>`;
      } else if (type === DocumentApp.ElementType.TABLE) {
        noteHtml += parseTableToHtml(child.asTable());
      }
    }
  }
  
  return {
    scenario: scenario.trim(),
    patientInfoHtml: patientInfoHtml,
    contentHtml: contentHtml,
    checklist: checklist,
    noteHtml: noteHtml
  };
}

/**
 * ฟังก์ชันย่อยแปลงย่อย่อหน้าใน Doc เป็น HTML (รองรับการแปลงรูปภาพฝังในตัวอักษร)
 */
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
      const text = child.asText().getText();
      html += escapeHtml(text);
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
  let html = '<div class="table-responsive"><table class="table-patient-info">';
  const numRows = table.getNumRows();
  
  for (let r = 0; r < numRows; r++) {
    const row = table.getRow(r);
    html += '<tr>';
    const numCells = row.getNumCells();
    
    for (let c = 0; c < numCells; c++) {
      const cell = row.getCell(c);
      const text = cell.getText().trim();
      const tag = r === 0 ? 'th' : 'td'; // แถวแรกเป็น Header
      html += `<${tag}>${escapeHtml(text)}</${tag}>`;
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
    const sheet = ss.getSheetByName(CONFIG.sheets.courseGroups);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        const headers = data[0];
        const rows = data.slice(1);
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
      courseGroup: c.courseGroup,
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
    const headers = ['caseId', 'title', 'category', 'courseGroup', 'disease', 'difficulty', 'docId', 'author', 'createdDate', 'isActive'];
    sheetLib.appendRow(headers);
    
    // ใส่ 3 เคสมาตรฐาน
    DEFAULT_CASES.forEach(c => {
      sheetLib.appendRow([c.caseId, c.title, c.category, c.courseGroup, c.disease, c.difficulty, c.docId, c.author, c.createdDate, c.isActive]);
    });
    results.push('สร้างชีท CaseLibrary และเพิ่ม 3 เคสมาตรฐานเรียบร้อย');
  } else {
    results.push('ชีท CaseLibrary มีอยู่แล้ว');
  }
  
  // 2. ตาราง CourseGroups
  let sheetGroups = ss.getSheetByName(CONFIG.sheets.courseGroups);
  if (!sheetGroups) {
    sheetGroups = ss.insertSheet(CONFIG.sheets.courseGroups);
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
    Product: '1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw',
    SAP: '1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg'
  };
  
  const results = [];
  
  // 1. เคส Product
  try {
    const doc = DocumentApp.openById(docIds.Product);
    const body = doc.getBody();
    body.clear();
    
    body.appendParagraph('[OSPE-PD001] Compounding — Cold Cream & Labeling').setHeading(DocumentApp.ParagraphHeading.HEADING_1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('- หมวด: Product');
    body.appendParagraph('- OSPE Main Group: การเตรียมยาเฉพาะราย (Compounding)');
    body.appendParagraph('- Station/Sub-topic: Cold Cream Preparation & Labeling');
    body.appendParagraph('- Course Group: Compounding - Topical');
    body.appendParagraph('- โรค/หัวข้อ: Dry Skin, Cold Cream');
    body.appendParagraph('- ระดับ: 2');
    body.appendParagraph('- ผู้เขียน: Fon');
    body.appendParagraph('- วันที่: 15/06/2026');
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('ท่านได้รับใบสั่งยาจากแพทย์ให้เตรียมตำรับ Cold Cream ปริมาณ 30 กรัม สำหรับผู้ป่วยเด็กโรคผิวหนังแห้ง (Atopic Dermatitis) โดยให้คำนวณสูตรตำรับ ชั่งตวงสารผสมเนื้อครีม และเขียนฉลากยาควบคุมพิเศษให้ครบถ้วนถูกต้องตามหลักวิชาชีพเภสัชกรรม (เวลาปฏิบัติการ 4 นาที)');
    
    body.appendParagraph('ข้อมูลผู้ป่วย').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    const tableData = [
      ['หัวข้อ', 'ข้อมูล'],
      ['ชื่อ-สกุล', 'เด็กชายปัญญา ดีเลิศ'],
      ['อายุ', '5 ปี'],
      ['โรคประจำตัว', 'Atopic Dermatitis (ผิวหนังอักเสบภูมิแพ้)'],
      ['ใบสั่งยา', 'Cold Cream 30 g apply to dry areas BID'],
      ['ประวัติแพ้ยา', 'NKDA (ไม่มีประวัติแพ้ยา)']
    ];
    body.appendTable(tableData);
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('## (กลุ่ม: การคำนวณและตั้งตำรับ)').setHeading(DocumentApp.ParagraphHeading.HEADING_3);
    body.appendListItem('☐ (2) คำนวณปริมาณสารสำคัญในสูตร Cold Cream 30 กรัม ได้ถูกต้อง (Mineral oil 15g, Beeswax 3.6g, Borax 0.24g, Water 7.56g)');
    body.appendListItem('☐ (1) ชั่งน้ำหนักบีกเกอร์และสารเคมีแต่ละชนิดด้วยเครื่องชั่ง 2 ตำแหน่งอย่างถูกต้อง');
    body.appendListItem('☐ (2) อธิบายขั้นตอนการผสมเฟสน้ำ (Aqueous phase) และเฟสน้ำมัน (Oily phase) ที่อุณหภูมิ 70 องศาเซลเซียส');
    body.appendListItem('☐ (1) คนผสมให้เข้ากันจนได้เนื้อครีมขาวเนียนสม่ำเสมอ');
    
    body.appendParagraph('## (กลุ่ม: การเขียนฉลากและจ่ายยา)').setHeading(DocumentApp.ParagraphHeading.HEADING_3);
    body.appendListItem('☐ (2) เขียนฉลากยาได้ถูกต้องครบถ้วน (ชื่อผู้ป่วย, วิธีใช้: ทาบริเวณผิวแห้งวันละ 2 ครั้ง, วันผลิต, วันหมดอายุ 14 วัน)');
    body.appendListItem('☐ (1) ติดฉลากแดง "ยาใช้ภายนอก ห้ามรับประทาน"');
    body.appendListItem('☐ (1) ส่งมอบยาพร้อมให้คำแนะนำการเก็บรักษายาที่อุณหภูมิห้อง หลีกเลี่ยงแสงแดด');
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('- สูตรมาตรฐาน Cold Cream (100g): Mineral oil 50g, Beeswax 12g, Spermaceti 12g, Sodium borate (Borax) 0.8g, Purified water 25.2g.');
    body.appendParagraph('- สำหรับ 30g: Mineral oil 15g, Beeswax 3.6g, Spermaceti 3.6g (หรือใช้วัตถุดิบอื่นทดแทน), Borax 0.24g, Water 7.56g.');
    body.appendParagraph('- การเก็บรักษา: ห้ามแช่แข็ง เก็บในภาชนะปิดสนิทป้องกันแสงแดดและความร้อนเพื่อป้องกันการแยกเฟส');
    
    results.push('เขียนข้อมูลเคส Product เรียบร้อย');
  } catch (e) {
    results.push('บิลด์เคส Product ล้มเหลว: ' + e.toString());
  }
  
  // 2. เคส SAP
  try {
    const doc = DocumentApp.openById(docIds.SAP);
    const body = doc.getBody();
    body.clear();
    
    body.appendParagraph('[OSPE-SP001] Pharmacy Law — ยาควบคุมพิเศษ').setHeading(DocumentApp.ParagraphHeading.HEADING_1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('- หมวด: SAP');
    body.appendParagraph('- OSPE Main Group: ความรู้เกี่ยวกับกฎหมายยา');
    body.appendParagraph('- Station/Sub-topic: Prescription Validation & Special Controlled Drugs');
    body.appendParagraph('- Course Group: Pharmacy Law');
    body.appendParagraph('- โรค/หัวข้อ: Special Controlled Drugs Regulation');
    body.appendParagraph('- ระดับ: 2');
    body.appendParagraph('- ผู้เขียน: Irene');
    body.appendParagraph('- วันที่: 15/06/2026');
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('ผู้ป่วยนำใบสั่งยาจากคลินิกเอกชนมาขอซื้อยา Lorazepam 2 mg ในร้านยาของท่าน ให้ท่านทำการตรวจสอบความถูกต้องทางกฎหมายของใบสั่งยา วิเคราะห์ประเภทของยาทางกฎหมาย และปฏิบัติตนตามข้อกำหนดของสำนักงานคณะกรรมการอาหารและยา (อย.) อย่างถูกต้อง (เวลาปฏิบัติการ 4 นาที)');
    
    body.appendParagraph('ข้อมูลผู้ป่วย').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    const tableData = [
      ['หัวข้อ', 'ข้อมูล'],
      ['ชื่อ-สกุล', 'นางสาวสมศรี มีสุข'],
      ['อายุ', '45 ปี'],
      ['โรคประจำตัว', 'Insomnia (นอนไม่หลับ)'],
      ['ใบสั่งยา', 'Lorazepam 2 mg (15 tablets) Take 1 tablet before bedtime'],
      ['ประวัติแพ้ยา', 'NKDA (ไม่มีประวัติแพ้ยา)']
    ];
    body.appendTable(tableData);
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('## (กลุ่ม: ความรู้กฎหมายและการควบคุม)').setHeading(DocumentApp.ParagraphHeading.HEADING_3);
    body.appendListItem('☐ (2) ระบุประเภททางกฎหมายของ Lorazepam ได้ถูกต้องว่าเป็น "วัตถุออกฤทธิ์ต่อจิตและประสาทประเภท 4"');
    body.appendListItem('☐ (2) ตรวจสอบใบสั่งยาและแจ้งผู้ป่วยว่า "ร้านขายยาแผนปัจจุบัน (ข.ย.1) ไม่สามารถจ่ายวัตถุออกฤทธิ์ประเภท 4 ตามใบสั่งยาแพทย์จากคลินิกได้"');
    body.appendListItem('☐ (2) แนะนำให้ผู้ป่วยไปรับยาที่โรงพยาบาลหรือสถานพยาบาลที่ได้รับอนุญาตครอบครองวัตถุออกฤทธิ์โดยตรง');
    body.appendListItem('☐ (1) อธิบายข้อกฎหมายที่ห้ามร้านขายยาทั่วไปจำหน่ายวัตถุออกฤทธิ์ประเภท 2 และ 4');
    
    body.appendParagraph('## (กลุ่ม: ทักษะจรรยาบรรณวิชาชีพ)').setHeading(DocumentApp.ParagraphHeading.HEADING_3);
    body.appendListItem('☐ (2) ปฏิเสธการขายยาอย่างสุภาพและแสดงความใส่ใจต่ออาการนอนไม่หลับของผู้ป่วย');
    body.appendListItem('☐ (1) บันทึกข้อมูลการให้คำแนะนำทางกฎหมายลงในแบบฟอร์มบันทึกการให้คำปรึกษาของร้านยา');
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
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
    const courseGroup = data['กลุ่มวิชา'] || data['Course Group'] || 'ทั่วไป';
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
    
    body.appendParagraph(`[${caseId}] ${title}`).setHeading(DocumentApp.ParagraphHeading.HEADING_1);
    
    body.appendParagraph('ข้อมูลเคส').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph(`- หมวด: ${category}`);
    body.appendParagraph(`- Course Group: ${courseGroup}`);
    body.appendParagraph(`- โรค/หัวข้อ: ${disease}`);
    body.appendParagraph(`- ผู้เขียน: สตาฟเตรียมสอบ`);
    body.appendParagraph(`- วันที่: ${new Date().toLocaleDateString('th-TH')}`);
    
    body.appendParagraph('โจทย์').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
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
            body.appendParagraph('รูปภาพประกอบข้อสอบ:').setHeading(DocumentApp.ParagraphHeading.HEADING_3);
            body.appendImage(imgBlob);
          }
        } catch (imgError) {
          Logger.log('ไม่สามารถดาวน์โหลดหรือแทรกภาพได้: ' + imgError.toString());
        }
      });
    }
    
    body.appendParagraph('Checklist').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph('## (กลุ่ม: การประเมินผล)').setHeading(DocumentApp.ParagraphHeading.HEADING_3);
    const checklistLines = checklistRaw.split('\n');
    checklistLines.forEach(line => {
      if (line.trim()) {
        const cleanLine = line.trim().startsWith('☐') || line.trim().startsWith('-') ? line.trim() : '☐ ' + line.trim();
        body.appendListItem(cleanLine);
      }
    });
    
    body.appendParagraph('หมายเหตุ / เฉลย').setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    body.appendParagraph(note);
    
    newDoc.saveAndClose();
    
    // 3. แนบข้อมูลเข้าไปในชีท CaseLibrary
    sheet.appendRow([
      caseId,
      title,
      category,
      courseGroup,
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
