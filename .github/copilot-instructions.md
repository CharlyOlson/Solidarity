# GitHub Copilot Instructions for Solidarity Platform

## Project Overview
The Solidarity Platform is a comprehensive system implementing the Henry 7 Step 14 Shoe Waltz numerological framework, featuring harmonic processing, temporal control, and mathematical precision. This is a mixed JavaScript/Python codebase with cross-language implementations (C, Java) for performance-critical harmonic calculations.

## Repository Structure (Actual)

```
Solidarity/
├── src/                          # Core source code
│   ├── henry-7-step-14-shoe-waltz.js   # Foundational numerological system
│   ├── solidarity-platform.js          # Main platform orchestrator
│   ├── processor.js                    # Core processing logic
│   ├── soul-edxchang.js               # Exchange and session management
│   ├── stonensync.js                  # Synchronization (7/14 beat structures)
│   ├── cubit-calculation.js           # Sacred geometry calculations
│   ├── main_integration.py            # Complete Python system integration
│   ├── error-utils.js / error_utils.py # Cross-language error handling
│   ├── harmonics/                     # Python harmonic processing
│   │   ├── core_harmonics.py         # f_n = n × f₀ calculations
│   │   ├── advanced_analysis.py      # FFT, HPS, THD analysis
│   │   ├── generate_data.py          # CSV data generation
│   │   └── cross_language.py         # C/Java integration helpers
│   ├── audio/                         # Audio processing modules
│   │   ├── dynamic_processing.py     # Compression/expansion
│   │   └── audio_zoom.py            # Beamforming/spatial audio
│   ├── temporal/                      # Temporal control
│   │   └── temporal_control.py       # Cog switching, lock-stop mechanisms
│   └── cross_language/               # Performance implementations
│       ├── harmonic_processor.c      # C implementation
│       └── HarmonicProcessor.java    # Java implementation
├── tests/
│   └── run-tests.js                  # Comprehensive test suite (15 tests)
├── examples/
│   ├── demo.js                       # Full system demonstration
│   └── validation.js                 # Mathematical validation
├── data/                             # Generated harmonic data
│   ├── complete_harmonic_series.csv
│   ├── harmonic_verification_backup.csv
│   ├── just_intonation_intervals.csv
│   └── prime_harmonics.csv
└── docs/                             # Mathematical documentation
    ├── complete-solidarity-code.md
    └── henry-7-step-mathematical-documentation.md
```

**Note:** README.md mentions `contracts/`, `sql/`, and `palette/` directories that don't currently exist. These are planned future additions for blockchain smart contracts, database schemas, and design assets.

## Code Style & Standards

### JavaScript (ES6+ Modules)
- Use ES6+ modules (`import`/`export`) - **this is enforced via `"type": "module"` in package.json**
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous operations
- Follow the existing class-based architecture
- Maintain mathematical precision in all calculations (use appropriate numeric types)
- Include comprehensive JSDoc comments for complex mathematical functions
- All modules export a default class (see examples in src/)

### Python (Scientific Computing)
- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values (e.g., `def calculate(freq: float) -> np.ndarray:`)
- Maintain scientific precision in numerical calculations
- **Always use numpy** for array operations and mathematical computations
- Include detailed docstrings for complex mathematical algorithms
- Handle edge cases (division by zero, invalid frequencies, etc.)

### General Principles
- **Mathematical Accuracy**: All harmonic and numerical calculations must be mathematically precise
- **Documentation**: Complex mathematical concepts require clear explanations with examples
- **Testing**: All new functionality must have corresponding tests in `tests/run-tests.js`
- **Backwards Compatibility**: Maintain compatibility with existing APIs (don't break existing interfaces)
- **Performance**: Optimize for audio processing and real-time applications (use C/Java implementations when needed)

## Architecture Guidelines

### Core Components (Data Flow)
1. **Henry7Step14ShoeWaltz** (`src/henry-7-step-14-shoe-waltz.js`)
   - Foundational numerological system implementing 7→14→49 progression
   - Validates Pythagorean relationships and source paths
   - Used by all other modules for mathematical verification

2. **SolidarityProcessor** (`src/processor.js`)
   - Processes harmonic phrases and content alignment
   - Integrates with focused correction and phrase parsing
   - Uses seed-based reproducibility for consistent results

3. **HarmonicProcessor** (`src/harmonics/core_harmonics.py`)
   - Core harmonic calculations: f_n = n × f₀
   - Generates harmonic series with numpy precision
   - Exports data to CSV files in `data/`

4. **AdvancedHarmonicAnalyzer** (`src/harmonics/advanced_analysis.py`)
   - FFT analysis, pitch detection (HPS), THD calculation
   - Real-time audio processing at 44100 Hz sample rate
   - Integrates with dynamic compression and audio zoom

5. **TemporalController** (`src/temporal/temporal_control.py`)
   - **Key Principle**: "Fiscal time always moves forward, but cogs switch function not direction"
   - CogMode: NORMAL, FUNCTION_SWITCH, REVERSE_PROCESS, LOCK_STOP
   - Maintains temporal consistency across all operations

6. **StonenSync** (`src/stonensync.js`)
   - 7/14 beat structures with 3.5 micro-pulse drift correction
   - Resync pulses at beat boundaries for system-wide alignment
   - Lock-only-at-49 mechanism for stone state changes

7. **SolidarityPlatform** (`src/solidarity-platform.js`)
   - Main orchestrator integrating all components
   - Manages system lifecycle (start/shutdown)
   - Provides unified interface for complete sessions

8. **CubitCalculationSystem** (`src/cubit-calculation.js`)
   - Sacred geometry: 49² = 2401, split by 3.5 = 686
   - Concentric rings (1:3:5 split into ninths)
   - Total: ~697 cubits with Pythagorean verification lane

### Key Mathematical Relationships (Verify These!)
- **Base progression**: 7 → 14 → 49 (double, then square)
- **Control ratio**: 3.5 = 49÷14 (perfect split)
- **Source paths**: 
  - Path 1: 2 + 5 = 7 (odd + even)
  - Path 2: 3 + 4 = 7 (odd + even)
- **Pythagorean verification**: 7² + 24² = 25² (exact: 49 + 576 = 625 ✓)
- **Total cubits**: ~697 (validated through ring calculations)
- **Tesla 3-6-9**: Preserved in sacred relationships (see tests)

### Module Dependencies & Integration Patterns
- **Cross-language**: Python ↔ JavaScript via `error_utils.py` / `error-utils.js`
- **Data flow**: Python generates CSV → JavaScript reads for validation
- **Session pattern**: All components initialized through SolidarityPlatform
- **Configuration**: Use object spread with defaults: `{...config, default: config.default ?? 'value'}`
- **State management**: Each component maintains its own state, synchronized via StonenSync pulses

## Testing Guidelines

### Running Tests
```bash
npm test              # Run all 15 tests (should pass 100%)
npm run demo          # Full system demonstration
npm run validate      # Mathematical validation
python src/main_integration.py  # Python integration test
```

### Test Structure (tests/run-tests.js)
- **Custom TestRunner class**: Simple assert-based framework
- **15 comprehensive tests**: Cover all core components and mathematical relationships
- **Test categories**:
  - Henry 7 Step 14 Shoe Waltz (validation, source paths, execution)
  - Processor (initialization, seed-based reproducibility)
  - SoulEdXchang (session management)
  - StonenSync (synchronization, stone state)
  - Cubit calculations (math, total count, validation)
  - Platform integration (initialization, status)
  - Sacred mathematics (6×7, 7×8, 8×9, Tesla 3-6-9)
  - Harmonic calculations (ratios, progressions)

### Adding New Tests
```javascript
runner.test('Your Test Name', () => {
    const component = new YourComponent();
    runner.assertEqual(component.property, expectedValue);
    runner.assertApproximately(component.calculate(), expected, 0.001); // For floats
    runner.assert(component.validate(), 'Custom error message');
});
```

### Mathematical Validation Requirements
- Verify all harmonic series calculations match f_n = n × f₀
- Test temporal control maintains forward fiscal time
- Validate cubit allocation sums correctly (~697 total)
- Ensure Pythagorean relationships hold (7² + 24² = 25²)
- Check Tesla 3-6-9 preservation in all sacred relationships

### Performance Testing (Python)
- Audio processing at 44100 Hz sample rate (standard)
- Real-time processing capabilities with numpy
- Memory usage for long-running processes (monitor with profiler)
- FFT performance for frequency analysis

## Common Patterns

### Configuration Management (with Defaults)
```javascript
// Standard pattern used throughout codebase
constructor(config = {}) {
    this.config = {
        defaultValue: config.defaultValue ?? 'default',
        enableFeature: config.enableFeature ?? true,
        numericalValue: config.numericalValue ?? 0,
        ...config  // Allow override of all defaults
    };
}
```

### Error Handling (Cross-Language)
```javascript
// JavaScript: Use error-utils.js
import { logError, logFatalError } from './error-utils.js';

try {
    if (!this.validateMathematicalRelationship()) {
        throw new Error('Mathematical validation failed: 7→14→49 progression violated');
    }
} catch (error) {
    logFatalError(error, 'Component initialization failed:');
}
```

```python
# Python: Use error_utils.py
from error_utils import log_error, log_fatal_error

try:
    if not self.validate_progression():
        raise ValueError("7→14→49 progression violated")
except Exception as e:
    log_fatal_error(e, "Harmonic calculation failed")
```

### Mathematical Operations (Numpy Required)
```python
# Use numpy for precision and performance
import numpy as np

def calculate_harmonic_series(fundamental: float, num_harmonics: int) -> np.ndarray:
    """Calculate harmonic series with mathematical precision.
    
    Args:
        fundamental: Base frequency in Hz (f₀)
        num_harmonics: Number of harmonics to calculate
        
    Returns:
        Array of harmonic frequencies [f₀, 2f₀, 3f₀, ..., nf₀]
    """
    return np.array([fundamental * (i + 1) for i in range(num_harmonics)])
```

### State Validation Pattern
```javascript
// Validate before operations, used in multiple components
validate() {
    const errors = [];
    
    if (this.base !== 7) errors.push('Base must be 7');
    if (this.double !== 14) errors.push('Double must be 14');
    if (this.square !== 49) errors.push('Square must be 49');
    
    if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    return true;
}
```

## Integration Points

### Cross-Language Integration (Python ↔ JavaScript)
- **Python**: Intensive mathematical computations, numpy-based harmonic processing
- **JavaScript**: Platform orchestration, I/O, state management
- **Data Exchange**: CSV files in `data/` directory serve as data bridge
- **Error Handling**: Parallel `error_utils.py` and `error-utils.js` for consistent error reporting
- **Shared Concepts**: Both languages implement same mathematical validations

### Audio Processing Standards
- **Sample Rate**: 44100 Hz (standard CD quality, hardcoded in system)
- **Buffering**: Proper buffering for real-time processing in `audio_zoom.py`
- **Format**: NumPy arrays in Python, standard arrays in JavaScript
- **Precision**: Use float64 (double precision) for all audio calculations

### Temporal Control Philosophy
- **Core Principle**: "Fiscal time always moves forward with time, but the cogs switch function not entire sense of direction"
- **Implementation**: `temporal_control.py` with CogMode enum
- **Modes**:
  - `NORMAL`: Standard forward processing
  - `FUNCTION_SWITCH`: Cogs change function while time advances
  - `REVERSE_PROCESS`: Processing goes backward, fiscal time forward
  - `LOCK_STOP`: Lock mechanism for synchronization
- **Usage**: All components respect temporal controller state

### Synchronization via StonenSync
- **Beat Structures**: 7 or 14 beats with 3.5 micro-pulse drift correction
- **Resync Pulses**: Emitted at beat boundaries (every 7 or 14 beats)
- **Lock Mechanism**: Stone state changes only at beat 49 (configurable)
- **Integration**: Other components listen for resync pulses to realign

### Performance Implementations (C/Java)
- **When to Use**: Performance-critical harmonic calculations
- **C Implementation**: `src/cross_language/harmonic_processor.c`
- **Java Implementation**: `src/cross_language/HarmonicProcessor.java`
- **Integration**: Called from Python via `cross_language.py` helpers

## Security Considerations
- **Input Validation**: All parameters validated before mathematical operations (check for NaN, Infinity, negative frequencies)
- **Sanitization**: Mathematical expressions should be validated against expected patterns
- **Buffer Safety**: Audio processing uses numpy with bounds checking
- **Configuration**: Environment variables in `.env` (see `.env.example`)
- **No External APIs**: System is self-contained (no network dependencies in core)

## Performance Optimization
- **Numpy**: ALWAYS use for array operations (10-100x faster than Python loops)
- **Caching**: Harmonic calculations should cache results where appropriate
- **CSV Generation**: Pre-generate harmonic data to `data/` directory
- **Lazy Loading**: Load heavy resources only when needed
- **Parallel Processing**: Consider for batch harmonic analysis (scipy.fft is already optimized)

## Documentation Requirements
- **Mathematical Proofs**: Include for complex algorithms (see `docs/henry-7-step-mathematical-documentation.md`)
- **API Examples**: All public methods should have usage examples
- **Philosophical Foundation**: Document the "why" behind the 7→14→49 system
- **Changelog**: Update when mathematical formulas change (impacts reproducibility)

## Trademark and Licensing
- **Trademark**: By Scott Charles Olson (TRADEMARKED BY SCOTT CHARLES OLSON)
- **License**: MIT License for code, with commercial restrictions up to v2.41
- **Contributors**: 
  - "Charly" (Scott Charles Olson) - Architect
  - "Hank" (Charles H. Dykes) - Framework concept design
- **Attribution**: Required in all derivative works

## Planned Future Additions (Not Yet Implemented)

### Blockchain Integration (`contracts/` - planned)
- Solidity smart contracts for on-chain logic
- 12-node self-correcting system with alpha/beta/omega locks
- Community integration, institutional onboarding
- Revenue allocation and stability metrics

### Database Layer (`sql/` - planned)
- Asset management tables
- Gradient scaling schemas
- Transaction history

### Design System (`palette/` - planned)
- Color palettes aligned with harmonic frequencies
- Design tokens for UI components

### AI Agent Integration (discussed but not implemented)
- Perplexity AI integration for real-time insights
- Agent system with code editing capabilities
- VS Code extension with dropdown node selection
- 12-node autonomous operation

**Note**: These features were discussed in development conversations but are not yet part of the codebase. Implement them following the established patterns above.

## When Writing New Code

1. **Understand the Math First**: Read `docs/henry-7-step-mathematical-documentation.md`
2. **Validate Against 7→14→49**: All new features must respect the base progression
3. **Add Tests**: Update `tests/run-tests.js` with new test cases
4. **Document the Reasoning**: Explain WHY, not just WHAT (mathematical context matters)
5. **Integrate with Existing**: Use SolidarityPlatform for orchestration
6. **Maintain Performance**: Profile audio processing, optimize with numpy/C/Java if needed
7. **Follow Patterns**: Use configuration defaults, error handling, and state validation patterns above
8. **Cross-Language Consistency**: If implementing in both Python and JavaScript, maintain API parity