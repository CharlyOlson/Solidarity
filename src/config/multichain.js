/**
 * Solidarity Platform - Multi-Chain Token Configuration
 * Created by Scott Charles Olson (Charly)
 * 
 * Comprehensive token deployment strategy across multiple networks
 */

const NETWORKS = {
  // TIER 1: Maximum Security
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    security: 5,
    gasMultiplier: 100,
    recommended: 'Main treasury, governance, high-value operations',
    allocation: 70 // 70% of total treasury
  },
  
  // TIER 2: High Performance  
  zkSync: {
    name: 'zkSync Era',
    chainId: 324,
    security: 4,
    gasMultiplier: 1,
    recommended: 'Daily operations, user transactions',
    allocation: 10 // 10% of operational funds
  },
  
  polygon: {
    name: 'Polygon',
    chainId: 137,
    security: 3,
    gasMultiplier: 0.1,
    recommended: 'Community rewards, micro-transactions',
    allocation: 2 // 2% of operational funds
  },
  
  // TIER 3: Specialized
  bsc: {
    name: 'BSC',
    chainId: 56,
    security: 3,
    gasMultiplier: 0.5,
    recommended: 'DeFi integrations, trading',
    allocation: 2 // 2% of operational funds
  },
  
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    security: 4,
    gasMultiplier: 2,
    recommended: 'DeFi protocols, advanced features',
    allocation: 1 // 1% of operational funds
  }
};

const COIL_TOKENS = {
  soul: {
    name: 'Soul',
    symbol: 'SOUL',
    decimals: 18,
    totalSupply: '1000000000', // 1 billion
    primaryChain: 'ethereum',
    secondaryChain: 'zkSync',
    purpose: 'Main platform token',
    distribution: {
      treasury: 40,
      community: 25,
      team: 20,
      public: 15
    }
  },
  
  spirit: {
    name: 'Spirit',
    symbol: 'SPRT',
    decimals: 12,
    totalSupply: '100000000', // 100 million
    primaryChain: 'zkSync',
    secondaryChain: 'polygon',
    purpose: 'Governance token',
    conversionRate: 1000, // 1 SOUL = 1000 SPRT
    distribution: {
      staking: 50,
      governance: 30,
      rewards: 20
    }
  },
  
  essence: {
    name: 'Essence',
    symbol: 'ESS',
    decimals: 8,
    totalSupply: '1000000000000', // 1 trillion
    primaryChain: 'polygon',
    secondaryChain: 'zkSync',
    purpose: 'Utility token for fees',
    conversionRate: 1000, // 1 SPRT = 1000 ESS
    distribution: {
      operations: 60,
      rewards: 25,
      reserve: 15
    }
  },
  
  spark: {
    name: 'Spark',
    symbol: 'SPK',
    decimals: 4,
    totalSupply: '1000000000000000', // 1 quadrillion
    primaryChain: 'polygon',
    purpose: 'Micro-rewards token',
    conversionRate: 1000, // 1 ESS = 1000 SPK
    distribution: {
      rewards: 70,
      gamification: 20,
      community: 10
    }
  }
};

const TREASURY_ALLOCATION = {
  communityPool: {
    percentage: 5,
    networks: {
      zkSync: 80,
      polygon: 20
    }
  },
  
  payrollTreasury: {
    percentage: 10,
    networks: {
      zkSync: 70,
      ethereum: 30
    }
  },
  
  operationalReserve: {
    percentage: 85,
    networks: {
      ethereum: 70,
      bitcoin: 15, // WBTC
      zkSync: 10,
      polygon: 2,
      bsc: 2,
      arbitrum: 1
    }
  }
};

const RECOMMENDED_WALLETS = {
  hotWallets: {
    maxAllocation: 5, // 5% of total treasury
    networks: ['zkSync', 'polygon'],
    purpose: 'Daily operations'
  },
  
  coldWallets: {
    minAllocation: 90, // 90% of total treasury
    networks: ['ethereum', 'bitcoin'],
    purpose: 'Long-term storage'
  },
  
  multisigWallets: {
    ethereum: {
      signers: 5,
      threshold: 3,
      purpose: 'Governance decisions'
    },
    zkSync: {
      signers: 3,
      threshold: 2,
      purpose: 'Operations'
    }
  }
};

const SECURITY_MATRIX = {
  // Ranked by security level (1-5, 5 being highest)
  ethereum: {
    security: 5,
    decentralization: 5,
    battletested: 5,
    recommendation: 'Main treasury, critical operations'
  },
  
  bitcoin: {
    security: 5,
    decentralization: 5,
    battletested: 5,
    recommendation: 'Store of value, strategic reserve'
  },
  
  zkSync: {
    security: 4,
    decentralization: 4,
    battletested: 3,
    recommendation: 'Daily operations, cost-effective transactions'
  },
  
  arbitrum: {
    security: 4,
    decentralization: 4,
    battletested: 4,
    recommendation: 'DeFi protocols, advanced features'
  },
  
  polygon: {
    security: 3,
    decentralization: 3,
    battletested: 4,
    recommendation: 'Community features, micro-transactions'
  },
  
  bsc: {
    security: 3,
    decentralization: 2,
    battletested: 4,
    recommendation: 'DeFi integrations only'
  }
};

module.exports = {
  NETWORKS,
  COIL_TOKENS,
  TREASURY_ALLOCATION,
  RECOMMENDED_WALLETS,
  SECURITY_MATRIX
};
