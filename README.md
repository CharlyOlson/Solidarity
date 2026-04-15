# Solidarity Platform

Copyright © Scott Charles Olson (Charly), Kansas USA 66210.  
All rights reserved. "Solidarity" is a trademark of Scott Charles Olson.  
Founding Partner: Charles H. Dykes ("Hank").

---

## Overview

Solidarity is a financial equity platform built on φ-ratio mathematics and harmonic principles. Its purpose is to reduce payment processing fees for small businesses, nonprofits, and local governments — and to distribute the resulting savings according to a fixed, auditable charter.

The mathematics are exact. The distribution rules are immutable. They do not require inflated language to be significant. They are significant on their own terms.

---

## Core Pillars

### Mathematical Coherence
A 7-tier safety architecture derived from the Henry progression (7 → 14 → 49). Control ratio: 3.5. The inverse golden ratio φ⁻¹ = 0.618 governs fee scaling and reserve calculations. Pythagorean verification: 7² + 24² = 25² (49 + 576 = 625). Canonical unit: 697 cubits.

### Financial Equity
Treasury operations follow SOLIDARITY_CHARTER.md exactly. Distribution is fixed: 15 named 1% slots, an infrastructure reserve (set once, max 1,000 basis points), and the Class Equity & Rebuild Fund (remainder). No slot can be altered after charter ratification without a new charter SHA-256 fingerprint and CI guard approval.

### Local AI
All AI inference runs on-premises via [Ollama](https://ollama.com). No data is sent to external model APIs. Models serve as advisory tools within the platform; they do not govern financial logic.

### Bridging Anchor Processing
A Python DSP layer handles signal processing for harmonic validation and coil-to-data conversion. Located in `harmonic/` and interfaced through the Express API.

### Secure Transactions
Authentication: JWT (short-lived access tokens) + bcrypt password hashing. Persistence: SQLite for lightweight deployments; configurable for PostgreSQL in production. All contract calls are signed; secrets never appear in source.

---

## Architecture

```
solidarity/
├── contracts/          Solidity smart contracts (26 total)
├── core/               JavaScript quantum cubic engine, φ-math utilities
├── frontend/           React application
├── docs/               Technical and charter documentation
├── ai/                 Ollama integration and model configuration
├── harmonic/           Python DSP, bridge anchor processing
├── palette/            Design tokens and UI theming
├── data/               Seed data, migration scripts, SQLite schema
├── scripts/            Deployment and maintenance scripts
├── test/               Contract and integration tests
└── .github/            CI/CD workflows
```

---

## Mathematical Foundation

| Parameter | Value | Notes |
|-----------|-------|-------|
| φ (golden ratio) | 1.618033... | Governs scaling |
| φ⁻¹ | 0.618033... | Fee inverse ratio |
| Henry base | 7 | Tier 1 |
| Henry mid | 14 | Tier 2 (7 × 2) |
| Henry peak | 49 | Tier 3 (7²) |
| Control ratio | 3.5 | 49 ÷ 14 |
| Pythagorean triple | 7, 24, 25 | Integrity check |
| Canonical unit | 697 cubits | Harmonic anchor |

The cubic engine in `core/` applies these constants to fee compression calculations. All outputs are verified against Pythagorean constraints before any treasury operation executes.

---

## Smart Contracts

Located in `contracts/`. Compiled with Solidity 0.8.20.

| Contract | Role |
|----------|------|
| `TreasuryManager.sol` | Canonical distribution controller (immutable charter logic) |
| `SolidarityToken.sol` | SLDRT utility token (deployed to Sepolia) |
| `GovernanceModule.sol` | On-chain voting and proposal lifecycle |
| `StabilityMetrics.sol` | φ-ratio health monitoring |

All constructor arguments use environment-variable-driven addresses — no hardcoded keys.

---

## Governance Document

[SOLIDARITY_CHARTER.md](./SOLIDARITY_CHARTER.md) is the immovable governing document.

Its SHA-256 fingerprint is recorded in `.github/workflows/charter-guard.yml`. Any modification to the charter file that changes its hash will fail CI. The charter may only be updated by producing a new signed version, updating the fingerprint in the guard, and committing with GPG-signed commits from an authorized key.

---

## Distribution Structure

Per SOLIDARITY_CHARTER.md. All percentages are basis-point-denominated in `TreasuryManager.sol`.

| Slot | Recipient | Allocation |
|------|-----------|------------|
| 1 | Scott Charles Olson (Charly) | 1% |
| 2 | Hank — Charles H. Dykes | 1% |
| 3 | Named slot 3 | 1% |
| 4 | Named slot 4 | 1% |
| 5 | Named slot 5 | 1% |
| 6 | Named slot 6 | 1% |
| 7 | Named slot 7 | 1% |
| 8 | Named slot 8 | 1% |
| 9 | Named slot 9 | 1% |
| 10 | Named slot 10 | 1% |
| 11 | Named slot 11 | 1% |
| 12 | Named slot 12 | 1% |
| 13 | Named slot 13 | 1% |
| 14 | Named slot 14 | 1% |
| 15 | Named slot 15 | 1% |
| — | Infrastructure Reserve | Set once (max 10%) |
| — | Class Equity & Rebuild Fund | Remainder (majority) |

The Class Equity & Rebuild Fund receives the substantial remainder after all named slots and the infrastructure reserve are satisfied. This is the primary equity-building mechanism of the platform.

---

## Quick Start

**Prerequisites:** Node.js 18+, Python 3.10+, Ollama, Hardhat

```bash
# Clone and install
git clone https://github.com/CharlyOlson/Solidarity.git
cd Solidarity
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your values

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local blockchain
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Start API server
npm run server

# Start frontend (in separate terminal)
cd frontend && npm install && npm start
```

---

## Live Deployment

**Frontend + API:** [solidarity-clean-production.up.railway.app](https://solidarity-clean-production.up.railway.app)  
**Network:** Sepolia testnet (chain 11155111)

| Contract | Address |
|----------|---------|
| TreasuryManager | `0x362DC26b4b084778DB9525DF5A1d4A344C9E0C64` |
| SolidarityToken (SLDRT) | `0xe12A8C0386429Eb6Db0101c358A8cc4b10e09d86` |

SLDRT: 1,000,000 supply, coherence score 0.6180, 17 treasury slots assigned, 500 BP infrastructure reserve.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions, environment variable reference, and testnet/mainnet checklist.

---

## CI/CD

All workflows are in `.github/workflows/`.

| Workflow | Purpose |
|----------|---------|
| `charter-guard.yml` | Blocks any commit that modifies SOLIDARITY_CHARTER.md without an updated fingerprint |
| `drift-detect.yml` | Rejects inflated or misleading language in documentation commits |
| `secret-scan.yml` | Prevents accidental commit of private keys or API secrets |
| `signed-commits.yml` | Requires GPG-signed commits for charter-adjacent files |

---

## Contact

**Scott Charles Olson (Charly)**  
Kansas, USA 66210  
Owner & Primary Developer

**Charles H. Dykes (Hank)**  
Founding Partner

---

## License

Proprietary. All rights reserved. See LICENSE file for terms.  
"Solidarity" is a trademark of Scott Charles Olson, Kansas USA 66210.  
Unauthorized reproduction, distribution, or derivative use is prohibited without written permission.
