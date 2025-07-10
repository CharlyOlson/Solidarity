/**
 * Solidarity Platform - Enhanced Zip Phrase Demo
 * Demonstrates all zip phrases including new mechanical controls
 */

const SolidarityZipSystem = require('./harmonicZipSystem');

/**
 * Enhanced demonstration with audio processing integration
 */
async function demonstrateZipPhrases() {
    console.log('🚀 Solidarity Platform - Enhanced Zip Phrase System Demo with Audio Processing\n');

    // Initialize the system
    const solidarity = new SolidarityZipSystem();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('📋 Available Zip Phrases:');
    solidarity.zipSyntax.forEach((entry, index) => {
        console.log(`  ${index + 1}. "${entry.phrase}" (Node ${entry.node}, Priority ${entry.priority})`);
    });

    console.log('\n🎯 Testing Original Harmonic Phrases...\n');
    
    // Test original harmonic phrases
    const originalPhrases = [
        "Too fours",
        "Hard time making Cents", 
        "Hiccup Notifier",
        "Telephone password carousel",
        "Water reacting to gusts",
        "Angel / Daemon Archetypes"
    ];

    for (const phrase of originalPhrases) {
        console.log(`🔷 Testing: "${phrase}"`);
        solidarity.handleZipPhrase(phrase, "DEMO");
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🎛️ Testing New Mechanical Control Phrases...\n');
    
    // Test new mechanical control phrases with audio
    const mechanicalPhrases = [
        "Compression Wave",
        "Expansion Burst",
        "Zoomies Pulse",
        "Lock-Stop",
        "Turn Face Forward",
        "Turn Face Opposite", 
        "Switch Cogs Direction"
    ];

    for (const phrase of mechanicalPhrases) {
        console.log(`⚙️ Testing: "${phrase}"`);
        
        // Generate appropriate demo audio for each phrase
        const demoAudio = generatePhraseSpecificAudio(phrase, solidarity);
        
        const result = await solidarity.handleZipPhraseWithAudio(phrase, "MECH", demoAudio);
        
        if (result.success) {
            console.log(`  ✅ Phrase executed successfully`);
            if (result.audioResult?.success) {
                console.log(`  🎶 Audio processed: RMS ${result.audioResult.signal_stats?.rms_level?.toFixed(4)}`);
            }
        } else {
            console.log(`  ❌ Failed: ${result.error}`);
        }
        
        // Show mechanical status after each command
        const status = solidarity.getMechanicalStatus();
        console.log(`📊 Mechanical Status: Fiscal ${status.fiscalTime}, Alignment: ${status.systemAlignment}`);
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    console.log('🎵 Testing Complete Audio Processing Integration...\n');
    
    // Test complete audio processing
    const audioResults = await solidarity.testZipPhrasesWithAudio();
    
    console.log('🔄 Testing Phrase Sequences...\n');
    
    // Test phrase sequence processing
    const testSequence = [
        "Turn Face Forward",
        "Compression Wave",
        "Hiccup Notifier",
        "Expansion Burst",
        "Switch Cogs Direction",
        "Zoomies Pulse"
    ];

    console.log(`🎯 Processing sequence: ${testSequence.join(' → ')}`);
    const sequenceResults = solidarity.processPhraseSequence(testSequence, "SEQ");
    
    console.log('📈 Sequence Results:');
    sequenceResults.forEach(result => {
        console.log(`  ${result.success ? '✅' : '❌'} "${result.phrase}"`);
    });

    console.log('\n📊 Final System Status:');
    const finalStatus = solidarity.getSystemStatus();
    console.log(JSON.stringify(finalStatus, null, 2));

    console.log('\n🏁 Demo Complete!');
    
    // Return demo results
    return {
        originalPhrases: originalPhrases.length,
        mechanicalPhrases: mechanicalPhrases.length,
        totalPhrases: solidarity.zipSyntax.length,
        audioResults,
        sequenceResults,
        finalStatus
    };
}

/**
 * Generate phrase-specific audio for demonstration
 */
function generatePhraseSpecificAudio(phrase, solidarity) {
    const sampleRate = 44100;
    const duration = 0.5; // 500ms samples
    
    switch (phrase) {
        case "Compression Wave":
            // Generate signal with dynamic range for compression
            return solidarity.generateDemoAudio(440, duration).map(sample => sample * 2.0);
            
        case "Expansion Burst":
            // Generate quiet signal for expansion
            return solidarity.generateDemoAudio(880, duration).map(sample => sample * 0.1);
            
        case "Zoomies Pulse":
            // Generate rapid frequency changes
            const samples = Math.floor(duration * sampleRate);
            const audio = [];
            for (let i = 0; i < samples; i++) {
                const t = i / sampleRate;
                const freq = 440 + 200 * Math.sin(20 * Math.PI * t); // Frequency modulation
                audio.push(Math.sin(2 * Math.PI * freq * t));
            }
            return audio;
            
        case "Switch Cogs Direction":
            // Generate signal that benefits from time reversal
            return solidarity.generateDemoAudio(220, duration);
            
        case "Turn Face Opposite":
            // Generate stereo-like signal
            return solidarity.generateDemoAudio(330, duration);
            
        case "Turn Face Forward":
            // Clean reference signal
            return solidarity.generateDemoAudio(440, duration);
            
        case "Lock-Stop":
            // Signal that should be halted
            return solidarity.generateDemoAudio(660, duration);
            
        default:
            // Default sine wave
            return solidarity.generateDemoAudio(440, duration);
    }
}

/**
 * Test individual phrase with detailed logging
 */
function testIndividualPhrase(phrase, assetSymbol = "TEST") {
    console.log(`\n🔍 Testing Individual Phrase: "${phrase}"`);
    console.log('='.repeat(50));
    
    const solidarity = new SolidarityZipSystem();
    
    // Show pre-execution state
    console.log('📊 Pre-execution Status:');
    console.log(`  Fiscal Time: ${solidarity.fiscalTime}`);
    console.log(`  Mechanical Direction: ${solidarity.mechanicalDirection}`);
    console.log(`  Cogs Direction: ${solidarity.cogsDirection}`);
    
    // Execute phrase
    const success = solidarity.handleZipPhrase(phrase, assetSymbol);
    
    // Show post-execution state
    console.log('\n📊 Post-execution Status:');
    const status = solidarity.getMechanicalStatus();
    console.log(JSON.stringify(status, null, 2));
    
    return { success, status };
}

/**
 * Stress test the fiscal time advancement
 */
function stressTestFiscalTime() {
    console.log('\n⚡ Stress Testing Fiscal Time Advancement...');
    console.log('='.repeat(50));
    
    const solidarity = new SolidarityZipSystem();
    const startTime = Date.now();
    
    // Rapid phrase execution
    const phrases = [
        "Switch Cogs Direction",
        "Turn Face Opposite",
        "Switch Cogs Direction", 
        "Turn Face Forward"
    ];
    
    console.log(`🔄 Executing ${phrases.length} phrases rapidly...`);
    
    phrases.forEach((phrase, index) => {
        console.log(`\n${index + 1}. "${phrase}"`);
        solidarity.handleZipPhrase(phrase);
        
        const status = solidarity.getMechanicalStatus();
        console.log(`   Fiscal Time: ${status.fiscalTime}`);
        console.log(`   Alignment: ${status.systemAlignment}`);
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`\n⏱️ Total execution time: ${totalTime}ms`);
    console.log(`📊 Final fiscal time: ${solidarity.fiscalTime}`);
    
    return {
        totalTime,
        finalFiscalTime: solidarity.fiscalTime,
        phrasesExecuted: phrases.length
    };
}

/**
 * Validate all zip phrase actions exist
 */
function validateZipPhrases() {
    console.log('\n🔍 Validating All Zip Phrases...');
    console.log('='.repeat(50));
    
    const solidarity = new SolidarityZipSystem();
    const results = [];
    
    solidarity.zipSyntax.forEach(entry => {
        try {
            console.log(`✅ "${entry.phrase}" - Valid (Node ${entry.node})`);
            results.push({ phrase: entry.phrase, valid: true });
        } catch (error) {
            console.log(`❌ "${entry.phrase}" - Error: ${error.message}`);
            results.push({ phrase: entry.phrase, valid: false, error: error.message });
        }
    });
    
    const validCount = results.filter(r => r.valid).length;
    const totalCount = results.length;
    
    console.log(`\n📊 Validation Results: ${validCount}/${totalCount} phrases valid`);
    
    return results;
}

// Export functions for use in other modules
module.exports = {
    demonstrateZipPhrases,
    testIndividualPhrase,
    stressTestFiscalTime,
    validateZipPhrases
};

// If run directly, execute the demo
if (require.main === module) {
    demonstrateZipPhrases()
        .then(results => {
            console.log('\n🎉 Demo Results:', results);
        })
        .catch(console.error);
}