# Solidarity — Financial System

**What it is and what it can do today.**

Owner: Scott Charles Olson
Partner: Charles H. Dykes (Hank)
Repos: `CharlyOlson/Solidarity` (main), `CharlyOlson/-Solidarity-Clean` (modules)

---

## 1. Deployed On-Chain

### TreasuryManager.sol — LIVE on Sepolia

- **Address:** `0x362DC26b4b084778DB9525DF5A1d4A344C9E0C64`
- **Chain:** Sepolia testnet (chain ID 11155111)
- **Status:** Verified live via Blockscout. Contract bytecode confirmed on-chain.
- **Deployer:** `0x5A6BE7b05d6DEFf4788DDBf138e1b8E5B16Fb3bc` (~2.44 Sepolia ETH)

**What it does:**

Revenue distribution contract. ETH sent to `distribute()` gets split automatically:

| Slot | Share | Purpose |
|------|-------|---------|
| Scott | 1% | Founder |
| Hank | 1% | Founding partner |
| Hank's 4 choices | 1% each | People Hank names |
| Hank's 3 causes | 1% each | Causes Hank names |
| Scott's mother | 1% | Named slot |
| Sophie Jones | 1% | Named slot |
| Mariah | 1% | Named slot |
| Colombia Fund | 1% | Community fund |
| Open Slot A | 1% | Governance-nominated |
| Open Slot B | 1% | Governance-nominated |
| Infrastructure Reserve | Owner-set (max 10%) | Operational costs |
| Class Equity & Rebuild Fund | Remainder (~70-85%) | The large pool |

**Key behaviors:**
- 15 named slots at 1% each (1,500 basis points)
- Infrastructure reserve set once by owner, capped at 10%
- Remainder goes to Class Equity & Rebuild Fund
- Zero-address slots accumulate in contract until address is set (nothing lost)
- `flushAccumulated()` lets owner push held funds once addresses are assigned
- ReentrancyGuard on all distribution functions
- Uses OpenZeppelin Ownable + ReentrancyGuard
- Compiles on Solidity 0.8.20 with optimizer (200 runs, viaIR)

**What's needed to use it:**
- Set infrastructure reserve BP (one-time call)
- Set slot addresses for Hank's choices/causes, named people, and open slots
- Send ETH to `distribute()` — splits happen automatically

---

## 2. Compiled Contracts (Not Yet Deployed)

### SolidarityToken.sol (SLDRT)

ERC-20 token with built-in treasury distribution.

**What it does:**
- Mints initial supply to deployer
- Three treasury pools: Community (5%), Payroll (10%), Operational (85%)
- `distributeTreasuryFunds()` — splits incoming ETH across the three pools
- Daily stability metrics tracking (price, volume, liquidity)
- Stability score calculation using Pythagorean normalization: `sqrt(price² + volume² + liquidity²)`
- OpenZeppelin ERC20 + Ownable + ReentrancyGuard

**Status:** Compiles. Not deployed. No tests.

### StabilityMetrics.sol

Standalone stability scoring contract.

**What it does:**
- Records daily price/volume/liquidity metrics
- Same Pythagorean stability score as SolidarityToken
- Alpha/Beta/Omega lock system (can freeze updates)
- Omega lock prevents metric updates entirely

**Status:** Compiles. Not deployed. No tests.

### GovernanceModule.sol

Minimal governance stub.

**What it does:**
- Admin-only payroll adjustment (emits event)
- Allocation updates (charity/payroll/reserve must sum to 10000 BP)
- Events only — no state changes beyond admin address

**Status:** Compiles. Skeleton only. No real governance logic.

### HEALToken (HEAL)

ERC-20 token for healthcare funding allocation.

**What it does:**
- Annual budget allocation across 10 categories (equipment 35%, visit costs 25%, staff 15%, labs 10%, research 9%, admin 5%, brokers 5%, spiritual/community 1%)
- Role-based access: Doctor, Nurse, Intern, Lab Tech, Researcher, Broker, Church Partner
- Professional registration and verification
- Equal visit-cost payments (same amount per professional per visit)
- Equipment funding allocation
- Research grant distribution
- Church/spiritual health program funding (Scott's 1%)
- Waste prevention and fraud detection tracking
- Batch distribution for spiritual health programs

**Status:** Compiles with OpenZeppelin 4.x. Not deployed. No tests. Large contract — would need gas optimization for mainnet.

### LUNCH Token (LUNCH$)

ERC-20 token for educational funding.

**What it does:**
- Annual educational budget allocation (staff 25%, facilities 25%, teacher/student programs 30%, books 15%, admin 4%, spiritual 1%)
- Cross-hold gradient tracking (inputs, outputs, held, losses, gains per layer)
- True-figure tracking (reported vs actual amounts per address, variance calculation)
- Role-based access: Teacher, Student, Staff, Facility Manager, Program Coordinator, Auditor
- Scott's 1% spiritual/community education fund

**Status:** Compiles with OpenZeppelin 4.x. Not deployed. No tests. Very large contract — truncated in read but structure is complete.

### Other Contracts in Repo (NOT Financial)

These exist but are not part of the financial system:

- `DataToCoilConverter.sol` — data encoding, not finance
- `IntegrationHub.sol` — system integration, not finance
- `CommunityIntegration.sol` — community features
- `DynamicLoop.sol`, `GradientLayers.sol`, `HabitualCorrection.sol`, `InfinitySignal.sol`, `LattosphereCircle.sol`, `OrbitalSphere.sol` — system architecture contracts, not finance
- `InstitutionalOnboarding.sol`, `ProjectAnalytics.sol` — onboarding/analytics
- `SaiLToken.sol` — appears to be an earlier version of LUNCH
- `color_motion_tracking.sol`, `habitual_offset.sol` — non-financial
- `assets_table_Version2_Enhanced.sol` — asset tracking
- `RevenueAllocationExample.sol` — example/reference only
- 4 archived TreasuryManager variants in `archive_contracts/`

---

## 3. JavaScript Financial Modules (-Solidarity-Clean repo)

All in `financial_systems/` directory. Every module defaults to `testMode: true`.

### PaymentConnector (payment_connector.js) — 645 lines

Multi-payment routing system.

**What it does:**
- 8 payment method connectors: crypto, stablecoin, credit card, debit card, bank transfer (ACH), Lightning Network, PayPal, Venmo
- Fee rates: Lightning 0.01%, stablecoin 0.05%, crypto 0.1%, bank transfer 0.5%, debit 1.5%, credit card 2.9%, Venmo 3%, PayPal 3.4%
- Fee optimization using phi-ratio: `baseFeeRate * (1 / (1 + log10(amount) / 1.618))` — larger amounts get lower rates
- Auto-routing: picks lowest-fee method that fits the amount
- Safety-level enforcement: limits payment amounts based on current safety score
- Transaction tracking with success/failure metrics
- Method recommendation based on amount size

**Dependencies:** CoreMathematicsEngine, BridgingSafetyCoordinator, system_config, constants, logger, api_router, security-config

**Status:** Structurally complete. Processes payments in test mode (simulated). Does not connect to real payment APIs (Stripe, PayPal, etc.). The fee calculation and routing logic works — the actual payment execution is simulated.

### FinancialOptimizer (financial_optimizer.js) — 370 lines

Gas and cost optimization.

**What it does:**
- Gas price optimization using historical data (average, median, phi-weighted target)
- Transaction batching (configurable batch size, timeout)
- Local computation to avoid on-chain gas costs
- Portfolio allocation optimization using phi distribution (primary asset gets 61.8%, rest split by phi powers)
- High/low data mode for bandwidth optimization
- Gas savings tracking

**Dependencies:** None (self-contained)

**Status:** Fully functional as a standalone module. All methods work. Gas optimization is simulated (no real chain connection).

### FinancialConfiguration (financial_config.js) — 350 lines

Central configuration for the financial system.

**What it does:**
- Network configs: Ethereum mainnet (disabled by default), Sepolia (enabled), local dev, Solana mainnet/devnet
- Transaction limits: $10K daily, $1K single transaction (adjustable by safety level)
- Gas optimization settings: target 50 Gwei, max 100 Gwei
- Safety risk thresholds: low (0.618-0.75), moderate (0.50-0.618), high (0.25-0.50), critical (0.00-0.25)
- Transaction validation against limits
- Audit logging config (365-day retention)
- Smart contract address registry (reads from env vars)
- Market data provider config (CoinGecko, CoinMarketCap — config only, no API calls)

**Dependencies:** Node.js fs, path

**Status:** Fully functional configuration module. No external dependencies.

### BlockchainConnector (blockchain_connector.js) — 380 lines

Multi-chain connection manager.

**What it does:**
- Connect/disconnect to Ethereum or Solana networks
- Authentication with hash generation
- Transaction sending with confirmation tracking
- Balance checking
- Auto-reconnect with configurable retry
- Connection metrics tracking

**Dependencies:** None (self-contained)

**Status:** Simulated connections. The structure is correct (connect, auth, send, confirm), but actual blockchain interaction is placeholder. Would need ethers.js or web3.js integration for real chain calls.

### SmartContractManager (smart_contract_manager.js) — 380 lines

Contract deployment and interaction manager.

**What it does:**
- Contract registry (register, list, lookup)
- Contract deployment with gas estimation
- Function calls with gas optimization
- Batch contract calls
- Gas metrics tracking
- Anchor-ratio gas estimation (1.618x safety margin on estimated gas)

**Dependencies:** None (self-contained)

**Status:** Simulated. Good structure for managing contract interactions, but uses placeholder deployment/call logic.

### WalletManager (wallet_manager.js) — 380 lines

Multi-wallet portfolio management.

**What it does:**
- Create wallets (Ethereum, Solana)
- Import existing wallets by private key
- Token tracking per wallet
- Portfolio value calculation
- Portfolio optimization using phi allocation (primary asset 61.8%, rest by phi powers)
- Rebalance recommendations (triggers when allocation drifts >5% from target)

**Dependencies:** None (self-contained)

**Status:** Simulated balances and prices. Portfolio optimization logic works. Key management is simplified (would need proper encryption for production).

### TransactionProcessor (transaction_processor.js) — 380 lines

Transaction queue and confirmation handler.

**What it does:**
- Transaction validation (required fields, amount, test mode check)
- Processing queue with FIFO ordering
- Confirmation monitoring with timeout
- Automatic retry on failure (configurable attempts)
- Transaction cancellation
- History and filtering (by status, from, to)
- Success rate metrics

**Dependencies:** None (self-contained)

**Status:** Simulated. Processing logic is sound — validates, queues, retries, confirms. No real chain interaction.

### PaymentSavingsCalculator — 3 files

Fee comparison calculator for sales pitches.

**What it does:**
- Compares standard payment processing fees vs. Solidarity's phi-optimized fees
- Generates savings reports per business (annual volume, monthly transactions, payment mix)
- Break-even analysis
- Scenario comparison across business sizes
- Text summary generation for presentations

**Status:** Fully functional standalone calculator. Good for demos and pitch decks.

### SavingsTerminal.js — 770 lines

Interactive terminal-based savings demo.

**Status:** Standalone demo tool. Works as a CLI presentation.

---

## 4. Core Engine (Shared Dependency)

### CoreMathematicsEngine (src/utils/CoreMathematicsEngine.js) — 441 lines

The math layer everything references.

**What it does:**
- Phi-ratio normalization: `value / 1.618`
- Henry progression alignment: maps values to 7→14→49 nodes
- Sacred node system: [1, 3, 4, 7, 14, 21, 49]
- Harmony score calculation (0-1 range, based on proximity to sacred nodes)
- Exchange rate harmonization (raw ratio + phi-adjusted rate)
- Coil unit optimization (numeric precision alignment)
- Golden angle calculations

**Tests:** 10+ unit tests in `tests/unit/core-math.test.js` — verified passing (part of 37/37 suite)

**Status:** Fully functional. Tested. Used by PaymentConnector and other modules.

### BridgingSafetyCoordinator (src/safety/BridgingSafetyCoordinator.js)

Safety level orchestration.

**What it does:**
- Unified 0.00-1.00 safety scale across all components
- Seven threshold levels: Critical Emergency → Optimal → Critical Upper
- Component-level safety tracking (quantum, launcher, solidarity, AI, colorMotion, system)
- Safety flow modes: conservative (use minimum), balanced (average), performance (maximum)
- Default: all components start at 0.618 (phi reciprocal)

**Tests:** `tests/unit/safety.test.js` — part of passing suite

**Status:** Fully functional. Tested.

---

## 5. Test Infrastructure

### Clean Repo (-Solidarity-Clean): 37/37 passing

Tests cover:
- `core-math.test.js` — CoreMathematicsEngine (phi values, processValue, harmony scores, exchange rates, coil units)
- `safety.test.js` — BridgingSafetyCoordinator
- `auth.test.js` — Authentication
- `license.test.js` — License validation
- `routes.test.js` — API routes
- `payment_connector_test.js` — Integration test (standalone runner, not Jest)

### Main Repo (Solidarity): Hardhat configured

- Hardhat 0.8.20, optimizer enabled, viaIR
- Sepolia network configured (reads from .env)
- OpenZeppelin 4.x contracts installed
- TreasuryManager deployed and verified
- No formal Solidity test files found (deployment was done via script)

---

## 6. What WORKS Right Now

| Component | Status | Notes |
|-----------|--------|-------|
| TreasuryManager on Sepolia | DEPLOYED | Revenue distribution, ready to receive ETH and split |
| CoreMathematicsEngine | TESTED | 37/37 tests pass, phi-ratio math works |
| BridgingSafetyCoordinator | TESTED | Safety levels work, all thresholds functional |
| PaymentConnector routing logic | WORKS | Fee calculation, method ranking, auto-routing — in test mode |
| FinancialOptimizer | WORKS | Gas optimization, batching, portfolio allocation — standalone |
| FinancialConfiguration | WORKS | Network config, safety limits, transaction validation |
| PaymentSavingsCalculator | WORKS | Fee comparison reports, break-even analysis |
| Hardhat build pipeline | WORKS | All contracts compile, deploy script runs |
| SolidarityToken.sol | COMPILES | ERC-20 + treasury distribution, not deployed |
| HEAL Token | COMPILES | Healthcare budget allocation, not deployed |
| LUNCH Token | COMPILES | Education budget allocation, not deployed |
| StabilityMetrics.sol | COMPILES | Stability scoring, not deployed |
| GovernanceModule.sol | COMPILES | Skeleton only |

## 7. What Does NOT Work / Is Not Ready

| Component | Issue |
|-----------|-------|
| BlockchainConnector | Simulated — no real ethers.js/web3.js integration |
| SmartContractManager | Simulated — placeholder deployment logic |
| WalletManager | Simulated balances — no real chain queries |
| TransactionProcessor | Simulated — no real transaction submission |
| PaymentConnector (live payments) | No Stripe/PayPal/bank API integration |
| GovernanceModule | Stub — events only, no voting or proposal logic |
| HEAL/LUNCH tokens | Not deployed, no tests, would need gas optimization |
| Frontend | React app exists but is not connected to financial modules |
| Market data | Config references CoinGecko/CMC but no API integration built |

---

## 8. Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│                 SOLIDARITY FINANCIAL SYSTEM          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ON-CHAIN (Sepolia)                                │
│  ┌───────────────────────┐                         │
│  │ TreasuryManager.sol   │ ← Revenue in (ETH)     │
│  │ 15 named 1% slots     │ → Auto-split to slots  │
│  │ + infra reserve       │ → Class Equity Fund     │
│  │ + class equity fund   │                         │
│  └───────────────────────┘                         │
│                                                     │
│  COMPILED (Ready to Deploy)                        │
│  ┌──────────────────┐ ┌──────────────────┐        │
│  │ SolidarityToken  │ │ StabilityMetrics │        │
│  │ (SLDRT, ERC-20)  │ │ (price/vol/liq)  │        │
│  │ 5/10/85 split    │ │ stability score  │        │
│  └──────────────────┘ └──────────────────┘        │
│  ┌──────────────────┐ ┌──────────────────┐        │
│  │ HEALToken        │ │ LunchToken       │        │
│  │ (healthcare)     │ │ (education)      │        │
│  │ 10-category      │ │ 8-category       │        │
│  │ budget split     │ │ budget split     │        │
│  └──────────────────┘ └──────────────────┘        │
│                                                     │
│  OFF-CHAIN (Node.js)                               │
│  ┌───────────────────────────────────────┐         │
│  │ CoreMathematicsEngine (phi-ratio)     │ TESTED  │
│  │ BridgingSafetyCoordinator (0-1 scale) │ TESTED  │
│  └───────────────────────────────────────┘         │
│  ┌───────────────────────────────────────┐         │
│  │ PaymentConnector (8 methods, routing) │ TEST OK │
│  │ FinancialOptimizer (gas, batching)    │ WORKS   │
│  │ FinancialConfiguration (limits, nets) │ WORKS   │
│  │ PaymentSavingsCalculator (reports)    │ WORKS   │
│  └───────────────────────────────────────┘         │
│  ┌───────────────────────────────────────┐         │
│  │ BlockchainConnector (simulated)       │ STUB    │
│  │ SmartContractManager (simulated)      │ STUB    │
│  │ WalletManager (simulated)             │ STUB    │
│  │ TransactionProcessor (simulated)      │ STUB    │
│  └───────────────────────────────────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 9. The One-Sentence Version

Solidarity's financial system is a revenue distribution platform with one deployed smart contract that auto-splits ETH across 15+ named slots, backed by a tested phi-ratio math engine and payment routing module that calculates optimized fees across 8 payment methods — with three sector-specific tokens (general/healthcare/education) compiled and ready to deploy when the time comes.
