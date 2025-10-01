@echo off
REM ====================================================
REM Start Mobile Testing Environment for Solidarity
REM ====================================================

echo Starting Solidarity Mobile Testing Environment...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: Node.js is not installed or not in your PATH
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Set directories
set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%src
set MOBILE_DIR=%ROOT_DIR%

REM Check if mobile-sync-server.js exists
if not exist "%MOBILE_DIR%mobile-sync-server.js" (
  echo Error: mobile-sync-server.js not found in %MOBILE_DIR%
  exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "%ROOT_DIR%logs" mkdir "%ROOT_DIR%logs"

echo Starting Mobile Sync Server...
start "Solidarity Mobile Sync Server" cmd /c "node "%MOBILE_DIR%mobile-sync-server.js" > "%ROOT_DIR%logs\mobile-sync.log" 2>&1"

echo Waiting for Mobile Sync Server to start...
timeout /t 3 > nul

echo.
echo Mobile Testing Environment is now running:
echo.
echo - iPhone Sync Server: http://localhost:3001
echo - iPad Sync Server:   http://localhost:3002
echo - Apple Watch Server: http://localhost:3003
echo.
echo You can access the Mobile Device Dashboard at http://localhost:3000 (after starting the frontend)
echo.
echo Press Ctrl+C in the server windows to stop the servers.
echo.

REM Optional: Start frontend development server
set /p START_FRONTEND=Do you want to start the frontend development server? (Y/N): 

if /i "%START_FRONTEND%"=="Y" (
  echo.
  echo Starting Frontend Development Server...
  cd "%ROOT_DIR%frontend"
  start "Solidarity Frontend" cmd /c "npm start"
  echo.
  echo Frontend server starting at http://localhost:3000
)

echo.
echo Mobile Testing Environment is ready!
echo Log files are being written to the logs directory.
echo.
