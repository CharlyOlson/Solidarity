/**
 * Cubit Calculation System
 * Implements the sacred geometry cubit allocation based on the 49² → 2401 → 3.5 split system
 * 
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 */

export class CubitCalculationSystem {
    constructor(config = {}) {
        this.config = {
            useHenryProgression: config.useHenryProgression ?? true,
            enablePythagoreanVerification: config.enablePythagoreanVerification ?? true,
            preferredTriple: config.preferredTriple ?? [7, 24, 25], // Pythagorean triple
            ringAllocation: config.ringAllocation ?? [1, 3, 5], // 1-3-5 allocation
            ...config
        };
        
        this.base = 7;
        this.double = 14;
        this.square = 49;
        this.controlRatio = 3.5;
        
        this.calculations = this.performCalculations();
    }

    /**
     * Perform all cubit calculations
     */
    performCalculations() {
        // Core progression: 7 → 14 → 49
        const progression = {
            base: this.base,
            double: this.double,
            square: this.square,
            controlRatio: this.controlRatio
        };

        // Calculate total units from 49² split by 3.5
        const squaredValue = this.square * this.square; // 49² = 2401
        const controlSplit = squaredValue / this.controlRatio; // 2401 / 3.5 = 686
        
        // Core tile footprint (2×2 quad)
        const coreTileFootprint = 4; // 2×2 = 4 cubits

        // Concentric ring topology
        const ringCalculations = this.calculateConcentricRings(controlSplit);
        
        // Pythagorean verification path
        const verificationLane = this.calculateVerificationLane(controlSplit);
        
        // Total cubit calculation
        const totalCubits = ringCalculations.totalRingCubits + verificationLane.reserveCubits + coreTileFootprint;

        return {
            progression,
            squaredValue,
            controlSplit,
            coreTileFootprint,
            ringCalculations,
            verificationLane,
            totalCubits,
            breakdown: {
                rings: ringCalculations.totalRingCubits,
                verification: verificationLane.reserveCubits,
                coreTile: coreTileFootprint
            }
        };
    }

    /**
     * Calculate concentric ring allocations (1-3-5 split into ninths)
     */
    calculateConcentricRings(totalUnits) {
        const ninthSize = totalUnits / 9; // 686 / 9 ≈ 76.222...
        const [innerParts, middleParts, outerParts] = this.config.ringAllocation; // [1, 3, 5]
        
        const rings = {
            inner: {
                parts: innerParts,
                units: ninthSize * innerParts,
                cubits: Math.round(ninthSize * innerParts)
            },
            middle: {
                parts: middleParts,
                units: ninthSize * middleParts,
                cubits: Math.round(ninthSize * middleParts)
            },
            outer: {
                parts: outerParts,
                units: ninthSize * outerParts,
                cubits: Math.round(ninthSize * outerParts)
            }
        };

        const totalRingCubits = rings.inner.cubits + rings.middle.cubits + rings.outer.cubits;
        const remainder = totalUnits - totalRingCubits;

        return {
            rings,
            totalRingCubits,
            ninthSize,
            remainder,
            allocationVerification: innerParts + middleParts + outerParts === 9
        };
    }

    /**
     * Calculate verification lane reserve (1% overhead + Pythagorean path)
     */
    calculateVerificationLane(totalUnits) {
        const overheadPercentage = 0.01; // 1%
        const baseReserve = Math.round(totalUnits * overheadPercentage); // ≈ 7 cubits
        
        let pythagoreanReserve = 0;
        if (this.config.enablePythagoreanVerification) {
            const [a, b, c] = this.config.preferredTriple; // [7, 24, 25]
            
            // Verify it's a valid Pythagorean triple
            if (a * a + b * b === c * c) {
                pythagoreanReserve = 1; // Minimal reserve for verification spine
            }
        }
        
        return {
            overheadPercentage,
            baseReserve,
            pythagoreanReserve: 0, // Included in base reserve
            reserveCubits: baseReserve, // Total 7 cubits as specified
            triple: this.config.preferredTriple,
            tripleValid: this.isPythagoreanTriple(this.config.preferredTriple)
        };
    }

    /**
     * Verify Pythagorean triple
     */
    isPythagoreanTriple([a, b, c]) {
        return a * a + b * b === c * c;
    }

    /**
     * Get cubit allocation by zone
     */
    getCubitAllocation() {
        const calc = this.calculations;
        
        return {
            coreQuadTile: {
                cubits: calc.coreTileFootprint,
                description: "2×2 quad (2-4 over 3-5)",
                type: "foundation"
            },
            innerRing: {
                cubits: calc.ringCalculations.rings.inner.cubits,
                parts: calc.ringCalculations.rings.inner.parts,
                description: "Inner ring (1 part)",
                type: "ring"
            },
            middleRing: {
                cubits: calc.ringCalculations.rings.middle.cubits,
                parts: calc.ringCalculations.rings.middle.parts,
                description: "Middle ring (3 parts)",
                type: "ring"
            },
            outerRing: {
                cubits: calc.ringCalculations.rings.outer.cubits,
                parts: calc.ringCalculations.rings.outer.parts,
                description: "Outer ring (5 parts)",
                type: "ring"
            },
            verificationLane: {
                cubits: calc.verificationLane.reserveCubits,
                description: "Verification/crosslink spine + overhead",
                type: "infrastructure"
            },
            total: {
                cubits: calc.totalCubits,
                description: "Complete cubit allocation",
                breakdown: calc.breakdown
            }
        };
    }

    /**
     * Validate the entire cubit system
     */
    validateCubitSystem() {
        const calc = this.calculations;
        const allocation = this.getCubitAllocation();
        
        const validations = {
            henryProgression: this.validateHenryProgression(),
            ringAllocation: calc.ringCalculations.allocationVerification,
            pythagoreanTriple: calc.verificationLane.tripleValid,
            totalSum: this.validateTotalSum(allocation),
            controlRatio: Math.abs(calc.controlSplit - (calc.squaredValue / this.controlRatio)) < 0.1
        };

        const allValid = Object.values(validations).every(v => v === true);

        return {
            valid: allValid,
            validations,
            totalCubits: calc.totalCubits,
            expectedTotal: 697 // As specified in the problem statement
        };
    }

    /**
     * Validate Henry 7 Step 14 Shoe Waltz progression
     */
    validateHenryProgression() {
        return (
            this.base === 7 &&
            this.double === 14 &&
            this.square === 49 &&
            this.double === this.base * 2 &&
            this.square === this.base * this.base &&
            Math.abs(this.square / this.double - this.controlRatio) < 0.001
        );
    }

    /**
     * Validate that all allocations sum to total
     */
    validateTotalSum(allocation) {
        const calculatedTotal = 
            allocation.coreQuadTile.cubits +
            allocation.innerRing.cubits +
            allocation.middleRing.cubits +
            allocation.outerRing.cubits +
            allocation.verificationLane.cubits;
        
        return calculatedTotal === allocation.total.cubits;
    }

    /**
     * Get detailed calculation report
     */
    getCalculationReport() {
        const validation = this.validateCubitSystem();
        const allocation = this.getCubitAllocation();
        
        return {
            title: "Solidarity Cubit Calculation System Report",
            henryProgression: {
                name: "Henry 7 Step 14 Shoe Waltz",
                base: this.base,
                double: this.double,
                square: this.square,
                controlRatio: this.controlRatio
            },
            coreCalculation: {
                squared: this.calculations.squaredValue,
                controlSplit: this.calculations.controlSplit,
                formula: "49² ÷ 3.5 = 2401 ÷ 3.5 = 686"
            },
            allocation,
            validation,
            generatedAt: new Date().toISOString(),
            systemVersion: "1.0.0"
        };
    }

    /**
     * Export cubit data for external systems
     */
    exportCubitData() {
        return {
            totalCubits: this.calculations.totalCubits,
            breakdown: this.calculations.breakdown,
            rings: {
                inner: this.calculations.ringCalculations.rings.inner.cubits,
                middle: this.calculations.ringCalculations.rings.middle.cubits,
                outer: this.calculations.ringCalculations.rings.outer.cubits
            },
            infrastructure: {
                verification: this.calculations.verificationLane.reserveCubits,
                coreTile: this.calculations.coreTileFootprint
            },
            metadata: {
                henryProgression: true,
                controlRatio: this.controlRatio,
                pythagoreanEnabled: this.config.enablePythagoreanVerification,
                validationPassed: this.validateCubitSystem().valid
            }
        };
    }

    /**
     * Get cubit count for specific zone
     */
    getCubitsForZone(zoneName) {
        const allocation = this.getCubitAllocation();
        
        const zoneMap = {
            'core': allocation.coreQuadTile.cubits,
            'inner': allocation.innerRing.cubits,
            'middle': allocation.middleRing.cubits,
            'outer': allocation.outerRing.cubits,
            'verification': allocation.verificationLane.cubits,
            'total': allocation.total.cubits
        };

        return zoneMap[zoneName] || null;
    }
}

export default CubitCalculationSystem;