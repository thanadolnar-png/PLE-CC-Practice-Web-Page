# PLE-CC2 OSPE Practice System — Google Apps Script
## รายการ Function ทั้งหมด (Function Index)

Owner: Maxnum (ธนดล) | PLE Chair 2569
File: Code.gs — ติดตั้งใน Google Apps Script
เชื่อมกับ: Google Sheet ID 1Fuakz3nCXa7klgQznrtGUNVRvNp_g9BJRfWNHD0awxI

---

## หมวดที่ 1 — Web App API (Entry Point)

| Function | รับ | ส่งคืน | หน้าที่ |
|----------|-----|--------|---------|
| doGet(e) | query params: action, ... | JSON response | จุดเข้าหลักของ Web App — รับ HTTP GET แล้ว route ไปยัง function ที่ถูกต้อง |
| buildResponse(data, statusCode) | object, number | ContentService JSON | ห่อข้อมูลเป็น JSON response พร้อม success, statusCode, generatedAt |

action ที่รองรับผ่าน doGet:
- ?action=ping — ทดสอบการเชื่อมต่อ
- ?action=getCaseList — ดึงรายการเคส (filter ได้)
- ?action=getCase&id=xxx — ดึงเคสเดี่ยวพร้อมเนื้อหา
- ?action=getCaseContent&docId=xxx — ดึง HTML จาก Google Doc โดยตรง
- ?action=getCourseGroups — ดึง Course Group ทั้งหมด
- ?action=getExamSet — สร้างชุดข้อสอบสุ่ม
- ?action=getStats — ดูสถิติระบบ

---

## หมวดที่ 2 — Case Library (จัดการคลังเคสจาก Google Sheet)

| Function | รับ | ส่งคืน | หน้าที่ |
|----------|-----|--------|---------|
| getCaseList(filters) | { category, courseGroup, disease, difficulty, search, limit } | { count, cases[] } | ดึงรายการเคสทั้งหมดจาก Sheet CaseLibrary พร้อม filter และ search |
| getCaseById(caseId) | string caseId | case object + content | ดึงเคสเดี่ยวด้วย ID พร้อมดึง HTML content จาก Google Doc |
| rowToCase(headers, row) | array[], array[] | case object | แปลงแถวข้อมูลจาก Sheet เป็น JavaScript object |

โครงสร้าง case object:
  caseId, title, category, courseGroup, disease, difficulty, docId, author, createdDate, tags, isActive

---

## หมวดที่ 3 — Google Docs Content Extraction (ดึงเนื้อหาจาก Docs)

| Function | รับ | ส่งคืน | หน้าที่ |
|----------|-----|--------|---------|
| getCaseContentFromDoc(docId) | string docId | { html, checklist[], metadata, wordCount, lastModified } | ฟังก์ชันหลัก — เปิด Doc แล้วดึงทุกอย่าง |
| getDocAsCleanHtml(docId) | string docId | HTML string | Export Doc เป็น HTML ผ่าน Drive API แล้ว clean |
| cleanDocHtml(rawHtml) | HTML string | clean HTML string | ลบ inline style ที่ Docs ใส่มา + เพิ่ม CSS class สำหรับ website |
| buildHtmlFromDoc(doc) | Document object | HTML string | Fallback — สร้าง HTML ด้วย DocumentApp ถ้า export ไม่ได้ |
| buildTableHtml(table) | Table element | HTML table string | แปลง Google Docs Table element เป็น HTML table |
| extractChecklistFromDoc(body) | Body element | [{ id, text, checked, section }] | ดึง checklist items จาก Doc (รองรับ [ ] / [x] และ native checkbox) |
| extractMetadataFromDoc(fullText) | string | { category, courseGroup, disease, difficulty, author, date } | ดึง metadata จาก section ## Metadata ตาม Template |

Format checklist ใน Google Docs ที่รองรับ:
  [ ] ข้อที่ยังไม่ทำ
  [x] ข้อที่ทำแล้ว
  ☐  Google Docs native checkbox (ยังไม่ check)
  ☑  Google Docs native checkbox (check แล้ว)

---

## หมวดที่ 4 — Course Groups (จัดการหมวดหมู่)

| Function | รับ | ส่งคืน | หน้าที่ |
|----------|-----|--------|---------|
| getCourseGroups(category) | string หรือ null | { count, groups[] } | ดึง Course Group จาก Sheet CourseGroups (filter ตาม category ได้) |
| getCourseGroupsFromCaseLibrary(category) | string หรือ null | { count, groups[] } | Fallback — ดึง unique courseGroup จาก CaseLibrary ถ้าไม่มี Sheet CourseGroups |

Course Groups ที่วางแผนไว้ (15 กลุ่ม):
  Clinic (7): Pharmacy Counseling, Hypertension, Diabetes Mellitus, Dyslipidemia, Asthma & COPD, Anticoagulation, Drug Information
  Product (5): Compounding-Oral, Compounding-Topical, Compounding-Sterile, Labeling & Dispensing, QA/QC
  SAP (3): Pharmacy Law, Health Economics, Research Methodology

---

## หมวดที่ 5 — Exam Simulation Engine (ระบบสร้างข้อสอบ)

| Function | รับ | ส่งคืน | หน้าที่ |
|----------|-----|--------|---------|
| generateExamSet(options) | { totalStations, clinicCount, productCount, sapCount, courseGroups[], diseases[], shuffle } | { examId, stations[], config, warnings[] } | สร้างชุดข้อสอบสุ่มพร้อม config และแจ้ง warning ถ้าเคสไม่พอ |
| pickRandomCases(category, count, courseGroupFilter[], diseaseFilter[]) | string, number, array, array | case array | เลือกเคสสุ่มจาก pool ตาม category + filter |

Default ratio (ตาม PLE-CC spec):
  Clinic  50% = 8 สถานี
  Product 40% = 6 สถานี
  SAP     10% = 2 สถานี
  รวม         = 16 สถานี / 4 นาทีต่อสถานี

---

## หมวดที่ 6 — Utility & Setup

| Function | รับ | ส่งคืน | หน้าที่ |
|----------|-----|--------|---------|
| getSystemStats() | — | { total, byCategory, byCourseGroup } | ดูสถิติภาพรวม — จำนวนเคสทั้งหมดแยกตาม category และ course group |
| getSheet(sheetName) | string | Sheet object | เปิด Sheet tab ตามชื่อ (throw error ถ้าไม่พบ) |
| shuffleArray(arr) | array | array (shuffled) | สุ่มลำดับ array ด้วย Fisher-Yates algorithm |
| generateExamId() | — | string | สร้าง unique exam ID เช่น EXAM_1718437200000_742 |
| escapeHtml(text) | string | string | escape HTML special characters |

Setup Functions (Run ครั้งเดียวตอนติดตั้ง):
| Function | หน้าที่ |
|----------|---------|
| setupSheets() | สร้าง Sheet tabs CaseLibrary + CourseGroups พร้อม header rows และ sample Course Groups 15 กลุ่ม |
| addSampleCase() | เพิ่มเคสตัวอย่าง 4 เคส (Clinic x2, Product x1, SAP x1) เพื่อทดสอบระบบ |

Test Functions (ใช้ทดสอบใน Apps Script Editor):
| Function | หน้าที่ |
|----------|---------|
| testGetCaseList() | ทดสอบดึงรายการเคส Clinic แล้ว print ใน Logger |
| testGenerateExamSet() | ทดสอบสร้างชุดข้อสอบ 16 สถานี แล้ว print config ออกมา |

---

## ภาพรวมระบบ (Architecture)

Website (HTML/JS)
    |
    | fetch(WEB_APP_URL + "?action=...")
    v
doGet(e)  <- Google Apps Script Web App
    |
    +- getCaseList()      <- Google Sheet "CaseLibrary"
    +- getCaseById()
    +- getCaseContentFromDoc()  <- Google Docs (docId)
    +- getCourseGroups()  <- Google Sheet "CourseGroups"
    +- generateExamSet()  <- สุ่มจาก CaseLibrary

---

สิ่งที่ต้องตัดสินใจก่อน Build:
1. Google Docs Template format — ใช้ [ ] / [x] หรือ native Docs checkbox?
2. Checklist grouping — แบ่ง section ตาม H2/H3 หรือแบบอื่น?
3. จำนวน Course Groups — 15 กลุ่มข้างต้นครอบคลุมพอไหม?
4. สัดส่วนสอบ — 8:6:2 (Clinic:Product:SAP) ถูกต้องตาม PLE-CC spec ไหม?

[LIVE LOG] 2026-06-15T13:37:00+07:00 | [PLE_CHAIR] | [Action: ORGANIZE] | [OSPE Script — Function README] | [Status: DRAFT]
