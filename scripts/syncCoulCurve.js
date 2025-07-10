#!/usr/bin/env node

/**
 * Cross-Repository Sync Script
 * Syncs stable features from Coul-Curve research repo to Solidarity production
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Syncing Coul-Curve research with Solidarity production...');

// Configuration
const COUL_CURVE_PATH = process.argv[2] || '../Coul-Curve';
const SYNC_FILES = [
    'src/harmonicZipSystem.js',
    'src/solidarityAudioProcessor.py',
    'src/enhancedAudioStudioCommands.js'
];

function syncFile(relativePath) {
    const sourcePath = path.join(COUL_CURVE_PATH, relativePath);
    const destPath = path.join('.', 'src', 'audio', path.basename(relativePath));
    
    if (fs.existsSync(sourcePath)) {
        console.log(`📁 Syncing ${relativePath}...`);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Synced to ${destPath}`);
    } else {
        console.log(`⚠️  Source file not found: ${sourcePath}`);
    }
}

// Sync files
SYNC_FILES.forEach(syncFile);

console.log('🎵 Cross-repository sync complete!');
console.log('🚀 Twin repository system operational');
