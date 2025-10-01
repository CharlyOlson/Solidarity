/**
 * Harmonic Integrity Test Suite for Solidarity Platform
 * Tests all harmonic calculations to ensure system integrity after changes
 */

const { harmonicVerifier } = require('./harmonicReferenceTable');
const SolidarityZipSystem = require('./harmonicZipSystem');

/**
 * Complete system integrity test
 */
async function runSystemIntegrityTest() {
    console.log('🚀 Starting Solidarity Platform Integrity Verification...\n');

    // Initialize the system
    const solidaritySystem = new SolidarityZipSystem();
    
    // Wait for scientific mode initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('1️⃣ Testing Harmonic Reference Calculations...');
    const harmonicResults = harmonicVerifier.runCompleteVerification();

    console.log('\n2️⃣ Testing Zip Phrase System...');
    const zipResults = testZipPhraseSystem(solidaritySystem);

    console.log('\n3️⃣ Testing Pressure Calculation System...');
    const pressureResults = testPressureSystem(solidaritySystem);

    console.log('\n4️⃣ Testing Node Coefficient Integrity...');
    const nodeResults = testNodeSystem(solidaritySystem);

    // Generate overall system health score
    const overallScore = calculateOverallHealth([
        harmonicResults.integrityScore,
        zipResults.score,
        pressureResults.score,
        nodeResults.score
    ]);

    console.log('\n🏁 FINAL SYSTEM STATUS:');
    console.log(`📊 Overall Health Score: ${overallScore.toFixed(1)}%`);
    console.log(`🛡️ System Status: ${getSystemStatus(overallScore)}`);
    
    if (overallScore < 95) {
        console.log('⚠️ SYSTEM INTEGRITY COMPROMISED - INVESTIGATE IMMEDIATELY');
    } else {
        console.log('✅ ALL SYSTEMS VERIFIED - PLATFORM READY FOR DEPLOYMENT');
    }

    return {
        overallScore,
        harmonicResults,
        zipResults,
        pressureResults,
        nodeResults
    };
}

/**
 * Test zip phrase system functionality
 */
function testZipPhraseSystem(system) {
    const testPhrases = [
        "Too fours",
        "Hard time making Cents",
        "Hiccup Notifier",
        "Telephone password carousel",
        "Water reacting to gusts",
        "Angel / Daemon Archetypes"
    ];

    let passedTests = 0;
    const errors = [];

    testPhrases.forEach(phrase => {
        try {
            const result = system.handleZipPhrase(phrase, "TEST");
            if (result) {
                passedTests++;
                console.log(`  ✅ "${phrase}" - PASSED`);
            } else {
                errors.push(`Failed to execute phrase: ${phrase}`);
                console.log(`  ❌ "${phrase}" - FAILED`);
            }
        } catch (error) {
            errors.push(`Error with phrase "${phrase}": ${error.message}`);
            console.log(`  ❌ "${phrase}" - ERROR: ${error.message}`);
        }
    });

    const score = (passedTests / testPhrases.length) * 100;
    console.log(`📊 Zip Phrase System Score: ${score.toFixed(1)}% (${passedTests}/${testPhrases.length})`);

    return { score, passedTests, totalTests: testPhrases.length, errors };
}

/**
 * Test pressure calculation system
 */
function testPressureSystem(system) {
    const testCases = [
        { ST: 50, R: 50, O: 25, V: 1, node: 1 },
        { ST: 75, R: 30, O: 15, V: 1.5, node: 3 },
        { ST: 60, R: 45, O: 20, V: 1.2, node: 7 },
        { ST: 80, R: 40, O: 30, V: 1.8, node: 14 },
        { ST: 90, R: 35, O: 35, V: 2.0, node: 21 }
    ];

    let passedTests = 0;
    const errors = [];

    testCases.forEach((testCase, index) => {
        try {
            system.updatePressureFromPhrase({ node: testCase.node }, "TEST");
            
            // Verify the pressure calculation returns a reasonable result
            const result = system.pressureSystem.calculateHarmonicPressure(
                testCase.ST, testCase.R, testCase.O, testCase.V, testCase.node
            );

            if (result && typeof result.pressure === 'number' && !isNaN(result.pressure)) {
                passedTests++;
                console.log(`  ✅ Test Case ${index + 1} (Node ${testCase.node}) - PASSED: ${result.pressure.toFixed(2)}`);
            } else {
                errors.push(`Invalid pressure result for test case ${index + 1}`);
                console.log(`  ❌ Test Case ${index + 1} - FAILED: Invalid result`);
            }
        } catch (error) {
            errors.push(`Error in test case ${index + 1}: ${error.message}`);
            console.log(`  ❌ Test Case ${index + 1} - ERROR: ${error.message}`);
        }
    });

    const score = (passedTests / testCases.length) * 100;
    console.log(`📊 Pressure System Score: ${score.toFixed(1)}% (${passedTests}/${testCases.length})`);

    return { score, passedTests, totalTests: testCases.length, errors };
}

/**
 * Test node system integrity
 */
function testNodeSystem(system) {
    const expectedNodes = [1, 3, 4, 7, 14, 21];
    let passedTests = 0;
    const errors = [];

    expectedNodes.forEach(nodeId => {
        try {
            const node = system.harmonicNodes.get(nodeId);
            const coefficients = system.pressureSystem.nodeCoefficients.get(nodeId);

            if (node && coefficients) {
                // Verify node properties
                if (node.id === nodeId && 
                    coefficients.ST > 0 && 
                    coefficients.R > 0 && 
                    coefficients.O > 0 && 
                    coefficients.V > 0) {
                    passedTests++;
                    console.log(`  ✅ Node ${nodeId} (${node.role}) - PASSED`);
                } else {
                    errors.push(`Invalid properties for node ${nodeId}`);
                    console.log(`  ❌ Node ${nodeId} - FAILED: Invalid properties`);
                }
            } else {
                errors.push(`Missing node or coefficients for ${nodeId}`);
                console.log(`  ❌ Node ${nodeId} - FAILED: Missing data`);
            }
        } catch (error) {
            errors.push(`Error testing node ${nodeId}: ${error.message}`);
            console.log(`  ❌ Node ${nodeId} - ERROR: ${error.message}`);
        }
    });

    const score = (passedTests / expectedNodes.length) * 100;
    console.log(`📊 Node System Score: ${score.toFixed(1)}% (${passedTests}/${expectedNodes.length})`);

    return { score, passedTests, totalTests: expectedNodes.length, errors };
}

/**
 * Calculate overall system health
 */
function calculateOverallHealth(scores) {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Get system status based on health score
 */
function getSystemStatus(score) {
    if (score >= 95) return 'SECURE ✅';
    if (score >= 85) return 'STABLE ⚠️';
    if (score >= 70) return 'WARNING ⚠️';
    return 'COMPROMISED ❌';
}

/**
 * Generate harmonic reference data for verification
 */
function generateHarmonicVerificationData() {
    console.log('📋 Generating Harmonic Reference Data for External Verification...\n');
    
    const fundamentals = [110.0, 220.0, 440.0, 880.0]; // A2, A3, A4, A5
    
    fundamentals.forEach(freq => {
        console.log(`🎵 Harmonic Series for ${freq} Hz:`);
        const table = harmonicVerifier.generateHarmonicTable(freq, 10);
        
        Object.values(table).forEach(harmonic => {
            console.log(`  ${harmonic.harmonic}: ${harmonic.frequency.toFixed(3)} Hz (${harmonic.ratio}) - ${harmonic.intervalName}`);
        });
        console.log('');
    });

    // Export CSV for external verification
    const csvData = harmonicVerifier.exportAsCSV(440.0);
    console.log('📁 CSV Export Data (first 5 lines):');
    console.log(csvData.split('\n').slice(0, 6).join('\n'));
}

// Export functions for use in other modules
module.exports = {
    runSystemIntegrityTest,
    testZipPhraseSystem,
    testPressureSystem,
    testNodeSystem,
    generateHarmonicVerificationData
};

// If run directly, execute the test suite
if (require.main === module) {
    runSystemIntegrityTest().catch(console.error);
}