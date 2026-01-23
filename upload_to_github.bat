@echo off
echo ==========================================
echo  AgriSense GitHub Uploader
echo ==========================================
echo.

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is NOT installed on this computer.
    echo Please install Git from https://git-scm.com/download/win
    echo and try running this script again.
    pause
    exit /b
)

echo [1/5] Initializing Repository...
git init
git add .
git commit -m "AgriSense Final Update: AI, GCS, Market Intelligence"

echo [2/5] Setting Branch...
git branch -M main

echo [3/5] Adding Remote Origin...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/8925331076surendhar/NERULA_AGRI.git

echo [4/5] Pushing to GitHub...
echo.
echo NOTE: A login window may pop up. Please sign in to GitHub.
echo.
git push -u origin main

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo [SUCCESS] Code uploaded successfully!
) else (
    echo [FAILED] Could not push. Check your internet or permissions.
)
echo ==========================================
pause
