/**
 * Portfolio Balance Harmonic
 * Applies golden ratio principles to optimize investment portfolio distribution
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 * @version 1.0.0
 */

const { SacredNumericSequence } = require('./SacredNumericSequence');
const { MarketVolatilityHarmonic } = require('./MarketVolatilityHarmonic');
const fs = require('fs');
const path = require('path');

class PortfolioBalanceHarmonic {
    constructor(config = {}) {
        this.config = {
            rebalanceThreshold: config.rebalanceThreshold || 0.0618, // 6.18% threshold (φ^-2)
            defaultRiskLevel: config.defaultRiskLevel || 'balanced', // conservative, balanced, growth, aggressive
            useGoldenRatio: config.useGoldenRatio !== undefined ? config.useGoldenRatio : true,
            baseCurrency: config.baseCurrency || 'USD',
            solidarityNode: config.solidarityNode || 7 // Node 7 for financial operations
        };
        
        this.sacredSequence = new SacredNumericSequence();
        this.volatilityHarmonic = new MarketVolatilityHarmonic();
        this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio (φ)
        this.phiInverse = 1 / this.phi;    // Golden ratio inverse
        
        // Standard allocation models based on golden ratio
        this.allocationModels = {
            conservative: this._createAllocationModel('conservative'),
            balanced: this._createAllocationModel('balanced'),
            growth: this._createAllocationModel('growth'),
            aggressive: this._createAllocationModel('aggressive')
        };
        
        this.portfolioMetrics = {
            currentAllocation: null,
            targetAllocation: null,
            lastRebalance: null,
            performance: {
                totalReturn: 0,
                volatility: 0,
                sharpeRatio: 0
            }
        };
        
        console.log("💼 Portfolio Balance Harmonic initialized");
        console.log(`   Rebalance Threshold: ${(this.config.rebalanceThreshold * 100).toFixed(2)}%`);
        console.log(`   Default Risk Level: ${this.config.defaultRiskLevel}`);
        console.log(`   Golden Ratio Allocation: ${this.config.useGoldenRatio ? 'Enabled' : 'Disabled'}`);
    }
    
    /**
     * Create allocation model based on risk level using golden ratio principles
     * @param {string} riskLevel - Risk level
     * @returns {Object} Allocation model
     * @private
     */
    _createAllocationModel(riskLevel) {
        const phi = this.phi;
        const phiInv = this.phiInverse;
        
        switch(riskLevel) {
            case 'conservative': 
                return {
                    bonds: phiInv * phiInv, // φ^-2 ≈ 0.382
                    stocks: phiInv * phiInv * phi, // φ^-1 ≈ 0.236
                    cash: phiInv, // φ^-1 ≈ 0.382
                    alternatives: 1 - (phiInv * phiInv + phiInv * phiInv * phi + phiInv) // Remainder
                };
            case 'balanced':
                return {
                    bonds: phiInv, // φ^-1 ≈ 0.618
                    stocks: phiInv * phi, // 1 ≈ 0.618 * 1.618
                    cash: phiInv * phiInv, // φ^-2 ≈ 0.382
                    alternatives: 1 - (phiInv + phiInv * phi + phiInv * phiInv) // Remainder
                };
            case 'growth':
                return {
                    bonds: phiInv * phiInv, // φ^-2 ≈ 0.382
                    stocks: phi / 2, // φ/2 ≈ 0.809
                    cash: phiInv * phiInv * phiInv, // φ^-3 ≈ 0.236
                    alternatives: 1 - (phiInv * phiInv + phi / 2 + phiInv * phiInv * phiInv) // Remainder
                };
            case 'aggressive':
                return {
                    bonds: phiInv * phiInv * phiInv, // φ^-3 ≈ 0.236
                    stocks: phiInv + 0.5, // φ^-1 + 0.5 ≈ 1.118
                    cash: phiInv * phiInv * phiInv * phiInv, // φ^-4 ≈ 0.146
                    alternatives: 1 - (phiInv * phiInv * phiInv + phiInv + 0.5 + phiInv * phiInv * phiInv * phiInv) // Remainder
                };
            default:
                return {
                    bonds: 0.4,
                    stocks: 0.4,
                    cash: 0.1,
                    alternatives: 0.1
                };
        }
    }
    
    /**
     * Optimize portfolio allocation based on market conditions and risk profile
     * @param {Object} currentPortfolio - Current portfolio allocation
     * @param {Object} marketConditions - Market conditions data
     * @param {string} riskProfile - Risk profile (conservative, balanced, growth, aggressive)
     * @returns {Object} Optimized portfolio allocation
     */
    optimizeAllocation(currentPortfolio, marketConditions, riskProfile = this.config.defaultRiskLevel) {
        console.log(`💼 Optimizing portfolio allocation for ${riskProfile} risk profile...`);
        
        if (!currentPortfolio || !marketConditions) {
            throw new Error('Portfolio and market condition data required');
        }
        
        // Get base allocation model
        const baseModel = this.allocationModels[riskProfile] || this.allocationModels.balanced;
        
        // Adjust allocation based on market volatility
        const volatilityAdjustment = this._calculateVolatilityAdjustment(marketConditions);
        
        // Get sequence-based adjustments using sacred numeric sequence
        const sequenceAdjustment = this._calculateSequenceAdjustment(riskProfile);
        
        // Calculate final allocation target
        const targetAllocation = {};
        let totalAllocation = 0;
        
        for (const [asset, baseWeight] of Object.entries(baseModel)) {
            const volatilityFactor = volatilityAdjustment[asset] || 1;
            const sequenceFactor = sequenceAdjustment[asset] || 1;
            
            // Apply adjustments with golden ratio weighting
            const adjustedWeight = baseWeight * (volatilityFactor * this.phiInverse + sequenceFactor * this.phiInverse * this.phi);
            targetAllocation[asset] = Math.max(0, Math.min(1, adjustedWeight)); // Clamp between 0-1
            totalAllocation += targetAllocation[asset];
        }
        
        // Normalize to ensure total is 100%
        for (const asset in targetAllocation) {
            targetAllocation[asset] /= totalAllocation;
        }
        
        // Calculate rebalancing needs
        const rebalancingNeeded = this._calculateRebalancingNeeds(currentPortfolio, targetAllocation);
        
        // Update portfolio metrics
        this.portfolioMetrics.currentAllocation = { ...currentPortfolio };
        this.portfolioMetrics.targetAllocation = targetAllocation;
        this.portfolioMetrics.rebalancingNeeded = rebalancingNeeded;
        
        console.log("✅ Portfolio optimization complete");
        console.log("   Target Allocation:");
        for (const [asset, weight] of Object.entries(targetAllocation)) {
            console.log(`     ${asset}: ${(weight * 100).toFixed(2)}%`);
        }
        
        return {
            targetAllocation,
            rebalancingNeeded,
            volatilityAdjustment,
            sequenceAdjustment,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Calculate volatility-based allocation adjustments
     * @param {Object} marketConditions - Market conditions data
     * @returns {Object} Volatility adjustments by asset class
     * @private
     */
    _calculateVolatilityAdjustment(marketConditions) {
        const adjustments = { bonds: 1, stocks: 1, cash: 1, alternatives: 1 };
        
        if (!marketConditions.volatility) {
            return adjustments;
        }
        
        // Extract volatility metrics
        const { currentVolatility, historicalAverage, trend, cyclePosition } = marketConditions.volatility;
        const volatilityRatio = currentVolatility / historicalAverage;
        
        // Adjust based on volatility ratio
        if (volatilityRatio > this.phi) {
            // High volatility - reduce risk
            adjustments.bonds *= 1.1;
            adjustments.stocks *= 0.9;
            adjustments.cash *= 1.15;
            adjustments.alternatives *= 0.95;
        } else if (volatilityRatio < this.phiInverse) {
            // Low volatility - increase risk slightly
            adjustments.bonds *= 0.95;
            adjustments.stocks *= 1.05;
            adjustments.cash *= 0.9;
            adjustments.alternatives *= 1.05;
        }
        
        // Adjust based on trend
        if (trend === 'strongly_bullish') {
            adjustments.stocks *= 1.08;
            adjustments.bonds *= 0.9;
        } else if (trend === 'strongly_bearish') {
            adjustments.stocks *= 0.9;
            adjustments.bonds *= 1.05;
            adjustments.cash *= 1.1;
        }
        
        // Adjust based on cycle position
        if (cyclePosition === 'peak') {
            adjustments.stocks *= 0.95;
            adjustments.cash *= 1.05;
        } else if (cyclePosition === 'trough') {
            adjustments.stocks *= 1.03;
            adjustments.alternatives *= 1.05;
        }
        
        return adjustments;
    }
    
    /**
     * Calculate sequence-based adjustments using sacred numeric sequence
     * @param {string} riskProfile - Risk profile
     * @returns {Object} Sequence-based adjustments
     * @private
     */
    _calculateSequenceAdjustment(riskProfile) {
        const adjustments = { bonds: 1, stocks: 1, cash: 1, alternatives: 1 };
        
        // Get Fibonacci and Lucas sequences
        const fibSequence = this.sacredSequence.getSequence('fibonacci', 10);
        const lucasSequence = this.sacredSequence.getSequence('lucas', 10);
        
        // Calculate ratios based on Solidarity node
        const nodeIndex = this.config.solidarityNode % fibSequence.length;
        const fibRatio = fibSequence[nodeIndex] / fibSequence[(nodeIndex + 1) % fibSequence.length];
        const lucasRatio = lucasSequence[nodeIndex] / lucasSequence[(nodeIndex + 1) % lucasSequence.length];
        
        // Apply different ratios based on risk profile
        switch(riskProfile) {
            case 'conservative':
                adjustments.bonds *= fibRatio;
                adjustments.alternatives *= lucasRatio * this.phiInverse;
                break;
            case 'balanced':
                adjustments.stocks *= fibRatio * this.phiInverse;
                adjustments.alternatives *= lucasRatio;
                break;
            case 'growth':
                adjustments.stocks *= fibRatio;
                adjustments.bonds *= lucasRatio * this.phiInverse;
                break;
            case 'aggressive':
                adjustments.stocks *= fibRatio * 1.05;
                adjustments.bonds *= lucasRatio * this.phiInverse * 0.9;
                break;
        }
        
        return adjustments;
    }
    
    /**
     * Calculate if rebalancing is needed based on threshold
     * @param {Object} currentAllocation - Current allocation
     * @param {Object} targetAllocation - Target allocation
     * @returns {Object} Rebalancing assessment
     * @private
     */
    _calculateRebalancingNeeds(currentAllocation, targetAllocation) {
        const threshold = this.config.rebalanceThreshold;
        const deviations = {};
        let rebalanceNeeded = false;
        
        for (const asset in targetAllocation) {
            const current = currentAllocation[asset] || 0;
            const target = targetAllocation[asset];
            const deviation = Math.abs(current - target);
            
            deviations[asset] = {
                current,
                target,
                deviation,
                percentDeviation: deviation / target,
                exceedsThreshold: deviation / target > threshold
            };
            
            if (deviation / target > threshold) {
                rebalanceNeeded = true;
            }
        }
        
        return {
            rebalanceNeeded,
            threshold,
            deviations,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Generate rebalancing plan with specific actions
     * @param {Object} currentPortfolio - Current portfolio with allocation and values
     * @returns {Object} Rebalancing plan with specific actions
     */
    generateRebalancingPlan(currentPortfolio) {
        if (!this.portfolioMetrics.targetAllocation) {
            throw new Error('Portfolio must be optimized before generating a rebalancing plan');
        }
        
        const targetAllocation = this.portfolioMetrics.targetAllocation;
        const actions = [];
        
        // Calculate total portfolio value
        const totalValue = Object.values(currentPortfolio.values || {}).reduce((sum, val) => sum + val, 0);
        
        // Calculate target values
        const targetValues = {};
        for (const asset in targetAllocation) {
            targetValues[asset] = totalValue * targetAllocation[asset];
        }
        
        // Calculate actions needed
        for (const asset in targetAllocation) {
            const currentValue = currentPortfolio.values?.[asset] || 0;
            const targetValue = targetValues[asset];
            const difference = targetValue - currentValue;
            
            if (Math.abs(difference) / targetValue > this.config.rebalanceThreshold) {
                actions.push({
                    asset,
                    action: difference > 0 ? 'buy' : 'sell',
                    fromAmount: currentValue,
                    toAmount: targetValue,
                    difference: Math.abs(difference),
                    percentChange: (difference / currentValue) * 100
                });
            }
        }
        
        const plan = {
            totalValue,
            currentAllocation: currentPortfolio.allocation,
            targetAllocation,
            targetValues,
            actions: actions.sort((a, b) => b.difference - a.difference), // Sort by largest difference
            timestamp: new Date().toISOString(),
            rebalancingNeeded: actions.length > 0
        };
        
        if (plan.rebalancingNeeded) {
            console.log("⚖️ Rebalancing plan generated:");
            console.log(`   Total Portfolio Value: ${totalValue.toFixed(2)}`);
            console.log("   Actions needed:");
            
            for (const action of plan.actions) {
                console.log(`     ${action.action.toUpperCase()} ${action.asset}: ${action.difference.toFixed(2)} (${action.percentChange.toFixed(2)}%)`);
            }
        } else {
            console.log("✅ Portfolio is balanced within threshold - no rebalancing needed");
        }
        
        return plan;
    }
    
    /**
     * Apply sacred sequence harmonics to portfolio weights for enhanced optimization
     * @param {Object} weights - Initial asset weights
     * @returns {Object} - Harmonically enhanced weights
     */
    applyHarmonicEnhancement(weights) {
        console.log("🎵 Applying harmonic enhancement to portfolio weights...");
        
        const enhancedWeights = { ...weights };
        const nodeId = this.config.solidarityNode;
        
        // Generate harmonic frequencies for the node
        const harmonics = this.sacredSequence.generateHarmonicFrequencies('fibonacci', nodeId);
        
        // Use golden harmonics for adjustments
        const adjustmentFactors = harmonics.golden_ratios.slice(0, 4).map(h => h / harmonics.fundamental);
        
        // Apply different harmonics to different asset classes
        let i = 0;
        for (const asset in enhancedWeights) {
            const factor = adjustmentFactors[i % adjustmentFactors.length];
            const normalized = 1 + ((factor - 1) * this.phiInverse); // Dampen the effect
            
            enhancedWeights[asset] *= normalized;
            i++;
        }
        
        // Normalize weights to sum to 1
        const totalWeight = Object.values(enhancedWeights).reduce((sum, w) => sum + w, 0);
        for (const asset in enhancedWeights) {
            enhancedWeights[asset] /= totalWeight;
        }
        
        return enhancedWeights;
    }
    
    /**
     * Get portfolio performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return this.portfolioMetrics.performance;
    }
    
    /**
     * Update portfolio performance metrics
     * @param {Object} returns - Historical returns data
     * @param {number} riskFreeRate - Risk-free rate
     */
    updatePerformanceMetrics(returns, riskFreeRate = 0.02) {
        if (!returns || !Array.isArray(returns) || returns.length === 0) {
            throw new Error('Valid returns data required');
        }
        
        // Calculate total return
        const totalReturn = returns.reduce((prod, ret) => prod * (1 + ret), 1) - 1;
        
        // Calculate volatility (annualized standard deviation)
        const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized assuming daily returns
        
        // Calculate Sharpe ratio
        const excessReturn = mean - (riskFreeRate / 252); // Daily excess return
        const sharpeRatio = (excessReturn / Math.sqrt(variance)) * Math.sqrt(252); // Annualized
        
        this.portfolioMetrics.performance = {
            totalReturn,
            annualizedReturn: Math.pow(1 + totalReturn, 252 / returns.length) - 1,
            volatility,
            sharpeRatio,
            mean,
            maxDrawdown: this._calculateMaxDrawdown(returns),
            lastUpdated: new Date().toISOString()
        };
        
        return this.portfolioMetrics.performance;
    }
    
    /**
     * Calculate maximum drawdown from returns
     * @param {Array} returns - Array of returns
     * @returns {number} Maximum drawdown
     * @private
     */
    _calculateMaxDrawdown(returns) {
        let peak = 1;
        let maxDrawdown = 0;
        let value = 1;
        
        for (const ret of returns) {
            value *= (1 + ret);
            if (value > peak) {
                peak = value;
            }
            
            const drawdown = (peak - value) / peak;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        }
        
        return maxDrawdown;
    }
    
    /**
     * Set configuration options
     * @param {Object} config - Configuration options
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        
        // Recreate allocation models if golden ratio setting changed
        if (config.useGoldenRatio !== undefined && config.useGoldenRatio !== this.config.useGoldenRatio) {
            this.allocationModels = {
                conservative: this._createAllocationModel('conservative'),
                balanced: this._createAllocationModel('balanced'),
                growth: this._createAllocationModel('growth'),
                aggressive: this._createAllocationModel('aggressive')
            };
        }
        
        console.log("💼 Portfolio Balance Harmonic reconfigured");
        console.log(`   Rebalance Threshold: ${(this.config.rebalanceThreshold * 100).toFixed(2)}%`);
        console.log(`   Default Risk Level: ${this.config.defaultRiskLevel}`);
    }
}

module.exports = { PortfolioBalanceHarmonic };

// Demo if run directly
if (require.main === module) {
    async function demoPortfolioBalance() {
        const harmonic = new PortfolioBalanceHarmonic();
        
        // Current portfolio
        const currentPortfolio = {
            allocation: {
                bonds: 0.4,
                stocks: 0.4,
                cash: 0.1,
                alternatives: 0.1
            },
            values: {
                bonds: 40000,
                stocks: 40000,
                cash: 10000,
                alternatives: 10000
            }
        };
        
        // Mock market conditions with volatility data
        const marketConditions = {
            volatility: {
                currentVolatility: 0.18,
                historicalAverage: 0.15,
                trend: 'bullish',
                cyclePosition: 'expansion'
            },
            interestRates: {
                current: 0.04,
                trend: 'rising'
            }
        };
        
        // Optimize allocation
        const optimized = harmonic.optimizeAllocation(currentPortfolio.allocation, marketConditions, 'growth');
        console.log("\n📊 Optimized Allocation:", optimized);
        
        // Generate rebalancing plan
        const plan = harmonic.generateRebalancingPlan(currentPortfolio);
        console.log("\n⚖️ Rebalancing Plan:", plan);
        
        // Apply harmonic enhancement
        const enhanced = harmonic.applyHarmonicEnhancement(optimized.targetAllocation);
        console.log("\n🎵 Harmonically Enhanced Weights:");
        for (const [asset, weight] of Object.entries(enhanced)) {
            console.log(`   ${asset}: ${(weight * 100).toFixed(2)}%`);
        }
    }
    
    demoPortfolioBalance().catch(console.error);
}