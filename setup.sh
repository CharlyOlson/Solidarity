#!/bin/bash
# Solidarity Platform - Secure Environment Setup (Unix/Linux/macOS)
# Avoids npm security issues by using direct Python environment management

echo "🔐 Solidarity Platform - Secure Setup"
echo "================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+ from https://python.org"
    echo "   On Ubuntu/Debian: sudo apt install python3 python3-venv python3-pip"
    echo "   On macOS: brew install python3"
    echo "   On CentOS/RHEL: sudo yum install python3 python3-pip"
    exit 1
fi

echo "✅ Python found"
python3 --version

# Setup secure Python environment
echo "🔧 Setting up secure Python environment..."
python3 setup_python_env.py setup

if [ $? -ne 0 ]; then
    echo "❌ Python environment setup failed"
    exit 1
fi

echo "✅ Python environment setup complete"

# Test the environment
echo "🧪 Testing environment..."
node launcher.js python:verify

if [ $? -ne 0 ]; then
    echo "❌ Environment verification failed"
    exit 1
fi

echo "✅ Environment verification successful"

# Show available commands
echo ""
echo "🎯 Available commands:"
echo "  node launcher.js golden          - Run Golden Ratio Harmonic System"
echo "  node launcher.js ultimate        - Run Ultimate Solidarity System"
echo "  node launcher.js test:audio      - Test advanced audio processing"
echo "  node launcher.js test:audio:quick - Quick audio test"
echo "  node launcher.js start           - Start Solidarity API server"
echo "  node launcher.js python:status   - Check Python environment status"
echo ""
echo "🎉 Setup complete! You can now run Solidarity commands safely."
echo "   No npm required - direct execution only."
echo ""