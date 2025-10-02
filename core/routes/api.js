/**
 * API Routes
 * General API endpoints
 */

const express = require('express');
const router = express.Router();

// System status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    message: 'Solidarity Platform API is running',
    version: '2.41.0',
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      '/api/status': 'System status',
      '/api/greek-nodes/status': 'Greek Letter Nodes system status',
      '/api/greek-nodes/initialize': 'Initialize Greek Letter Nodes',
      '/api/greek-nodes/activate/{nodeType}': 'Activate specific node',
      '/api/greek-nodes/deactivate/{nodeType}': 'Deactivate specific node',
      '/api/greek-nodes/cross-node-operation': 'Execute cross-node operations',
      '/api/greek-nodes/{nodeType}/details': 'Get node details',
      '/api/greek-nodes/reset': 'Reset system'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;