# GitHub Copilot Instructions for Solidarity Platform

## Project Overview
The Solidarity Platform implements the Henry 7 Step 14 Shoe Waltz numerological framework with harmonic processing, temporal control, and mathematical precision. This is a mixed JavaScript/Python codebase with ~19 source files organized into modular components.

**Repository Structure:**
```
src/
├── JavaScript Core (7 files)
│   ├── henry-7-step-14-shoe-waltz.js    # Foundation numerological system
│   ├── solidarity-platform.js            # Main orchestration
│   ├── processor.js                      # Staged gating & processing
│   ├── soul-edxchang.js                 # Exchange & negotiation
│   ├── stonensync.js                    # Synchronization
│   ├── cubit-calculation.js             # Sacred geometry
│   └── error-utils.js                   # Error handling
├── Python Processing (9 files)
│   ├── harmonics/                       # Audio harmonic calculations
│   ├── audio/                          # Audio zoom & dynamics
│   ├── temporal/                       # Temporal control
│   └── main_integration.py             # Complete system integration
tests/run-tests.js                       # 15 comprehensive tests
examples/                                # Demo & validation scripts
```

## Code Style & Standards

### JavaScript (ES6+ Modules)
- Use `import`/`export` syntax (not `require`)
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous operations
- Follow class-based architecture with config objects
- Include JSDoc for public methods with mathematical focus
- Example pattern from codebase:
```javascript
export class ComponentName {
    constructor(config = {}) {
        this.config = {
            enableFeature: config.enableFeature ?? true,
            ...config
        };
    }
}
```

### Python (Scientific Computing)
- Follow PEP 8 style guidelines
- Use type hints: `def method(param: float) -> np.ndarray:`
- Import numpy as `np` for mathematical operations
- Use docstrings with mathematical notation
- Sample rate constant: 44100 Hz
- Example from `src/harmonics/core_harmonics.py`:
```python
def generate_harmonic_series(fundamental: float, num_harmonics: int) -> np.ndarray:
    """Generate mathematically precise harmonic series."""
    return np.array([fundamental * (i + 1) for i in range(num_harmonics)])
```

### General Principles
- **Mathematical Accuracy**: Use `Number.EPSILON` for JS comparisons, numpy precision for Python
- **Testing**: Run `npm test` - all 15 tests must pass
- **No External Dependencies**: Core functionality uses Node.js builtins + numpy only
- **Backwards Compatibility**: Don't change public method signatures
- **Error Handling**: Use `error-utils.js` helper functions

## Architecture Guidelines

### Core Components & Their Relationships

**1. Henry7Step14ShoeWaltz** (`henry-7-step-14-shoe-waltz.js`)
   - Foundation: Validates 7→14→49 progression
   - Key method: `waltz()` returns progression, harmonics, relationships
   - Used by: All other components for validation

**2. SolidarityPlatform** (`solidarity-platform.js`)
   - Orchestrates all 5 components
   - Method: `executeIntegratedSession(sessionData)` runs complete workflow
   - Initializes: waltz, processor, soulEdXchang, stonenSync, cubitSystem

**3. SolidarityProcessor** (`processor.js`)
   - Staged gating with 3 checkpoints
   - Critical: Prevents "digital-root collapse"
   - Methods: `initializeSeed()`, `processWithStaging()`

**4. SoulEdXchang** (`soul-edxchang.js`)
   - 3-phase negotiation: truth-seeking (7) → scaled-share (14) → completion (49)
   - Methods: `initializeSession()`, `negotiateExchange()`, `executeExchange()`, `certifyCompletion()`

**5. StonenSync** (`stonensync.js`)
   - Beat structures: 7 or 14 cycle intervals
   - Drift correction at 3.5 ratio checkpoints
   - Methods: `startSync()`, `stopSync()`, `getStoneState()`

**6. CubitCalculationSystem** (`cubit-calculation.js`)
   - Sacred geometry: 49² → 2401 → 686 cubits (via 3.5 split)
   - Ring allocation: 1-3-5 parts = ~686 cubits
   - Total with infrastructure: ~697 cubits
   - Pythagorean verification: 7²+24²=25²

**7. Python Integration** (`src/main_integration.py`, `src/harmonics/`, `src/audio/`, `src/temporal/`)
   - Harmonic Processing: FFT, THD, spectral analysis
   - Audio Zoom: Beamforming, dynamic processing
   - Temporal Control: "Fiscal time moves forward, cogs switch function"
   - Usage: Import modules, call with numpy arrays at 44100 Hz

### Key Mathematical Relationships (IMMUTABLE)
```
Base progression: 7 → 14 → 49
Control ratio: 49÷14 = 3.5 (checkpoint)
Source paths: 2+5=7 and 3+4=7 (dual validation)
Pythagorean triple: 7²+24²=25² (geometric proof)
Total cubits: ~697 (validated via ring calculations)
Tesla bridge: 6 → [7,8] → 9 (harmonic resonance)
```

### Data Flow Pattern
```
User Input → Platform.executeIntegratedSession() →
  1. Waltz (validate 7→14→49)
  2. Processor (staged gating)
  3. Exchange (negotiate at 7, scale at 14, complete at 49)
  4. Sync (lock at checkpoints)
  5. Cubits (allocate geometry)
→ Validation & Results
```

## Testing Guidelines

### Running Tests
```bash
npm test              # Runs tests/run-tests.js
npm run demo          # Runs examples/demo.js  
npm run validate      # Runs examples/validation.js
```

### Test Structure (15 tests total)
- **Mathematical Validation** (4 tests): Henry progression, harmonics, sacred relationships
- **Component Tests** (7 tests): Each component's core functionality
- **Integration Tests** (4 tests): Platform orchestration, cross-component validation

### Writing New Tests
Follow the pattern in `tests/run-tests.js`:
```javascript
runner.test('Component - Feature Description', () => {
    const component = new Component();
    runner.assertEqual(component.value, expectedValue);
    runner.assertApproximately(component.ratio, 3.5, 0.001);
    runner.assert(component.validate(), 'Should validate correctly');
});
```

### Mathematical Validation Requirements
- Verify 7→14→49 progression holds
- Check control ratio = 3.5 (within tolerance)
- Validate Pythagorean triple: 7²+24²=25²
- Ensure cubit total ≈ 697
- Test harmonic series accuracy (f_n = n × f₀)

## Common Patterns

### Configuration with Defaults (Used by all components)
```javascript
constructor(config = {}) {
    this.config = {
        enableFeature: config.enableFeature ?? true,
        preferredDimension: config.preferredDimension ?? '9D',
        archiveDimension: config.archiveDimension ?? '12D',
        ...config  // Spread remaining config last
    };
}
```

### Error Handling (Use error-utils.js)
```javascript
import { logError, logFatalError } from './error-utils.js';

try {
    if (!this.validateProgression()) {
        throw new Error('Progression validation failed: 7→14→49 not maintained');
    }
} catch (error) {
    logFatalError(error, 'Component initialization failed');
    throw error;  // Re-throw after logging
}
```

### State Management Pattern
```javascript
this.state = 'idle';  // States: idle → active → completed → failed
this.currentPhase = null;
this.sessions = new Map();  // Use Map for session storage
```

### Validation Pattern (Critical for all mathematical operations)
```javascript
validate() {
    const checks = {
        baseValid: this.base === 7,
        doubleValid: this.double === 14,
        squareValid: this.square === 49,
        ratioValid: Math.abs((this.square / this.double) - 3.5) < Number.EPSILON
    };
    return Object.values(checks).every(v => v === true);
}
```

### Python-JavaScript Interop
- Python processes audio (numpy arrays)
- JavaScript orchestrates workflow
- No direct IPC - Python modules are standalone
- Future integration: Consider JSON data exchange via filesystem or stdout

## Integration Points

### JavaScript to Python (Current: Separate execution)
- Python files in `src/harmonics/`, `src/audio/`, `src/temporal/`
- Run independently: `python3 src/main_integration.py`
- Future: Consider subprocess communication for integrated execution

### Cross-Language Data Standards
```javascript
// JavaScript session data structure
const sessionData = {
    participantA: { id: string, type: string },
    participantB: { id: string, type: string },
    proposalA: { value: 7, type: 'truth_seeking', content: string },
    proposalB: { value: 14, type: 'scaled_share', content: string },
    exchangeData: { content: string, value: 49, cubits: number }
};
```

```python
# Python audio processing parameters
{
    'sample_rate': 44100,           # Standard audio sample rate
    'buffer_size': 1024,            # Power of 2 for FFT
    'fundamental_frequency': 440.0,  # A4 reference
    'num_harmonics': 49             # Aligned to 7→14→49
}
```

### Audio Processing Pipeline
1. Generate signal (Python: `core_harmonics.py`)
2. Analyze harmonics (Python: `advanced_analysis.py`)
3. Apply dynamics (Python: `dynamic_processing.py`)
4. Temporal control (Python: `temporal_control.py`)
5. Validate with JS components

### Temporal Control Principle
**"Fiscal time always moves forward; cogs switch function, not direction"**
- `fiscal_time` increments continuously (never reverses)
- `processing_time` can reverse or pause (cog function changes)
- Cog modes: FORWARD_PROCESS, REVERSE_PROCESS, PAUSE, SKIP
- See `src/temporal/temporal_control.py` for implementation

## Development Workflow

### Setup & Installation
```bash
git clone https://github.com/CharlyOlson/Solidarity.git
cd Solidarity
npm install  # No external dependencies currently
```

### Common Commands
```bash
npm test              # Run 15 core tests
npm run demo          # Execute complete demo
npm run validate      # Mathematical validation
node examples/demo.js # Full integration example
```

### Python Setup (Optional for audio processing)
```bash
pip install numpy
python3 src/main_integration.py  # Demonstrates complete audio pipeline
```

### Making Changes
1. **Understand the math first**: Review `docs/henry-7-step-mathematical-documentation.md`
2. **Run tests before changes**: `npm test` (baseline)
3. **Make minimal changes**: Follow existing patterns
4. **Run tests after changes**: All 15 must pass
5. **Update docs if needed**: Mathematical proofs in `docs/`

### Debugging Tips
- Enable verbose logging in components (add `verbose: true` to config)
- Check `.env.example` for system configuration
- Validate progression: base(7) → double(14) → square(49) → ratio(3.5)
- For Python: Use `print()` debugging or `pdb` module

## Project-Specific Conventions

### Direct Execution (No Build Step)
- All JavaScript files are ES6 modules - run directly with Node.js
- No transpilation, bundling, or compilation needed
- Entry points: `examples/demo.js`, `tests/run-tests.js`

### Mathematical Precision is Non-Negotiable
- Use `Number.EPSILON` for float comparisons in JavaScript
- Python: Use numpy's float64 precision
- Never approximate: 3.5, 7, 14, 49 are exact values
- Control ratio MUST equal 3.5: `assert(49/14 === 3.5)`

### Naming Conventions
- Classes: PascalCase (`SolidarityPlatform`, `Henry7Step14ShoeWaltz`)
- Files: kebab-case matching class name (`solidarity-platform.js`)
- Methods: camelCase (`executeIntegratedSession`, `validateProgression`)
- Constants: UPPER_SNAKE_CASE in env (`HENRY_7_STEP_BASE=7`)
- Python: snake_case for everything except classes

### State Transitions Must Be Explicit
```javascript
// Good: Clear state progression
this.state = 'idle';
this.state = 'processing';
this.state = 'completed';

// Bad: Implicit or unclear states
this.processing = true;
this.done = false;
```

### Session Management Pattern
```javascript
// All stateful components use this pattern
this.sessions = new Map();  // Never use plain objects
this.sessions.set(sessionId, sessionData);
const session = this.sessions.get(sessionId);
```

### Avoid These Anti-Patterns
- ❌ Don't use `var` (use `const` or `let`)
- ❌ Don't mutate method parameters
- ❌ Don't skip validation (every component must validate)
- ❌ Don't approximate mathematical constants
- ❌ Don't break the 7→14→49 progression
- ❌ Don't reverse fiscal time (only cogs reverse)

## Important Files & Their Roles

### Core Documentation
- `README.md` - Project overview and licensing
- `docs/henry-7-step-mathematical-documentation.md` - Complete mathematical proofs
- `.env.example` - System configuration template

### Entry Points
- `src/solidarity-platform.js` - Main orchestration (import this for full system)
- `examples/demo.js` - Complete working example
- `tests/run-tests.js` - Test suite (15 tests)

### Python Integration
- `src/main_integration.py` - Demonstrates complete Python pipeline
- `src/harmonics/core_harmonics.py` - Fundamental calculations (start here)
- `src/temporal/temporal_control.py` - Temporal control implementation

## External Dependencies & Boundaries

### JavaScript Dependencies
- **Runtime**: Node.js ≥14.0.0
- **Modules**: ES6 built-ins only (Map, Set, Math, Date)
- **External packages**: None (pure Node.js)

### Python Dependencies
- **Runtime**: Python 3.7+
- **Required**: numpy (for array operations)
- **Optional**: matplotlib (for visualization in examples)

### No External Services
- No database connections
- No API calls
- No network dependencies
- Self-contained mathematical system

## Quick Start Examples

### Example 1: Run Complete System Demo
```bash
npm run demo
# Output: Complete walkthrough of all components with validation
```

### Example 2: Use Henry 7 Step 14 Shoe Waltz
```javascript
import Henry7Step14ShoeWaltz from './src/henry-7-step-14-shoe-waltz.js';

const waltz = new Henry7Step14ShoeWaltz();
const result = waltz.waltz();
console.log(result.progression);  // { base: 7, double: 14, square: 49 }
console.log(result.validated);    // true
```

### Example 3: Calculate Cubit Allocation
```javascript
import CubitCalculationSystem from './src/cubit-calculation.js';

const cubits = new CubitCalculationSystem();
const allocation = cubits.getCubitAllocation();
console.log(`Total cubits: ${allocation.total.cubits}`);  // ~697
```

### Example 4: Execute Integrated Session
```javascript
import SolidarityPlatform from './src/solidarity-platform.js';

const platform = new SolidarityPlatform();
const session = await platform.executeIntegratedSession({
    participantA: { id: 'user_a', type: 'external' },
    participantB: { id: 'user_b', type: 'external' },
    proposalA: { value: 7, type: 'truth_seeking' },
    proposalB: { value: 14, type: 'scaled_share' }
});
console.log(session.validated);  // true if all components align
```

### Example 5: Python Harmonic Processing
```python
from src.harmonics.core_harmonics import HarmonicProcessor
import numpy as np

processor = HarmonicProcessor(sample_rate=44100)
harmonics = processor.generate_harmonic_series(
    fundamental=440.0,  # A4 note
    num_harmonics=49    # Aligned to system
)
print(f"Generated {len(harmonics)} harmonics")
```

## Authors & Licensing
- **Primary Architect**: Scott Charles Olson ("Charly")
- **Framework Concept Designer**: Charles H. Dykes ("Hank")
- **Trademark**: Scott Charles Olson
- **License**: Open for non-commercial use up to version 2.41 (see LICENSE.md)
- **Location**: Kansas, USA 66210

---

**Last Updated**: 2025-01-01  
**Version**: 1.0.0  
© 2025 Scott Charles Olson. All rights reserved.