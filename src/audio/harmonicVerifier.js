/**
 * Solidarity Platform - Harmonic Reference & Verification Module
 * 
 * This module ensures the mathematical integrity of Solidarity's audio processing by providing:
 * - A complete reference table for the first 20 harmonics
 * - Methods to verify harmonic calculations, octave/prime correctness, mathematical series, and cents deviations
 * - Utilities to generate harmonic tables and export as CSV
 */

// Constants for harmonic verification
const CENTS_TOLERANCE = 0.01; // Tolerance for cents deviation verification (in cents)
const FREQUENCY_TOLERANCE = 0.001; // Tolerance for frequency verification (in Hz)
const MATHEMATICAL_HARMONIC_TOLERANCE = 1e-9; // Tolerance for mathematical harmonic series verification

/**
 * Reference data for the first 20 harmonics
 * Each entry includes ratio, interval name, cents deviation from equal temperament,
 * and classification flags (prime, octave, fifth-related)
 */
const HARMONIC_REFERENCE = {
  1: { ratio: "1:1", intervalName: "Unison", centsDeviation: 0, isPrime: false, isOctave: true, isFifthRelated: false },
  2: { ratio: "2:1", intervalName: "Octave", centsDeviation: 0, isPrime: true, isOctave: true, isFifthRelated: false },
  3: { ratio: "3:1", intervalName: "Perfect Fifth (above octave)", centsDeviation: 1.955, isPrime: true, isOctave: false, isFifthRelated: true },
  4: { ratio: "4:1", intervalName: "Octave (2nd octave)", centsDeviation: 0, isPrime: false, isOctave: true, isFifthRelated: false },
  5: { ratio: "5:1", intervalName: "Major Third (above 2nd octave)", centsDeviation: -13.686, isPrime: true, isOctave: false, isFifthRelated: false },
  6: { ratio: "6:1", intervalName: "Perfect Fifth (above 2nd octave)", centsDeviation: 1.955, isPrime: false, isOctave: false, isFifthRelated: true },
  7: { ratio: "7:1", intervalName: "Minor Seventh (above 2nd octave)", centsDeviation: -31.174, isPrime: true, isOctave: false, isFifthRelated: false },
  8: { ratio: "8:1", intervalName: "Octave (3rd octave)", centsDeviation: 0, isPrime: false, isOctave: true, isFifthRelated: false },
  9: { ratio: "9:1", intervalName: "Major Second (above 3rd octave)", centsDeviation: 3.910, isPrime: false, isOctave: false, isFifthRelated: true },
  10: { ratio: "10:1", intervalName: "Major Third (above 3rd octave)", centsDeviation: -13.686, isPrime: false, isOctave: false, isFifthRelated: false },
  11: { ratio: "11:1", intervalName: "Tritone (above 3rd octave)", centsDeviation: -48.682, isPrime: true, isOctave: false, isFifthRelated: false },
  12: { ratio: "12:1", intervalName: "Perfect Fifth (above 3rd octave)", centsDeviation: 1.955, isPrime: false, isOctave: false, isFifthRelated: true },
  13: { ratio: "13:1", intervalName: "Minor Sixth (above 3rd octave)", centsDeviation: 40.528, isPrime: true, isOctave: false, isFifthRelated: false },
  14: { ratio: "14:1", intervalName: "Minor Seventh (above 3rd octave)", centsDeviation: -31.174, isPrime: false, isOctave: false, isFifthRelated: false },
  15: { ratio: "15:1", intervalName: "Major Seventh (above 3rd octave)", centsDeviation: -11.731, isPrime: false, isOctave: false, isFifthRelated: true },
  16: { ratio: "16:1", intervalName: "Octave (4th octave)", centsDeviation: 0, isPrime: false, isOctave: true, isFifthRelated: false },
  17: { ratio: "17:1", intervalName: "Minor Second (above 4th octave)", centsDeviation: 104.955, isPrime: true, isOctave: false, isFifthRelated: false },
  18: { ratio: "18:1", intervalName: "Major Second (above 4th octave)", centsDeviation: 3.910, isPrime: false, isOctave: false, isFifthRelated: true },
  19: { ratio: "19:1", intervalName: "Minor Third (above 4th octave)", centsDeviation: 297.513, isPrime: true, isOctave: false, isFifthRelated: false },
  20: { ratio: "20:1", intervalName: "Major Third (above 4th octave)", centsDeviation: -13.686, isPrime: false, isOctave: false, isFifthRelated: false }
};

// Known values of the mathematical harmonic series for verification
const KNOWN_HARMONIC_SERIES = {
  10: 2.9289682539682538,
  100: 5.1873775176396206,
  1000: 7.485470860550343,
  10000: 9.787606036044348
};

/**
 * Harmonic Reference Verifier Class
 * Provides methods for verifying harmonic calculations and system integrity
 */
class HarmonicReferenceVerifier {
  /**
   * Calculate the frequency of a harmonic based on a fundamental frequency
   * @param {number} fundamental - Fundamental frequency in Hz
   * @param {number} n - Harmonic number
   * @returns {number} - Frequency of the nth harmonic in Hz
   */
  calculateHarmonicFrequency(fundamental, n) {
    return fundamental * n;
  }
  
  /**
   * Calculate the value of the mathematical harmonic number (sum of 1/k from k=1 to n)
   * @param {number} n - Upper limit of the summation
   * @returns {number} - Value of the nth mathematical harmonic number
   */
  calculateMathematicalHarmonicNumber(n) {
    let sum = 0;
    for (let k = 1; k <= n; k++) {
      sum += 1 / k;
    }
    return sum;
  }
  
  /**
   * Calculate cents deviation from equal temperament for a given frequency ratio
   * @param {string|number} ratio - Ratio as string "n:m" or as a number
   * @returns {number} - Cents deviation
   */
  calculateCentsDeviation(ratio) {
    let numericRatio;
    
    if (typeof ratio === 'string') {
      const [numerator, denominator] = ratio.split(':').map(Number);
      numericRatio = numerator / denominator;
    } else {
      numericRatio = ratio;
    }
    
    // Convert ratio to cents (1200 * log2(ratio))
    return 1200 * Math.log2(numericRatio);
  }
  
  /**
   * Check if a number is prime
   * @param {number} n - Number to check
   * @returns {boolean} - True if the number is prime
   */
  isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    let i = 5;
    while (i * i <= n) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
      i += 6;
    }
    
    return true;
  }
  
  /**
   * Check if a number is a power of 2 (octave harmonic)
   * @param {number} n - Number to check
   * @returns {boolean} - True if the number is a power of 2
   */
  isOctaveHarmonic(n) {
    return (n & (n - 1)) === 0 && n > 0;
  }
  
  /**
   * Check if a harmonic is fifth-related (related to powers of 3)
   * @param {number} n - Harmonic number
   * @returns {boolean} - True if the harmonic is fifth-related
   */
  isFifthRelated(n) {
    while (n % 2 === 0) {
      n /= 2;
    }
    
    return n % 3 === 0;
  }
  
  /**
   * Verify the fundamental series for a given fundamental frequency
   * @param {number} fundamental - Fundamental frequency in Hz
   * @param {number} maxHarmonic - Maximum harmonic to verify
   * @returns {Object} - Verification results
   */
  verifyFundamentalSeries(fundamental, maxHarmonic = 20) {
    const results = {
      passed: true,
      failures: [],
      totalChecks: maxHarmonic
    };
    
    for (let n = 1; n <= maxHarmonic; n++) {
      const expectedFreq = n * fundamental;
      const actualFreq = this.calculateHarmonicFrequency(fundamental, n);
      const difference = Math.abs(expectedFreq - actualFreq);
      
      if (difference > FREQUENCY_TOLERANCE) {
        results.passed = false;
        results.failures.push({
          harmonic: n,
          expected: expectedFreq,
          actual: actualFreq,
          difference
        });
      }
    }
    
    results.passRate = (results.totalChecks - results.failures.length) / results.totalChecks;
    return results;
  }
  
  /**
   * Verify octave harmonics
   * @param {number} maxHarmonic - Maximum harmonic to verify
   * @returns {Object} - Verification results
   */
  verifyOctaveHarmonics(maxHarmonic = 20) {
    const results = {
      passed: true,
      failures: [],
      checks: []
    };
    
    for (let n = 1; n <= maxHarmonic; n++) {
      const isOctave = this.isOctaveHarmonic(n);
      const referenceIsOctave = HARMONIC_REFERENCE[n]?.isOctave || false;
      
      results.checks.push({
        harmonic: n,
        isOctave,
        referenceIsOctave,
        match: isOctave === referenceIsOctave
      });
      
      if (isOctave !== referenceIsOctave) {
        results.passed = false;
        results.failures.push({
          harmonic: n,
          expected: referenceIsOctave,
          actual: isOctave
        });
      }
    }
    
    results.totalChecks = results.checks.length;
    results.passRate = (results.totalChecks - results.failures.length) / results.totalChecks;
    return results;
  }
  
  /**
   * Verify prime harmonics
   * @param {number} maxHarmonic - Maximum harmonic to verify
   * @returns {Object} - Verification results
   */
  verifyPrimeHarmonics(maxHarmonic = 20) {
    const results = {
      passed: true,
      failures: [],
      checks: []
    };
    
    for (let n = 1; n <= maxHarmonic; n++) {
      const isPrime = this.isPrime(n);
      const referenceIsPrime = HARMONIC_REFERENCE[n]?.isPrime || false;
      
      results.checks.push({
        harmonic: n,
        isPrime,
        referenceIsPrime,
        match: isPrime === referenceIsPrime
      });
      
      if (isPrime !== referenceIsPrime) {
        results.passed = false;
        results.failures.push({
          harmonic: n,
          expected: referenceIsPrime,
          actual: isPrime
        });
      }
    }
    
    results.totalChecks = results.checks.length;
    results.passRate = (results.totalChecks - results.failures.length) / results.totalChecks;
    return results;
  }
  
  /**
   * Verify mathematical harmonic series
   * @returns {Object} - Verification results
   */
  verifyMathematicalHarmonicSeries() {
    const results = {
      passed: true,
      failures: [],
      checks: []
    };
    
    // Check specific known values
    for (const [n, expectedValue] of Object.entries(KNOWN_HARMONIC_SERIES)) {
      const nValue = parseInt(n, 10);
      const actualValue = this.calculateMathematicalHarmonicNumber(nValue);
      const difference = Math.abs(expectedValue - actualValue);
      
      const check = {
        n: nValue,
        expected: expectedValue,
        actual: actualValue,
        difference,
        passed: difference <= MATHEMATICAL_HARMONIC_TOLERANCE
      };
      
      results.checks.push(check);
      
      if (!check.passed) {
        results.passed = false;
        results.failures.push(check);
      }
    }
    
    results.totalChecks = results.checks.length;
    results.passRate = (results.totalChecks - results.failures.length) / results.totalChecks;
    return results;
  }
  
  /**
   * Verify cents deviations for key harmonics
   * @returns {Object} - Verification results
   */
  verifyCentsDeviations() {
    const results = {
      passed: true,
      failures: [],
      checks: []
    };
    
    // Key harmonics to check (those with non-zero cents deviation)
    const keyHarmonics = [3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    for (const n of keyHarmonics) {
      const reference = HARMONIC_REFERENCE[n];
      if (!reference) continue;
      
      const ratio = n; // n:1 harmonic ratio
      const actualDeviation = this.calculateCentsDeviation(ratio);
      const expectedDeviation = reference.centsDeviation;
      const difference = Math.abs(expectedDeviation - actualDeviation);
      
      const check = {
        harmonic: n,
        expected: expectedDeviation,
        actual: actualDeviation,
        difference,
        passed: difference <= CENTS_TOLERANCE
      };
      
      results.checks.push(check);
      
      if (!check.passed) {
        results.passed = false;
        results.failures.push(check);
      }
    }
    
    results.totalChecks = results.checks.length;
    results.passRate = (results.totalChecks - results.failures.length) / results.totalChecks;
    return results;
  }
  
  /**
   * Run all verification checks and generate a comprehensive summary
   * @param {number} fundamental - Fundamental frequency in Hz
   * @returns {Object} - Complete verification summary
   */
  runCompleteVerification(fundamental = 440) {
    const summary = {
      fundamental,
      tests: {
        fundamentalSeries: this.verifyFundamentalSeries(fundamental),
        octaveHarmonics: this.verifyOctaveHarmonics(),
        primeHarmonics: this.verifyPrimeHarmonics(),
        mathematicalHarmonicSeries: this.verifyMathematicalHarmonicSeries(),
        centsDeviations: this.verifyCentsDeviations()
      }
    };
    
    // Calculate overall integrity score (weighted average of pass rates)
    const weights = {
      fundamentalSeries: 0.3,
      octaveHarmonics: 0.2,
      primeHarmonics: 0.15,
      mathematicalHarmonicSeries: 0.15,
      centsDeviations: 0.2
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [testName, result] of Object.entries(summary.tests)) {
      const weight = weights[testName] || 0;
      weightedSum += result.passRate * weight;
      totalWeight += weight;
    }
    
    summary.integrityScore = weightedSum / totalWeight;
    
    // Determine system status based on integrity score
    if (summary.integrityScore >= 0.99) {
      summary.systemStatus = 'SECURE';
    } else if (summary.integrityScore >= 0.95) {
      summary.systemStatus = 'WARNING';
    } else {
      summary.systemStatus = 'COMPROMISED';
    }
    
    return summary;
  }
  
  /**
   * Generate a harmonic table for a given fundamental frequency
   * @param {number} fundamental - Fundamental frequency in Hz
   * @param {number} maxHarmonic - Maximum harmonic to generate
   * @returns {Object} - Harmonic table
   */
  generateHarmonicTable(fundamental, maxHarmonic = 20) {
    const table = {};
    
    for (let n = 1; n <= maxHarmonic; n++) {
      const frequency = this.calculateHarmonicFrequency(fundamental, n);
      const ratio = `${n}:1`;
      const referenceData = HARMONIC_REFERENCE[n] || {};
      
      table[n] = {
        harmonic: n,
        frequency,
        ratio,
        intervalName: referenceData.intervalName || `Harmonic ${n}`,
        centsDeviation: referenceData.centsDeviation || this.calculateCentsDeviation(n),
        isPrime: referenceData.isPrime !== undefined ? referenceData.isPrime : this.isPrime(n),
        isOctave: referenceData.isOctave !== undefined ? referenceData.isOctave : this.isOctaveHarmonic(n),
        isFifthRelated: referenceData.isFifthRelated !== undefined ? referenceData.isFifthRelated : this.isFifthRelated(n)
      };
    }
    
    return table;
  }
  
  /**
   * Export harmonic table as CSV
   * @param {number} fundamental - Fundamental frequency in Hz
   * @param {number} maxHarmonic - Maximum harmonic to include
   * @returns {string} - CSV string
   */
  exportAsCSV(fundamental, maxHarmonic = 20) {
    const table = this.generateHarmonicTable(fundamental, maxHarmonic);
    
    // CSV header
    let csv = 'Harmonic,Frequency,Ratio,Interval Name,Cents Deviation,Is Prime,Is Octave,Is Fifth Related\n';
    
    // Add rows
    for (let n = 1; n <= maxHarmonic; n++) {
      const row = table[n];
      csv += `${row.harmonic},${row.frequency.toFixed(3)},${row.ratio},"${row.intervalName}",${row.centsDeviation.toFixed(3)},${row.isPrime},${row.isOctave},${row.isFifthRelated}\n`;
    }
    
    return csv;
  }
}

// Create singleton instance
const harmonicVerifier = new HarmonicReferenceVerifier();

module.exports = {
  harmonicVerifier,
  HARMONIC_REFERENCE
};