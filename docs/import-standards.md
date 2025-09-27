# Solidarity Platform Import Standards

## Overview

The Solidarity Platform follows consistent import patterns across all JavaScript modules to maintain code clarity and ensure predictable module resolution.

## Import Patterns

### 1. Within `src/` Directory

When importing modules within the `src/` directory, use relative paths starting with `./`:

```javascript
// ✅ Correct - relative import within src/
import Henry7Step14ShoeWaltz from './henry-7-step-14-shoe-waltz.js';
import SolidarityProcessor from './processor.js';
import { logError } from './error-utils.js';
```

### 2. From External Directories to `src/`

When importing from `examples/`, `tests/`, or other directories into `src/`, use relative paths with `../src/`:

```javascript
// ✅ Correct - importing from external directory to src/
import SolidarityPlatform from '../src/solidarity-platform.js';
import { logFatalError } from '../src/error-utils.js';
```

### 3. File Extension Requirements

Always include the `.js` extension for ES module compatibility:

```javascript
// ✅ Correct - includes .js extension
import SolidarityPlatform from './solidarity-platform.js';

// ❌ Incorrect - missing .js extension
import SolidarityPlatform from './solidarity-platform';
```

## Module Naming Conventions

### Core Modules
- `solidarity-platform.js` - Main platform orchestration
- `henry-7-step-14-shoe-waltz.js` - Core numerological system
- `processor.js` - Staged gating and harmonic progression
- `cubit-calculation.js` - Sacred geometry calculations
- `stonensync.js` - Synchronization and stabilization
- `soul-edxchang.js` - Exchange and session management
- `error-utils.js` - Error handling utilities (NOT error-handler.js)

### Directory Structure
```
src/
├── solidarity-platform.js      # Main entry point
├── henry-7-step-14-shoe-waltz.js
├── processor.js
├── cubit-calculation.js
├── stonensync.js
├── soul-edxchang.js
├── error-utils.js             # Correct filename
├── harmonics/                 # Python harmonic processing
├── audio/                     # Audio processing modules
├── temporal/                  # Temporal control systems
└── cross_language/            # C/Java implementations
```

## Consistency Rules

1. **Use relative paths only** - No absolute paths or complex aliasing
2. **Include .js extensions** - Required for ES modules
3. **Maintain directory structure** - Don't bypass the established hierarchy
4. **Reference correct filenames** - Use `error-utils.js`, not `error-handler.js`

## Validation

To verify import consistency:

```bash
# Check all import statements
grep -r "import.*from" --include="*.js" .

# Verify no incorrect error-handler.js references
grep -r "error-handler" --include="*.js" .
```

## Future Considerations

If the project grows significantly, consider:
- Node.js package.json "imports" field for cleaner paths
- TypeScript with path mapping
- Webpack/Vite module aliases

However, maintain backward compatibility and team consensus before implementing changes.

---

**Note**: This documentation reflects the current consistent state of imports in the Solidarity Platform. All imports already follow these standards as of the analysis date.