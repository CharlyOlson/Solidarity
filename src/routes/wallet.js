/**
 * Wallet API Routes
 * Solidarity Platform - Created by Scott Charles Olson (Charly)
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const WalletManager = require('../utils/walletManager');
const router = express.Router();

// Initialize wallet manager
const walletManager = new WalletManager();

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/wallet/validate/:address
 * Validate wallet address format
 */
router.get('/validate/:address', [
  param('address').notEmpty().withMessage('Address is required')
], handleValidationErrors, (req, res) => {
  try {
    const { address } = req.params;
    const isValid = walletManager.isValidAddress(address);
    
    res.json({
      address,
      isValid,
      format: isValid ? 'Valid Ethereum address' : 'Invalid address format'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Address validation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/wallet/balance/:address
 * Get wallet balance for ETH or specific token
 */
router.get('/balance/:address', [
  param('address').notEmpty().withMessage('Address is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { address } = req.params;
    const { token, network = 'mainnet' } = req.query;
    
    if (!walletManager.isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }
    
    const balance = await walletManager.getTokenBalance(address, token, network);
    
    res.json({
      address,
      balance,
      token: token || 'ETH',
      network,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch balance',
      message: error.message
    });
  }
});

/**
 * GET /api/wallet/history/:address
 * Get transaction history for wallet
 */
router.get('/history/:address', [
  param('address').notEmpty().withMessage('Address is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { address } = req.params;
    const { network = 'mainnet', limit = 10 } = req.query;
    
    if (!walletManager.isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }
    
    const transactions = await walletManager.getTransactionHistory(
      address, 
      network, 
      parseInt(limit)
    );
    
    res.json({
      address,
      network,
      transactions,
      count: transactions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch transaction history',
      message: error.message
    });
  }
});

/**
 * GET /api/wallet/connect-data/:address
 * Generate wallet connection data (for QR codes, etc.)
 */
router.get('/connect-data/:address', [
  param('address').notEmpty().withMessage('Address is required')
], handleValidationErrors, (req, res) => {
  try {
    const { address } = req.params;
    
    if (!walletManager.isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }
    
    const connectData = walletManager.generateWalletConnectData(address);
    
    res.json({
      success: true,
      connectData,
      qrString: JSON.stringify(connectData)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate connection data',
      message: error.message
    });
  }
});

/**
 * GET /api/wallet/treasury
 * Get treasury wallet addresses
 */
router.get('/treasury', (req, res) => {
  try {
    const treasuryAddresses = walletManager.getTreasuryAddresses();
    
    res.json({
      treasury: treasuryAddresses,
      platform: 'Solidarity',
      version: '2.41.0'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch treasury addresses',
      message: error.message
    });
  }
});

/**
 * POST /api/wallet/treasury/update
 * Update treasury addresses (admin only)
 */
router.post('/treasury/update', [
  body('communityPool').optional().isEthereumAddress().withMessage('Invalid community pool address'),
  body('payrollTreasury').optional().isEthereumAddress().withMessage('Invalid payroll treasury address'),
  body('operationalReserve').optional().isEthereumAddress().withMessage('Invalid operational reserve address'),
  body('mainTreasury').optional().isEthereumAddress().withMessage('Invalid main treasury address')
], handleValidationErrors, async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const addresses = req.body;
    
    const updatedAddresses = walletManager.updateTreasuryAddresses(addresses);
    
    res.json({
      success: true,
      message: 'Treasury addresses updated successfully',
      addresses: updatedAddresses
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update treasury addresses',
      message: error.message
    });
  }
});

/**
 * POST /api/wallet/contract/solidarity
 * Connect to Solidarity contract
 */
router.post('/contract/solidarity', [
  body('network').optional().isIn(['mainnet', 'goerli', 'polygon', 'bsc', 'localhost'])
    .withMessage('Invalid network')
], handleValidationErrors, async (req, res) => {
  try {
    const { network = 'mainnet' } = req.body;
    
    const contract = await walletManager.connectToSolidarityContract(network);
    
    // Get basic contract info
    const [name, symbol, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply()
    ]);
    
    res.json({
      success: true,
      contract: {
        address: await contract.getAddress(),
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        network
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to connect to Solidarity contract',
      message: error.message
    });
  }
});

/**
 * GET /api/wallet/contract/metrics
 * Get current stability metrics from contract
 */
router.get('/contract/metrics', async (req, res) => {
  try {
    const { network = 'mainnet' } = req.query;
    
    const contract = await walletManager.connectToSolidarityContract(network);
    const metrics = await contract.getCurrentMetrics();
    
    res.json({
      success: true,
      metrics: {
        price: metrics.price.toString(),
        volume: metrics.volume.toString(),
        liquidityDepth: metrics.liquidityDepth.toString(),
        stabilityScore: metrics.stabilityScore.toString(),
        timestamp: new Date(Number(metrics.timestamp) * 1000).toISOString()
      },
      network
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch contract metrics',
      message: error.message
    });
  }
});

module.exports = router;
