@echo off
setlocal enabledelayedexpansion
title PLE-CC 2569 -- One-Click Compile & Auto Push to Vercel
cls

echo ================================================================
echo   [PLE-CC 2569 RxCU] -- One-Click Compile & Auto Push
echo   Owner: Thanadol (Maxnum) | Auto Deploy to GitHub / Vercel
echo ================================================================
echo.

cd /d "%~dp0"

:: 1. Setup Git Identity (Auto configured to thanadolnar-png)
echo [1/4] Configuring Git Identity (Auto)...
git config user.name "thanadolnar-png"
git config user.email "thanadol.nar@gmail.com"
git config credential.helper manager

:: 2. Compile Offline Database from Google Docs & Sheets
echo.
echo [2/4] Compiling data from Google Docs & Sheets (compressing images)...
echo       Please wait, this takes ~20-40 seconds...
cd /d "%~dp0..\.."
python "scripts\compile_offline_db_python.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ================================================================
    echo  [ERROR] Compilation failed!
    echo  Please check internet connection or Google Service Account.
    echo ================================================================
    pause
    exit /b 1
)

:: 3. Sync Backup to Website_Backup_v1.3
echo.
echo [3/4] Syncing to Website_Backup_v1.3...
python "scripts\sync_backup.py"

:: 4. Auto Git Commit and Push to GitHub & Vercel
echo.
echo [4/4] Auto Git Commit & Push to GitHub (Vercel Auto-Deploy)...
cd /d "%~dp0"
git add -A
git commit -m "Auto sync offline DB and UI updates [%DATE% %TIME%]"
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo  [SUCCESS] Compile and Push to GitHub complete!
    echo  Vercel is now deploying the latest version automatically!
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo  [WARNING] Git commit succeeded, but push encountered an issue.
    echo ================================================================
)

echo.
pause
