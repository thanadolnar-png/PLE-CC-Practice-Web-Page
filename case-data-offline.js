/**
 * PLE-CC2 OSPE Practice System — Offline Case Database
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
      "caseId": "OSPE-PR001",
      "title": "Cream Compounding — Hydrocortisone 1%",
      "category": "Product",
      "courseGroup": "Compounding - Topical",
      "mainGroup": "การเตรียมยา",
      "subTopic": "Cream Compounding",
      "disease": "Topical Corticosteroid Preparation",
      "difficulty": 2,
      "author": "Min",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "dummy_pr001",
      "scenario": "ผู้ป่วยถือใบสั่งยา: Hydrocortisone cream 1% จำนวน 30g คุณต้องเตรียมยาตำรับนี้โดยใช้วัตถุดิบที่มีในห้องปฏิบัติการ และเขียนฉลากยาให้ครบถ้วนถูกต้องตามหลักเกณฑ์",
      "patientInfoHtml": `<div class="table-responsive"><table class="table-patient-info">
        <tr><th>รายการ</th><th>ข้อมูล</th></tr>
        <tr><td>ชื่อ-สกุล</td><td>นางสาวมานี มีสุข</td></tr>
        <tr><td>อายุ</td><td>28 ปี</td></tr>
        <tr><td>การวินิจฉัย</td><td>Atopic Dermatitis (ผื่นผิวหนังอักเสบภูมิแพ้)</td></tr>
        <tr><td>ใบสั่งยา</td><td>Hydrocortisone 1% cream 30g apply bid (ทาวันละ 2 ครั้ง)</td></tr>
        <tr><td>การแพ้ยา</td><td>NKDA (ไม่มีประวัติแพ้ยา)</td></tr>
      </table></div>`,
      "contentHtml": `<p class="scenario-text">ผู้ป่วยถือใบสั่งยา: Hydrocortisone cream 1% จำนวน 30g คุณต้องเตรียมยาตำรับนี้โดยใช้วัตถุดิบที่มีในห้องปฏิบัติการ และเขียนฉลากยาให้ครบถ้วนถูกต้องตามหลักเกณฑ์</p>`,
      "checklist": [
        { "id": "chk_pr1", "text": "คำนวณปริมาณตัวยา Hydrocortisone powder ที่ต้องใช้ได้ถูกต้อง: 1% ของ 30g = 0.3g", "score": 2, "group": "การคำนวณตำรับและขนาดยา", "checked": false },
        { "id": "chk_pr2", "text": "คำนวณปริมาณ Cream Base ที่ต้องชั่งได้ถูกต้อง: 30g - 0.3g = 29.7g", "score": 1, "group": "การคำนวณตำรับและขนาดยา", "checked": false },
        { "id": "chk_pr3", "text": "ชั่งตัวยา Hydrocortisone powder ได้น้ำหนักถูกต้อง (0.3g ± 5% หรือช่วง 0.285 - 0.315g)", "score": 1, "group": "การเตรียมยา", "checked": false },
        { "id": "chk_pr4", "text": "ชั่ง Cream Base ได้น้ำหนักถูกต้อง (29.7g ± 5% หรือช่วง 28.2 - 31.2g)", "score": 1, "group": "การเตรียมยา", "checked": false },
        { "id": "chk_pr5", "text": "ใช้วิธีผสมแบบ Geometric Dilution โดยนำตัวยาผงผสมกับเบสครีมปริมาณเท่าๆ กันก่อน แล้วค่อยๆ เติมเบสที่เหลือ", "score": 2, "group": "การเตรียมยา", "checked": false },
        { "id": "chk_pr6", "text": "บดผสมยาครีมได้เนื้อเนียนสม่ำเสมอเป็นเนื้อเดียวกัน และบรรจุลงในกระปุกบรรจุยาได้เรียบร้อย ไม่มีฟองอากาศ", "score": 1, "group": "การเตรียมยา", "checked": false },
        { "id": "chk_pr7", "text": "เขียนฉลากยาครบถ้วน: ชื่อผู้ป่วย, วิธีใช้ (ทาบริเวณที่เป็นผื่นบางๆ วันละ 2 ครั้ง เช้า-เย็น), วันผลิต, วันหมดอายุ (BUD)", "score": 2, "group": "การเขียนฉลากและจ่ายยา", "checked": false },
        { "id": "chk_pr8", "text": "กำหนด Beyond-Use Date (BUD) ของครีมผสมทาภายนอกไม่เกิน 30 วันนับจากวันเตรียม", "score": 2, "group": "การเขียนฉลากและจ่ายยา", "checked": false }
      ],
      "noteHtml": `<h4>เฉลยและข้อมูลประกอบคำประเมิน:</h4>
      <ul>
        <li><strong>การชั่งยา:</strong> เภสัชกรต้องตรวจสอบความสะอาดของเครื่องชั่ง ปรับเซ็ตศูนย์ (Tare) และชั่งสารอย่างระมัดระวัง</li>
        <li><strong>Beyond-Use Date (BUD):</strong> ยาครีมกึ่งแข็งประเภทผสมจำเพาะราย (Compounded Topical Semi-solid) ตามหลักเภสัชกรรมปฏิบัติมีอายุไม่เกิน 30 วันที่อุณหภูมิห้อง</li>
        <li><strong>คำแนะนำการใช้ยา:</strong> ทาบางๆ บริเวณที่เป็นแผล หลีกเลี่ยงบริเวณตาหรือเนื้อเยื่ออ่อน และล้างมือให้สะอาดหลังทาทุกครั้ง</li>
      </ul>`
    },
    {
      "caseId": "OSPE-SP001",
      "title": "Pharmacy Law — ยาควบคุมพิเศษ Morphine",
      "category": "SAP",
      "courseGroup": "Pharmacy Law",
      "mainGroup": "ความรู้กฎหมายและจรรยาบรรณ",
      "subTopic": "Narcotic Drug Handling",
      "disease": "Drug Act, Controlled Substance",
      "difficulty": 2,
      "author": "Poy",
      "createdDate": "15/06/2026",
      "isActive": true,
      "docId": "dummy_sp001",
      "scenario": "เภสัชกรประจำร้านขายยา ข.ย.1 ได้รับใบสั่งยาแก้ปวด Morphine 10mg oral solution จากผู้ป่วยโรคมะเร็ง คุณต้องตรวจสอบความถูกต้องตามกฎหมาย และดำเนินการจัดการกับใบสั่งยานี้ให้ถูกต้องตาม พ.ร.บ. ยาเสพติดให้โทษ",
      "patientInfoHtml": `<div class="table-responsive"><table class="table-patient-info">
        <tr><th>รายการ</th><th>ข้อมูล</th></tr>
        <tr><td>ชื่อ-สกุล</td><td>นายวิชัย รักษา</td></tr>
        <tr><td>อายุ</td><td>55 ปี</td></tr>
        <tr><td>การวินิจฉัย</td><td>Lung Cancer with Chronic Pain (มะเร็งปอดที่มีอาการปวดรุนแรง)</td></tr>
        <tr><td>ใบสั่งยา</td><td>Morphine 10mg oral solution, 5mL q4h PRN pain (จำนวน 30 ขวด)</td></tr>
        <tr><td>แพทย์ผู้สั่ง</td><td>นพ.สมหมาย ยาดี (ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ 12345)</td></tr>
      </table></div>`,
      "contentHtml": `<p class="scenario-text">เภสัชกรประจำร้านขายยา ข.ย.1 ได้รับใบสั่งยาแก้ปวด Morphine 10mg oral solution จากผู้ป่วยโรคมะเร็ง คุณต้องตรวจสอบความถูกต้องตามกฎหมาย และดำเนินการจัดการกับใบสั่งยานี้ให้ถูกต้องตาม พ.ร.บ. ยาเสพติดให้โทษ</p>`,
      "checklist": [
        { "id": "chk_sp1", "text": "ระบุประเภทกฎหมายได้ถูกต้องว่า Morphine จัดเป็นยาเสพติดให้โทษในประเภท 2 (น.2)", "score": 2, "group": "ความรู้กฎหมายและจรรยาบรรณ", "checked": false },
        { "id": "chk_sp2", "text": "ตรวจสอบว่าร้านยามีใบอนุญาตจำหน่ายยาเสพติดประเภท 2 (ย.ส.2) หรือไม่ หากไม่มี ห้ามจ่ายเด็ดขาด", "score": 2, "group": "ความรู้กฎหมายและจรรยาบรรณ", "checked": false },
        { "id": "chk_sp3", "text": "ตรวจสอบความสมบูรณ์ของใบสั่งยา: ชื่อสถานพยาบาล, ชื่อแพทย์ประกอบวิชาชีพ, ลายเซ็น, วันที่สั่งยา, รายละเอียดผู้ป่วยและปริมาณที่สั่ง", "score": 2, "group": "ความรู้กฎหมายและจรรยาบรรณ", "checked": false },
        { "id": "chk_sp4", "text": "ระบุข้อบังคับการเก็บรักษา: ต้องเก็บในตู้โลหะที่แข็งแรง มีกุญแจปิดมิดชิด แยกจากยาปกติทั่วไป", "score": 2, "group": "ความรู้กฎหมายและจรรยาบรรณ", "checked": false },
        { "id": "chk_sp5", "text": "อธิบายขั้นตอนรายงาน: ต้องลงบันทึกในสมุดบัญชีรับ-จ่ายยาเสพติดให้โทษประเภท 2 (แบบ ย.ส. ๕) ส่งรายงานทุกสิ้นเดือน", "score": 2, "group": "ความรู้กฎหมายและจรรยาบรรณ", "checked": false }
      ],
      "noteHtml": `<h4>เฉลยและข้อมูลกฎหมายประกอบ:</h4>
      <ul>
        <li><strong>การจำหน่ายยาเสพติดประเภท 2 ในร้านยา:</strong> ต้องจำหน่ายตามใบสั่งยาของผู้ประกอบวิชาชีพเวชกรรม ทันตกรรม หรือสัตวแพทย์ชั้นหนึ่งเท่านั้น และจ่ายไม่เกินปริมาณสำหรับการใช้ 30 วัน</li>
        <li><strong>สมุด ย.ส. ๕:</strong> เป็นบัญชีรับจ่ายยาเสพติดให้โทษในประเภท 2 ต้องเก็บรักษาบัญชีนี้ไว้เป็นเวลาไม่น้อยกว่า 2 ปีนับตั้งแต่วันลงรายการครั้งสุดท้าย</li>
        <li><strong>ใบสั่งยาเสพติดประเภท 2:</strong> ร้านยาผู้จำหน่ายต้องเก็บรักษาใบสั่งยาตัวจริงไว้เป็นหลักฐานไม่น้อยกว่า 2 ปี</li>
      </ul>`
    }
  ]
};
