@echo off
title PLE-CC Compile Offline Database
cls

echo ======================================================
echo      PLE-CC OSPE -- Update Offline Database
echo   Fetching latest data from Google Sheets + Google Docs
echo ======================================================
echo.
echo Compiling data... Please wait (takes ~1-2 minutes).
echo.

cd /d "%~dp0"

python "scripts\compile_offline_db_python.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ==========================================
    echo  ERROR: Compile failed!
    echo  Please check internet connection or Python.
    echo ==========================================
    pause
    exit /b 1
)

echo.
echo Syncing backup to Website_Backup_v1.3...
python "scripts\sync_backup.py"

echo.
echo Git Committing offline DB changes...
cd /d "%~dp0Website\PLE CC Webpage"
git add case-data-offline.js case-details-offline.js
git commit -m "data: recompile offline DB with latest Google Docs content"

echo.
echo ======================================================
echo  SUCCESS! Offline database compiled and updated.
echo  Ready to 'git push' to Vercel whenever you are ready.
echo ======================================================
echo.
pause