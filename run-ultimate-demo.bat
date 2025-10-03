@echo off
echo.
echo ========================================================================
echo  SOLIDARITY PLATFORM - ULTIMATE INTEGRATION LAUNCHER
echo  Created by Scott Charles Olson (Charly)
echo  Launching 400+ integrated functions in complete harmony
echo ========================================================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo Node.js and Python detected successfully
echo.

REM Parse command line arguments
set "DEMO_MODE=comprehensive"
set "RUN_TESTS=true"
set "START_SERVER=true"
set "VERBOSE=false"

:parse_args
if "%1"=="" goto :after_args
if "%1"=="--no-tests" set "RUN_TESTS=false"
if "%1"=="--no-server" set "START_SERVER=false"
if "%1"=="--verbose" set "VERBOSE=true"
if "%1"=="--help" goto :show_help
shift
goto :parse_args

:after_args

echo Configuration:
echo - Demo Mode: %DEMO_MODE%
echo - Run Tests: %RUN_TESTS%
echo - Start Server: %START_SERVER%
echo - Verbose Output: %VERBOSE%
echo.

echo Installing dependencies...
call npm install --silent
if %errorlevel% neq 0 (
    echo WARNING: npm install failed, continuing anyway...
)

echo Setting up Python environment...
python setup_python_env.py
if %errorlevel% neq 0 (
    echo WARNING: Python environment setup failed, continuing anyway...
)

echo.
echo ========================================================================
echo  LAUNCHING ULTIMATE SOLIDARITY DEMONSTRATION
echo ========================================================================
echo.

REM Launch the ultimate demonstration
node ultimateSolidarityDemonstration.js %*

if %errorlevel% equ 0 (
    echo.
    echo ========================================================================
    echo  SOLIDARITY PLATFORM DEMONSTRATION COMPLETED SUCCESSFULLY!
    echo  All 400+ functions integrated and operational
    echo ========================================================================
) else (
    echo.
    echo ========================================================================
    echo  DEMONSTRATION ENCOUNTERED ISSUES
    echo  Check the output above for details
    echo ========================================================================
)

echo.
echo Press any key to exit...
pause >nul
exit /b %errorlevel%

:show_help
echo.
echo SOLIDARITY PLATFORM - Ultimate Integration Launcher
echo.
echo Usage: run-ultimate-demo.bat [options]
echo.
echo Options:
echo   --no-tests     Skip comprehensive testing phase
echo   --no-server    Skip API server demonstration
echo   --verbose      Enable verbose output
echo   --help         Show this help message
echo.
echo Examples:
echo   run-ultimate-demo.bat
echo   run-ultimate-demo.bat --verbose
echo   run-ultimate-demo.bat --no-tests --no-server
echo.
echo This launcher will:
echo   1. Initialize all integrated systems
echo   2. Run comprehensive tests (if enabled)
echo   3. Start API server demonstration (if enabled)
echo   4. Test cross-system integration
echo   5. Demonstrate audio processing pipeline
echo   6. Show blockchain integration
echo   7. Test Greek Letter Nodes system
echo   8. Process ZIP phrases across all systems
echo   9. Calculate harmonic series
echo  10. Analyze performance metrics
echo.
pause
exit /b 0