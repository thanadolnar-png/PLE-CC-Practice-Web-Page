@echo off
setlocal enabledelayedexpansion
title PLE-CC 2569 -- Selective Compile & Auto Push
cls

echo ================================================================
echo   [PLE-CC 2569 RxCU] -- Selective Compile ^& Auto Push
echo   Owner: Thanadol (Maxnum) ^| Auto Deploy to GitHub / Vercel
echo ================================================================
echo.

set "REPO_DIR=C:\Users\thana\Desktop\PLE-CC"
set "WEB_DIR=%~dp0"

:: 1. Setup Git Identity
echo [1/4] Setting Git Identity...
cd /d "%WEB_DIR%"
git config user.name "thanadolnar-png"
git config user.email "thanadol.nar@gmail.com"
git config credential.helper manager
echo       Done.

:: 2. Interactive Selection Menu
echo.
echo ================================================================
echo   กรุณาเลือกรูปแบบการ Compile ข้อมูล:
echo ================================================================
echo   [1] ทั้งหมด (All Cases - ดาวน์โหลดเคสทั้งหมด)
echo   [2] ระบุรหัสเคส (e.g. OSPE-CL83M101 หรือหลายเคสคั่นด้วยวรรค/comma)
echo   [3] ค้นหาตามชื่อเรื่อง / โรค / คำสำคัญ (e.g. Dosage form, Warfarin)
echo   [4] ค้นหาตามหมวดวิชา (Clinic หรือ Product)
echo   [5] ค้นหาตามชุดข้อสอบ / แหล่งที่มา (e.g. Mock RxCU83, เล่มม่วง)
echo ================================================================
set "CHOICE=1"
set /p "CHOICE=เลือกโหมด (กด Enter เลือกข้อ 1): "

set "MODE=all"
set "QUERY="

if "%CHOICE%"=="1" (
    set "MODE=all"
) else if "%CHOICE%"=="2" (
    set "MODE=cases"
    set /p "QUERY=ระบุรหัสเคส (เช่น OSPE-CL83M101): "
) else if "%CHOICE%"=="3" (
    set "MODE=keyword"
    set /p "QUERY=ระบุคำสำคัญ (เช่น Dosage form): "
) else if "%CHOICE%"=="4" (
    set "MODE=category"
    set /p "QUERY=ระบุหมวดวิชา (Clinic หรือ Product): "
) else if "%CHOICE%"=="5" (
    set "MODE=source"
    set /p "QUERY=ระบุแหล่งที่มา/ชุดข้อสอบ (เช่น 2583 หรือ เล่มม่วง): "
) else (
    echo ตัวเลือกไม่ถูกต้อง ทำการเลือกโหมดทั้งหมด (All Cases) เป็นค่าเริ่มต้น
    set "MODE=all"
)

echo.
echo [2/4] Compiling data (Mode: %MODE%, Query: '%QUERY%')...
if exist "%WEB_DIR%scripts\compile_offline_db_python.py" (
    set "SCRIPT_PATH=%WEB_DIR%scripts\compile_offline_db_python.py"
) else (
    set "SCRIPT_PATH=%REPO_DIR%\scripts\compile_offline_db_python.py"
)

if "%QUERY%"=="" (
    python "%SCRIPT_PATH%" --mode %MODE%
) else (
    python "%SCRIPT_PATH%" --mode %MODE% --query "%QUERY%"
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ================================================================
    echo  [ERROR] Compilation failed!
    echo  Please check internet connection or Google Service Account.
    echo ================================================================
    pause
    exit /b 1
)

:: 3. Sync Backup
echo.
echo [3/4] Syncing backup to Website_Backup_v1.3...
if exist "%REPO_DIR%\scripts\sync_backup.py" (
    python "%REPO_DIR%\scripts\sync_backup.py"
)
echo       Done.

:: 4. Git Commit & Push
echo.
echo [4/4] Git add, commit, and push to GitHub...
cd /d "%WEB_DIR%"
git add -A
git commit -m "Auto sync offline DB [%MODE%: %QUERY%] [%DATE% %TIME%]"
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo  [SUCCESS] Compile and Push complete!
    echo  Website has been updated and pushed to origin main!
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo  [WARNING] Git push encountered an issue.
    echo ================================================================
)

echo.
pause
