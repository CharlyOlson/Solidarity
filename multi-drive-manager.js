#!/usr/bin/env node

/**
 * Multi-Drive Solidarity Platform Manager
 * Manages Solidarity platform across multiple drives and locations
 * Handles synchronization between C:\, E:\, F:\ drives
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class MultiDriveSolidarityManager {
    constructor() {
        this.driveLocations = new Map([
            ['C', 'c:\\Users\\souls\\OneDrive\\Documents\\GitHub\\Coul-Curve'],
            ['C_Solidarity', 'c:\\Users\\souls\\OneDrive\\Documents\\GitHub\\Solidarity'],
            ['E', 'E:\\'],
            ['F', 'f:\\GitHub']
        ]);
        
        this.activeDrives = new Set();
        this.primaryDrive = null;
        this.syncStatus = new Map();
        
        this.solidarityFiles = [
            'README.md',
            'package.json',
            'launcher.js',
            'setup_python_env.py',
            'setup.bat',
            'setup.sh',
            'src/goldenHarmonicSystem.js',
            'src/ultimateSolidaritySystem.js',
            'src/focusedPassCorrector.js',
            'src/correctedSolidaritySystem.js',
            'test_advanced_audio.py'
        ];
    }

    // Detect available drives and Solidarity installations
    async detectDrives() {
        console.log("🔍 Detecting Solidarity installations across drives...");
        
        for (const [driveName, drivePath] of this.driveLocations) {
            try {
                if (fs.existsSync(drivePath)) {
                    const solidarityIndicators = [
                        path.join(drivePath, 'README.md'),
                        path.join(drivePath, 'package.json'),
                        path.join(drivePath, 'launcher.js')
                    ];
                    
                    const foundFiles = solidarityIndicators.filter(file => fs.existsSync(file));
                    
                    if (foundFiles.length > 0) {
                        this.activeDrives.add(driveName);
                        console.log(`   ✅ ${driveName}: ${drivePath} (${foundFiles.length}/3 core files)`);
                        
                        // Check if it's a complete installation
                        if (foundFiles.length === 3) {
                            console.log(`      🌟 Complete installation detected`);
                            if (!this.primaryDrive) {
                                this.primaryDrive = driveName;
                                console.log(`      🎯 Set as primary drive`);
                            }
                        }
                    } else {
                        console.log(`   📁 ${driveName}: ${drivePath} (directory exists, no Solidarity files)`);
                    }
                } else {
                    console.log(`   ❌ ${driveName}: ${drivePath} (not accessible)`);
                }
            } catch (error) {
                console.log(`   ❌ ${driveName}: Error accessing ${drivePath} - ${error.message}`);
            }
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   Active drives: ${Array.from(this.activeDrives).join(', ')}`);
        console.log(`   Primary drive: ${this.primaryDrive || 'Not set'}`);
        
        return this.activeDrives.size > 0;
    }

    // Get file status across all drives
    getFileStatus(fileName) {
        const status = {};
        
        for (const driveName of this.activeDrives) {
            const drivePath = this.driveLocations.get(driveName);
            const filePath = path.join(drivePath, fileName);
            
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                status[driveName] = {
                    exists: true,
                    size: stats.size,
                    modified: stats.mtime,
                    path: filePath
                };
            } else {
                status[driveName] = {
                    exists: false,
                    path: filePath
                };
            }
        }
        
        return status;
    }

    // Find the most recent version of a file
    findNewestVersion(fileName) {
        const status = this.getFileStatus(fileName);
        let newest = null;
        let newestTime = new Date(0);
        
        for (const [driveName, fileInfo] of Object.entries(status)) {
            if (fileInfo.exists && fileInfo.modified > newestTime) {
                newestTime = fileInfo.modified;
                newest = { drive: driveName, ...fileInfo };
            }
        }
        
        return newest;
    }

    // Synchronize files across drives
    async synchronizeFiles(dryRun = false) {
        console.log(`🔄 ${dryRun ? 'Analyzing' : 'Synchronizing'} files across drives...`);
        
        const syncActions = [];
        
        for (const fileName of this.solidarityFiles) {
            console.log(`\n📁 Processing: ${fileName}`);
            
            const fileStatus = this.getFileStatus(fileName);
            const newest = this.findNewestVersion(fileName);
            
            if (!newest) {
                console.log(`   ❌ File not found on any drive`);
                continue;
            }
            
            console.log(`   📍 Newest version: ${newest.drive} (${newest.modified.toISOString()})`);
            
            // Check which drives need updates
            for (const [driveName, fileInfo] of Object.entries(fileStatus)) {
                if (driveName === newest.drive) {
                    console.log(`   ✅ ${driveName}: Up to date`);
                    continue;
                }
                
                if (!fileInfo.exists) {
                    console.log(`   📥 ${driveName}: Missing - needs copy`);
                    syncActions.push({
                        action: 'copy',
                        from: newest.path,
                        to: fileInfo.path,
                        fromDrive: newest.drive,
                        toDrive: driveName
                    });
                } else if (fileInfo.modified < newest.modified) {
                    console.log(`   🔄 ${driveName}: Outdated (${fileInfo.modified.toISOString()}) - needs update`);
                    syncActions.push({
                        action: 'update',
                        from: newest.path,
                        to: fileInfo.path,
                        fromDrive: newest.drive,
                        toDrive: driveName
                    });
                } else {
                    console.log(`   ✅ ${driveName}: Up to date`);
                }
            }
        }
        
        console.log(`\n📋 Synchronization Plan:`);
        console.log(`   ${syncActions.length} actions required`);
        
        if (dryRun) {
            syncActions.forEach((action, index) => {
                console.log(`   ${index + 1}. ${action.action.toUpperCase()}: ${action.fromDrive} → ${action.toDrive}`);
                console.log(`      ${path.basename(action.from)}`);
            });
            return syncActions;
        }
        
        // Execute synchronization
        let successCount = 0;
        for (const action of syncActions) {
            try {
                // Ensure target directory exists
                const targetDir = path.dirname(action.to);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                
                // Copy file
                fs.copyFileSync(action.from, action.to);
                console.log(`   ✅ ${action.action.toUpperCase()}: ${action.fromDrive} → ${action.toDrive} - ${path.basename(action.from)}`);
                successCount++;
                
            } catch (error) {
                console.log(`   ❌ ${action.action.toUpperCase()}: ${action.fromDrive} → ${action.toDrive} - FAILED: ${error.message}`);
            }
        }
        
        console.log(`\n🎉 Synchronization complete: ${successCount}/${syncActions.length} successful`);
        return successCount === syncActions.length;
    }

    // Launch Solidarity system from specific drive
    async launchFromDrive(driveName, command = 'ultimate') {
        if (!this.activeDrives.has(driveName)) {
            console.log(`❌ Drive ${driveName} not available`);
            return false;
        }
        
        const drivePath = this.driveLocations.get(driveName);
        const launcherPath = path.join(drivePath, 'launcher.js');
        
        if (!fs.existsSync(launcherPath)) {
            console.log(`❌ Launcher not found at ${launcherPath}`);
            return false;
        }
        
        console.log(`🚀 Launching Solidarity from ${driveName}: ${drivePath}`);
        console.log(`   Command: ${command}`);
        
        return new Promise((resolve, reject) => {
            const process = spawn('node', [launcherPath, command], {
                cwd: drivePath,
                stdio: 'inherit'
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Solidarity completed successfully on ${driveName}`);
                    resolve(true);
                } else {
                    console.log(`❌ Solidarity failed on ${driveName} with code ${code}`);
                    resolve(false);
                }
            });
            
            process.on('error', (error) => {
                console.log(`❌ Launch error on ${driveName}: ${error.message}`);
                reject(error);
            });
        });
    }

    // Create new installation on specified drive
    async createInstallation(driveName, sourceDrive = null) {
        if (!sourceDrive) {
            sourceDrive = this.primaryDrive;
        }
        
        if (!sourceDrive || !this.activeDrives.has(sourceDrive)) {
            console.log(`❌ Source drive ${sourceDrive} not available`);
            return false;
        }
        
        const targetPath = this.driveLocations.get(driveName);
        const sourcePath = this.driveLocations.get(sourceDrive);
        
        console.log(`📦 Creating Solidarity installation on ${driveName}`);
        console.log(`   Source: ${sourcePath}`);
        console.log(`   Target: ${targetPath}`);
        
        try {
            // Ensure target directory exists
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true });
                console.log(`   📁 Created directory: ${targetPath}`);
            }
            
            // Copy essential files
            let copiedFiles = 0;
            for (const fileName of this.solidarityFiles) {
                const sourceFile = path.join(sourcePath, fileName);
                const targetFile = path.join(targetPath, fileName);
                
                if (fs.existsSync(sourceFile)) {
                    // Ensure target subdirectory exists
                    const targetDir = path.dirname(targetFile);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    
                    fs.copyFileSync(sourceFile, targetFile);
                    console.log(`   ✅ Copied: ${fileName}`);
                    copiedFiles++;
                } else {
                    console.log(`   ⚠️ Missing: ${fileName}`);
                }
            }
            
            console.log(`📊 Installation complete: ${copiedFiles}/${this.solidarityFiles.length} files copied`);
            
            // Update active drives
            this.activeDrives.add(driveName);
            
            return copiedFiles > 0;
            
        } catch (error) {
            console.log(`❌ Installation failed: ${error.message}`);
            return false;
        }
    }

    // Show status across all drives
    showStatus() {
        console.log("📊 Multi-Drive Solidarity Status");
        console.log("=" * 50);
        
        for (const [driveName, drivePath] of this.driveLocations) {
            console.log(`\n${driveName}: ${drivePath}`);
            
            if (this.activeDrives.has(driveName)) {
                console.log(`   🟢 Active${driveName === this.primaryDrive ? ' (Primary)' : ''}`);
                
                // Check key files
                let fileCount = 0;
                for (const fileName of this.solidarityFiles.slice(0, 5)) { // Check first 5 files
                    const filePath = path.join(drivePath, fileName);
                    if (fs.existsSync(filePath)) {
                        fileCount++;
                    }
                }
                console.log(`   📁 Files: ${fileCount}/${this.solidarityFiles.slice(0, 5).length} core files present`);
                
            } else {
                console.log(`   🔴 Inactive`);
            }
        }
        
        console.log(`\n🎯 Primary Drive: ${this.primaryDrive || 'Not set'}`);
        console.log(`📊 Active Drives: ${this.activeDrives.size}`);
    }

    // Main menu system
    async showMenu() {
        console.log("\n🌟 Multi-Drive Solidarity Platform Manager");
        console.log("=" * 50);
        console.log("Available commands:");
        console.log("  detect     - Detect Solidarity installations");
        console.log("  status     - Show status across drives");
        console.log("  sync       - Synchronize files across drives");
        console.log("  sync:dry   - Preview synchronization actions");
        console.log("  launch <drive> <command> - Launch from specific drive");
        console.log("  install <target> <source> - Create installation");
        console.log("  help       - Show this menu");
        console.log("");
        console.log("Examples:");
        console.log("  node multi-drive-manager.js detect");
        console.log("  node multi-drive-manager.js launch C ultimate");
        console.log("  node multi-drive-manager.js sync");
        console.log("  node multi-drive-manager.js install E C");
    }
}

// Main execution
async function main() {
    const manager = new MultiDriveSolidarityManager();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        await manager.showMenu();
        return;
    }
    
    const command = args[0];
    
    switch (command) {
        case 'detect':
            const detected = await manager.detectDrives();
            if (!detected) {
                console.log("❌ No Solidarity installations found");
                process.exit(1);
            }
            break;
            
        case 'status':
            await manager.detectDrives();
            manager.showStatus();
            break;
            
        case 'sync':
            await manager.detectDrives();
            await manager.synchronizeFiles(false);
            break;
            
        case 'sync:dry':
            await manager.detectDrives();
            await manager.synchronizeFiles(true);
            break;
            
        case 'launch':
            if (args.length < 2) {
                console.log("Usage: launch <drive> [command]");
                process.exit(1);
            }
            const driveName = args[1].toUpperCase();
            const launchCommand = args[2] || 'ultimate';
            
            await manager.detectDrives();
            const success = await manager.launchFromDrive(driveName, launchCommand);
            process.exit(success ? 0 : 1);
            break;
            
        case 'install':
            if (args.length < 2) {
                console.log("Usage: install <target_drive> [source_drive]");
                process.exit(1);
            }
            const targetDrive = args[1].toUpperCase();
            const sourceDrive = args[2] ? args[2].toUpperCase() : null;
            
            await manager.detectDrives();
            const installed = await manager.createInstallation(targetDrive, sourceDrive);
            process.exit(installed ? 0 : 1);
            break;
            
        case 'help':
            await manager.showMenu();
            break;
            
        default:
            console.log(`Unknown command: ${command}`);
            await manager.showMenu();
            process.exit(1);
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiDriveSolidarityManager;
}

// Auto-run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Manager error:', error.message);
        process.exit(1);
    });
}