# 💊 PLE-CC Practice Platform — RxCU Exam Preparation System
> **ระบบคลังข้อสอบและจำลองห้องสอบใบประกอบวิชาชีพเภสัชกรรม (PLE-CC1 & PLE-CC2)**  
> **คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย (RxCU84 & RxCU85)**  
> **Repository:** [PLE-CC-Practice-Web-Page](https://github.com/thanadolnar-png/PLE-CC-Practice-Web-Page.git)  
> **ผู้ดูแลโครงการ (Project Chair):** ธนดล (Maxnum) | ประธานโครงการเตรียมสอบใบประกอบวิชาชีพ ปีการศึกษา 2569

---

## 📑 สารบัญ (Table of Contents)
1. [บทนำและที่มาของโครงการ (Introduction & Background)](#1-บทนำและที่มาของโครงการ-introduction--background)
2. [สถาปัตยกรรมระบบ (System Architecture)](#2-สถาปัตยกรรมระบบ-system-architecture)
3. [โครงสร้างแฟ้มข้อมูลและไฟล์ (Project File Structure)](#3-โครงสร้างแฟ้มข้อมูลและไฟล์-project-file-structure)
4. [รายละเอียดการทำงานของแต่ละหน้าเว็บ (Page Specifications)](#4-รายละเอียดการทำงานของแต่ละหน้าเว็บ-page-specifications)
5. [ระบบฐานข้อมูลและ Data Pipeline (Database & Auto-Compilation)](#5-ระบบฐานข้อมูลและ-data-pipeline-database--auto-compilation)
6. [ระบบย่อยและฟีเจอร์เด่น (Key Features & Subsystems)](#6-ระบบย่อยและฟีเจอร์เด่น-key-features--subsystems)
7. [คู่มือการส่งต่องานและการบำรุงรักษา (Handover & Maintenance Guide)](#7-คู่มือการส่งต่องานและการบำรุงรักษา-handover--maintenance-guide)
8. [กฎระเบียบและข้อควรระวังสำคัญ (Rules & Critical Gotchas)](#8-กฎระเบียบและข้อควรระวังสำคัญ-rules--critical-gotchas)
9. [คณะทำงานโครงการ (Project Committee & Credits)](#9-คณะทำงานโครงการ-project-committee--credits)

---

## 1. บทนำและที่มาของโครงการ (Introduction & Background)

ระบบ **PLE-CC Practice Platform** พัฒนาขึ้นโดยคณะทำงานเตรียมสอบใบประกอบวิชาชีพเภสัชกรรม จุฬาฯ เพื่อเป็นศูนย์กลางการฝึกฝนและทบทวนบทเรียนสำหรับนิสิตเภสัชศาสตร์ จุฬาฯ ในการเตรียมตัวสอบวัดความรู้เพื่อขอขึ้นทะเบียนและรับใบอนุญาตเป็นผู้ประกอบวิชาชีพเภสัชกรรม (PLE: Pharmacy Licensing Examination) โดยครอบคลุมทั้ง 2 ขั้นตอน:

- **PLE-CC1 (MCQ - Multiple Choice Questions):** ข้อเขียนปรนัย 240 ข้อ (แบ่งเป็น 2 ชุด ชุดละ 120 ข้อ เวลาชุดละ 3 ชั่วโมง เกณฑ์ผ่าน 60%) สัดส่วน: Clinic 50%, Product 40%, SAP (Social & Administrative Pharmacy) 10%
- **PLE-CC2 (OSPE - Objective Structured Practical Examination):** การสอบทักษะทางปฏิบัติการ 14 สถานี (+ พัก 2 สถานี) สถานีละ 4 นาที เกณฑ์ผ่าน 80%

### เป้าหมายของแพลตฟอร์ม
1. **คลังสถานีสอบเสมือนจริง:** รวบรวมและจัดหมวดหมู่สถานีสอบ OSPE พร้อมโจทย์ สื่อรูปภาพ สารเคมี อุปกรณ์ เฉลยละเอียด และ Checklist เกณฑ์การให้คะแนน
2. **ระบบจำลองห้องสอบ (Exam Simulation):** รองรับทั้งการฝึกซ้อมเดี่ยว (Single Player) และการซ้อมสอบเป็นกลุ่ม (Multiplayer Room Synchronizer) พร้อมนาฬิกาจับเวลา 4 นาทีและระบบเสียงเตือนเหมือนสนามสอบจริง
3. **ระบบออฟไลน์สมบูรณ์แบบ (Offline First):** ผู้ใช้งานสามารถเปิดเว็บใช้งานได้ทันที แม้ไม่มีสัญญาณอินเทอร์เน็ต ด้วยสถาปัตยกรรม PWA และ Local Database Bundle
4. **สื่อการเรียนรู้ครบวงจร:** ผสานคลังคลิปวิดีโอสาธิตทักษะทางเภสัชกรรม (Video Library) และคู่มือทักษะเตรียมสอบ (PDF Handbook Reader)

---

## 2. สถาปัตยกรรมระบบ (System Architecture)

ระบบถูกออกแบบให้เป็น **Serverless & Offline-First Hybrid Architecture** เพื่อให้ประหยัดค่าใช้จ่าย ดูแลรักษาง่าย โหลดเร็วระดับมิลลิวินาที และไม่พึ่งพา Framework ที่ซับซ้อน:

```
[Google Docs] (เขียนโจทย์ สื่อภาพ เฉลย)
       │
       ▼
[Google Sheets: CaseLibrary] (ดัชนีเคส & Metadata)
       │
       ▼
[Python Compiler: compile_offline_db_python.py] (รัน Local ผ่าน Service Account)
       │
       ├───> case-data-offline.js (Metadata ทั้งหมด 350+ เคส)
       └───> case-details-offline.js (เนื้อหาเต็ม โจทย์ ภาพ สื่อ เฉลย Checklist)
       │
       ▼
[Frontend: Vanilla Web App]
├── HTML5 / CSS3 (Responsive Design รองรับมือถือ แท็บเล็ต เดสก์ท็อป)
├── app.js (BgmManager, State Management, Filters, Search)
├── sw.js (Service Worker แคชหน้าเว็บและไฟล์ออฟไลน์)
└── Deploy อัตโนมัติขึ้น GitHub Pages & Vercel
```

### จุดเด่นเชิงวิศวกรรม
- **Zero Heavy Framework:** ใช้ Vanilla JS + CSS Grid/Flexbox โหลดได้รวดเร็วทันที ไม่มีปัญหา Dependency ตกรุ่น
- **Headless CMS via Google Workspace:** ฝ่ายวิชาการสามารถพิมพ์เคสลงใน Google Docs และกรอกข้อมูลลง Google Sheets ได้สะดวก ไม่ต้องมีความรู้ด้านการเขียนโค้ด
- **Automated Pipeline:** รันคำสั่งคลิกเดียว (`compile_and_push.bat`) ระบบจะดึงข้อมูลทั้งหมดจาก Google Drive แปลงรูปภาพเป็น Optimized Base64 และสร้าง Bundle พร้อม Push ขึ้น Vercel ทันที

---

## 3. โครงสร้างแฟ้มข้อมูลและไฟล์ (Project File Structure)

```
PLE CC Webpage/
│
├── 📄 HTML Pages (หน้าเว็บหลัก)
│   ├── index.html                  # หน้าแดชบอร์ด ภาพรวมระบบ สถิติเคส และเมนูลัด
│   ├── case-library.html           # หน้ารายการเคส ค้นหา กรองหมวด กรองโรค และ Super Host View
│   ├── case-viewer.html            # หน้าดูเคสรายข้อ โจทย์ อุปกรณ์ Checklist เฉลย และโหมด Print
│   ├── exam-simulation.html        # หน้าจำลองการสอบเสมือนจริง จับเวลา 4 นาที และระบบซ้อมกลุ่ม
│   ├── video-library.html          # หน้าคลังคลิปวิดีโอสาธิตทักษะปฏิบัติการเภสัชกรรม
│   ├── handbook-library.html       # หน้าเปิดอ่านคู่มือและหนังสือทักษะ OSPE (PDF Reader)
│   ├── booking-room.html           # หน้าระบบจองห้องฝึกซ้อมสอบ
│   └── mock-story-tour.html        # ระบบนำชมและคู่มือแนะนำการสอบ
│
├── ⚙️ Scripts & Logic (การทำงานของระบบ)
│   ├── app.js                      # ตัวควบคุมหลัก: BGM Manager, Theme Switcher, Navigation, Search
│   ├── scratchpad.js               # โมดูลกระดาษทด กระดานวาดรูป และเครื่องคำนวณยาใน Case Viewer
│   ├── sw.js                       # Service Worker บริหารแคช PWA รองรับการใช้งานออฟไลน์
│   └── Code.gs                     # Google Apps Script Backend (สำรองสำหรับ Live Fetch)
│
├── 📦 Data Bundles (ฐานข้อมูลออฟไลน์)
│   ├── case-data-offline.js        # ข้อมูล Metadata รายชื่อเคส หมวดหมู่ กลุ่มวิชา ความยาก (JSON-in-JS)
│   ├── case-details-offline.js     # ข้อมูลเนื้อหาเต็ม (โจทย์, สารเคมี, รูปภาพ Base64, เฉลย, เกณฑ์คะแนน)
│   └── video-data.js               # ดัชนีคลิปวิดีโอสาธิตทักษะแยกตามหมวด
│
├── 🎨 Styling (การจัดรูปแบบและการแสดงผล)
│   └── style.css                   # สไตล์ชีทหลัก ดีไซน์โมเดิร์น Responsive พร้อม Print Media Queries
│
├── 🎵 Audio Assets (ไฟล์เสียงประกอบ)
│   ├── bgm-mahachula.mp3           # [Main Theme] เพลงมหาจุฬาลงกรณ์ (CU Chorus)
│   ├── bgm-shonichi.mp3            # [Theme 2] เพลง Shonichi วันแรก (CU Chorus ปฐมนิเทศ'69)
│   ├── bgm-ospe-susu.mp3           # [Theme 3] เพลง OSPE SUSU (RxCU)
│   ├── bgm-muan-muan.mp3           # [Theme 4] ดนตรีให้กำลังใจม่วนๆ
│   ├── freesound_...-bell-...mp3   # เสียงกระดิ่งแจ้งเตือนหมดเวลาสถานีสอบ (School Bell)
│   └── tiktok-*.mp3                # คลังเสียงเอฟเฟกต์และเสียงเตือน TikTok Meme (39 เสียง)
│
└── 🚀 Automation & Deployment (เครื่องมืออัตโนมัติ)
    ├── compile_and_push.bat        # สคริปต์ One-Click รวมข้อมูลจาก Sheets/Docs และ Push ขึ้น Git
    └── compile_offline_db.bat      # สคริปต์คอมไพล์ฐานข้อมูลอย่างเดียว
```

---

## 4. รายละเอียดการทำงานของแต่ละหน้าเว็บ (Page Specifications)

### 4.1 `index.html` (Dashboard & Portal)
- แสดงสรุปสถิติจำนวนเคสทั้งหมด แบ่งตามหมวดหมู่ (Clinic, Product, SAP)
- Quick Stats แสดงสัดส่วนสถานีตามข้อกำหนดเกณฑ์สอบ PLE-CC
- การ์ดทางลัดเข้าสู่ระบบต่างๆ: Case Library, Exam Simulation, Video Library, Handbook Reader
- ระบบเปลี่ยนธีม (Light / Dark Theme) และปุ่มควบคุมเพลง BGM ด้านบนขวา

### 4.2 `case-library.html` (Station Case Library)
- แสดงรายการเคสทั้งหมดในรูปแบบ Interactive Cards
- **ตัวกรองอัจฉริยะ (Multi-Filter):**
  - กรองตามหมวดหลัก: `ALL`, `CLINIC`, `PRODUCT`, `SAP`
  - กรองตาม Course Group (กลุ่มโรค/สาขา เช่น DM, HTN, Compounding, Counseling)
  - กรองตามระดับความยาก (⭐ Easy, ⭐⭐ Medium, ⭐⭐⭐ Hard)
  - ช่องค้นหาข้อความแบบเรียลไทม์ (Search by Title, Disease, Author, Case ID)
- **โหมดมุมมอง (View Mode Toggle):**
  - **Normal Mode:** มุมมองฝึกฝนทั่วไปสำหรับนิสิต
  - **Super Host Mode:** มุมมองพิเศษสำหรับผู้คุมสอบ/ผู้สอน แสดงเฉลยย่อและ Checklist ทันที

### 4.3 `case-viewer.html` (Interactive Case Study)
- **หน้าต่างเนื้อหาแบ่งเป็น 4 แท็บหลัก:**
  1. 📋 **โจทย์สถานี (Patient Scenario):** ข้อมูลผู้ป่วย, สถานการณ์จำลอง, คำสั่งสถานี
  2. 🧪 **สารเคมี/อุปกรณ์ (Station Materials):** รายการสารเคมี อุปกรณ์ พร้อมตารางภาพประกอบ
  3. 🎯 **เฉลยละเอียด (Key & Rationale):** เหตุผลการเลือกใช้ยา, การคำนวณ, Guideline ทางการแพทย์ที่ตรงกับข้อสอบ
  4. ✅ **Checklist การให้คะแนน (Scoring Rubric):** รายการเกณฑ์ตรวจประเมิน สามารถคลิกทำเครื่องหมายเพื่อประเมินตนเองได้
- **เครื่องมือเสริม:**
  - 📝 **Scratchpad:** กระดาษทดในตัวสำหรับคำนวณสูตรหรือจดบันทึกขณะทำโจทย์
  - 🖨️ **Print Button:** ปุ่มสั่งพิมพ์เฉพาะหน้าโจทย์สถานี จัดหน้ากระดาษแบบมาตรฐานข้อสอบจริงเพื่อนำไปพิมพ์ซ้อมในห้องแล็บ
  - 🔄 **Next/Previous Case:** ปุ่มเลื่อนไปเคสถัดไปตามลำดับหมวดวิชา

### 4.4 `exam-simulation.html` (OSPE Exam Simulator)
- **โหมดจำลองสอบเดี่ยว (Single Player):**
  - เลือกรอบการสอบ (14 หรือ 16 สถานี ตามสัดส่วน 50:40:10)
  - ระบบจับเวลาถอยหลัง 4 นาทีต่อสถานี พร้อมเตือนเมื่อเหลือ 1 นาทีสุดท้าย
  - ระบบพักสถานี (Rest Station 4 นาที)
- **โหมดซ้อมกลุ่ม (Multiplayer Room Synchronization):**
  - สามารถสร้างห้องสอบ (Host) หรือเข้าร่วมห้องสอบ (Join via Room Code)
  - ซิงค์เวลาเริ่มสอบและการเปลี่ยนสถานีพร้อมกันทั้งกลุ่ม
- **ระบบเสียงสนามสอบ (Exam Audio System):**
  - เสียงกระดิ่งมาตรฐาน (School Bell) สำหรับแจ้งเตือนหมดเวลาสถานี
  - ตัวเลือกเสียงเตือนแบบสนุกสนาน (TikTok Meme Audio 39 เสียง) เพื่อคลายความตึงเครียด
- **สรุปผลคะแนน:** คำนวณเปอร์เซ็นต์คะแนน Checklist และประเมินผลผ่านเกณฑ์ (Pass ≥ 80%)

### 4.5 `video-library.html` (Skill Demonstration Videos)
- แหล่งรวบรวมคลิปวิดีโอสาธิตทักษะจาก YouTube เช่น ทักษะการฉีดยาเบาหวาน, การใช้ยาสูดพ่นชนิดต่างๆ, การผสมยาเคมีบำบัด, การให้คำปรึกษาผู้ป่วย
- สามารถกดเล่นวิดีโอภายในหน้าเว็บได้ทันที (Inline Embed Player) พร้อมแท็กค้นหา

### 4.6 `handbook-library.html` (OSPE Handbook PDF Viewer)
- หน้าต่างสำหรับเปิดอ่านหนังสือทบทวนทักษะและคู่มือการสอบในรูปแบบ PDF
- รองรับการเปิดอ่านเอกสารประกอบและคู่มือเตรียมสอบที่อัปโหลดไว้ในระบบ

---

## 5. ระบบฐานข้อมูลและ Data Pipeline (Database & Auto-Compilation)

ฐานข้อมูลของระบบทำงานแบบสองชั้น โดยมี Google Workspace เป็นศูนย์กลางในการเขียนข้อมูล และใช้ Python Script ในการแปลงเป็นไฟล์ JavaScript สำหรับเว็บ:

### แหล่งข้อมูลหลัก
1. **Google Sheets Hub:** `1Fuakz3nCXa7klgQznrtGUNVRvNp_g9BJRfWNHD0awxI`
   - Tab **CaseLibrary:** เก็บ Metadata ทุกเคส (caseId, title, category, mainGroup, subTopic, disease, difficulty, docId, author, createdDate, isActive, source)
2. **Google Docs:** เก็บเนื้อหาเต็มของเคสตาม `docId` โดยใช้รูปแบบโครงสร้างหัวข้อชัดเจน

### การทำงานของ Python Compiler (`scripts/compile_offline_db_python.py`)
เมื่อสั่งรันสคริปต์ ระบบจะดำเนินการตามขั้นตอนดังนี้:
1. เชื่อมต่อ Google Drive และ Sheets ผ่าน Service Account (`gemini-sheets-editor-*.json`)
2. ค้นหาแถวหัวตาราง `caseId` แบบ Dynamic (รองรับกรณีที่มีแถวแบนเนอร์ด้านบน)
3. วนลูปอ่านข้อมูลเคสทั้งหมดที่ `isActive = TRUE`
4. ดึงเนื้อหาจาก Google Docs แปลงเป็น Clean HTML:
   - แปลงตารางเป็น Responsive HTML Table
   - จัดการลำดับ List/Bulleted items ให้มี Hierarchical Nesting (`<ul>/<ol>`) สวยงาม
   - แปลงรูปภาพในเอกสารเป็น Optimized Base64 Image
5. บันทึกข้อมูลออกมาเป็น 2 ไฟล์หลัก:
   - `case-data-offline.js`: เก็บ Metadata สำหรับหน้า Search และ Library
   - `case-details-offline.js`: เก็บเนื้อหาละเอียดสำหรับหน้า Viewer และ Exam
6. ปรับเลขเวอร์ชันฐานข้อมูล (`DB_VERSION_STR`) ใน `app.js` อัตโนมัติ

---

## 6. ระบบย่อยและฟีเจอร์เด่น (Key Features & Subsystems)

### 6.1 ระบบเครื่องเล่นเพลงพื้นหลัง (Background Music Player)
จัดการผ่านโมดูล `BgmManager` ใน `app.js` รองรับการเล่นเพลงแบบวนซ้ำ ปรับระดับเสียง และสลับเพลง:
- **ปุ่ม Floating Pill ด้านล่าง:** แสดงชื่อเพลง, แถบสถานะ, ปุ่มข้ามเพลง (⏭️), สไลเดอร์ปรับความดัง, และปุ่มปิด
- **ปุ่ม Quick Toggle บนแถบ Topbar:** เปิด/ปิดเสียงได้ด้วยคลิกเดียวจากทุกหน้า
- **เพลย์ลิสต์ปัจจุบัน:**
  1. `มหาจุฬาลงกรณ์ | CU Chorus (Main Theme)`
  2. `Shonichi วันแรก | CU Chorus`
  3. `OSPE SUSU (RxCU)`
  4. `ดนตรีให้กำลังใจม่วนๆ`

### 6.2 ระบบพิมพ์โจทย์สถานีเดี่ยว (Single Case Print Engine)
ใน `case-viewer.html` มีฟังก์ชันการพิมพ์ที่ถูกปรับแต่งด้วย `@media print`:
- ซ่อนแถบควบคุม, เมนู, ปุ่มกด, และแท็บเฉลย
- แสดงเฉพาะข้อมูลสถานี: รหัสเคส, ชื่อเคส, ข้อมูลผู้ป่วย, สถานการณ์, และรายการอุปกรณ์
- แสดง Badge หมวดวิชา (CLINIC / PRODUCT / SAP) บริเวณหัวกระดาษด้านขวาอย่างถูกต้อง
- จัดหน้ากระดาษแบบ Clean Paper Style สวยงามพร้อมสำหรับการจัดห้องสอบซ้อมจริง

### 6.3 ระบบป้องกันข้อมูลสูญหาย (Stale-While-Revalidate Sync)
ในกรณีที่มีการซิงค์ข้อมูลผ่าน Google Apps Script API หน้า `case-viewer.html` จะใช้ฟังก์ชัน Merge อัจฉริยะ:
- หากข้อมูลในเครื่องมีโครงสร้างที่สมบูรณ์กว่า (เช่น มีตารางรูปภาพ หรือมี Nested List) ระบบจะไม่ยอมให้ข้อมูลดิบจาก API เข้ามาเขียนทับ ช่วยป้องกันปัญหาข้อความกระตุกหรือรูปแบบเพี้ยน

---

## 7. คู่มือการส่งต่องานและการบำรุงรักษา (Handover & Maintenance Guide)

สำหรับคณะทำงานเตรียมสอบรุ่นถัดไป (RxCU รุ่นต่อไป) หรือผู้ที่เข้ามารับหน้าที่ต่อ ให้ปฏิบัติตามขั้นตอนดังนี้:

### 7.1 สิ่งที่ต้องเตรียม (Prerequisites)
1. **Node.js / Python 3.10+:** ติดตั้งในเครื่องคอมพิวเตอร์ของผู้ดูแล
2. **Git:** สำหรับดึงและอัปเดตโค้ดขึ้น GitHub
3. **Google Service Account Credentials:** ไฟล์ JSON กุญแจสำหรับการเข้าถึง Google Sheets/Docs API (วางไว้ในโฟลเดอร์หลักของโปรเจกต์)
4. **Vercel Account:** เชื่อมต่อกับ Repository เพื่อให้เกิด Continuous Deployment อัตโนมัติเมื่อ Push ขึ้น Branch `main`

### 7.2 ขั้นตอนการเพิ่มหรือแก้ไขเคสใหม่
1. เขียนเนื้อหาโจทย์สถานีลงใน Google Docs โดยแบ่งหัวข้อชัดเจน:
   - ข้อมูลสถานการณ์และผู้ป่วย
   - สารเคมีและอุปกรณ์ที่มีในสถานี
   - เฉลยและคำอธิบาย
   - Checklist เกณฑ์การให้คะแนน
2. นำ URL หรือ `docId` ของ Google Docs นั้นไปกรอกใน Google Sheet `CaseLibrary` พร้อมระบุข้อมูลหมวดวิชา, โรค, และผู้แต่ง
3. ดับเบิลคลิกไฟล์ **`compile_and_push.bat`**
4. รอระบบประมวลผลประมาณ 1–2 นาที ระบบจะคอมไพล์ข้อมูลและอัปโหลดขึ้น GitHub/Vercel ให้โดยอัตโนมัติ

### 7.3 การเปลี่ยนหรือเพิ่มเพลง BGM
1. นำไฟล์เพลงนามสกุล `.mp3` มาวางในโฟลเดอร์ `Website/PLE CC Webpage/`
2. เปิดไฟล์ `app.js` ไปที่ออบเจกต์ `BgmManager` (ประมาณบรรทัดที่ 195–210)
3. เพิ่มข้อมูลในอาเรย์ `tracks`:
   ```javascript
   tracks: [
     { id: 'song_id', name: 'ชื่อเพลงที่ต้องการแสดง', src: './ชื่อไฟล์.mp3' },
     ...
   ]
   ```
4. Commit และ Push ขึ้น GitHub

---

## 8. กฎระเบียบและข้อควรระวังสำคัญ (Rules & Critical Gotchas)

> [!WARNING]
> **ข้อพึงระวังขั้นวิกฤตในการจัดการข้อมูล:**

1. **ห้ามใช้เครื่องหมายดอกจัน (`**` หรือ `*`) ในเซลล์ Google Sheets:**
   เซลล์ใน Google Sheets แสดงผลเป็น Plain Text ไม่รองรับ Markdown หากใส่ดอกจันจะทำให้มีสัญลักษณ์ `**` ตกค้างรกสายตาในหน้าเว็บ ต้องใช้ข้อความสะอาดและใช้อิโมจิเป็นหัวข้อเท่านั้น
2. **แถวแบนเนอร์ "กลับสู่หน้าแรก" ใน Google Sheets:**
   ทุกแท็บใหม่ใน Google Sheets ต้องมีแถบแบนเนอร์กลับหน้าแรกที่แถวที่ 1 เสมอ (`=HYPERLINK("#gid=0", "🏠 กลับสู่หน้าแรก")`) สคริปต์คอมไพเลอร์ได้ถูกเขียนให้ค้นหาหัวตาราง `caseId` แบบ Dynamic แล้ว จึงไม่ต้องกังวลเรื่องตำแหน่งแถวเลื่อน
3. **การอ้างอิง Guideline ทางการแพทย์:**
   ต้องระบุชื่อทางการจริง (Official Full Title) ของแนวทางเวชปฏิบัติหรือเภสัชตำรับเท่านั้น ห้ามสร้างชื่อขึ้นมาเอง หากข้อใดไม่ชัดเจนให้ใส่ `[NEED_REVIEW]`
4. **การล้างแคชบราวเซอร์ (Cache Busting):**
   หลังจากการอัปเดตเว็บ หากพบว่าหน้าเว็บยังแสดงข้อมูลเดิม ให้ผู้ใช้กด `Ctrl + F5` (หรือล้าง Cache ของ Service Worker ใน Developer Tools) เพื่อให้เว็บดึงไฟล์ Bundle ใหม่ล่าสุด

---

## 9. คณะทำงานโครงการ (Project Committee & Credits)

- **ผู้อำนวยการและประธานโครงการ:**
  - **ธนดล (Maxnum) — RxCU84/85** | ประธานโครงการเตรียมสอบใบประกอบวิชาชีพ ปีการศึกษา 2569
- **ฝ่ายบริหารและจัดการ:**
  - **Poy (เลขานุการโครงการ)** | จดบันทึกและจัดโครงสร้างเอกสาร
  - **Title (เหรัญญิกโครงการ)** | วางแผนงบประมาณและสถิติต่างๆ
- **ฝ่ายวิชาการ PLE-CC1 (MCQ):**
  - **Lin** | สรุปเวชปฏิบัติและคลังข้อสอบ Clinic MCQ
  - **Fon** | วิเคราะห์ตำรับยาและข้อสอบ Product MCQ
- **ฝ่ายวิชาการ PLE-CC2 (OSPE):**
  - **Irene** | วางโครงสร้างภาพรวมและควบคุมคุณภาพสถานี OSPE
  - **Kratae** | จัดทำบทผู้ป่วยจำลองและเกณฑ์ Checklist Clinic OSPE
  - **Min** | จัดทำคู่มือสูตรตำรับและฉลากยา Product OSPE
- **ผู้สนับสนุนข้อมูล:**
  - ชมรมและคณาจารย์ คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
  - บทเพลงประจำสถาบัน: **CU Chorus** (มหาจุฬาลงกรณ์, Shonichi ปฐมนิเทศ'69)

---
*จัดทำขึ้นด้วยความมุ่งมั่นเพื่อความสำเร็จของนิสิตเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัยทุกคน 💊🏛️*  
*Last Updated: 2026-10-03*
