/**
 * Financial API Routes
 * Endpoints for financial data, wallet operations, and treasury management
 */

const express = require('express');
const router = express.Router();

// Get financial overview / balance
router.get('/overview', (req, res) => {
  try {
    const overview = {
      balance: 1250.00,
      availableBalance: 1200.00,
      pendingTransactions: 2,
      currency: 'SLDRT',
      lastUpdated: new Date().toISOString()
    };

    if (req.dataMode === 'low') {
      return res.json({
        balance: overview.balance,
        available: overview.availableBalance,
        pending: overview.pendingTransactions
      });
    }

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve financial overview', message: error.message });
  }
});

// Get transaction history
router.get('/transactions', (req, res) => {
  try {
    const transactions = [
      { id: 'tx_001', type: 'deposit', amount: 500.00, currency: 'SLDRT', status: 'completed', timestamp: new Date().toISOString() },
      { id: 'tx_002', type: 'withdrawal', amount: 50.00, currency: 'SLDRT', status: 'completed', timestamp: new Date().toISOString() }
    ];

    if (req.dataMode === 'low') {
      return res.json(transactions.map(tx => ({ id: tx.id, type: tx.type, amount: tx.amount, status: tx.status })));
    }

    res.json({ transactions, total: transactions.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve transactions', message: error.message });
  }
});

// Get wallet information
router.get('/wallet', (req, res) => {
  try {
    const wallet = {
      address: '0x7a3b...f42d',
      network: 'Ethereum Sepolia',
      balances: {
        SLDRT: 1250.00,
        ETH: 0.842
      },
      status: 'active'
    };

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wallet info', message: error.message });
  }
});

// Treasury status
router.get('/treasury', (req, res) => {
  try {
    const treasury = {
      totalReserves: 100000.00,
      circulatingSupply: 50000.00,
      backingRatio: 2.0,
      lastAudit: new Date().toISOString(),
      status: 'healthy'
    };

    res.json(treasury);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve treasury status', message: error.message });
  }
});

module.exports = router;
