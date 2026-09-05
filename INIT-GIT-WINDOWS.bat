@echo off
setlocal
cd /d "%~dp0"
set "PAUSE_AT_END=1"
if /I "%~1"=="nopause" set "PAUSE_AT_END=0"

where git >nul 2>nul
if errorlevel 1 (
  echo Git is not installed or not on PATH.
  echo Install Git for Windows from https://git-scm.com/download/win
  echo Then run this file again.
  if "%PAUSE_AT_END%"=="1" pause
  exit /b 1
)

if exist ".git\" (
  echo This folder is already a git repository.
  git status -sb
  if "%PAUSE_AT_END%"=="1" pause
  exit /b 0
)

echo Creating a local git repository so Cursor can open this folder...
git init -b cursor/southern-ridge-banking-a520
if errorlevel 1 (
  git init
  git checkout -b cursor/southern-ridge-banking-a520
)

git config user.name "Southern Ridge UDC"
git config user.email "local@southernridgeudc.invalid"
git add .
git commit -m "Southern Ridge UDC local copy"

echo.
echo Done. This folder is now a git repo on branch cursor/southern-ridge-banking-a520
echo In Cursor: File - Open Folder, then choose this folder.
echo After that, run START-WINDOWS.bat to launch the bank.
if "%PAUSE_AT_END%"=="1" pause
