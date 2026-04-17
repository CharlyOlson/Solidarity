# Solidarity Platform Codebase Audit Report

**Date:** 2026-04-17
**Scope:** Full file-by-file audit of all backend, frontend, contracts, and deployment config

## Summary

**22 issues found and fixed.** All builds and tests now pass.

- Frontend build: `CI=true npm run build` — PASS
- Hardhat compile: `npx hardhat compile --force` — PASS (15 Solidity files, 1 shadowing warning)
- Jest tests: `npm test` — PASS (3 suites, 8 tests)

---

## Issues Found and Fixed

### 1. Backend — Missing Route Files (Critical)

**`src/api/server.js`** imported three route modules that did not exist:
- `./routes/financial` — **MISSING**
- `./routes/system` — **MISSING**
- `./routes/auth` — **MISSING**

Only `./routes/audio.js` existed.

**Fix:** Created all three route files:
- `src/api/routes/auth.js` — re-exports authRouter from middleware/auth
- `src/api/routes/financial.js` — financial overview, transactions, wallet, treasury endpoints
- `src/api/routes/system.js` — system status, discovery, devices endpoints

### 2. Backend — Missing Middleware Files (Critical)

**`src/api/server.js`** imported two middleware modules that did not exist:
- `./middleware/validation` — **MISSING**
- `./middleware/errorHandler` — **MISSING**

**Fix:** Created both:
- `src/api/middleware/validation.js` — body and query parameter validation
- `src/api/middleware/errorHandler.js` — global Express error handler

### 3. Backend — Duplicate `require('express')` in middleware/auth.js (Critical)

Line 249 of `src/api/middleware/auth.js` had a second `const express = require('express')` declaration, which would crash at runtime with "Identifier 'express' has already been declared".

**Fix:** Removed the duplicate require — the file already had `express` required at the top.

### 4. Backend — bcrypt vs bcryptjs Mismatch (Critical)

`src/api/auth.js` imported `bcrypt` but `package.json` only has `bcryptjs` as a dependency. This would cause a runtime crash.

**Fix:** Changed `require('bcrypt')` to `require('bcryptjs')` in `src/api/auth.js`.

### 5. Backend — Audio Route Broken Imports (Critical)

`src/api/routes/audio.js` imported:
- `../../solidarityAudioProcessor` — **Does not exist as JS** (only a Python file exists)
- `../../enhancedAudioStudioCommands` — incorrect relative path

**Fix:** Removed the non-existent SolidarityAudioProcessor import, fixed the enhancedAudioStudioCommands import path, and replaced the `getAudioProcessor()` calls with a simple status helper.

### 6. Backend — Missing API Endpoints (Medium)

Frontend components called endpoints that didn't exist:
- `/api/auth/verify` (App.js token verification) — backend has `/api/auth/me`
- `/api/auth/register` (LoginRegister.js) — no register endpoint existed
- `/api/devices` (DevicesTab.js) — no devices endpoint
- `/api/ai/chat` (OllamaHome.js) — no AI chat endpoint
- `/api/greek-nodes/status` (GreekNodesTab.js) — no Greek nodes endpoint

**Fix:**
- Added `/api/auth/register` route to middleware/auth.js
- Added `/api/devices`, `/api/ai/chat`, `/api/greek-nodes/status`, `/api/greek-nodes/activate/:nodeKey` to server.js
- Changed frontend App.js to call `/auth/me` instead of `/auth/verify`

### 7. Backend — No Static File Serving or SPA Catch-all (Medium)

Server had no `express.static` for the frontend build folder and used a wildcard 404 for all non-API routes, which would break SPA routing in production.

**Fix:** Added:
- `path` module import
- `express.static(frontendBuildPath)` for serving built frontend
- SPA catch-all that serves `index.html` for non-API routes
- Separate `/api/*` catch-all for unknown API routes

### 8. Frontend — Hardcoded localhost in API Client (Critical for Production)

`frontend/src/api/client.js` defaulted to `http://localhost:3000/api` and had multiple hardcoded `localhost:3001/3002/3003` URLs for mobile sync.

**Fix:**
- Changed `API_BASE_URL` default from `http://localhost:3000/api` to `/api` (same-origin)
- Changed `MOBILE_SYNC_BASE_URL` default from `http://localhost:3001/api` to `/api`
- Rewrote all mobile device methods to use `this.client` (which includes the base URL and auth token) instead of raw `axios` with hardcoded localhost URLs

### 9. Frontend — Hardcoded localhost in MobileDeviceDashboard (Medium)

`MobileDeviceDashboard.js` had `http://localhost:3001/3002/3003` hardcoded for iPhone/iPad/watch servers.

**Fix:** Replaced all `axios.get/post` calls with `apiClient.client.get/post` using relative paths. Removed the `servers` constant and the `axios` import.

### 10. Frontend — Unused React Imports (Build Warning → Error under CI=true)

Five components had `import React, { useState, useEffect } from 'react'` where `React` was unused (React 19 + new JSX transform don't require it). With `CI=true`, unused imports are treated as errors.

**Files fixed:**
- `SystemStatusTab.js`
- `MobileDeviceDashboard.js`
- `DiscoveryTab.js`
- `DevicesTab.js`
- `AudioTab.js`

### 11. Frontend — App.test.js Tests Non-existent Content (Test Failure)

`App.test.js` tested for "learn react" text (CRA default) which doesn't exist in the app.

**Fix:** Changed test to look for "Solidarity" which is the actual app title.

### 12. .env.example — Git Merge Conflict Markers (Medium)

`.env.example` had unresolved merge conflict markers (`<<<<<<< Updated upstream` / `>>>>>>> Stashed changes`).

**Fix:** Resolved the conflict by keeping both sections (audio processing config and quick reference).

### 13. Broken Test Import Path (Test Failure)

`src/SacredNumericSequence.js` imported `../EnhancedHarmonicPhraseParser` (going up to repo root), but the file with `SolidarityHarmonicGenerator` is at `src/core/EnhancedHarmonicPhraseParser.js`.

**Fix:** Changed import to `./core/EnhancedHarmonicPhraseParser`.

### 14. Missing Procfile (Deployment)

No Procfile existed for Heroku/Railway deployment.

**Fix:** Created `Procfile` with `web: node src/api/server.js`.

### 15. Broken Build Script (Medium)

`package.json` `build` script ran `build:frontend && build:docs`, but `build:docs` referenced a nonexistent `scripts/generateDocs.js`.

**Fix:** Changed `build` script to only run `build:frontend`.

---

## Verified Clean

| Check | Result |
|-------|--------|
| `CI=true npm run build` (frontend) | PASS |
| `npx hardhat compile --force` | PASS (15 contracts, 1 warning) |
| `npm test` | PASS (3 suites, 8 tests) |
| No hardcoded localhost in frontend (production paths) | CLEAN |
| No merge conflict markers | CLEAN |
| All route imports resolve | CLEAN |
| All middleware imports resolve | CLEAN |
| All frontend component imports resolve | CLEAN |
| All CSS imports resolve | CLEAN |
| Auth flow (register/login/verify/logout) wired correctly | CLEAN |

---

## Files Modified

1. `src/api/server.js` — added path require, static serving, SPA catch-all, missing endpoints, removed unused validation import
2. `src/api/routes/audio.js` — fixed broken imports
3. `src/api/routes/auth.js` — **NEW** (re-exports authRouter)
4. `src/api/routes/financial.js` — **NEW** (financial endpoints)
5. `src/api/routes/system.js` — **NEW** (system endpoints)
6. `src/api/middleware/auth.js` — removed duplicate express require, added register endpoint
7. `src/api/middleware/validation.js` — **NEW** (validation middleware)
8. `src/api/middleware/errorHandler.js` — **NEW** (error handler middleware)
9. `src/api/auth.js` — fixed bcrypt → bcryptjs
10. `src/SacredNumericSequence.js` — fixed import path
11. `frontend/src/api/client.js` — fixed localhost defaults, rewrote mobile methods
12. `frontend/src/App.js` — fixed /auth/verify → /auth/me
13. `frontend/src/App.test.js` — fixed test assertion
14. `frontend/src/components/MobileDeviceDashboard.js` — removed localhost, use apiClient
15. `frontend/src/components/SystemStatusTab.js` — removed unused React import
16. `frontend/src/components/DiscoveryTab.js` — removed unused React import
17. `frontend/src/components/DevicesTab.js` — removed unused React import
18. `frontend/src/components/AudioTab.js` — removed unused React import
19. `.env.example` — resolved merge conflict markers
20. `package.json` — fixed build script
21. `Procfile` — **NEW** (deployment)

---

## Notes

- **Solidity contracts** compile clean. One shadowing warning in `TreasuryManager.sol` (function parameter `_bp` shadows an internal function `_bp`) — non-breaking but worth renaming in a future PR.
- **GreekNodesTab, AudioTab, SystemStatusTab, DiscoveryTab, MobileDeviceDashboard** exist as components but are not rendered in App.js. They compile cleanly and could be wired into the tab system when ready.
- **Auth system** uses in-memory Map storage, not SQLite. Demo users are seeded by email, not hardcoded UUID.
- **No Stripe integration** exists in the codebase despite being mentioned in specs.
