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
  adminPasscode: 'rxcu_ple_cc', // รหัสผ่านสำหรับป้องกันการ Sync และจัดการระบบใน Google Sheet
  sheets: {
    caseLibrary: 'CaseLibrary',
    mainGroups: 'MainGroups',
    settings: 'Settings',
    lobbyRooms: 'LobbyRooms'
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
    docId: '1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw',
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
    docId: '1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw',
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
          
        case 'getRoomStatus':
          return buildResponse(getRoomStatus(e.parameter.roomId));
          
        case 'updateRoomStatus':
          return buildResponse(updateRoomStatus(e.parameter.roomId, e.parameter));
          
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
  
  if (!matchedCase) {
    throw new Error('Case not found: ' + caseId);
  }
  
  // ดึงข้อมูล HTML และ Checklist จาก Google Doc
  if (matchedCase.docId) {
    try {
      const docData = getCaseContentFromDoc(matchedCase.docId, caseId);
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
function getCaseContentFromDoc(docId, targetCaseId) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  
  let currentSection = '';
  let scenario = '';
  let patientInfoHtml = '';
  let noteHtml = '';
  let contentHtml = '';
  
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
        if (currentSection === 'PATIENT_INFO') {
          patientInfoHtml += parseTableToHtml(table);
        } else if (currentSection === 'NOTE') {
          noteHtml += parseTableToHtml(table);
        }
      }
      continue;
    }
    
    // 2. ตรวจสอบย่อหน้าหัวข้อต่างๆ
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const p = child.asParagraph();
      const text = p.getText().trim();
      const heading = p.getHeading();
      
      // ค้นหาการประกาศเคสใหม่ในแบบข้อเขียน เช่น # [OSPE-CL001] หรือ [OSPE-CL001]
      const caseIdMatch = text.match(/^#+\s*\[(OSPE-[A-Z0-9]+)\]/) || text.match(/^\[(OSPE-[A-Z0-9]+)\]/);
      if (caseIdMatch) {
        const foundCaseId = caseIdMatch[1];
        if (foundCaseId === targetCaseId) {
          recording = true;
          hasFoundCase = true;
          currentSection = 'METADATA';
          continue;
        } else if (recording) {
          // เจอเคสถัดไปแล้ว สั่งตัดการบันทึก (Multi-case support)
          recording = false;
          break;
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
        } else if (cleanText.includes('Checklist') || cleanText.toLowerCase().includes('checklist') || cleanText.includes('\u0e17\u0e31\u0e01\u0e29\u0e30') || cleanText.includes('\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23') || cleanText.includes('\u0e40\u0e01\u0e13\u0e11') || cleanText.includes('\u0e1b\u0e23\u0e30\u0e40\u0e21\u0e34\u0e19') || cleanText.includes('\u0e2a\u0e21\u0e23\u0e23\u0e16\u0e19\u0e30')) {
          currentSection = 'CHECKLIST';
        } else if (cleanText.includes('หมายเหตุ') || cleanText.includes('เฉลย') || cleanText.includes('ข้อมูลผู้ตรวจ')) {
          currentSection = 'NOTE';
        } else {
          currentSection = 'OTHER';
        }
        continue;
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
      if (type === DocumentApp.ElementType.PARAGRAPH) {
        const paragraphHtml = parseParagraphToHtml(child.asParagraph());
        if (paragraphHtml) {
          contentHtml += paragraphHtml;
          scenario += child.asParagraph().getText().trim() + '\n';
        }
      }
    } 
    else if (currentSection === 'PATIENT_INFO') {
      if (type === DocumentApp.ElementType.PARAGRAPH) {
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
      html += `<li>${parseParagraphToHtml(child.asParagraph())}</li>`;
    }
  }
  return html;
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
    sheetLobby.appendRow(['roomId', 'caseId', 'hostRole', 'examineeName', 'examinerName', 'timerValue', 'timerRunning', 'checklistProgress', 'status', 'lastUpdated']);
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
    Product: '1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw',
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
    sheet.appendRow(['roomId', 'caseId', 'hostRole', 'examineeName', 'examinerName', 'timerValue', 'timerRunning', 'checklistProgress', 'status', 'lastUpdated']);
  }
  
  const roomId = params.roomId || String(Math.floor(1000 + Math.random() * 9000));
  const caseId = params.caseId || '';
  const hostRole = params.hostRole || 'examiner';
  const playerName = params.playerName || 'Host';
  
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
    sheet.getRange(foundRowIdx, 2, 1, 9).setValues([[caseId, hostRole, examineeName, examinerName, 240, 'FALSE', '', 'setup', timestamp]]);
  } else {
    sheet.appendRow([roomId, caseId, hostRole, examineeName, examinerName, 240, 'FALSE', '', 'setup', timestamp]);
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
        lastUpdated: data[i][9]
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
    { docId: '1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw', defaultCat: 'Product' },
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
    const body = doc.getBody();
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
        const caseIdMatch = text.match(/^#+\s*\[(OSPE-[A-Z0-9]+)\]\s*(.*)$/) || text.match(/^\[(OSPE-[A-Z0-9]+)\]\s*(.*)$/);
        
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
              
              if (nextText.match(/^#+\s*\[OSPE-[A-Z0-9]+\]/) || nextText.match(/^\[OSPE-[A-Z0-9]+\]/)) {
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

