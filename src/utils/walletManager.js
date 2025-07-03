/**
 * Wallet Integration Utility
 * Solidarity Platform - Created by Scott Charles Olson (Charly)
 * 
 * Handles secure wallet connections and interactions
 */

const { ethers } = require('ethers');
const winston = require('winston');

class WalletManager {
  constructor(config = {}) {
    this.providers = new Map();
    this.contracts = new Map();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/wallet.log' })
      ]
    });
    
    // Initialize providers for different networks
    this.initializeProviders(config);
  }

  /**
   * Initialize blockchain providers
   */
  initializeProviders(config) {
    const networks = {
      mainnet: {
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpcUrl: process.env.ETHEREUM_RPC_URL || config.mainnetRpc
      },
      goerli: {
        name: 'Ethereum Goerli',
        chainId: 5,
        rpcUrl: process.env.GOERLI_RPC_URL || config.goerliRpc
      },
      polygon: {
        name: 'Polygon',
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com/'
      },
      bsc: {
        name: 'BSC',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed1.binance.org/'
      },
      localhost: {
        name: 'Localhost',
        chainId: 1337,
        rpcUrl: 'http://127.0.0.1:8545'
      }
    };

    for (const [network, config] of Object.entries(networks)) {
      try {
        if (config.rpcUrl && !config.rpcUrl.includes('your_')) {
          this.providers.set(network, new ethers.JsonRpcProvider(config.rpcUrl));
          this.logger.info(`Initialized provider for ${config.name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to initialize ${network} provider:`, error);
      }
    }
  }

  /**
   * Create a wallet instance from private key (for server operations only)
   */
  createServerWallet(network = 'mainnet') {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }

    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    if (!privateKey || privateKey === 'your_private_key_here') {
      throw new Error('Server private key not configured');
    }

    return new ethers.Wallet(privateKey, provider);
  }

  /**
   * Connect to Solidarity Token contract
   */
  async connectToSolidarityContract(network = 'mainnet', wallet = null) {
    const contractAddress = process.env.SOLIDARITY_CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress === '0x...') {
      throw new Error('Solidarity contract address not configured');
    }

    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }

    // Contract ABI (simplified version)
    const contractABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function updateStabilityMetrics(uint256 price, uint256 volume, uint256 liquidityDepth)",
      "function distributeTreasuryFunds() payable",
      "function getCurrentMetrics() view returns (tuple(uint256 price, uint256 volume, uint256 liquidityDepth, uint256 stabilityScore, uint256 timestamp))",
      "event MetricsUpdated(uint256 indexed day, uint256 stabilityScore)",
      "event TreasuryDistribution(uint256 communityAmount, uint256 payrollAmount, uint256 operationalAmount)"
    ];

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet || provider
    );

    this.contracts.set(`solidarity_${network}`, contract);
    return contract;
  }

  /**
   * Validate wallet address format
   */
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet balance for any ERC20 token
   */
  async getTokenBalance(walletAddress, tokenAddress, network = 'mainnet') {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }

    if (!this.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    if (tokenAddress === 'ETH' || !tokenAddress) {
      // Get ETH balance
      const balance = await provider.getBalance(walletAddress);
      return ethers.formatEther(balance);
    } else {
      // Get ERC20 token balance
      const tokenABI = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.decimals()
      ]);
      
      return ethers.formatUnits(balance, decimals);
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getTransactionHistory(walletAddress, network = 'mainnet', limit = 10) {
    if (!this.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }

    try {
      // Get latest block number
      const latestBlock = await provider.getBlockNumber();
      const transactions = [];

      // Search through recent blocks (this is a simplified approach)
      const blocksToSearch = Math.min(1000, latestBlock);
      
      for (let i = 0; i < blocksToSearch && transactions.length < limit; i++) {
        const blockNumber = latestBlock - i;
        const block = await provider.getBlock(blockNumber, true);
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if ((tx.from && tx.from.toLowerCase() === walletAddress.toLowerCase()) ||
                (tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase())) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value || 0),
                blockNumber: tx.blockNumber,
                timestamp: block.timestamp,
                gasUsed: tx.gasLimit ? tx.gasLimit.toString() : null
              });
              
              if (transactions.length >= limit) break;
            }
          }
        }
      }

      return transactions;
    } catch (error) {
      this.logger.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Monitor wallet for incoming transactions
   */
  startWalletMonitoring(walletAddress, network = 'mainnet', callback) {
    if (!this.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }

    // Listen for new blocks
    provider.on('block', async (blockNumber) => {
      try {
        const block = await provider.getBlock(blockNumber, true);
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if ((tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase()) ||
                (tx.from && tx.from.toLowerCase() === walletAddress.toLowerCase())) {
              callback({
                type: tx.to.toLowerCase() === walletAddress.toLowerCase() ? 'incoming' : 'outgoing',
                transaction: tx,
                block: block
              });
            }
          }
        }
      } catch (error) {
        this.logger.error('Error monitoring wallet:', error);
      }
    });

    this.logger.info(`Started monitoring wallet ${walletAddress} on ${network}`);
  }

  /**
   * Generate wallet connection QR code data
   */
  generateWalletConnectData(walletAddress) {
    if (!this.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    return {
      address: walletAddress,
      chainId: 1, // Ethereum mainnet
      timestamp: Date.now(),
      platform: 'Solidarity',
      version: '2.41.0'
    };
  }

  /**
   * Treasury wallet addresses for the platform
   */
  getTreasuryAddresses() {
    return {
      communityPool: process.env.COMMUNITY_POOL_ADDRESS,
      payrollTreasury: process.env.PAYROLL_TREASURY_ADDRESS,
      operationalReserve: process.env.OPERATIONAL_RESERVE_ADDRESS,
      mainTreasury: process.env.MAIN_TREASURY_ADDRESS
    };
  }

  /**
   * Update treasury addresses (admin only)
   */
  updateTreasuryAddresses(addresses) {
    const validAddresses = {};
    
    for (const [key, address] of Object.entries(addresses)) {
      if (this.isValidAddress(address)) {
        validAddresses[key] = address;
      } else {
        throw new Error(`Invalid address for ${key}: ${address}`);
      }
    }

    // In production, these would be updated in the database/config
    this.logger.info('Treasury addresses updated:', validAddresses);
    return validAddresses;
  }
}

module.exports = WalletManager;
