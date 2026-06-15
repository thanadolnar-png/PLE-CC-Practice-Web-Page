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
      "mainGroup": "Anticoagulation",
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
      "mainGroup": "Special Devices",
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
      "mainGroup": "Special Devices",
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
      "caseId": "OSPE-PD001",
      "title": "Compounding — Cold Cream & Labeling",
      "category": "Product",
      "courseGroup": "Compounding - Topical",
      "mainGroup": "Compounding - Topical",
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
      "mainGroup": "Compounding - Topical",
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
      "mainGroup": "Compounding - Oral Liquid",
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
      "mainGroup": "Pharmacy Law",
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
      "mainGroup": "Pharmacy Law",
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
      "mainGroup": "Pharmacy Law",
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
