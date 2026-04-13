@echo off
title MikroTik Dashboard
cd /d "%~dp0"

:: Check Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found.
    echo Download and install it from https://nodejs.org then try again.
    pause
    exit /b 1
)

:: Install dependencies if node_modules missing
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 ( echo Install failed! & pause & exit /b 1 )
)

:: Build if not already built
if not exist ".next" (
    echo Building dashboard for first time, please wait...
    call npm run build
    if errorlevel 1 ( echo Build failed! & pause & exit /b 1 )
)

echo.
echo  ================================================
echo   MikroTik Dashboard is running
echo   Open: http://localhost:3000
echo   Keep this window open to stay running
echo  ================================================
echo.

start http://localhost:3000
npm start

pause
