@echo off
set "GIT=C:\Program Files\Git\cmd\git.exe"

if not exist "%GIT%" (
    echo Git not found at %GIT%
    exit /b 1
)

echo Found Git at %GIT%
"%GIT%" init
"%GIT%" config user.email "admin@agrisense.local"
"%GIT%" config user.name "AgriSense Admin"
"%GIT%" add .
"%GIT%" commit -m "Initial Dashboard Release"
"%GIT%" branch -M main
"%GIT%" remote add origin https://github.com/8925331076surendhar/agrisense.git

echo Repository Initialized and Committed.
echo.
echo ========================================================
echo CRITICAL STEP REQUIRED:
echo To finish, please run the following command in your terminal:
echo.
echo     git push -u origin main
echo.
echo (You will be asked to sign in to GitHub)
echo ========================================================
pause
