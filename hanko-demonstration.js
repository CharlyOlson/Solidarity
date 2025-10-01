/*
MIT License

Copyright (c) 2025 CharlyOlson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * hanko-demonstration.js
 * 
 * Demonstration script for the Enhanced Hanko System
 * Showcases the 7-step visual authentication process and compares
 * it with other security methods in a step-by-step flow.
 */

const EnhancedHankoSystem = require('./src/security/EnhancedHankoSystem');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Configure terminal colors for output
const terminalColors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
};

/**
 * Formats text with terminal colors
 * @param {String} text - Text to format
 * @param {String} color - Color to use (from terminalColors)
 * @returns {String} - Formatted text
 */
function colorize(text, color) {
    return `${color}${text}${terminalColors.reset}`;
}

/**
 * Creates a separator line
 * @param {String} character - Character to use for the line
 * @param {Number} length - Length of the line
 * @returns {String} - Separator line
 */
function createSeparator(character = '=', length = 80) {
    return character.repeat(length);
}

/**
 * Displays a header in the console
 * @param {String} title - Header title
 * @param {String} color - Color to use for the title
 */
function displayHeader(title, color = terminalColors.cyan) {
    const separator = createSeparator();
    console.log('\n' + separator);
    console.log(colorize(title.toUpperCase(), color + terminalColors.bright));
    console.log(separator + '\n');
}

/**
 * Displays a step header in the console
 * @param {Number} stepNumber - Step number
 * @param {String} title - Step title
 */
function displayStep(stepNumber, title) {
    console.log(
        colorize(`\nSTEP ${stepNumber}: `, terminalColors.green + terminalColors.bright) +
        colorize(title, terminalColors.white + terminalColors.bright)
    );
    console.log(createSeparator('-', 50));
}

/**
 * Displays a comparison table between HankoStampID and other security methods
 * @param {String} feature - Feature being compared
 * @param {String} hankoDescription - Description of how HankoStampID implements the feature
 * @param {String} twoFADescription - Description of how 2FA implements the feature
 * @param {String} biometricDescription - Description of how biometric auth implements the feature
 * @param {String} blockchainDescription - Description of how blockchain ID implements the feature
 */
function displayComparisonTable(feature, hankoDescription, twoFADescription, biometricDescription, blockchainDescription) {
    console.log(colorize(`\n📊 COMPARISON: ${feature}`, terminalColors.yellow + terminalColors.bright));
    console.log(createSeparator('-', 80));
    console.log(`${colorize('HankoStampID:', terminalColors.cyan + terminalColors.bright)} ${hankoDescription}`);
    console.log(`${colorize('2FA/PIN:', terminalColors.white)} ${twoFADescription}`);
    console.log(`${colorize('Biometric:', terminalColors.white)} ${biometricDescription}`);
    console.log(`${colorize('Blockchain ID:', terminalColors.white)} ${blockchainDescription}`);
    console.log(createSeparator('-', 80));
}

/**
 * Creates a demo authentication session
 * @returns {Promise<Object>} - Authentication results
 */
async function runDemoAuthentication() {
    displayHeader('HankoStampID Visual Authentication Demonstration', terminalColors.magenta);
    
    console.log(colorize('This demonstration will walk through the complete HankoStampID authentication process,', terminalColors.white));
    console.log(colorize('comparing it with traditional security methods at each step.\n', terminalColors.white));
    
    // Create the Enhanced Hanko System instance
    const outputDir = path.join(__dirname, 'demo_output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const hankoSystem = new EnhancedHankoSystem({ outputDir });
    
    // STEP 1: User Entry - Collect Inputs
    displayStep(1, 'USER ENTRY');
    
    // Simulate user inputs (in a real application, these would be collected from the user)
    const userInputs = [
        'CharlyOlson', // username
        '2025-09-30', // current date
        'Solidarity', // project name
        'Red',        // favorite color
        '7',          // favorite number
        'Quantum',    // selected theme
        '金'          // chosen character
    ];
    
    console.log(colorize('User provides 7 fields of information:', terminalColors.white));
    userInputs.forEach((input, index) => {
        console.log(`  ${index + 1}. ${input}`);
    });
    
    const baseKey = hankoSystem.collectUserInputs(userInputs);
    console.log(colorize(`\nBase key generated: ${baseKey}`, terminalColors.green));
    
    displayComparisonTable(
        'USER ENTRY PROCESS',
        'User enters 7 customizable fields including color/logic/preferences that create a personal visual pattern.',
        'User enters a PIN code or receives a temporary code via email/SMS.',
        'User presents fingerprint, face, or other biological traits for scanning.',
        'User enters a long private key or seed phrase.'
    );
    
    // STEP 2: Shape Creation
    displayStep(2, 'SHAPE CREATION');
    
    const shape = hankoSystem.generateShape();
    console.log(colorize('Unique shape generated from user inputs:', terminalColors.white));
    console.log(`  Points: ${shape.points.length}`);
    console.log(`  Centroid: (${shape.centroid.x.toFixed(2)}, ${shape.centroid.y.toFixed(2)})`);
    
    // Generate ASCII visualization of the shape
    const asciiShape = hankoSystem.generateHankoAsciiArt();
    console.log('\n' + asciiShape + '\n');
    
    displayComparisonTable(
        'VISUAL PATTERN GENERATION',
        'Creates a unique, visible geometric shape that connects the inputs visually.',
        'No visual pattern is created - just numeric codes.',
        'Scans physical traits but doesn\'t generate a visual pattern for user verification.',
        'Creates a cryptographic hash, but no human-readable visual pattern.'
    );
    
    // STEP 3: Labyrinth/Clock Spin
    displayStep(3, 'LABYRINTH/CLOCK SPIN');
    
    const path = hankoSystem.processLabyrinthSpin();
    console.log(colorize('User spins through a circular labyrinth/clock:', terminalColors.white));
    console.log(`  Path sequence: ${path.join(' → ')}`);
    console.log(`  Starting position: ${path[0]} o'clock`);
    console.log(`  Final position: ${path[path.length - 1]} o'clock`);
    
    displayComparisonTable(
        'INTERACTIVE PROCESS',
        'User "spins" the shape along a circular path, selecting a color endpoint.',
        'No interactive geometry or motion-based security elements.',
        'Static scan with no user-driven motion or interaction required.',
        'No interactive elements - purely text-based entries.'
    );
    
    // STEP 4: Color Landing
    displayStep(4, 'COLOR LANDING');
    
    const color = hankoSystem.determineColorLanding();
    console.log(colorize('Final color landing determined:', terminalColors.white));
    console.log(`  Color: ${color.name}`);
    console.log(`  RGB Value: ${color.rgb}`);
    
    displayComparisonTable(
        'VISUAL FEEDBACK',
        'Shows immediate visual color feedback that changes with each authentication session.',
        'May show a simple green checkmark or confirmation message.',
        'Shows binary success/failure indicator only.',
        'Displays text-based hash with no visual color coding.'
    );
    
    // STEP 5: Device/QR/Session Sync
    displayStep(5, 'DEVICE/QR SYNC');
    
    const deviceInfo = hankoSystem.syncWithDevice();
    console.log(colorize('Device and session information synchronized:', terminalColors.white));
    console.log(`  Device ID: ${deviceInfo.deviceID}`);
    console.log(`  Session Timestamp: ${new Date(deviceInfo.timestamp).toISOString()}`);
    console.log(`  QR Code data generated for cross-device verification`);
    
    displayComparisonTable(
        'CROSS-DEVICE SYNCHRONIZATION',
        'Visual QR code links sessions across devices and synchronizes authentication state.',
        'Requires separate verification on each device with new codes.',
        'Biometric data typically limited to the device where it was registered.',
        'Wallet addresses can link across devices but require private key or seed phrase.'
    );
    
    // STEP 6: Legal Visual Stamp
    displayStep(6, 'LEGAL VISUAL STAMP');
    
    const stamp = await hankoSystem.generateLegalStamp();
    console.log(colorize('Legal-grade visual stamp generated:', terminalColors.white));
    console.log(`  Stamp image saved to: ${stamp.path}`);
    console.log(`  Contains user identifiers, shape pattern, color code, and timestamp`);
    console.log(`  Can be used for visual verification on legal documents`);
    
    displayComparisonTable(
        'DOCUMENT AUTHENTICATION',
        'Produces a visual artifact that can be printed, photographed, or attached to documents.',
        'No persistent visual artifact - codes expire and have no visual representation.',
        'May produce an image/photo but not designed for document authentication.',
        'Produces a text hash that can be verified but lacks visual distinctiveness.'
    );
    
    // STEP 7: Audit/Verify
    displayStep(7, 'AUDIT/VERIFY');
    
    const audit = hankoSystem.prepareAuditTrail();
    console.log(colorize('Verification hash and audit trail prepared:', terminalColors.white));
    console.log(`  Hash: ${audit.hash.substring(0, 16)}...`);
    console.log(`  Device ID (partial): ${audit.deviceID}`);
    console.log(`  Timestamp: ${new Date(audit.timestamp).toISOString()}`);
    console.log(`  Color Code: ${audit.colorCode}`);
    
    displayComparisonTable(
        'VERIFICATION PROCESS',
        'Both visual and cryptographic - humans can compare stamps visually, while systems verify the cryptographic elements.',
        'Only machine-verifiable through code matching with no human-visual component.',
        'Machine comparison of biometric data with little transparency in the matching process.',
        'Requires blockchain explorer or similar tools to verify transactions/identity.'
    );
    
    // Create a simulated second stamp for comparison
    const secondHankoSystem = new EnhancedHankoSystem({ outputDir });
    await secondHankoSystem.runCompleteAuthentication(userInputs);
    
    // Validate the stamps against each other
    const validationResult = hankoSystem.validateVisually(secondHankoSystem);
    
    console.log(colorize('\nValidation Test Result:', terminalColors.white + terminalColors.bright));
    console.log(`  Valid: ${validationResult.isValid ? 'Yes' : 'No'}`);
    console.log(`  Match Percentage: ${validationResult.matchPercentage}%`);
    console.log(`  Hash Match: ${validationResult.hashMatch ? 'Yes' : 'No'}`);
    console.log(`  Color Match: ${validationResult.colorMatch ? 'Yes' : 'No'}`);
    console.log(`  Path Match: ${validationResult.pathMatch ? 'Yes' : 'No'}`);
    
    // Summary
    displayHeader('DEMONSTRATION SUMMARY', terminalColors.green);
    
    console.log(colorize('The HankoStampID system offers several advantages:', terminalColors.white));
    console.log(`  ${colorize('1.', terminalColors.yellow)} Rich visual feedback at every step of authentication`);
    console.log(`  ${colorize('2.', terminalColors.yellow)} User-generated geometric patterns that are easy to recognize`);
    console.log(`  ${colorize('3.', terminalColors.yellow)} Dynamic color coding that changes with each session`);
    console.log(`  ${colorize('4.', terminalColors.yellow)} Legal-grade stamps for document authentication`);
    console.log(`  ${colorize('5.', terminalColors.yellow)} Both human-visual and cryptographic verification`);
    
    console.log(colorize('\nAll demonstration files have been saved to:', terminalColors.green));
    console.log(`  ${outputDir}`);
    
    return {
        hankoSystem,
        baseKey,
        shape,
        path,
        color,
        deviceInfo,
        stamp,
        audit
    };
}

// Run the demonstration if this script is executed directly
if (require.main === module) {
    runDemoAuthentication().catch(err => {
        console.error('Demonstration error:', err);
    });
}

module.exports = {
    runDemoAuthentication
};