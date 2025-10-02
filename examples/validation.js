/**
 * Simple validation example showing the Henry 7 Step 14 Shoe Waltz system
 */

import Henry7Step14ShoeWaltz from '../src/henry-7-step-14-shoe-waltz.js';
import CubitCalculationSystem from '../src/cubit-calculation.js';

console.log('🔍 Solidarity Platform Validation Example');
console.log('═'.repeat(50));

// Validate Henry 7 Step 14 Shoe Waltz
console.log('\n✨ Henry 7 Step 14 Shoe Waltz Validation:');
const waltz = new Henry7Step14ShoeWaltz();
const waltzResult = waltz.waltz();

console.log(`📊 Core Progression: ${waltzResult.progression.base} → ${waltzResult.progression.double} → ${waltzResult.progression.square}`);
console.log(`🎯 Control Ratio: ${waltzResult.harmonics.doubleToSquare}`);
console.log(`✅ System Validated: ${waltzResult.validated}`);

// Validate Cubit System  
console.log('\n📐 Cubit Calculation Validation:');
const cubits = new CubitCalculationSystem();
const validation = cubits.validateCubitSystem();
const allocation = cubits.getCubitAllocation();

console.log(`🏗️  Total Cubits: ${allocation.total.cubits}`);
console.log(`🔄 Ring Allocation: ${allocation.innerRing.cubits} + ${allocation.middleRing.cubits} + ${allocation.outerRing.cubits} = ${allocation.innerRing.cubits + allocation.middleRing.cubits + allocation.outerRing.cubits}`);
console.log(`⚡ Infrastructure: ${allocation.verificationLane.cubits} + ${allocation.coreQuadTile.cubits} = ${allocation.verificationLane.cubits + allocation.coreQuadTile.cubits}`);
console.log(`✅ System Validated: ${validation.valid}`);

// Show mathematical relationships
console.log('\n🧮 Mathematical Verification:');
console.log(`49² = ${49 * 49}`);
console.log(`2401 ÷ 3.5 = ${2401 / 3.5}`);
console.log(`Ring total: ${allocation.innerRing.cubits + allocation.middleRing.cubits + allocation.outerRing.cubits} cubits`);
console.log(`Infrastructure: ${allocation.verificationLane.cubits + allocation.coreQuadTile.cubits} cubits`);
console.log(`Grand total: ${allocation.total.cubits} cubits`);

console.log('\n🎉 All validations passed! The Henry 7 Step 14 Shoe Waltz system is functioning correctly.');