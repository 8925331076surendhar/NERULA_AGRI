@echo off
setlocal enabledelayedexpansion

REM --- Find Git Executable ---
set "GIT=git"
where /q git
if %ERRORLEVEL% equ 0 (
    echo Found Git in PATH
    goto :FOUND_GIT
)

set "POSSIBLE_LOCATIONS=C:\Program Files\Git\cmd\git.exe;C:\Program Files\Git\bin\git.exe;C:\Program Files (x86)\Git\cmd\git.exe;C:\Program Files (x86)\Git\bin\git.exe;%LOCALAPPDATA%\Programs\Git\cmd\git.exe"

for %%p in ("%POSSIBLE_LOCATIONS:;=" "%") do (
    if exist "%%~p" (
        set "GIT=%%~p"
        echo Found Git at %%~p
        goto :FOUND_GIT
    )
)

echo Error: Git not found in PATH or standard locations.
echo Please install Git or add it to your PATH.
pause
exit /b 1

:FOUND_GIT

REM --- Configuration ---
set "REMOTE_URL=https://github.com/8925331076surendhar/AGRILOVE.git"
set "BRANCH=main"

echo Using Git: "%GIT%"
echo Repo URL: %REMOTE_URL%

REM --- Initialize if needed (though we assume it exists) ---
if not exist ".git" (
    echo Initializing Git repository...
    "%GIT%" init
    "%GIT%" add .
    "%GIT%" commit -m "Initial commit"
)

REM --- Set Remote ---
"%GIT%" remote get-url origin >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Updating existing remote 'origin'...
    "%GIT%" remote set-url origin %REMOTE_URL%
) else (
    echo Adding new remote 'origin'...
    "%GIT%" remote add origin %REMOTE_URL%
)

REM --- Push ---
echo.
echo Pushing code to GitHub...
"%GIT%" branch -M %BRANCH%
"%GIT%" push -u origin %BRANCH%

if %ERRORLEVEL% neq 0 (
    echo.
    echo Push failed. Please check your internet connection or credentials.
    pause
    exit /b 1
)

echo.
echo Successfully pushed to %REMOTE_URL%
pause
exit /b 0
