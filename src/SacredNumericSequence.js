/**
 * Sacred Numeric Sequence System
 * Core mathematical foundation for the Solidarity Platform
 * 
 * @author Scott Charles Olson (Charly)
 * @platform Soul.Ed.Xchange.Fi
 * @version 3.2.1
 */

const { SolidarityHarmonicGenerator } = require('./core/EnhancedHarmonicPhraseParser');

class SacredNumericSequence {
    constructor(config = {}) {
        this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio (φ)
        this.baseFrequency = config.baseFrequency || 432; // Natural tuning base frequency
        this.harmonicGenerator = new SolidarityHarmonicGenerator();
        this.sequences = new Map();
        this.cachedResults = new Map();
        
        // Initialize base sequences
        this._initializeSequences();
        console.log("🔢 Sacred Numeric Sequence System initialized");
    }

    /**
     * Initialize the core numeric sequences
     * @private
     */
    _initializeSequences() {
        // Fibonacci sequence (first 21 elements)
        this.sequences.set('fibonacci', [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765]);
        
        // Lucas sequence (first 16 elements)
        this.sequences.set('lucas', [2, 1, 3, 4, 7, 11, 18, 29, 47, 76, 123, 199, 322, 521, 843, 1364]);
        
        // Prime numbers sequence (first 21 primes)
        this.sequences.set('prime', [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73]);
        
        // Perfect numbers (first 4)
        this.sequences.set('perfect', [6, 28, 496, 8128]);
        
        // Solidarity node sequence
        this.sequences.set('solidarity_nodes', [1, 3, 4, 7, 14, 21]);
        
        // Sacred harmonic ratios
        this.sequences.set('sacred_ratios', [1/1, 2/1, 3/2, 4/3, 5/4, 6/5, 7/6, 8/7, 9/8, 10/9]);
    }

    /**
     * Generate a Fibonacci sequence to a specific length
     * @param {number} length - Number of elements to generate
     * @returns {number[]} - Fibonacci sequence
     */
    generateFibonacciSequence(length) {
        if (length <= 0) return [];
        if (length === 1) return [0];
        
        const fib = [0, 1];
        for (let i = 2; i < length; i++) {
            fib.push(fib[i-1] + fib[i-2]);
        }
        return fib;
    }

    /**
     * Calculate the golden ratio approximation from a sequence
     * @param {number[]} sequence - Number sequence to analyze
     * @param {number} startIndex - Starting index for ratio calculation
     * @returns {number} - Golden ratio approximation
     */
    calculateGoldenRatioApproximation(sequence, startIndex = 10) {
        if (!Array.isArray(sequence) || sequence.length <= startIndex + 1) {
            throw new Error('Sequence too short for golden ratio approximation');
        }
        
        // Calculate ratio of consecutive terms (converges to phi)
        const index = Math.min(startIndex, sequence.length - 2);
        return sequence[index + 1] / sequence[index];
    }

    /**
     * Get a specific numeric sequence
     * @param {string} sequenceName - Name of the sequence
     * @param {number} length - Optional length limit
     * @returns {number[]} - The requested sequence
     */
    getSequence(sequenceName, length = undefined) {
        const sequence = this.sequences.get(sequenceName.toLowerCase());
        if (!sequence) {
            throw new Error(`Unknown sequence: ${sequenceName}`);
        }
        
        return length ? sequence.slice(0, length) : [...sequence];
    }

    /**
     * Apply Sacred Numeric pattern to generate harmonic frequencies
     * @param {string} sequenceName - Base sequence to use
     * @param {number} nodeId - Solidarity node ID (1, 3, 4, 7, 14, 21)
     * @returns {Object} - Generated harmonic frequencies
     */
    generateHarmonicFrequencies(sequenceName, nodeId) {
        const cacheKey = `${sequenceName}_${nodeId}`;
        
        // Return cached result if available
        if (this.cachedResults.has(cacheKey)) {
            return this.cachedResults.get(cacheKey);
        }
        
        // Get the sequence
        const sequence = this.getSequence(sequenceName);
        if (!sequence) {
            throw new Error(`Unknown sequence: ${sequenceName}`);
        }
        
        // Validate node ID
        const validNodes = this.sequences.get('solidarity_nodes');
        if (!validNodes.includes(nodeId)) {
            throw new Error(`Invalid node ID: ${nodeId}. Valid nodes: ${validNodes.join(', ')}`);
        }
        
        // Generate base harmonics for the node
        const nodeHarmonics = this.harmonicGenerator.generateNodeHarmonics(nodeId);
        
        // Apply sequence transformation to the harmonics
        const transformedFrequencies = {
            fundamental: nodeHarmonics.fundamental * (this.phi / nodeId),
            golden_ratios: [],
            node_specific: []
        };
        
        // Generate golden ratio modulated frequencies
        transformedFrequencies.golden_ratios = sequence.slice(0, 7).map(num => 
            transformedFrequencies.fundamental * (num / sequence[sequence.length - 1]) * this.phi
        );
        
        // Generate node-specific frequencies
        transformedFrequencies.node_specific = sequence
            .filter(num => num % nodeId === 0) // Numbers divisible by nodeId
            .map(num => transformedFrequencies.fundamental * (num / nodeId));
        
        // Cache the result
        this.cachedResults.set(cacheKey, transformedFrequencies);
        
        return transformedFrequencies;
    }

    /**
     * Calculate the Sacred Convergence Point - where multiple sequences align
     * @param {string[]} sequenceNames - Names of sequences to analyze
     * @returns {Object} - Convergence point data
     */
    calculateConvergencePoint(sequenceNames) {
        if (!Array.isArray(sequenceNames) || sequenceNames.length < 2) {
            throw new Error('Need at least two sequences to find convergence');
        }
        
        const sequences = sequenceNames.map(name => this.getSequence(name));
        
        // Find numbers that appear in all sequences
        const convergencePoints = sequences[0].filter(num => 
            sequences.every(seq => seq.includes(num))
        );
        
        // Calculate phi-based weights for convergence points
        const convergenceData = convergencePoints.map(point => {
            const positions = sequences.map(seq => seq.indexOf(point));
            const averagePosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
            const phiWeight = point * this.phi / averagePosition;
            
            return {
                value: point,
                positions,
                average_position: averagePosition,
                phi_weight: phiWeight
            };
        });
        
        return {
            points: convergencePoints,
            detailed: convergenceData,
            primary_convergence: convergenceData.length > 0 ? 
                convergenceData.reduce((prev, curr) => 
                    prev.phi_weight > curr.phi_weight ? prev : curr
                ) : null
        };
    }

    /**
     * Apply the Sacred Numeric Sequence to an audio signal
     * @param {number[]} signal - Audio signal
     * @param {string} sequenceName - Sequence to apply
     * @param {number} nodeId - Solidarity node ID
     * @returns {number[]} - Processed signal
     */
    applyToAudioSignal(signal, sequenceName, nodeId) {
        const harmonics = this.generateHarmonicFrequencies(sequenceName, nodeId);
        
        // Apply frequency modulation based on the sacred sequence
        return signal.map((sample, index) => {
            const modIndex = index % harmonics.golden_ratios.length;
            const modFactor = harmonics.golden_ratios[modIndex] / harmonics.fundamental;
            return sample * modFactor;
        });
    }

    /**
     * Get numerical metadata values for use in blockchain transactions
     * @param {string} sequenceName - Sequence to use
     * @param {number} transactionValue - Value of transaction
     * @returns {Object} - Metadata for the transaction
     */
    getBlockchainMetadata(sequenceName, transactionValue) {
        const sequence = this.getSequence(sequenceName);
        
        // Find closest value in sequence to transaction value
        const closestValue = sequence.reduce((prev, curr) => 
            Math.abs(curr - transactionValue) < Math.abs(prev - transactionValue) ? curr : prev
        );
        
        // Calculate φ-based verification hash seed
        const hashSeed = (closestValue * this.phi) % 1;
        
        return {
            sequence_name: sequenceName,
            closest_sacred_value: closestValue,
            verification_seed: hashSeed,
            phi_alignment: Math.abs(closestValue / transactionValue - this.phi) < 0.1
        };
    }

    /**
     * Generate a structured report of all sequence properties
     * @returns {Object} - Comprehensive sequence analysis
     */
    generateSequenceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            phi_value: this.phi,
            base_frequency: this.baseFrequency,
            sequences: {}
        };
        
        // Analyze each sequence
        for (const [name, sequence] of this.sequences.entries()) {
            // Skip ratio sequences
            if (name === 'sacred_ratios') continue;
            
            // Calculate metrics
            const sum = sequence.reduce((a, b) => a + b, 0);
            const avg = sum / sequence.length;
            let goldenRatio = null;
            
            try {
                goldenRatio = this.calculateGoldenRatioApproximation(sequence);
            } catch (e) {
                goldenRatio = null;
            }
            
            report.sequences[name] = {
                values: sequence,
                length: sequence.length,
                sum: sum,
                average: avg,
                phi_approximation: goldenRatio,
                phi_deviation: goldenRatio ? Math.abs(goldenRatio - this.phi) : null
            };
        }
        
        return report;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SacredNumericSequence };
}

// Demo usage if run directly
if (require.main === module) {
    const sns = new SacredNumericSequence();
    
    console.log("📊 Sacred Numeric Sequence Demo");
    console.log("=" + "=".repeat(50));
    
    // Show Fibonacci sequence
    console.log("\n🔢 Fibonacci Sequence (first 10):");
    console.log(sns.getSequence('fibonacci', 10));
    
    // Calculate Golden Ratio approximation
    const fibSequence = sns.getSequence('fibonacci');
    const phiApprox = sns.calculateGoldenRatioApproximation(fibSequence);
    console.log(`\n🌟 Golden Ratio (φ) approximation: ${phiApprox}`);
    console.log(`Actual φ: ${sns.phi}`);
    console.log(`Deviation: ${Math.abs(phiApprox - sns.phi)}`);
    
    // Generate harmonic frequencies for node 7
    console.log("\n🎵 Harmonic Frequencies for Node 7 using Fibonacci:");
    const harmonics = sns.generateHarmonicFrequencies('fibonacci', 7);
    console.log(`Fundamental: ${harmonics.fundamental.toFixed(2)}Hz`);
    console.log(`Golden ratio harmonics: ${harmonics.golden_ratios.map(h => h.toFixed(1)).join(', ')}`);
    console.log(`Node-specific harmonics: ${harmonics.node_specific.map(h => h.toFixed(1)).join(', ')}`);
    
    // Find convergence points
    console.log("\n🔄 Convergence Points between Fibonacci, Lucas, and Prime sequences:");
    const convergence = sns.calculateConvergencePoint(['fibonacci', 'lucas', 'prime']);
    console.log(`Points: ${convergence.points}`);
    if (convergence.primary_convergence) {
        console.log(`Primary convergence value: ${convergence.primary_convergence.value}`);
        console.log(`φ weight: ${convergence.primary_convergence.phi_weight.toFixed(4)}`);
    }
    
    // Blockchain metadata example
    console.log("\n⛓️ Blockchain Metadata Example for transaction value 144:");
    const metadata = sns.getBlockchainMetadata('fibonacci', 144);
    console.log(metadata);
}