# Solidarity

Welcome to the official repository for Solidarity, architected and trademarked by Scott Charles Olson ("Charly").
This platform is dedicated to security, longevity, harmonic research, and community understanding.

---

## Table of Contents
1. [Introduction](#introduction)
2. [Structure](#structure)
3. [Color Utilities](#color-utilities)
4. [Scan & Optimization Environment Flags](#scan--optimization-environment-flags)
5. [Licensing & Commercial Use](#licensing--commercial-use)
6. [Contact](#contact)

---

## Introduction

Solidarity is a full-scale system for commerce and collaborative computation, blending:
- Financial and contract orchestration
- Harmonic / golden-ratio influenced analytics
- Cross-repository knowledge integration (see `REPOSITORY_INTEGRATION.md`)

The unified file web network powers adaptive scans, dependency mapping, and optimization planes (Performance, Harmony, Integration).

---

## Structure

- **contracts/** – Smart contracts and on-chain logic
- **sql/** – Database scripts and queries
- **src/** – Core application source code
- **docs/** – Documentation and roadmap
- **palette/** – Color palettes and design tokens
- **src/utils/colorUtils.js** – Color utility functions for visualization and harmonic color processing
- **.env.example** – Example environment config

Additional operational & analysis modules are located at repository root (e.g., `unified_file_web_network.py`).

---

## Color Utilities

The Solidarity platform includes a comprehensive set of color utilities for visualizations based on harmonic principles:

### Key Color Functions

- **getColorIntensity**: Generate colors from pastel to core based on intensity values with automatic border inversion for high-intensity values.
- **generateHarmonicPalette**: Create color palettes based on golden ratio harmony principles.
- **lerp**: Linear interpolation between colors for smooth transitions.
- **invertColor**: Get complementary/inverse colors for borders and highlights.

### Usage Example

```javascript
const colorUtils = require('./src/utils/colorUtils');

// Get color based on intensity (0-1)
const colorData = colorUtils.getColorIntensity(0.8);
console.log(`Fill color: ${colorData.fill}, Border: ${colorData.stroke}`);

// Generate a harmonic color palette
const palette = colorUtils.generateHarmonicPalette(240, 5); // Blue-based, 5 colors
console.log('Harmonic palette:', palette);
```

Test the color utilities with `node test_color_utils.js`.

---

## Scan & Optimization Environment Flags

Condensed view of key environment variables for the unified scanner (full reference in `REPOSITORY_INTEGRATION.md`).

| Variable | Purpose |
|----------|---------|
| `SOLIDARITY_QUICK_SCAN` | Enable curated fast scan mode |
| `FULL_SCAN` / `FORCE_FULL_SCAN` | Request / force deep traversal (overrides quick) |
| `FULL_SCAN_MAX_FILES` | Cap number of files visited in deep scan |
| `FULL_SCAN_MAX_DEPTH` | Limit directory depth (performance safety) |
| `FULL_SCAN_SKIP_EXTERNAL` | Skip sibling workspace traversal |
| `FULL_SCAN_CACHE` / `QUICK_CACHE` | Enable disk caching for mode results |
| `DISABLE_MEMORY_DISCOVERY_CACHE` | Bypass in-memory discovery cache (test determinism) |
| `SYNC_DISK_CACHE` | Force immediate disk writes (no async defer) |
| `EXPORT_METRICS` | Write per-cycle metrics snapshots under `metrics/` |
| `EXPORT_NETWORK_REPORT` | Emit `network_scan_report.json` + `dependency_graph.json` |

Tests demonstrating usage: `test_unified_system.py`, `test_feature_enhancements.py`.

---

## Licensing & Commercial Use

This platform is available under a **dual-license model**:
1. **Non-Commercial License**: Free for educational, personal, and non-profit use (up to version 2.00)
2. **Commercial License**: Required for any commercial applications

Please see the [LICENSE.txt](LICENSE.txt) file for complete licensing terms and conditions.

All commercial inquiries must be directed to Scott Charles Olson for licensing arrangements.

---

## Contact

- **Architect:** Scott Charles Olson ("Charly")
- **Location:** Kansas, USA 66210
- **Framework Concept Design:** "Hank" Charles H. Dykes
- **Inquiries:** Contact Scott "Charly" (LinkedIn / provided channels) for concept & collaboration requests.

---

© 2025 Scott Charles Olson. All rights reserved.  
TRADEMARKED BY SCOTT CHARLES OLSON
