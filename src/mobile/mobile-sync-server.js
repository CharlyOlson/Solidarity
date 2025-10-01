#!/usr/bin/env node

/**
 * Solidarity Mobile Sync Server
 * Syncs with iPhone 11 and iPad
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuration
const config = {
    iPhonePort: 3001,
    iPadPort: 3002,
    watchPort: 3003,
    solidarityPath: process.cwd(),
    syncInterval: 30000, // 30 seconds
    enableLogging: true
};

// Load sync config if exists
let syncConfig = {};
try {
    const configPath = path.join(process.cwd(), 'mobile-sync-config.json');
    if (fs.existsSync(configPath)) {
        syncConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('📱 Loaded sync configuration');
    }
} catch (error) {
    console.log(`⚠️ Error loading sync config: ${error.message}`);
}

// Initialize sync status
const syncStatus = {
    lastSync: null,
    connectedDevices: [],
    syncErrors: [],
    syncQueue: []
};

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        serverTime: new Date().toISOString(),
        config: {
            ...config,
            enableLogging: config.enableLogging
        },
        sync: syncStatus
    });
});

// Solidarity file access
app.get('/api/files/:path(*)', (req, res) => {
    try {
        const requestedPath = req.params.path;
        const filePath = path.join(config.solidarityPath, requestedPath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            const files = fs.readdirSync(filePath).map(file => {
                const fullPath = path.join(filePath, file);
                const isDir = fs.statSync(fullPath).isDirectory();
                return {
                    name: file,
                    isDirectory: isDir,
                    path: path.join(requestedPath, file),
                    lastModified: fs.statSync(fullPath).mtime
                };
            });
            
            res.json({ path: requestedPath, files });
        } else {
            // For simple text files
            const content = fs.readFileSync(filePath, 'utf8');
            res.json({ 
                path: requestedPath, 
                content,
                lastModified: stats.mtime
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload/sync file
app.post('/api/files/:path(*)', (req, res) => {
    try {
        const requestedPath = req.params.path;
        const filePath = path.join(config.solidarityPath, requestedPath);
        const dirPath = path.dirname(filePath);
        
        // Ensure directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Write file content
        fs.writeFileSync(filePath, req.body.content || '');
        
        // Log sync activity
        syncStatus.lastSync = new Date().toISOString();
        syncStatus.syncQueue.push({
            path: requestedPath,
            device: req.body.device || 'unknown',
            timestamp: syncStatus.lastSync
        });
        
        // Keep only last 20 sync activities
        if (syncStatus.syncQueue.length > 20) {
            syncStatus.syncQueue.shift();
        }
        
        res.json({ success: true, path: requestedPath });
    } catch (error) {
        syncStatus.syncErrors.push({
            path: req.params.path,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 errors
        if (syncStatus.syncErrors.length > 10) {
            syncStatus.syncErrors.shift();
        }
        
        res.status(500).json({ error: error.message });
    }
});

// Device registration
app.post('/api/devices/register', (req, res) => {
    const { deviceName, deviceType, deviceId } = req.body;
    
    if (!deviceName || !deviceType || !deviceId) {
        return res.status(400).json({ error: 'Missing device information' });
    }
    
    // Register device
    const existingIndex = syncStatus.connectedDevices.findIndex(d => d.deviceId === deviceId);
    const device = {
        deviceId,
        deviceName,
        deviceType,
        lastSeen: new Date().toISOString(),
        ipAddress: req.ip
    };
    
    if (existingIndex >= 0) {
        syncStatus.connectedDevices[existingIndex] = device;
    } else {
        syncStatus.connectedDevices.push(device);
    }
    
    res.json({ 
        registered: true, 
        deviceId, 
        serverTime: new Date().toISOString() 
    });
});

// Device heartbeat
app.post('/api/devices/heartbeat', (req, res) => {
    const { deviceId } = req.body;
    
    if (!deviceId) {
        return res.status(400).json({ error: 'Missing device ID' });
    }
    
    // Update device last seen
    const device = syncStatus.connectedDevices.find(d => d.deviceId === deviceId);
    if (device) {
        device.lastSeen = new Date().toISOString();
        res.json({ 
            status: 'online',
            serverTime: new Date().toISOString() 
        });
    } else {
        res.status(404).json({ error: 'Device not registered' });
    }
});

// iPhone-specific endpoint
const iPhoneServer = app.listen(config.iPhonePort, () => {
    console.log(`📱 iPhone sync server running on port ${config.iPhonePort}`);
});

// iPad-specific endpoint
const iPadServer = app.listen(config.iPadPort, () => {
    console.log(`📱 iPad sync server running on port ${config.iPadPort}`);
});

// Apple Watch-specific endpoint
const watchServer = app.listen(config.watchPort, () => {
    console.log(`⌚ Apple Watch sync server running on port ${config.watchPort}`);
});

// Cleanup inactive devices
setInterval(() => {
    const now = new Date();
    syncStatus.connectedDevices = syncStatus.connectedDevices.filter(device => {
        const lastSeen = new Date(device.lastSeen);
        const diffMinutes = (now - lastSeen) / (1000 * 60);
        return diffMinutes < 5; // Remove devices inactive for more than 5 minutes
    });
}, 60000); // Check every minute

console.log('\n🔄 Solidarity Mobile Sync Server');
console.log('================================');
console.log(`📂 Solidarity path: ${config.solidarityPath}`);
console.log(`📱 Endpoints:`);
console.log(`   - iPhone: http://localhost:${config.iPhonePort}`);
console.log(`   - iPad: http://localhost:${config.iPadPort}`);
console.log(`\n💡 Usage:`);
console.log(`   - Register devices with POST /api/devices/register`);
console.log(`   - Browse files with GET /api/files/[path]`);
console.log(`   - Sync files with POST /api/files/[path]`);
console.log(`\n🚀 Server started successfully!`);

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Solidarity Mobile Sync Server...');
    iPhoneServer.close();
    iPadServer.close();
    process.exit(0);
});
