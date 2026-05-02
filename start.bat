@echo off
title Digital Menu SaaS - Starting Servers...

echo ==========================================
echo   Digital Menu SaaS - Launching...
echo ==========================================
echo.

echo [1/2] Starting Backend (port 5000)...
start "Backend - Port 5000" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (port 3000)...
start "Frontend - Port 3000" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==========================================
echo   Both servers are starting up!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ==========================================
echo.
echo This window will close in 5 seconds...
timeout /t 5 /nobreak >nul
