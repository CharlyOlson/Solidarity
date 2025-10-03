# Repository Integration Guide

## Table of Contents
1. [Twin Repository Architecture](#twin-repository-architecture)
2. [Integration Points](#integration-points)
3. [Development Workflow](#development-workflow)
4. [Quick Cross-Repository Setup](#quick-cross-repository-setup)

---

## Twin Repository Architecture

The Solidarity platform operates across two interlaced repositories for maximum efficiency and security:

### **Solidarity** (Production Repository)
- **Purpose**: Production-ready audio processing & financial commerce platform
- **Status**: ✅ Stable, deployed, frontend-ready
- **Contains**: 
  - Main application code
  - Production APIs
  - Financial integration
  - Security implementation

### **Coul-Curve** (Development Repository)
- **Purpose**: Advanced harmonic research & experimental features
- **Status**: 🧪 Research & Development
- **Contains**:
  - Enhanced harmonic zip system
  - Advanced audio processing algorithms
  - Experimental spatial features
  - Research implementations

---

## Integration Points

### 1. Shared Audio Engine
```bash
# Coul-Curve development feeds into Solidarity production
Coul-Curve/src/harmonicZipSystem.js → Solidarity/src/audio/
```

### 2. Cross-Repository Commands
```bash
# From Solidarity, pull latest Coul-Curve research
npm run sync:coul-curve

# From Coul-Curve, deploy to Solidarity
npm run deploy:solidarity
```

### 3. Unified Testing
```bash
# Test both repositories together
npm run test:cross-repo
```

---

## Development Workflow

1. **Research** new features in **Coul-Curve**
2. **Stabilize** features through testing
3. **Integrate** stable features into **Solidarity**
4. **Deploy** production updates

---
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
## Quick Cross-Repository Setup

```bash
# Clone both repositories
git clone https://github.com/yourusername/Solidarity.git
git clone https://github.com/yourusername/Coul-Curve.git

# Link repositories for development
cd Solidarity
npm run link:coul-curve ../Coul-Curve
```

This twin-repository approach ensures:
- **Stability** in production (Solidarity)
- **Innovation** in development (Coul-Curve)
- **Security** through separation of concerns
- **Efficiency** through focused development

---

## Enhanced Scan & Optimization Environment Flags

The unified file web network exposes a number of environment variables to control scan breadth, performance, caching, and reporting. These can be combined in your shell or in task scripts.

| Category | Variable | Values | Effect |
|----------|----------|--------|--------|
| Mode | `SOLIDARITY_QUICK_SCAN` | 0/1 | Fast curated scan (skips deep traversal & externals) |
| Mode Override | `FORCE_FULL_SCAN` | 0/1 | Forces full scan, overrides quick flag |
| Mode Override | `FULL_SCAN` | 0/1 | Requests full scan (lower precedence than `FORCE_FULL_SCAN`) |
| Limits | `FULL_SCAN_MAX_FILES` | int (default 6000) | Caps number of files scanned |
| Limits | `FULL_SCAN_MAX_DEPTH` | int (default 8) | Maximum directory depth |
| Progress | `FULL_SCAN_PROGRESS_INTERVAL` | int | Emit progress every N discovered files |
| External Workspaces | `FULL_SCAN_SKIP_EXTERNAL` | 0/1 | Skip scanning connected sibling workspaces |
| In‑Memory Cache | `DISABLE_MEMORY_DISCOVERY_CACHE` | 0/1 | Force fresh discovery each run (ignore RAM cache) |
| Disk Cache | `FULL_SCAN_CACHE` | 0/1 | Enable/disable on-disk cache (`.solidarity_scan_cache_full.json`) |
| Quick Disk Cache | `QUICK_CACHE` | 0/1 | Allow disk cache for quick scans |
| Disk Cache Sync | `SYNC_DISK_CACHE` | 0/1 | Write disk cache synchronously (useful in tests) |
| Metrics | `EXPORT_METRICS` | 0/1 | Export per-cycle snapshots to `metrics/` |
| Reports | `EXPORT_NETWORK_REPORT` | 0/1 | Emit `network_scan_report.json` after init |

### Pattern Extension
Add `additional_scan_patterns.json` at the repo root to extend discovery categories. Example:

```json
{
  "core": ["temp_feature_demo_*.py"],
  "audio": ["*spectral*.py"]
}
```

### Branch Diff Summary (Stub)
`branch_diff_summary(base_branch='main', target_branch=None)` returns a lightweight changed-file summary when run inside a git repository (gracefully degrades if git is unavailable).

---

## Unified Test Execution

Two complementary test modules now exist:
- `test_unified_system.py` – core functionality & optimization highways
- `test_feature_enhancements.py` – disk cache, metrics export, pattern extension, branch diff stub

Run both at once with the helper script (added below) or manually:

```bash
python test_unified_system.py
python test_feature_enhancements.py
```

Environment suggestions for fast CI:

```bash
set FORCE_FULL_SCAN=1
set FULL_SCAN_SKIP_EXTERNAL=1
set FULL_SCAN_MAX_FILES=1200
set EXPORT_METRICS=1
set DISABLE_MEMORY_DISCOVERY_CACHE=1
```

> For PowerShell use `$env:VAR='value'`; for bash use `export VAR=value`.

---

## Future Integration Opportunities

| Area | Opportunity | Notes |
|------|-------------|-------|
| Incremental Scans | Git diff–driven selective discovery | Use branch diff to seed targeted scan list |
| Metrics Aggregation | Rolling health trends dashboard | Aggregate `metrics/latest.json` over time |
| Cross-Repo Bridge | Automatic promotion pipeline from Coul-Curve → Solidarity | Gate by health + test success |
| Dependency Graph | Persist enriched dependency edges (JSON) | Accelerate integration optimization heuristics |
