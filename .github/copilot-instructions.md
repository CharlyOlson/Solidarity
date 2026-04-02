# Solidarity Platform — AI Coding Agent Instructions

## Authority Document

**Before writing any code, read `SOLIDARITY_CHARTER.md` in the root of this repo.**
The charter is the authority. These instructions are the implementation of it.
If any instruction here conflicts with the charter, the charter wins.

---

## What This Platform Is

Solidarity is a financial equity platform using harmonic mathematics and
proven architecture to route value toward people and systems that need it most.

It is NOT:
- A quantum computing system
- A revolutionary AI breakthrough
- A system to be described with inflated capability claims

Code that contradicts those facts violates the charter and must not be merged.

---

## Project Architecture

### Components
- **Core System**: `src/correctedSolidaritySystem.js` — primary entry point
- **Audio Processing**: Python modules integrated with Node.js
- **Financial Layer**: Express API with blockchain connectivity
- **Smart Contracts**: `/contracts/` — canonical is `TreasuryManager.sol`
- **Cross-Repo Links**: Soul.Ed.Xchange, Coul.Curve.Fi, Souls repositories

### Harmonic Framework
- **Node System**: 6 primary nodes (1, 3, 4, 7, 14, 21)
- **Golden Ratio**: φ-based calculations for audio and system metrics
- **ZIP Phrase System**: Key phrases trigger specific system actions
- **RJO Function**: Maps any value to nearest node + signed offset
- **TIMBR Compression**: Septet/ring/block, absence marks, recursive pocketing

### Mathematical Relationships
- Base progression: 7 → 14 → 49
- Control ratio: 3.5 (49÷14)
- Source paths: 2+5=7 and 3+4=7
- Pythagorean anchor: 7²+24²=25²

---

## Development Commands

```bash
# Setup
./setup.sh          # Unix/Linux/macOS
setup.bat           # Windows

# Run
node src/api/server.js          # Start API server
node launcher.js discovery      # System discovery
node launcher.js corrected      # Full system

# Test
npm test
python test_advanced_audio.py
python test_numpy_quick.py
```

---

## Code Standards

### JavaScript
- ES6+ modules, `const`/`let`, async/await, class-based architecture
- JSDoc for all mathematical functions
- Tests required for all new functionality

### Python
- PEP 8, type hints, numpy for array operations
- Detailed docstrings for mathematical algorithms

### All Code
- Mathematical accuracy is non-negotiable
- All inputs distrusted — validate everything
- No secrets in code, logs, or git (see `.env.example` for template)
- Least-privilege default
- Tests: unit + integration + at least one E2E on critical paths

---

## Distribution Logic — Critical

The `contracts/TreasuryManager.sol` contract encodes the distribution
structure from the charter. Do not modify recipient allocations without
a signed commit from CharlyOlson and an explicit charter amendment.

The distribution structure is intentional and locked. It is not a stub
to be filled in later. It is the entire point of the system.

---

## Security Rules for This Agent

1. Never commit secrets, keys, tokens, or credentials to any file
2. Never bypass branch protection or push directly to main
3. Never create branches without a clear, named purpose
4. Never modify `SOLIDARITY_CHARTER.md` or `contracts/TreasuryManager.sol`
   without explicit founder authorization
5. Never add hype language, false capability claims, or inflated descriptions
6. When in doubt, open a PR and wait for human review

---

## Project Conventions

### Execution Pattern
- Direct Node/Python execution rather than npm scripts where possible
- Python virtual environment via `setup_python_env.py`

### Cross-Repository Structure
- **Solidarity**: Core platform and API
- **Soul.Ed.Xchange**: Educational components
- **Coul.Curve.Fi**: Financial algorithms
- **Souls**: Community integration

### Module Structure
- Keep mathematical logic separate from I/O
- Dependency injection for configuration
- Proper error handling for all edge cases
- State consistency across components

---

## Key Files

| File | Purpose |
|------|---------|
| `SOLIDARITY_CHARTER.md` | **Authority document — read first** |
| `contracts/TreasuryManager.sol` | Canonical distribution contract |
| `src/correctedSolidaritySystem.js` | Main system integration |
| `src/api/server.js` | Express API entry point |
| `EnhancedHarmonicPhraseParser.js` | ZIP phrase system |
| `.env.example` | Environment variable template (not the real .env) |

---

## When Writing New Code

1. Read `SOLIDARITY_CHARTER.md` — does this change align with it?
2. Understand the mathematical context before touching calculations
3. Validate relationships against the 7→14→49 progression where relevant
4. Write tests alongside the code, not after
5. Document mathematical reasoning in comments
6. Open a PR — never push directly to main
7. Blast radius check: what breaks if this fails?

---

*Instructions version: 2.0 — April 2026*
*Authority: SOLIDARITY_CHARTER.md v1.0*
