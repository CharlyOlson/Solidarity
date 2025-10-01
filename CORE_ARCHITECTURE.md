# Solidarity Platform - Core Architecture

## System Overview

The Solidarity Platform is a multi-faceted system integrating:
- Audio processing
- Financial commerce
- Blockchain technology
- Harmonic mathematical principles

## Core Components

### 1. Harmonic Framework
- **ZIP Phrase System**: `EnhancedHarmonicPhraseParser.js`
- **Node System**: Uses 6 primary nodes (1, 3, 4, 7, 14, 21)
- **Golden Ratio Mathematics**: `SacredNumericSequence.js`

### 2. Audio Processing
- **TIMBR Compression**: `TIMBRCompressionSystem.js`
- **Python Integration**: `solidarityAudioProcessor.py`

### 2.1 Visualization System
- **Color Utilities**: `src/utils/colorUtils.js`
- **Motion Tracking**: `color_motion_tracking.js`
- **Harmonic Color Generation**: Golden ratio-based color palette generation

### 3. Financial Layer
- **Smart Contracts**: `contracts/*.sol`
- **Market Analysis**: `MarketVolatilityHarmonic.js`, `PortfolioBalanceHarmonic.js`
- **Energy Trading**: `EnergyFinancialTradingHarmonic.js`

### 4. Mobile Integration
- **Device Management**: `MobileDeviceManager.js`
- **Testing Framework**: `MobileDeviceTester.js`

## Cross-Repository Integration

The complete system spans multiple repositories:

1. **Solidarity** (Core Platform)
   - Main application logic
   - API server
   - Core harmonic processing

2. **Coul-Curve** (Financial Algorithms)
   - Gradient layers
   - Financial calculations
   - Market integration

3. **Soul.Ed.Xchange** (Educational)
   - Knowledge distribution
   - User onboarding
   - Educational content

4. **Sync Technologies**
   - Data synchronization
   - Multi-device coordination
   - Real-time updates

## Integration Points

### File-Level Integration
```
Solidarity/launcher.js
  ├─ imports Coul-Curve/core_metrics.sql
  ├─ imports Soul.Ed.Xchange/components
  └─ imports ston-sync-tech/sync_modules
```

### Data Flow
```
User Input → ZIP Phrase Parser → Harmonic Processing → Financial Analysis → Blockchain Interaction → User Interface
```

## Standardized Directory Structure

After consolidation, the main Solidarity repository should follow this structure:

```
Solidarity/
├─ src/
│  ├─ core/             # Core system components
│  ├─ audio/            # Audio processing
│  ├─ finance/          # Financial algorithms
│  │  └─ coul-curve/    # Imported from Coul-Curve
│  ├─ mobile/           # Mobile integration
│  ├─ education/        # From Soul.Ed.Xchange
│  ├─ utils/            # Utility functions
│  │  ├─ colorUtils.js  # Color processing utilities
│  │  └─ other utils    # Additional utilities
│  └─ sync/             # Synchronization technology
├─ contracts/           # Smart contracts
│  └─ tokens/           # Token implementations
├─ docs/                # Documentation
│  └─ archive/          # Historical documents
└─ tests/               # Test suites
```