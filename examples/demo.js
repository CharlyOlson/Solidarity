/**
 * Solidarity Platform Demo
 * Demonstrates the complete Henry 7 Step 14 Shoe Waltz system integration
 */

import SolidarityPlatform from '../src/solidarity-platform.js';
import ErrorHandler from '../src/error-handler.js';

// Initialize error handler for demo
const errorHandler = new ErrorHandler();

async function runDemo() {
    console.log('🎭 Solidarity Platform Demo - Henry 7 Step 14 Shoe Waltz');
    console.log('═'.repeat(60));
    
    try {
        // Initialize the platform
        console.log('\n🚀 Initializing Solidarity Platform...');
        const platform = new SolidarityPlatform({
            preferredDimension: '9D',
            archiveDimension: '12D',
            autoStartSync: true
        });
        
        console.log('✅ Platform initialized successfully');
        
        // Show system status
        console.log('\n📊 System Status:');
        const status = platform.getSystemStatus();
        console.log(`   Platform State: ${status.platform.state}`);
        console.log(`   Total Cubits: ${status.components.cubitSystem.totalCubits}`);
        console.log(`   Waltz Validated: ${status.components.waltz.validated}`);
        console.log(`   Cubit System Validated: ${status.components.cubitSystem.validated}`);
        
        // Demonstrate Henry 7 Step 14 Shoe Waltz
        console.log('\n🎯 Executing Henry 7 Step 14 Shoe Waltz...');
        const waltzResult = platform.waltz.waltz();
        console.log(`   Base: ${waltzResult.progression.base}`);
        console.log(`   Double: ${waltzResult.progression.double}`);
        console.log(`   Square: ${waltzResult.progression.square}`);
        console.log(`   Control Ratio: ${waltzResult.harmonics.doubleToSquare}`);
        console.log(`   Validated: ${waltzResult.validated}`);
        
        // Show sacred relationships
        console.log('\n🔮 Sacred Mathematical Relationships:');
        const relationships = waltzResult.relationships;
        console.log(`   6 × 7 = ${relationships.sixTimesSeven} (→ ${4+2} harmony)`);
        console.log(`   7 × 8 = ${relationships.sevenTimesEight} (→ ${5+6} master number)`);
        console.log(`   8 × 9 = ${relationships.eightTimesNine} (→ ${7+2} completion)`);
        console.log(`   Tesla 3-6-9: [${relationships.tesla369.join(', ')}]`);
        
        // Show cubit allocation
        console.log('\n📐 Cubit Allocation System:');
        const cubitAllocation = platform.cubitSystem.getCubitAllocation();
        console.log(`   Core Quad Tile: ${cubitAllocation.coreQuadTile.cubits} cubits`);
        console.log(`   Inner Ring: ${cubitAllocation.innerRing.cubits} cubits (${cubitAllocation.innerRing.parts} parts)`);
        console.log(`   Middle Ring: ${cubitAllocation.middleRing.cubits} cubits (${cubitAllocation.middleRing.parts} parts)`);
        console.log(`   Outer Ring: ${cubitAllocation.outerRing.cubits} cubits (${cubitAllocation.outerRing.parts} parts)`);
        console.log(`   Verification Lane: ${cubitAllocation.verificationLane.cubits} cubits`);
        console.log(`   ─────────────────────────────────────`);
        console.log(`   TOTAL: ${cubitAllocation.total.cubits} cubits`);
        
        // Execute integrated session
        console.log('\n⚙️ Executing Complete Integrated Session...');
        const sessionData = {
            participantA: { id: 'demo_user_a', type: 'external' },
            participantB: { id: 'demo_user_b', type: 'external' },
            proposalA: { 
                value: 7, 
                type: 'truth_seeking', 
                content: 'harmonic_alignment_complete_resonance_structure_optimal_frequency_match',
                alignment: 'high'
            },
            proposalB: { 
                value: 14, 
                type: 'scaled_share', 
                content: 'resonance_amplification_harmonic_doubling_complete_alignment_structure',
                alignment: 'high'
            },
            exchangeData: { 
                content: 'henry_7_step_14_shoe_waltz_completion_full_harmonic_resonance_perfect_alignment',
                value: 49,
                cubits: cubitAllocation.total.cubits,
                harmonicSignature: 'complete_alignment_optimal'
            }
        };
        
        const sessionResult = await platform.executeIntegratedSession(sessionData);
        
        if (sessionResult.success) {
            console.log('✅ Integrated session completed successfully');
            console.log(`   Session ID: ${sessionResult.sessionId}`);
            console.log(`   Duration: ${sessionResult.session.duration}ms`);
            console.log(`   Total Cubits: ${sessionResult.totalCubits}`);
            
            // Show phase results
            console.log('\n📋 Phase Results:');
            console.log(`   Waltz: ${sessionResult.session.phases.waltz.completed ? '✅' : '❌'}`);
            console.log(`   Processor: ${sessionResult.session.phases.processor.completed ? '✅' : '❌'}`);
            console.log(`   Exchange: ${sessionResult.session.phases.exchange.completed ? '✅' : '❌'}`);
            console.log(`   Sync: ${sessionResult.session.phases.sync.completed ? '✅' : '❌'}`);
            console.log(`   Cubits: ${sessionResult.session.phases.cubits.completed ? '✅' : '❌'}`);
            
            // Show validation results
            console.log('\n🔍 Validation Results:');
            const validation = sessionResult.session.validation;
            console.log(`   Overall Success: ${validation.success ? '✅' : '❌'}`);
            console.log(`   Waltz Valid: ${validation.validations.waltzValid ? '✅' : '❌'}`);
            console.log(`   Processor Valid: ${validation.validations.processorValid ? '✅' : '❌'}`);
            console.log(`   Exchange Valid: ${validation.validations.exchangeValid ? '✅' : '❌'}`);
            console.log(`   Sync Valid: ${validation.validations.syncValid ? '✅' : '❌'}`);
            console.log(`   Cubit Valid: ${validation.validations.cubitValid ? '✅' : '❌'}`);
            console.log(`   Harmonic Alignment: ${validation.harmonicAlignment.aligned ? '✅' : '❌'}`);
            
        } else {
            console.log('❌ Integrated session failed');
            console.log(`   Error: ${sessionResult.error}`);
        }
        
        // Show final metrics
        console.log('\n📈 Platform Metrics:');
        const metrics = platform.getSystemMetrics();
        console.log(`   Total Sessions: ${metrics.totalSessions}`);
        console.log(`   Successful Completions: ${metrics.successfulCompletions}`);
        console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
        console.log(`   Total Cubits Allocated: ${metrics.totalCubitsAllocated}`);
        console.log(`   Uptime: ${metrics.uptime}ms`);
        
        // Demonstrate mathematical verification
        console.log('\n🧮 Mathematical Verification:');
        console.log(`   49² = ${49 * 49} (squared progression)`);
        console.log(`   2401 ÷ 3.5 = ${2401 / 3.5} (control split)`);
        console.log(`   Ring allocation: 686 ÷ 9 = ${(686 / 9).toFixed(3)} per ninth`);
        console.log(`   1+3+5 = ${1+3+5} parts (ninths validation)`);
        console.log(`   Pythagorean: 7² + 24² = ${7*7 + 24*24} = 25² = ${25*25} ✅`);
        
        console.log('\n🎉 Demo completed successfully!');
        console.log('═'.repeat(60));
        
        // Shutdown gracefully
        await platform.shutdown();
        
    } catch (error) {
        // Use environment-aware error handling
        errorHandler.logError(error, 'Demo execution');
        process.exit(1);
    }
}

// Run the demo
runDemo().catch(error => {
    errorHandler.handleFatalError(error, 'Demo startup');
});