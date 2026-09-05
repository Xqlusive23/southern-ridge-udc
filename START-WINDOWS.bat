@echo off
setlocal
cd /d "%~dp0"

if not exist ".git\" (
  echo This folder is not a git repository yet.
  echo Cursor needs a .git folder to open the project branch.
  echo.
  if exist "INIT-GIT-WINDOWS.bat" (
    call "INIT-GIT-WINDOWS.bat" nopause
  )
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install the LTS build from https://nodejs.org then run this file again.
  pause
  exit /b 1
)

echo Using Node:
node -v
echo.

if not exist "node_modules\" (
  echo Installing packages. This can take a few minutes...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Southern Ridge UDC will open at http://127.0.0.1:43147
echo Leave this window open while you use the bank.
echo.
start "" "http://127.0.0.1:43147"
call npm run dev
pause
