# Solidarity Platform — Deployment Guide

This document covers environment setup, contract deployment to Sepolia testnet, Etherscan verification, and the mainnet pre-flight checklist.

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|-------------|-----------------|-------|
| Node.js | 18.x LTS | `node --version` |
| npm | 9.x | bundled with Node 18 |
| Hardhat | via `npm install` | `npx hardhat --version` |
| Sepolia ETH | ~0.05 ETH | For gas costs |
| Etherscan API key | — | Free at etherscan.io |

**Sepolia ETH faucets:**
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia
- https://faucets.chain.link (requires Chainlink account)

---

## Environment Setup

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables for Sepolia deployment:

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

ADDR_SCOTT=0x...
ADDR_HANK=0x...
ADDR_CLASS_EQUITY_REBUILD=0x...
ADDR_INFRASTRUCTURE_RESERVE=0x...
```

> **Security:** Never commit `.env` to version control. The `.gitignore` excludes it. The `secret-scan` CI workflow will block commits containing private keys.

---

## Compile

Always compile before deploying to catch any source-level errors:

```bash
npx hardhat compile
```

Expected output: `Compiled N Solidity files successfully` with no warnings on production contracts.

---

## Test

Run the full test suite before deploying to any network:

```bash
npx hardhat test
```

All tests must pass. Pay particular attention to `TreasuryManager.test.js` — distribution logic is charter-governed and must be correct.

---

## Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

The script will:
1. Validate all `ADDR_*` environment variables.
2. Deploy `TreasuryManager` with the four constructor addresses.
3. Print the deployed contract address and transaction hash.
4. Save deployment metadata to `deployments/sepolia.json`.
5. Wait 5 block confirmations, then attempt Etherscan verification.

---

## Etherscan Verification

If automatic verification fails (e.g., network timeout), run manually:

```bash
npx hardhat verify \
  --network sepolia \
  DEPLOYED_ADDRESS \
  ADDR_SCOTT \
  ADDR_HANK \
  ADDR_CLASS_EQUITY_REBUILD \
  ADDR_INFRASTRUCTURE_RESERVE
```

Replace `DEPLOYED_ADDRESS` and the four constructor args with the actual values from `deployments/sepolia.json`.

---

## Deploy to Local Network (Development)

Start a local node in one terminal:

```bash
npx hardhat node
```

Deploy in a second terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

No Etherscan verification runs on localhost.

---

## Contract Addresses

Fill in after each successful deployment.

### Sepolia Testnet (chainId: 11155111)

| Contract | Address | Deployed |
|----------|---------|----------|
| TreasuryManager | `— to be filled —` | — |
| SolidarityToken | `— to be filled —` | — |
| SaiLToken | `— to be filled —` | — |
| DataToCoilConverter | `— to be filled —` | — |
| GovernanceModule | `— to be filled —` | — |
| StabilityMetrics | `— to be filled —` | — |

### Mainnet (chainId: 1)

| Contract | Address | Deployed |
|----------|---------|----------|
| TreasuryManager | `— not yet deployed —` | — |

---

## Testnet vs. Mainnet Checklist

Complete every item before deploying to mainnet.

### Code & Testing
- [ ] All 37+ tests pass with zero failures
- [ ] `npm audit` reports 0 high/critical vulnerabilities
- [ ] Gas usage reviewed with `REPORT_GAS=true npx hardhat test`
- [ ] Constructor addresses triple-checked against charter signatories
- [ ] `setInfrastructureReserveBP` called once post-deployment (not in constructor)

### Security
- [ ] Independent security audit completed and findings addressed
- [ ] Audit report filed in `docs/audits/`
- [ ] No hardcoded addresses, keys, or secrets in any contract
- [ ] Re-entrancy protections verified in TreasuryManager
- [ ] Owner address is a hardware wallet (Ledger/Trezor), not a hot wallet

### Deployment
- [ ] Deployer wallet funded with sufficient ETH for gas + buffer
- [ ] `MAINNET_RPC_URL` points to a reliable archive node (Infura, Alchemy, etc.)
- [ ] Deployment script dry-run on a mainnet fork: `npx hardhat node --fork $MAINNET_RPC_URL`
- [ ] `deployments/mainnet.json` committed immediately after deployment
- [ ] Etherscan verification confirmed (green checkmark on contract page)

### Charter Compliance
- [ ] `SOLIDARITY_CHARTER.md` SHA-256 fingerprint matches `charter-guard.yml`
- [ ] Distribution slots match charter exactly (15 × 1% named + infra reserve + Class Equity & Rebuild Fund)
- [ ] GPG-signed commit on deployment tag

### Post-Deployment
- [ ] Multisig or timelock configured for owner role if applicable
- [ ] Charter-linked contract addresses announced to all named slot holders
- [ ] Frontend environment updated with mainnet contract addresses

---

## Security Audit Requirement

**Do not deploy TreasuryManager to Ethereum mainnet without a completed security audit from an independent firm.**

The TreasuryManager controls distribution to 15+ named recipients and the Class Equity & Rebuild Fund. An error in its logic cannot be undone once funds flow. The audit must cover at minimum:

- Access control and role separation
- Integer arithmetic and basis-point calculations
- Re-entrancy in `distribute()` and `flushAccumulated()`
- One-time setter enforcement (`setInfrastructureReserveBP`)
- Constructor argument validation

Recommended auditors: Trail of Bits, OpenZeppelin, Halborn, Spearbit. Document the audit firm, date, and findings in `docs/audits/`.

---

## Troubleshooting

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Missing required environment variable` | `.env` not populated | Copy `.env.example`, fill all values |
| `insufficient funds` | Deployer has no Sepolia ETH | Use a faucet |
| `nonce too low` | Pending transactions in mempool | Wait or reset nonce |
| `Contract source code already verified` | Already on Etherscan | No action needed |
| `Invalid API Key` | Wrong `ETHERSCAN_API_KEY` | Re-check at etherscan.io |
| Compilation error | Solidity version mismatch | Confirm `hardhat.config.js` uses `0.8.20` |
