# Solidarity Smart Contracts

This directory contains Solidity smart contracts for the Solidarity Platform's twelve-node self-correcting system.

## Overview

These contracts implement the Henry 7 Step 14 Shoe Waltz framework (7→14→49 progression) with alpha, beta, and omega lock mechanisms for secure state management.

## Contracts

### Node 2: CommunityIntegration.sol
Manages educational partners and integration points.

**Features:**
- Partner registration and management
- Integration endpoint configuration
- Alpha/Beta/Omega lock states
- Event-driven architecture

**Usage:**
```solidity
// Register a partner (requires ALPHA state)
uint256 partnerId = registerPartner(
    partnerAddress,
    "University Name",
    "education"
);

// Add integration point (requires BETA state)
addIntegrationPoint(partnerId, "https://api.example.com", 100);
```

### Node 3: InstitutionalOnboarding.sol
Handles onboarding and management of institutions.

**Features:**
- Institution registration
- 7-step onboarding process (aligned with framework)
- Progress tracking
- Completion verification
- Lock state management

**Usage:**
```solidity
// Register institution (ALPHA state)
uint256 instId = registerInstitution(
    institutionAddress,
    "Institution Name",
    "university"
);

// Complete onboarding steps (BETA state)
completeOnboardingStep(instId, stepIndex);

// Check progress
(uint256 completed, uint256 total, uint256 percentage) = 
    getOnboardingProgress(instId);
```

### Node 4: RevenueAllocationExample.sol
Manages revenue allocation to charity, payroll, and reserves.

**Features:**
- Revenue bucket creation
- Automatic percentage-based allocation
- Henry 7 Step framework alignment
- Lock-protected operations
- Real-time distribution

**Usage:**
```solidity
// Create allocation buckets (ALPHA state)
createBucket("Charity", 30, charityAddress);
createBucket("Payroll", 50, payrollAddress);
createBucket("Reserves", 20, reserveAddress);

// Allocate revenue (BETA state)
allocateRevenue{value: 1 ether}(1 ether);

// Get statistics
(uint256 total, uint256 allocated, uint256 count, uint256 ratio) = 
    getAllocationStats();
```

### Node 5: StabilityMetrics.sol
Implements stability scoring with Pythagorean error correction.

**Features:**
- Harmonic and stability score tracking
- Pythagorean triple verification (7²+24²=25²)
- Automatic error correction
- Historical snapshots
- System health monitoring

**Usage:**
```solidity
// Record metrics (BETA state)
uint256 snapshotId = recordMetric(harmonicScore, stabilityScore);

// Get current metrics
(uint256 harmonic, uint256 stability, uint256 count, bool stable) = 
    getCurrentMetrics();

// Verify Pythagorean triple
bool valid = verifyPythagoreanTriple(); // Returns true for 7²+24²=25²
```

## Lock State System

All contracts implement a three-state lock mechanism:

- **ALPHA**: Initial state for setup and configuration
- **BETA**: Operational state for normal operations
- **OMEGA**: Final state for deactivation and cleanup

Only the contract owner can change lock states, ensuring controlled state transitions.

## Mathematical Framework

All contracts are aligned with the Henry 7 Step 14 Shoe Waltz framework:

- **Base (7)**: Foundation value
- **Double (14)**: Scaled checkpoint
- **Square (49)**: Completion threshold
- **Control Ratio (3.5)**: 49÷14 = 3.5
- **Pythagorean Triple**: 7²+24²=25² (49+576=625)

## Development

### Compilation

```bash
# Using Hardhat
npx hardhat compile

# Using Truffle
truffle compile

# Using Foundry
forge build
```

### Testing

```bash
# Hardhat
npx hardhat test

# Truffle
truffle test

# Foundry
forge test
```

### Deployment

```bash
# Local network
npx hardhat run scripts/deploy.js --network localhost

# Testnet (e.g., Sepolia)
npx hardhat run scripts/deploy.js --network sepolia

# Mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

## Security Considerations

1. **Owner-only operations**: Critical functions restricted to contract owner
2. **Lock state validation**: Operations protected by appropriate lock state
3. **Input validation**: All inputs validated before processing
4. **Event emission**: All state changes emit events for transparency
5. **Reentrancy protection**: Consider adding ReentrancyGuard for value transfers

## Integration

These contracts are designed to work together as part of the twelve-node self-correcting system. Each node complements the others to maintain harmonic alignment and system stability.

## License

MIT License - See LICENSE file

## Authors

- Scott Charles Olson ("Charly") - Architect
- Charles H. Dykes ("Hank") - Framework Designer

---

© 2025 Scott Charles Olson. All rights reserved.  
TRADEMARKED BY SCOTT CHARLES OLSON
