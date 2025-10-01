::
:: Solidarity Testing Environment Startup Script
::
@echo off
echo Starting Solidarity Testing Environment...
echo.

:: Check for required Node.js installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in the PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Create temp directory for logs if it doesn't exist
if not exist "temp" mkdir temp

:: Start the backend test server
echo Starting Backend Test Server...
start "Solidarity Backend Test Server" cmd /c "node backend-test-server.js > temp\backend-server.log 2>&1"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Backend Test Server
    pause
    exit /b 1
)

:: Start the mobile sync server
echo Starting Mobile Sync Server...
start "Solidarity Mobile Sync Server" cmd /c "node mobile-sync-server.js > temp\mobile-sync.log 2>&1"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Mobile Sync Server
    pause
    exit /b 1
)

:: Start the React development server
echo Starting React Frontend...
cd frontend
start "Solidarity Frontend" cmd /c "npm start > ..\temp\frontend.log 2>&1"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start React Frontend
    pause
    exit /b 1
)
cd ..

echo.
echo Solidarity Testing Environment is starting up!
echo.
echo - Backend Test Server: http://localhost:3000/api
echo - Mobile Sync Server (iPhone): http://localhost:3001/api
echo - Mobile Sync Server (iPad): http://localhost:3002/api
echo - Mobile Sync Server (Watch): http://localhost:3003/api
echo - Frontend: http://localhost:3000
echo.
echo Server logs are being saved to the temp directory
echo.
echo Press any key to shut down all servers...

pause

:: Shutdown all services
echo.
echo Shutting down servers...
taskkill /FI "WindowTitle eq Solidarity Backend Test Server" /F >nul 2>nul
taskkill /FI "WindowTitle eq Solidarity Mobile Sync Server" /F >nul 2>nul
taskkill /FI "WindowTitle eq Solidarity Frontend" /F >nul 2>nul

echo.
echo Solidarity Testing Environment has been shut down.
echo.
pause
