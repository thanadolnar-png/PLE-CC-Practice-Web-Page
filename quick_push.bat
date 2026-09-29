@echo off
setlocal enabledelayedexpansion
title PLE-CC 2569 -- Quick Push (No Recompile)
cls

echo ================================================================
echo   [PLE-CC 2569 RxCU] -- Quick Git Push (No Recompile)
echo   Owner: Thanadol (Maxnum) ^| Auto Deploy to GitHub / Vercel
echo ================================================================
echo.

set "REPO_DIR=C:\Users\thana\Desktop\PLE-CC"
set "WEB_DIR=C:\Users\thana\Desktop\PLE-CC\Website\PLE CC Webpage"

:: 1. Setup Git Identity
echo [1/3] Setting Git Identity...
cd /d "%WEB_DIR%"
git config user.name "thanadolnar-png"
git config user.email "thanadol.nar@gmail.com"
git config credential.helper manager
echo       Done.

:: 2. Sync Backup
echo.
echo [2/3] Syncing backup to Website_Backup_v1.3...
cd /d "%REPO_DIR%"
python "scripts\sync_backup.py"
echo       Done.

:: 3. Git Commit & Push
echo.
echo [3/3] Git add, commit, and push to GitHub...
cd /d "%WEB_DIR%"
git add -A
git status
git commit -m "Quick website update [%DATE% %TIME%]"
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
