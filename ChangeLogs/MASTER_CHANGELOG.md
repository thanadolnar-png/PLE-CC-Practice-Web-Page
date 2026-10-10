# สารบัญประวัติการพัฒนาและแก้ไขระบบหลัก (Master ChangeLog Index)
โครงการเตรียมสอบใบประกอบวิชาชีพเภสัชกรรม (PLE-CC) ประจำปีการศึกษา 2569

เอกสารนี้รวบรวมประวัติการอัปเดตระบบในภาพรวม เรียงลำดับจากล่าสุดไปหาอดีต 
เพื่อให้สามารถตรวจสอบและติดตามการเปลี่ยนแปลงของทั้งโครงการได้อย่างรวดเร็ว

---

## ตารางสรุปประวัติการแก้ไขระบบ (Release Timeline)

| วันที่ (Date) | ช่วงเวลา | ขอบเขต / โมดูล | สรุปประเด็นการแก้ไขสำคัญ | ไฟล์บันทึกฉบับเต็ม |
|---|---|---|---|---|
| 2026-10-10 | 11:55 น. | Exam Simulation | ถอด UI Modal และเมนู Diagnostics ออกจากหน้าเว็บ 100% เปลี่ยนเป็น Headless Logger เบื้องหลัง และจัดเก็บบันทึกบน GitHub | [2026-10-10_Headless_Logging_And_UI_Clean.md](file:///c:/Users/thana/Desktop/PLE-CC/ChangeLogs/2026-10-10_Headless_Logging_And_UI_Clean.md) |
| 2026-10-09 | 17:30 น. | Exam Simulation, CSS | แก้ไขแถบเวลา iPad, รูปแบบคะแนน Checklist (1.1, 1.2 ไร้บวก/ลบ), เพิ่มระบบ Comment หลังสอบ | [2026-10-09_Exam_Simulation_Upgrades.md](file:///c:/Users/thana/Desktop/PLE-CC/ChangeLogs/2026-10-09_Exam_Simulation_Upgrades.md) |
| 2026-10-09 | 16:08 น. | Exam Simulation | รวมศูนย์การข้ามสถานี, ซิงค์เวลา และแยกคำตอบโหมด Carousel Rotation | [2026-10-09_Exam_Simulation_Upgrades.md](file:///c:/Users/thana/Desktop/PLE-CC/ChangeLogs/2026-10-09_Exam_Simulation_Upgrades.md) |
| 2026-10-09 | 15:50 น. | Exam Simulation | แก้ไข Station Adjuster, บั๊กรีเซ็ตเวลาจากการทดเวลา, เพิ่มระบบ PleDiagnostics ดักจับ Error | [2026-10-09_Exam_Simulation_Upgrades.md](file:///c:/Users/thana/Desktop/PLE-CC/ChangeLogs/2026-10-09_Exam_Simulation_Upgrades.md) |
| 2026-10-09 | 14:00 น. | Exam Simulation | ปรับปรุง restartSetup() ล้าง Session และ State อย่างเด็ดขาดเมื่อจบการสอบ | [2026-10-09_Exam_Simulation_Upgrades.md](file:///c:/Users/thana/Desktop/PLE-CC/ChangeLogs/2026-10-09_Exam_Simulation_Upgrades.md) |
| 2026-10-09 | 13:40 น. | Exam Simulation | ข้ามขั้นตอนการถามรหัสผ่าน (Passcode) ซ้ำซ้อนหลังห้องสอบออนไลน์เริ่มทำงาน | [2026-10-09_Exam_Simulation_Upgrades.md](file:///c:/Users/thana/Desktop/PLE-CC/ChangeLogs/2026-10-09_Exam_Simulation_Upgrades.md) |

---

## สรุปโมดูลที่อยู่ภายใต้การติดตามการแก้ไข
1. ระบบจำลองการสอบ OSPE (Website/PLE CC Webpage/exam-simulation.html)
   - โหมดสอบเดี่ยว (Solo Practice Mode)
   - โหมดห้องสอบมาตรฐานออนไลน์ (Standard Multiplayer)
   - โหมดโต๊ะสอบย่อย (Cohort Breakout Tables)
   - โหมดแลปกริ๊งหมุนเวียนฐานสอบ (Carousel Circuit Rotation)
   - ระบบพิมพ์รายงานผลการสอบ (OSPE Score & Checklist Report)
2. สไตล์และโครงสร้างการแสดงผล (Website/PLE CC Webpage/style.css)
   - การแสดงผลแบบ Responsive บนอุปกรณ์พกพา และ iPad/แท็บเล็ต
   - แถบจับเวลาตรึงบนสุด (Sticky Timer Bar)
   - ธีมสีระบบ (Dark / Light Theme)
3. คลังข้อสอบและเครื่องมือช่วยจำ (Case Library, Case Viewer, Quiz, Flashcards)
