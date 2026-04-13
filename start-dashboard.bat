@echo off
title MikroTik Dashboard
cd /d "%~dp0"

:: Build if not already built
if not exist ".next" (
    echo First run — building dashboard, please wait...
    call npm install
    call npm run build
)

echo.
echo  Dashboard running at http://localhost:3000
echo  Keep this window open. Close it to stop the server.
echo.

:: Open browser after 2 seconds
start "" cmd /c "timeout /t 2 >nul && start http://localhost:3000"

:: Start the server
npm start
