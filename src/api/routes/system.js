/**
 * System API Routes
 * System status, discovery, and device management endpoints
 */

const express = require('express');
const router = express.Router();
const { optionalAuth, requireAuth } = require('../middleware/auth');

// System status (public)
router.get('/status', optionalAuth, (req, res) => {
  try {
    const status = {
      status: 'online',
      version: process.env.VERSION || '2.41.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      startTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      timestamp: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system status', message: error.message });
  }
});

// Run system discovery (auth required)
router.post('/discovery', requireAuth, (req, res) => {
  try {
    const discoveryResults = {
      installations: [
        { name: 'Solidarity API', status: 'online', version: '2.41.0', url: '/api' }
      ],
      devices: [],
      timestamp: new Date().toISOString()
    };

    res.json(discoveryResults);
  } catch (error) {
    res.status(500).json({ error: 'Discovery failed', message: error.message });
  }
});

// Get connected devices (auth required)
router.get('/devices', requireAuth, (req, res) => {
  try {
    const devices = [];
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get devices', message: error.message });
  }
});

module.exports = router;
