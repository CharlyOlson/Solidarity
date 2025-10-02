# Solidarity Platform - AI Coding Agent Instructions

## Project Overview
Solidarity is a multi-faceted platform integrating audio processing, financial commerce, and blockchain technology. The system combines harmonic mathematical principles with modern technologies to create an innovative commercial ecosystem.

The Solidarity Platform is a comprehensive system implementing the Henry 7 Step 14 Shoe Waltz numerological framework, featuring harmonic processing, temporal control, and mathematical precision. This is a mixed JavaScript/Python codebase with complex mathematical relationships.

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

### Core Components
1. **Henry 7 Step 14 Shoe Waltz** - The foundational numerological system
2. **Harmonic Processing** - Audio analysis and harmonic series calculations
3. **Temporal Control** - Time-based processing with cog switching mechanisms
4. **Platform Integration** - Orchestrates all components together
5. **Cubit Calculation** - Sacred geometry and measurement systems

### Key Mathematical Relationships
- Base progression: 7 → 14 → 49
- Control ratio: 3.5 (49÷14)
- Source paths: 2+5=7 and 3+4=7
- Pythagorean verification: 7²+24²=25²
- Total cubits: ~697 (validated through ring calculations)

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

## Code Style & Standards

### JavaScript
- Use ES6+ modules (`import`/`export`)
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous operations
- Follow the existing class-based architecture
- Maintain mathematical precision in all calculations
- Include comprehensive JSDoc comments for complex mathematical functions

### Python
- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Maintain scientific precision in numerical calculations
- Use numpy for array operations and mathematical computations
- Include detailed docstrings for complex mathematical algorithms

### General Principles
- **Mathematical Accuracy**: All harmonic and numerical calculations must be mathematically precise
- **Documentation**: Complex mathematical concepts require clear explanations
- **Testing**: All new functionality must have corresponding tests
- **Backwards Compatibility**: Maintain compatibility with existing APIs
- **Performance**: Optimize for audio processing and real-time applications

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

### Module Structure
- Keep mathematical logic separate from I/O operations
- Use dependency injection for configuration
- Implement proper error handling for edge cases
- Maintain state consistency across components

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

### Cross-Language Integration
- Python handles intensive mathematical computations
- JavaScript manages platform orchestration and I/O
- Use proper data serialization between components
- Maintain consistent APIs across languages

### Audio Processing
- Use standard sample rates (44100 Hz)
- Implement proper buffering for real-time processing
- Handle audio format conversions gracefully

### Temporal Control
- Respect the principle: "fiscal time always moves forward"
- Allow cogs to switch function, not direction
- Maintain synchronization across components

## Testing Guidelines

### Test Structure
- Use the existing test framework (`tests/run-tests.js`)
- Include both unit tests and integration tests
- Validate mathematical relationships and harmonic calculations
- Test edge cases and boundary conditions

### Mathematical Validation
- Verify all harmonic series calculations
- Test temporal control mechanisms
- Validate cubit allocation accuracy
- Ensure Pythagorean relationships hold

### Performance Testing
- Test audio processing performance
- Validate real-time processing capabilities
- Monitor memory usage for long-running processes

## Common Patterns

### Configuration Management
```javascript
// Use configuration objects with sensible defaults
constructor(config = {}) {
    this.config = {
        defaultValue: config.defaultValue ?? 'default',
        ...config
    };
}
```

### Error Handling
```javascript
// Provide meaningful error messages for mathematical failures
if (!this.validateMathematicalRelationship()) {
    throw new Error('Mathematical validation failed: 7→14→49 progression violated');
}
```

### Mathematical Operations
```python
# Use numpy for precision and performance
import numpy as np

def calculate_harmonic_series(fundamental: float, num_harmonics: int) -> np.ndarray:
    """Calculate harmonic series with mathematical precision."""
    return np.array([fundamental * (i + 1) for i in range(num_harmonics)])
```

## Security Considerations
- Validate all input parameters
- Sanitize mathematical expressions
- Prevent buffer overflows in audio processing
- Secure configuration loading

## Performance Optimization
- Use efficient algorithms for harmonic calculations
- Implement caching for repeated calculations
- Optimize for CPU and memory usage
- Consider parallel processing for intensive operations

## Documentation Requirements
- Include mathematical proofs for complex algorithms
- Provide usage examples for all public APIs
- Document the philosophical and mathematical foundations
- Maintain changelog for mathematical formula updates

## Version Compatibility
- Node.js >= 16.0.0
- Python >= 3.8.0
- npm >= 8.0.0 (when required)

## Trademark and Licensing
- Respect the trademark by Scott Charles Olson
- Follow the licensing terms in LICENSE.md
- Acknowledge contributors: "Charly" (Scott Charles Olson) and "Hank" (Charles H. Dykes)

## When Writing New Code
1. Understand the mathematical context first
2. Validate relationships against the 7→14→49 progression
3. Include comprehensive tests
4. Document the mathematical reasoning
5. Ensure integration with existing components
6. Maintain performance standards for audio processing
7. Follow the established architectural patterns
>>>>>>> 8ffb94850b01e309ac74aaf0bc6a8be31c03e44b
