@echo off
title Deploy Trip Expense Monitoring to Firebase
color 0A
cls
echo =======================================================
echo    🚀 TRIP EXPENSE MONITORING - FIREBASE DEPLOYER 🚀
echo =======================================================
echo.
echo [1/2] Building production bundle (npm run build)...
echo.
cd /d "%~dp0"
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERROR: Build failed! Please check code errors.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Deploying to Firebase Hosting (travel-app-e43a7)...
echo.
call npx firebase-tools deploy --only hosting
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERROR: Firebase deploy failed! Please check network or login.
    echo.
    pause
    exit /b %errorlevel%
)

color 0A
echo.
echo =======================================================
echo    ✅ DEPLOY SUCCESSFUL! 
echo =======================================================
echo.
echo  Website URL: https://travel-app-e43a7.web.app
echo.
echo Press any key to close this window...
pause >nul
