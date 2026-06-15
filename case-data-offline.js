/**
 * PLE-CC2 OSPE Practice System — Offline Case Database (v3.2)
 * File: case-data-offline.js
 * ===================================================
 * ฐานข้อมูลสำรองสำหรับใช้งานเว็บไซต์แบบ Offline
 *
 * v3.2 — รวมข้อมูลเคสสอบปฏิบัติการครบถ้วนทั้ง 9 เคส (Clinic 3 / Product 3 / SAP 3)
 */

const OFFLINE_DATA = {cases:[
{
      "caseId": "OSPE-CL001",
      "title": "Warfarin Counseling — AF ใหม่",
      "category": "Clinic",
      "courseGroup": "Anticoagulation",
      "mainGroup": "การให้คำแนะนำยา",
      "subTopic": "Warfarin Counseling",
      "disease": "Atrial Fibrillation, Warfarin",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชาย อายุ 62 ปี วินิจฉัย Atrial Fibrillation ใหม่ แพทย์สั่ง Warfarin 3 mg วันละครั้ง ก่อนนอน คุณเป็นเภสัชกรที่ต้องให้คำแนะนำยาก่อนผู้ป่วยกลับบ้าน",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นายสมชาย ใจดี</td></tr>\n        <tr><td>อายุ</td><td>62 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>AF, HT, DM Type 2</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Warfarin 3mg OD, Metformin 500mg BD, Amlodipine 5mg OD</td></tr>\n        <tr><td>ค่า INR ล่าสุด</td><td>1.2 (วันนี้)</td></tr>\n        <tr><td>การแพ้ยา</td><td>NKDA (ไม่มีประวัติแพ้ยา)</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชาย อายุ 62 ปี วินิจฉัย Atrial Fibrillation ใหม่ แพทย์สั่ง Warfarin 3 mg วันละครั้ง ก่อนนอน คุณเป็นเภสัชกรที่ต้องให้คำแนะนำยาก่อนผู้ป่วยกลับบ้าน</p>",
      "checklist": [
            {
                  "id": "chk_cl1",
                  "text": "ทักทายผู้ป่วยและแนะนำตัวเองในฐานะเภสัชกร",
                  "score": 1,
                  "group": "การให้คำแนะนำยา",
                  "checked": false
            },
            {
                  "id": "chk_cl2",
                  "text": "ยืนยันชื่อ-สกุลและ HN ของผู้ป่วยเพื่อให้ถูกต้องตัว",
                  "score": 1,
                  "group": "การให้คำแนะนำยา",
                  "checked": false
            },
            {
                  "id": "chk_cl3",
                  "text": "อธิบายว่า Warfarin คือยาต้านการแข็งตัวของเลือด (ละลายลิ่มเลือด) และทำไมต้องใช้ในโรค AF (ป้องกันลิ่มเลือดอุดตันและอัมพาต)",
                  "score": 2,
                  "group": "การให้คำแนะนำยา",
                  "checked": false
            },
            {
                  "id": "chk_cl4",
                  "text": "อธิบายวิธีการกินยา: กิน 3mg วันละครั้ง ก่อนนอน ทุกวันในเวลาเดียวกัน",
                  "score": 2,
                  "group": "การให้คำแนะนำยา",
                  "checked": false
            },
            {
                  "id": "chk_cl5",
                  "text": "แนะนำความสำคัญของการเจาะเลือดตรวจค่า INR และบอกช่วงเป้าหมาย (Target INR = 2.0 - 3.0)",
                  "score": 2,
                  "group": "การให้คำแนะนำยา",
                  "checked": false
            },
            {
                  "id": "chk_cl6",
                  "text": "อธิบายอาการข้างเคียงเรื่องเลือดออกผิดปกติที่ต้องเฝ้าระวัง เช่น แปรงฟันเลือดออก จ้ำฟกช้ำตามตัว ถ่ายดำหรือปัสสาวะสีเข้ม",
                  "score": 2,
                  "group": "การแก้ปัญหาการใช้ยา",
                  "checked": false
            },
            {
                  "id": "chk_cl7",
                  "text": "แนะนำการกินอาหารที่มีวิตามินเคสูง (ผักใบเขียว บรอกโคลี) ว่าให้กินสม่ำเสมอเป็นประจำ ห้ามเพิ่มหรือลดฮวบฮาบ",
                  "score": 2,
                  "group": "การแก้ปัญหาการใช้ยา",
                  "checked": false
            },
            {
                  "id": "chk_cl8",
                  "text": "เน้นย้ำเรื่องการห้ามซื้อยาชุด ยาแก้ปวดแก้อักเสบกลุ่ม NSAIDs, Aspirin หรือยาสมุนไพรทานเองเด็ดขาด",
                  "score": 2,
                  "group": "การแก้ปัญหาการใช้ยา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>ข้อมูลและเฉลยสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li><strong>การจัดการเมื่อลืมกินยา:</strong> หากนึกได้ในวันนั้น ให้กินทันทีที่นึกได้ หากข้ามวันแล้ว ให้ข้ามมื้อนั้นไปเลยและกินมื้อถัดไปตามปกติ ห้ามเบิ้ลยาเด็ดขาด!</li>\n        <li><strong>ปฏิกิริยาระหว่างยา (Drug Interaction):</strong> ยาที่เพิ่มฤทธิ์ Warfarin (INR สูงขึ้น): Amiodarone, Fluconazole, Metronidazole, Omeprazole. ยาที่ลดฤทธิ์ Warfarin (INR ต่ำลง): Rifampicin, Carbamazepine, Phenobarbital.</li>\n        <li><strong>การปฏิบัติตัวเมื่อเกิดอุบัติเหตุ:</strong> หากมีแผลเล็กๆ ให้กดแผลแน่นๆ 5-10 นาที หากเลือดไม่หยุด หรือมีหัวกระแทกพื้น ให้รีบมาโรงพยาบาลทันที</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL002",
      "title": "Asthma Inhaler Counseling — MDI + Spacer",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Asthma Inhaler (MDI + Spacer)",
      "disease": "Asthma (Pediatric)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยเด็กหญิงอายุ 6 ปี วินิจฉัย Mild Persistent Asthma แพทย์จ่ายยา Fluticasone propionate MDI พ่นเช้า-เย็น และให้พ่นผ่าน Spacer ร่วมกับ Face mask เภสัชกรต้องสาธิตและแนะนำวิธีใช้แก่คุณแม่ของผู้ป่วยเด็ก",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>ด.ญ. มะลิ รักดี</td></tr>\n        <tr><td>อายุ</td><td>6 ปี (มาพร้อมคุณแม่)</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Asthma</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Fluticasone propionate MDI 125 mcg 1 puff bid, Salbutamol MDI 100 mcg 1-2 puffs prn for shortness of breath</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยเด็กหญิงอายุ 6 ปี วินิจฉัย Mild Persistent Asthma แพทย์จ่ายยา Fluticasone propionate MDI พ่นเช้า-เย็น และให้พ่นผ่าน Spacer ร่วมกับ Face mask เภสัชกรต้องสาธิตและแนะนำวิธีใช้แก่คุณแม่ของผู้ป่วยเด็ก</p>",
      "checklist": [
            {
                  "id": "chk_cl002_1",
                  "text": "ทักทายและแนะนำตัว ยืนยันผู้ป่วยและมารดา",
                  "score": 1,
                  "group": "การเตรียมตัวก่อนพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_2",
                  "text": "ตรวจสภาพกระบอกกักพ่นยา (Spacer) และหน้ากาก (Mask)",
                  "score": 1,
                  "group": "การเตรียมตัวก่อนพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_3",
                  "text": "ถอดฝาครอบเครื่องพ่นยา (MDI) เขย่าเครื่องพ่นในแนวตั้ง 3-4 ครั้ง",
                  "score": 1,
                  "group": "การเตรียมตัวก่อนพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_4",
                  "text": "เสียบปากหลอด MDI เข้ากับช่องท้ายของ Spacer",
                  "score": 1,
                  "group": "การเตรียมตัวก่อนพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_5",
                  "text": "ครอบหน้ากากให้แนบสนิทกับจมูกและปากของเด็ก ไม่มีช่องว่าง",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_6",
                  "text": "กดยา 1 ครั้ง เพื่อให้พ่นยาเข้าไปในกระบอกกัก",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_7",
                  "text": "ให้เด็กหายใจเข้า-ออกช้าๆ ลึกๆ ผ่านกระบอกกักพ่นยา 5-6 ครั้ง (หรือสังเกตการขยับของวาล์ว)",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_8",
                  "text": "หากต้องพ่นยาอีกครั้ง เว้นระยะห่างอย่างน้อย 1 นาที",
                  "score": 1,
                  "group": "ขั้นตอนการพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl002_9",
                  "text": "แนะนำให้มารดาพาน้องบ้วนปาก บ้วนคอ หรือเช็ดรอบใบหน้ากรณีใช้ Mask เพื่อป้องกันเชื้อราในช่องปาก",
                  "score": 2,
                  "group": "การดูแลรักษาและการป้องกันผลข้างเคียง",
                  "checked": false
            },
            {
                  "id": "chk_cl002_10",
                  "text": "วิธีทำความสะอาด Spacer: ล้างน้ำสบู่อ่อนๆ ผึ่งลมให้แห้ง ห้ามเช็ดถูเพื่อป้องกันไฟฟ้าสถิต",
                  "score": 1,
                  "group": "การดูแลรักษาและการป้องกันผลข้างเคียง",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>ยา ICS (Fluticasone) ต้องบ้วนปากหลังใช้อย่างเข้มงวด ป้องกันการเกิด Oral Candidiasis และเสียงแหบ</li>\n        <li>การเช็ดหน้าหลังครอบมาส์กช่วยป้องกันการแพ้ระคายเคือง/ผิวแห้งรอบปาก</li>\n        <li>Spacer ห้ามใช้ผ้าหรือกระดาษทิชชู่เช็ดภายในเด็ดขาดเพราะทำให้เกิดไฟฟ้าสถิตส่งผลให้ผงยาสูญเสียการเกาะติด</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL003",
      "title": "Insulin Pen Counseling — Lantus SoloSTAR",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Insulin Pen Counseling",
      "disease": "Diabetes Mellitus Type 2 (Insulin Glargine)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 45 ปี วินิจฉัย Type 2 DM ควบคุมระดับน้ำตาลไม่ได้ แพทย์เปลี่ยนการรักษาเป็นฉีด Lantus SoloSTAR (Insulin Glargine) 10 unit sc before bed เภสัชกรต้องสอนวิธีการใช้ปากกาฉีดยาและการเก็บรักษาที่ถูกต้อง",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย มั่นคง ดีงาม</td></tr>\n        <tr><td>อายุ</td><td>45 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Type 2 DM, Dyslipidemia</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Metformin 500mg 2 tab bid pc, Lantus SoloSTAR 10 unit sc before bed</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 45 ปี วินิจฉัย Type 2 DM ควบคุมระดับน้ำตาลไม่ได้ แพทย์เปลี่ยนการรักษาเป็นฉีด Lantus SoloSTAR (Insulin Glargine) 10 unit sc before bed เภสัชกรต้องสอนวิธีการใช้ปากกาฉีดยาและการเก็บรักษาที่ถูกต้อง</p>",
      "checklist": [
            {
                  "id": "chk_cl003_1",
                  "text": "ล้างมือให้สะอาด ตรวจสอบชื่อความแรงและวันหมดอายุของอินซูลิน",
                  "score": 1,
                  "group": "การเตรียมปากกาและยาฉีด",
                  "checked": false
            },
            {
                  "id": "chk_cl003_2",
                  "text": "เช็ดจุกยางปลายปากกาด้วยสำลีชุบแอลกอฮอล์ สวมเข็มฉีดยาเข้าตรงๆ",
                  "score": 1,
                  "group": "การเตรียมปากกาและยาฉีด",
                  "checked": false
            },
            {
                  "id": "chk_cl003_3",
                  "text": "ทดสอบความดันปากกา (Prime) โดยตั้ง 2 units หงายปลายปากกาขึ้น กดปุ่มจนตัวเลขเป็น 0 และมีน้ำยาออกที่ปลายเข็ม",
                  "score": 1,
                  "group": "การเตรียมปากกาและยาฉีด",
                  "checked": false
            },
            {
                  "id": "chk_cl003_4",
                  "text": "หมุนปุ่มตั้งขนาดยาตามแพทย์สั่ง คือ 10 units",
                  "score": 2,
                  "group": "ขั้นตอนการฉีดยา",
                  "checked": false
            },
            {
                  "id": "chk_cl003_5",
                  "text": "เลือกบริเวณฉีด (หน้าท้องห่างรอบสะดือ 2 นิ้วมือ) เช็ดแอลกอฮอล์ รอแห้ง",
                  "score": 2,
                  "group": "ขั้นตอนการฉีดยา",
                  "checked": false
            },
            {
                  "id": "chk_cl003_6",
                  "text": "ปักเข็มทำมุม 90 องศาลงผิวหนัง กดปุ่มฉีดจนสุดเลขกลับเป็น 0 ค้างไว้ 10 วินาทีเพื่อป้องกันยากลืนไหลย้อนกลับ",
                  "score": 2,
                  "group": "ขั้นตอนการฉีดยา",
                  "checked": false
            },
            {
                  "id": "chk_cl003_7",
                  "text": "ถอนเข็ม สวมฝาครอบใหญ่ของเข็มแล้วบิดออก ทิ้งในขวดพลาสติกหนาแช็ง",
                  "score": 1,
                  "group": "ขั้นตอนการฉีดยา",
                  "checked": false
            },
            {
                  "id": "chk_cl003_8",
                  "text": "การเก็บรักษา: ปากกาที่ยังไม่ใช้เก็บในตู้เย็นช่องธรรมดา (2-8 C), ปากกาที่เริ่มใช้แล้วเก็บอุณหภูมิห้อง ไม่เกิน 28 วัน (ห้ามแช่แข็ง)",
                  "score": 2,
                  "group": "การให้คำแนะนำการเก็บรักษาและอาการข้างเคียง",
                  "checked": false
            },
            {
                  "id": "chk_cl003_9",
                  "text": "แนะนำอาการข้างเคียงคือภาวะน้ำตาลต่ำ (Hypoglycemia): มือสั่น เหงื่อออก ใจสั่น วิธีแก้คือทานน้ำหวานหรือลูกอมทันที",
                  "score": 2,
                  "group": "การให้คำแนะนำการเก็บรักษาและอาการข้างเคียง",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การหมุนเปลี่ยนตำแหน่งฉีดเพื่อป้องกันการเกิด Lipodystrophy</li>\n        <li>หากพ้น 10 วินาทีก่อนถอนเข็มช่วยให้อินซูลินกระจายตัวดีและไม่ไหลย้อนกลับ</li>\n        <li>ภาวะน้ำตาลต่ำระดับเกณฑ์คือสับสน เหงื่อแตก ใจสั่น แก้ด้วยน้ำตาลทางปาก 15-20 กรัม</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL005",
      "title": "Insulin Vial & Syringe Counseling — การผสมและฉีดยาขุ่น-ใส",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Insulin Vial & Syringe Counseling",
      "disease": "Diabetes Mellitus Type 1 (Insulin Vial & Syringe)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยเด็กหญิงอายุ 12 ปี เพิ่งได้รับการวินิจฉัยเป็น Type 1 DM แพทย์สั่งจ่ายยาฉีด NPH insulin (ขุ่น) 14 unit และ Regular insulin (ใส) 6 unit ฉีดใต้ผิวหนังก่อนอาหารเช้า เภสัชกรต้องสาธิตและแนะนำวิธีเตรียมยาผสมระหว่างชนิดน้ำขุ่นและน้ำใสในกระบอกฉีดยาเดียวกัน รวมถึงวิธีการฉีดและการเก็บรักษาที่ถูกต้องแก่ผู้ปกครองของเด็ก",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>ด.ญ. กานดา รักเรียน</td></tr>\n        <tr><td>อายุ</td><td>12 ปี (มาพร้อมคุณแม่)</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Type 1 Diabetes Mellitus</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>NPH insulin 14 unit + Regular insulin 6 unit sc qam ac</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยเด็กหญิงอายุ 12 ปี เพิ่งได้รับการวินิจฉัยเป็น Type 1 DM แพทย์สั่งจ่ายยาฉีด NPH insulin (ขุ่น) 14 unit และ Regular insulin (ใส) 6 unit ฉีดใต้ผิวหนังก่อนอาหารเช้า เภสัชกรต้องสาธิตและแนะนำวิธีเตรียมยาผสมระหว่างชนิดน้ำขุ่นและน้ำใสในกระบอกฉีดยาเดียวกัน รวมถึงวิธีการฉีดและการเก็บรักษาที่ถูกต้องแก่ผู้ปกครองของเด็ก</p>",
      "checklist": [
            {
                  "id": "chk_cl005_1",
                  "text": "ล้างมือด้วยสบู่และน้ำให้สะอาด เช็ดมือให้แห้ง",
                  "score": 1,
                  "group": "การเตรียมขวดยาและการดูดอากาศ",
                  "checked": false
            },
            {
                  "id": "chk_cl005_2",
                  "text": "คลึงขวดยา NPH (ขุ่น) เบาๆ บนฝ่ามือทั้งสองข้างประมาณ 10 ครั้ง (ห้ามเขย่ารุนแรง)",
                  "score": 1,
                  "group": "การเตรียมขวดยาและการดูดอากาศ",
                  "checked": false
            },
            {
                  "id": "chk_cl005_3",
                  "text": "เปิดฝาครอบพลาสติกจุกยาง เช็ดจุกยางขวดยาทั้งสอง (ขุ่นและใส) ด้วยสำลีชุบแอลกอฮอล์ รอแห้ง",
                  "score": 1,
                  "group": "การเตรียมขวดยาและการดูดอากาศ",
                  "checked": false
            },
            {
                  "id": "chk_cl005_4",
                  "text": "ดึงก้านสูบของกระบอกฉีดดึงลมเข้ามา 14 unit (เท่าขนาด NPH) แทงเข็มฉีดอากาศเข้าขวด NPH แล้วดึงเข็มเปล่าออกโดยไม่ดูดยา",
                  "score": 1,
                  "group": "การเตรียมขวดยาและการดูดอากาศ",
                  "checked": false
            },
            {
                  "id": "chk_cl005_5",
                  "text": "ดึงลมเข้ามาในกระบอกฉีดอีก 6 unit (เท่าขนาด Regular) แทงเข็มฉีดอากาศเข้าขวด Regular (ใส)",
                  "score": 1,
                  "group": "การเตรียมขวดยาและการดูดอากาศ",
                  "checked": false
            },
            {
                  "id": "chk_cl005_6",
                  "text": "คว่ำขวด Regular (ใส) ลง ค่อยๆ ดูดยา Regular ให้ได้ขนาด 6 unit ตรวจและไล่ฟองอากาศให้เรียบร้อยแล้วดึงเข็มออก",
                  "score": 2,
                  "group": "ขั้นตอนการดูดยาผสม (ใสก่อนขุ่น)",
                  "checked": false
            },
            {
                  "id": "chk_cl005_7",
                  "text": "แทงเข็มเข้าขวด NPH (ขุ่น) คว่ำขวดลง แล้วค่อยๆ ดูดยา NPH เพิ่มเข้ามาอีก 14 unit จนขนาดยารวมในกระบอกเป็น 20 unit (ระวังห้ามดันแกนสูบดันยากลับเข้าขวด)",
                  "score": 2,
                  "group": "ขั้นตอนการดูดยาผสม (ใสก่อนขุ่น)",
                  "checked": false
            },
            {
                  "id": "chk_cl005_8",
                  "text": "ทำความสะอาดผิวหนังบริเวณที่จะฉีดด้วยสำลีชุบแอลกอฮอล์ รอให้แห้ง (เช่น หน้าท้องห่างรอบสะดือ 2 นิ้วมือ)",
                  "score": 2,
                  "group": "ขั้นตอนการฉีดและการดูแลรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl005_9",
                  "text": "หยิกดึงผิวหนังขึ้นเล็กน้อย แทงเข็มทำมุม 45-90 องศาอย่างรวดเร็ว กดก้านสูบช้าๆ จนสุดและค้างไว้ 5-10 วินาทีก่อนถอนเข็ม",
                  "score": 2,
                  "group": "ขั้นตอนการฉีดและการดูแลรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl005_10",
                  "text": "ถอนเข็มออกรวดเร็ว ใช้สำลีกดบริเวณรอยฉีดเบาๆ ห้ามนวดหรือคลึงเด็ดขาด",
                  "score": 1,
                  "group": "ขั้นตอนการฉีดและการดูแลรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl005_11",
                  "text": "แนะนำการเก็บรักษา: ขวดยังไม่ใช้เก็บในตู้เย็น (2-8 C), ขวดที่เปิดใช้แล้วเก็บที่อุณหภูมิห้องไม่เกิน 28 วัน ห้ามแช่แข็ง และเปลี่ยนตำแหน่งฉีดทุกครั้งห่างจากจุดเดิม 1 นิ้ว",
                  "score": 2,
                  "group": "ขั้นตอนการฉีดและการดูแลรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl005_12",
                  "text": "แนะนำอาการ Hypoglycemia (ใจสั่น เหงื่อออก ตัวสั่น สับสน) และการจัดการเบื้องต้น (ทานน้ำหวานหรือลูกอมทันที)",
                  "score": 2,
                  "group": "ขั้นตอนการฉีดและการดูแลรักษา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>ต้องอธิบายลำดับการผสมยาฉีดใส-ขุ่นอย่างเคร่งครัด: 'ดูดใสก่อนขุ่น' เสมอ เพื่อป้องกันไม่ให้ยาขุ่นปนเปื้อนเข้าไปในขวดน้ำใส ซึ่งจะทำให้ความคงตัวของยาใสเสียไป</li>\n        <li>ขั้นตอนการแทงเข็มและค้างไว้ 5-10 วินาที ช่วยให้มั่นใจว่าอินซูลินดูดซึมหมดและไม่ไหลย้อนกลับตามรอยเข็ม</li>\n        <li>ห้ามคลึงนวดเพราะจะทำให้ยาดูดซึมเร็วเกินไปจนน้ำตาลตกเฉียบพลัน</li>\n        <li>การหมุนเปลี่ยนตำแหน่งฉีดห่าง 1 นิ้ว เพื่อป้องกัน Lipodystrophy</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL006",
      "title": "Eye Drops Counseling — ยาหยอดตาชนิดมีหลอดหยดและไม่มีหลอดหยด",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Eye Drops (มีหลอดหยด / ไม่มีหลอดหยด)",
      "disease": "Dry Eyes & Glaucoma",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 55 ปี เป็นโรคต้อหินและตาแห้งรุนแรง แพทย์สั่งจ่ายยาหยอดตา Latanoprost (ขวดไม่มีหลอดหยด แยกฝาครอบปกติ) หยอดตาสองข้างวันละครั้งก่อนนอน และน้ำตาเทียมชนิดขวดมีหลอดหยดในตัว (แยกจุกหยอดได้) หยอดตาสองข้างวันละ 4 ครั้ง เภสัชกรต้องแนะนำขั้นตอนการหยอดตาทั้งสองแบบ และแนะนำการปฏิบัติตัวที่ถูกต้อง",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาง สมศรี รักสายตา</td></tr>\n        <tr><td>อายุ</td><td>55 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Open-angle Glaucoma, Dry Eyes</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Latanoprost eye drops 0.005% 1 drop od hs, Artificial tears 1 drop qid</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 55 ปี เป็นโรคต้อหินและตาแห้งรุนแรง แพทย์สั่งจ่ายยาหยอดตา Latanoprost (ขวดไม่มีหลอดหยด แยกฝาครอบปกติ) หยอดตาสองข้างวันละครั้งก่อนนอน และน้ำตาเทียมชนิดขวดมีหลอดหยดในตัว (แยกจุกหยอดได้) หยอดตาสองข้างวันละ 4 ครั้ง เภสัชกรต้องแนะนำขั้นตอนการหยอดตาทั้งสองแบบ และแนะนำการปฏิบัติตัวที่ถูกต้อง</p>",
      "checklist": [
            {
                  "id": "chk_cl006_1",
                  "text": "ล้างมือด้วยสบู่และน้ำให้สะอาด เช็ดให้แห้ง",
                  "score": 1,
                  "group": "การหยอดตาชนิดมีหลอดหยดแยก (น้ำตาเทียม)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_2",
                  "text": "คลายเกลียวหลอดหยดโดยยังไม่เอาออก บีบจุกยางเพื่อดูดยาเข้าหลอด",
                  "score": 1,
                  "group": "การหยอดตาชนิดมีหลอดหยดแยก (น้ำตาเทียม)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_3",
                  "text": "เงยหน้าขึ้น ดึงเปลือกตาล่างลงให้เป็นกระพุ้ง เหลือบตาขึ้นบน",
                  "score": 1,
                  "group": "การหยอดตาชนิดมีหลอดหยดแยก (น้ำตาเทียม)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_4",
                  "text": "หยอดยา 1 หยดลงในกระพุ้ง (ระวังปลายหลอดไม่สัมผัสตา ขนตา เปลือกตา มือ)",
                  "score": 1,
                  "group": "การหยอดตาชนิดมีหลอดหยดแยก (น้ำตาเทียม)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_5",
                  "text": "หลับตาเบาๆ 1-3 นาที ห้ามกะพริบตาถี่หรือบีบตาแรง ใส่หลอดหยดกลับขวดปิดสนิท",
                  "score": 1,
                  "group": "การหยอดตาชนิดมีหลอดหยดแยก (น้ำตาเทียม)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_6",
                  "text": "เปิดฝาครอบขวดออก วางหงายบนพื้นสะอาด (ห้ามวางคว่ำ ป้องกันสิ่งปนเปื้อน)",
                  "score": 1,
                  "group": "การหยอดตาชนิดไม่มีหลอดหยด (Latanoprost)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_7",
                  "text": "ถือขวดยาด้วยมือข้างที่ถนัด ดึงเปลือกตาล่างลงให้เป็นกระพุ้ง เหลือบตาขึ้นบน",
                  "score": 1,
                  "group": "การหยอดตาชนิดไม่มีหลอดหยด (Latanoprost)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_8",
                  "text": "บีบยา 1 หยดลงกระพุ้งเปลือกตา หลับตาเบาๆ 1-3 นาที ปิดฝาให้สนิท",
                  "score": 1,
                  "group": "การหยอดตาชนิดไม่มีหลอดหยด (Latanoprost)",
                  "checked": false
            },
            {
                  "id": "chk_cl006_9",
                  "text": "เว้นระยะห่างในการหยอดยาทั้งสองชนิดอย่างน้อย 5-10 นาที (ป้องกันยาล้างกันเอง)",
                  "score": 2,
                  "group": "คำแนะนำเพิ่มเติมและข้อควรระวัง",
                  "checked": false
            },
            {
                  "id": "chk_cl006_10",
                  "text": "ใช้นิ้วมือกดหัวตาเบาๆ (NLO) เป็นเวลา 3-5 นาทีหลังหยอด เพื่อลดรสขมคอและผลข้างเคียงต่อระบบร่างกาย",
                  "score": 2,
                  "group": "คำแนะนำเพิ่มเติมและข้อควรระวัง",
                  "checked": false
            },
            {
                  "id": "chk_cl006_11",
                  "text": "ถอดเลนส์สัมผัสออกก่อนหยอดยา และรออย่างน้อย 15 นาทีก่อนใส่เลนส์คืน",
                  "score": 1,
                  "group": "คำแนะนำเพิ่มเติมและข้อควรระวัง",
                  "checked": false
            },
            {
                  "id": "chk_cl006_12",
                  "text": "ยาหยอดตาหลังเปิดใช้แล้ว มีอายุไม่เกิน 1 เดือน หากมียาเหลือให้ทิ้งไป",
                  "score": 1,
                  "group": "คำแนะนำเพิ่มเติมและข้อควรระวัง",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การกดหัวตา (Nasolacrimal occlusion) สำคัญมากสำหรับยากลุ่มต้อหินเพื่อลดผลข้างเคียงเข้าสู่กระแสเลือด</li>\n        <li>ห้ามปลายขวด/หลอดหยดสัมผัสสิ่งใดๆ เพื่อป้องกันการติดเชื้อในดวงตา</li>\n        <li>การวางฝาขวดยาต้องวางหงายขึ้นเสมอ</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL007",
      "title": "Eye Ointment & Gel Counseling — ยาขี้ผึ้งและเจลป้ายตา",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Eye Ointment / Gel",
      "disease": "Bacterial Conjunctivitis (Chloramphenicol Eye Ointment)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 30 ปี มีอาการตาแดง อักเสบ และมีขี้ตามาก แพทย์วินิจฉัยเป็นเยื่อบุตาอักเสบจากเชื้อแบคทีเรีย สั่งจ่ายยาป้ายตา Chloramphenicol ป้ายตาสองข้างก่อนนอน เภสัชกรต้องสอนวิธีการป้ายตาที่ถูกต้องและข้อระวังการใช้งาน",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย ยินดี มีโชค</td></tr>\n        <tr><td>อายุ</td><td>30 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Bacterial Conjunctivitis</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Chloramphenicol eye ointment 1% apply to both eyes hs</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 30 ปี มีอาการตาแดง อักเสบ และมีขี้ตามาก แพทย์วินิจฉัยเป็นเยื่อบุตาอักเสบจากเชื้อแบคทีเรีย สั่งจ่ายยาป้ายตา Chloramphenicol ป้ายตาสองข้างก่อนนอน เภสัชกรต้องสอนวิธีการป้ายตาที่ถูกต้องและข้อระวังการใช้งาน</p>",
      "checklist": [
            {
                  "id": "chk_cl007_1",
                  "text": "ล้างมือให้สะอาด เช็ดให้แห้ง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาป้ายตา",
                  "checked": false
            },
            {
                  "id": "chk_cl007_2",
                  "text": "เปิดฝาครอบหลอดยา วางฝาหงายขึ้นบนพื้นราบที่สะอาด",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาป้ายตา",
                  "checked": false
            },
            {
                  "id": "chk_cl007_3",
                  "text": "นอนหงายหรือเงยหน้าขึ้น ดึงเปลือกตาล่างลงให้เป็นกระพุ้ง เหลือบตาขึ้นบน",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาป้ายตา",
                  "checked": false
            },
            {
                  "id": "chk_cl007_4",
                  "text": "บีบยาขี้ผึ้งเป็นเส้นยาวประมาณ 1 เซนติเมตร (หรือ 1/2 นิ้ว) ลงในกระพุ้งเปลือกตาล่าง",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาป้ายตา",
                  "checked": false
            },
            {
                  "id": "chk_cl007_5",
                  "text": "ระวังไม่ให้ปลายหลอดสัมผัสตา ขนตา เปลือกตา หรือสิ่งใดๆ เด็ดขาด",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาป้ายตา",
                  "checked": false
            },
            {
                  "id": "chk_cl007_6",
                  "text": "ปล่อยเปลือกตา หลับตาเบาๆ 1-3 นาที อาจกลอกตาไปมาเพื่อช่วยกระจายตัวยา",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาป้ายตา",
                  "checked": false
            },
            {
                  "id": "chk_cl007_7",
                  "text": "ปิดฝาหลอดยาให้สนิททันที (ห้ามล้างหรือเช็ดทำความสะอาดปลายหลอด)",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาป้ายตา",
                  "checked": false
            },
            {
                  "id": "chk_cl007_8",
                  "text": "แนะนำว่ายาขี้ผึ้งอาจทำให้ตาพร่ามัวชั่วคราวหลังป้าย ห้ามขับรถหรือทำงานกับเครื่องจักรจนกว่าจะมองเห็นชัดเจน (แนะนำให้ใช้ก่อนนอน)",
                  "score": 2,
                  "group": "ข้อระวังและคำแนะนำเพิ่มเติม",
                  "checked": false
            },
            {
                  "id": "chk_cl007_9",
                  "text": "กรณีต้องใช้ร่วมกับยาหยอดตา ให้หยอดยาหยอดตาก่อน รอ 10 นาที แล้วจึงป้ายยาขี้ผึ้งตาเป็นลำดับสุดท้าย",
                  "score": 1,
                  "group": "ข้อระวังและคำแนะนำเพิ่มเติม",
                  "checked": false
            },
            {
                  "id": "chk_cl007_10",
                  "text": "ห้ามใช้ยาร่วมกับผู้อื่น และยาป้ายตามีอายุ 1 เดือนหลังเปิดใช้",
                  "score": 1,
                  "group": "ข้อระวังและคำแนะนำเพิ่มเติม",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การป้ายยาขี้ผึ้งป้ายตาทีหลังยาหยอดตา เพราะยาขี้ผึ้งมีความหนืดสูง หากป้ายก่อนจะขัดขวางการดูดซึมของยาหยอดตา</li>\n        <li>การรักษาความสะอาดปลายหลอดสำคัญมาก ห้ามล้างน้ำเด็ดขาดเพราะทำให้ยาเสื่อมสภาพและปนเปื้อนเชื้อ</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL008",
      "title": "Ear Drops Counseling — ยาหยอดหู",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Ear Drops",
      "disease": "Otitis Externa (Ciprofloxacin Ear Drops)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 25 ปี มีอาการหูอักเสบและมีน้ำหนองไหล แพทย์สั่งจ่ายยาหยอดหู Ciprofloxacin + Dexamethasone เภสัชกรต้องแนะนำวิธีหยอดหู และการปฏิบัติตัวอย่างถูกต้อง",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย สมรัก ชนะภัย</td></tr>\n        <tr><td>อายุ</td><td>25 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Otitis Externa</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Ciprofloxacin/Dexamethasone ear drops 4 drops bid</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 25 ปี มีอาการหูอักเสบและมีน้ำหนองไหล แพทย์สั่งจ่ายยาหยอดหู Ciprofloxacin + Dexamethasone เภสัชกรต้องแนะนำวิธีหยอดหู และการปฏิบัติตัวอย่างถูกต้อง</p>",
      "checklist": [
            {
                  "id": "chk_cl008_1",
                  "text": "ล้างมือด้วยสบู่และน้ำสะอาด เช็ดหูภายนอกให้สะอาดและแห้งด้วยไม้พันสำลี",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาหยอดหู",
                  "checked": false
            },
            {
                  "id": "chk_cl008_2",
                  "text": "นอนตะแคงเอาหูข้างที่จะหยอดขึ้นด้านบน หรือนั่งเอียงศีรษะให้หูที่จะหยอดอยู่บน",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาหยอดหู",
                  "checked": false
            },
            {
                  "id": "chk_cl008_3",
                  "text": "ดึงใบหูให้ถูกทิศทาง: เคสผู้ใหญ่ ดึงใบหูไปด้านหลังและดึงขึ้นด้านบน (Up and Back) (ถ้าเด็ก ดึงไปด้านหลังและลงล่าง)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาหยอดหู",
                  "checked": false
            },
            {
                  "id": "chk_cl008_4",
                  "text": "หยอดยาเข้าไปในรูหูตามจำนวนที่กำหนด (4 หยด) ระวังปลายหลอดหยดไม่สอดลึกเข้าไปในรูหูหรือสัมผัสใบหู",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาหยอดหู",
                  "checked": false
            },
            {
                  "id": "chk_cl008_5",
                  "text": "นอนตะแคงในท่าเดิมอย่างน้อย 3-5 นาที (ห้ามลุกทันทีป้องกันยาไหลย้อนออก)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาหยอดหู",
                  "checked": false
            },
            {
                  "id": "chk_cl008_6",
                  "text": "ปิดฝาขวดยาหยอดหูให้สนิท",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาหยอดหู",
                  "checked": false
            },
            {
                  "id": "chk_cl008_7",
                  "text": "หากยาเก็บในตู้เย็น ก่อนใช้ให้คลึงขวดยาในอุ้งมือสักครู่ให้อุ่นใกล้เคียงอุณหภูมิร่างกาย ป้องกันอาการเวียนศีรษะ (Vertigo)",
                  "score": 2,
                  "group": "คำแนะนำเสริมการเก็บรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl008_8",
                  "text": "หากเป็นยาน้ำแขวนตะกอน ให้เขย่าขวดก่อนใช้ยาทุกครั้ง",
                  "score": 1,
                  "group": "คำแนะนำเสริมการเก็บรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl008_9",
                  "text": "เช็ดขอบรูหูและใบหูหลังหยอดยาเสร็จเรียบร้อย และห้ามใช้ไม้พันสำลีแยงลึกในรูหูหลังจากหยอดยา",
                  "score": 1,
                  "group": "คำแนะนำเสริมการเก็บรักษา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การหยอดยาที่เย็นเกินไปเข้าหูจะกระตุ้นระบบประสาทส่วนในทำให้เกิดอาการบ้านหมุน (Vertigo / Vestibular stimulation) รุนแรง จึงต้องทำให้ยาอุ่นเท่าอุณหภูมิร่างกายก่อน</li>\n        <li>การดึงใบหู Up & Back สำหรับผู้ใหญ่ช่วยให้รูหูเหยียดตรง ทำให้น้ำยาไหลลงไปได้ทั่วถึง</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL009",
      "title": "Nasal Spray Counseling — ยาพ่นจมูก",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Nasal Spray",
      "disease": "Allergic Rhinitis (Fluticasone Nasal Spray)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 28 ปี มีอาการแพ้อากาศ จาม คัดจมูก และน้ำมูกไหลต่อเนื่อง แพทย์จ่ายยาสเตียรอยด์พ่นจมูก Fluticasone propionate เภสัชกรต้องอธิบายการเตรียมพ่นยา ทิศทางการพ่นยา และข้อระวัง",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นางสาว จิตตรา สดชื่น</td></tr>\n        <tr><td>อายุ</td><td>28 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Allergic Rhinitis</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Fluticasone propionate nasal spray 120 sprays, พ่นจมูกข้างละ 1 ครั้ง วันละครั้งตอนเช้า</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 28 ปี มีอาการแพ้อากาศ จาม คัดจมูก และน้ำมูกไหลต่อเนื่อง แพทย์จ่ายยาสเตียรอยด์พ่นจมูก Fluticasone propionate เภสัชกรต้องอธิบายการเตรียมพ่นยา ทิศทางการพ่นยา และข้อระวัง</p>",
      "checklist": [
            {
                  "id": "chk_cl009_1",
                  "text": "กำจัดน้ำมูกออกจากจมูกให้หมด และล้างมือให้สะอาด",
                  "score": 1,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_2",
                  "text": "เขย่าขวด เปิดฝาครอบ (หากกดยาครั้งแรกหรือไม่ได้ใช้นาน ให้กดทดสอบพ่นในอากาศจนได้ละอองละเอียด)",
                  "score": 1,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_3",
                  "text": "นั่งตัวตรง ก้มศีรษะลงเล็กน้อย หายใจออกช้าๆ",
                  "score": 1,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_4",
                  "text": "ใช้หลักพ่นสลับข้าง: ใช้มือขวาจับยาพ่นรูจมูกซ้าย / มือซ้ายจับยาพ่นรูจมูกขวา",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_5",
                  "text": "สอดปลายพ่นลึก ~1 ซม. ชี้ปลายเอียงเฉียงออกไปทางผนังข้างจมูกด้านแก้ม (หันออกจากผนังกั้นช่องจมูกตรงกลาง)",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_6",
                  "text": "ใช้นิ้วมืออีกข้างกดปิดรูจมูกอีกฝั่งเบาๆ",
                  "score": 1,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_7",
                  "text": "กดปุ่มพ่นยา 1 ครั้ง พร้อมสูดหายใจเข้าช้าๆ ลึกๆ ทางจมูก เอาเครื่องออก กลั้นหายใจครู่หนึ่งแล้วผ่อนลมออกทางปาก",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_8",
                  "text": "ทำความสะอาดปลายพ่นด้วยกระดาษซับแห้ง และปิดฝาครอบ (ห้ามล้างน้ำ)",
                  "score": 1,
                  "group": "ขั้นตอนการพ่นจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl009_9",
                  "text": "ยาพ่นสเตียรอยด์จมูกต้องใช้สม่ำเสมอทุกวันอย่างต่อเนื่อง ไม่ใช่พ่นเฉพาะเมื่อมีอาการ",
                  "score": 1,
                  "group": "คำแนะนำเพิ่มเติม",
                  "checked": false
            },
            {
                  "id": "chk_cl009_10",
                  "text": "อาจรู้สึกขมคอได้บ้างหลังพ่นเนื่องจากจมูกและคอเชื่อมกัน ให้บ้วนปากหรือดื่มน้ำตามได้",
                  "score": 1,
                  "group": "คำแนะนำเพิ่มเติม",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การพ่นชี้ไปทางผนังด้านข้างจมูก (Lateral wall) เพื่อหลีกเลี่ยงการพ่นโดนผนังกั้นจมูกตรงกลาง (Nasal septum) ซึ่งอาจทำให้เยื่อบุบาง ระคายเคือง และเกิดเลือดกำเดาไหล (Epistaxis) ได้ง่าย</li>\n        <li>ยาสเตียรอยด์พ่นจมูกต้องการเวลา 3-7 วันจึงจะออกฤทธิ์เต็มที่ ต้องใช้อย่างต่อเนื่องสม่ำเสมอ</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL010",
      "title": "Nasal Drops Counseling — ยาหยอดจมูก",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Nasal Drops",
      "disease": "Severe Nasal Congestion (Oxymetazoline Nasal Drops)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 40 ปี มีอาการคัดจมูกรุนแรงเนื่องจากหวัด แพทย์สั่งจ่ายยาหยอดจมูกหดหลอดเลือด Oxymetazoline หยอดข้างละ 2-3 หยด วันละ 2 ครั้ง เภสัชกรต้องแนะนำวิธีหยอดที่ถูกต้องและข้อห้ามใช้เกินกำหนด",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาง นารี มีสุข</td></tr>\n        <tr><td>อายุ</td><td>40 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Acute Rhinitis (Cold)</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Oxymetazoline 0.05% nasal drops instil 2-3 drops into each nostril bid</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 40 ปี มีอาการคัดจมูกรุนแรงเนื่องจากหวัด แพทย์สั่งจ่ายยาหยอดจมูกหดหลอดเลือด Oxymetazoline หยอดข้างละ 2-3 หยด วันละ 2 ครั้ง เภสัชกรต้องแนะนำวิธีหยอดที่ถูกต้องและข้อห้ามใช้เกินกำหนด</p>",
      "checklist": [
            {
                  "id": "chk_cl010_1",
                  "text": "กำจัดน้ำมูกออกให้หมด ล้างมือให้สะอาด",
                  "score": 1,
                  "group": "ขั้นตอนการหยอดจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl010_2",
                  "text": "คลายเกลียวหลอดหยดและดูดยาเข้าไปในหลอดหยด",
                  "score": 1,
                  "group": "ขั้นตอนการหยอดจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl010_3",
                  "text": "นอนหงายให้ศีรษะยื่นพ้นขอบเตียง หรือหนุนหมอนรองไหล่ให้ศีรษะเงยไปด้านหลังมากที่สุด",
                  "score": 2,
                  "group": "ขั้นตอนการหยอดจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl010_4",
                  "text": "หยอดยาเข้าในรูจมูกตามจำนวน (2-3 หยด) ระวังปลายหลอดหยดสัมผัสโพรงจมูก",
                  "score": 2,
                  "group": "ขั้นตอนการหยอดจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl010_5",
                  "text": "นอนท่าเดิมต่อประมาณ 1-2 นาที เพื่อให้ยาซึมทั่วและไม่ไหลย้อนออกมาอย่างรวดเร็ว",
                  "score": 2,
                  "group": "ขั้นตอนการหยอดจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl010_6",
                  "text": "ปิดฝาขวดยาเก็บให้เรียบร้อย",
                  "score": 1,
                  "group": "ขั้นตอนการหยอดจมูก",
                  "checked": false
            },
            {
                  "id": "chk_cl010_7",
                  "text": "เน้นย้ำผู้ป่วย: ห้ามใช้ยาหยอดจมูกกลุ่มหดหลอดเลือดติดต่อกันเกิน 3-5 วัน เด็ดขาด เพราะจะเกิดภาวะคัดจมูกรุนแรงกว่าเดิม (Rebound Congestion / Rhinitis Medicamentosa)",
                  "score": 3,
                  "group": "คำเตือนสำคัญด้านความปลอดภัย",
                  "checked": false
            },
            {
                  "id": "chk_cl010_8",
                  "text": "ให้ใช้ยาเฉพาะเวลามีอาการคัดจมูกรุนแรงเท่านั้น และไม่ควรแบ่งปันยาร่วมกับผู้อื่น",
                  "score": 1,
                  "group": "คำเตือนสำคัญด้านความปลอดภัย",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>Rebound Congestion เป็นข้อควรระวังสำคัญที่สุดของยากลุ่ม Topical Nasal Decongestants (เช่น Oxymetazoline, Xylometazoline) หากฝ่าฝืนใช้ต่อเนื่องยาวนาน จะทำให้เยื่อบุจมูกบวมถาวรและดื้อต่อยา</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL011",
      "title": "MDI Inhaler Counseling — ยาสูดกำหนดขนาด",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "MDI Inhaler",
      "disease": "Asthma (Salbutamol MDI)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 35 ปี ได้รับวินิจฉัยเป็น Asthma มีอาการหอบหืดกำเริบเป็นครั้งคราว แพทย์สั่ง Salbutamol MDI สำหรับพ่นบรรเทาอาการ เภสัชกรต้องอธิบายและสาธิตขั้นตอนการพ่นยา MDI อย่างถูกต้องและครบถ้วน",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย ยอดชาย ใฝ่ดี</td></tr>\n        <tr><td>อายุ</td><td>35 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Asthma</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Salbutamol MDI 100 mcg per puff, พ่น 1-2 puffs prn for shortness of breath</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 35 ปี ได้รับวินิจฉัยเป็น Asthma มีอาการหอบหืดกำเริบเป็นครั้งคราว แพทย์สั่ง Salbutamol MDI สำหรับพ่นบรรเทาอาการ เภสัชกรต้องอธิบายและสาธิตขั้นตอนการพ่นยา MDI อย่างถูกต้องและครบถ้วน</p>",
      "checklist": [
            {
                  "id": "chk_cl011_1",
                  "text": "เปิดฝาครอบปากกระบอกพ่นยา ตรวจสอบสิ่งปนเปื้อนภายใน",
                  "score": 1,
                  "group": "การเตรียมตัวก่อนพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl011_2",
                  "text": "ถือหลอดพ่นในแนวตั้ง เขย่าหลอดพ่นแรงๆ 3-4 ครั้ง",
                  "score": 1,
                  "group": "การเตรียมตัวก่อนพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl011_3",
                  "text": "หายใจออกทางปากช้าๆ ให้สุดเต็มที่",
                  "score": 1,
                  "group": "การเตรียมตัวก่อนพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl011_4",
                  "text": "นำปากกระบอกมาอมให้สนิทริมฝีปาก เม้มปากให้แน่น (หรืออ้าปากห่างปากกระบอก 3-4 ซม./2 นิ้วมือ) และเงยหน้าขึ้นเล็กน้อย",
                  "score": 1,
                  "group": "ขั้นตอนการสูดพ่นยา MDI",
                  "checked": false
            },
            {
                  "id": "chk_cl011_5",
                  "text": "เริ่มหายใจเข้าช้าๆ และลึกๆ ทางปาก พร้อมๆ กับกดที่พ่นยาลง 1 ครั้ง",
                  "score": 2,
                  "group": "ขั้นตอนการสูดพ่นยา MDI",
                  "checked": false
            },
            {
                  "id": "chk_cl011_6",
                  "text": "สูดลมหายใจต่อจนสุด เอาหลอดพ่นออกจากปาก หุบปากสนิท",
                  "score": 2,
                  "group": "ขั้นตอนการสูดพ่นยา MDI",
                  "checked": false
            },
            {
                  "id": "chk_cl011_7",
                  "text": "กลั้นหายใจค้างไว้ 10 วินาที (หรือนานที่สุดเท่าที่ทำได้) แล้วผ่อนลมหายใจออกช้าๆ",
                  "score": 2,
                  "group": "ขั้นตอนการสูดพ่นยา MDI",
                  "checked": false
            },
            {
                  "id": "chk_cl011_8",
                  "text": "หากต้องพ่นยาอีกครั้ง เว้นระยะห่างจากครั้งแรกอย่างน้อย 1-2 นาที ค่อยพ่น puffs ที่สอง",
                  "score": 1,
                  "group": "ขั้นตอนหลังการพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl011_9",
                  "text": "เช็ดปากกระบอกยาด้วยกระดาษซับแห้งให้สะอาด ปิดฝาครอบปากกระบอก",
                  "score": 1,
                  "group": "ขั้นตอนหลังการพ่นยา",
                  "checked": false
            },
            {
                  "id": "chk_cl011_10",
                  "text": "แนะนำให้บ้วนปากกลั้วคอด้วยน้ำสะอาดทุกครั้งหลังพ่นเสร็จเพื่อป้องกันปากคอแห้ง (และเน้นย้ำมากหากใช้ยาสูดสเตียรอยด์ป้องกันเชื้อรา)",
                  "score": 2,
                  "group": "ขั้นตอนหลังการพ่นยา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การพ่นยาต้องสอดประสานกัน (Coordination) ระหว่างการกดยากับการเริ่มหายใจเข้าช้าๆ ลึกๆ</li>\n        <li>การกลั้นหายใจ 10 วินาที ช่วยให้ละอองยาตกตะกอนในหลอดลมและปอดได้ดีขึ้น ไม่ลอยย้อนกลับออกมาขณะหายใจออก</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL012",
      "title": "MDI with Spacer Counseling — กระบอกกักพ่นยา",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "MDI with Spacer",
      "disease": "Asthma (Fluticasone + Spacer)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยเด็กหญิงอายุ 5 ปี วินิจฉัย Mild Persistent Asthma แพทย์สั่งจ่ายยาสเตียรอยด์สูดพ่น Fluticasone MDI พ่นเช้า-เย็น ผ่านกระบอกกักพ่นยา (Spacer) ชนิดมีหน้ากาก เภสัชกรต้องแนะนำวิธีใช้และการดูแลแก่คุณแม่ของเด็ก",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>ด.ญ. มะลิ อารมณ์ดี</td></tr>\n        <tr><td>อายุ</td><td>5 ปี (มารดามารับยา)</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Asthma</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Fluticasone propionate MDI 50 mcg 1 puff bid via Spacer</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยเด็กหญิงอายุ 5 ปี วินิจฉัย Mild Persistent Asthma แพทย์สั่งจ่ายยาสเตียรอยด์สูดพ่น Fluticasone MDI พ่นเช้า-เย็น ผ่านกระบอกกักพ่นยา (Spacer) ชนิดมีหน้ากาก เภสัชกรต้องแนะนำวิธีใช้และการดูแลแก่คุณแม่ของเด็ก</p>",
      "checklist": [
            {
                  "id": "chk_cl012_1",
                  "text": "ถอดฝาครอบ MDI และเขย่า MDI ในแนวตั้ง 3-4 ครั้ง",
                  "score": 1,
                  "group": "การเตรียมเครื่องพ่นและกระบอกกัก",
                  "checked": false
            },
            {
                  "id": "chk_cl012_2",
                  "text": "เสียบปากหลอด MDI เข้ากับช่องเปิดยางท้ายของ Spacer",
                  "score": 1,
                  "group": "การเตรียมเครื่องพ่นและกระบอกกัก",
                  "checked": false
            },
            {
                  "id": "chk_cl012_3",
                  "text": "ถอดฝาครอบ Spacer ด้านที่ใช้อม/ครอบหน้ากาก ตรวจสอบความสะอาด",
                  "score": 1,
                  "group": "การเตรียมเครื่องพ่นและกระบอกกัก",
                  "checked": false
            },
            {
                  "id": "chk_cl012_4",
                  "text": "ครอบหน้ากาก (Face mask) ให้แนบสนิทกับจมูกและปากของเด็ก ไม่มีช่องว่างรอบหน้ากาก",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นยาผ่าน Spacer",
                  "checked": false
            },
            {
                  "id": "chk_cl012_5",
                  "text": "กดปุ่มกระบอกยา MDI 1 ครั้งเพื่อปล่อยละอองยาเข้าไปกักใน Spacer (ห้ามกดหลายครั้งพร้อมกัน)",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นยาผ่าน Spacer",
                  "checked": false
            },
            {
                  "id": "chk_cl012_6",
                  "text": "ให้เด็กหายใจเข้า-ออกช้าๆ ลึกๆ ผ่านกระบอกกัก 5-6 ครั้ง (หรือสังเกตการเคลื่อนของวาล์วหายใจ 10-15 วินาที)",
                  "score": 2,
                  "group": "ขั้นตอนการพ่นยาผ่าน Spacer",
                  "checked": false
            },
            {
                  "id": "chk_cl012_7",
                  "text": "เช็ดผิวหน้ารอบจมูกและปากเด็กหลังใช้ (กรณีครอบหน้ากาก) และให้บ้วนปากกลั้วคอด้วยน้ำสะอาดเพื่อป้องกันเชื้อราในช่องปาก",
                  "score": 2,
                  "group": "การทำความสะอาดและบำรุงรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl012_8",
                  "text": "วิธีล้าง Spacer: ถอดชิ้นส่วน ล้างน้ำสบู่อ่อนๆ ผึ่งลมให้แห้งเองตามธรรมชาติ ห้ามใช้ผ้า/กระดาษเช็ดถูด้านในเพื่อป้องกันไฟฟ้าสถิตกักผงยา",
                  "score": 2,
                  "group": "การทำความสะอาดและบำรุงรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl012_9",
                  "text": "หากต้องพ่นยาซ้ำ ให้เว้นห่าง 1 นาที และเริ่มทำใหม่ตั้งแต่ต้นทีละครั้ง",
                  "score": 1,
                  "group": "การทำความสะอาดและบำรุงรักษา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การครอบหน้ากากให้สนิทสำคัญมาก เพราะรูรั่วเล็กน้อยจะทำให้ละอองยาลอยหนีออกไปหมด</li>\n        <li>การเช็ดถูด้านในกระบอกกักพ่นยาจะทำให้ผนังพลาสติกเกิดประจุไฟฟ้าสถิต (Electrostatic charge) ดึงดูดผงยาให้เกาะติดข้างกระบอก แทนที่จะลอยเข้าปอดผู้ป่วย</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL013",
      "title": "Turbuhaler — ยาสูดชนิดผงแห้ง",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Turbuhaler (DPI)",
      "disease": "Asthma / COPD (Budesonide/Formoterol Turbuhaler)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 50 ปี วินิจฉัย Moderate Asthma แพทย์สั่งจ่ายยาควบคุม Symbicort Turbuhaler สูดพ่นเช้า-เย็น เภสัชกรต้องอธิบายขั้นตอนการหมุนบรรจุยาและการสูดยาแห้งอย่างถูกต้อง",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย มนูญ รักดี</td></tr>\n        <tr><td>อายุ</td><td>50 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Asthma</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Symbicort Turbuhaler (Budesonide 160 mcg / Formoterol 4.5 mcg) 1 puff bid</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 50 ปี วินิจฉัย Moderate Asthma แพทย์สั่งจ่ายยาควบคุม Symbicort Turbuhaler สูดพ่นเช้า-เย็น เภสัชกรต้องอธิบายขั้นตอนการหมุนบรรจุยาและการสูดยาแห้งอย่างถูกต้อง</p>",
      "checklist": [
            {
                  "id": "chk_cl013_1",
                  "text": "หมุนเปิดฝาครอบครอบนอกของ Turbuhaler ออกตามแนวตั้ง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Turbuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl013_2",
                  "text": "ถือเครื่องพ่นยาในลักษณะตั้งตรง (ปากกระบอกชี้ขึ้นด้านบน) เสมอขณะกดยา",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Turbuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl013_3",
                  "text": "หมุนฐานล่างสีแดงไปทางขวา (ทวนเข็ม) จนสุด แล้วหมุนกลับมาทางซ้าย (ตามเข็ม) จนได้ยินเสียง 'คลิก'",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Turbuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl013_4",
                  "text": "หายใจออกทางปากให้สุดเต็มที่ ห้ามพ่นลมหายใจเข้าไปในเครื่องพ่น",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Turbuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl013_5",
                  "text": "อมปากกระบอกยาให้แน่นสนิทริมฝีปาก สูดหายใจเข้าทางปากอย่างรวดเร็ว แรง และลึก",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Turbuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl013_6",
                  "text": "เอาเครื่องออกจากปาก หุบปากสนิท กลั้นหายใจอย่างน้อย 10 วินาที แล้วผ่อนลมหายใจออกช้าๆ",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Turbuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl013_7",
                  "text": "เช็ดทำความสะอาดปากกระบอกด้วยกระดาษซับแห้ง ปิดฝาครอบนอกให้แน่น",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Turbuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl013_8",
                  "text": "กลั้วในปากและคอด้วยน้ำสะอาดแล้วบ้วนทิ้งทุกครั้ง เพื่อป้องกันการเกิดเชื้อราในช่องปาก (Oral Candidiasis) และเสียงแหบ",
                  "score": 2,
                  "group": "การดูแลตนเองหลังสูดยา",
                  "checked": false
            },
            {
                  "id": "chk_cl013_9",
                  "text": "ห้ามนำเครื่องไปล้างน้ำ และห้ามเป่าลมหายใจเข้าเครื่องเพราะผงยาจะชื้นและจับตัวเป็นก้อนอุดตัน",
                  "score": 1,
                  "group": "การดูแลตนเองหลังสูดยา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>Symbicort มีส่วนผสมของยาสเตียรอยด์ (Budesonide) จึงต้องบ้วนปากทุกครั้ง</li>\n        <li>หากไม่ถือเครื่องในแนวตั้งตรงขณะหมุนฐานยา ปริมาณผงยาที่ตกลงในช่องสูดอาจคลาดเคลื่อนไม่ครบตามขนาด</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL014",
      "title": "Accuhaler — ยาสูดชนิดผงแห้ง",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Accuhaler (DPI)",
      "disease": "Asthma / COPD (Fluticasone/Salmeterol Accuhaler)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 45 ปี แพทย์สั่งจ่ายยา Seretide Accuhaler สูดพ่นวันละ 2 ครั้ง เช้า-เย็น เภสัชกรต้องอธิบายวิธีเลื่อนบรรจุยาและสูดผงยาในแนวราบอย่างถูกต้อง",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาง กานดา ทะเลงาม</td></tr>\n        <tr><td>อายุ</td><td>45 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Asthma</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Seretide Accuhaler 250 (Fluticasone 250 mcg / Salmeterol 50 mcg) 1 puff bid</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 45 ปี แพทย์สั่งจ่ายยา Seretide Accuhaler สูดพ่นวันละ 2 ครั้ง เช้า-เย็น เภสัชกรต้องอธิบายวิธีเลื่อนบรรจุยาและสูดผงยาในแนวราบอย่างถูกต้อง</p>",
      "checklist": [
            {
                  "id": "chk_cl014_1",
                  "text": "ถือเครื่อง Accuhaler ในแนวราบขนานกับพื้น วางนิ้วหัวแม่มือบนร่องเปิด ดันร่องเปิดออกไปจนสุดจะเห็นปากกระบอกและตัวเลื่อน",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Accuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl014_2",
                  "text": "ถือเครื่องขนานพื้น ดันแกนเลื่อน (lever) ออกไปทางด้านข้างจนสุดจนได้ยินเสียง 'คลิก' (ห้ามคว่ำหรือแกว่งเครื่องหลังจากนี้)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Accuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl014_3",
                  "text": "หายใจออกทางปากให้สุดหลีกเลี่ยงการพ่นลมใส่ปากกระบอกเครื่องพ่น",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Accuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl014_4",
                  "text": "ถือเครื่องแนวราบ อมปากกระบอกให้สนิท สูดลมหายใจเข้าทางปากอย่างรวดเร็ว แรง และลึก",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Accuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl014_5",
                  "text": "เอาเครื่องออกจากปาก กลั้นหายใจอย่างน้อย 10 วินาที แล้วผ่อนลมหายใจออกช้าๆ",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Accuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl014_6",
                  "text": "ปิดเครื่องโดยดันร่องเปิดเลื่อนกลับคืนตำแหน่งเดิมจนสุด (ตัวเลื่อนจะคืนกลับที่เดิมอัตโนมัติ)",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Accuhaler",
                  "checked": false
            },
            {
                  "id": "chk_cl014_7",
                  "text": "บ้วนปากและกลั้วคอด้วยน้ำสะอาดแล้วบ้วนทิ้งทุกครั้ง เพื่อป้องกันเชื้อราในปาก",
                  "score": 2,
                  "group": "ข้อระวังและตรวจเช็ค",
                  "checked": false
            },
            {
                  "id": "chk_cl014_8",
                  "text": "สังเกตจำนวนยาที่เหลือจากตัวเลขบอกขนาด (Dose Counter) บนตัวเครื่อง หากขึ้นเลข 0 แสดงว่ายาหมด",
                  "score": 1,
                  "group": "ข้อระวังและตรวจเช็ค",
                  "checked": false
            },
            {
                  "id": "chk_cl014_9",
                  "text": "ห้ามใช้ผ้าชุบน้ำหรือน้ำล้างเครื่องพ่นยาเด็ดขาด",
                  "score": 1,
                  "group": "ข้อระวังและตรวจเช็ค",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การเจาะยาแล้วแกว่งหรือคว่ำเครื่องจะทำให้ผงยาที่ร่วงออกมาตกลงพื้นหรือกระจายตัวสูญเสียปริมาตรสูดพ่น</li>\n        <li>ต้องเน้นย้ำเรื่องความแตกต่างระหว่าง MDI (สูดช้า ลึก) และ DPI (สูดเร็ว แรง ลึก)</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL015",
      "title": "Handihaler & Easyhaler & Swinghaler — DPI อื่น ๆ",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Handihaler & Easyhaler & Swinghaler",
      "disease": "COPD (Tiotropium Handihaler / Easyhaler)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 65 ปี วินิจฉัย Severe COPD แพทย์จ่ายยาสูด Spiriva Handihaler พ่นวันละครั้งตอนเช้า เภสัชกรต้องสาธิตและอธิบายขั้นตอนการบรรจุเม็ดแคปซูลยา การเจาะรู และการสูดยาอย่างละเอียด",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย สมชาย วัยเก๋า</td></tr>\n        <tr><td>อายุ</td><td>65 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>COPD</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Spiriva Handihaler (Tiotropium 18 mcg) 1 puff od am</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 65 ปี วินิจฉัย Severe COPD แพทย์จ่ายยาสูด Spiriva Handihaler พ่นวันละครั้งตอนเช้า เภสัชกรต้องสาธิตและอธิบายขั้นตอนการบรรจุเม็ดแคปซูลยา การเจาะรู และการสูดยาอย่างละเอียด</p>",
      "checklist": [
            {
                  "id": "chk_cl015_1",
                  "text": "ดึงเปิดฝาครอบนอกและเปิดปากกระบอกขึ้น",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_2",
                  "text": "แกะเม็ดแคปซูลยาออกจากแผงฟอยล์ (ห้ามกินเม็ดยาเด็ดขาด) ใส่ลงในช่องบรรจุตรงกลาง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_3",
                  "text": "ปิดปากกระบอกให้แน่นจนได้ยินเสียง 'คลิก' โดยยังคงเปิดฝานอกค้างไว้",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_4",
                  "text": "จับเครื่องตั้งตรง กดปุ่มเจาะยาด้านข้าง 1 ครั้งจนสุดแล้วปล่อย (ห้ามเขย่าหรือกดปุ่มกดยาซ้ำ)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_5",
                  "text": "หายใจออกทางปากให้สุด ห้ามหายใจเข้าหรือพ่นลมใส่ปากกระบอก",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_6",
                  "text": "อมปากกระบอกให้แน่น เงยหน้าเล็กน้อย สูดหายใจเข้าทางปาก เร็ว แรง และลึก (สังเกตเสียงสั่นสะเทือนของแคปซูลในเครื่อง)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_7",
                  "text": "เอาเครื่องออกจากปาก กลั้นหายใจอย่างน้อย 10 วินาที ผ่อนลมหายใจออกช้าๆ",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_8",
                  "text": "ทำซ้ำขั้นตอนการสูดพ่น (ข้อ 5-7) อีก 1 ครั้งทันที เพื่อให้แน่ใจว่าสูดยาออกจากแคปซูลหมด",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_9",
                  "text": "เปิดปากกระบอก เคาะเอาเปลือกแคปซูลเปล่าทิ้งลงถังขยะ ปิดปากกระบอกและฝาครอบ",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ Handihaler (เจาะแคปซูล)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_10",
                  "text": "ห้ามล้างเครื่อง Handihaler ด้วยน้ำ (หากล้างต้องผึ่งลมให้แห้งสนิท 24 ชั่วโมงก่อนใช้)",
                  "score": 1,
                  "group": "การเก็บรักษาและการพ่นแบบอื่น (Easyhaler/Swinghaler)",
                  "checked": false
            },
            {
                  "id": "chk_cl015_11",
                  "text": "ความรู้อุปกรณ์อื่น: Easyhaler ต้องเขย่าแนวดิ่ง กดบรรจุยา สูดเร็วแรงลึก, Swinghaler ต้องเขย่า ดันฐาน เจาะ และสูด",
                  "score": 1,
                  "group": "การเก็บรักษาและการพ่นแบบอื่น (Easyhaler/Swinghaler)",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การพ่นยา Handihaler ต้องพ่น 2 ครั้งต่อ 1 แคปซูลเสมอ เพื่อให้ยาหมดแคปซูลสมบูรณ์เนื่องจากแรงสูดผู้ป่วยโรคปอดอุดกั้นเรื้อรังมักไม่เพียงพอในการสูดครั้งเดียว</li>\n        <li>ย้ำเตือน ห้ามกลืนกินเม็ดแคปซูลยา Spiriva เด็ดขาด เพราะเป็นยาสำหรับสูดพ่นเท่านั้น</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL016",
      "title": "Suppository ทวารหนัก — ยาเหน็บทวาร",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Rectal Suppository",
      "disease": "Constipation (Bisacodyl Suppository)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 42 ปี มีอาการท้องผูกรุนแรงต่อเนื่อง 4 วัน แพทย์จ่ายยาเหน็บทวารหนัก Bisacodyl เหน็บเมื่อมีอาการ เภสัชกรต้องแนะนำขั้นตอนการเตรียมและสอดยาเหน็บทวารที่ถูกต้องและปลอดภัย",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาง มณี จิตดี</td></tr>\n        <tr><td>อายุ</td><td>42 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Constipation</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Bisacodyl suppository 10 mg rectal insertion prn for constipation</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 42 ปี มีอาการท้องผูกรุนแรงต่อเนื่อง 4 วัน แพทย์จ่ายยาเหน็บทวารหนัก Bisacodyl เหน็บเมื่อมีอาการ เภสัชกรต้องแนะนำขั้นตอนการเตรียมและสอดยาเหน็บทวารที่ถูกต้องและปลอดภัย</p>",
      "checklist": [
            {
                  "id": "chk_cl016_1",
                  "text": "อุจจาระและปัสสาวะให้เรียบร้อยก่อนใช้ยา ล้างมือให้สะอาดและเช็ดให้แห้ง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บทวารหนัก",
                  "checked": false
            },
            {
                  "id": "chk_cl016_2",
                  "text": "ตรวจสอบเม็ดยาเหน็บ: ถ้านิ่มให้แช่ตู้เย็นหรือแช่น้ำเย็นเพื่อให้ยาแข็งตัว สอดง่าย",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บทวารหนัก",
                  "checked": false
            },
            {
                  "id": "chk_cl016_3",
                  "text": "แกะกระดาษหรือพลาสติกห่อหุ้มยาออก (สามารถแตะน้ำสะอาดลูบเบาๆ เพื่อหล่อลื่นผิวได้)",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บทวารหนัก",
                  "checked": false
            },
            {
                  "id": "chk_cl016_4",
                  "text": "นอนตะแคงโดยให้ขาล่างเหยียดตรง และงอขาข้างที่อยู่ด้านบนให้หัวเข่าชิดอกมากที่สุด",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาเหน็บทวารหนัก",
                  "checked": false
            },
            {
                  "id": "chk_cl016_5",
                  "text": "ใช้นิ้วชี้สอดยาเหน็บเข้าทวารหนักโดยเอาด้านเรียวแหลมเข้าไปก่อน ดันเข้าลึกจนพ้นหูรูดทวารหนัก (ลึกประมาณ 1 ข้อนิ้ว)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาเหน็บทวารหนัก",
                  "checked": false
            },
            {
                  "id": "chk_cl016_6",
                  "text": "นอนในท่าตะแคงเดิมนิ่งๆ ต่อไปประมาณ 15-20 นาที เพื่อให้เม็ดยาละลายหมดและไม่ออกมา",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาเหน็บทวารหนัก",
                  "checked": false
            },
            {
                  "id": "chk_cl016_7",
                  "text": "ล้างมือด้วยสบู่และน้ำสะอาดหลังสอดยาเสร็จ",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บทวารหนัก",
                  "checked": false
            },
            {
                  "id": "chk_cl016_8",
                  "text": "เนื่องจากเป็นยาระบายชนิดออกฤทธิ์เร็ว ให้นอนในท่าเดิมจนกว่าจะทนไม่ได้จึงลุกไปถ่ายอุจจาระ หากถ่ายทันทีหลังเหน็บ ยาจะหลุดออกมาก่อนออกฤทธิ์",
                  "score": 2,
                  "group": "คำเตือนเพิ่มเติมสำหรับยาระบายเหน็บ",
                  "checked": false
            },
            {
                  "id": "chk_cl016_9",
                  "text": "ควรสังเกตวันหมดอายุ และเก็บยาในอุณหภูมิห้องที่ไม่ร้อนจัด หรือเก็บในตู้เย็นเพื่อไม่ให้ยาละลาย",
                  "score": 1,
                  "group": "คำเตือนเพิ่มเติมสำหรับยาระบายเหน็บ",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การดันยาข้ามหูรูดทวารหนัก (Anal sphincter) ป้องกันไม่ให้ยากล้ามเนื้อบีบตัวดันยาสะท้อนกลับออกมา</li>\n        <li>ยาเหน็บทวารระบาย Bisacodyl ออกฤทธิ์กระตุ้นการบีบตัวลำไส้ใหญ่ภายใน 15-60 นาที</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL017",
      "title": "ยาเหน็บช่องคลอด & ครีมช่องคลอด",
      "category": "Clinic",
      "courseGroup": "Special Devices",
      "mainGroup": "การให้คำแนะนำยาเทคนิคพิเศษ",
      "subTopic": "Vaginal Suppository / Cream",
      "disease": "Vaginal Candidiasis (Clotrimazole Vaginal)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 29 ปี มีอาการตกขาวผิดปกติสีขาวขุ่นคล้ายนมบูด มีอาการคันและแสบช่องคลอด แพทย์วินิจฉัยเป็นเชื้อราในช่องคลอด สั่งจ่ายยาเหน็บ Clotrimazole 100mg เหน็บติดต่อกัน 6 วัน เภสัชกรต้องแนะนำวิธีใช้ทั้งแบบใช้มือและแบบใช้เครื่องมือสอด",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นางสาว พรรณราย ชนะโรค</td></tr>\n        <tr><td>อายุ</td><td>29 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Vaginal Candidiasis</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Clotrimazole vaginal tablet 100 mg, เหน็บวันละ 1 เม็ดก่อนนอน นาน 6 วัน</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 29 ปี มีอาการตกขาวผิดปกติสีขาวขุ่นคล้ายนมบูด มีอาการคันและแสบช่องคลอด แพทย์วินิจฉัยเป็นเชื้อราในช่องคลอด สั่งจ่ายยาเหน็บ Clotrimazole 100mg เหน็บติดต่อกัน 6 วัน เภสัชกรต้องแนะนำวิธีใช้ทั้งแบบใช้มือและแบบใช้เครื่องมือสอด</p>",
      "checklist": [
            {
                  "id": "chk_cl017_1",
                  "text": "ปัสสาวะให้เรียบร้อยก่อนใช้ ล้างมือให้สะอาดและเช็ดให้แห้ง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บช่องคลอด",
                  "checked": false
            },
            {
                  "id": "chk_cl017_2",
                  "text": "แกะเม็ดยาออกจากห่อ จุ่มเม็ดยาลงในน้ำสะอาดเพียง 1-2 วินาทีพอให้ยาชื้นหล่อลื่นง่ายขึ้น",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บช่องคลอด",
                  "checked": false
            },
            {
                  "id": "chk_cl017_3",
                  "text": "นอนหงาย ชันเข่าขึ้นทั้งสองข้างและแยกขาออกกว้าง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บช่องคลอด",
                  "checked": false
            },
            {
                  "id": "chk_cl017_4",
                  "text": "กรณีใช้มือสอด: ใช้นิ้วชี้ดันยาเข้าช่องคลอดลึกที่สุดเท่าที่จะทำได้ เอาด้านมนเข้าก่อน",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาเหน็บช่องคลอด",
                  "checked": false
            },
            {
                  "id": "chk_cl017_5",
                  "text": "กรณีใช้เครื่องมือช่วยสอด: ดึงก้านสูบออกจนสุด ใส่ยาที่ปลาย สอดเครื่องมือเข้าช่องคลอดเบาๆ ลึกพอประมาณ ดันก้านสูบจนสุด แล้วดึงเครื่องมืออก",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาเหน็บช่องคลอด",
                  "checked": false
            },
            {
                  "id": "chk_cl017_6",
                  "text": "นอนในท่าเดิมนิ่งๆ ต่ออย่างน้อย 15 นาที (แนะนำให้เหน็บก่อนนอน)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาเหน็บช่องคลอด",
                  "checked": false
            },
            {
                  "id": "chk_cl017_7",
                  "text": "ล้างเครื่องมือช่วยสอดด้วยสบู่อ่อนและน้ำอุ่น ผึ่งลมให้แห้ง ล้างมือให้สะอาด",
                  "score": 1,
                  "group": "ขั้นตอนการใช้ยาเหน็บช่องคลอด",
                  "checked": false
            },
            {
                  "id": "chk_cl017_8",
                  "text": "ต้องใช้ยาติดต่อกันทุกวันจนครบตามแพทย์สั่ง (แม้ว่าประจำเดือนจะมาในระหว่างนั้นก็ห้ามหยุดใช้ยา ให้เหน็บต่อเนื่อง)",
                  "score": 2,
                  "group": "คำแนะนำเสริมการรักษา",
                  "checked": false
            },
            {
                  "id": "chk_cl017_9",
                  "text": "แนะนำสวมแผ่นอนามัยบางๆ หรือรองกระดาษชำระรองกางเกงใน เพื่อรับส่วนของยาเหน็บหรือครีมที่ละลายซึมออกมาในวันถัดไป",
                  "score": 1,
                  "group": "คำแนะนำเสริมการรักษา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การจุ่มน้ำ 1-2 วินาทีช่วยให้ยาชื้นหล่อลื่นได้ดี ลดอาการแสบระคายเคืองขณะสอด</li>\n        <li>ต้องเน้นย้ำเรื่องการใช้ยาต่อเนื่องแม้มีประจำเดือน เพื่อการกำจัดเชื้อราอย่างมีประสิทธิภาพและป้องกันการดื้อยาหรือกลับมาเป็นซ้ำ</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL018",
      "title": "Alendronate — ยาเม็ดพิเศษ Bisphosphonate",
      "category": "Clinic",
      "courseGroup": "Bone Metabolism",
      "mainGroup": "การให้คำแนะนำยา",
      "subTopic": "Alendronate Counseling",
      "disease": "Osteoporosis (Alendronate 70mg)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 68 ปี แพทย์วินิจฉัยเป็นโรคกระดูกพรุนและจ่ายยา Alendronate 70mg รับประทานสัปดาห์ละ 1 ครั้ง เภสัชกรต้องแนะนำวิธีรับประทานยาและข้อระวังที่เข้มงวดเป็นพิเศษเพื่อป้องกันผลข้างเคียงร้ายแรง",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาง ทองใบ งามขำ</td></tr>\n        <tr><td>อายุ</td><td>68 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Osteoporosis</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Alendronate sodium 70 mg 1 tablet once weekly on Sunday mornings</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 68 ปี แพทย์วินิจฉัยเป็นโรคกระดูกพรุนและจ่ายยา Alendronate 70mg รับประทานสัปดาห์ละ 1 ครั้ง เภสัชกรต้องแนะนำวิธีรับประทานยาและข้อระวังที่เข้มงวดเป็นพิเศษเพื่อป้องกันผลข้างเคียงร้ายแรง</p>",
      "checklist": [
            {
                  "id": "chk_cl018_1",
                  "text": "รับประทานตอนเช้าหลังตื่นนอนทันที (ขณะท้องว่าง) ก่อนรับประทานอาหารเช้า เครื่องดื่ม หรือยาอื่นๆ อย่างน้อย 30 นาที",
                  "score": 2,
                  "group": "วิธีการรับประทานยาอย่างถูกต้อง",
                  "checked": false
            },
            {
                  "id": "chk_cl018_2",
                  "text": "กลืนยาทั้งเม็ด ห้ามหัก บด เคี้ยว หรืออมยาใต้ลิ้นเด็ดขาด",
                  "score": 2,
                  "group": "วิธีการรับประทานยาอย่างถูกต้อง",
                  "checked": false
            },
            {
                  "id": "chk_cl018_3",
                  "text": "รับประทานยาพร้อมน้ำเปล่าต้มสุกอุณหภูมิห้อง 1 แก้วเต็ม (ประมาณ 180-240 มิลลิลิตร)",
                  "score": 2,
                  "group": "วิธีการรับประทานยาอย่างถูกต้อง",
                  "checked": false
            },
            {
                  "id": "chk_cl018_4",
                  "text": "ห้ามดื่มน้ำชนิดอื่นตาม เช่น น้ำแร่ ชา กาแฟ นม น้ำส้ม น้ำผลไม้ เนื่องจากขัดขวางการดูดซึมยาทำให้ยาไม่ได้ผล",
                  "score": 2,
                  "group": "วิธีการรับประทานยาอย่างถูกต้อง",
                  "checked": false
            },
            {
                  "id": "chk_cl018_5",
                  "text": "หลังรับประทานยา ห้ามล้มนอนราบเด็ดขาด ให้ยืนตัวตรง นั่งตัวตรง หรือเดินตัวตรง อย่างน้อย 30 นาที และห้ามล้มนอนจนกว่าจะรับอาหารเช้าคำแรกเสร็จ (เพื่อป้องกันโรคหลอดอาหารอักเสบ esophageal ulcer)",
                  "score": 3,
                  "group": "ข้อระวังและแนวปฏิบัติตน",
                  "checked": false
            },
            {
                  "id": "chk_cl018_6",
                  "text": "วิธีปฏิบัติหากลืมทานยา (แบบสัปดาห์ละครั้ง): ให้รับประทานยา 1 เม็ดในเช้าวันถัดไปทันทีที่นึกได้ แล้วทานเม็ดถัดไปตามวันเดิมของสัปดาห์ตามปกติ (ห้ามทาน 2 เม็ดในวันเดียวกัน)",
                  "score": 2,
                  "group": "ข้อระวังและแนวปฏิบัติตน",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>ยา Alendronate มีความเป็นกรดระคายเคืองสูงมาก หากล้มนอน ยาจะไหลย้อนกลับทำลายเยื่อบุหลอดอาหารจนเกิดแผลหรือทะลุได้</li>\n        <li>อัตราการดูดซึมยาต่ำมาก (<1%) ดังนั้นหากมีสารอาหาร ยา หรือน้ำแร่ในทางเดินอาหาร ยาจะจับตัวและไม่ถูกดูดซึมเลย</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL019",
      "title": "Sublingual Nitrate Tablets — ยาอมใต้ลิ้น",
      "category": "Clinic",
      "courseGroup": "Cardiovascular",
      "mainGroup": "การให้คำแนะนำยา",
      "subTopic": "Sublingual Nitrate Tablets",
      "disease": "Ischemic Heart Disease (Nitroglycerin SL)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 58 ปี มีประวัติโรคหัวใจขาดเลือดเฉียบพลัน แพทย์สั่งจ่ายยาอมใต้ลิ้น Nitroglycerin 0.5mg เมื่อมีอาการเจ็บแน่นหน้าอก เภสัชกรต้องแนะนำวิธีอมยา การประเมินอาการ และข้อห้ามใช้ร่วมกับยารักษาโรคหย่อนสมรรถภาพทางเพศ",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย ยอดรักษ์ มั่นคง</td></tr>\n        <tr><td>อายุ</td><td>58 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Ischemic Heart Disease, HT, DLP</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Nitroglycerin 0.5 mg sublingual tablet, 1 tablet sublingually prn for chest pain</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 58 ปี มีประวัติโรคหัวใจขาดเลือดเฉียบพลัน แพทย์สั่งจ่ายยาอมใต้ลิ้น Nitroglycerin 0.5mg เมื่อมีอาการเจ็บแน่นหน้าอก เภสัชกรต้องแนะนำวิธีอมยา การประเมินอาการ และข้อห้ามใช้ร่วมกับยารักษาโรคหย่อนสมรรถภาพทางเพศ</p>",
      "checklist": [
            {
                  "id": "chk_cl019_1",
                  "text": "เมื่อเกิดอาการเจ็บเค้นหน้าอก ให้หยุดกิจกรรมทั้งหมดทันที และให้นั่งลงหรือนอนลงทันที (ป้องกันการวูบหมดสติล้มหัวฟาดพื้นเนื่องจากยาทำให้ความดันตกเฉียบพลัน)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาอมใต้ลิ้นเมื่อเจ็บหน้าอก",
                  "checked": false
            },
            {
                  "id": "chk_cl019_2",
                  "text": "อมยา 1 เม็ดใต้ลิ้น ปล่อยให้ละลายช้าๆ ห้ามเคี้ยว ห้ามกลืน ห้ามดื่มน้ำ หรือกลืนน้ำลายตามจำนวนมาก",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาอมใต้ลิ้นเมื่อเจ็บหน้าอก",
                  "checked": false
            },
            {
                  "id": "chk_cl019_3",
                  "text": "รอสังเกตอาการ 5 นาที: หากอาการทุเลาลงให้นั่งพักต่อช้าๆ หากอาการไม่ดีขึ้นหรือแย่ลง ให้อมเม็ดที่ 2 ใต้ลิ้นทันที และให้คนรีบนำส่งโรงพยาบาลหรือโทร 1669 ทันที",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาอมใต้ลิ้นเมื่อเจ็บหน้าอก",
                  "checked": false
            },
            {
                  "id": "chk_cl019_4",
                  "text": "หากระหว่างนำส่งโรงพยาบาลและครบ 5 นาทีหลังเม็ดที่ 2 แต่อาการยังไม่ทุเลา สามารถอมเม็ดที่ 3 ได้ โดยห้ามอมเกิน 3 เม็ดต่อการปวดเจ็บอกหนึ่งครั้ง",
                  "score": 2,
                  "group": "ขั้นตอนการใช้ยาอมใต้ลิ้นเมื่อเจ็บหน้าอก",
                  "checked": false
            },
            {
                  "id": "chk_cl019_5",
                  "text": "ห้ามใช้ยาอมใต้ลิ้นนี้ร่วมกับยากลุ่ม Phosphodiesterase-5 inhibitors (ยารักษาหย่อนสมรรถภาพทางเพศ เช่น Sildenafil ภายใน 24 ชม., Tadalafil ภายใน 48 ชม.) เด็ดขาด เพราะจะเกิดการลดความดันโลหิตอย่างรุนแรงเป็นอันตรายถึงชีวิต",
                  "score": 3,
                  "group": "ข้อระวังและข้อห้ามใช้ที่สำคัญที่สุด",
                  "checked": false
            },
            {
                  "id": "chk_cl019_6",
                  "text": "การเก็บรักษา: เก็บยาในขวดแก้วสีชาปิดสนิท ป้องกันแสงและความร้อน ห้ามดึงสำลีออกจากขวดแก้วหากยาเหลือ และห้ามพกขวดยาติดตัวในกางเกงที่ร้อนชื้น",
                  "score": 1,
                  "group": "ข้อระวังและข้อห้ามใช้ที่สำคัญที่สุด",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การนอนหรือนั่งทันทีช่วยลด Cardiac workload และป้องกัน Orthostatic hypotension</li>\n        <li>การมีประวัติใช้ Sildenafil ร่วมกับ NTG จัดเป็นภาวะวิกฤตที่ห้ามจ่ายยาเด็ดขาดเนื่องจากจะดึงความดันโลหิตลงต่ำมากจนช็อกเสียชีวิต</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL020",
      "title": "ยาเม็ดคุมกำเนิด — การเริ่มกินและการลืมกิน",
      "category": "Clinic",
      "courseGroup": "Endocrine / Reproductive",
      "mainGroup": "การให้คำแนะนำยา",
      "subTopic": "Oral Contraceptive Counseling",
      "disease": "Contraception (Oral Contraceptive Pill)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 24 ปี มาขอคำแนะนำการเริ่มใช้ยาเม็ดคุมกำเนิดแผงแรก และขอวิธีแก้ไขหากลืมกินยา 1 เม็ด และหากลืมกินยาติดต่อกัน 2 เม็ด เภสัชกรต้องแนะนำแนวทางปฏิบัติอย่างชัดเจนตามมาตรฐาน CDC 2018",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นางสาว อรทัย รักษ์ดี</td></tr>\n        <tr><td>อายุ</td><td>24 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Healthy female</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Combined Oral Contraceptive Pill (ชนิดฮอร์โมน 21 เม็ด + แป้ง 7 เม็ด = 28 เม็ด)</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 24 ปี มาขอคำแนะนำการเริ่มใช้ยาเม็ดคุมกำเนิดแผงแรก และขอวิธีแก้ไขหากลืมกินยา 1 เม็ด และหากลืมกินยาติดต่อกัน 2 เม็ด เภสัชกรต้องแนะนำแนวทางปฏิบัติอย่างชัดเจนตามมาตรฐาน CDC 2018</p>",
      "checklist": [
            {
                  "id": "chk_cl020_1",
                  "text": "การเริ่มแผงแรก: แนะนำให้เริ่มทานยาภายใน 5 วันแรกที่มีประจำเดือน (มีผลคุมกำเนิดได้ทันที) หรือหากเริ่มวันอื่นต้องมั่นใจว่าไม่ได้ตั้งครรภ์และต้องคุมกำเนิดวิธีอื่น (เช่น ถุงยางอนามัย) สำรองอย่างน้อย 7 วัน",
                  "score": 2,
                  "group": "การเริ่มรับประทานยาเม็ดคุมกำเนิด",
                  "checked": false
            },
            {
                  "id": "chk_cl020_2",
                  "text": "ทานยาเวลาเดิมทุกวันสม่ำเสมอเรียงตามทิศลูกศรจนหมดแผง เริ่มแผงใหม่วันรุ่งขึ้นทันทีไม่ต้องเว้นวัน",
                  "score": 1,
                  "group": "การเริ่มรับประทานยาเม็ดคุมกำเนิด",
                  "checked": false
            },
            {
                  "id": "chk_cl020_3",
                  "text": "กรณีลืมกินยาฮอร์โมน 1 เม็ด (ลืม < 48 ชั่วโมง): ให้กินเม็ดที่ลืมทันทีที่นึกได้ และกินเม็ดต่อไปตามเวลาปกติ (อาจต้องกิน 2 เม็ดในวันเดียวกัน) ไม่ต้องคุมกำเนิดสำรอง",
                  "score": 2,
                  "group": "วิธีปฏิบัติกรณีลืมกินยา (แนวทาง CDC 2018)",
                  "checked": false
            },
            {
                  "id": "chk_cl020_4",
                  "text": "กรณีลืมกินยาฮอร์โมนตั้งแต่ 2 เม็ดขึ้นไป (ลืม >= 48 ชั่วโมง): ให้ทานเฉพาะเม็ดที่เพิ่งลืมล่าสุดทันทีที่นึกได้ ทิ้งเม็ดที่ลืมก่อนหน้า ทานเม็ดต่อไปตามเวลาปกติ และต้องใช้ถุงยางอนามัยหรือหลีกเลี่ยงมีเพศสัมพันธ์ต่อเนื่องอย่างน้อย 7 วัน",
                  "score": 2,
                  "group": "วิธีปฏิบัติกรณีลืมกินยา (แนวทาง CDC 2018)",
                  "checked": false
            },
            {
                  "id": "chk_cl020_5",
                  "text": "หากลืมทานยาฮอร์โมนในช่วงสัปดาห์ที่ 3 (เม็ดที่ 15-21) เกิน 48 ชั่วโมง: ให้ทานฮอร์โมนแผงเดิมให้หมด แล้วเริ่มแผงใหม่ในวันรุ่งขึ้นทันทีโดยข้ามเม็ดที่ไม่มีฮอร์โมน (เม็ดแป้ง) ของแผงเดิมไปเลย",
                  "score": 2,
                  "group": "วิธีปฏิบัติกรณีลืมกินยา (แนวทาง CDC 2018)",
                  "checked": false
            },
            {
                  "id": "chk_cl020_6",
                  "text": "หากอาเจียนรุนแรงหรือท้องเสียรุนแรงภายใน 2 ชั่วโมงหลังกินยา ให้ทานซ้ำอีก 1 เม็ด และใช้ถุงยางร่วมด้วย",
                  "score": 1,
                  "group": "วิธีปฏิบัติกรณีลืมกินยา (แนวทาง CDC 2018)",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>การลืมยาในสัปดาห์ที่ 3 ถือเป็นจุดวิกฤตเพราะมีผลต่อการหลั่งฮอร์โมนสะท้อนกลับเพื่อกระตุ้นไข่ตก การเริ่มแผงใหม่ทันทีช่วยรักษาระดับฮอร์โมนไม่ให้ตกลง</li>\n        <li>หากลืมในช่วงสัปดาห์แรก (เม็ดที่ 1-7) และมีเพศสัมพันธ์โดยไม่ได้ป้องกันใน 5 วันก่อนหน้า แนะนำทานยาคุมฉุกเฉินร่วมด้วย</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL021",
      "title": "หมากฝรั่งช่วยเลิกบุหรี่ — หมากฝรั่งนิโคติน",
      "category": "Clinic",
      "courseGroup": "Substance Abuse / Toxicology",
      "mainGroup": "การให้คำแนะนำยา",
      "subTopic": "Nicotine Gum Counseling",
      "disease": "Smoking Cessation (Nicotine Gum)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยชายอายุ 45 ปี สูบบุหรี่จัด ต้องการเลิกบุหรี่ แพทย์สั่งจ่ายหมากฝรั่งนิโคติน 2mg เภสัชกรต้องแนะนำวิธีเคี้ยวสลับพัก (Chew and Park) และข้อควรระวังเรื่องเครื่องดื่มและการกลืนน้ำลาย",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย มุ่งมั่น ตั้งใจ</td></tr>\n        <tr><td>อายุ</td><td>45 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Healthy male, Heavy smoker</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Nicotine gum 2 mg, chew 1 piece prn when craving (max 24 pieces/day)</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยชายอายุ 45 ปี สูบบุหรี่จัด ต้องการเลิกบุหรี่ แพทย์สั่งจ่ายหมากฝรั่งนิโคติน 2mg เภสัชกรต้องแนะนำวิธีเคี้ยวสลับพัก (Chew and Park) และข้อควรระวังเรื่องเครื่องดื่มและการกลืนน้ำลาย</p>",
      "checklist": [
            {
                  "id": "chk_cl021_1",
                  "text": "แนะนำให้คนไข้หยุดสูบบุหรี่ทันทีเมื่อเริ่มใช้หมากฝรั่งช่วยเลิกบุหรี่",
                  "score": 2,
                  "group": "วิธีการเคี้ยวหมากฝรั่งนิโคติน (Chew & Park)",
                  "checked": false
            },
            {
                  "id": "chk_cl021_2",
                  "text": "เคี้ยวหมากฝรั่งช้าๆ จนเริ่มมีรสเผ็ดซ่าหรือรู้สึกซ่า (แสดงว่านิโคตินปลดปล่อยออกมา)",
                  "score": 2,
                  "group": "วิธีการเคี้ยวหมากฝรั่งนิโคติน (Chew & Park)",
                  "checked": false
            },
            {
                  "id": "chk_cl021_3",
                  "text": "เมื่อรู้สึกเผ็ดซ่า ให้หยุดเคี้ยว แล้วพักหมากฝรั่งไว้ที่กระพุ้งแก้มข้างใดข้างหนึ่งทันที",
                  "score": 2,
                  "group": "วิธีการเคี้ยวหมากฝรั่งนิโคติน (Chew & Park)",
                  "checked": false
            },
            {
                  "id": "chk_cl021_4",
                  "text": "เมื่อรสเผ็ดซ่าหมดไป ให้เริ่มเคี้ยวใหม่ช้าๆ และย้ายไปพักหมากฝรั่งไว้ที่กระพุ้งแก้มอีกข้าง",
                  "score": 2,
                  "group": "วิธีการเคี้ยวหมากฝรั่งนิโคติน (Chew & Park)",
                  "checked": false
            },
            {
                  "id": "chk_cl021_5",
                  "text": "เคี้ยวสลับพักต่อเนื่องเป็นเวลา 30 นาที คลึงจนหมดรสชาติแล้วคายทิ้งห่อกระดาษให้มิดชิด",
                  "score": 1,
                  "group": "วิธีการเคี้ยวหมากฝรั่งนิโคติน (Chew & Park)",
                  "checked": false
            },
            {
                  "id": "chk_cl021_6",
                  "text": "ควรงดเครื่องดื่มที่มีความเป็นกรด เช่น กาแฟ น้ำอัดลม น้ำผลไม้ ชา 15 นาทีก่อนเคี้ยวและขณะใช้หมากฝรั่ง (เนื่องจากทำให้ปากเป็นกรดและดูดซึมยาได้แย่ลง)",
                  "score": 2,
                  "group": "ข้อควรระวังสำคัญเพื่อลดผลข้างเคียง",
                  "checked": false
            },
            {
                  "id": "chk_cl021_7",
                  "text": "ห้ามเคี้ยวเร็วต่อเนื่องโดยไม่พัก เพราะจะทำให้นิโคตินออกมารวดเร็วเกินไป กลืนนิโคตินปริมาณมากทำให้ระคายกระเพาะ ท้องอืด แสบยอดอก คลื่นไส้ หรือสะอึกอย่างรุนแรง",
                  "score": 2,
                  "group": "ข้อควรระวังสำคัญเพื่อลดผลข้างเคียง",
                  "checked": false
            },
            {
                  "id": "chk_cl021_8",
                  "text": "แนะนำให้กลืนน้ำลายช้าๆ ทีละน้อย เพื่อลดโอกาสการแสบระคายเคืองคอ",
                  "score": 1,
                  "group": "ข้อควรระวังสำคัญเพื่อลดผลข้างเคียง",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>เทคนิค Chew and Park ออกแบบเพื่อให้ยาดูดซึมผ่านเส้นเลือดฝอยในเยื่อบุช่องปาก (Buccal absorption)</li>\n        <li>การเคี้ยวรวดเร็วเหมือนหมากฝรั่งปกติจะทำให้ยาถูกกลืนลงกระเพาะอาหาร ซึ่งยาจะถูกทำลายที่ตับผ่าน First-pass metabolism และไม่สามารถออกฤทธิ์ช่วยบรรเทาอาการอยากนิโคตินได้ แถมระคายเคืองกระเพาะอาหาร</li>\n      </ul>"
},
{
      "caseId": "OSPE-CL022",
      "title": "แผ่นแปะนิโคติน — แผ่นแปะช่วยเลิกบุหรี่",
      "category": "Clinic",
      "courseGroup": "Substance Abuse / Toxicology",
      "mainGroup": "การให้คำแนะนำยา",
      "subTopic": "Nicotine Patch Counseling",
      "disease": "Smoking Cessation (Nicotine Patch)",
      "difficulty": 3,
      "author": "Lin",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1ZNKvEBVAUeVcJ2GSH4gGKujA8whv7zY0fH4pXVEJa4g",
      "scenario": "ผู้ป่วยหญิงอายุ 38 ปี สูบบุหรี่วันละ 1 ซอง ต้องการเลิกบุหรี่ แพทย์สั่งจ่ายแผ่นแปะนิโคติน 21mg/day สำหรับแปะ 24 ชั่วโมง เภสัชกรต้องแนะนำวิธีแปะ การเลือกตำแหน่ง ข้อห้ามตัด และการจัดการเมื่อมีอาการฝันร้ายนอนไม่หลับ",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นางสาว จรัสศรี ใจแข็ง</td></tr>\n        <tr><td>อายุ</td><td>38 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Healthy female, heavy smoker</td></tr>\n        <tr><td>ยาปัจจุบัน</td><td>Nicotine patch 21 mg/24h, apply 1 patch daily</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยหญิงอายุ 38 ปี สูบบุหรี่วันละ 1 ซอง ต้องการเลิกบุหรี่ แพทย์สั่งจ่ายแผ่นแปะนิโคติน 21mg/day สำหรับแปะ 24 ชั่วโมง เภสัชกรต้องแนะนำวิธีแปะ การเลือกตำแหน่ง ข้อห้ามตัด และการจัดการเมื่อมีอาการฝันร้ายนอนไม่หลับ</p>",
      "checklist": [
            {
                  "id": "chk_cl022_1",
                  "text": "แนะนำให้คนไข้หยุดสูบบุหรี่ทันทีเมื่อเริ่มใช้ยา ล้างมือให้สะอาดและเช็ดให้แห้ง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้แผ่นแปะนิโคติน",
                  "checked": false
            },
            {
                  "id": "chk_cl022_2",
                  "text": "ลอกแผ่นใสที่คลุมตัวยาออกระวังไม่ให้นิ้วแตะโดนแถบยาเหนียวโดยตรง",
                  "score": 1,
                  "group": "ขั้นตอนการใช้แผ่นแปะนิโคติน",
                  "checked": false
            },
            {
                  "id": "chk_cl022_3",
                  "text": "ติดแผ่นแปะบนผิวที่สะอาด แห้ง ไม่มีแผล และไม่มีขน (จุดที่แนะนำ: ต้นแขนด้านนอก หน้าอก หรือสะโพก)",
                  "score": 2,
                  "group": "ขั้นตอนการใช้แผ่นแปะนิโคติน",
                  "checked": false
            },
            {
                  "id": "chk_cl022_4",
                  "text": "ใช้ฝ่ามือกดแผ่นแปะค้างไว้แน่นๆ ประมาณ 10 วินาทีเพื่อให้แผ่นแปะติดแน่นสนิท ล้างมือให้สะอาดทันทีหลังเสร็จ",
                  "score": 2,
                  "group": "ขั้นตอนการใช้แผ่นแปะนิโคติน",
                  "checked": false
            },
            {
                  "id": "chk_cl022_5",
                  "text": "ติดแผ่นแปะตลอด 24 ชั่วโมง แม้เวลานอนหรืออาบน้ำ และเปลี่ยนแผ่นใหม่ในเวลาเดียวกันของทุกวัน โดยเปลี่ยนที่แปะทุกวันไม่ซ้ำจุดเดิมเพื่อป้องกันผิวอักเสบ",
                  "score": 2,
                  "group": "ขั้นตอนการใช้แผ่นแปะนิโคติน",
                  "checked": false
            },
            {
                  "id": "chk_cl022_6",
                  "text": "หากมีอาการนอนไม่หลับ ฝันร้ายอย่างรุนแรงจากการแปะยาตอนกลางคืน ให้แนะนำแกะแผ่นแปะออกก่อนนอน และแปะแผ่นใหม่หลังตื่นนอน (หรือติดแผ่นแปะวันละ 16 ชั่วโมงแทน)",
                  "score": 2,
                  "group": "ข้อระวังและแนวทางการแก้ปัญหาข้างเคียง",
                  "checked": false
            },
            {
                  "id": "chk_cl022_7",
                  "text": "เน้นย้ำ: ห้ามตัดแผ่นแปะนิโคตินเพื่อปรับขนาดยาเด็ดขาด เพราะจะทำให้ระบบควบคุมการปล่อยยาเสียหาย ยาจะรั่วไหลออกมารวดเร็วเป็นอันตราย",
                  "score": 2,
                  "group": "ข้อระวังและแนวทางการแก้ปัญหาข้างเคียง",
                  "checked": false
            },
            {
                  "id": "chk_cl022_8",
                  "text": "หลีกเลี่ยงการใช้ผลิตภัณฑ์ทาผิวทุกชนิดในจุดที่แปะยาเนื่องจากลดประสิทธิภาพการยึดติดของกาว",
                  "score": 1,
                  "group": "ข้อระวังและแนวทางการแก้ปัญหาข้างเคียง",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>แผ่นแปะควบคุมการปลดปล่อยด้วยเมมเบรนพิเศษ (Rate-controlling membrane) การตัดแบ่งแผ่นแปะจะทำลายเยื่อเมมเบรนและเกิดภาวะ Drug dumping ทำให้ตัวยาหลั่งออกมาปริมาณสูงในทันทีจนเกิดพิษ</li>\n        <li>การเปลี่ยนตำแหน่งติดทุกวันเพื่อหลีกเลี่ยงการเกิด Contact dermatitis</li>\n      </ul>"
},
{
      "caseId": "OSPE-PD001",
      "title": "Compounding — Cold Cream & Labeling",
      "category": "Product",
      "courseGroup": "Compounding - Topical",
      "mainGroup": "การเตรียมยา",
      "subTopic": "Cold Cream Preparation",
      "disease": "Dry Skin, Cold Cream",
      "difficulty": 2,
      "author": "Fon",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw",
      "scenario": "ท่านได้รับใบสั่งยาจากแพทย์ให้เตรียมตำรับ Cold Cream ปริมาณ 30 กรัม สำหรับผู้ป่วยเด็กโรคผิวหนังแห้ง (Atopic Dermatitis) โดยให้คำนวณสูตรตำรับ ชั่งตวงสารผสมเนื้อครีม และเขียนฉลากยาควบคุมพิเศษให้ครบถ้วนถูกต้องตามหลักวิชาชีพเภสัชกรรม (เวลาปฏิบัติการ 4 นาที)",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>เด็กชายปัญญา ดีเลิศ</td></tr>\n        <tr><td>อายุ</td><td>5 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Atopic Dermatitis (ผิวหนังอักเสบภูมิแพ้)</td></tr>\n        <tr><td>ใบสั่งยา</td><td>Cold Cream 30 g apply to dry areas BID</td></tr>\n        <tr><td>การแพ้ยา</td><td>NKDA (ไม่มีประวัติแพ้ยา)</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ท่านได้รับใบสั่งยาจากแพทย์ให้เตรียมตำรับ Cold Cream ปริมาณ 30 กรัม สำหรับผู้ป่วยเด็กโรคผิวหนังแห้ง (Atopic Dermatitis) โดยให้คำนวณสูตรตำรับ ชั่งตวงสารผสมเนื้อครีม และเขียนฉลากยาควบคุมพิเศษให้ครบถ้วนถูกต้องตามหลักวิชาชีพเภสัชกรรม (เวลาปฏิบัติการ 4 นาที)</p>",
      "checklist": [
            {
                  "id": "chk_pd1",
                  "text": "คำนวณปริมาณสารสำคัญในสูตร Cold Cream 30 กรัม ได้ถูกต้อง (Mineral oil 15g, Beeswax 3.6g, Borax 0.24g, Water 7.56g)",
                  "score": 2,
                  "group": "การคำนวณและตั้งตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd2",
                  "text": "ชั่งน้ำหนักบีกเกอร์และสารเคมีแต่ละชนิดด้วยเครื่องชั่ง 2 ตำแหน่งอย่างถูกต้อง",
                  "score": 1,
                  "group": "การคำนวณและตั้งตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd3",
                  "text": "อธิบายขั้นตอนการผสมเฟสน้ำ (Aqueous phase) และเฟสน้ำมัน (Oily phase) ที่อุณหภูมิ 70 องศาเซลเซียส",
                  "score": 2,
                  "group": "การคำนวณและตั้งตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd4",
                  "text": "คนผสมให้เข้ากันจนได้เนื้อครีมขาวเนียนสม่ำเสมอ",
                  "score": 1,
                  "group": "การคำนวณและตั้งตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd5",
                  "text": "เขียนฉลากยาได้ถูกต้องครบถ้วน (ชื่อผู้ป่วย, วิธีใช้: ทาบริเวณผิวแห้งวันละ 2 ครั้ง, วันผลิต, วันหมดอายุ 14 วัน)",
                  "score": 2,
                  "group": "การเขียนฉลากและจ่ายยา",
                  "checked": false
            },
            {
                  "id": "chk_pd6",
                  "text": "ติดฉลากแดง \"ยาใช้ภายนอก ห้ามรับประทาน\"",
                  "score": 1,
                  "group": "การเขียนฉลากและจ่ายยา",
                  "checked": false
            },
            {
                  "id": "chk_pd7",
                  "text": "ส่งมอบยาพร้อมให้คำแนะนำการเก็บรักษายาที่อุณหภูมิห้อง หลีกเลี่ยงแสงแดด",
                  "score": 1,
                  "group": "การเขียนฉลากและจ่ายยา",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลยและข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li><strong>สูตรมาตรฐาน Cold Cream (100g):</strong> Mineral oil 50g, Beeswax 12g, Spermaceti 12g, Sodium borate (Borax) 0.8g, Purified water 25.2g.</li>\n        <li><strong>สำหรับ 30g:</strong> Mineral oil 15g, Beeswax 3.6g, Spermaceti 3.6g (หรือใช้วัตถุดิบอื่นทดแทน), Borax 0.24g, Water 7.56g.</li>\n        <li><strong>การเก็บรักษา:</strong> ห้ามแช่แข็ง เก็บในภาชนะปิดสนิทป้องกันแสงแดดและความร้อนเพื่อป้องกันการแยกเฟส</li>\n      </ul>"
},
{
      "caseId": "OSPE-PD002",
      "title": "Ointment Compounding — Sulfur 10% Ointment",
      "category": "Product",
      "courseGroup": "Compounding - Topical",
      "mainGroup": "การเตรียมยา",
      "subTopic": "Ointment Compounding",
      "disease": "Scabies (Sulfur Ointment)",
      "difficulty": 2,
      "author": "Min",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw",
      "scenario": "เตรียมตำรับ Sulfur 10% ointment ปริมาณ 30g ตามใบสั่งแพทย์ โดยเตรียมด้วย Levigating agent ที่เหมาะสม และเขียนฉลากยาภายนอก",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย สมควร ชนะโรค</td></tr>\n        <tr><td>อายุ</td><td>35 ปี</td></tr>\n        <tr><td>การวินิจฉัย</td><td>Scabies</td></tr>\n        <tr><td>ใบสั่งยา</td><td>Sulfur 10% ointment 30g apply to body once daily at night</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">เตรียมตำรับ Sulfur 10% ointment ปริมาณ 30g ตามใบสั่งแพทย์ โดยเตรียมด้วย Levigating agent ที่เหมาะสม และเขียนฉลากยาภายนอก</p>",
      "checklist": [
            {
                  "id": "chk_pd002_1",
                  "text": "คำนวณปริมาณ Precipitated Sulfur: 10% ของ 30g = 3.0g",
                  "score": 2,
                  "group": "การคำนวณและเตรียมตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd002_2",
                  "text": "เลือก Levigating agent คือ Mineral oil (Liquid Paraffin) ในปริมาณที่เหมาะสม",
                  "score": 1,
                  "group": "การคำนวณและเตรียมตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd002_3",
                  "text": "คำนวณ Ointment base (Vaseline/Petrolatum) ที่ต้องใช้เพื่อปรับปริมาตรจนครบ 30g",
                  "score": 1,
                  "group": "การคำนวณและเตรียมตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd002_4",
                  "text": "ชั่งและบดลดขนาดอนุภาคผงกัมมะถัน (Precipitated Sulfur) บน Slab/Parchment paper",
                  "score": 2,
                  "group": "ทักษะการเตรียมยา",
                  "checked": false
            },
            {
                  "id": "chk_pd002_5",
                  "text": "Levigate ผงกำมะถันด้วย Mineral oil จนได้เนื้อครีมข้นละเอียดเปียก",
                  "score": 2,
                  "group": "ทักษะการเตรียมยา",
                  "checked": false
            },
            {
                  "id": "chk_pd002_6",
                  "text": "ทำการผสม Ointment Base ทีละส่วนด้วยหลัก Geometric dilution เพื่อเนื้อสม่ำเสมอดี ป้ายเรียบไม่มีเม็ดก้อน",
                  "score": 2,
                  "group": "ทักษะการเตรียมยา",
                  "checked": false
            },
            {
                  "id": "chk_pd002_7",
                  "text": "บรรจุลงกระปุกพลาสติกสีทึบปิดสนิทปาดผิวหน้าเรียบสวยงาม",
                  "score": 1,
                  "group": "บรรจุและติดฉลากส่งมอบ",
                  "checked": false
            },
            {
                  "id": "chk_pd002_8",
                  "text": "เขียนฉลากยาครบถ้วน ถูกต้องตามกฎหมาย มีป้ายเตือน 'ยาใช้ภายนอก ห้ามรับประทาน' สีแดงชัดเจน",
                  "score": 1,
                  "group": "บรรจุและติดฉลากส่งมอบ",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>Precipitated Sulfur 10% = 3g, Mineral oil ~1.5g (ช่วยเกลี่ยผงกัมมะถัน), White/Yellow Petrolatum ปรับจนครบ 30g</li>\n        <li>วันหมดอายุ (BUD) ของตำรับขี้ผึ้งกึ่งของแข็งไม่มีน้ำคือ 6 เดือน หรือตามวันหมดอายุของสารเคมีที่สั้นที่สุด</li>\n      </ul>"
},
{
      "caseId": "OSPE-PD003",
      "title": "Syrup Compounding — Paracetamol Syrup 120mg/5mL",
      "category": "Product",
      "courseGroup": "Compounding - Oral Liquid",
      "mainGroup": "การเตรียมยา",
      "subTopic": "Syrup Compounding",
      "disease": "Pediatric Fever (Paracetamol Syrup)",
      "difficulty": 2,
      "author": "Fon",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1Y0xzOVWiV7kJRJcOIkaflhErEuOtm1gzs-xvTGz22xw",
      "scenario": "เตรียมยา Paracetamol Syrup 120mg/5mL ปริมาณ 60 mL สำหรับผู้ป่วยเด็กอายุ 3 ปี พร้อมคำนวณสารหวานและสารกันเสียที่ระบุในตำรับ",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>ด.ช. ปัญญา เลิศล้ำ</td></tr>\n        <tr><td>อายุ</td><td>3 ปี (ผู้ปกครองรับยา)</td></tr>\n        <tr><td>การวินิจฉัย</td><td>Fever</td></tr>\n        <tr><td>ใบสั่งยา</td><td>Paracetamol 120mg/5mL syrup 60mL, take 5 mL q4-6h prn for fever</td></tr>\n        <tr><td>Allergy</td><td>NKDA</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">เตรียมยา Paracetamol Syrup 120mg/5mL ปริมาณ 60 mL สำหรับผู้ป่วยเด็กอายุ 3 ปี พร้อมคำนวณสารหวานและสารกันเสียที่ระบุในตำรับ</p>",
      "checklist": [
            {
                  "id": "chk_pd003_1",
                  "text": "คำนวณ Paracetamol powder: 120mg/5mL * 60mL = 1.44g",
                  "score": 2,
                  "group": "การคำนวณสูตรตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd003_2",
                  "text": "คำนวณสารกันเสีย (เช่น Methylparaben/Propylparaben) และสารแต่งรสหวาน (เช่น Simple Syrup)",
                  "score": 1,
                  "group": "การคำนวณสูตรตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd003_3",
                  "text": "ระบุตัวทำละลายร่วม (Cosolvent) เช่น Propylene glycol เพื่อละลาย Paracetamol",
                  "score": 1,
                  "group": "การคำนวณสูตรตำรับ",
                  "checked": false
            },
            {
                  "id": "chk_pd003_4",
                  "text": "ละลาย Paracetamol powder ใน Cosolvent ให้สมบูรณ์ก่อนใส่ส่วนน้ำเชื่อม",
                  "score": 2,
                  "group": "การเตรียมและผสมสารละลาย",
                  "checked": false
            },
            {
                  "id": "chk_pd003_5",
                  "text": "ตวงและผสมน้ำเชื่อม (Simple Syrup) ลงในสารละลายทีละน้อย คนให้เข้ากันอย่างสม่ำเสมอ",
                  "score": 2,
                  "group": "การเตรียมและผสมสารละลาย",
                  "checked": false
            },
            {
                  "id": "chk_pd003_6",
                  "text": "ปรับปริมาตรจนครบ 60 mL ในขวดปริมาตรด้วย Purified water",
                  "score": 1,
                  "group": "การเตรียมและผสมสารละลาย",
                  "checked": false
            },
            {
                  "id": "chk_pd003_7",
                  "text": "บรรจุลงขวดแก้ว/พลาสติกสีชา ปิดฝาเกลียวแน่นสนิท ป้องกันแสง",
                  "score": 1,
                  "group": "บรรจุและส่งมอบพร้อมฉลาก",
                  "checked": false
            },
            {
                  "id": "chk_pd003_8",
                  "text": "เขียนฉลากยาสำหรับผู้ป่วยเด็ก ระบุวิธีรับประทาน 5 mL วันละไม่เกิน 5 ครั้ง BUD 14 วัน (หากแช่ตู้เย็น)",
                  "score": 2,
                  "group": "บรรจุและส่งมอบพร้อมฉลาก",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>Paracetamol ละลายในน้ำได้ยากมาก จึงจำเป็นต้องใช้ Propylene glycol หรือ Alcohol ร่วมเป็นตัวช่วยละลาย</li>\n        <li>BUD สารละลายน้ำจำพวก Oral Liquid ปราศจากสารกันเสียเสี่ยงบูดง่าย BUD ทั่วไป 14 วันเมื่อเก็บที่เย็น (2-8 C)</li>\n      </ul>"
},
{
      "caseId": "OSPE-SP001",
      "title": "Pharmacy Law — ยาควบคุมพิเศษ",
      "category": "SAP",
      "courseGroup": "Pharmacy Law",
      "mainGroup": "ความรู้กฎหมายและจรรยาบรรณ",
      "subTopic": "Prescription Validation",
      "disease": "Special Controlled Drugs Regulation",
      "difficulty": 2,
      "author": "Irene",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg",
      "scenario": "ผู้ป่วยนำใบสั่งยาจากคลินิกเอกชนมาขอซื้อยา Lorazepam 2 mg ในร้านยาของท่าน ให้ท่านทำการตรวจสอบความถูกต้องทางกฎหมายของใบสั่งยา วิเคราะห์ประเภทของยาทางกฎหมาย และปฏิบัติตนตามข้อกำหนดของสำนักงานคณะกรรมการอาหารและยา (อย.) อย่างถูกต้อง (เวลาปฏิบัติการ 4 นาที)",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นางสาวสมศรี มีสุข</td></tr>\n        <tr><td>อายุ</td><td>45 ปี</td></tr>\n        <tr><td>โรคประจำตัว</td><td>Insomnia (นอนไม่หลับ)</td></tr>\n        <tr><td>ใบสั่งยา</td><td>Lorazepam 2 mg (15 tablets) Take 1 tablet before bedtime</td></tr>\n        <tr><td>การแพ้ยา</td><td>NKDA (ไม่มีประวัติแพ้ยา)</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยนำใบสั่งยาจากคลินิกเอกชนมาขอซื้อยา Lorazepam 2 mg ในร้านยาของท่าน ให้ท่านทำการตรวจสอบความถูกต้องทางกฎหมายของใบสั่งยา วิเคราะห์ประเภทของยาทางกฎหมาย และปฏิบัติตนตามข้อกำหนดของสำนักงานคณะกรรมการอาหารและยา (อย.) อย่างถูกต้อง (เวลาปฏิบัติการ 4 นาที)</p>",
      "checklist": [
            {
                  "id": "chk_sp1",
                  "text": "ระบุประเภททางกฎหมายของ Lorazepam ได้ถูกต้องว่าเป็น \"วัตถุออกฤทธิ์ต่อจิตและประสาทประเภท 4\"",
                  "score": 2,
                  "group": "ความรู้กฎหมายและการควบคุม",
                  "checked": false
            },
            {
                  "id": "chk_sp2",
                  "text": "ตรวจสอบใบสั่งยาและแจ้งผู้ป่วยว่า \"ร้านขายยาแผนปัจจุบัน (ข.ย.1) ไม่สามารถจ่ายวัตถุออกฤทธิ์ประเภท 4 ตามใบสั่งยาแพทย์จากคลินิกได้\"",
                  "score": 2,
                  "group": "ความรู้กฎหมายและการควบคุม",
                  "checked": false
            },
            {
                  "id": "chk_sp3",
                  "text": "แนะนำให้ผู้ป่วยไปรับยาที่โรงพยาบาลหรือสถานพยาบาลที่ได้รับอนุญาตครอบครองวัตถุออกฤทธิ์โดยตรง",
                  "score": 2,
                  "group": "ความรู้กฎหมายและการควบคุม",
                  "checked": false
            },
            {
                  "id": "chk_sp4",
                  "text": "อธิบายข้อกฎหมายที่ห้ามร้านขายยาทั่วไปจำหน่ายวัตถุออกฤทธิ์ประเภท 2 และ 4",
                  "score": 1,
                  "group": "ความรู้กฎหมายและการควบคุม",
                  "checked": false
            },
            {
                  "id": "chk_sp5",
                  "text": "ปฏิเสธการขายยาอย่างสุภาพและแสดงความใส่ใจต่ออาการนอนไม่หลับของผู้ป่วย",
                  "score": 2,
                  "group": "ทักษะจรรยาบรรณวิชาชีพ",
                  "checked": false
            },
            {
                  "id": "chk_sp6",
                  "text": "บันทึกข้อมูลการให้คำแนะนำทางกฎหมายลงในแบบฟอร์มบันทึกการให้คำปรึกษาของร้านยา",
                  "score": 1,
                  "group": "ทักษะจรรยาบรรณวิชาชีพ",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลยและข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li><strong>ประเภทวัตถุออกฤทธิ์:</strong> วัตถุออกฤทธิ์ต่อจิตและประสาทประเภท 4 (เช่น Diazepam, Lorazepam, Alprazolam) ห้ามจำหน่ายในร้านขายยาทั่วไป ยกเว้นการจ่ายในสถานพยาบาลของรัฐหรือเอกชนที่มีใบอนุญาตเฉพาะ</li>\n        <li><strong>การฝ่าฝืน:</strong> การฝ่าฝืนขายวัตถุออกฤทธิ์ประเภท 4 ในร้านยามีโทษจำคุกและปรับตาม พ.ร.บ. วัตถุที่ออกฤทธิ์ต่อจิตและประสาท</li>\n        <li><strong>คำแนะนำเพิ่มเติม:</strong> ให้คำแนะนำผู้ป่วยเสริมด้านสุขวิทยาการนอน (Sleep Hygiene) เช่น หลีกเลี่ยงคาเฟอีนก่อนนอน งดเล่นมือถือ และเข้านอนเป็นเวลา</li>\n      </ul>"
},
{
      "caseId": "OSPE-SP002",
      "title": "Narcotics Type 5 Regulation — Cannabis Medical Use",
      "category": "SAP",
      "courseGroup": "Pharmacy Law",
      "mainGroup": "ความรู้กฎหมายและจรรยาบรรณ",
      "subTopic": "Narcotic Drug Handling (Type 5)",
      "disease": "Cannabis Regulation under Narcotics Act",
      "difficulty": 2,
      "author": "Poy",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg",
      "scenario": "เจ้าหน้าที่เข้าตรวจสอบร้านยาเกี่ยวกับการครอบครองและจำหน่ายยาแผนปัจจุบันที่มีส่วนผสมของกัญชา (ยาเสพติดให้โทษประเภท 5) เภสัชกรต้องอธิบายเกณฑ์กฎหมายการขออนุญาตและการทำรายงานควบคุม",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>ภญ. ปรารถนา ดีงาม (เภสัชกรประจำร้าน)</td></tr>\n        <tr><td>หัวข้อการตรวจ</td><td>ตรวจสอบระบบเอกสารควบคุมบัญชียาเสพติดประเภท 5</td></tr>\n        <tr><td>ข้อมูลร้านยา</td><td>ร้านยากรุงเทพคอมมูนิตี้ (มีใบอนุญาต ข.ย.1 และใบอนุญาตจำหน่าย ยส.5)</td></tr>\n        <tr><td>ตัวแทนตรวจ</td><td>พนักงานเจ้าหน้าที่จาก สำนักงานคณะกรรมการอาหารและยา (อย.)</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">เจ้าหน้าที่เข้าตรวจสอบร้านยาเกี่ยวกับการครอบครองและจำหน่ายยาแผนปัจจุบันที่มีส่วนผสมของกัญชา (ยาเสพติดให้โทษประเภท 5) เภสัชกรต้องอธิบายเกณฑ์กฎหมายการขออนุญาตและการทำรายงานควบคุม</p>",
      "checklist": [
            {
                  "id": "chk_sp002_1",
                  "text": "ระบุเกณฑ์กฎหมายกัญชาในทางการแพทย์ว่าต้องสั่งจ่ายโดยผู้ประกอบวิชาชีพที่มีสิทธิ์และผ่านการอบรม",
                  "score": 2,
                  "group": "ความรู้กฎหมายยาเสพติดให้โทษประเภท 5",
                  "checked": false
            },
            {
                  "id": "chk_sp002_2",
                  "text": "แสดงหลักฐานใบสั่งยาและประวัติผู้ป่วยของแพทย์ที่สั่งจ่ายสารสกัดกัญชาทางการแพทย์",
                  "score": 2,
                  "group": "ความรู้กฎหมายยาเสพติดให้โทษประเภท 5",
                  "checked": false
            },
            {
                  "id": "chk_sp002_3",
                  "text": "อธิบายการทำรายงานบัญชีรับ-จ่ายยาเสพติดประเภท 5 (แบบ บ.จ.5) ส่ง อย. รายเดือนและรายปี",
                  "score": 2,
                  "group": "ความรู้กฎหมายยาเสพติดให้โทษประเภท 5",
                  "checked": false
            },
            {
                  "id": "chk_sp002_4",
                  "text": "แสดงสถานที่เก็บรักษายาเสพติดประเภท 5 แยกเป็นสัดส่วนชัดเจนและใส่กุญแจแน่นหนาป้องกันการสูญหาย",
                  "score": 2,
                  "group": "การปฏิบัติงานตามมาตรฐานกฎหมาย",
                  "checked": false
            },
            {
                  "id": "chk_sp002_5",
                  "text": "อธิบายบทลงโทษหากฝ่าฝืนการครอบครองหรือจำหน่ายโดยไม่ถูกต้องตามกฎหมายยาเสพติดให้โทษ",
                  "score": 2,
                  "group": "การปฏิบัติงานตามมาตรฐานกฎหมาย",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>กัญชาทางการแพทย์ (สารสกัดที่มี THC > 0.2%) ยังคงถูกควบคุมเข้มงวดภายใต้ พ.ร.บ.ยาเสพติดให้โทษ</li>\n        <li>ร้านยาที่จะสั่งจ่ายต้องมีใบอนุญาตจำหน่าย ยส.5 และผู้ป่วยต้องมีใบรับรองแพทย์/ใบสั่งยาจากแพทย์ผู้ผ่านอบรม</li>\n        <li>การจัดเก็บต้องแยกตู้เฉพาะ มีการลงบัญชีรับจ่าย (ยส.5 หรือ บ.จ.5) ทุกครั้ง</li>\n      </ul>"
},
{
      "caseId": "OSPE-SP003",
      "title": "Psychotropic Substances Regulation — Diazepam Control",
      "category": "SAP",
      "courseGroup": "Pharmacy Law",
      "mainGroup": "ความรู้กฎหมายและจรรยาบรรณ",
      "subTopic": "Psychotropic Substances Regulation",
      "disease": "Diazepam Control (Psychotropic Type 4)",
      "difficulty": 2,
      "author": "Poy",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "1wUOsrGZiuBf6tpsoiGHvDeiwZCinUDvepYfdc2Onzrg",
      "scenario": "ผู้ป่วยนำใบสั่งยา Diazepam 5mg จากคลินิกเอกชนมาขอซื้อที่ร้านยา เภสัชกรต้องประเมินว่าจ่ายได้หรือไม่ และอธิบายระเบียบการจัดจำหน่ายและการจัดทำบัญชี วจ.3 และ วจ.4 ตามกฎหมายวัตถุออกฤทธิ์ต่อจิตและประสาท",
      "patientInfoHtml": "<div class=\"table-responsive\"><table class=\"table-patient-info\">\n        <tr><th>รายการ</th><th>ข้อมูล</th></tr>\n        <tr><td>ชื่อ-สกุล</td><td>นาย ยอดชาย เข้มแข็ง</td></tr>\n        <tr><td>อายุ</td><td>50 ปี</td></tr>\n        <tr><td>การวินิจฉัย</td><td>Anxiety and Insomnia</td></tr>\n        <tr><td>ใบสั่งยา</td><td>Diazepam 5mg 1 tab hs prn for sleep (จำนวน 30 เม็ด)</td></tr>\n        <tr><td>คลินิกผู้สั่ง</td><td>คลินิกรักษาใจ นพ. ใจดี มีธรรม</td></tr>\n      </table></div>",
      "contentHtml": "<p class=\"scenario-text\">ผู้ป่วยนำใบสั่งยา Diazepam 5mg จากคลินิกเอกชนมาขอซื้อที่ร้านยา เภสัชกรต้องประเมินว่าจ่ายได้หรือไม่ และอธิบายระเบียบการจัดจำหน่ายและการจัดทำบัญชี วจ.3 และ วจ.4 ตามกฎหมายวัตถุออกฤทธิ์ต่อจิตและประสาท</p>",
      "checklist": [
            {
                  "id": "chk_sp003_1",
                  "text": "ระบุประเภทวัตถุออกฤทธิ์ต่อจิตและประสาทของ Diazepam ว่าเป็นประเภท 4 (หรือ 3)",
                  "score": 2,
                  "group": "การประเมินความถูกต้องทางกฎหมาย",
                  "checked": false
            },
            {
                  "id": "chk_sp003_2",
                  "text": "ประเมินว่าร้านยา ข.ย.1 ที่มีใบอนุญาตขายวัตถุออกฤทธิ์ประเภท 3 หรือ 4 สามารถจ่ายยา Diazepam ตามใบสั่งแพทย์ได้",
                  "score": 2,
                  "group": "การประเมินความถูกต้องทางกฎหมาย",
                  "checked": false
            },
            {
                  "id": "chk_sp003_3",
                  "text": "ตรวจสอบใบสั่งยาต้นฉบับอย่างรอบคอบ (ชื่อผู้ป่วย, วันที่สั่ง, ลายเซ็นแพทย์, เลขใบอนุญาตแพทย์) และห้ามจ่ายยาซ้ำด้วยใบสั่งเดิม",
                  "score": 2,
                  "group": "การประเมินความถูกต้องทางกฎหมาย",
                  "checked": false
            },
            {
                  "id": "chk_sp003_4",
                  "text": "ลงบันทึกรายงานการขายวัตถุออกฤทธิ์ต่อจิตและประสาทใน บัญชี วจ. 3 (บัญชีรับ-จ่าย) และ วจ. 4 (บัญชีเฉพาะราย)",
                  "score": 2,
                  "group": "การควบคุมทางเอกสารและรายงาน",
                  "checked": false
            },
            {
                  "id": "chk_sp003_5",
                  "text": "อธิบายการส่งรายงานสรุปยอดการขายประจำปีให้กับ อย. ภายในระยะเวลาที่กฎหมายกำหนด",
                  "score": 2,
                  "group": "การควบคุมทางเอกสารและรายงาน",
                  "checked": false
            }
      ],
      "noteHtml": "<h4>เฉลย / ข้อมูลสำหรับผู้ตรวจ:</h4>\n      <ul>\n        <li>Diazepam จัดเป็นวัตถุออกฤทธิ์ประเภท 4 ตาม พ.ร.บ.วัตถุที่ออกฤทธิ์ต่อจิตและประสาท พ.ศ. 2559</li>\n        <li>การจำหน่ายในร้านยา ข.ย.1 ต้องจ่ายตามใบสั่งยาของแพทย์แผนปัจจุบันเท่านั้น</li>\n        <li>ต้องจัดทำรายงาน วจ.3 และ วจ.4 เก็บประวัติไว้ตรวจสอบไม่น้อยกว่า 5 ปี</li>\n      </ul>"
}
]};