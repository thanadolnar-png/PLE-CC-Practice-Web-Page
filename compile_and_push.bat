@echo off
setlocal EnableExtensions EnableDelayedExpansion
title PLE-CC 2569 -- Selective Compile ^& Auto Push to Vercel
cls

echo ================================================================
echo   [PLE-CC 2569 RxCU] -- Selective Compile ^& Auto Push
echo   Owner: Thanadol (Maxnum) ^| Auto Deploy to GitHub / Vercel
echo ================================================================
echo.

cd /d "%~dp0"

:: 1. Setup Git Identity
echo [1/4] Configuring Git Identity (Auto)...
cd /d "%~dp0Website\PLE CC Webpage"
git config user.name "thanadolnar-png"
git config user.email "thanadol.nar@gmail.com"
git config credential.helper manager
cd /d "%~dp0"

:: 2. Interactive Selection Menu
echo.
echo ================================================================
echo   Please select Compile Mode:
echo ================================================================
echo   [1] All Cases (Download all active cases from Sheet)
echo   [2] By Case IDs (e.g. OSPE-CL83M101 or comma-separated)
echo   [3] By Topic / Disease / Keyword (e.g. Dosage form, Warfarin)
echo   [4] By Category (Clinic or Product)
echo   [5] By Exam Set / Source (e.g. Mock RxCU83, Purple Book)
echo ================================================================
set "CHOICE=1"
set /p "CHOICE=Select mode [1-5] (Press Enter for [1] All): "

set "MODE=all"
set "QUERY="

if "%CHOICE%"=="2" goto :MODE_CASES
if "%CHOICE%"=="3" goto :MODE_KEYWORD
if "%CHOICE%"=="4" goto :MODE_CATEGORY
if "%CHOICE%"=="5" goto :MODE_SOURCE
goto :RUN_COMPILE

:MODE_CASES
set "MODE=cases"
set /p "QUERY=Enter Case ID(s) (e.g. OSPE-CL83M101): "
goto :RUN_COMPILE

:MODE_KEYWORD
set "MODE=keyword"
set /p "QUERY=Enter Keyword (e.g. Dosage form): "
goto :RUN_COMPILE

:MODE_CATEGORY
set "MODE=category"
set /p "QUERY=Enter Category (Clinic or Product): "
goto :RUN_COMPILE

:MODE_SOURCE
set "MODE=source"
set /p "QUERY=Enter Source/Exam Set (e.g. 2583 or Purple Book): "
goto :RUN_COMPILE

:RUN_COMPILE
echo.
echo [2/4] Compiling data (Mode: !MODE!, Query: '!QUERY!')...
if "!QUERY!"=="" (
    python "scripts\compile_offline_db_python.py" --mode !MODE!
) else (
    python "scripts\compile_offline_db_python.py" --mode !MODE! --query "!QUERY!"
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

:: 3. Sync Backup to Website_Backup_v1.3
echo.
echo [3/4] Syncing to Website_Backup_v1.3...
python "scripts\sync_backup.py"

:: 4. Auto Git Commit and Push to GitHub & Vercel
echo.
echo [4/4] Auto Git Commit ^& Push to GitHub (Vercel Auto-Deploy)...
cd /d "%~dp0Website\PLE CC Webpage"
git add -A
git commit -m "Auto sync offline DB [!MODE!: !QUERY!] [%DATE% %TIME%]"
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
    echo  You can try pushing again later or check your git credentials.
    echo ================================================================
)

echo.
pause
