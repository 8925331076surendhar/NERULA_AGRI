@echo off
set GIT_PATH=mingit\cmd\git.exe

echo [1/5] Using Portable Git...
"%GIT_PATH%" init
"%GIT_PATH%" add .
"%GIT_PATH%" commit -m "AgriSense Upload"

echo [2/5] Setting up Branch...
"%GIT_PATH%" branch -M main

echo [3/5] Adding Remote...
"%GIT_PATH%" remote remove origin
"%GIT_PATH%" remote add origin https://github.com/8925331076surendhar/NERULA_AGRI

echo [4/5] Pushing...
echo NOTE: A login window will open. Please sign in.
"%GIT_PATH%" push -u origin main

echo Done.
pause
