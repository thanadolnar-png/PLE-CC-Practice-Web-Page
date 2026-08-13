@echo off
chcp 65001 >nul
title PLE-CC Compile Offline Database

echo.
echo +======================================================+
echo ^|     PLE-CC2 OSPE -- Update Offline Database         ^|
echo ^|  ดึงข้อมูลล่าสุดจาก Google Sheets + Google Docs     ^|
echo +======================================================+
echo.
echo กำลัง Compile ข้อมูล...
echo กรุณารอจนเสร็จ (ปกติใช้เวลา 2-5 นาที)
echo.

cd /d "c:\Users\thana\Desktop\PLE-CC"

python "scripts\compile_offline_db_python.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ==========================================
    echo  X เกิดข้อผิดพลาดในการ Compile!
    echo    ตรวจสอบ Internet หรือ Credential
    echo ==========================================
    pause
    exit /b 1
)

echo.
echo ==========================================
echo  OK  Compile สำเร็จ! อัปเดตไฟล์แล้ว:
echo      - case-data-offline.js
echo      - case-details-offline.js
echo ==========================================
echo.
echo กำลัง Sync Backup v1.3...
python "C:\Users\thana\.gemini\antigravity\brain\57b6891b-abce-4c15-86d2-0e85559910e9\scratch\backup_v1_3.py"

echo.
echo กำลัง Git Commit...
cd /d "c:\Users\thana\Desktop\PLE-CC\Website\PLE CC Webpage"
git add case-data-offline.js case-details-offline.js
git commit -m "data: recompile offline DB with latest Google Docs content"

if %ERRORLEVEL% NEQ 0 (
    echo  [INFO] ไม่มีการเปลี่ยนแปลงใหม่ในไฟล์ offline DB
) else (
    echo  [OK] Commit สำเร็จ! พร้อม git push ขึ้น Vercel
)

echo.
echo ==========================================
echo  ขั้นตอนถัดไป: git push ตามปกติ
echo ==========================================
echo.
pause
