@echo off
echo ==========================================
echo  AgriSense Auto-Installer & Deployer
echo ==========================================
echo.

echo [1/4] Installing Git for Windows (Full Version)...
echo This may take 2-3 minutes. Please wait...
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements --silent --scope machine

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Winget installation failed.
    echo Attempting fallback to manual download script...
    pause
    exit /b
)

echo.
echo [2/4] Verifying Installation...
:: Refresh environment variables for the current session to see 'git'
set "PATH=%PATH%;C:\Program Files\Git\cmd"

git --version
if %errorlevel% neq 0 (
    echo [ERROR] Git command still not found. You may need to restart the computer.
    pause
    exit /b
)

echo [3/4] Configuring Repository...
git init
git add .
git commit -m "AgriSense Final Deployment"
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/8925331076surendhar/NERULA_AGRI.git

echo.
echo [4/4] Pushing to GitHub...
echo.
echo ******************************************************
echo *  IMPORTANT: A Browser Window will pop up now!      *
echo *  Please click "Authorize" or log in to GitHub.     *
echo ******************************************************
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] DEPLOYMENT COMPLETE! 🚀
) else (
    echo.
    echo [FAILED] Push failed. 
)
pause
