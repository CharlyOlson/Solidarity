@echo off
echo === Solidarity AI Bot Runner ===
echo.

rem Check if .env file exists
if not exist .env (
  echo WARNING: No .env file found! Creating a template...
  echo PERPLEXITY_API_KEY=your_api_key_here> .env
  echo Created .env file. Please edit it to add your Perplexity API key.
  echo.
  pause
  exit /b 1
)

rem Check arguments
if "%1"=="--interactive" (
  echo Starting AI Bot in interactive mode...
  node test-aibot.js --interactive
  exit /b 0
)

if "%1"=="--dry-run" (
  echo Starting AI Bot in dry-run mode (no API calls)...
  node test-aibot.js --dry-run
  exit /b 0
)

if "%1"=="--dry-interactive" (
  echo Starting AI Bot in interactive dry-run mode (no API calls)...
  node test-aibot.js --interactive --dry-run
  exit /b 0
)

if "%1"=="--direct" (
  echo Starting AI Bot directly...
  node SolidarityAIBot.js
  exit /b 0
)

rem No valid arguments provided, show help
echo Usage:
echo   run-aibot.bat --interactive   : Run in interactive testing mode
echo   run-aibot.bat --dry-run       : Run automated tests without API calls
echo   run-aibot.bat --dry-interactive: Run interactive tests without API calls
echo   run-aibot.bat --direct        : Run the AI bot directly
echo.
echo Note: Ensure your .env file contains a valid PERPLEXITY_API_KEY.