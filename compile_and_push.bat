@echo off
setlocal enabledelayedexpansion
title PLE-CC 2569 -- One-Click Compile & Auto Push
cls

echo ================================================================
echo   [PLE-CC 2569 RxCU] -- One-Click Compile ^& Auto Push
echo   Owner: Thanadol (Maxnum) ^| Auto Deploy to GitHub / Vercel
echo ================================================================
echo.

:: ---- Paths (แก้ตรงนี้ถ้าย้าย folder) ----
set "REPO_DIR=C:\Users\thana\Desktop\PLE-CC"
set "WEB_DIR=C:\Users\thana\Desktop\PLE-CC\Website\PLE CC Webpage"
:: ------------------------------------------

:: 1. Setup Git Identity
echo [1/4] Setting Git Identity...
cd /d "%WEB_DIR%"
git config user.name "thanadolnar-png"
git config user.email "thanadol.nar@gmail.com"
git config credential.helper manager
echo       Done.

:: 2. Compile Offline Database
echo.
echo [2/4] Compiling data from Google Docs ^& Sheets...
echo       Please wait, this takes ~1-3 minutes...
echo.
cd /d "%REPO_DIR%"
python "scripts\compile_offline_db_python.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ================================================================
    echo  [ERROR] Compilation failed!
    echo  Please check internet connection or Service Account credentials.
    echo ================================================================
    echo.
    pause
    exit /b 1
)

:: 3. Sync Backup
echo.
echo [3/4] Syncing backup to Website_Backup_v1.3...
python "scripts\sync_backup.py"
echo       Done.

:: 4. Git Commit & Push
echo.
echo [4/4] Git add, commit, and push to GitHub...
cd /d "%WEB_DIR%"
git add -A
git status
git commit -m "Auto sync offline DB and UI updates [%DATE% %TIME%]"
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo  [SUCCESS] Push to GitHub complete!
    echo  Vercel is now deploying the latest version automatically.
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo  [WARNING] Push encountered an issue. Please check above.
    echo ================================================================
)

echo.
pause
