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
            'src/goldenHarmonicSystem.js',
            'src/ultimateSolidaritySystem.js',
            'multi-drive-manager.js'
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
            `C:\\Dev`,
            `C:\\GitHub`,
            `D:\\Dev`,
            `E:\\Dev`,
            `F:\\Dev`
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
                    const foundProjects = await this.recursiveSolidarityScan(oneDrivePath, 2);
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
                // Trigger audio event when Solidarity is found
                this.triggerAudioForDiscoveryEvent('Solidarity Found');
                return true;
            }
            
        } catch (error) {
            console.log(`      ❌ Error scanning ${location}: ${error.message}`);
        }
        
        return false;
    }

    // Strategic: Enhanced audio command integration for device/location events
    triggerAudioForDiscoveryEvent(eventPhrase) {
        try {
            const { audioCommands, executeAudioCommand } = require('./enhancedAudioStudioCommands');
            if (audioCommands && audioCommands[eventPhrase]) {
                const audioResult = executeAudioCommand(eventPhrase);
                console.log('🎶 Audio Command Triggered (Discovery):', audioResult);
                return audioResult;
            }
        } catch (error) {
            console.log(`⚠️ Audio command error: ${error.message}`);
        }
        return null;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ComprehensiveSolidarityDiscovery
    };
}