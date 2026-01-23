@echo off
echo ===============================================
echo   Starting Smart Agri Dashboard Local Server
echo ===============================================
echo.
echo This script will verify Node.js and start a local server.
echo This is required for Microphone and API access to work correctly.
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo then run this script again.
    pause
    exit /b
)

echo [OK] Node.js successfully detected.
echo Starting server...
echo.
echo Opening Dashboard in your browser...
echo.

call npx http-server -c-1 -o
pause
