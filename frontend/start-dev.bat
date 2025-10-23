@echo off
echo ========================================
echo   Starting Voting-Fun Development Server
echo ========================================
echo.
cd /d %~dp0
echo Current directory: %CD%
echo.
echo Installing dependencies if needed...
call npm install --legacy-peer-deps
echo.
echo Starting Vite dev server...
echo.
call npm run dev
pause

