@echo off
REM Quick setup for E:\ drive Solidarity installation
REM Copies from existing installation and sets up environment

echo 🚀 Solidarity E:\ Drive Quick Setup
echo ==================================

REM Check if we're already on E:\ drive
if "%~d0"=="E:" (
    echo ✅ Running from E:\ drive
    set "E_DRIVE=E:\"
) else (
    echo 📁 Setting E:\ drive path
    set "E_DRIVE=E:\"
)

REM Check if E:\ is accessible
if not exist "%E_DRIVE%" (
    echo ❌ E:\ drive not accessible
    pause
    exit /b 1
)

echo ✅ E:\ drive accessible

REM Look for existing Solidarity installation to copy from
set "SOURCE_FOUND=false"
set "SOURCE_PATH="

REM Check C:\ locations
if exist "c:\Users\souls\OneDrive\Documents\GitHub\Solidarity\launcher.js" (
    set "SOURCE_PATH=c:\Users\souls\OneDrive\Documents\GitHub\Solidarity"
    set "SOURCE_FOUND=true"
    echo ✅ Found source at C:\...\Solidarity
) else if exist "c:\Users\souls\OneDrive\Documents\GitHub\Coul-Curve\launcher.js" (
    set "SOURCE_PATH=c:\Users\souls\OneDrive\Documents\GitHub\Coul-Curve"
    set "SOURCE_FOUND=true"
    echo ✅ Found source at C:\...\Coul-Curve
)

REM Check F:\ drive
if "%SOURCE_FOUND%"=="false" (
    if exist "f:\GitHub\launcher.js" (
        set "SOURCE_PATH=f:\GitHub"
        set "SOURCE_FOUND=true"
        echo ✅ Found source at F:\GitHub
    )
)

if "%SOURCE_FOUND%"=="false" (
    echo ❌ No existing Solidarity installation found
    echo    Looked in:
    echo    - c:\Users\souls\OneDrive\Documents\GitHub\Solidarity
    echo    - c:\Users\souls\OneDrive\Documents\GitHub\Coul-Curve  
    echo    - f:\GitHub
    pause
    exit /b 1
)

echo 📂 Source found: %SOURCE_PATH%

REM Create E:\ Solidarity directory
if not exist "%E_DRIVE%Solidarity" (
    mkdir "%E_DRIVE%Solidarity"
    echo ✅ Created E:\Solidarity directory
) else (
    echo 📁 E:\Solidarity directory exists
)

REM Copy essential files
echo 🔄 Copying essential files...

copy "%SOURCE_PATH%\launcher.js" "%E_DRIVE%Solidarity\" >nul 2>&1
if %errorlevel%==0 echo    ✅ launcher.js

copy "%SOURCE_PATH%\package.json" "%E_DRIVE%Solidarity\" >nul 2>&1
if %errorlevel%==0 echo    ✅ package.json

copy "%SOURCE_PATH%\setup_python_env.py" "%E_DRIVE%Solidarity\" >nul 2>&1
if %errorlevel%==0 echo    ✅ setup_python_env.py

copy "%SOURCE_PATH%\README.md" "%E_DRIVE%Solidarity\" >nul 2>&1
if %errorlevel%==0 echo    ✅ README.md

copy "%SOURCE_PATH%\multi-drive-manager.js" "%E_DRIVE%Solidarity\" >nul 2>&1
if %errorlevel%==0 echo    ✅ multi-drive-manager.js

REM Copy src directory
if exist "%SOURCE_PATH%\src" (
    if not exist "%E_DRIVE%Solidarity\src" mkdir "%E_DRIVE%Solidarity\src"
    xcopy "%SOURCE_PATH%\src" "%E_DRIVE%Solidarity\src" /s /q >nul 2>&1
    if %errorlevel%==0 echo    ✅ src/ directory
)

REM Copy test files
copy "%SOURCE_PATH%\test_advanced_audio.py" "%E_DRIVE%Solidarity\" >nul 2>&1
if %errorlevel%==0 echo    ✅ test_advanced_audio.py

echo.
echo 🎯 Testing E:\ installation...
cd /d "%E_DRIVE%Solidarity"

REM Test the launcher
node launcher.js help >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Launcher working on E:\ drive
) else (
    echo ❌ Launcher test failed
    pause
    exit /b 1
)

REM Setup Python environment
echo 🐍 Setting up Python environment on E:\ drive...
python setup_python_env.py setup

if %errorlevel%==0 (
    echo ✅ Python environment setup complete
) else (
    echo ⚠️ Python environment setup had issues
)

echo.
echo 🎉 E:\ Drive Setup Complete!
echo ============================
echo 📁 Installation: %E_DRIVE%Solidarity
echo.
echo 🚀 Quick start commands for E:\ drive:
echo    cd /d E:\Solidarity
echo    node launcher.js ultimate
echo    node launcher.js golden  
echo    node launcher.js test:audio
echo.
echo 🔄 To sync with other drives:
echo    node launcher.js drives:sync
echo.
pause