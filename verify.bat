@echo off
REM Watch Party - Verification Script
REM This script checks if everything is properly set up

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Watch Party - Setup Verification
echo ========================================
echo.

REM Color codes
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

set "PASS=[+]"
set "FAIL=[!]"
set "INFO=[*]"
set "WARN=[?]"

echo %INFO% Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo %FAIL% Node.js not found. Please install from https://nodejs.org
    goto :error
) else (
    for /f "tokens=*" %%i in ('node --version') do set VERSION=%%i
    echo %PASS% Node.js found: !VERSION!
)

echo.
echo %INFO% Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo %FAIL% npm not found.
    goto :error
) else (
    for /f "tokens=*" %%i in ('npm --version') do set VERSION=%%i
    echo %PASS% npm found: !VERSION!
)

echo.
echo %INFO% Checking directory structure...
if exist "server\package.json" (
    echo %PASS% server/package.json found
) else (
    echo %FAIL% server/package.json not found
    goto :error
)

if exist "client\public\index.html" (
    echo %PASS% client/public/index.html found
) else (
    echo %FAIL% client/public/index.html not found
    goto :error
)

if exist "client\public\styles.css" (
    echo %PASS% client/public/styles.css found
) else (
    echo %FAIL% client/public/styles.css not found
    goto :error
)

if exist "client\public\js\app.js" (
    echo %PASS% client/public/js/app.js found
) else (
    echo %FAIL% client/public/js/app.js not found
    goto :error
)

if exist "server\server.js" (
    echo %PASS% server/server.js found
) else (
    echo %FAIL% server/server.js not found
    goto :error
)

echo.
echo %INFO% Checking documentation files...
if exist "README.md" (
    echo %PASS% README.md found
) else (
    echo %WARN% README.md not found
)

if exist "QUICKSTART.md" (
    echo %PASS% QUICKSTART.md found
) else (
    echo %WARN% QUICKSTART.md not found
)

echo.
echo %INFO% Checking backend dependencies...
if exist "server\node_modules" (
    echo %PASS% Dependencies already installed
) else (
    echo %WARN% Dependencies not installed. Run: cd server && npm install
)

echo.
echo %INFO% Checking server configuration...
if exist "server\.env" (
    echo %PASS% server/.env found
) else (
    echo %WARN% server/.env not found
)

echo.
echo ========================================
echo   Verification Results
echo ========================================
echo.

echo %PASS% All critical files present
echo %PASS% Node.js and npm installed
echo.
echo Next Steps:
echo 1. Install dependencies:
echo    cd server
echo    npm install
echo    cd ..
echo.
echo 2. Run the application:
echo    Windows: start.bat
echo    Or manually:
echo      Terminal 1: cd server ^&^& npm start
echo      Terminal 2: cd client\public ^&^ python -m http.server 8000
echo.
echo 3. Open browser:
echo    http://localhost:8000
echo.
echo ========================================
goto :end

:error
echo.
echo %FAIL% Setup verification failed!
echo.
echo Please ensure all files are properly installed.
echo Refer to README.md or QUICKSTART.md for instructions.
echo.
pause
exit /b 1

:end
echo.
pause
exit /b 0
