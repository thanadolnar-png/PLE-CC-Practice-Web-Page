@echo off
setlocal enabledelayedexpansion
title PLE-CC 2569 -- Quick Push to GitHub & Vercel
cls

echo ================================================================
echo   [PLE-CC 2569 RxCU] -- Quick Git Push (No Recompile)
echo   Owner: Thanadol (Maxnum) | Auto Deploy to GitHub / Vercel
echo ================================================================
echo.

cd /d "%~dp0"

:: 1. Setup Git Identity
echo [1/3] Setting Git Identity...
git config user.name "thanadolnar-png"
git config user.email "thanadol.nar@gmail.com"
git config credential.helper manager

:: 2. Sync Backup
echo [2/3] Syncing Backup to Website_Backup_v1.3...
cd /d "%~dp0..\.."
python "scripts\sync_backup.py"

:: 3. Git Commit & Push
echo [3/3] Committing and Pushing to GitHub (origin/main)...
cd /d "%~dp0"
git add -A
git commit -m "Quick update website [%DATE% %TIME%]"
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo  [SUCCESS] Code pushed to GitHub! Vercel is deploying now.
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo  [WARNING] Push encountered an issue. Check connection.
    echo ================================================================
)

echo.
pause
