/**
 * FOIL Harmonic System
 * Algebraic transformation system based on First, Outer, Inner, Last methodology
 * integrated with sacred numeric sequences.
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange
 * @version 1.0.0
 */

const { SacredNumericSequence } = require('./SacredNumericSequence');
const fs = require('fs');
const path = require('path');

class FOILHarmonic {
    constructor(config = {}) {
        this.config = {
            polynomialOrder: config.polynomialOrder || 2, // Default to binomial expressions
            transformationMode: config.transformationMode || 'standard', // standard, inverse, recursive
            normalizeOutput: config.normalizeOutput !== undefined ? config.normalizeOutput : true,
            solidarityNode: config.solidarityNode || 3, // Node 3 for algebraic operations
            goldenWeighting: config.goldenWeighting !== undefined ? config.goldenWeighting : true,
            logLevel: config.logLevel || 'info'
        };
        
        this.sacredSequence = new SacredNumericSequence();
        this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio (φ)
        this.phiInverse = 1 / this.phi;    // Golden ratio inverse
        
        // Initialize transformation matrices
        this.matrices = {
            standard: this._initializeMatrix(),
            inverse: this._initializeInverseMatrix(),
            recursive: this._initializeRecursiveMatrix()
        };
        
        this.polynomialCache = new Map();
        
        console.log("🧮 FOIL Harmonic System initialized");
        console.log(`   Polynomial Order: ${this.config.polynomialOrder}`);
        console.log(`   Transformation Mode: ${this.config.transformationMode}`);
        console.log(`   Golden Weighting: ${this.config.goldenWeighting ? 'Enabled' : 'Disabled'}`);
        console.log(`   Solidarity Node: ${this.config.solidarityNode}`);
    }
    
    /**
     * Initialize standard transformation matrix based on sacred sequence
     * @returns {Array} Transformation matrix
     * @private
     */
    _initializeMatrix() {
        const order = this.config.polynomialOrder;
        const nodeId = this.config.solidarityNode;
        
        // Generate sequence from sacred numeric sequence
        const fibSequence = this.sacredSequence.getSequence('fibonacci', order * order + 5);
        const lucasSequence = this.sacredSequence.getSequence('lucas', order * order + 5);
        
        // Initialize matrix with dimensions [order+1, order+1]
        const matrix = Array(order + 1).fill().map(() => Array(order + 1).fill(0));
        
        // Fill matrix with sequence values
        for (let i = 0; i <= order; i++) {
            for (let j = 0; j <= order; j++) {
                const index = i * (order + 1) + j;
                
                // Apply golden weighting using the node ID
                if (this.config.goldenWeighting) {
                    const nodeOffset = (nodeId % 5) + 1;
                    const weight = (i + j) % 2 === 0 ? 
                        this.phi / nodeOffset : 
                        this.phiInverse * nodeOffset;
                        
                    matrix[i][j] = fibSequence[index % fibSequence.length] * weight;
                } else {
                    matrix[i][j] = fibSequence[index % fibSequence.length];
                }
                
                // For diagonal elements, add Lucas sequence contribution
                if (i === j) {
                    matrix[i][j] += lucasSequence[index % lucasSequence.length] * this.phiInverse;
                }
            }
        }
        
        return matrix;
    }
    
    /**
     * Initialize inverse transformation matrix
     * @returns {Array} Inverse transformation matrix
     * @private
     */
    _initializeInverseMatrix() {
        const standardMatrix = this.matrices.standard || this._initializeMatrix();
        const order = this.config.polynomialOrder;
        
        // Create a copy of the standard matrix
        const inverseMatrix = Array(order + 1).fill().map((_, i) => 
            Array(order + 1).fill().map((_, j) => standardMatrix[i][j])
        );
        
        // Simple matrix inversion using sacred sequence properties
        for (let i = 0; i <= order; i++) {
            for (let j = 0; j <= order; j++) {
                if (i === j) {
                    // Diagonal elements
                    inverseMatrix[i][j] = 1 / standardMatrix[i][j];
                } else {
                    // Off-diagonal elements
                    inverseMatrix[i][j] = -standardMatrix[i][j] / 
                        (standardMatrix[i][i] * standardMatrix[j][j]);
                }
                
                // Apply golden ratio adjustment
                if (this.config.goldenWeighting) {
                    inverseMatrix[i][j] *= (i + j) % 2 === 0 ? 
                        this.phiInverse : this.phi;
                }
            }
        }
        
        return inverseMatrix;
    }
    
    /**
     * Initialize recursive transformation matrix
     * @returns {Array} Recursive transformation matrix
     * @private
     */
    _initializeRecursiveMatrix() {
        const order = this.config.polynomialOrder;
        const nodeId = this.config.solidarityNode;
        
        // Generate sequences
        const fibSequence = this.sacredSequence.getSequence('fibonacci', order * order + 5);
        const lucasSequence = this.sacredSequence.getSequence('lucas', order * order + 5);
        const primeSequence = this.sacredSequence.getSequence('prime', order * order + 5);
        
        // Initialize matrix with dimensions [order+1, order+1]
        const matrix = Array(order + 1).fill().map(() => Array(order + 1).fill(0));
        
        // Fill matrix with recursive pattern
        for (let i = 0; i <= order; i++) {
            for (let j = 0; j <= order; j++) {
                const fibIdx = (i + j) % fibSequence.length;
                const lucIdx = (i * j) % lucasSequence.length;
                const primeIdx = Math.abs(i - j) % primeSequence.length;
                
                // Combine sequences with golden ratio weighting
                if (this.config.goldenWeighting) {
                    matrix[i][j] = (
                        fibSequence[fibIdx] * this.phi +
                        lucasSequence[lucIdx] * this.phiInverse +
                        primeSequence[primeIdx] * (this.phi - 1)
                    ) / (this.phi * 2);
                } else {
                    matrix[i][j] = (
                        fibSequence[fibIdx] +
                        lucasSequence[lucIdx] +
                        primeSequence[primeIdx]
                    ) / 3;
                }
                
                // Apply node-specific adjustment
                matrix[i][j] *= (nodeId / (nodeId + (i * j + 1)));
            }
        }
        
        return matrix;
    }
    
    /**
     * Generate polynomial expansion using FOIL method
     * @param {Array} terms - Array of terms for expansion
     * @returns {Object} Expanded polynomial
     */
    expandPolynomial(terms) {
        console.log(`🧮 Expanding polynomial with ${terms.length} terms...`);
        
        if (!terms || !Array.isArray(terms) || terms.length < 2) {
            throw new Error('At least two terms required for polynomial expansion');
        }
        
        // Check if result is in cache
        const cacheKey = terms.join(',') + this.config.transformationMode;
        if (this.polynomialCache.has(cacheKey)) {
            return this.polynomialCache.get(cacheKey);
        }
        
        // Limit to the configured polynomial order
        const limitedTerms = terms.slice(0, this.config.polynomialOrder + 1);
        
        // Generate expansion using FOIL method with sacred sequence integration
        const expansion = this._generateFOILExpansion(limitedTerms);
        
        // Apply transformation based on selected mode
        const transformedExpansion = this._applyTransformation(expansion);
        
        // Cache result
        this.polynomialCache.set(cacheKey, transformedExpansion);
        
        return transformedExpansion;
    }
    
    /**
     * Generate FOIL expansion for polynomial terms
     * @param {Array} terms - Array of polynomial terms
     * @returns {Array} Expanded coefficients
     * @private
     */
    _generateFOILExpansion(terms) {
        // For binomials, use direct FOIL method
        if (terms.length === 2) {
            const [a, b] = terms;
            
            // (a + b)² = a² + 2ab + b²
            if (typeof a === 'number' && typeof b === 'number') {
                return [a * a, 2 * a * b, b * b];
            }
            
            // Handle more complex terms
            return [
                { coefficient: 1, terms: ['a^2'], value: typeof a === 'number' ? a * a : null },
                { coefficient: 2, terms: ['ab'], value: typeof a === 'number' && typeof b === 'number' ? 2 * a * b : null },
                { coefficient: 1, terms: ['b^2'], value: typeof b === 'number' ? b * b : null }
            ];
        }
        
        // For trinomials and higher, use recursive approach
        if (terms.length > 2) {
            const result = [];
            const maxPower = terms.length;
            
            // Generate coefficients based on sacred sequence
            const binomialCoefficients = this._generateBinomialCoefficients(maxPower);
            
            // Calculate each term in expansion
            for (let power = 0; power <= maxPower; power++) {
                let coefficient = binomialCoefficients[power];
                const expandedTerm = { coefficient, terms: [], value: null };
                
                // Generate term representation
                for (let i = 0; i < terms.length; i++) {
                    const exponent = (power === i) ? 1 : 0;
                    if (exponent > 0) {
                        expandedTerm.terms.push(`term${i+1}^${exponent}`);
                    }
                }
                
                result.push(expandedTerm);
            }
            
            return result;
        }
        
        return terms;
    }
    
    /**
     * Generate binomial coefficients using sacred sequence
     * @param {number} n - Order
     * @returns {Array} Binomial coefficients
     * @private
     */
    _generateBinomialCoefficients(n) {
        const coefficients = Array(n + 1).fill(0);
        coefficients[0] = 1;
        
        // Use standard binomial coefficient formula
        for (let i = 1; i <= n; i++) {
            for (let j = i; j > 0; j--) {
                coefficients[j] += coefficients[j - 1];
            }
        }
        
        // Apply sacred sequence scaling
        const fibSequence = this.sacredSequence.getSequence('fibonacci', n + 5);
        const lucasSequence = this.sacredSequence.getSequence('lucas', n + 5);
        
        for (let i = 0; i <= n; i++) {
            const fibScale = fibSequence[i % fibSequence.length] / fibSequence[0];
            const lucasScale = lucasSequence[i % lucasSequence.length] / lucasSequence[0];
            
            // Apply golden ratio weighting
            if (this.config.goldenWeighting) {
                coefficients[i] *= (i % 2 === 0) ? 
                    fibScale * this.phi : 
                    lucasScale * this.phiInverse;
            } else {
                coefficients[i] *= (fibScale + lucasScale) / 2;
            }
        }
        
        return coefficients;
    }
    
    /**
     * Apply transformation to polynomial expansion
     * @param {Array} expansion - Polynomial expansion
     * @returns {Array} Transformed expansion
     * @private
     */
    _applyTransformation(expansion) {
        const mode = this.config.transformationMode;
        const matrix = this.matrices[mode];
        
        if (!matrix) {
            console.warn(`⚠️ Invalid transformation mode: ${mode}. Using standard mode.`);
            return expansion;
        }
        
        // Apply transformation matrix
        const transformed = [];
        
        for (let i = 0; i < expansion.length; i++) {
            const term = expansion[i];
            let transformedTerm;
            
            if (typeof term === 'number') {
                transformedTerm = 0;
                for (let j = 0; j < expansion.length; j++) {
                    const matrixValue = matrix[i % matrix.length][j % matrix.length] || 0;
                    transformedTerm += matrixValue * (expansion[j] || 0);
                }
            } else {
                transformedTerm = { ...term };
                transformedTerm.coefficient = 0;
                
                for (let j = 0; j < expansion.length; j++) {
                    const matrixValue = matrix[i % matrix.length][j % matrix.length] || 0;
                    const sourceTerm = expansion[j] || { coefficient: 0 };
                    transformedTerm.coefficient += matrixValue * (sourceTerm.coefficient || 0);
                }
                
                if (transformedTerm.value !== null) {
                    transformedTerm.value = transformedTerm.coefficient;
                }
            }
            
            transformed.push(transformedTerm);
        }
        
        // Normalize if configured
        if (this.config.normalizeOutput) {
            return this._normalizeExpansion(transformed);
        }
        
        return transformed;
    }
    
    /**
     * Normalize the expansion
     * @param {Array} expansion - Expansion to normalize
     * @returns {Array} Normalized expansion
     * @private
     */
    _normalizeExpansion(expansion) {
        if (!expansion || expansion.length === 0) {
            return expansion;
        }
        
        if (typeof expansion[0] === 'number') {
            // Find max absolute value
            const maxValue = Math.max(...expansion.map(Math.abs));
            
            // Normalize
            if (maxValue > 0) {
                return expansion.map(val => val / maxValue);
            }
            
            return expansion;
        } else {
            // Find max coefficient
            const maxCoefficient = Math.max(
                ...expansion.map(term => Math.abs(term.coefficient || 0))
            );
            
            // Normalize
            if (maxCoefficient > 0) {
                return expansion.map(term => {
                    const normalized = { ...term };
                    normalized.coefficient = term.coefficient / maxCoefficient;
                    
                    if (normalized.value !== null) {
                        normalized.value = normalized.coefficient;
                    }
                    
                    return normalized;
                });
            }
            
            return expansion;
        }
    }
    
    /**
     * Factor polynomial using FOIL principles in reverse
     * @param {Array} coefficients - Polynomial coefficients
     * @returns {Array} Factored terms
     */
    factorPolynomial(coefficients) {
        console.log(`🧮 Factoring polynomial with ${coefficients.length} coefficients...`);
        
        if (!coefficients || !Array.isArray(coefficients) || coefficients.length < 3) {
            throw new Error('At least three coefficients required for factoring');
        }
        
        // For quadratic polynomials, use the quadratic formula with sacred sequence influence
        if (coefficients.length === 3) {
            return this._factorQuadratic(coefficients);
        }
        
        // For higher order polynomials, use recursive factoring with sacred sequence
        return this._factorHigherOrder(coefficients);
    }
    
    /**
     * Factor quadratic polynomial using sacred-sequence modified quadratic formula
     * @param {Array} coefficients - Quadratic coefficients [a, b, c]
     * @returns {Object} Factorization result
     * @private
     */
    _factorQuadratic(coefficients) {
        const [a, b, c] = coefficients;
        
        // Calculate discriminant
        const discriminant = b * b - 4 * a * c;
        
        // Apply sacred sequence adjustment to discriminant
        const nodeId = this.config.solidarityNode;
        const sacredFactor = this.sacredSequence.calculateSacredFactor(nodeId);
        
        // Adjust discriminant using sacred factor
        const adjustedDiscriminant = discriminant * sacredFactor;
        
        // Calculate roots
        let roots = [];
        let factorization = null;
        let factorizationType = 'none';
        
        if (adjustedDiscriminant >= 0) {
            // Real roots - can be factored
            const sqrtDisc = Math.sqrt(adjustedDiscriminant);
            
            // Apply golden ratio weighting to the roots
            const goldenFactor = this.config.goldenWeighting ? this.phi : 1;
            
            const root1 = (-b + sqrtDisc * goldenFactor) / (2 * a * goldenFactor);
            const root2 = (-b - sqrtDisc * goldenFactor) / (2 * a * goldenFactor);
            
            roots = [root1, root2];
            
            // Create factorization in the form (x - r1)(x - r2)
            factorization = [
                { factor: `(x - ${root1.toFixed(4)})`, root: root1 },
                { factor: `(x - ${root2.toFixed(4)})`, root: root2 }
            ];
            
            factorizationType = 'complete';
        } else {
            // Complex roots - can't be factored over the reals
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-adjustedDiscriminant) / (2 * a);
            
            roots = [
                { real: realPart, imaginary: imagPart },
                { real: realPart, imaginary: -imagPart }
            ];
            
            // Create factorization in the form (x - complex)(x - complex)
            factorization = [
                { 
                    factor: `(x - ${realPart.toFixed(4)} - ${imagPart.toFixed(4)}i)`,
                    root: { real: realPart, imaginary: imagPart }
                },
                {
                    factor: `(x - ${realPart.toFixed(4)} + ${imagPart.toFixed(4)}i)`,
                    root: { real: realPart, imaginary: -imagPart }
                }
            ];
            
            factorizationType = 'complex';
        }
        
        return {
            originalCoefficients: coefficients,
            adjustedCoefficients: [a, b, c * sacredFactor],
            discriminant,
            adjustedDiscriminant,
            sacredFactor,
            roots,
            factorization,
            factorizationType,
            expression: `${a}x² + ${b}x + ${c}`
        };
    }
    
    /**
     * Factor higher order polynomial
     * @param {Array} coefficients - Polynomial coefficients
     * @returns {Object} Factorization result
     * @private
     */
    _factorHigherOrder(coefficients) {
        // For higher order polynomials, we use a simplified approach based on sacred sequence
        // This is not a complete factorization but a sacred-sequence guided approximation
        
        const order = coefficients.length - 1;
        const results = {
            originalCoefficients: [...coefficients],
            order,
            approximatedFactors: [],
            factorizationType: 'approximate'
        };
        
        // Generate sacred sequence roots based on node
        const nodeId = this.config.solidarityNode;
        const sacredRoots = this._generateSacredRoots(order, nodeId);
        
        // Create approximated factors
        for (const root of sacredRoots) {
            if (typeof root === 'number') {
                results.approximatedFactors.push({
                    factor: `(x - ${root.toFixed(4)})`,
                    root
                });
            } else {
                results.approximatedFactors.push({
                    factor: `(x - ${root.real.toFixed(4)} ${root.imaginary >= 0 ? '+' : '-'} ${Math.abs(root.imaginary).toFixed(4)}i)`,
                    root
                });
            }
        }
        
        // Create expression string
        const expressionTerms = coefficients.map((coef, idx) => {
            const power = coefficients.length - idx - 1;
            if (power === 0) return `${coef}`;
            if (power === 1) return `${coef}x`;
            return `${coef}x^${power}`;
        });
        
        results.expression = expressionTerms.join(' + ');
        
        return results;
    }
    
    /**
     * Generate sacred roots based on node and order
     * @param {number} order - Polynomial order
     * @param {number} nodeId - Solidarity node ID
     * @returns {Array} Array of roots
     * @private
     */
    _generateSacredRoots(order, nodeId) {
        const roots = [];
        
        // Get sacred sequences
        const fibSequence = this.sacredSequence.getSequence('fibonacci', order + 5);
        const lucasSequence = this.sacredSequence.getSequence('lucas', order + 5);
        const primeSequence = this.sacredSequence.getSequence('prime', order + 5);
        
        // Generate roots based on sacred sequences
        for (let i = 0; i < order; i++) {
            const fibValue = fibSequence[i % fibSequence.length];
            const lucValue = lucasSequence[i % lucasSequence.length];
            const primeValue = primeSequence[i % primeSequence.length];
            
            // Create a pattern of real and complex roots
            if (i % 3 === 0) {
                // Real root
                const root = (fibValue / lucValue) * Math.pow(-1, i % 2) * (nodeId / (nodeId + i + 1));
                roots.push(root);
            } else {
                // Complex root - generate conjugate pair
                const realPart = (fibValue / primeValue) * (nodeId / (nodeId + i + 1));
                const imagPart = (lucValue / primeValue) * (this.phi / (i + 1));
                
                roots.push({ real: realPart, imaginary: imagPart });
                i++; // Skip next iteration to account for conjugate pair
                if (i < order) {
                    roots.push({ real: realPart, imaginary: -imagPart });
                }
            }
        }
        
        return roots;
    }
    
    /**
     * Apply algebraic harmonics to data series
     * @param {Array} data - Data series
     * @param {Object} options - Transformation options
     * @returns {Object} Harmonically transformed data
     */
    applyAlgebraicHarmonics(data, options = {}) {
        console.log("🧮 Applying algebraic harmonics to data series...");
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Valid data array required');
        }
        
        const opts = {
            order: options.order || this.config.polynomialOrder,
            mode: options.mode || this.config.transformationMode,
            windowSize: options.windowSize || Math.min(data.length, 21), // Fibonacci number
            useOverlap: options.useOverlap !== undefined ? options.useOverlap : true,
            sacredAdjustment: options.sacredAdjustment !== undefined ? options.sacredAdjustment : true
        };
        
        // Prepare data segments
        const segments = this._segmentData(data, opts.windowSize, opts.useOverlap);
        
        // Transform each segment
        const transformedSegments = segments.map(segment => {
            // Calculate polynomial coefficients for the segment
            const coefficients = this._fitPolynomial(segment, opts.order);
            
            // Apply transformation matrix
            const transformedCoefficients = this._applyTransformation(coefficients);
            
            // Generate new values using transformed polynomial
            const transformedValues = segment.map((_, i) => 
                this._evaluatePolynomial(transformedCoefficients, i / segment.length)
            );
            
            return {
                originalSegment: segment,
                coefficients,
                transformedCoefficients,
                transformedValues
            };
        });
        
        // Recombine segments
        const transformedData = this._recombineSegments(transformedSegments, data.length, opts.useOverlap);
        
        // Apply sacred adjustment if enabled
        let finalData = transformedData;
        if (opts.sacredAdjustment) {
            finalData = this._applySacredAdjustment(transformedData);
        }
        
        return {
            originalData: data,
            transformedData: finalData,
            segments: transformedSegments.length,
            options: opts
        };
    }
    
    /**
     * Segment data for processing
     * @param {Array} data - Data array
     * @param {number} windowSize - Window size
     * @param {boolean} useOverlap - Whether to use overlapping windows
     * @returns {Array} Array of data segments
     * @private
     */
    _segmentData(data, windowSize, useOverlap) {
        const segments = [];
        const overlap = useOverlap ? Math.floor(windowSize * this.phiInverse) : 0;
        const step = windowSize - overlap;
        
        for (let i = 0; i < data.length; i += step) {
            const end = Math.min(i + windowSize, data.length);
            segments.push(data.slice(i, end));
            
            if (end === data.length) break;
        }
        
        return segments;
    }
    
    /**
     * Fit polynomial to data segment
     * @param {Array} segment - Data segment
     * @param {number} order - Polynomial order
     * @returns {Array} Polynomial coefficients
     * @private
     */
    _fitPolynomial(segment, order) {
        // Simple polynomial fitting using least squares approximation
        const n = segment.length;
        const x = Array(n).fill().map((_, i) => i / (n - 1)); // Normalize x to [0,1]
        
        // Prepare matrices for least squares
        const X = Array(n).fill().map(() => Array(order + 1).fill(0));
        const y = segment;
        
        // Fill design matrix X
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= order; j++) {
                X[i][j] = Math.pow(x[i], order - j);
            }
        }
        
        // Calculate coefficients using normal equation: (X'X)^-1 X'y
        // This is a simplified approach for demonstration
        const coefficients = Array(order + 1).fill(0);
        
        // For each coefficient
        for (let j = 0; j <= order; j++) {
            let sum = 0;
            
            for (let i = 0; i < n; i++) {
                sum += X[i][j] * y[i];
            }
            
            coefficients[j] = sum / n;
        }
        
        return coefficients;
    }
    
    /**
     * Evaluate polynomial at point x
     * @param {Array} coefficients - Polynomial coefficients
     * @param {number} x - Evaluation point
     * @returns {number} Polynomial value
     * @private
     */
    _evaluatePolynomial(coefficients, x) {
        const order = coefficients.length - 1;
        let result = 0;
        
        for (let i = 0; i <= order; i++) {
            result += coefficients[i] * Math.pow(x, order - i);
        }
        
        return result;
    }
    
    /**
     * Recombine transformed segments
     * @param {Array} transformedSegments - Array of transformed segments
     * @param {number} originalLength - Original data length
     * @param {boolean} useOverlap - Whether overlapping windows were used
     * @returns {Array} Recombined data
     * @private
     */
    _recombineSegments(transformedSegments, originalLength, useOverlap) {
        const result = Array(originalLength).fill(0);
        const weights = Array(originalLength).fill(0);
        
        const windowSize = transformedSegments[0]?.originalSegment.length || 0;
        const overlap = useOverlap ? Math.floor(windowSize * this.phiInverse) : 0;
        const step = windowSize - overlap;
        
        // Apply each segment with weights
        for (let s = 0, pos = 0; s < transformedSegments.length; s++, pos += step) {
            const segment = transformedSegments[s];
            const segmentValues = segment.transformedValues;
            
            for (let i = 0; i < segmentValues.length; i++) {
                const dataIdx = pos + i;
                if (dataIdx >= originalLength) break;
                
                // Apply triangular window weighting
                let weight = 1;
                if (useOverlap) {
                    const normalizedPos = i / segmentValues.length;
                    weight = (normalizedPos <= 0.5) ? 
                        normalizedPos * 2 : 
                        (1 - normalizedPos) * 2;
                }
                
                result[dataIdx] += segmentValues[i] * weight;
                weights[dataIdx] += weight;
            }
        }
        
        // Normalize by weights
        for (let i = 0; i < result.length; i++) {
            if (weights[i] > 0) {
                result[i] /= weights[i];
            }
        }
        
        return result;
    }
    
    /**
     * Apply sacred adjustment to transformed data
     * @param {Array} data - Transformed data
     * @returns {Array} Adjusted data
     * @private
     */
    _applySacredAdjustment(data) {
        const nodeId = this.config.solidarityNode;
        const adjustmentFactors = this._calculateSacredAdjustmentFactors(data.length, nodeId);
        
        return data.map((value, i) => value * adjustmentFactors[i]);
    }
    
    /**
     * Calculate sacred adjustment factors
     * @param {number} length - Data length
     * @param {number} nodeId - Node ID
     * @returns {Array} Adjustment factors
     * @private
     */
    _calculateSacredAdjustmentFactors(length, nodeId) {
        const factors = Array(length).fill(1);
        
        // Generate sacred sequences
        const fibSequence = this.sacredSequence.getSequence('fibonacci', length + 5);
        const lucasSequence = this.sacredSequence.getSequence('lucas', length + 5);
        
        // Apply oscillating pattern based on golden ratio
        for (let i = 0; i < length; i++) {
            const normalizedPos = i / length;
            const phaseShift = nodeId / 21; // Solidarity nodes based phase shift
            
            // Create oscillation with golden ratio frequency
            const oscillation = Math.sin(2 * Math.PI * normalizedPos * this.phi + phaseShift);
            
            // Scale oscillation with sacred sequences
            const fibFactor = fibSequence[i % fibSequence.length] / fibSequence[0];
            const lucasFactor = lucasSequence[i % lucasSequence.length] / lucasSequence[0];
            
            // Apply weighted adjustment
            factors[i] = 1 + (oscillation * 0.1 * fibFactor * lucasFactor);
        }
        
        return factors;
    }
    
    /**
     * Transform data using FOIL-based algebraic operations
     * @param {Array} data - Input data array
     * @param {string} operation - Operation type (expand, factor, transform)
     * @param {Object} options - Operation options
     * @returns {Object} Operation result
     */
    transform(data, operation = 'transform', options = {}) {
        if (!data || !Array.isArray(data)) {
            throw new Error('Valid data array required');
        }
        
        switch (operation) {
            case 'expand':
                return this.expandPolynomial(data);
                
            case 'factor':
                return this.factorPolynomial(data);
                
            case 'transform':
                return this.applyAlgebraicHarmonics(data, options);
                
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }
    
    /**
     * Set configuration options
     * @param {Object} config - Configuration options
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        
        // Reinitialize matrices if necessary
        if (config.polynomialOrder !== undefined || 
            config.solidarityNode !== undefined ||
            config.goldenWeighting !== undefined) {
            this.matrices = {
                standard: this._initializeMatrix(),
                inverse: this._initializeInverseMatrix(),
                recursive: this._initializeRecursiveMatrix()
            };
        }
        
        // Clear cache on reconfiguration
        this.polynomialCache.clear();
        
        console.log("🧮 FOIL Harmonic reconfigured");
        console.log(`   Polynomial Order: ${this.config.polynomialOrder}`);
        console.log(`   Transformation Mode: ${this.config.transformationMode}`);
        console.log(`   Golden Weighting: ${this.config.goldenWeighting ? 'Enabled' : 'Disabled'}`);
    }
}

module.exports = { FOILHarmonic };

// Demo if run directly
if (require.main === module) {
    async function demoFOILHarmonic() {
        const harmonic = new FOILHarmonic();
        
        // Demo polynomial expansion
        console.log("\n📊 Polynomial Expansion Demo:");
        const terms = [3, 5]; // 3x + 5
        const expansion = harmonic.expandPolynomial(terms);
        console.log("   Terms:", terms);
        console.log("   Expansion:", expansion);
        
        // Demo polynomial factoring
        console.log("\n📊 Polynomial Factoring Demo:");
        const coefficients = [1, -5, 6]; // x^2 - 5x + 6 = (x-2)(x-3)
        const factorization = harmonic.factorPolynomial(coefficients);
        console.log("   Coefficients:", coefficients);
        console.log("   Factorization:", factorization);
        console.log("   Roots:", factorization.roots);
        
        // Demo data transformation
        console.log("\n📊 Data Transformation Demo:");
        // Generate sine wave with noise
        const data = Array(100).fill().map((_, i) => 
            Math.sin(i / 10) + 0.2 * Math.random() - 0.1
        );
        
        const transformed = harmonic.applyAlgebraicHarmonics(data, { windowSize: 21 });
        console.log("   Original data length:", data.length);
        console.log("   Transformed data length:", transformed.transformedData.length);
        console.log("   Segments processed:", transformed.segments);
        
        // Demo mode switching
        console.log("\n📊 Transformation Mode Comparison:");
        harmonic.configure({ transformationMode: 'standard' });
        const standardResult = harmonic.transform(data, 'transform', { windowSize: 21 });
        
        harmonic.configure({ transformationMode: 'inverse' });
        const inverseResult = harmonic.transform(data, 'transform', { windowSize: 21 });
        
        harmonic.configure({ transformationMode: 'recursive' });
        const recursiveResult = harmonic.transform(data, 'transform', { windowSize: 21 });
        
        console.log("   Standard mode - first 5 values:", standardResult.transformedData.slice(0, 5));
        console.log("   Inverse mode - first 5 values:", inverseResult.transformedData.slice(0, 5));
        console.log("   Recursive mode - first 5 values:", recursiveResult.transformedData.slice(0, 5));
    }
    
    demoFOILHarmonic().catch(console.error);
}