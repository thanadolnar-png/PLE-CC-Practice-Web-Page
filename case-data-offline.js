/**
 * PLE-CC2 OSPE Practice System — Offline Case Database (v3.0)
 * File: case-data-offline.js
 * ===================================================
 * ฐานข้อมูลสำรองสำหรับใช้งานเว็บไซต์แบบ Offline
 * หรือใช้ทดสอบก่อนตั้งค่า Google Apps Script Web App
 */

const OFFLINE_DATA = {
  cases: [
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
      "patientInfoHtml": `<div class="table-responsive"><table class="table-patient-info">
        <tr><th>รายการ</th><th>ข้อมูล</th></tr>
        <tr><td>ชื่อ-สกุล</td><td>นายสมชาย ใจดี</td></tr>
        <tr><td>อายุ</td><td>62 ปี</td></tr>
        <tr><td>โรคประจำตัว</td><td>AF, HT, DM Type 2</td></tr>
        <tr><td>ยาปัจจุบัน</td><td>Warfarin 3mg OD, Metformin 500mg BD, Amlodipine 5mg OD</td></tr>
        <tr><td>ค่า INR ล่าสุด</td><td>1.2 (วันนี้)</td></tr>
        <tr><td>การแพ้ยา</td><td>NKDA (ไม่มีประวัติแพ้ยา)</td></tr>
      </table></div>`,
      "contentHtml": `<p class="scenario-text">ผู้ป่วยชาย อายุ 62 ปี วินิจฉัย Atrial Fibrillation ใหม่ แพทย์สั่ง Warfarin 3 mg วันละครั้ง ก่อนนอน คุณเป็นเภสัชกรที่ต้องให้คำแนะนำยาก่อนผู้ป่วยกลับบ้าน</p>`,
      "checklist": [
        { "id": "chk_cl1", "text": "ทักทายผู้ป่วยและแนะนำตัวเองในฐานะเภสัชกร", "score": 1, "group": "การให้คำแนะนำยา", "checked": false },
        { "id": "chk_cl2", "text": "ยืนยันชื่อ-สกุลและ HN ของผู้ป่วยเพื่อให้ถูกต้องตัว", "score": 1, "group": "การให้คำแนะนำยา", "checked": false },
        { "id": "chk_cl3", "text": "อธิบายว่า Warfarin คือยาต้านการแข็งตัวของเลือด (ละลายลิ่มเลือด) และทำไมต้องใช้ในโรค AF (ป้องกันลิ่มเลือดอุดตันและอัมพาต)", "score": 2, "group": "การให้คำแนะนำยา", "checked": false },
        { "id": "chk_cl4", "text": "อธิบายวิธีการกินยา: กิน 3mg วันละครั้ง ก่อนนอน ทุกวันในเวลาเดียวกัน", "score": 2, "group": "การให้คำแนะนำยา", "checked": false },
        { "id": "chk_cl5", "text": "แนะนำความสำคัญของการเจาะเลือดตรวจค่า INR และบอกช่วงเป้าหมาย (Target INR = 2.0 - 3.0)", "score": 2, "group": "การให้คำแนะนำยา", "checked": false },
        { "id": "chk_cl6", "text": "อธิบายอาการข้างเคียงเรื่องเลือดออกผิดปกติที่ต้องเฝ้าระวัง เช่น แปรงฟันเลือดออก จ้ำฟกช้ำตามตัว ถ่ายดำหรือปัสสาวะสีเข้ม", "score": 2, "group": "การแก้ปัญหาการใช้ยา", "checked": false },
        { "id": "chk_cl7", "text": "แนะนำการกินอาหารที่มีวิตามินเคสูง (ผักใบเขียว บรอกโคลี) ว่าให้กินสม่ำเสมอเป็นประจำ ห้ามเพิ่มหรือลดฮวบฮาบ", "score": 2, "group": "การแก้ปัญหาการใช้ยา", "checked": false },
        { "id": "chk_cl8", "text": "เน้นย้ำเรื่องการห้ามซื้อยาชุด ยาแก้ปวดแก้อักเสบกลุ่ม NSAIDs, Aspirin หรือยาสมุนไพรทานเองเด็ดขาด", "score": 2, "group": "การแก้ปัญหาการใช้ยา", "checked": false }
      ],
      "noteHtml": `<h4>ข้อมูลและเฉลยสำหรับผู้ตรวจ:</h4>
      <ul>
        <li><strong>การจัดการเมื่อลืมกินยา:</strong> หากนึกได้ในวันนั้น ให้กินทันทีที่นึกได้ หากข้ามวันแล้ว ให้ข้ามมื้อนั้นไปเลยและกินมื้อถัดไปตามปกติ ห้ามเบิ้ลยาเด็ดขาด!</li>
        <li><strong>ปฏิกิริยาระหว่างยา (Drug Interaction):</strong> ยาที่เพิ่มฤทธิ์ Warfarin (INR สูงขึ้น): Amiodarone, Fluconazole, Metronidazole, Omeprazole. ยาที่ลดฤทธิ์ Warfarin (INR ต่ำลง): Rifampicin, Carbamazepine, Phenobarbital.</li>
        <li><strong>การปฏิบัติตัวเมื่อเกิดอุบัติเหตุ:</strong> หากมีแผลเล็กๆ ให้กดแผลแน่นๆ 5-10 นาที หากเลือดไม่หยุด หรือมีหัวกระแทกพื้น ให้รีบมาโรงพยาบาลทันที</li>
      </ul>`
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
      "patientInfoHtml": `<div class="table-responsive"><table class="table-patient-info">
        <tr><th>รายการ</th><th>ข้อมูล</th></tr>
        <tr><td>ชื่อ-สกุล</td><td>เด็กชายปัญญา ดีเลิศ</td></tr>
        <tr><td>อายุ</td><td>5 ปี</td></tr>
        <tr><td>โรคประจำตัว</td><td>Atopic Dermatitis (ผิวหนังอักเสบภูมิแพ้)</td></tr>
        <tr><td>ใบสั่งยา</td><td>Cold Cream 30 g apply to dry areas BID</td></tr>
        <tr><td>การแพ้ยา</td><td>NKDA (ไม่มีประวัติแพ้ยา)</td></tr>
      </table></div>`,
      "contentHtml": `<p class="scenario-text">ท่านได้รับใบสั่งยาจากแพทย์ให้เตรียมตำรับ Cold Cream ปริมาณ 30 กรัม สำหรับผู้ป่วยเด็กโรคผิวหนังแห้ง (Atopic Dermatitis) โดยให้คำนวณสูตรตำรับ ชั่งตวงสารผสมเนื้อครีม และเขียนฉลากยาควบคุมพิเศษให้ครบถ้วนถูกต้องตามหลักวิชาชีพเภสัชกรรม (เวลาปฏิบัติการ 4 นาที)</p>`,
      "checklist": [
        { "id": "chk_pd1", "text": "คำนวณปริมาณสารสำคัญในสูตร Cold Cream 30 กรัม ได้ถูกต้อง (Mineral oil 15g, Beeswax 3.6g, Borax 0.24g, Water 7.56g)", "score": 2, "group": "การคำนวณและตั้งตำรับ", "checked": false },
        { "id": "chk_pd2", "text": "ชั่งน้ำหนักบีกเกอร์และสารเคมีแต่ละชนิดด้วยเครื่องชั่ง 2 ตำแหน่งอย่างถูกต้อง", "score": 1, "group": "การคำนวณและตั้งตำรับ", "checked": false },
        { "id": "chk_pd3", "text": "อธิบายขั้นตอนการผสมเฟสน้ำ (Aqueous phase) และเฟสน้ำมัน (Oily phase) ที่อุณหภูมิ 70 องศาเซลเซียส", "score": 2, "group": "การคำนวณและตั้งตำรับ", "checked": false },
        { "id": "chk_pd4", "text": "คนผสมให้เข้ากันจนได้เนื้อครีมขาวเนียนสม่ำเสมอ", "score": 1, "group": "การคำนวณและตั้งตำรับ", "checked": false },
        { "id": "chk_pd5", "text": "เขียนฉลากยาได้ถูกต้องครบถ้วน (ชื่อผู้ป่วย, วิธีใช้: ทาบริเวณผิวแห้งวันละ 2 ครั้ง, วันผลิต, วันหมดอายุ 14 วัน)", "score": 2, "group": "การเขียนฉลากและจ่ายยา", "checked": false },
        { "id": "chk_pd6", "text": "ติดฉลากแดง \"ยาใช้ภายนอก ห้ามรับประทาน\"", "score": 1, "group": "การเขียนฉลากและจ่ายยา", "checked": false },
        { "id": "chk_pd7", "text": "ส่งมอบยาพร้อมให้คำแนะนำการเก็บรักษายาที่อุณหภูมิห้อง หลีกเลี่ยงแสงแดด", "score": 1, "group": "การเขียนฉลากและจ่ายยา", "checked": false }
      ],
      "noteHtml": `<h4>เฉลยและข้อมูลสำหรับผู้ตรวจ:</h4>
      <ul>
        <li><strong>สูตรมาตรฐาน Cold Cream (100g):</strong> Mineral oil 50g, Beeswax 12g, Spermaceti 12g, Sodium borate (Borax) 0.8g, Purified water 25.2g.</li>
        <li><strong>สำหรับ 30g:</strong> Mineral oil 15g, Beeswax 3.6g, Spermaceti 3.6g (หรือใช้วัตถุดิบอื่นทดแทน), Borax 0.24g, Water 7.56g.</li>
        <li><strong>การเก็บรักษา:</strong> ห้ามแช่แข็ง เก็บในภาชนะปิดสนิทป้องกันแสงแดดและความร้อนเพื่อป้องกันการแยกเฟส</li>
      </ul>`
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
      "patientInfoHtml": `<div class="table-responsive"><table class="table-patient-info">
        <tr><th>รายการ</th><th>ข้อมูล</th></tr>
        <tr><td>ชื่อ-สกุล</td><td>นางสาวสมศรี มีสุข</td></tr>
        <tr><td>อายุ</td><td>45 ปี</td></tr>
        <tr><td>โรคประจำตัว</td><td>Insomnia (นอนไม่หลับ)</td></tr>
        <tr><td>ใบสั่งยา</td><td>Lorazepam 2 mg (15 tablets) Take 1 tablet before bedtime</td></tr>
        <tr><td>การแพ้ยา</td><td>NKDA (ไม่มีประวัติแพ้ยา)</td></tr>
      </table></div>`,
      "contentHtml": `<p class="scenario-text">ผู้ป่วยนำใบสั่งยาจากคลินิกเอกชนมาขอซื้อยา Lorazepam 2 mg ในร้านยาของท่าน ให้ท่านทำการตรวจสอบความถูกต้องทางกฎหมายของใบสั่งยา วิเคราะห์ประเภทของยาทางกฎหมาย และปฏิบัติตนตามข้อกำหนดของสำนักงานคณะกรรมการอาหารและยา (อย.) อย่างถูกต้อง (เวลาปฏิบัติการ 4 นาที)</p>`,
      "checklist": [
        { "id": "chk_sp1", "text": "ระบุประเภททางกฎหมายของ Lorazepam ได้ถูกต้องว่าเป็น \"วัตถุออกฤทธิ์ต่อจิตและประสาทประเภท 4\"", "score": 2, "group": "ความรู้กฎหมายและการควบคุม", "checked": false },
        { "id": "chk_sp2", "text": "ตรวจสอบใบสั่งยาและแจ้งผู้ป่วยว่า \"ร้านขายยาแผนปัจจุบัน (ข.ย.1) ไม่สามารถจ่ายวัตถุออกฤทธิ์ประเภท 4 ตามใบสั่งยาแพทย์จากคลินิกได้\"", "score": 2, "group": "ความรู้กฎหมายและการควบคุม", "checked": false },
        { "id": "chk_sp3", "text": "แนะนำให้ผู้ป่วยไปรับยาที่โรงพยาบาลหรือสถานพยาบาลที่ได้รับอนุญาตครอบครองวัตถุออกฤทธิ์โดยตรง", "score": 2, "group": "ความรู้กฎหมายและการควบคุม", "checked": false },
        { "id": "chk_sp4", "text": "อธิบายข้อกฎหมายที่ห้ามร้านขายยาทั่วไปจำหน่ายวัตถุออกฤทธิ์ประเภท 2 และ 4", "score": 1, "group": "ความรู้กฎหมายและการควบคุม", "checked": false },
        { "id": "chk_sp5", "text": "ปฏิเสธการขายยาอย่างสุภาพและแสดงความใส่ใจต่ออาการนอนไม่หลับของผู้ป่วย", "score": 2, "group": "ทักษะจรรยาบรรณวิชาชีพ", "checked": false },
        { "id": "chk_sp6", "text": "บันทึกข้อมูลการให้คำแนะนำทางกฎหมายลงในแบบฟอร์มบันทึกการให้คำปรึกษาของร้านยา", "score": 1, "group": "ทักษะจรรยาบรรณวิชาชีพ", "checked": false }
      ],
      "noteHtml": `<h4>เฉลยและข้อมูลสำหรับผู้ตรวจ:</h4>
      <ul>
        <li><strong>ประเภทวัตถุออกฤทธิ์:</strong> วัตถุออกฤทธิ์ต่อจิตและประสาทประเภท 4 (เช่น Diazepam, Lorazepam, Alprazolam) ห้ามจำหน่ายในร้านขายยาทั่วไป ยกเว้นการจ่ายในสถานพยาบาลของรัฐหรือเอกชนที่มีใบอนุญาตเฉพาะ</li>
        <li><strong>การฝ่าฝืน:</strong> การฝ่าฝืนขายวัตถุออกฤทธิ์ประเภท 4 ในร้านยามีโทษจำคุกและปรับตาม พ.ร.บ. วัตถุที่ออกฤทธิ์ต่อจิตและประสาท</li>
        <li><strong>คำแนะนำเพิ่มเติม:</strong> ให้คำแนะนำผู้ป่วยเสริมด้านสุขวิทยาการนอน (Sleep Hygiene) เช่น หลีกเลี่ยงคาเฟอีนก่อนนอน งดเล่นมือถือ และเข้านอนเป็นเวลา</li>
      </ul>`
    }
  ]
};
