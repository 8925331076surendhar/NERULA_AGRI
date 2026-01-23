@echo off
set GIT_PATH=mingit\cmd\git.exe
set REPO_URL=https://github.com/8925331076surendhar/NERULA_AGRI

echo ==============================================
echo       AGRISENSE GITHUB UPLOADER
echo ==============================================

echo [1/6] Initializing Local Repository...
"%GIT_PATH%" init

echo [2/6] Configuring Remote...
"%GIT_PATH%" remote remove origin >nul 2>&1
"%GIT_PATH%" remote add origin %REPO_URL%
echo    Target: %REPO_URL%

echo [3/6] Staging Files...
"%GIT_PATH%" add .

echo [4/6] Committing Changes...
"%GIT_PATH%" commit -m "AgriSense Upload - Auto"

echo [5/6] Setting Branch to Main...
"%GIT_PATH%" branch -M main

echo ==============================================
echo [6/6] PUSHING TO GITHUB...
echo.
echo    [IMPORTANT]
echo    A login window will open now.
echo    Please sign in with your GitHub account.
echo ==============================================
echo.

"%GIT_PATH%" push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push Failed! 
    echo Possible reasons:
    echo  1. Repository does not exist (Create it on GitHub first!)
    echo  2. Internet connection issue.
    echo  3. Incorrect login.
) else (
    echo.
    echo [SUCCESS] Upload Complete!
)

echo.
pause
