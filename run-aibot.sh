#!/bin/bash

echo "=== Solidarity AI Bot Runner ==="
echo

# Check if .env file exists
if [ ! -f .env ]; then
  echo "WARNING: No .env file found! Creating a template..."
  echo "PERPLEXITY_API_KEY=your_api_key_here" > .env
  echo "Created .env file. Please edit it to add your Perplexity API key."
  echo
  exit 1
fi

# Check arguments
if [ "$1" == "--interactive" ]; then
  echo "Starting AI Bot in interactive mode..."
  node test-aibot.js --interactive
  exit 0
fi

if [ "$1" == "--dry-run" ]; then
  echo "Starting AI Bot in dry-run mode (no API calls)..."
  node test-aibot.js --dry-run
  exit 0
fi

if [ "$1" == "--dry-interactive" ]; then
  echo "Starting AI Bot in interactive dry-run mode (no API calls)..."
  node test-aibot.js --interactive --dry-run
  exit 0
fi

if [ "$1" == "--direct" ]; then
  echo "Starting AI Bot directly..."
  node SolidarityAIBot.js
  exit 0
fi

# No valid arguments provided, show help
echo "Usage:"
echo "  ./run-aibot.sh --interactive    : Run in interactive testing mode"
echo "  ./run-aibot.sh --dry-run        : Run automated tests without API calls"
echo "  ./run-aibot.sh --dry-interactive: Run interactive tests without API calls"
echo "  ./run-aibot.sh --direct         : Run the AI bot directly"
echo
echo "Note: Ensure your .env file contains a valid PERPLEXITY_API_KEY."