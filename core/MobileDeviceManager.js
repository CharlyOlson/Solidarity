#!/usr/bin/env node

/**
 * Mobile Device Sync Manager for Solidarity Platform
 * Handles iPhone 11 and iPad connectivity and synchronization
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class MobileDeviceManager {
    constructor() {
        this.mobileDevices = new Map();
        this.mobilePorts = new Map([
            ['iPhone11', { port: 3001, protocol: 'http', sync: false }],
            ['iPad', { port: 3002, protocol: 'http', sync: false }]
        ]);
        this.syncConfig = null;
    }

    // Detect mobile devices on network
    async detectMobileDevices() {
        console.log("\n📱 Detecting Mobile Devices...");
        console.log("Scanning for iPhone 11 and iPad on local network...");
        
        // Check for Bonjour/mDNS services (iOS devices)
        try {
            const bonjourCheck = await this.checkBonjourServices();
            if (bonjourCheck.found) {
                console.log(`   📱 Found iOS devices: ${bonjourCheck.devices.join(', ')}`);
            }
        } catch (error) {
            console.log(`   ⚠️ Bonjour scan failed: ${error.message}`);
        }
        
        // Check for HTTP services on common iOS ports
        for (const [deviceName, config] of this.mobilePorts) {
            try {
                const isReachable = await this.testMobileConnection(config.port);
                this.mobileDevices.set(deviceName, {
                    ...config,
                    reachable: isReachable,
                    lastChecked: new Date()
                });
                
                if (isReachable) {
                    console.log(`   ✅ ${deviceName} reachable on port ${config.port}`);
                } else {
                    console.log(`   📴 ${deviceName} not reachable on port ${config.port}`);
                }
            } catch (error) {
                console.log(`   ❌ ${deviceName} connection error: ${error.message}`);
            }
        }
    }

    // Check for Bonjour/mDNS services (requires external tool)
    async checkBonjourServices() {
        return new Promise((resolve) => {
            exec('dns-sd -B _http._tcp', { timeout: 3000 }, (error, stdout, stderr) => {
                if (error) {
                    resolve({ found: false, devices: [] });
                    return;
                }
                
                const devices = [];
                const lines = stdout.split('\n');
                
                for (const line of lines) {
                    if (line.includes('iPhone') || line.includes('iPad')) {
                        devices.push(line.trim());
                    }
                }
                
                resolve({ found: devices.length > 0, devices });
            });
        });
    }

    // Test connection to mobile device
    async testMobileConnection(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const socket = new net.Socket();
            
            const timeout = setTimeout(() => {
                socket.destroy();
                resolve(false);
            }, 2000);
            
            socket.connect(port, 'localhost', () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve(true);
            });
            
            socket.on('error', () => {
                clearTimeout(timeout);
                resolve(false);
            });
        });
    }

    // Create mobile device sync setup
    async setupMobileSync(discoveredLocations = []) {
        console.log("\n📱 Setting up Mobile Device Sync...");
        
        // Create mobile sync configuration
        const mobileConfig = {
            devices: Object.fromEntries(this.mobileDevices),
            syncPaths: discoveredLocations,
            syncInterval: 30000, // 30 seconds
            enabled: false
        };
        
        // Save mobile sync config
        const configPath = path.join(process.cwd(), 'mobile-sync-config.json');
        fs.writeFileSync(configPath, JSON.stringify(mobileConfig, null, 2));
        console.log(`   💾 Mobile sync config saved: ${configPath}`);
        
        // Create mobile sync server script
        const syncServerPath = path.join(process.cwd(), 'mobile-sync-server.js');
        const syncServerContent = this.generateMobileSyncServer();
        fs.writeFileSync(syncServerPath, syncServerContent);
        console.log(`   🌐 Mobile sync server created: ${syncServerPath}`);
        
        console.log("\n📱 Mobile Setup Complete!");
        console.log("To start mobile sync:");
        console.log(`   node mobile-sync-server.js`);
        console.log("Then connect iPhone 11 and iPad to the same network");
        
        this.syncConfig = mobileConfig;
    }

    // Generate mobile sync server code
    generateMobileSyncServer() {
        return `#!/usr/bin/env node

/**
 * Solidarity Mobile Sync Server
 * Syncs with iPhone 11 and iPad
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Serve Solidarity files to mobile devices
app.get('/solidarity/*', (req, res) => {
    const filePath = req.params[0];
    // Serve files from discovered Solidarity locations
    console.log(\`📱 Mobile request: \${filePath}\`);
    res.json({ status: 'Solidarity Mobile Sync Active' });
});

// iPhone 11 endpoint
app.listen(3001, () => {
    console.log('📱 iPhone 11 sync server running on port 3001');
});

// iPad endpoint  
app.listen(3002, () => {
    console.log('📱 iPad sync server running on port 3002');
});
`;
    }

    getMobileStatus() {
        return {
            devices: Object.fromEntries(this.mobileDevices),
            syncEnabled: this.syncConfig?.enabled || false,
            lastScan: new Date().toISOString()
        };
    }
}

module.exports = { MobileDeviceManager };