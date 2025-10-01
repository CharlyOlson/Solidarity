/**
 * Harmonic Systems Integration Test
 * Verifies the integration of Sacred Numeric Sequence and TIMBR Compression
 * with the Solidarity Platform
 *
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 */

const { CorrectedSolidaritySystem } = require('./src/correctedSolidaritySystem');
const { SacredNumericSequence } = require('./src/SacredNumericSequence');
const { TIMBRCompressionSystem } = require('./src/TIMBRCompressionSystem');
const fs = require('fs');
const path = require('path');

async function runHarmonicSystemsTest() {
    console.log('🧪 Solidarity Harmonic Systems Integration Test');
    console.log('=' + '='.repeat(60));
    console.log('📅 Date:', new Date().toISOString());
    
    // Test 1: Sacred Numeric Sequence
    console.log('\n🔢 Test 1: Sacred Numeric Sequence');
    const sacredSequence = new SacredNumericSequence();
    
    // Test basic sequences
    console.log('\n-- Testing Sequences --');
    const sequences = ['fibonacci', 'lucas', 'prime', 'solidarity_nodes'];
    sequences.forEach(seqName => {
        const seq = sacredSequence.getSequence(seqName, 10);
        console.log(`${seqName}: ${seq.join(', ')}`);
    });
    
    // Test golden ratio calculation
    console.log('\n-- Testing Golden Ratio --');
    const fibSeq = sacredSequence.getSequence('fibonacci');
    const phiApprox = sacredSequence.calculateGoldenRatioApproximation(fibSeq);
    console.log(`Golden ratio approximation: ${phiApprox}`);
    console.log(`Actual phi: ${sacredSequence.phi}`);
    console.log(`Difference: ${Math.abs(phiApprox - sacredSequence.phi)}`);
    
    // Test harmonic frequencies
    console.log('\n-- Testing Harmonic Frequencies --');
    const nodeIds = [1, 7, 21];
    for (const nodeId of nodeIds) {
        const harmonics = sacredSequence.generateHarmonicFrequencies('fibonacci', nodeId);
        console.log(`Node ${nodeId} fundamental: ${harmonics.fundamental.toFixed(2)}Hz`);
        console.log(`First 3 golden ratio harmonics: ${harmonics.golden_ratios.slice(0, 3).map(h => h.toFixed(2))} Hz`);
    }
    
    // Test 2: TIMBR Compression System
    console.log('\n🔄 Test 2: TIMBR Compression System');
    
    // Initialize with different compression levels
    const compressionLevels = [4, 7, 21]; // Solidarity nodes
    
    for (const level of compressionLevels) {
        console.log(`\n-- Testing Compression Level ${level} --`);
        const timbr = new TIMBRCompressionSystem({ compressionLevel: level, useOmegaLock: true });
        
        // Create test data
        const testSize = 1000;
        const testData = Buffer.from(Array(testSize).fill().map(() => Math.floor(Math.random() * 256)));
        
        // Compress
        console.log(`Compressing ${testSize} bytes of random data...`);
        const compressed = timbr.compress(testData);
        console.log(`Compressed size: ${compressed.data.length} bytes`);
        console.log(`Compression ratio: ${compressed.metadata.compressionRatio.toFixed(4)}`);
        
        // Decompress
        console.log('Decompressing...');
        const decompressed = timbr.decompress(compressed.data);
        
        // Verify
        const match = testData.compare(decompressed.data) === 0;
        console.log(`Data integrity check: ${match ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    // Test 3: Integration with CorrectedSolidaritySystem
    console.log('\n🧩 Test 3: Integration with CorrectedSolidaritySystem');
    const system = new CorrectedSolidaritySystem();
    
    // Create audio test data
    console.log('\n-- Creating test audio data --');
    const sampleRate = 44100; // 44.1 kHz
    const duration = 1; // 1 second
    const frequency = 440; // A4 note
    
    // Generate sine wave
    const audioSamples = [];
    for (let i = 0; i < sampleRate * duration; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        // Convert to 16-bit range (-32768 to 32767) and then to bytes
        audioSamples.push(Math.floor(sample * 32767));
    }
    
    const audioBuffer = Buffer.from(new Int16Array(audioSamples).buffer);
    console.log(`Created ${audioBuffer.length} bytes of audio data`);
    
    // Process with Sacred Sequence
    console.log('\n-- Processing with Sacred Sequence --');
    const nodeId = 7;
    const processedAudio = system.applySacredSequence(
        Array.from(new Int16Array(audioBuffer.buffer)), 
        'fibonacci', 
        nodeId
    );
    console.log(`Processed ${processedAudio.length} audio samples with Node ${nodeId}`);
    
    // Compress with TIMBR
    console.log('\n-- Compressing with TIMBR --');
    const compressedAudio = system.compressData(audioBuffer);
    console.log(`Original size: ${audioBuffer.length} bytes`);
    console.log(`Compressed size: ${compressedAudio.data.length} bytes`);
    console.log(`Compression ratio: ${compressedAudio.metadata.compressionRatio.toFixed(4)}`);
    
    // Test harmonic integration
    console.log('\n-- Testing Harmonic Integration --');
    const integratedAudio = system.applyHarmonicIntegration(audioBuffer, nodeId);
    console.log(`Generated ${integratedAudio.length} bytes of harmonically integrated audio`);
    
    console.log('\n✅ Harmonic Systems Integration Test Complete');
}

// Run the test
runHarmonicSystemsTest().catch(error => {
    console.error('❌ Test Error:', error);
});