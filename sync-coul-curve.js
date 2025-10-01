#!/usr/bin/env node

/**
 * Solidarity Platform - Cross-Repository Sync Script
 * 
 * Synchronizes stable audio research code from the Coul-Curve repository
 * into the Solidarity production codebase, ensuring experimental features
 * become available in production after validation.
 * 
 * Usage:
 *   node sync-coul-curve.js [path/to/Coul-Curve]
 * 
 * Default path: ../Coul-Curve
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Get Coul-Curve path from command line argument or use default
const COUL_CURVE_PATH = process.argv[2] || path.join('..', 'Coul-Curve');

// List of files to sync (relative to Coul-Curve root)
const SYNC_FILES = [
  'src/harmonicZipSystem.js',
  'src/solidarityAudioProcessor.py',
  'src/enhancedAudioStudioCommands.js'
];

/**
 * Copy a file from Coul-Curve to Solidarity
 * @param {string} sourcePath - Relative path in Coul-Curve
 */
function syncFile(sourcePath) {
  const fullSourcePath = path.join(COUL_CURVE_PATH, sourcePath);
  const fileName = path.basename(sourcePath);
  const targetPath = path.join('src', 'audio', fileName);
  
  console.log(`${colors.blue}Syncing:${colors.reset} ${sourcePath} ${colors.cyan}→${colors.reset} ${targetPath}`);
  
  // Check if source file exists
  if (!fs.existsSync(fullSourcePath)) {
    console.warn(`${colors.yellow}Warning:${colors.reset} Source file not found: ${fullSourcePath}`);
    return false;
  }
  
  try {
    // Create target directory if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`${colors.green}Created directory:${colors.reset} ${targetDir}`);
    }
    
    // Read source file
    const fileContent = fs.readFileSync(fullSourcePath, 'utf8');
    
    // Write to target file
    fs.writeFileSync(targetPath, fileContent);
    
    console.log(`${colors.green}✓ Successfully synced:${colors.reset} ${fileName}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error syncing ${fileName}:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Main function to run the sync process
 */
function main() {
  console.log(`\n${colors.magenta}╔═════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║ SOLIDARITY PLATFORM - CROSS-REPOSITORY SYNC      ║${colors.reset}`);
  console.log(`${colors.magenta}╚═════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.cyan}Source:${colors.reset} ${COUL_CURVE_PATH}`);
  console.log(`${colors.cyan}Target:${colors.reset} ./src/audio\n`);
  
  // Check if Coul-Curve directory exists
  if (!fs.existsSync(COUL_CURVE_PATH)) {
    console.error(`${colors.red}Error:${colors.reset} Coul-Curve directory not found at ${COUL_CURVE_PATH}`);
    console.log(`\nPlease provide the correct path as an argument:`);
    console.log(`  node sync-coul-curve.js path/to/Coul-Curve\n`);
    process.exit(1);
  }
  
  // Sync all files
  const results = SYNC_FILES.map(syncFile);
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n${colors.cyan}Summary:${colors.reset}`);
  console.log(`- Files processed: ${SYNC_FILES.length}`);
  console.log(`- Files synced:   ${successCount}`);
  console.log(`- Files failed:   ${SYNC_FILES.length - successCount}`);
  
  if (successCount === SYNC_FILES.length) {
    console.log(`\n${colors.green}🎵 Cross-repository sync complete!${colors.reset}`);
    console.log(`${colors.green}🚀 Twin repository system operational${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Cross-repository sync completed with warnings${colors.reset}\n`);
  }
}

// Execute main function
main();