#!/usr/bin/env node

/**
 * Solidarity Test Backend Server
 * This server provides endpoints for testing the frontend
 * without requiring the full backend setup
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { audioCommands, executeAudioCommand } = require('./src/enhancedAudioStudioCommands');
const fs = require('fs');
const path = require('path');

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory state for our test server
const serverState = {
  systemStatus: {
    status: 'online',
    version: '6.5.0',
    startTime: new Date().toISOString(),
    uptime: 0,
    environment: 'development'
  },
  connectedDevices: [
    {
      id: 'device-001',
      name: 'iPhone 11',
      type: 'mobile',
      status: 'online',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'device-002',
      name: 'MacBook Pro',
      type: 'desktop',
      status: 'online',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'device-003',
      name: 'iPad',
      type: 'tablet',
      status: 'offline',
      lastSeen: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ],
  discoveryResults: {
    locations: [
      {
        path: 'C:\\Users\\souls\\OneDrive\\Documents\\GitHub\\Solidarity',
        type: 'primary-installation',
        files: ['launcher.js', 'comprehensive-discovery.js', 'README.md'],
        lastModified: new Date().toISOString()
      },
      {
        path: 'E:\\Backup\\Solidarity',
        type: 'backup',
        files: ['launcher.js', 'README.md'],
        lastModified: new Date(Date.now() - 1000000).toISOString()
      }
    ],
    devices: serverState?.connectedDevices || []
  }
};

// API Routes

// System status
app.get('/api/system/status', (req, res) => {
  // Update uptime
  serverState.systemStatus.uptime = Math.floor((Date.now() - new Date(serverState.systemStatus.startTime).getTime()) / 1000);
  res.json(serverState.systemStatus);
});

// Run discovery
app.post('/api/system/discovery', (req, res) => {
  // Simulate delay
  setTimeout(() => {
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      results: serverState.discoveryResults
    });
  }, 1500); // 1.5 second delay to simulate processing
});

// Get audio commands
app.get('/api/audio/commands', (req, res) => {
  res.json(audioCommands);
});

// Execute audio command
app.post('/api/audio/command', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Command is required' 
    });
  }

  try {
    const result = executeAudioCommand(command);
    
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: `Command "${command}" not found`
      });
    }

    // Add some additional data for visual appeal
    result.timestamp = new Date().toISOString();
    result.status = 'success';

    setTimeout(() => {
      res.json(result);
    }, 1000); // 1 second delay to simulate processing
  } catch (error) {
    console.error('Error executing command:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to execute command',
      error: error.message
    });
  }
});

// Get connected devices
app.get('/api/devices', (req, res) => {
  res.json(serverState.connectedDevices);
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Solidarity API Documentation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #1a237e; }
          h2 { color: #303f9f; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
          .endpoint { margin-bottom: 30px; }
          .method { display: inline-block; padding: 5px 10px; border-radius: 5px; color: white; font-weight: bold; margin-right: 10px; }
          .get { background-color: #4CAF50; }
          .post { background-color: #2196F3; }
          .put { background-color: #FF9800; }
          .delete { background-color: #F44336; }
        </style>
      </head>
      <body>
        <h1>Solidarity API Documentation</h1>
        <p>This documentation provides information about the available API endpoints for the Solidarity Platform.</p>
        
        <h2>System</h2>
        
        <div class="endpoint">
          <h3><span class="method get">GET</span> /api/system/status</h3>
          <p>Get the current system status.</p>
          <h4>Response</h4>
          <pre>{
  "status": "online",
  "version": "6.5.0",
  "startTime": "2023-09-05T10:15:30.000Z",
  "uptime": 3600,
  "environment": "development"
}</pre>
        </div>
        
        <div class="endpoint">
          <h3><span class="method post">POST</span> /api/system/discovery</h3>
          <p>Run system discovery to locate installations and devices.</p>
          <h4>Response</h4>
          <pre>{
  "status": "success",
  "timestamp": "2023-09-05T10:15:30.000Z",
  "results": {
    "locations": [...],
    "devices": [...]
  }
}</pre>
        </div>
        
        <h2>Audio</h2>
        
        <div class="endpoint">
          <h3><span class="method get">GET</span> /api/audio/commands</h3>
          <p>Get the list of available audio commands.</p>
          <h4>Response</h4>
          <pre>{
  "compression": {
    "correction": "Compression Wave",
    "command": "dynamic_range_compression",
    "node": 4,
    "description": "Professional dynamic range compression"
  },
  "expansion": {
    "correction": "Expansion Burst",
    "command": "upward_expansion",
    "node": 14,
    "description": "Upward expansion for punch and dynamics"
  },
  ...
}</pre>
        </div>
        
        <div class="endpoint">
          <h3><span class="method post">POST</span> /api/audio/command</h3>
          <p>Execute an audio command.</p>
          <h4>Request</h4>
          <pre>{
  "command": "switchcogs"
}</pre>
          <h4>Response</h4>
          <pre>{
  "command": "toggle_processing",
  "node": 21,
  "coordinates": {...},
  "timeBuyer": 0.348,
  "description": "Toggle processing while maintaining timeline sync",
  "timestamp": "2023-09-05T10:15:30.000Z",
  "status": "success"
}</pre>
        </div>
        
        <h2>Devices</h2>
        
        <div class="endpoint">
          <h3><span class="method get">GET</span> /api/devices</h3>
          <p>Get the list of connected devices.</p>
          <h4>Response</h4>
          <pre>[
  {
    "id": "device-001",
    "name": "iPhone 11",
    "type": "mobile",
    "status": "online",
    "lastSeen": "2023-09-05T10:15:30.000Z"
  },
  ...
]</pre>
        </div>
      </body>
    </html>
  `);
});

// Add a catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           Solidarity Test Backend Server                  ║
║                                                           ║
║           Running at: http://localhost:${PORT}              ║
║                                                           ║
║           API Docs: http://localhost:${PORT}/api/docs        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
