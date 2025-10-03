#!/bin/bash

echo ""
echo "========================================================================"
echo " SOLIDARITY PLATFORM - ULTIMATE INTEGRATION LAUNCHER"
echo " Created by Scott Charles Olson (Charly)"
echo " Launching 400+ integrated functions in complete harmony"
echo "========================================================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    echo "Please install Python from https://python.org/"
    exit 1
fi

echo "Node.js and Python detected successfully"
echo ""

# Parse command line arguments
DEMO_MODE="comprehensive"
RUN_TESTS="true"
START_SERVER="true"
VERBOSE="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-tests)
            RUN_TESTS="false"
            shift
            ;;
        --no-server)
            START_SERVER="false"
            shift
            ;;
        --verbose)
            VERBOSE="true"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

show_help() {
    echo ""
    echo "SOLIDARITY PLATFORM - Ultimate Integration Launcher"
    echo ""
    echo "Usage: ./run-ultimate-demo.sh [options]"
    echo ""
    echo "Options:"
    echo "  --no-tests     Skip comprehensive testing phase"
    echo "  --no-server    Skip API server demonstration"
    echo "  --verbose      Enable verbose output"
    echo "  --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run-ultimate-demo.sh"
    echo "  ./run-ultimate-demo.sh --verbose"
    echo "  ./run-ultimate-demo.sh --no-tests --no-server"
    echo ""
    echo "This launcher will:"
    echo "  1. Initialize all integrated systems"
    echo "  2. Run comprehensive tests (if enabled)"
    echo "  3. Start API server demonstration (if enabled)"
    echo "  4. Test cross-system integration"
    echo "  5. Demonstrate audio processing pipeline"
    echo "  6. Show blockchain integration"
    echo "  7. Test Greek Letter Nodes system"
    echo "  8. Process ZIP phrases across all systems"
    echo "  9. Calculate harmonic series"
    echo " 10. Analyze performance metrics"
    echo ""
}

echo "Configuration:"
echo "- Demo Mode: $DEMO_MODE"
echo "- Run Tests: $RUN_TESTS"
echo "- Start Server: $START_SERVER"
echo "- Verbose Output: $VERBOSE"
echo ""

echo "Installing dependencies..."
npm install --silent 2>/dev/null || echo "WARNING: npm install failed, continuing anyway..."

echo "Setting up Python environment..."
python3 setup_python_env.py 2>/dev/null || python setup_python_env.py 2>/dev/null || echo "WARNING: Python environment setup failed, continuing anyway..."

echo ""
echo "========================================================================"
echo " LAUNCHING ULTIMATE SOLIDARITY DEMONSTRATION"
echo "========================================================================"
echo ""

# Build arguments for Node.js script
NODE_ARGS=""
if [ "$RUN_TESTS" = "false" ]; then
    NODE_ARGS="$NODE_ARGS --no-tests"
fi
if [ "$START_SERVER" = "false" ]; then
    NODE_ARGS="$NODE_ARGS --no-server"
fi
if [ "$VERBOSE" = "true" ]; then
    NODE_ARGS="$NODE_ARGS --verbose"
fi

# Launch the ultimate demonstration
node ultimateSolidarityDemonstration.js $NODE_ARGS

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "========================================================================"
    echo " SOLIDARITY PLATFORM DEMONSTRATION COMPLETED SUCCESSFULLY!"
    echo " All 400+ functions integrated and operational"
    echo "========================================================================"
else
    echo ""
    echo "========================================================================"
    echo " DEMONSTRATION ENCOUNTERED ISSUES"
    echo " Check the output above for details"
    echo "========================================================================"
fi

echo ""
echo "Press Enter to exit..."
read

exit $EXIT_CODE