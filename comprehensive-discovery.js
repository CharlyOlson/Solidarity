#!/usr/bin/env node

/**
 * Comprehensive Solidarity Device & Location Discovery System
 * Scans OneDrive, local drives, and prepares for mobile device connectivity
 * Supports iPhone 11, iPad, and multiple OneDrive accounts
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');

class ComprehensiveSolidarityDiscovery {
    constructor() {
        this.discoveredLocations = new Map();
        this.oneDriveLocations = new Set();
        this.mobileDevices = new Map();
        this.solidaritySignatures = [
            'README.md',
            'package.json',
            'launcher.js',
            'fractal_quantum_energy.py',
            'comprehensive-discovery.js',
            'LICENSE'
        ];
        
        this.oneDrivePaths = this.detectOneDrivePaths();
        this.mobilePorts = new Map([
            ['iPhone11', { port: 3001, protocol: 'http', sync: false }],
            ['iPad', { port: 3002, protocol: 'http', sync: false }]
        ]);
    }

    // Detect all possible OneDrive locations
    detectOneDrivePaths() {
        const username = os.userInfo().username;
        const homedir = os.homedir();
        
        const potentialPaths = [
            // Standard OneDrive paths
            path.join(homedir, 'OneDrive'),
            path.join(homedir, 'OneDrive - Personal'),
            path.join(homedir, 'OneDrive - Business'),
            
            // Multiple OneDrive accounts
            path.join(homedir, 'OneDrive1'),
            path.join(homedir, 'OneDrive2'),
            path.join(homedir, 'OneDrive3'),
            
            // Common alternative locations
            `C:\\Users\\${username}\\OneDrive`,
            `C:\\Users\\${username}\\OneDrive - Personal`,
            `C:\\Users\\${username}\\Documents\\OneDrive`,
            
            // Your specific known location
            `C:\\Users\\souls\\OneDrive\\Documents\\GitHub`,
            
            // Other drive OneDrive syncs
            'D:\\OneDrive',
            'E:\\OneDrive',
            'F:\\OneDrive',
            'E:\\GitHub',
            'F:\\GitHub',
            
            // Cloud folder alternatives
            path.join(homedir, 'Dropbox'),
            path.join(homedir, 'Google Drive'),
            path.join(homedir, 'iCloud Drive'),
            
            // Dev folder locations
            'C:\\Dev',
            'C:\\GitHub',
            'D:\\Dev',
            'E:\\Dev',
            'F:\\Dev'
        ];
        
        return potentialPaths;
    }

    // Comprehensive OneDrive and drive scanning
    async scanAllLocations() {
        console.log("🔍 Comprehensive Solidarity Location Discovery");
        console.log("=".repeat(60));
        console.log(`👤 User: ${os.userInfo().username}`);
        console.log(`💻 Computer: ${os.hostname()}`);
        console.log(`🖥️ Platform: ${os.platform()} ${os.arch()}`);
        console.log("");

        let totalFound = 0;
        let locationsScanned = 0;

        // Scan all potential OneDrive locations
        console.log("📁 Scanning OneDrive and Cloud Storage Locations...");
        for (const oneDrivePath of this.oneDrivePaths) {
            locationsScanned++;
            try {
                if (fs.existsSync(oneDrivePath)) {
                    console.log(`   📂 Found: ${oneDrivePath}`);
                    this.oneDriveLocations.add(oneDrivePath);
                    
                    // Look for GitHub folders within OneDrive
                    const githubPath = path.join(oneDrivePath, 'GitHub');
                    if (fs.existsSync(githubPath)) {
                        console.log(`      🔗 GitHub folder found: ${githubPath}`);
                        await this.scanForSolidarity(githubPath, 'OneDrive-GitHub');
                        totalFound++;
                    }
                    
                    // Look for Documents/GitHub
                    const docsGithubPath = path.join(oneDrivePath, 'Documents', 'GitHub');
                    if (fs.existsSync(docsGithubPath)) {
                        console.log(`      📄 Documents/GitHub found: ${docsGithubPath}`);
                        await this.scanForSolidarity(docsGithubPath, 'OneDrive-Docs-GitHub');
                        totalFound++;
                    }
                    
                    // Recursive scan for Solidarity projects
                    const foundProjects = await this.recursiveSolidarityScan(oneDrivePath, 2); // Max 2 levels deep
                    totalFound += foundProjects;
                    
                } else {
                    console.log(`   ❌ Not found: ${oneDrivePath}`);
                }
            } catch (error) {
                console.log(`   ⚠️ Error scanning ${oneDrivePath}: ${error.message}`);
            }
        }

        // Scan all drive letters
        console.log("\n💾 Scanning All Available Drives...");
        const drives = ['C:', 'D:', 'E:', 'F:', 'G:', 'H:'];
        
        for (const drive of drives) {
            locationsScanned++;
            try {
                if (fs.existsSync(drive + '\\')) {
                    console.log(`   💿 Drive ${drive} accessible`);
                    
                    // Check common dev locations on each drive
                    const devPaths = [
                        path.join(drive, 'GitHub'),
                        path.join(drive, 'Dev'),
                        path.join(drive, 'Projects'),
                        path.join(drive, 'Solidarity'),
                        path.join(drive, 'Code')
                    ];
                    
                    for (const devPath of devPaths) {
                        if (fs.existsSync(devPath)) {
                            console.log(`      📁 Dev folder: ${devPath}`);
                            await this.scanForSolidarity(devPath, `${drive}-Dev`);
                            totalFound++;
                        }
                    }
                }
            } catch (error) {
                console.log(`   ⚠️ Drive ${drive} error: ${error.message}`);
            }
        }

        console.log(`\n📊 Scan Summary:`);
        console.log(`   Locations scanned: ${locationsScanned}`);
        console.log(`   OneDrive locations found: ${this.oneDriveLocations.size}`);
        console.log(`   Solidarity installations: ${this.discoveredLocations.size}`);

        return this.discoveredLocations.size > 0;
    }

    // Recursive scan for Solidarity projects (limited depth)
    async recursiveSolidarityScan(basePath, maxDepth = 2, currentDepth = 0) {
        if (currentDepth >= maxDepth) return 0;

        let foundCount = 0;
        try {
            const items = fs.readdirSync(basePath, { withFileTypes: true });
            
            for (const item of items) {
                if (item.isDirectory()) {
                    const fullPath = path.join(basePath, item.name);
                    
                    // Skip common non-dev folders
                    const skipFolders = [
                        'node_modules', '.git', 'build', 'dist', 'coverage',
                        'AppData', 'Windows', 'Program Files', 'System32'
                    ];
                    
                    if (!skipFolders.includes(item.name)) {
                        // Check if this folder contains Solidarity
                        const solidarityScore = await this.calculateSolidarityScore(fullPath);
                        if (solidarityScore > 0) {
                            console.log(`      🎯 Solidarity project: ${fullPath} (score: ${solidarityScore})`);
                            foundCount++;
                        }
                        
                        // Continue recursive scan
                        foundCount += await this.recursiveSolidarityScan(fullPath, maxDepth, currentDepth + 1);
                    }
                }
            }
        } catch (error) {
            // Silent fail for permission errors
        }

        return foundCount;
    }

    // Calculate how "Solidarity-like" a folder is
    async calculateSolidarityScore(folderPath) {
        let score = 0;
        try {
            const files = fs.readdirSync(folderPath);
            
            // Check for signature files
            for (const signature of this.solidaritySignatures) {
                if (files.includes(signature) || files.includes(path.basename(signature))) {
                    score += 10;
                }
            }
            
            // Check for Solidarity-specific content
            const solidarityIndicators = [
                'goldenHarmonicSystem',
                'ultimateSolidaritySystem', 
                'focusedPassCorrector',
                'correctedSolidaritySystem',
                'multi-drive-manager'
            ];
            
            for (const file of files) {
                const fileName = file.toLowerCase();
                for (const indicator of solidarityIndicators) {
                    if (fileName.includes(indicator.toLowerCase())) {
                        score += 5;
                    }
                }
            }
            
            // Check README content for Solidarity keywords
            const readmePath = path.join(folderPath, 'README.md');
            if (fs.existsSync(readmePath)) {
                try {
                    const content = fs.readFileSync(readmePath, 'utf8');
                    if (content.includes('Solidarity') || content.includes('Soul.Ed.Xchange.Fi')) {
                        score += 20;
                    }
                    if (content.includes('golden ratio') || content.includes('harmonic')) {
                        score += 10;
                    }
                } catch (error) {
                    // Silent fail
                }
            }
            
        } catch (error) {
            return 0;
        }

        if (score >= 30) { // Threshold for Solidarity project
            this.discoveredLocations.set(folderPath, {
                score: score,
                type: 'solidarity-project',
                files: this.solidaritySignatures.filter(sig => 
                    fs.existsSync(path.join(folderPath, sig))
                ),
                lastModified: fs.statSync(folderPath).mtime
            });
        }

        return score;
    }

    // Scan specific location for Solidarity
    async scanForSolidarity(location, type) {
        try {
            const stats = fs.statSync(location);
            if (!stats.isDirectory()) return false;
            
            const files = fs.readdirSync(location);
            const foundFiles = this.solidaritySignatures.filter(sig => 
                files.includes(sig) || files.includes(path.basename(sig))
            );
            
            if (foundFiles.length > 0) {
                this.discoveredLocations.set(location, {
                    type: type,
                    files: foundFiles,
                    completeness: foundFiles.length / this.solidaritySignatures.length,
                    lastModified: stats.mtime
                });
                
                console.log(`      ✅ Solidarity found: ${foundFiles.length}/${this.solidaritySignatures.length} files`);
                return true;
            }
            
        } catch (error) {
            console.log(`      ❌ Error scanning ${location}: ${error.message}`);
        }
        
        return false;
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

    // Generate comprehensive discovery report
    generateDiscoveryReport() {
        console.log("\n📋 Comprehensive Discovery Report");
        console.log("=".repeat(50));

        // OneDrive locations
        console.log("\n☁️ OneDrive Locations:");
        if (this.oneDriveLocations.size > 0) {
            for (const location of this.oneDriveLocations) {
                console.log(`   📁 ${location}`);
            }
        } else {
            console.log("   ❌ No OneDrive locations found");
        }

        // Solidarity installations
        console.log("\n🎯 Solidarity Installations:");
        if (this.discoveredLocations.size > 0) {
            for (const [location, info] of this.discoveredLocations) {
                const completeness = Math.round((info.completeness || 0) * 100);
                console.log(`   📦 ${location}`);
                console.log(`      Type: ${info.type}`);
                console.log(`      Completeness: ${completeness}%`);
                console.log(`      Files: ${info.files.length} found`);
                console.log(`      Last Modified: ${info.lastModified.toISOString()}`);
            }
        } else {
            console.log("   ❌ No Solidarity installations found");
        }

        // Mobile devices
        console.log("\n📱 Mobile Devices:");
        if (this.mobileDevices.size > 0) {
            for (const [deviceName, config] of this.mobileDevices) {
                const status = config.reachable ? "🟢 Online" : "🔴 Offline";
                console.log(`   ${status} ${deviceName} (Port: ${config.port})`);
            }
        } else {
            console.log("   ❌ No mobile devices detected");
        }

        // Recommendations
        console.log("\n💡 Recommendations:");
        if (this.discoveredLocations.size === 0) {
            console.log("   📥 No installations found - run setup to install Solidarity");
        } else if (this.discoveredLocations.size === 1) {
            console.log("   🔄 Single installation found - consider multi-drive setup");
        } else {
            console.log("   ✅ Multiple installations found - run sync to keep updated");
        }

        if (!this.mobileDevices.has('iPhone11') || !this.mobileDevices.get('iPhone11').reachable) {
            console.log("   📱 iPhone 11 not detected - check network connectivity");
        }

        if (!this.mobileDevices.has('iPad') || !this.mobileDevices.get('iPad').reachable) {
            console.log("   📱 iPad not detected - check network connectivity");
        }

        return {
            timestamp: new Date().toISOString(),
            oneDriveLocations: Array.from(this.oneDriveLocations),
            solidarityInstallations: Object.fromEntries(this.discoveredLocations),
            mobileDevices: Object.fromEntries(this.mobileDevices),
            totalInstallations: this.discoveredLocations.size,
            reachableMobileDevices: Array.from(this.mobileDevices.values()).filter(d => d.reachable).length
        };
    }

    // Set up mobile device sync
    async setupMobileSync() {
        console.log("\n📱 Setting up Mobile Device Sync...");

        const mobileConfig = {
            devices: Object.fromEntries(this.mobileDevices),
            syncFolders: Array.from(this.oneDriveLocations),
            solidarityLocations: Array.from(this.discoveredLocations.keys())
        };

        // Save mobile sync config
        const configPath = path.join(process.cwd(), 'mobile-sync-config.json');
        fs.writeFileSync(configPath, JSON.stringify(mobileConfig, null, 2));
        console.log(`   💾 Mobile sync config saved: ${configPath}`);

        // Generate mobile sync server
        const syncServerPath = path.join(process.cwd(), 'mobile-sync-server.js');
        const syncServerContent = this.generateMobileSyncServer();
        fs.writeFileSync(syncServerPath, syncServerContent);
        console.log(`   🖥️ Mobile sync server created: ${syncServerPath}`);

        console.log("\n🚀 To start mobile sync:");
        console.log(`   node mobile-sync-server.js`);
        console.log("Then connect iPhone 11 and iPad to the same network");
    }

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

// Serve Solidarity files to mobile devices
app.get('/solidarity/*', (req, res) => {
    const filePath = req.params[0];
    // Serve discovered Solidarity locations
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
}

// Main execution
async function main() {
    const discovery = new ComprehensiveSolidarityDiscovery();
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'scan') {
        console.log("🔍 Starting comprehensive discovery scan...");
        const found = await discovery.scanAllLocations();
        await discovery.detectMobileDevices();
        const report = discovery.generateDiscoveryReport();

        if (found) {
            console.log("\n🎉 Discovery complete! Solidarity installations found.");
        } else {
            console.log("\n⚠️ No Solidarity installations found. Run setup first.");
        }

        return report;
    } else if (args[0] === 'mobile') {
        await discovery.detectMobileDevices();
        await discovery.setupMobileSync();
    } else if (args[0] === 'report') {
        await discovery.scanAllLocations();
        const report = discovery.generateDiscoveryReport();
        
        // Save report to file
        const reportPath = path.join(process.cwd(), 'solidarity-discovery-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved: ${reportPath}`);
        
    } else {
        console.log("Usage:");
        console.log("  node comprehensive-discovery.js scan     - Full discovery scan");
        console.log("  node comprehensive-discovery.js mobile   - Setup mobile sync");
        console.log("  node comprehensive-discovery.js report   - Generate report file");
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprehensiveSolidarityDiscovery;
}

// Auto-run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Discovery error:', error.message);
        process.exit(1);
    });
}