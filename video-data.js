/**
 * RxCU OSPE Hub — Practical Video Database (คลังคลิปวิดีโอเพื่อการฝึกทักษะ OSPE)
 * Domains: 
 *   - Product (เทคนิคเภสัชกรรมและการเตรียมยา Compounding)
 *   - Clinic (เทคนิคการบริหารยาพิเศษ หัตถการ และคำแนะนำผู้ป่วย)
 * Sources: 
 *   - ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาฯ
 *   - โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
 *   - สื่อการสอนสาธิตทางการแพทย์และโรงพยาบาลมหาวิทยาลัยชั้นนำ (รพ.ศิครินทร์, ม.ขอนแก่น, ม.สงขลานครินทร์, ศิริราช, มหิดล, รพ.มหาชัย, รพ.วิชัยเวช)
 * Total Videos: 77 (Product: 46, Clinic: 31)
 */

const COMPOUNDING_VIDEOS = [
  {
    "id": "T01",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การบด ผสม & หลอม",
    "title": "1. การบดของแข็งด้วยวิธี Trituration",
    "chapter": "เทคนิคที่ 01",
    "url": "https://drive.google.com/file/d/16N_Ko1iBmvwjQAev0gbwz2FMQpvFS7gh/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "16N_Ko1iBmvwjQAev0gbwz2FMQpvFS7gh",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การบด ผสม & หลอม",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T02-1",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การบด ผสม & หลอม",
    "title": "2. การบดสารด้วยวิธี Pulverization by Intervention (ตอนที่ 1)",
    "chapter": "เทคนิคที่ 02-1",
    "url": "https://drive.google.com/file/d/1YxZ_32llEapMCF8rOEfY7BUMJtpcnuwp/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1YxZ_32llEapMCF8rOEfY7BUMJtpcnuwp",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การบด ผสม & หลอม",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T02-2",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การบด ผสม & หลอม",
    "title": "2. การบดสารด้วยวิธี Pulverization by Intervention (ตอนที่ 2)",
    "chapter": "เทคนิคที่ 02-2",
    "url": "https://drive.google.com/file/d/1hueACDWD82fVNbLq3_HQCNrsjrhboska/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1hueACDWD82fVNbLq3_HQCNrsjrhboska",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การบด ผสม & หลอม",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T03",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "3. ส่วนประกอบของเครื่องชั่งและการปรับสมดุล",
    "chapter": "เทคนิคที่ 03",
    "url": "https://drive.google.com/file/d/1kUrEb-cZI92NwFaZlWHDpCHAgHZnOkkr/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1kUrEb-cZI92NwFaZlWHDpCHAgHZnOkkr",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T04-1",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "4. การชั่งสารที่เป็นของแข็ง และการพับกระทง",
    "chapter": "เทคนิคที่ 04-1",
    "url": "https://drive.google.com/file/d/15YOwVNbW4ZCJ7yvfL0aqFgLMixMA_L36/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "15YOwVNbW4ZCJ7yvfL0aqFgLMixMA_L36",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T04-2",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "วิธีการพับกระทง (Paper Folding for Weighing)",
    "chapter": "เทคนิคที่ 04-2",
    "url": "https://drive.google.com/file/d/1qkOhxYu1tg4kBGKbgfdS6O_0NljQifzw/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1qkOhxYu1tg4kBGKbgfdS6O_0NljQifzw",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T05",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "5. การชั่งสารกึ่งแข็ง และการพับกระทง",
    "chapter": "เทคนิคที่ 05",
    "url": "https://drive.google.com/file/d/1REbAfcmtZ7F_ThCN9recqfeyuseko9MS/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1REbAfcmtZ7F_ThCN9recqfeyuseko9MS",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T06",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "6. การชั่งของเหลว",
    "chapter": "เทคนิคที่ 06",
    "url": "https://drive.google.com/file/d/10WU1XBJXpYH6Qs6fx7YJPTsenHd1TsZi/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "10WU1XBJXpYH6Qs6fx7YJPTsenHd1TsZi",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T07",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "7. การชั่งสารปริมาณน้อยด้วยวิธี Aliquot แบบ Solid in Solid",
    "chapter": "เทคนิคที่ 07",
    "url": "https://youtu.be/IraZcaPoby8",
    "type": "youtube",
    "videoId": "IraZcaPoby8",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T08",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "8. การชั่งสารปริมาณน้อยด้วยวิธี Aliquot แบบ Solid in Liquid",
    "chapter": "เทคนิคที่ 08",
    "url": "https://youtu.be/23wphZjQqGM",
    "type": "youtube",
    "videoId": "23wphZjQqGM",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T09",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "9. การชั่งสารปริมาณน้อยด้วยวิธี Aliquot แบบ Liquid in Liquid",
    "chapter": "เทคนิคที่ 09",
    "url": "https://youtu.be/CLQu1RMG3R8",
    "type": "youtube",
    "videoId": "CLQu1RMG3R8",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T10",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "10. การตวงของเหลว",
    "chapter": "เทคนิคที่ 10",
    "url": "https://youtu.be/_AMfwm8TjZ8",
    "type": "youtube",
    "videoId": "_AMfwm8TjZ8",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T11-1",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การกรอง & พับกระดาษกรอง",
    "title": "11. การกรองของเหลว",
    "chapter": "เทคนิคที่ 11-1",
    "url": "https://drive.google.com/file/d/1-SDjp1L9XtiUyJ7zH-wdB3CO42qJmXH_/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1-SDjp1L9XtiUyJ7zH-wdB3CO42qJmXH_",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การกรอง & พับกระดาษกรอง",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T11-2",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การกรอง & พับกระดาษกรอง",
    "title": "การพับกระดาษกรองแบบ Plain filter",
    "chapter": "เทคนิคที่ 11-2",
    "url": "https://drive.google.com/file/d/1_07sPQaYIoMMBdbTKB_NcgoFtkczYnN8/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1_07sPQaYIoMMBdbTKB_NcgoFtkczYnN8",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การกรอง & พับกระดาษกรอง",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T11-3",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การกรอง & พับกระดาษกรอง",
    "title": "การพับกระดาษกรองแบบ Plaited filter",
    "chapter": "เทคนิคที่ 11-3",
    "url": "https://drive.google.com/file/d/1TIo2QmVsbzK5ZhKXvAxo8nnfVe6-wfWL/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1TIo2QmVsbzK5ZhKXvAxo8nnfVe6-wfWL",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การกรอง & พับกระดาษกรอง",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T12",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การบด ผสม & หลอม",
    "title": "12. การผสมผงยาโดยวิธี Trituration",
    "chapter": "เทคนิคที่ 12",
    "url": "https://drive.google.com/file/d/1kzkKTAbnLLpLo04RGHXL2nu9lG6kiCg5/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1kzkKTAbnLLpLo04RGHXL2nu9lG6kiCg5",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การบด ผสม & หลอม",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T13",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การบด ผสม & หลอม",
    "title": "13. การผสมผงยาโดยวิธี Spatulation",
    "chapter": "เทคนิคที่ 13",
    "url": "https://drive.google.com/file/d/1Fly6Cu0W0Z7QxFWhnLwYa0936ulG-l_V/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1Fly6Cu0W0Z7QxFWhnLwYa0936ulG-l_V",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การบด ผสม & หลอม",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T14",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การบด ผสม & หลอม",
    "title": "14. การบดผสมผงยากับยาพื้นขี้ผึ้ง/ครีม โดยวิธี Incorporation by Levigation",
    "chapter": "เทคนิคที่ 14",
    "url": "https://drive.google.com/file/d/1F7poWsptGnOx9SmfJAa8UcTX23EGA6bR/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1F7poWsptGnOx9SmfJAa8UcTX23EGA6bR",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การบด ผสม & หลอม",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "T15",
    "domain": "Product",
    "majorGroup": "หมวด 1: เทคนิคพื้นฐานสำคัญในการเตรียมยา",
    "dosageForm": "การบด ผสม & หลอม",
    "title": "15. การหลอมและการเลือกใช้เครื่องมือก่อความร้อน",
    "chapter": "เทคนิคที่ 15",
    "url": "https://drive.google.com/file/d/1-MqodhGLNqTjP136wzSbmY7U-AOw4Ept/view?usp=sharing",
    "type": "drive",
    "videoId": "",
    "driveId": "1-MqodhGLNqTjP136wzSbmY7U-AOw4Ept",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การบด ผสม & หลอม",
      "Product",
      "Compounding",
      "OSPE"
    ]
  },
  {
    "id": "C00",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "เภสัชภัณฑ์ทั่วไป",
    "title": "Introduction แนะนำคอร์สเรียนเทคนิคทางเภสัชกรรม",
    "chapter": "Introduction",
    "url": "https://youtu.be/Im84WIP1k0s",
    "type": "youtube",
    "videoId": "Im84WIP1k0s",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "เภสัชภัณฑ์ทั่วไป",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C01",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "เครื่องมือและอุปกรณ์",
    "title": "บทที่ 1: เครื่องมือ อุปกรณ์ที่ใช้ในการเตรียมยาทางเภสัชกรรม",
    "chapter": "บทที่ 1",
    "url": "https://youtu.be/Z8myF9hzAfk",
    "type": "youtube",
    "videoId": "Z8myF9hzAfk",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "เครื่องมือและอุปกรณ์",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C02-1",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "บทที่ 2.1: การชั่งสารปริมาณน้อยด้วยวิธี Aliquot แบบ Solid in Solid",
    "chapter": "บทที่ 2.1",
    "url": "https://youtu.be/IraZcaPoby8",
    "type": "youtube",
    "videoId": "IraZcaPoby8",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C02-2",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "บทที่ 2.2: การชั่งสารปริมาณน้อยด้วยวิธี Aliquot แบบ Solid in Liquid",
    "chapter": "บทที่ 2.2",
    "url": "https://youtu.be/23wphZjQqGM",
    "type": "youtube",
    "videoId": "23wphZjQqGM",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C02-3",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "การชั่งตวง & Aliquot",
    "title": "บทที่ 2.3: การตวงสารปริมาณน้อยด้วยวิธี Aliquot แบบ Liquid in Liquid",
    "chapter": "บทที่ 2.3",
    "url": "https://youtu.be/CLQu1RMG3R8",
    "type": "youtube",
    "videoId": "CLQu1RMG3R8",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "การชั่งตวง & Aliquot",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C03-1",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำใส & สารละลาย",
    "title": "บทที่ 3.1: การเตรียมยาน้ำใส (Solutions)",
    "chapter": "บทที่ 3.1",
    "url": "https://youtu.be/O-VD4btB7t4",
    "type": "youtube",
    "videoId": "O-VD4btB7t4",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำใส & สารละลาย",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C03-2",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำใส & สารละลาย",
    "title": "บทที่ 3.2: การเตรียมสารละลายอิ่มตัว (Saturated Solutions)",
    "chapter": "บทที่ 3.2",
    "url": "https://youtu.be/8mSBmZosI0o",
    "type": "youtube",
    "videoId": "8mSBmZosI0o",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำใส & สารละลาย",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C03-3",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำใส & สารละลาย",
    "title": "บทที่ 3.3: การเตรียมยาทิงเจอร์ด้วยวิธี Percolation",
    "chapter": "บทที่ 3.3",
    "url": "https://youtu.be/G5P4fQg8f1c",
    "type": "youtube",
    "videoId": "G5P4fQg8f1c",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำใส & สารละลาย",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C03-4",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาปราศจากเชื้อ (Sterile & Aseptic)",
    "title": "บทที่ 3.4: การแต่งกายเพื่อเตรียมยาปราศจากเชื้อ (Sterile Gowning)",
    "chapter": "บทที่ 3.4",
    "url": "https://youtu.be/s33HwTeIhC0",
    "type": "youtube",
    "videoId": "s33HwTeIhC0",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาปราศจากเชื้อ (Sterile & Aseptic)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C03-5",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาปราศจากเชื้อ (Sterile & Aseptic)",
    "title": "บทที่ 3.5: Aseptic technique ในการเตรียมยาปราศจากเชื้อ",
    "chapter": "บทที่ 3.5",
    "url": "https://youtu.be/f8hWOphl5go",
    "type": "youtube",
    "videoId": "f8hWOphl5go",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาปราศจากเชื้อ (Sterile & Aseptic)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C03-6",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาปราศจากเชื้อ (Sterile & Aseptic)",
    "title": "บทที่ 3.6: การเตรียมยาหยอดตาสำหรับผู้ป่วยเฉพาะคราวจากยาฉีด",
    "chapter": "บทที่ 3.6",
    "url": "https://youtu.be/J62XtOgKNtA",
    "type": "youtube",
    "videoId": "J62XtOgKNtA",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาปราศจากเชื้อ (Sterile & Aseptic)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-1",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำแขวนตะกอน (Suspensions)",
    "title": "บทที่ 4.1: การเตรียมยาน้ำแขวนตะกอนที่มีผงยาดูดน้ำได้ดี",
    "chapter": "บทที่ 4.1",
    "url": "https://youtu.be/94hCCGInYxs",
    "type": "youtube",
    "videoId": "94hCCGInYxs",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำแขวนตะกอน (Suspensions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-2",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำแขวนตะกอน (Suspensions)",
    "title": "บทที่ 4.2: การเตรียมยาน้ำแขวนตะกอนที่มี HPMC เป็นสารแขวนลอย",
    "chapter": "บทที่ 4.2",
    "url": "https://youtu.be/whRoWNh-aFI",
    "type": "youtube",
    "videoId": "whRoWNh-aFI",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำแขวนตะกอน (Suspensions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-3",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำแขวนตะกอน (Suspensions)",
    "title": "บทที่ 4.3: การเตรียมยาน้ำแขวนตะกอนที่มี SCMC เป็นสารแขวนลอย",
    "chapter": "บทที่ 4.3",
    "url": "https://youtu.be/hl9-xBBs684",
    "type": "youtube",
    "videoId": "hl9-xBBs684",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำแขวนตะกอน (Suspensions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-4",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำแขวนตะกอน (Suspensions)",
    "title": "บทที่ 4.4: การเตรียมยาน้ำแขวนตะกอนที่มี Veegum เป็นสารแขวนลอย",
    "chapter": "บทที่ 4.4",
    "url": "https://youtu.be/kU5RzhiLh4M",
    "type": "youtube",
    "videoId": "kU5RzhiLh4M",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำแขวนตะกอน (Suspensions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-5",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำแขวนตะกอน (Suspensions)",
    "title": "บทที่ 4.5: การเตรียมยาน้ำแขวนตะกอนสำหรับผู้ป่วยเฉพาะคราวจากยาเม็ด",
    "chapter": "บทที่ 4.5",
    "url": "https://youtu.be/CDk687YqzuA",
    "type": "youtube",
    "videoId": "CDk687YqzuA",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำแขวนตะกอน (Suspensions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-6",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาน้ำแขวนตะกอน (Suspensions)",
    "title": "บทที่ 4.6: การเตรียมยาน้ำแขวนตะกอนสำหรับผู้ป่วยเฉพาะคราวจากยาแคปซูล",
    "chapter": "บทที่ 4.6",
    "url": "https://youtu.be/Nz_tnav0JVs",
    "type": "youtube",
    "videoId": "Nz_tnav0JVs",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาน้ำแขวนตะกอน (Suspensions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-7",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาอิมัลชัน (Emulsions)",
    "title": "บทที่ 4.7: การเตรียมยาอิมัลชันด้วยวิธี Dry gum",
    "chapter": "บทที่ 4.7",
    "url": "https://youtu.be/CWAhqFM8IqE",
    "type": "youtube",
    "videoId": "CWAhqFM8IqE",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาอิมัลชัน (Emulsions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C04-8",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาอิมัลชัน (Emulsions)",
    "title": "บทที่ 4.8: การเตรียมยาอิมัลชันด้วยวิธี Wet gum",
    "chapter": "บทที่ 4.8",
    "url": "https://youtu.be/dsrrqSTlWUA",
    "type": "youtube",
    "videoId": "dsrrqSTlWUA",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาอิมัลชัน (Emulsions)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C05-1",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาครีม ขี้ผึ้ง & เพสต์",
    "title": "บทที่ 5.1: การเตรียมยาครีมด้วย Beaker method",
    "chapter": "บทที่ 5.1",
    "url": "https://youtu.be/Bosglj6mJ98",
    "type": "youtube",
    "videoId": "Bosglj6mJ98",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาครีม ขี้ผึ้ง & เพสต์",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C05-2",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาครีม ขี้ผึ้ง & เพสต์",
    "title": "บทที่ 5.2: การเตรียมยาขี้ผึ้งด้วยวิธี Fusion",
    "chapter": "บทที่ 5.2",
    "url": "https://youtu.be/u7w0RQJVQ7E",
    "type": "youtube",
    "videoId": "u7w0RQJVQ7E",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาครีม ขี้ผึ้ง & เพสต์",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C05-3",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาครีม ขี้ผึ้ง & เพสต์",
    "title": "บทที่ 5.3: การเตรียมยาครีม/ยาขี้ผึ้งที่มีผงยาละลายน้ำและผงยาไม่ละลายน้ำ",
    "chapter": "บทที่ 5.3",
    "url": "https://youtu.be/zKL17sbEqIY",
    "type": "youtube",
    "videoId": "zKL17sbEqIY",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาครีม ขี้ผึ้ง & เพสต์",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C05-4",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาครีม ขี้ผึ้ง & เพสต์",
    "title": "บทที่ 5.4: การเตรียมยาเพสต์",
    "chapter": "บทที่ 5.4",
    "url": "https://youtu.be/Rupp5sAuY0g",
    "type": "youtube",
    "videoId": "Rupp5sAuY0g",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาครีม ขี้ผึ้ง & เพสต์",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C06-1",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาเจล (Gels)",
    "title": "บทที่ 6.1: การเตรียมยาเจลที่มีตัวยาละลายน้ำดี",
    "chapter": "บทที่ 6.1",
    "url": "https://youtu.be/HL8v4J6krPU",
    "type": "youtube",
    "videoId": "HL8v4J6krPU",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาเจล (Gels)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C06-2",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาเจล (Gels)",
    "title": "บทที่ 6.2: การเตรียมยาเจลที่มีตัวยาละลายน้ำไม่ดี",
    "chapter": "บทที่ 6.2",
    "url": "https://youtu.be/VBEo8H0VoOg",
    "type": "youtube",
    "videoId": "VBEo8H0VoOg",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาเจล (Gels)",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C07-1",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาแคปซูล & ผงยา",
    "title": "บทที่ 7.1: การเตรียมยาแคปซูลสำหรับผู้ป่วยเฉพาะคราวจากยาเม็ด",
    "chapter": "บทที่ 7.1",
    "url": "https://youtu.be/a3E_N_nA1QQ",
    "type": "youtube",
    "videoId": "a3E_N_nA1QQ",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาแคปซูล & ผงยา",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "C07-2",
    "domain": "Product",
    "majorGroup": "หมวด 2: โครงการสื่อคอร์สเรียนออนไลน์ เภสัชภัณฑ์รูปแบบต่างๆ",
    "dosageForm": "ยาแคปซูล & ผงยา",
    "title": "บทที่ 7.2: การเตรียมยาแคปซูลโดยเครื่องบรรจุแคปซูลแบบกึ่งอัตโนมัติ",
    "chapter": "บทที่ 7.2",
    "url": "https://youtu.be/kiLOcRw-85I",
    "type": "youtube",
    "videoId": "kiLOcRw-85I",
    "driveId": "",
    "faculty": "ภาควิชาวิทยาการเภสัชกรรมและเภสัชอุตสาหกรรม คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "ยาแคปซูล & ผงยา",
      "Product",
      "Course",
      "OSPE"
    ]
  },
  {
    "id": "CL-CU01",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "หมากฝรั่งนิโคติน (Nicotine gum)",
    "title": "การใช้หมากฝรั่งนิโคติน (Nicotine gum) อย่างถูกวิธี โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=v6uPOBu2Eq0",
    "type": "youtube",
    "videoId": "v6uPOBu2Eq0",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Smoking Cessation",
      "Nicotine gum",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU02",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "แผ่นแปะนิโคติน (Nicotine Patch)",
    "title": "การใช้แผ่นแปะนิโคติน (Nicotine patch) อย่างถูกวิธี โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=FqVYJOwwyFU",
    "type": "youtube",
    "videoId": "FqVYJOwwyFU",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Smoking Cessation",
      "Nicotine patch",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU03",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "ยาหยอดหู (Ear Drops)",
    "title": "วิธีการใช้ยาหยอดหูอย่างถูกวิธี โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=84WH6mOJaxE",
    "type": "youtube",
    "videoId": "84WH6mOJaxE",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Ear Drops",
      "ยาหยอดหู",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU04",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "ยาหยอดตา (Eye Drops)",
    "title": "วิธีการใช้ยาหยอดตาอย่างถูกวิธี โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=YvDNl0nNga0",
    "type": "youtube",
    "videoId": "YvDNl0nNga0",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Eye Drops",
      "ยาหยอดตา",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU05",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "ยาพ่นจมูก (Nasal Spray)",
    "title": "การใช้ยาพ่นจมูก (Nasal Spray) อย่างถูกต้อง โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=SeG0XAT1akM",
    "type": "youtube",
    "videoId": "SeG0XAT1akM",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Nasal Spray",
      "ยาพ่นจมูก",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU06",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "การล้างจมูก (Nasal Irrigation)",
    "title": "การล้างจมูกด้วยกระบอกฉีดยาอย่างถูกวิธี โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=vCCNvcFipus",
    "type": "youtube",
    "videoId": "vCCNvcFipus",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Nasal Irrigation",
      "การล้างจมูก",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU07",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "การตรวจร่างกายและส่องคอ (Throat Exam)",
    "title": "วิธีการส่องคอใน 1 นาที (Physical Examination) โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=fPRLE6RKxgg",
    "type": "youtube",
    "videoId": "fPRLE6RKxgg",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Physical Examination",
      "การตรวจร่างกาย",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU08",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "ยากินกลุ่ม Bisphosphonate",
    "title": "การรับประทานยากลุ่ม Bisphosphonate (เช่น Alendronate) ให้ถูกต้อง โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=cme17aHzKc0",
    "type": "youtube",
    "videoId": "cme17aHzKc0",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Bisphosphonate",
      "Alendronate",
      "Osteoporosis",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-CU09",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: สื่อการสอนโอสถศาลา คณะเภสัชฯ จุฬาฯ",
    "dosageForm": "ยาเม็ดคุมกำเนิด (Oral Contraceptive Pills)",
    "title": "วิธีใช้ยาเม็ดคุมกำเนิดแบบฮอร์โมนรวม (Combined Oral Contraceptives) โดยโอสถศาลา",
    "chapter": "โอสถศาลา จุฬาฯ",
    "url": "https://www.youtube.com/watch?v=M66Duy8kdbI",
    "type": "youtube",
    "videoId": "M66Duy8kdbI",
    "driveId": "",
    "faculty": "โอสถศาลา คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    "tags": [
      "Clinic",
      "OSPE",
      "Oral Contraceptives",
      "ยาคุมกำเนิด",
      "โอสถศาลา",
      "จุฬาฯ"
    ]
  },
  {
    "id": "CL-INH01",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่น MDI (Evohaler)",
    "title": "How to Use | วิธีการสูดยา Evohaler (MDI) สำหรับโรคหอบหืด/ถุงลมโป่งพอง",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=6jxrupDmhKY",
    "type": "youtube",
    "videoId": "6jxrupDmhKY",
    "driveId": "",
    "faculty": "โรงพยาบาลศิครินทร์ (Sikarin Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "MDI",
      "Evohaler",
      "Inhaler",
      "Asthma",
      "COPD",
      "ศิครินทร์"
    ]
  },
  {
    "id": "CL-INH02",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่น MDI ร่วมกับกระบอกต่อ (Spacer / Aerochamber)",
    "title": "วิธีการใช้ยาพ่นสูด MDI ร่วมกับอุปกรณ์ช่วยพ่นยา (Spacer / AeroChamber)",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=-BL1cdEvlGk",
    "type": "youtube",
    "videoId": "-BL1cdEvlGk",
    "driveId": "",
    "faculty": "คลินิกสูดพ่น MDKKU คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น",
    "tags": [
      "Clinic",
      "OSPE",
      "MDI with Spacer",
      "Aerochamber",
      "Asthma",
      "Pediatrics"
    ]
  },
  {
    "id": "CL-INH03",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่น Turbuhaler (DPI)",
    "title": "วิธีการใช้ยาพ่นสูดชนิดผงแห้ง Turbuhaler (Dry Powder Inhaler)",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=oAHNJ2ghLTw",
    "type": "youtube",
    "videoId": "oAHNJ2ghLTw",
    "driveId": "",
    "faculty": "กลุ่มงานเภสัชกรรม โรงพยาบาลสงขลานครินทร์",
    "tags": [
      "Clinic",
      "OSPE",
      "Turbuhaler",
      "DPI",
      "Symbicort",
      "Asthma",
      "COPD"
    ]
  },
  {
    "id": "CL-INH04A",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่น Accuhaler / Diskus (DPI)",
    "title": "วิธีการใช้ยาพ่นสูดชนิดผงแห้ง Accuhaler (Diskus Inhaler) โดย รพ. มหาชัย",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=uxP-ctq5ZwE",
    "type": "youtube",
    "videoId": "uxP-ctq5ZwE",
    "driveId": "",
    "faculty": "โรงพยาบาลมหาชัย (Mahachai Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "Accuhaler",
      "Diskus",
      "Seretide",
      "Asthma",
      "COPD"
    ]
  },
  {
    "id": "CL-INH04B",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่น Accuhaler / Diskus (DPI)",
    "title": "How to Use | วิธีการสูดยา Accuhaler สำหรับโรคหอบหืดและปอดอุดกั้นเรื้อรัง",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=h_cI9-QfKSg",
    "type": "youtube",
    "videoId": "h_cI9-QfKSg",
    "driveId": "",
    "faculty": "โรงพยาบาลศิครินทร์ (Sikarin Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "Accuhaler",
      "Diskus",
      "Asthma",
      "COPD",
      "ศิครินทร์"
    ]
  },
  {
    "id": "CL-INH05",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่นละอองละเอียด Respimat (SMI)",
    "title": "วิธีการประกอบและใช้งานเครื่องพ่นยาละอองละเอียด Respimat Soft Mist Inhaler",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=c-1CtfVISbA",
    "type": "youtube",
    "videoId": "c-1CtfVISbA",
    "driveId": "",
    "faculty": "ศูนย์การแพทย์กาญจนาภิเษก คณะแพทยศาสตร์ศิริราชพยาบาล",
    "tags": [
      "Clinic",
      "OSPE",
      "Respimat",
      "Soft Mist Inhaler",
      "Spiriva",
      "Combivent",
      "COPD"
    ]
  },
  {
    "id": "CL-INH06",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่นแบบบรรจุแคปซูล Handihaler (DPI)",
    "title": "How to Use | วิธีการสูดยา Handihaler ชนิดแคปซูล สำหรับผู้ป่วยโรคหอบหืด/ปอดอุดกั้น",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=I8YEutsONBU",
    "type": "youtube",
    "videoId": "I8YEutsONBU",
    "driveId": "",
    "faculty": "โรงพยาบาลศิครินทร์ (Sikarin Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "Handihaler",
      "Spiriva Handihaler",
      "DPI",
      "COPD",
      "ศิครินทร์"
    ]
  },
  {
    "id": "CL-INH07",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่นแบบบรรจุแคปซูล Breezhaler (DPI)",
    "title": "วิธีการใช้ยาพ่นสูดชนิดแคปซูล Breezhaler Inhaler",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=tqajOb1gQdE",
    "type": "youtube",
    "videoId": "tqajOb1gQdE",
    "driveId": "",
    "faculty": "โรงพยาบาลมหาชัย (Mahachai Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "Breezhaler",
      "Onbrez",
      "Ultibro",
      "COPD"
    ]
  },
  {
    "id": "CL-INH08",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่นชนิดผงแห้ง Ellipta (DPI)",
    "title": "วิธีการใช้ยาพ่นสูดชนิดผงแห้ง Ellipta Inhaler",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=G8ROaHZ2Xrk",
    "type": "youtube",
    "videoId": "G8ROaHZ2Xrk",
    "driveId": "",
    "faculty": "ศูนย์การแพทย์กาญจนาภิเษก คณะแพทยศาสตร์ศิริราชพยาบาล",
    "tags": [
      "Clinic",
      "OSPE",
      "Ellipta",
      "Relvar",
      "Trelegy",
      "Anoro",
      "Asthma",
      "COPD"
    ]
  },
  {
    "id": "CL-INH09",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: เทคนิคการใช้ยาสูดพ่นทางเดินหายใจ (Inhalers)",
    "dosageForm": "ยาสูดพ่นชนิดผงแห้ง Easyhaler (DPI)",
    "title": "How to Use | วิธีการสูดยา Easyhaler ชนิดผงแห้ง สำหรับโรคหอบหืด/ปอดอุดกั้น",
    "chapter": "ยาสูดพ่นทางเดินหายใจ",
    "url": "https://www.youtube.com/watch?v=ymFTH6e4FVU",
    "type": "youtube",
    "videoId": "ymFTH6e4FVU",
    "driveId": "",
    "faculty": "โรงพยาบาลศิครินทร์ (Sikarin Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "Easyhaler",
      "Bufomix",
      "Asthma",
      "COPD",
      "ศิครินทร์"
    ]
  },
  {
    "id": "CL-EXT01",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "ยาพ่นจมูก (Nasal Spray)",
    "title": "วิธีการใช้ยาพ่นจมูก (Nasal Spray) อย่างถูกวิธี",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=dgoOHV5AfQM",
    "type": "youtube",
    "videoId": "dgoOHV5AfQM",
    "driveId": "",
    "faculty": "Nasol Spray สื่อสาธิตการใช้ยาพ่นจมูก",
    "tags": [
      "Clinic",
      "OSPE",
      "Nasal Spray",
      "Allergic Rhinitis"
    ]
  },
  {
    "id": "CL-EXT02",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "การล้างจมูก (Nasal Irrigation)",
    "title": "ขั้นตอนการล้างจมูกด้วยน้ำเกลือและไซริงค์อย่างถูกวิธีและปลอดภัย",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=cSCRXFlqgfc",
    "type": "youtube",
    "videoId": "cSCRXFlqgfc",
    "driveId": "",
    "faculty": "We Mahidol มหาวิทยาลัยมหิดล",
    "tags": [
      "Clinic",
      "OSPE",
      "Nasal Irrigation",
      "NSS Flush",
      "Sinusitis"
    ]
  },
  {
    "id": "CL-EXT03",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "ยาหยอดตา (Eye Drops)",
    "title": "วิธีการใช้ยาหยอดตา (Eye Drops) อย่างถูกวิธีและไม่ปนเปื้อน",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=vRokfQV4GP8",
    "type": "youtube",
    "videoId": "vRokfQV4GP8",
    "driveId": "",
    "faculty": "โรงพยาบาลวิชัยเวช อินเตอร์เนชั่นแนล หนองแขม",
    "tags": [
      "Clinic",
      "OSPE",
      "Eye Drops",
      "Ophthalmic",
      "Glaucoma"
    ]
  },
  {
    "id": "CL-EXT04",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "ยาป้ายตา (Eye Ointment)",
    "title": "วิธีการใช้ยาป้ายตา (Eye Ointment) อย่างถูกต้องตามหลักวิชาชีพ",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=gLb7rgmSxDw",
    "type": "youtube",
    "videoId": "gLb7rgmSxDw",
    "driveId": "",
    "faculty": "โรงพยาบาลวิชัยเวช อินเตอร์เนชั่นแนล หนองแขม",
    "tags": [
      "Clinic",
      "OSPE",
      "Eye Ointment",
      "Ophthalmic"
    ]
  },
  {
    "id": "CL-EXT05",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "ยาหยอดหู (Ear Drops)",
    "title": "วิธีการใช้ยาหยอดหู (Ear Drops) ในผู้ใหญ่และเด็กเล็ก",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=5uXbyzIh3qU",
    "type": "youtube",
    "videoId": "5uXbyzIh3qU",
    "driveId": "",
    "faculty": "โรงพยาบาลวิชัยเวช อินเตอร์เนชั่นแนล หนองแขม",
    "tags": [
      "Clinic",
      "OSPE",
      "Ear Drops",
      "Otitis Externa",
      "Otitis Media"
    ]
  },
  {
    "id": "CL-EXT06",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "ยาเหน็บทวารหนัก (Rectal Suppositories)",
    "title": "วิธีการใช้ยาเหน็บทวารหนัก (Rectal Suppository) อย่างถูกต้อง",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=7IGB-C-3XRE",
    "type": "youtube",
    "videoId": "7IGB-C-3XRE",
    "driveId": "",
    "faculty": "โรงพยาบาลวิชัยเวช อินเตอร์เนชั่นแนล หนองแขม",
    "tags": [
      "Clinic",
      "OSPE",
      "Rectal Suppository",
      "Hemorrhoids",
      "Fever"
    ]
  },
  {
    "id": "CL-EXT07",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "ยาเหน็บช่องคลอด (Vaginal Suppositories)",
    "title": "วิธีการใช้ยาเหน็บช่องคลอดและอุปกรณ์ช่วยสอด (Vaginal Suppository)",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=K40ePLM8Wak",
    "type": "youtube",
    "videoId": "K40ePLM8Wak",
    "driveId": "",
    "faculty": "โรงพยาบาลวิชัยเวช อินเตอร์เนชั่นแนล หนองแขม",
    "tags": [
      "Clinic",
      "OSPE",
      "Vaginal Suppository",
      "Vaginitis",
      "Candidiasis"
    ]
  },
  {
    "id": "CL-EXT08",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาใช้ภายนอกและหัตถการเฉพาะทาง (Special Dosage Forms)",
    "dosageForm": "ยาสวนทวารหนัก (Enema)",
    "title": "วิธีการใช้ยาสวนทวารหนักสำหรับอาการท้องผูก (Enema)",
    "chapter": "ยาใช้เฉพาะที่และภายนอก",
    "url": "https://www.youtube.com/watch?v=nBgFRDndJkI",
    "type": "youtube",
    "videoId": "nBgFRDndJkI",
    "driveId": "",
    "faculty": "กลุ่มงานเภสัชกรรม โรงพยาบาลเมตตาประชารักษ์ (วัดไร่ขิง)",
    "tags": [
      "Clinic",
      "OSPE",
      "Enema",
      "Constipation",
      "ยาสวนทวาร"
    ]
  },
  {
    "id": "CL-INJ01A",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาฉีดและยาอมใต้ลิ้น (Injections & Special Administration)",
    "dosageForm": "ปากกาฉีดยาอินซูลิน (Insulin Pen)",
    "title": "How to Use | วิธีการฉีดยาอินซูลิน (แบบปากกา Insulin Pen) สำหรับผู้ป่วยเบาหวาน",
    "chapter": "ยาฉีดและยาเฉพาะทาง",
    "url": "https://www.youtube.com/watch?v=W_fRodT5VT4",
    "type": "youtube",
    "videoId": "W_fRodT5VT4",
    "driveId": "",
    "faculty": "โรงพยาบาลศิครินทร์ (Sikarin Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "Insulin Pen",
      "Diabetes",
      "Subcutaneous Injection",
      "ศิครินทร์"
    ]
  },
  {
    "id": "CL-INJ01B",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาฉีดและยาอมใต้ลิ้น (Injections & Special Administration)",
    "dosageForm": "กระบอกฉีดยาอินซูลิน (Insulin Syringe)",
    "title": "How to Use | วิธีการฉีดยาอินซูลิน (แบบขวด & ไซริงค์) สำหรับผู้ป่วยเบาหวาน",
    "chapter": "ยาฉีดและยาเฉพาะทาง",
    "url": "https://www.youtube.com/watch?v=JQD6JMq_vgU",
    "type": "youtube",
    "videoId": "JQD6JMq_vgU",
    "driveId": "",
    "faculty": "โรงพยาบาลศิครินทร์ (Sikarin Hospital)",
    "tags": [
      "Clinic",
      "OSPE",
      "Insulin Syringe",
      "Diabetes",
      "Insulin Vial",
      "ศิครินทร์"
    ]
  },
  {
    "id": "CL-INJ02",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาฉีดและยาอมใต้ลิ้น (Injections & Special Administration)",
    "dosageForm": "กระบอกฉีดยาอินซูลิน (Insulin Syringe)",
    "title": "วิธีการดูดยาและการฉีดอินซูลินด้วยไซริงค์ (Insulin Syringe & Vial)",
    "chapter": "ยาฉีดและยาเฉพาะทาง",
    "url": "https://www.youtube.com/watch?v=NQrADpM77js",
    "type": "youtube",
    "videoId": "NQrADpM77js",
    "driveId": "",
    "faculty": "โรงพยาบาลวิชัยเวช อินเตอร์เนชั่นแนล อ้อมน้อย",
    "tags": [
      "Clinic",
      "OSPE",
      "Insulin Syringe",
      "Diabetes",
      "Insulin Vial"
    ]
  },
  {
    "id": "CL-INJ03",
    "domain": "Clinic",
    "majorGroup": "หมวดคลินิก: ยาฉีดและยาอมใต้ลิ้น (Injections & Special Administration)",
    "dosageForm": "ยาอมใต้ลิ้น (Sublingual Nitrate / ISDN / NTG)",
    "title": "วิธีการใช้ยาอมใต้ลิ้นรักษาอาการแน่นหน้าอก (Nitroglycerin / ISDN Sublingual)",
    "chapter": "ยาฉีดและยาเฉพาะทาง",
    "url": "https://www.youtube.com/watch?v=YHcCpEi-vfs",
    "type": "youtube",
    "videoId": "YHcCpEi-vfs",
    "driveId": "",
    "faculty": "ศูนย์โรคหัวใจสิริกิติ์ โรงพยาบาลสงขลานครินทร์ (THE HEART BY QSHC)",
    "tags": [
      "Clinic",
      "OSPE",
      "Sublingual Nitrate",
      "ISDN",
      "NTG",
      "Angina Pectoris",
      "CAD"
    ]
  }
];

if (typeof window !== 'undefined') {
  window.COMPOUNDING_VIDEOS = COMPOUNDING_VIDEOS;
  window.OSPE_VIDEO_DATABASE = COMPOUNDING_VIDEOS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPOUNDING_VIDEOS, OSPE_VIDEO_DATABASE: COMPOUNDING_VIDEOS };
}
