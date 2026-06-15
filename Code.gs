/**
 * PLE-CC2 OSPE Practice System — Google Apps Script Backend
 * File: Code.gs
 * ========================================================
 * ติดตั้งใน script.google.com ของบัญชีที่มีสิทธิ์เข้าถึง Sheet และ Docs
 * เชื่อมกับ Sheet ID: 1Fuakz3nCXa7klgQznrtGUNVRvNp_g9BJRfWNHD0awxI
 * 
 * วิธีการใช้:
 * 1. วางโค้ดนี้ทั้งหมดลงใน Google Apps Script Editor
 * 2. กดปุ่ม Save และคลิก Deploy -> New Deployment -> Web App
 * 3. ตั้งค่า:
 *    - Execute as: Me (your-email@gmail.com)
 *    - Who has access: Anyone (เพื่อให้เว็บไซต์ดึงข้อมูลได้โดยไม่ต้องผ่าน Auth ซ้ำซ้อน)
 * 4. คัดลอก URL ของ Web App ไปใส่ในตัวแปร CONFIG.apiUrl ของเว็บไซต์
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
  return SpreadsheetApp.openById(CONFIG.spreadsheetId);
}

/**
 * ──────────────────────────────────────────────────────────────
 * 2. Case Library Functions
 * ──────────────────────────────────────────────────────────────
 */
function getCaseList(params = {}) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheets.caseLibrary);
  if (!sheet) {
    return { count: 0, cases: [], warning: 'Sheet CaseLibrary not found. Run setupSheets action first.' };
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { count: 0, cases: [] };
  
  const headers = data[0];
  const rows = data.slice(1);
  
  // แปลงเป็น Object
  let cases = rows.map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  }).filter(c => c.caseId && c.isActive !== false && c.isActive !== 'FALSE');
  
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
    cases: cases
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
      matchedCase.content = docData.contentHtml;
      matchedCase.checklist = docData.checklist;
      matchedCase.note = docData.noteHtml;
      matchedCase.patientInfo = docData.patientInfoHtml;
      matchedCase.scenario = docData.scenario;
    } catch (e) {
      matchedCase.content = `<p style="color: red;">ไม่สามารถโหลดเนื้อหาจาก Google Doc ได้: ${e.toString()}</p>`;
      matchedCase.checklist = [];
      matchedCase.note = '';
      matchedCase.error = e.toString();
    }
  } else {
    matchedCase.content = '<p>ไม่มีลิงก์เอกสาร Google Doc กำหนดไว้</p>';
    matchedCase.checklist = [];
  }
  
  return matchedCase;
}

/**
 * ──────────────────────────────────────────────────────────────
 * 3. Google Docs Parser (Core Engine)
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
    
    // 1. ตรวจสอบ Heading
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const text = child.asParagraph().getText().trim();
      const heading = child.asParagraph().getHeading();
      
      // ตรวจสอบ H1 หรือ H2 สำหรับแยกส่วน
      if (heading === DocumentApp.ParagraphHeading.HEADING_1 || 
          text.startsWith('## ') || 
          text.startsWith('# ')) {
        
        const cleanText = text.replace(/^#+\s*/, '').trim();
        if (cleanText.includes('ข้อมูลเคส')) {
          currentSection = 'METADATA';
        } else if (cleanText.includes('โจทย์')) {
          currentSection = 'SCENARIO';
        } else if (cleanText.includes('ข้อมูลผู้ป่วย')) {
          currentSection = 'PATIENT_INFO';
        } else if (cleanText.includes('Checklist')) {
          currentSection = 'CHECKLIST';
        } else if (cleanText.includes('หมายเหตุ') || cleanText.includes('เฉลย')) {
          currentSection = 'NOTE';
        } else {
          currentSection = 'OTHER';
        }
        continue;
      }
      
      // ตรวจสอบ H3 หรือกลุ่มใน Checklist
      if (currentSection === 'CHECKLIST' && 
          (heading === DocumentApp.ParagraphHeading.HEADING_2 || 
           heading === DocumentApp.ParagraphHeading.HEADING_3 || 
           text.startsWith('###') || 
           text.startsWith('**กลุ่ม:'))) {
        
        // ดึงชื่อกลุ่มย่อย เช่น ### (กลุ่ม: การให้คำแนะนำยา) -> การให้คำแนะนำยา
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
        const pText = child.asParagraph().getText().trim();
        if (pText) {
          scenario += pText + '\n';
          contentHtml += `<p class="scenario-text">${escapeHtml(pText)}</p>`;
        }
      }
    } 
    else if (currentSection === 'PATIENT_INFO') {
      if (type === DocumentApp.ElementType.TABLE) {
        patientInfoHtml += parseTableToHtml(child.asTable());
      } else if (type === DocumentApp.ElementType.PARAGRAPH) {
        const pText = child.asParagraph().getText().trim();
        if (pText) {
          patientInfoHtml += `<p>${escapeHtml(pText)}</p>`;
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
        
        // เช็คว่าเป็นบรรทัด Checklist หรือไม่
        // รองรับ: [ ] (2) ข้อความ หรือ ☐ (1) ข้อความ
        const isChecklistItem = text.startsWith('[ ]') || text.startsWith('[x]') || text.startsWith('☐') || text.startsWith('☑') || text.startsWith('-');
        
        if (isChecklistItem && text.length > 3) {
          // คลีนตัวหน้าออก เช่น [ ] (2) แนะนำ... -> (2) แนะนำ...
          let cleanText = text.replace(/^([-☐☑]|\[\s*\]|\[x\])\s*/, '').trim();
          
          // หาคะแนนจากในวงเล็บ เช่น (2) แนะนำ... -> score = 2, text = แนะนำ...
          const scoreMatch = cleanText.match(/^\((\d+)\)\s*(.*)$/);
          let score = 1;
          let itemText = cleanText;
          
          if (scoreMatch) {
            score = parseInt(scoreMatch[1]);
            itemText = scoreMatch[2].trim();
          }
          
          checklist.push({
            id: 'chk_' + CryptoJS.MD5(itemText).toString().substring(0, 10),
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
        const pText = child.asParagraph().getText().trim();
        if (pText) {
          noteHtml += `<p>${escapeHtml(pText)}</p>`;
        }
      } else if (type === DocumentApp.ElementType.LIST_ITEM) {
        const liText = child.asListItem().getText().trim();
        noteHtml += `<li>${escapeHtml(liText)}</li>`;
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
 * ฟังก์ชันย่อยแปลง Table ใน Doc เป็น HTML
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
function getCourseGroups(category = null) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheets.courseGroups);
  if (!sheet) {
    return { count: 0, groups: [], warning: 'Sheet CourseGroups not found.' };
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { count: 0, groups: [] };
  
  const headers = data[0];
  const rows = data.slice(1);
  
  let groups = rows.map(row => {
    return {
      name: row[0],
      category: row[1],
      description: row[2] || ''
    };
  }).filter(g => g.name);
  
  if (category && category !== 'All') {
    groups = groups.filter(g => g.category === category);
  }
  
  return {
    count: groups.length,
    groups: groups
  };
}

function getSystemStats() {
  const list = getCaseList();
  const groups = getCourseGroups();
  
  const stats = {
    totalCases: list.count,
    byCategory: { Clinic: 0, Product: 0, SAP: 0 },
    byCourseGroup: {}
  };
  
  list.cases.forEach(c => {
    if (stats.byCategory[c.category] !== undefined) {
      stats.byCategory[c.category]++;
    }
    if (c.courseGroup) {
      stats.byCourseGroup[c.courseGroup] = (stats.byCourseGroup[c.courseGroup] || 0) + 1;
    }
  });
  
  return {
    stats: stats,
    courseGroups: groups.groups
  };
}

/**
 * ──────────────────────────────────────────────────────────────
 * 5. Exam Simulation Engine
 * ──────────────────────────────────────────────────────────────
 */
function generateExamSet(options = {}) {
  const total = parseInt(options.totalStations) || 16;
  let clinicCount = parseInt(options.clinicCount) || CONFIG.defaultExamRatio.clinic;
  let productCount = parseInt(options.productCount) || CONFIG.defaultExamRatio.product;
  let sapCount = parseInt(options.sapCount) || CONFIG.defaultExamRatio.sap;
  
  // ปรับสัดส่วนตามสัดส่วนรวมถ้าไม่ได้ระบุค่าสลัด
  const sum = clinicCount + productCount + sapCount;
  if (sum !== total) {
    clinicCount = Math.round((clinicCount / sum) * total);
    productCount = Math.round((productCount / sum) * total);
    sapCount = total - clinicCount - productCount;
  }
  
  const allCases = getCaseList().cases;
  
  // ดึงเคสแยกตามหมวด
  const pool = {
    Clinic: shuffleArray(allCases.filter(c => c.category === 'Clinic')),
    Product: shuffleArray(allCases.filter(c => c.category === 'Product')),
    SAP: shuffleArray(allCases.filter(c => c.category === 'SAP'))
  };
  
  const selectedStations = [];
  const warnings = [];
  
  // ดึงตามเป้าหมาย
  const selectFromPool = (category, count) => {
    let picked = pool[category].slice(0, count);
    if (picked.length < count) {
      warnings.push(`จำนวนเคสหมวด ${category} มีไม่เพียงพอ (ต้องการ ${count} พบ ${picked.length})`);
    }
    return picked;
  };
  
  const clinicSelected = selectFromPool('Clinic', clinicCount);
  const productSelected = selectFromPool('Product', productCount);
  const sapSelected = selectFromPool('SAP', sapCount);
  
  // รวมเคส
  let combined = [...clinicSelected, ...productSelected, ...sapSelected];
  
  // ใส่สถานีสุ่ม
  combined = shuffleArray(combined);
  
  // ตั้งค่าเลขสถานี (1-16)
  const stations = combined.map((c, idx) => {
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
    examId: 'EXAM_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000),
    stations: stations,
    warnings: warnings,
    config: {
      total: stations.length,
      clinic: clinicSelected.length,
      product: productSelected.length,
      sap: sapSelected.length
    }
  };
}

/**
 * ──────────────────────────────────────────────────────────────
 * 6. Setup Sheets (สร้าง Database จำลองใน Sheet เปล่า)
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
    
    // ใส่ตัวอย่างเคส
    sheetLib.appendRow(['OSPE-CL001', 'Warfarin Counseling — AF ใหม่', 'Clinic', 'Anticoagulation', 'Atrial Fibrillation, Warfarin', 3, '1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g', 'Lin', '15/06/2026', 'TRUE']);
    results.push('สร้างชีท CaseLibrary และเพิ่มเคสตัวอย่างแรกเรียบร้อย');
  } else {
    results.push('ชีท CaseLibrary มีอยู่แล้ว');
  }
  
  // 2. ตาราง CourseGroups
  let sheetGroups = ss.getSheetByName(CONFIG.sheets.courseGroups);
  if (!sheetGroups) {
    sheetGroups = ss.insertSheet(CONFIG.sheets.courseGroups);
    sheetGroups.appendRow(['name', 'category', 'description']);
    
    // รายชื่อ 15 Course Groups เริ่มต้น
    const initialGroups = [
      ['Pharmacy Counseling', 'Clinic', 'การซักประวัติและให้คำแนะนำยาความรู้ทั่วไป'],
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
    results.push('สร้างชีท CourseGroups และลงทะเบียน 15 กลุ่มเบื้องต้นเรียบร้อย');
  } else {
    results.push('ชีท CourseGroups มีอยู่แล้ว');
  }
  
  // จัด Format แบนเนอร์กลับสู่หน้าแรก (ตามเกณฑ์ข้อกำหนด GEMINI.md ข้อ 3.5)
  decorateHomeBanners(ss);
  
  return {
    message: 'Setup Completed Successfully!',
    details: results
  };
}

/**
 * ตกแต่งปุ่มกลับหน้าแรกในทุกแผ่นงานย่อยยกเว้น Home Page ตามกฎ GEMINI.md
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
 * 7. Helpers
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

/**
 * MD5 implementation in Apps Script using Utilities (Crypto)
 */
const CryptoJS = {
  MD5: function(string) {
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, string, Utilities.Charset.UTF_8);
    let hexString = '';
    for (let i = 0; i < signature.length; i++) {
      let byteVal = signature[i];
      if (byteVal < 0) byteVal += 256;
      let byteString = byteVal.toString(16);
      if (byteString.length == 1) byteString = '0' + byteString;
      hexString += byteString;
    }
    return hexString;
  }
};
