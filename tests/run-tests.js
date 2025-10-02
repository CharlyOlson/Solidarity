/**
 * Simple test runner for Solidarity Platform
 */

import Henry7Step14ShoeWaltz from '../src/henry-7-step-14-shoe-waltz.js';
import SolidarityProcessor from '../src/processor.js';
import SoulEdXchang from '../src/soul-edxchang.js';
import StonenSync from '../src/stonensync.js';
import CubitCalculationSystem from '../src/cubit-calculation.js';
import SolidarityPlatform from '../src/solidarity-platform.js';
import { logFatalError } from '../src/error-utils.js';

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('🧪 Running Solidarity Platform Tests\n');
        
        for (const { name, fn } of this.tests) {
            try {
                await fn();
                console.log(`✅ ${name}`);
                this.results.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.results.failed++;
            }
            this.results.total++;
        }

        console.log('\n📊 Test Results:');
        console.log(`   Passed: ${this.results.passed}`);
        console.log(`   Failed: ${this.results.failed}`);
        console.log(`   Total: ${this.results.total}`);
        console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

        return this.results;
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertApproximately(actual, expected, tolerance = 0.001, message) {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(message || `Expected approximately ${expected}, got ${actual}`);
        }
    }
}

const runner = new TestRunner();

// Henry 7 Step 14 Shoe Waltz Tests
runner.test('Henry 7 Step 14 Shoe Waltz - Basic Validation', () => {
    const waltz = new Henry7Step14ShoeWaltz();
    
    runner.assertEqual(waltz.base, 7);
    runner.assertEqual(waltz.double, 14);
    runner.assertEqual(waltz.square, 49);
    runner.assertEqual(waltz.controlRatio, 3.5);
    runner.assert(waltz.validateBase(), 'Base validation should pass');
});

runner.test('Henry 7 Step 14 Shoe Waltz - Source Paths', () => {
    const waltz = new Henry7Step14ShoeWaltz();
    
    runner.assertEqual(waltz.sourcePath1.odd + waltz.sourcePath1.even, 7);
    runner.assertEqual(waltz.sourcePath2.odd + waltz.sourcePath2.even, 7);
});

runner.test('Henry 7 Step 14 Shoe Waltz - Full Execution', () => {
    const waltz = new Henry7Step14ShoeWaltz();
    const result = waltz.waltz();
    
    runner.assert(result.validated, 'Waltz execution should be validated');
    runner.assertEqual(result.progression.base, 7);
    runner.assertEqual(result.progression.double, 14);
    runner.assertEqual(result.progression.square, 49);
});

// Processor Tests
runner.test('Solidarity Processor - Initialization', () => {
    const processor = new SolidarityProcessor();
    
    runner.assertEqual(processor.state, 'idle');
    runner.assert(processor.waltz instanceof Henry7Step14ShoeWaltz);
});

runner.test('Solidarity Processor - Seed Initialization', () => {
    const processor = new SolidarityProcessor();
    const seed = processor.initializeSeed();
    
    runner.assert(seed.validated, 'Seed should be validated');
    runner.assertEqual(seed.evenOddPath.sum, 7);
    runner.assertEqual(seed.triadTetradPath.sum, 7);
    runner.assertEqual(processor.state, 'seeded');
});

// SoulEdXchang Tests
runner.test('SoulEdXchang - Session Initialization', () => {
    const exchange = new SoulEdXchang();
    const session = exchange.initializeSession('userA', 'userB');
    
    runner.assert(session.sessionId, 'Session should have ID');
    runner.assertEqual(session.session.truthSeekingBasis, 7);
    runner.assertEqual(session.session.scaledShareCheckpoint, 14);
    runner.assertEqual(session.session.completionThreshold, 49);
});

// StonenSync Tests
runner.test('StonenSync - Initialization and Configuration', () => {
    const sync = new StonenSync({ beatStructure: '7', lockOnlyAt49: true });
    
    runner.assertEqual(sync.syncState, 'idle');
    runner.assertEqual(sync.config.beatStructure, '7');
    runner.assert(sync.config.lockOnlyAt49);
});

runner.test('StonenSync - Stone State Management', () => {
    const sync = new StonenSync({ lockOnlyAt49: false }); // Disable 49-tick requirement for testing
    const result = sync.setStoneState('test_stone', 'active', { finalize: true });
    
    runner.assert(result.updated, 'Stone should be updated');
    runner.assertEqual(result.stoneId, 'test_stone');
});

// Cubit Calculation Tests
runner.test('Cubit Calculation - Basic Math', () => {
    const cubits = new CubitCalculationSystem();
    
    runner.assertEqual(cubits.base, 7);
    runner.assertEqual(cubits.square, 49);
    runner.assertApproximately(cubits.controlRatio, 3.5);
    
    // Test core calculation: 49² ÷ 3.5
    const expected = (49 * 49) / 3.5; // 2401 / 3.5 = 686
    runner.assertApproximately(cubits.calculations.controlSplit, expected);
});

runner.test('Cubit Calculation - Total Cubit Count', () => {
    const cubits = new CubitCalculationSystem();
    const allocation = cubits.getCubitAllocation();
    
    // Should be approximately 697 total cubits as specified
    runner.assert(allocation.total.cubits > 690 && allocation.total.cubits < 705, 
        `Total cubits should be around 697, got ${allocation.total.cubits}`);
});

runner.test('Cubit Calculation - Validation', () => {
    const cubits = new CubitCalculationSystem();
    const validation = cubits.validateCubitSystem();
    
    runner.assert(validation.valid, 'Cubit system should be valid');
    runner.assert(validation.validations.henryProgression, 'Henry progression should be valid');
    runner.assert(validation.validations.ringAllocation, 'Ring allocation should be valid');
});

// Integration Tests
runner.test('Solidarity Platform - Initialization', () => {
    const platform = new SolidarityPlatform();
    
    runner.assertEqual(platform.platformState, 'initialized');
    runner.assert(platform.waltz instanceof Henry7Step14ShoeWaltz);
    runner.assert(platform.processor instanceof SolidarityProcessor);
    runner.assert(platform.soulEdXchang instanceof SoulEdXchang);
    runner.assert(platform.stonenSync instanceof StonenSync);
    runner.assert(platform.cubitSystem instanceof CubitCalculationSystem);
});

runner.test('Solidarity Platform - System Status', () => {
    const platform = new SolidarityPlatform();
    const status = platform.getSystemStatus();
    
    runner.assertEqual(status.platform.state, 'initialized');
    runner.assert(status.components.waltz.validated, 'Waltz component should be validated');
    runner.assert(status.components.cubitSystem.validated, 'Cubit system should be validated');
    runner.assert(status.metrics.totalCubitsAllocated > 0, 'Should have cubits allocated');
});

// Mathematical Relationship Tests
runner.test('Sacred Mathematical Relationships', () => {
    const waltz = new Henry7Step14ShoeWaltz();
    const relationships = waltz.getSacredRelationships();
    
    // Test 6+7+8+9 = 30 → 3
    runner.assertEqual(relationships.sixTimesSeven, 42);
    runner.assertEqual(relationships.sevenTimesEight, 56);
    runner.assertEqual(relationships.eightTimesNine, 72);
    
    // Test Tesla 3-6-9 preservation
    runner.assert(Array.isArray(relationships.tesla369));
    runner.assertEqual(relationships.tesla369[0], 3);
    runner.assertEqual(relationships.tesla369[1], 6);
    runner.assertEqual(relationships.tesla369[2], 9);
});

runner.test('Harmonic Calculations', () => {
    const waltz = new Henry7Step14ShoeWaltz();
    const harmonics = waltz.calculateHarmonics();
    
    runner.assertEqual(harmonics.baseToDouble, 2); // 14/7
    runner.assertApproximately(harmonics.doubleToSquare, 3.5); // 49/14
    runner.assertEqual(harmonics.baseToSquare, 7); // 49/7
    runner.assertApproximately(harmonics.meanOf3And4, 3.5); // (3+4)/2
});

// Run all tests
runner.run().then(results => {
    if (results.failed > 0) {
        process.exit(1);
    }
}).catch(error => {
    logFatalError(error, 'Test runner error:');
});