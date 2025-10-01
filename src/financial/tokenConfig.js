/**
 * Solidarity Platform - Multi-Chain Token Configuration
 * 
 * Comprehensive deployment and treasury strategy for Solidarity's SOUL, SPRT, ESS, 
 * and SPK tokens across multiple networks, balancing security, performance, 
 * and operational needs.
 */

/**
 * Network configuration with security ratings, gas multipliers,
 * recommended uses, and treasury allocations
 */
const NETWORK_TIERS = {
  ethereum: {
    chainId: 1,
    securityRating: 5,
    gasMultiplier: 100,
    recommendedUse: 'Main treasury, governance, high-value ops',
    treasuryAllocation: 0.70, // 70%
    rpcEndpoint: process.env.ETHEREUM_RPC || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
  },
  zkSync: {
    chainId: 324,
    securityRating: 4,
    gasMultiplier: 1,
    recommendedUse: 'Daily operations, user txs',
    treasuryAllocation: 0.10, // 10%
    rpcEndpoint: process.env.ZKSYNC_RPC || 'https://mainnet.era.zksync.io'
  },
  polygon: {
    chainId: 137,
    securityRating: 3,
    gasMultiplier: 0.1,
    recommendedUse: 'Community rewards, micro-txs',
    treasuryAllocation: 0.02, // 2%
    rpcEndpoint: process.env.POLYGON_RPC || 'https://polygon-rpc.com'
  },
  bsc: {
    chainId: 56,
    securityRating: 3,
    gasMultiplier: 0.5,
    recommendedUse: 'DeFi integrations, trading',
    treasuryAllocation: 0.02, // 2%
    rpcEndpoint: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org'
  },
  arbitrum: {
    chainId: 42161,
    securityRating: 4,
    gasMultiplier: 2,
    recommendedUse: 'DeFi protocols, advanced features',
    treasuryAllocation: 0.01, // 1%
    rpcEndpoint: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc'
  }
};

/**
 * Token definitions with supply, decimals, chains, and distribution
 */
const TOKEN_DEFINITIONS = {
  SOUL: {
    symbol: 'SOUL',
    name: 'Solidarity Soul Token',
    decimals: 18,
    totalSupply: 1_000_000_000,
    primaryChain: 'ethereum',
    secondaryChain: 'zkSync',
    purpose: 'Main platform token',
    distribution: {
      treasury: 0.40, // 40%
      community: 0.25, // 25%
      team: 0.20, // 20%
      public: 0.15 // 15%
    },
    contracts: {
      ethereum: process.env.SOUL_ETHEREUM_CONTRACT,
      zkSync: process.env.SOUL_ZKSYNC_CONTRACT
    }
  },
  SPRT: {
    symbol: 'SPRT',
    name: 'Solidarity Spirit Token',
    decimals: 12,
    totalSupply: 100_000_000,
    primaryChain: 'zkSync',
    secondaryChain: 'polygon',
    purpose: 'Governance token',
    distribution: {
      staking: 0.50, // 50%
      governance: 0.30, // 30%
      rewards: 0.20 // 20%
    },
    contracts: {
      zkSync: process.env.SPRT_ZKSYNC_CONTRACT,
      polygon: process.env.SPRT_POLYGON_CONTRACT
    },
    exchangeRate: {
      SOUL: 1000 // 1 SOUL = 1000 SPRT
    }
  },
  ESS: {
    symbol: 'ESS',
    name: 'Solidarity Essence Token',
    decimals: 8,
    totalSupply: 1_000_000_000_000,
    primaryChain: 'polygon',
    secondaryChain: 'zkSync',
    purpose: 'Utility token (fees)',
    distribution: {
      operations: 0.60, // 60%
      rewards: 0.25, // 25%
      reserve: 0.15 // 15%
    },
    contracts: {
      polygon: process.env.ESS_POLYGON_CONTRACT,
      zkSync: process.env.ESS_ZKSYNC_CONTRACT
    },
    exchangeRate: {
      SPRT: 1000 // 1 SPRT = 1000 ESS
    }
  },
  SPK: {
    symbol: 'SPK',
    name: 'Solidarity Spark Token',
    decimals: 4,
    totalSupply: 1_000_000_000_000_000,
    primaryChain: 'polygon',
    secondaryChain: null,
    purpose: 'Micro-rewards token',
    distribution: {
      rewards: 0.70, // 70%
      gamification: 0.20, // 20%
      community: 0.10 // 10%
    },
    contracts: {
      polygon: process.env.SPK_POLYGON_CONTRACT
    },
    exchangeRate: {
      ESS: 1000 // 1 ESS = 1000 SPK
    }
  }
};

/**
 * Treasury allocation by purpose
 */
const TREASURY_ALLOCATION = {
  communityPool: {
    percentage: 0.05, // 5%
    networkBreakdown: {
      zkSync: 0.80, // 80%
      polygon: 0.20 // 20%
    }
  },
  payrollTreasury: {
    percentage: 0.10, // 10%
    networkBreakdown: {
      zkSync: 0.70, // 70%
      ethereum: 0.30 // 30%
    }
  },
  operationalReserve: {
    percentage: 0.85, // 85%
    networkBreakdown: {
      ethereum: 0.70, // 70%
      wbtc: 0.15, // 15%
      zkSync: 0.10, // 10%
      polygon: 0.02, // 2%
      bsc: 0.02, // 2%
      arbitrum: 0.01 // 1%
    }
  }
};

/**
 * Wallet recommendations for token management
 */
const WALLET_RECOMMENDATIONS = {
  hot: {
    treasuryAllocation: 0.05, // 5%
    networks: ['zkSync', 'polygon'],
    purpose: 'Daily operations'
  },
  cold: {
    treasuryAllocation: 0.90, // 90%
    networks: ['ethereum', 'bitcoin'],
    purpose: 'Long-term storage'
  },
  multisig: {
    ethereum: {
      signers: 5,
      threshold: 3,
      purpose: 'Governance & high-value operations'
    },
    zkSync: {
      signers: 3,
      threshold: 2,
      purpose: 'Operations'
    }
  }
};

/**
 * Security matrix for supported networks
 */
const SECURITY_MATRIX = {
  ethereum: {
    security: 5,
    decentralization: 5,
    battleTested: 5,
    recommendation: 'Main treasury, critical operations'
  },
  bitcoin: {
    security: 5,
    decentralization: 5,
    battleTested: 5,
    recommendation: 'Store of value, strategic reserve'
  },
  zkSync: {
    security: 4,
    decentralization: 4,
    battleTested: 3,
    recommendation: 'Daily operations, cost-effective txs'
  },
  arbitrum: {
    security: 4,
    decentralization: 4,
    battleTested: 4,
    recommendation: 'DeFi protocols, advanced features'
  },
  polygon: {
    security: 3,
    decentralization: 3,
    battleTested: 4,
    recommendation: 'Community features, micro-transactions'
  },
  bsc: {
    security: 3,
    decentralization: 2,
    battleTested: 4,
    recommendation: 'DeFi integrations only'
  }
};

/**
 * Token Manager Class
 * Handles token operations across multiple chains
 */
class MultiChainTokenManager {
  constructor() {
    this.networks = NETWORK_TIERS;
    this.tokens = TOKEN_DEFINITIONS;
    this.treasury = TREASURY_ALLOCATION;
    this.wallets = WALLET_RECOMMENDATIONS;
    this.security = SECURITY_MATRIX;
  }

  /**
   * Get token information
   * @param {string} symbol - Token symbol (e.g., 'SOUL')
   * @returns {Object|null} - Token definition or null if not found
   */
  getTokenInfo(symbol) {
    return this.tokens[symbol.toUpperCase()] || null;
  }

  /**
   * Get network information
   * @param {string} networkName - Network name (e.g., 'ethereum')
   * @returns {Object|null} - Network information or null if not found
   */
  getNetworkInfo(networkName) {
    return this.networks[networkName.toLowerCase()] || null;
  }

  /**
   * Calculate token distribution
   * @param {string} symbol - Token symbol
   * @returns {Object} - Token distribution by wallet type and purpose
   */
  calculateTokenDistribution(symbol) {
    const token = this.getTokenInfo(symbol);
    
    if (!token) {
      throw new Error(`Token ${symbol} not found`);
    }
    
    const distribution = {};
    
    for (const [purpose, percentage] of Object.entries(token.distribution)) {
      distribution[purpose] = token.totalSupply * percentage;
    }
    
    return distribution;
  }

  /**
   * Calculate optimal treasury allocation
   * @returns {Object} - Treasury allocation by network and purpose
   */
  calculateTreasuryAllocation() {
    const allocation = {};
    
    for (const [purpose, data] of Object.entries(this.treasury)) {
      allocation[purpose] = {};
      const totalAmount = data.percentage; // This would be multiplied by actual treasury value
      
      for (const [network, percentage] of Object.entries(data.networkBreakdown)) {
        allocation[purpose][network] = totalAmount * percentage;
      }
    }
    
    return allocation;
  }

  /**
   * Get security rating for a specific operation
   * @param {string} operation - Operation type (e.g., 'staking', 'governance')
   * @returns {Object} - Recommended networks for the operation with security ratings
   */
  getSecurityRecommendation(operation) {
    const recommendations = {};
    
    switch (operation.toLowerCase()) {
      case 'treasury':
      case 'governance':
        recommendations.primary = 'ethereum';
        recommendations.secondary = 'arbitrum';
        break;
      
      case 'daily-operations':
      case 'user-transactions':
        recommendations.primary = 'zkSync';
        recommendations.secondary = 'arbitrum';
        break;
      
      case 'rewards':
      case 'micro-transactions':
        recommendations.primary = 'polygon';
        recommendations.secondary = 'zkSync';
        break;
      
      case 'defi':
      case 'trading':
        recommendations.primary = 'arbitrum';
        recommendations.secondary = 'bsc';
        break;
      
      case 'long-term-storage':
        recommendations.primary = 'bitcoin';
        recommendations.secondary = 'ethereum';
        break;
      
      default:
        recommendations.primary = 'ethereum';
        recommendations.secondary = 'zkSync';
    }
    
    // Add security ratings
    if (recommendations.primary) {
      recommendations.primarySecurity = this.security[recommendations.primary]?.security || 3;
    }
    
    if (recommendations.secondary) {
      recommendations.secondarySecurity = this.security[recommendations.secondary]?.security || 3;
    }
    
    return recommendations;
  }

  /**
   * Calculate gas costs for an operation across different networks
   * @param {number} baseGas - Base gas cost in Ethereum
   * @returns {Object} - Gas costs by network
   */
  calculateGasCosts(baseGas) {
    const gasCosts = {};
    
    for (const [network, data] of Object.entries(this.networks)) {
      gasCosts[network] = baseGas * data.gasMultiplier;
    }
    
    return gasCosts;
  }

  /**
   * Get summary of token ecosystem
   * @returns {Object} - Summary of token ecosystem
   */
  getEcosystemSummary() {
    const summary = {
      tokens: Object.keys(this.tokens).length,
      networks: Object.keys(this.networks).length,
      primaryNetwork: 'ethereum',
      operationalNetwork: 'zkSync',
      microTransactionsNetwork: 'polygon',
      totalSupply: {}
    };
    
    // Calculate total supply in USD (if conversion rates were available)
    for (const [symbol, token] of Object.entries(this.tokens)) {
      summary.totalSupply[symbol] = token.totalSupply;
    }
    
    return summary;
  }
}

// Create and export token manager instance
const tokenManager = new MultiChainTokenManager();

module.exports = {
  tokenManager,
  NETWORK_TIERS,
  TOKEN_DEFINITIONS,
  TREASURY_ALLOCATION,
  WALLET_RECOMMENDATIONS,
  SECURITY_MATRIX
};