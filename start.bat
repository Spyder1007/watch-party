@echo off
REM Watch Party - Startup Script for Windows

echo.
echo ====================================
echo   Watch Party - Starting Services
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Installing backend dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Starting backend server...
start "Watch Party Server" cmd /k "npm start"

REM Wait for server to start
timeout /t 3 /nobreak

echo.
echo [3/3] Starting frontend server...
cd ..\client\public
start "Watch Party Frontend" cmd /k "python -m http.server 8000"

REM Wait for frontend to start
timeout /t 2 /nobreak

echo.
echo ====================================
echo   Services Started Successfully!
echo ====================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend:      http://localhost:8000
echo.
echo Opening browser...
timeout /t 1
start http://localhost:8000

echo.
echo Services running. Close any window to stop the service.
echo.
pause
