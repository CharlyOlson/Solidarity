/**
 * Complete Solidarity System with Focused Pass Correction Integration
 * Demonstrates Python-style focused correction with harmonic phrase processing
 */

const { FocusedPassCorrector } = require('./focusedPassCorrector.js');

// Enhanced Telephone Game with Focused Correction
class TelephoneGameWithCorrection {
    constructor() {
        this.focusedCorrector = new FocusedPassCorrector();
        this.noiseLevel = 0.05;
        this.defaultPasses = 5;
    }

    // Generate Gaussian noise for telephone game simulation
    generateGaussianNoise(size, mean = 0, stdDev = 0.05) {
        const noise = [];
        for (let i = 0; i < size; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            noise.push(mean + stdDev * z0);
        }
        return noise;
    }

    // Telephone game pass with distortion
    telephoneGamePass(data, noiseLevel = this.noiseLevel) {
        const noise = this.generateGaussianNoise(data.length, 0, noiseLevel);
        return data.map((value, index) => value + noise[index]);
    }

    // Gradient cleaning
    gradientClean(data) {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance) + 1e-8;
        
        return data.map(value => (value - mean) / stdDev);
    }

    // Main gradient pass over and clean function
    gradientPassOverAndClean(initialData, passes = this.defaultPasses, noiseLevel = this.noiseLevel) {
        let data = [...initialData];
        const history = [data.slice()];
        
        for (let i = 0; i < passes; i++) {
            data = this.telephoneGamePass(data, noiseLevel);
            data = this.gradientClean(data);
            history.push(data.slice());
        }
        
        return {
            final: data,
            history: history,
            passes: passes,
            noiseLevel: noiseLevel
        };
    }

    // Enhanced processing with text correction
    processTextWithCorrection(text, passes = 3, noiseLevel = 0.05) {
        console.log(`📞📝 Processing text with telephone game and focused correction...`);
        console.log(`   Input: "${text}"`);
        
        // First, apply focused correction to clean up input
        const initialCorrection = this.focusedCorrector.multiPassCorrection(text, 2);
        console.log(`   Initial correction: "${initialCorrection.final}"`);
        
        // Then apply telephone game to simulate transmission
        const integrated = this.focusedCorrector.integrateWithTelephoneGame(this, initialCorrection.final);
        
        // Final correction pass
        const finalCorrection = this.focusedCorrector.multiPassCorrection(integrated.finalText, 1);
        
        console.log(`   Final result: "${finalCorrection.final}"`);
        
        return {
            original: text,
            initialCorrection: initialCorrection,
            telephoneProcessing: integrated.telephoneGame,
            finalCorrection: finalCorrection,
            final: finalCorrection.final,
            statistics: {
                originalLength: text.length,
                finalLength: finalCorrection.final.length,
                correctionsMade: integrated.correction.statistics
            }
        };
    }
}

// Enhanced Harmonic Phrase Parser with Focused Correction
class CorrectedHarmonicPhraseParser {
    constructor() {
        this.phrases = new Map([
            ["Too fours", { trigger: "ephemeral_bridge", node: 7 }],
            ["Hard time making Cents", { trigger: "value_misalignment", node: 1 }],
            ["Hiccup Notifier", { trigger: "instability_marker", node: 7 }],
            ["Telephone password carousel", { trigger: "identity_collapse", node: 4 }],
            ["Water reacting to gusts", { trigger: "multi_variable_mod", node: 14 }],
            ["Angel / Daemon Archetypes", { trigger: "force_balance", node: 3 }]
        ]);
        
        this.telephoneCorrector = new TelephoneGameWithCorrection();
        this.focusedCorrector = new FocusedPassCorrector();
        this.processingHistory = [];
    }

    // Enhanced phrase parsing with correction
    parsePhrase(phrase) {
        console.log(`\n🎵 Parsing phrase with correction: "${phrase}"`);
        
        const startTime = Date.now();
        
        // Apply focused correction to ensure phrase accuracy
        const correctedPhrase = this.focusedCorrector.focusedPass(phrase, "line");
        
        if (correctedPhrase !== phrase) {
            console.log(`   ✓ Phrase corrected: "${phrase}" → "${correctedPhrase}"`);
        }
        
        // Check if corrected phrase exists in our harmonic vocabulary
        let config = this.phrases.get(correctedPhrase);
        let finalPhrase = correctedPhrase;
        
        if (config) {
            console.log(`   ✅ Harmonic phrase recognized: "${correctedPhrase}"`);
            this.triggerHarmonicResponse(config, finalPhrase);
        } else {
            // Try processing with telephone game correction
            console.log(`   🔍 Attempting telephone game correction...`);
            const textResult = this.telephoneCorrector.processTextWithCorrection(phrase, 2, 0.1);
            
            finalPhrase = textResult.final;
            config = this.phrases.get(finalPhrase);
            
            if (config) {
                console.log(`   ✅ Phrase recovered: "${finalPhrase}"`);
                this.triggerHarmonicResponse(config, finalPhrase);
            } else {
                console.log(`   ❌ Unknown phrase after correction: "${finalPhrase}"`);
            }
        }
        
        // Store processing history
        this.processingHistory.push({
            original: phrase,
            corrected: correctedPhrase,
            final: finalPhrase,
            success: config !== undefined,
            processingTime: Date.now() - startTime,
            timestamp: Date.now()
        });
        
        return {
            success: config !== undefined,
            originalPhrase: phrase,
            finalPhrase: finalPhrase,
            config: config
        };
    }

    // Trigger harmonic response with enhanced logging
    triggerHarmonicResponse(config, phrase) {
        console.log(`   🎯 Triggering harmonic response for: "${phrase}"`);
        console.log(`     Node: ${config.node}, Trigger: ${config.trigger}`);
        
        // Simulate harmonic processing based on trigger type
        switch(config.trigger) {
            case "force_balance":
                this.calculateAngelDaemonBalance(config.node, phrase);
                break;
            case "ephemeral_bridge":
                this.activateSymbolicTransition(config.node, phrase);
                break;
            case "instability_marker":
                this.pulseSystemIntegrity(config.node, phrase);
                break;
            case "value_misalignment":
                this.alignIntangibleValue(config.node, phrase);
                break;
            case "identity_collapse":
                this.processPasswordCarousel(config.node, phrase);
                break;
            case "multi_variable_mod":
                this.modulateSystemVariables(config.node, phrase);
                break;
            default:
                console.log(`     ⚠️ Unknown trigger: ${config.trigger}`);
        }
    }

    // Angel/Daemon balance calculation with correction integration
    calculateAngelDaemonBalance(node, phrase) {
        console.log(`     ⚖️ Calculating Angel/Daemon balance for node ${node}...`);
        
        const binarySequence = "101010101";
        const angelForce = Math.sqrt(node * node + (node / 2) * (node / 2));
        const daemonForce = Math.sqrt(node * node + (node / 3) * (node / 3));
        
        let balance = 0;
        for (let n = 1; n <= 8; n++) {
            const binaryBit = parseInt(binarySequence[n % binarySequence.length]);
            balance += binaryBit * (1 / Math.pow(2, n));
        }
        
        const predictedBalance = Math.sqrt(angelForce * angelForce + daemonForce * daemonForce);
        const finalBalance = balance + (predictedBalance / 100);
        
        console.log(`     📊 Results:`);
        console.log(`       Angel Force: ${angelForce.toFixed(3)}`);
        console.log(`       Daemon Force: ${daemonForce.toFixed(3)}`);
        console.log(`       Final Balance: ${finalBalance.toFixed(6)}`);
        
        return finalBalance;
    }

    // Enhanced telephone password carousel with text correction
    processPasswordCarousel(node, phrase) {
        console.log(`     🎠 Processing Telephone Password Carousel for node ${node}...`);
        
        const passwordText = `Node${node}_Phrase_${phrase.replace(/\s/g, '_')}_Auth${Date.now()}`;
        const result = this.telephoneCorrector.processTextWithCorrection(passwordText, 5, 0.2);
        
        console.log(`     📊 Password carousel results:`);
        console.log(`       Original: "${passwordText}"`);
        console.log(`       Final: "${result.final}"`);
        console.log(`       Corrections: ${result.statistics.correctionsMade.symbolCorrections + result.statistics.correctionsMade.wordCorrections + result.statistics.correctionsMade.lineCorrections}`);
        
        return result;
    }

    // Other harmonic response methods
    activateSymbolicTransition(node, phrase) {
        console.log(`     🌉 Symbolic transition activated for node ${node}`);
        console.log(`       Phrase catalyst: "${phrase}"`);
    }
    
    pulseSystemIntegrity(node, phrase) {
        console.log(`     🔔 System integrity pulse for node ${node}`);
        console.log(`       Trigger phrase: "${phrase}"`);
    }
    
    alignIntangibleValue(node, phrase) {
        console.log(`     💎 Intangible value alignment for node ${node}`);
        console.log(`       Alignment phrase: "${phrase}"`);
    }
    
    modulateSystemVariables(node, phrase) {
        console.log(`     🌊 System variable modulation for node ${node}`);
        console.log(`       Modulation phrase: "${phrase}"`);
    }

    // Get processing statistics
    getProcessingStats() {
        const successCount = this.processingHistory.filter(h => h.success).length;
        const totalTime = this.processingHistory.reduce((sum, h) => sum + h.processingTime, 0);
        const avgTime = this.processingHistory.length > 0 ? totalTime / this.processingHistory.length : 0;
        
        return {
            totalProcessed: this.processingHistory.length,
            successful: successCount,
            failed: this.processingHistory.length - successCount,
            successRate: this.processingHistory.length > 0 ? (successCount / this.processingHistory.length * 100).toFixed(1) : 0,
            averageProcessingTime: avgTime.toFixed(1),
            totalProcessingTime: totalTime
        };
    }
}

// Complete Solidarity System with Focused Correction
class CompleteCorrectedSolidaritySystem {
    constructor() {
        this.phraseParser = new CorrectedHarmonicPhraseParser();
        this.focusedCorrector = new FocusedPassCorrector();
        this.isInitialized = false;
    }

    // Initialize system
    async initialize() {
        console.log("🚀 Initializing Complete Corrected Solidarity System...");
        console.log("=" * 70);
        
        this.isInitialized = true;
        
        console.log("✅ Corrected Solidarity System ready!");
        console.log("   📞 Telephone game integration: active");
        console.log("   🔧 Focused correction system: active");
        console.log("   🎵 Harmonic phrase parser: active");
        
        return this.isInitialized;
    }

    // Demonstrate focused correction system
    async runFocusedCorrectionDemo() {
        console.log("\n🔧 Running Focused Correction Demo...");
        console.log("-" * 50);
        
        // Sample text with various errors (Python example equivalent)
        const errorTexts = [
            "Ths is a smple txt with erors.",
            "Too fourrs and hard tim making cents.",
            "Hiccup notifer and telephon password carousl.",
            "Water reacting too gusts with angel/daemon archetpes."
        ];
        
        console.log("📝 Processing error texts:");
        errorTexts.forEach((text, index) => {
            console.log(`   ${index + 1}. "${text}"`);
        });
        
        // Apply batch focused correction
        const batchResult = this.focusedCorrector.batchProcessing(errorTexts, 3);
        
        console.log("\n✅ Batch correction results:");
        batchResult.results.forEach((result, index) => {
            console.log(`   ${index + 1}. "${result.result.final}"`);
        });
        
        console.log(`\n📊 Batch statistics:`);
        console.log(`   Total texts: ${batchResult.summary.total}`);
        console.log(`   Successful: ${batchResult.summary.successful}`);
        console.log(`   Total corrections: ${batchResult.summary.totalCorrections}`);
        
        return batchResult;
    }

    // Run harmonic phrase processing demo
    async runHarmonicPhraseDemo() {
        console.log("\n🎵 Running Harmonic Phrase Processing Demo...");
        console.log("-" * 55);
        
        // Test phrases with intentional errors
        const testPhrases = [
            "Angel / Daemon Archetypes",  // Correct
            "angel/daemon archetpes",     // Needs correction
            "Too fourrs",                 // Needs word correction
            "hard tim making cents",      // Multiple errors
            "Hiccup notifer",            // Typo
            "telephon password carousl",  // Multiple typos
            "Water reacting too gusts",   // Word error
            "Unknown harmonic phrase"     // Should fail
        ];
        
        console.log("🎯 Processing harmonic phrases:");
        
        const results = [];
        for (const phrase of testPhrases) {
            const result = this.phraseParser.parsePhrase(phrase);
            results.push(result);
            await this.delay(300); // Small delay for readability
        }
        
        // Show processing statistics
        const stats = this.phraseParser.getProcessingStats();
        console.log(`\n📈 Processing Statistics:`);
        console.log(`   Total phrases processed: ${stats.totalProcessed}`);
        console.log(`   Successfully recognized: ${stats.successful}`);
        console.log(`   Failed recognition: ${stats.failed}`);
        console.log(`   Success rate: ${stats.successRate}%`);
        console.log(`   Average processing time: ${stats.averageProcessingTime}ms`);
        
        return results;
    }

    // Complete system demonstration
    async runCompleteDemo() {
        console.log("\n🚀 Running Complete System Demonstration");
        console.log("=" * 70);
        
        // Initialize system
        await this.initialize();
        
        // Run focused correction demo
        const correctionResults = await this.runFocusedCorrectionDemo();
        
        // Run harmonic phrase demo
        const harmonicResults = await this.runHarmonicPhraseDemo();
        
        console.log("\n🎉 Complete demonstration finished!");
        console.log("   🔧 Focused correction: demonstrated");
        console.log("   📞 Telephone game integration: demonstrated");
        console.log("   🎵 Harmonic phrase processing: demonstrated");
        console.log("   ⚖️ Angel/Daemon balance calculations: demonstrated");
        
        return {
            correction: correctionResults,
            harmonic: harmonicResults,
            systemReady: this.isInitialized
        };
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Example usage function
async function runSolidarityFocusedCorrectionExample() {
    console.log("🎵 Solidarity Platform - Focused Pass Correction Integration");
    console.log("=" * 80);
    console.log("Python-style focused correction with harmonic phrase processing");
    console.log();
    
    const system = new CompleteCorrectedSolidaritySystem();
    const results = await system.runCompleteDemo();
    
    console.log("\n🏁 Example complete!");
    return results;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TelephoneGameWithCorrection,
        CorrectedHarmonicPhraseParser,
        CompleteCorrectedSolidaritySystem,
        runSolidarityFocusedCorrectionExample
    };
}

// Auto-run demonstration if called directly
if (typeof window === 'undefined' && require.main === module) {
    runSolidarityFocusedCorrectionExample().catch(console.error);
}