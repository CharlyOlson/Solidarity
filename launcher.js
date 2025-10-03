#!/usr/bin/env node

/**
 * Solidarity Platform Main Launcher
 * Orchestrates all Solidarity Framework components
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 * @version 6.5.0
 */

const { ComprehensiveSolidarityDiscovery } = require('./src/ComprehensiveSolidarityDiscovery');
const { EnhancedHarmonicPhraseParser } = require('./src/EnhancedHarmonicPhraseParser');
const { MobileDeviceManager } = require('./src/MobileDeviceManager');
const { SacredNumericSequence } = require('./src/SacredNumericSequence');
const { TIMBRCompressionSystem } = require('./src/TIMBRCompressionSystem');

class SolidarityPlatformLauncher {
    constructor() {
        this.version = '6.5.0';
        this.architect = 'Scott Charles Olson (Charly)';
        this.platform = 'Soul.Ed.Xchange.Fi';
        this.location = 'Kansas, USA 66210';
        
        this.discovery = new ComprehensiveSolidarityDiscovery();
        this.harmonicParser = new EnhancedHarmonicPhraseParser();
        this.mobileManager = new MobileDeviceManager();
        this.sacredSequence = new SacredNumericSequence();
        this.timbrCompression = new TIMBRCompressionSystem({
            compressionLevel: 7, // Solidarity node 7
            useOmegaLock: true
        });
        
        this.systemStatus = 'INITIALIZING';
        this.components = new Map();
    }

    async initialize() {
        console.log(`\n🚀 Solidarity Platform v${this.version}`);
        console.log(`👨‍💻 Architect: ${this.architect}`);
        console.log(`📍 Location: ${this.location}`);
        console.log(`🌐 Platform: ${this.platform}`);
        console.log('═'.repeat(60));

        try {
            // Initialize harmonic phrase parser
            console.log('\n🎵 Initializing Harmonic Phrase Parser...');
            const harmonicReady = await this.harmonicParser.initialize();
            this.components.set('harmonic_parser', harmonicReady);
            
            // Initialize Sacred Numeric Sequence system
            console.log('\n🔢 Initializing Sacred Numeric Sequence System...');
            const sequenceReport = this.sacredSequence.generateSequenceReport();
            console.log(`   Phi value: ${this.sacredSequence.phi}`);
            console.log(`   Fibonacci golden ratio approximation: ${sequenceReport.sequences.fibonacci.phi_approximation}`);
            this.components.set('sacred_sequence', true);
            
            // Initialize TIMBR Compression System
            console.log('\n🔄 Initializing TIMBR Compression System...');
            const compressionMetrics = this.timbrCompression.getCompressionMetrics();
            console.log(`   Compression level: ${compressionMetrics.compressionLevel} (Node ${compressionMetrics.compressionLevel})`);
            console.log(`   Omega Lock: ${compressionMetrics.omegaLockEnabled ? 'Enabled' : 'Disabled'}`);
            this.components.set('timbr_compression', true);

            // Run discovery scan
            console.log('\n🔍 Running Comprehensive Discovery...');
            const discoveryResults = await this.discovery.scanAllLocations();
            this.components.set('discovery', discoveryResults);

            // Detect mobile devices
            console.log('\n📱 Detecting Mobile Devices...');
            await this.mobileManager.detectMobileDevices();
            this.components.set('mobile_manager', true);

            // System status
            const allComponentsReady = Array.from(this.components.values()).every(status => status);
            this.systemStatus = allComponentsReady ? 'OPERATIONAL' : 'LIMITED_FUNCTIONALITY';

            console.log(`\n✅ Solidarity Platform Status: ${this.systemStatus}`);
            
            if (this.systemStatus === 'OPERATIONAL') {
                await this.runDemo();
            }

            return this.systemStatus;

        } catch (error) {
            console.error(`❌ Initialization error: ${error.message}`);
            this.systemStatus = 'ERROR';
            return this.systemStatus;
        }
    }

    async runDemo() {
        console.log('\n🎭 Running Solidarity Demo...');
        
        // Demo ZIP phrases
        console.log('\n📝 Demonstrating ZIP Phrases:');
        const phrases = [
            'Angel / Daemon Archetypes',
            'Hiccup Notifier',
            'Water reacting to gusts',
            'Too fours'
        ];

        for (const phrase of phrases) {
            console.log(`\n--- Processing: "${phrase}" ---`);
            const result = this.harmonicParser.parsePhrase(phrase);
            if (result) {
                console.log(`✅ Processed successfully for node ${result.node}`);
            }
            await this.delay(1000);
        }
        
        // Demo Sacred Numeric Sequence
        console.log('\n🔢 Demonstrating Sacred Numeric Sequence:');
        const nodeId = 7; // Solidarity node 7
        
        // Generate and display sequence-based harmonics
        console.log(`\n--- Generating harmonic frequencies for Node ${nodeId} ---`);
        const fibHarmonics = this.sacredSequence.generateHarmonicFrequencies('fibonacci', nodeId);
        console.log(`Fibonacci-based fundamental: ${fibHarmonics.fundamental.toFixed(2)}Hz`);
        console.log(`First 3 golden harmonics: ${fibHarmonics.golden_ratios.slice(0, 3).map(h => h.toFixed(1)).join(', ')}...`);
        
        const primeHarmonics = this.sacredSequence.generateHarmonicFrequencies('prime', nodeId);
        console.log(`Prime-based fundamental: ${primeHarmonics.fundamental.toFixed(2)}Hz`);
        console.log(`First 3 golden harmonics: ${primeHarmonics.golden_ratios.slice(0, 3).map(h => h.toFixed(1)).join(', ')}...`);
        
        await this.delay(1000);
        
        // Demo TIMBR Compression
        console.log('\n🔄 Demonstrating TIMBR Compression System:');
        
        // Create test data for compression demo
        const testData = Buffer.from("This is a demonstration of the TIMBR Compression System " +
            "integrated with the Solidarity Platform. It uses Sacred Numeric Sequence and " +
            "Golden Ratio principles for optimal compression with Omega Lock verification.");
        
        // Compress and decompress test data
        console.log('\n--- Compressing test data ---');
        const compressed = this.timbrCompression.compress(testData);
        console.log(`Original size: ${testData.length} bytes`);
        console.log(`Compressed size: ${compressed.data.length} bytes`);
        console.log(`Compression ratio: ${compressed.metadata.compressionRatio.toFixed(4)}`);
        
        console.log('\n--- Decompressing test data ---');
        const decompressed = this.timbrCompression.decompress(compressed.data);
        
        // Verify data integrity
        const originalString = testData.toString();
        const decompressedString = decompressed.data.toString();
        const integrity = originalString === decompressedString ? '✅ Perfect' : '❌ Failed';
        console.log(`Data integrity: ${integrity}`);
        
        await this.delay(1000);
    }

    generateSystemReport() {
        const report = {
            timestamp: new Date().toISOString(),
            version: this.version,
            architect: this.architect,
            platform: this.platform,
            location: this.location,
            systemStatus: this.systemStatus,
            components: Object.fromEntries(this.components),
            discovery: this.discovery.generateDiscoveryReport(),
            mobileDevices: this.mobileManager.getMobileStatus(),
            sacred_sequence: {
                phi: this.sacredSequence.phi,
                base_frequency: this.sacredSequence.baseFrequency,
                sequences_available: Array.from(this.sacredSequence.sequences.keys()),
                sequence_report: this.sacredSequence.generateSequenceReport()
            },
            timbr_compression: {
                metrics: this.timbrCompression.getCompressionMetrics(),
                compression_level: this.timbrCompression.config.compressionLevel,
                omega_lock_enabled: this.timbrCompression.config.useOmegaLock
            }
        };

        console.log('\n📊 System Report Generated');
        return report;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Main execution
async function main() {
    const launcher = new SolidarityPlatformLauncher();
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'start') {
        await launcher.initialize();
        
    } else if (args[0] === 'report') {
        await launcher.initialize();
        const report = launcher.generateSystemReport();
        
        const reportPath = require('path').join(process.cwd(), 'solidarity-system-report.json');
        require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`💾 System report saved: ${reportPath}`);
        
    } else if (args[0] === 'demo') {
        await launcher.initialize();
        if (launcher.systemStatus === 'OPERATIONAL') {
            await launcher.runDemo();
        }
        
    } else {
        console.log('Usage:');
        console.log('  node launcher.js start    - Initialize all systems');
        console.log('  node launcher.js demo     - Run harmonic phrase demo');
        console.log('  node launcher.js report   - Generate system report');
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SolidarityPlatformLauncher };
}

// Auto-run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Launcher error:', error.message);
        process.exit(1);
    });
}