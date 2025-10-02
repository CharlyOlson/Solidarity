/**
 * Authentication Routes
 * Basic auth endpoints for the Solidarity Platform
 */

const express = require('express');
const router = express.Router();

// Basic auth status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication service is available',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;