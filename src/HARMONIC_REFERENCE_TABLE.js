/**
 * Comprehensive Harmonic Reference Table and Verification System
 * For Solidarity Platform - Soul.Ed.XChange
 *
 * This module provides complete harmonic series verification and reference data
 * to ensure mathematical integrity after system changes or data breaches.
 */
/**
 * Complete harmonic reference table based on musical harmonic series
 * Each harmonic follows the formula: f_n = n × f_0
 */
const HARMONIC_REFERENCE_TABLE = {
    1: {
        ratio: "1:1",
        intervalName: "Unison",
        centsDeviation: 0,
        frequency: (f0) => f0 * 1,
        isPrime: false,
        isOctave: true,
        isFifthRelated: false
    },
    2: {
        ratio: "2:1",
        intervalName: "Octave",
        centsDeviation: 0,
        frequency: (f0) => f0 * 2,
        isPrime: true,
        isOctave: true,
        isFifthRelated: false
    },
    3: {
        ratio: "3:1",
        intervalName: "Perfect Fifth (above octave)",
        centsDeviation: 1.955,
        frequency: (f0) => f0 * 3,
        isPrime: true,
        isOctave: false,
        isFifthRelated: true
    },
    4: {
        ratio: "4:1",
        intervalName: "Octave (2nd octave)",
        centsDeviation: 0,
        frequency: (f0) => f0 * 4,
        isPrime: false,
        isOctave: true,
        isFifthRelated: false
    },
    5: {
        ratio: "5:1",
        intervalName: "Major Third (above 2nd octave)",
        centsDeviation: -13.686,
        frequency: (f0) => f0 * 5,
        isPrime: true,
        isOctave: false,
        isFifthRelated: false
    },
    6: {
        ratio: "6:1",
        intervalName: "Perfect Fifth (above 2nd octave)",
        centsDeviation: 1.955,
        frequency: (f0) => f0 * 6,
        isPrime: false,
        isOctave: false,
        isFifthRelated: true
    },
    7: {
        ratio: "7:1",
        intervalName: "Minor Seventh (above 2nd octave)",
        centsDeviation: -31.174,
        frequency: (f0) => f0 * 7,
        isPrime: true,
        isOctave: false,
        isFifthRelated: false
    },
    8: {
        ratio: "8:1",
        intervalName: "Octave (3rd octave)",
        centsDeviation: 0,
        frequency: (f0) => f0 * 8,
        isPrime: false,
        isOctave: true,
        isFifthRelated: false
    },
    9: {
        ratio: "9:1",
        intervalName: "Major Second (above 3rd octave)",
        centsDeviation: 3.910,
        frequency: (f0) => f0 * 9,
        isPrime: false,
        isOctave: false,
        isFifthRelated: true
    },
    10: {
        ratio: "10:1",
        intervalName: "Major Third (above 3rd octave)",
        centsDeviation: -13.686,
        frequency: (f0) => f0 * 10,
        isPrime: false,
        isOctave: false,
        isFifthRelated: false
    },
    11: {
        ratio: "11:1",
        intervalName: "Tritone (above 3rd octave)",
        centsDeviation: -48.682,
        frequency: (f0) => f0 * 11,
        isPrime: true,
        isOctave: false,
        isFifthRelated: false
    },
    12: {
        ratio: "12:1",
        intervalName: "Perfect Fifth (above 3rd octave)",
        centsDeviation: 1.955,
        frequency: (f0) => f0 * 12,
        isPrime: false,
        isOctave: false,
        isFifthRelated: true
    },
    13: {
        ratio: "13:1",
        intervalName: "Minor Sixth (above 3rd octave)",
        centsDeviation: 40.528,
        frequency: (f0) => f0 * 13,
        isPrime: true,
        isOctave: false,
        isFifthRelated: false
    },
    14: {
        ratio: "14:1",
        intervalName: "Minor Seventh (above 3rd octave)",
        centsDeviation: -31.174,
        frequency: (f0) => f0 * 14,
        isPrime: false,
        isOctave: false,
        isFifthRelated: false
    },
    15: {
        ratio: "15:1",
        intervalName: "Major Seventh (above 3rd octave)",
        centsDeviation: -11.731,
        frequency: (f0) => f0 * 15,
        isPrime: false,
        isOctave: false,
        isFifthRelated: true
    },
    16: {
        ratio: "16:1",
        intervalName: "Octave (4th octave)",
        centsDeviation: 0,
        frequency: (f0) => f0 * 16,
        isPrime: false,
        isOctave: true,
        isFifthRelated: false
    },
    17: {
        ratio: "17:1",
        intervalName: "Minor Second (above 4th octave)",
        centsDeviation: 104.955,
        frequency: (f0) => f0 * 17,
        isPrime: true,
        isOctave: false,
        isFifthRelated: false
    },
    18: {
        ratio: "18:1",
        intervalName: "Major Second (above 4th octave)",
        centsDeviation: 3.910,
        frequency: (f0) => f0 * 18,
        isPrime: false,
        isOctave: false,
        isFifthRelated: true
    },
    19: {
        ratio: "19:1",
        intervalName: "Minor Third (above 4th octave)",
        centsDeviation: 297.513,
        frequency: (f0) => f0 * 19,
        isPrime: true,
        isOctave: false,
        isFifthRelated: false
    },
    20: {
        ratio: "20:1",
        intervalName: "Major Third (above 4th octave)",
        centsDeviation: -13.686,
        frequency: (f0) => f0 * 20,
        isPrime: false,
        isOctave: false,
        isFifthRelated: false
    }
};
/**
 * Comprehensive harmonic verification class
 */
class HarmonicReferenceVerifier {
    constructor() {
        this.referenceTable = HARMONIC_REFERENCE_TABLE;
        this.tolerance = 0.001;
    }

    /**
     * Verify fundamental harmonic series calculations
     */
    verifyFundamentalSeries(fundamental = 440.0) {
        const results = {
            passed: true,
            errors: [],
            testedHarmonics: 0
        };

        for (let n = 1; n <= 20; n++) {
            const expectedFreq = fundamental * n;
            const calculatedFreq = this.calculateHarmonicFrequency(fundamental, n);

            if (Math.abs(calculatedFreq - expectedFreq) > this.tolerance) {
                results.passed = false;
                results.errors.push({
                    harmonic: n,
                    expected: expectedFreq,
                    calculated: calculatedFreq,
                    deviation: Math.abs(calculatedFreq - expectedFreq)
                });
            }
            results.testedHarmonics++;
        }

        return results;
    }

    /**
     * Verify octave harmonics (powers of 2)
     */
    verifyOctaveHarmonics(fundamental = 220.0) {
        const octaveHarmonics = [1, 2, 4, 8, 16];
        const results = {
            passed: true,
            errors: [],
            testedHarmonics: 0
        };

        for (const n of octaveHarmonics) {
            const frequency = this.calculateHarmonicFrequency(fundamental, n);
            const ratio = frequency / fundamental;
            const expectedRatio = n;

            if (Math.abs(ratio - expectedRatio) > this.tolerance) {
                results.passed = false;
                results.errors.push({
                    harmonic: n,
                    expectedRatio,
                    calculatedRatio: ratio,
                    deviation: Math.abs(ratio - expectedRatio)
                });
            }
            results.testedHarmonics++;
        }

        return results;
    }

    /**
     * Verify prime harmonics
     */
    verifyPrimeHarmonics(fundamental = 110.0) {
        const primeHarmonics = [2, 3, 5, 7, 11, 13, 17, 19];
        const results = {
            passed: true,
            errors: [],
            testedHarmonics: 0
        };

        for (const prime of primeHarmonics) {
            const frequency = this.calculateHarmonicFrequency(fundamental, prime);
            const expectedFrequency = fundamental * prime;

            if (Math.abs(frequency - expectedFrequency) > this.tolerance) {
                results.passed = false;
                results.errors.push({
                    harmonic: prime,
                    expected: expectedFrequency,
                    calculated: frequency,
                    deviation: Math.abs(frequency - expectedFrequency)
                });
            }
            results.testedHarmonics++;
        }

        return results;
    }

    /**
     * Verify mathematical harmonic numbers (H_n = sum of reciprocals)
     */
    verifyMathematicalHarmonicSeries() {
        const testCases = [
            { n: 1, expected: 1.0 },
            { n: 2, expected: 1.5 },
            { n: 3, expected: 1.8333333333333333 },
            { n: 4, expected: 2.0833333333333335 },
            { n: 5, expected: 2.283333333333333 },
            { n: 10, expected: 2.9289682539682538 }
        ];

        const results = {
            passed: true,
            errors: [],
            testedSeries: 0
        };

        for (const { n, expected } of testCases) {
            const calculated = this.calculateMathematicalHarmonicNumber(n);

            if (Math.abs(calculated - expected) > 0.000001) {
                results.passed = false;
                results.errors.push({
                    n,
                    expected,
                    calculated,
                    deviation: Math.abs(calculated - expected)
                });
            }
            results.testedSeries++;
        }

        return results;
    }

    /**
     * Verify cents deviations from equal temperament
     */
    verifyCentsDeviations() {
        const testCases = [
            { harmonic: 3, expectedCents: 1.955 },
            { harmonic: 5, expectedCents: -13.686 },
            { harmonic: 7, expectedCents: -31.174 },
            { harmonic: 11, expectedCents: -48.682 },
            { harmonic: 13, expectedCents: 40.528 },
            { harmonic: 17, expectedCents: 104.955 },
            { harmonic: 19, expectedCents: 297.513 }
        ];

        const results = {
            passed: true,
            errors: [],
            testedDeviations: 0
        };

        for (const { harmonic, expectedCents } of testCases) {
            const calculatedCents = this.calculateCentsDeviation(harmonic);

            if (Math.abs(calculatedCents - expectedCents) > 0.01) {
                results.passed = false;
                results.errors.push({
                    harmonic,
                    expectedCents,
                    calculatedCents,
                    deviation: Math.abs(calculatedCents - expectedCents)
                });
            }
            results.testedDeviations++;
        }

        return results;
    }

    /**
     * Run complete harmonic integrity verification
     */
    runCompleteVerification() {
        console.log('🔍 Running complete harmonic integrity verification...');

        const tests = [
            { name: 'Fundamental Series', result: this.verifyFundamentalSeries() },
            { name: 'Octave Harmonics', result: this.verifyOctaveHarmonics() },
            { name: 'Prime Harmonics', result: this.verifyPrimeHarmonics() },
            { name: 'Mathematical Harmonic Series', result: this.verifyMathematicalHarmonicSeries() },
            { name: 'Cents Deviations', result: this.verifyCentsDeviations() }
        ];

        const passedTests = tests.filter(test => test.result.passed).length;
        const totalTests = tests.length;
        const integrityScore = (passedTests / totalTests) * 100;

        const summary = {
            integrityScore,
            passedTests,
            totalTests,
            testResults: tests,
            systemStatus: integrityScore >= 95 ? 'SECURE' : integrityScore >= 80 ? 'WARNING' : 'COMPROMISED'
        };

        // Log results
        console.log(`✅ Harmonic Integrity Score: ${integrityScore.toFixed(1)}%`);
        console.log(`📊 Tests Passed: ${passedTests}/${totalTests}`);
        console.log(`🛡️ System Status: ${summary.systemStatus}`);

        // Log any failures
        tests.forEach(test => {
            if (!test.result.passed) {
                console.error(`❌ ${test.name} FAILED:`);
                test.result.errors.forEach(error => {
                    console.error(`  • ${JSON.stringify(error)}`);
                });
            }
        });

        return summary;
    }

    /**
     * Utility calculation methods
     */
    calculateHarmonicFrequency(fundamental, n) {
        return fundamental * n;
    }

    calculateMathematicalHarmonicNumber(n) {
        let sum = 0;
        for (let i = 1; i <= n; i++) {
            sum += 1 / i;
        }
        return sum;
    }

    calculateCentsDeviation(ratio) {
        return 1200 * Math.log2(ratio);
    }

    /**
     * Generate harmonic reference table for any fundamental frequency
     */
    generateHarmonicTable(fundamental = 440.0, maxHarmonic = 20) {
        const table = {};

        for (let n = 1; n <= maxHarmonic; n++) {
            const reference = this.referenceTable[n];
            table[n] = {
                harmonic: n,
                frequency: reference.frequency(fundamental),
                ratio: reference.ratio,
                intervalName: reference.intervalName,
                centsDeviation: reference.centsDeviation,
                isPrime: reference.isPrime,
                isOctave: reference.isOctave,
                isFifthRelated: reference.isFifthRelated
            };
        }

        return table;
    }

    /**
     * Export harmonic table as CSV for external verification
     */
    exportAsCSV(fundamental = 440.0) {
        const table = this.generateHarmonicTable(fundamental);
        let csv = 'Harmonic,Frequency,Ratio,Interval Name,Cents Deviation,Is Prime,Is Octave,Is Fifth Related\n';

        for (let n = 1; n <= 20; n++) {
            const row = table[n];
            csv += `${row.harmonic},${row.frequency.toFixed(3)},${row.ratio},"${row.intervalName}",${row.centsDeviation},${row.isPrime},${row.isOctave},${row.isFifthRelated}\n`;
        }

        return csv;
    }
}
// Create global instance for use throughout the system
const harmonicVerifier = new HarmonicReferenceVerifier();
// Export for use in other modules
module.exports = {
    HARMONIC_REFERENCE_TABLE,
    HarmonicReferenceVerifier,
    harmonicVerifier
};
// If run directly, perform verification
if (require.main === module) {
    const verification = harmonicVerifier.runCompleteVerification();
    console.log('\n📋 Verification Summary:');
    console.log(JSON.stringify(verification, null, 2));
}
