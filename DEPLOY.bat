@echo off
REM Watch Party - Deploy Script
REM Run this to quickly deploy updated code to Replit

echo.
echo ====================================
echo   Watch Party - Deploy Script
echo ====================================
echo.

REM Check if we're in the right directory
if not exist "server\server.js" (
    echo ERROR: Please run this script from the watchparty project root directory
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo Preparing deployment...
echo.

REM Stage all changes
echo Staging changes...
git add .
if errorlevel 1 (
    echo ERROR: Failed to stage changes
    pause
    exit /b 1
)

REM Commit changes
echo Committing changes...
git commit -m "WebRTC fixes and improvements - %date% %time%"
if errorlevel 1 (
    echo WARNING: Nothing to commit (maybe already committed)
)

REM Push to Replit
echo Pushing to Replit...
git push origin main
if errorlevel 1 (
    echo ERROR: Failed to push to Replit
    echo Check your git remote: git remote -v
    pause
    exit /b 1
)

echo.
echo ====================================
echo   ✅ Deployment Complete!
echo ====================================
echo.
echo Your code is now pushed to Replit.
echo It will auto-deploy in 1-2 minutes.
echo.
echo Test your app at your Replit URL:
echo [your-username]-watchparty.replit.dev
echo.
echo Open F12 console to see debug logs.
echo.
pause

