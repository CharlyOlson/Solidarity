/**
 * Market Volatility Harmonic
 * Analyzes financial market patterns using golden ratio mathematics
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 * @version 1.0.0
 */

const { SacredNumericSequence } = require('./SacredNumericSequence');
const fs = require('fs');
const path = require('path');

class MarketVolatilityHarmonic {
    constructor(config = {}) {
        this.config = {
            baseVolatility: config.baseVolatility || 0.15, // Default market volatility
            fibonacci_levels: config.fibonacci_levels || [0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618, 2.618],
            lookbackPeriods: config.lookbackPeriods || 144, // Fibonacci number
            volatilityThreshold: config.volatilityThreshold || 0.144, // Fibonacci-derived threshold
            useGoldenRatio: config.useGoldenRatio !== undefined ? config.useGoldenRatio : true
        };
        
        this.sacredSequence = new SacredNumericSequence();
        this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio (φ)
        this.phiInverse = 1 / this.phi;    // Golden ratio inverse
        
        this.volatilityMetrics = {
            currentVolatility: this.config.baseVolatility,
            historicalAverage: this.config.baseVolatility,
            predictions: [],
            lastAnalysis: null,
            supportLevels: [],
            resistanceLevels: []
        };
        
        console.log("📈 Market Volatility Harmonic initialized");
        console.log(`   Base Volatility: ${this.config.baseVolatility.toFixed(4)}`);
        console.log(`   Fibonacci Levels: ${this.config.fibonacci_levels.join(', ')}`);
    }
    
    /**
     * Analyze market data for volatility patterns
     * @param {Array} priceData - Historical price data
     * @returns {Object} Volatility analysis
     */
    analyzeVolatility(priceData) {
        if (!priceData || !Array.isArray(priceData) || priceData.length < 30) {
            throw new Error('Insufficient price data for volatility analysis');
        }
        
        console.log(`📊 Analyzing volatility for ${priceData.length} data points...`);
        
        // Calculate price changes
        const changes = [];
        for (let i = 1; i < priceData.length; i++) {
            changes.push((priceData[i] - priceData[i-1]) / priceData[i-1]);
        }
        
        // Calculate volatility as standard deviation of changes
        const volatility = this._calculateVolatility(changes);
        
        // Apply sacred sequence transformation
        const transformedVolatility = this._applySequenceTransformation(volatility);
        
        // Find support and resistance levels using Fibonacci
        const [min, max] = [Math.min(...priceData), Math.max(...priceData)];
        const range = max - min;
        
        const supportLevels = this.config.fibonacci_levels
            .filter(level => level < 0.5)
            .map(level => min + range * level)
            .sort((a, b) => a - b);
            
        const resistanceLevels = this.config.fibonacci_levels
            .filter(level => level > 0.5)
            .map(level => min + range * level)
            .sort((a, b) => a - b);
        
        // Generate volatility forecast using golden ratio
        const volatilityForecast = this._forecastVolatility(volatility, changes);
        
        // Update metrics
        this.volatilityMetrics = {
            currentVolatility: volatility,
            transformedVolatility,
            historicalAverage: changes.reduce((sum, c) => sum + Math.abs(c), 0) / changes.length,
            predictions: volatilityForecast,
            lastAnalysis: new Date().toISOString(),
            supportLevels,
            resistanceLevels,
            trend: this._determineTrend(changes, this.config.lookbackPeriods),
            cyclePosition: this._determineCyclePosition(changes)
        };
        
        console.log(`✅ Volatility analysis complete`);
        console.log(`   Current Volatility: ${volatility.toFixed(4)}`);
        console.log(`   Transformed Volatility: ${transformedVolatility.toFixed(4)}`);
        console.log(`   Trend: ${this.volatilityMetrics.trend}`);
        console.log(`   Cycle Position: ${this.volatilityMetrics.cyclePosition}`);
        
        return this.volatilityMetrics;
    }
    
    /**
     * Calculate volatility from price changes
     * @param {Array} changes - Price changes
     * @returns {number} Volatility
     * @private
     */
    _calculateVolatility(changes) {
        const mean = changes.reduce((sum, value) => sum + value, 0) / changes.length;
        const squaredDiffs = changes.map(value => Math.pow(value - mean, 2));
        const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / squaredDiffs.length;
        
        return Math.sqrt(variance);
    }
    
    /**
     * Apply sacred sequence transformation to volatility
     * @param {number} volatility - Raw volatility value
     * @returns {number} - Transformed volatility
     * @private
     */
    _applySequenceTransformation(volatility) {
        const nodeId = 7; // Use node 7 for financial calculations
        const sequenceName = 'fibonacci';
        
        const sequence = this.sacredSequence.getSequence(sequenceName, 10);
        const harmonicFactor = this.sacredSequence.phi;
        
        // Apply transformation based on sequence ratios
        const ratio = sequence[nodeId % sequence.length] / sequence[(nodeId + 1) % sequence.length];
        const transformed = volatility * (ratio * harmonicFactor);
        
        return transformed;
    }
    
    /**
     * Forecast future volatility using golden ratio
     * @param {number} currentVolatility - Current volatility value
     * @param {Array} changes - Historical price changes
     * @returns {Array} - Volatility predictions
     * @private
     */
    _forecastVolatility(currentVolatility, changes) {
        const predictions = [];
        const cycles = [this.phi, Math.pow(this.phi, 2), Math.pow(this.phi, 3)];
        
        // Generate predictions for 3 cycles
        for (let i = 0; i < 3; i++) {
            const cycleFactor = cycles[i];
            const pastIndex = Math.max(0, Math.floor(changes.length / cycleFactor));
            const pastVolatility = this._calculateVolatility(changes.slice(pastIndex));
            
            const prediction = (currentVolatility * this.phiInverse + pastVolatility * this.phiInverse * this.phi) / 2;
            predictions.push({
                period: i + 1,
                value: prediction,
                confidence: Math.max(0.5, 1 - (i * 0.2))
            });
        }
        
        return predictions;
    }
    
    /**
     * Determine market trend from price changes
     * @param {Array} changes - Price changes
     * @param {number} lookback - Number of periods to analyze
     * @returns {string} - Trend direction
     * @private
     */
    _determineTrend(changes, lookback) {
        const recentChanges = changes.slice(-Math.min(lookback, changes.length));
        const positiveChanges = recentChanges.filter(c => c > 0).length;
        const negativeChanges = recentChanges.filter(c => c < 0).length;
        
        const positiveRatio = positiveChanges / recentChanges.length;
        
        if (positiveRatio > 0.618) { // Golden ratio threshold
            return 'strongly_bullish';
        } else if (positiveRatio > 0.5) {
            return 'bullish';
        } else if (positiveRatio > 0.382) { // 1 - phi^-1
            return 'neutral';
        } else if (positiveRatio > 0.236) { // Fibonacci ratio
            return 'bearish';
        } else {
            return 'strongly_bearish';
        }
    }
    
    /**
     * Determine market cycle position
     * @param {Array} changes - Price changes
     * @returns {string} - Cycle position
     * @private
     */
    _determineCyclePosition(changes) {
        const recentVolatility = this._calculateVolatility(changes.slice(-21)); // Solidarity node 21
        const longerVolatility = this._calculateVolatility(changes.slice(-89)); // Fibonacci number
        
        const ratio = recentVolatility / longerVolatility;
        
        if (ratio > this.phi) {
            return 'peak';
        } else if (ratio > 1) {
            return 'expansion';
        } else if (ratio > this.phiInverse) {
            return 'contraction';
        } else {
            return 'trough';
        }
    }
    
    /**
     * Get risk assessment based on volatility
     * @returns {Object} - Risk assessment
     */
    getRiskAssessment() {
        const { currentVolatility, historicalAverage, trend, cyclePosition } = this.volatilityMetrics;
        
        let riskLevel = 'moderate';
        
        if (currentVolatility > historicalAverage * this.phi) {
            riskLevel = 'extreme';
        } else if (currentVolatility > historicalAverage * 1.2) {
            riskLevel = 'high';
        } else if (currentVolatility < historicalAverage * this.phiInverse) {
            riskLevel = 'low';
        }
        
        // Adjust based on trend
        if (trend === 'strongly_bullish' && riskLevel !== 'extreme') {
            riskLevel = riskLevel === 'high' ? 'high' : 'moderate';
        } else if (trend === 'strongly_bearish') {
            riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
        }
        
        return {
            riskLevel,
            volatilityRatio: currentVolatility / historicalAverage,
            trend,
            cyclePosition,
            timestamp: new Date().toISOString(),
            recommendations: this._generateRecommendations(riskLevel, trend, cyclePosition)
        };
    }
    
    /**
     * Generate recommendations based on risk assessment
     * @param {string} riskLevel - Current risk level
     * @param {string} trend - Market trend
     * @param {string} cyclePosition - Market cycle position
     * @returns {Array} - Recommendations
     * @private
     */
    _generateRecommendations(riskLevel, trend, cyclePosition) {
        const recommendations = [];
        
        if (riskLevel === 'extreme') {
            recommendations.push('Consider reducing exposure to highly volatile assets');
            recommendations.push('Implement strong hedging strategies');
        } else if (riskLevel === 'high') {
            recommendations.push('Review portfolio allocation with focus on volatility reduction');
            recommendations.push('Consider tactical hedging');
        }
        
        if (trend === 'strongly_bullish') {
            recommendations.push('Focus on momentum-based strategies');
        } else if (trend === 'strongly_bearish') {
            recommendations.push('Consider defensive positioning');
        }
        
        if (cyclePosition === 'peak') {
            recommendations.push('Prepare for potential volatility increase');
        } else if (cyclePosition === 'trough') {
            recommendations.push('Consider strategic re-entry positions');
        }
        
        return recommendations;
    }
    
    /**
     * Get volatility metrics
     * @returns {Object} - Volatility metrics
     */
    getVolatilityMetrics() {
        return this.volatilityMetrics;
    }
    
    /**
     * Set configuration options
     * @param {Object} config - Configuration options
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        console.log("📈 Market Volatility Harmonic reconfigured");
        console.log(`   Base Volatility: ${this.config.baseVolatility.toFixed(4)}`);
    }
}

module.exports = { MarketVolatilityHarmonic };

// Demo if run directly
if (require.main === module) {
    async function demoMarketVolatility() {
        const harmonic = new MarketVolatilityHarmonic();
        
        // Generate sample price data
        const priceData = [];
        let price = 100;
        for (let i = 0; i < 200; i++) {
            const change = (Math.random() - 0.48) * 2; // Slight upward bias
            price *= (1 + change / 100);
            priceData.push(price);
        }
        
        // Analyze volatility
        const analysis = harmonic.analyzeVolatility(priceData);
        console.log("\n📊 Volatility Analysis:", analysis);
        
        // Get risk assessment
        const risk = harmonic.getRiskAssessment();
        console.log("\n⚠️ Risk Assessment:", risk);
    }
    
    demoMarketVolatility().catch(console.error);
}