@echo off
REM Solidarity Platform - Secure Environment Setup (Windows)
REM Avoids npm security issues by using direct Python environment management

echo 🔐 Solidarity Platform - Secure Setup
echo ================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+ from https://python.org
    echo    Make sure to add Python to your PATH during installation
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Setup secure Python environment
echo 🔧 Setting up secure Python environment...
python setup_python_env.py setup

if %errorlevel% neq 0 (
    echo ❌ Python environment setup failed
    pause
    exit /b 1
)

echo ✅ Python environment setup complete

REM Test the environment
echo 🧪 Testing environment...
node launcher.js python:verify

if %errorlevel% neq 0 (
    echo ❌ Environment verification failed
    pause
    exit /b 1
)

echo ✅ Environment verification successful

REM Show available commands
echo.
echo 🎯 Available commands:
echo   node launcher.js golden          - Run Golden Ratio Harmonic System
echo   node launcher.js ultimate        - Run Ultimate Solidarity System  
echo   node launcher.js test:audio      - Test advanced audio processing
echo   node launcher.js test:audio:quick - Quick audio test
echo   node launcher.js start           - Start Solidarity API server
echo   node launcher.js python:status   - Check Python environment status
echo.
echo 🎉 Setup complete! You can now run Solidarity commands safely.
echo    No npm required - direct execution only.
echo.
pause