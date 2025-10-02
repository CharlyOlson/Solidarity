/**
 * Wallet Routes
 * Wallet management endpoints
 */

const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Wallet service is available',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;