# Solidarity Platform - AI Coding Agent Instructions

## Project Overview
Solidarity is a multi-faceted platform integrating audio processing, financial commerce, and blockchain technology. The system combines harmonic mathematical principles with modern technologies to create an innovative commercial ecosystem.

## Core Architecture

### 1. Multi-Component System
- **Core System**: `src/correctedSolidaritySystem.js` and other core modules are primary entry points
- **Audio Processing**: Python modules integrate with Node.js through direct execution
- **Financial Layer**: Express API server with blockchain connectivity
- **Cross-Repository Integration**: Linked with Soul.Ed.Xchange, Coul.Curve.Fi, and Souls repositories

### 2. Harmonic Framework
- **ZIP Phrase System**: Key phrases trigger specific system actions (see `EnhancedHarmonicPhraseParser.js`)
- **Node System**: Uses 6 primary nodes (1, 3, 4, 7, 14, 21) representing different system aspects
- **Golden Ratio Mathematics**: φ-based calculations for audio processing and system metrics

## Development Workflows

### Setup
```bash
# Windows setup
setup.bat

# Unix/Linux/macOS setup
./setup.sh
```

### Primary Commands
```bash
# Start the API server
node src/api/server.js

# Run comprehensive discovery
node launcher.js discovery

# Run corrected solidarity system (full capabilities)
node launcher.js corrected

# Test advanced audio processing
node launcher.js test:audio
```

### Testing
```bash
# Run complete test suite
npm test

# Audio specific testing
python test_advanced_audio.py

# Quick NumPy verification
python test_numpy_quick.py
```

## Project Conventions

### 1. Direct Execution Pattern
- Uses direct Node/Python execution rather than npm scripts for security
- Python virtual environment is set up by `setup_python_env.py`
- Avoids npm dependencies where possible

### 2. Security Approach
- Environment verification on startup
- No third-party package managers
- Secure WebSocket connections for real-time collaboration

### 3. Cross-Repository Structure
- Four primary repositories make up the complete system:
  - **Solidarity**: Core platform and API server
  - **Soul.Ed.Xchange**: Educational components
  - **Coul.Curve.Fi**: Financial algorithms
  - **Souls**: Community integration features

## Key Files & Directories

### Core Implementation
- `/core/index.js`: Main Express application
- `/contracts/*.sol`: Solidity smart contracts
- `/EnhancedHarmonicPhraseParser.js`: ZIP phrase system
- `/src/ComprehensiveSolidarityDiscovery.js`: System discovery and location detection
- `/src/correctedSolidaritySystem.js`: Complete system integration

### Configuration
- `/.env`: Environment variables (never commit secrets)
- `/solidarity-ai-framework-config.json`: AI framework configuration
- `/HARMONIC_INTEGRITY_GUIDE.md`: System verification guidelines

## Integration Points

### Blockchain Connection
- Smart contracts in `/contracts/` connect through web3
- `SolidarityToken.sol` implements treasury distribution
- Cross-chain compatibility through `multi-drive-manager.js`

### Mobile Device Integration
```javascript
// Setup mobile device connectivity
node launcher.js discovery:mobile

// Start mobile sync servers
node mobile-sync-server.js
```

### Python Integration
- Python scripts are called directly from Node.js
- Scientific calculations use NumPy/SciPy libraries
- Audio processing uses Python for performance reasons

## Version Compatibility
- Node.js >= 16.0.0
- Python >= 3.8.0
- npm >= 8.0.0 (when required)