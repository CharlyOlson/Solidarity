/**
 * Energy-Financial Trading Harmonic
 * Cross-market correlation analysis between energy markets and financial instruments
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 * @version 1.0.0
 */

const { SacredNumericSequence } = require('./SacredNumericSequence');
const { MarketVolatilityHarmonic } = require('./MarketVolatilityHarmonic');
const { PortfolioBalanceHarmonic } = require('./PortfolioBalanceHarmonic');
const fs = require('fs');
const path = require('path');

class EnergyFinancialTradingHarmonic {
    constructor(config = {}) {
        this.config = {
            correlationThreshold: config.correlationThreshold || 0.618, // Golden ratio threshold
            persistenceWindow: config.persistenceWindow || 21, // Fibonacci number
            energyWeightFactor: config.energyWeightFactor || 0.382, // φ^-1
            baseCurrency: config.baseCurrency || 'USD',
            solidarityNode: config.solidarityNode || 4, // Node 4 for cross-market operations
            logLevel: config.logLevel || 'info'
        };
        
        this.sacredSequence = new SacredNumericSequence();
        this.volatilityHarmonic = new MarketVolatilityHarmonic();
        this.portfolioHarmonic = new PortfolioBalanceHarmonic({
            solidarityNode: this.config.solidarityNode
        });
        
        this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio (φ)
        this.phiInverse = 1 / this.phi;    // Golden ratio inverse
        
        // Energy market segments to track
        this.energySectors = [
            'oil', 'naturalGas', 'renewables', 'electricity', 
            'uranium', 'coal', 'hydrogen'
        ];
        
        // Financial instruments to correlate
        this.financialInstruments = [
            'stocks', 'bonds', 'commodities', 'currencies', 
            'derivatives', 'cryptocurrencies'
        ];
        
        this.correlationMatrix = this._initializeCorrelationMatrix();
        this.harmonicPatterns = {};
        this.tradingSignals = [];
        
        console.log("⚡💹 Energy-Financial Trading Harmonic initialized");
        console.log(`   Correlation Threshold: ${this.config.correlationThreshold}`);
        console.log(`   Persistence Window: ${this.config.persistenceWindow} periods`);
        console.log(`   Energy Weight Factor: ${this.config.energyWeightFactor}`);
        console.log(`   Solidarity Node: ${this.config.solidarityNode}`);
    }
    
    /**
     * Initialize the cross-market correlation matrix
     * @returns {Object} Empty correlation matrix
     * @private
     */
    _initializeCorrelationMatrix() {
        const matrix = {};
        
        for (const energySector of this.energySectors) {
            matrix[energySector] = {};
            
            for (const instrument of this.financialInstruments) {
                matrix[energySector][instrument] = {
                    correlation: 0,
                    trend: 'neutral',
                    persistence: 0,
                    lastUpdated: null,
                    signal: 'none'
                };
            }
        }
        
        return matrix;
    }
    
    /**
     * Update the correlation matrix with new market data
     * @param {Object} energyData - Energy market data
     * @param {Object} financialData - Financial market data
     * @returns {Object} Updated correlation matrix
     */
    updateCorrelationMatrix(energyData, financialData) {
        console.log("⚡💹 Updating cross-market correlation matrix...");
        
        if (!energyData || !financialData) {
            throw new Error('Energy and financial market data required');
        }
        
        // Verify data structure
        for (const sector of this.energySectors) {
            if (!energyData[sector] || !energyData[sector].prices || !Array.isArray(energyData[sector].prices)) {
                if (this.config.logLevel === 'debug') {
                    console.warn(`Missing or invalid data for energy sector: ${sector}`);
                }
                continue;
            }
            
            for (const instrument of this.financialInstruments) {
                if (!financialData[instrument] || !financialData[instrument].prices || !Array.isArray(financialData[instrument].prices)) {
                    if (this.config.logLevel === 'debug') {
                        console.warn(`Missing or invalid data for financial instrument: ${instrument}`);
                    }
                    continue;
                }
                
                // Calculate correlation
                const correlation = this._calculateCorrelation(
                    energyData[sector].prices,
                    financialData[instrument].prices
                );
                
                const previousCorrelation = this.correlationMatrix[sector][instrument].correlation;
                const trend = correlation > previousCorrelation ? 'rising' : 
                             correlation < previousCorrelation ? 'falling' : 'stable';
                
                // Update persistence counter
                let persistence = this.correlationMatrix[sector][instrument].persistence;
                if (Math.abs(correlation) >= this.config.correlationThreshold) {
                    persistence += 1;
                } else {
                    persistence = 0;
                }
                
                // Update matrix
                this.correlationMatrix[sector][instrument] = {
                    correlation,
                    trend,
                    persistence,
                    lastUpdated: new Date().toISOString(),
                    signal: this._determineSignal(correlation, persistence, trend)
                };
            }
        }
        
        // Generate trading signals after updating matrix
        this._generateTradingSignals();
        
        return this.correlationMatrix;
    }
    
    /**
     * Calculate Pearson correlation coefficient between two price series
     * @param {Array} energyPrices - Energy market prices
     * @param {Array} financialPrices - Financial instrument prices
     * @returns {number} Correlation coefficient
     * @private
     */
    _calculateCorrelation(energyPrices, financialPrices) {
        // Ensure equal length by using the shorter series
        const length = Math.min(energyPrices.length, financialPrices.length);
        
        if (length < 3) {
            return 0; // Not enough data points
        }
        
        const energySeries = energyPrices.slice(-length);
        const financialSeries = financialPrices.slice(-length);
        
        // Calculate returns instead of using raw prices
        const energyReturns = [];
        const financialReturns = [];
        
        for (let i = 1; i < length; i++) {
            energyReturns.push((energySeries[i] - energySeries[i-1]) / energySeries[i-1]);
            financialReturns.push((financialSeries[i] - financialSeries[i-1]) / financialSeries[i-1]);
        }
        
        // Calculate means
        const energyMean = energyReturns.reduce((sum, val) => sum + val, 0) / energyReturns.length;
        const financialMean = financialReturns.reduce((sum, val) => sum + val, 0) / financialReturns.length;
        
        // Calculate correlation
        let numerator = 0;
        let energyDenominator = 0;
        let financialDenominator = 0;
        
        for (let i = 0; i < energyReturns.length; i++) {
            const energyDiff = energyReturns[i] - energyMean;
            const financialDiff = financialReturns[i] - financialMean;
            
            numerator += energyDiff * financialDiff;
            energyDenominator += energyDiff * energyDiff;
            financialDenominator += financialDiff * financialDiff;
        }
        
        const denominator = Math.sqrt(energyDenominator * financialDenominator);
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    /**
     * Determine trading signal based on correlation metrics
     * @param {number} correlation - Correlation value
     * @param {number} persistence - Persistence count
     * @param {string} trend - Correlation trend
     * @returns {string} Trading signal
     * @private
     */
    _determineSignal(correlation, persistence, trend) {
        // Strong positive correlation that persists
        if (correlation > this.config.correlationThreshold && 
            persistence >= this.config.persistenceWindow / 2) {
            return trend === 'rising' ? 'strong_buy' : 'buy';
        } 
        // Strong negative correlation that persists
        else if (correlation < -this.config.correlationThreshold && 
                 persistence >= this.config.persistenceWindow / 2) {
            return trend === 'falling' ? 'strong_sell' : 'sell';
        }
        // Moderate correlation
        else if (Math.abs(correlation) > this.config.correlationThreshold * this.phiInverse) {
            return correlation > 0 ? 'weak_buy' : 'weak_sell';
        }
        
        return 'neutral';
    }
    
    /**
     * Generate trading signals based on cross-market correlations
     * @returns {Array} Array of trading signals
     * @private
     */
    _generateTradingSignals() {
        const signals = [];
        const now = new Date().toISOString();
        
        // Find significant correlations
        for (const sector of this.energySectors) {
            for (const instrument of this.financialInstruments) {
                const data = this.correlationMatrix[sector][instrument];
                
                // Only consider signals with sufficient persistence
                if (data.persistence >= this.config.persistenceWindow / 3 && 
                    data.signal !== 'neutral' && data.signal !== 'none') {
                    
                    // Apply sacred sequence to determine signal strength
                    const signalStrength = this._applySequenceToSignal(
                        data.correlation, 
                        data.persistence, 
                        sector,
                        instrument
                    );
                    
                    signals.push({
                        type: data.signal,
                        strength: signalStrength,
                        sector,
                        instrument,
                        correlation: data.correlation,
                        persistence: data.persistence,
                        trend: data.trend,
                        timestamp: now
                    });
                }
            }
        }
        
        // Sort signals by strength (descending)
        this.tradingSignals = signals.sort((a, b) => b.strength - a.strength);
        
        if (this.tradingSignals.length > 0) {
            console.log(`✅ Generated ${this.tradingSignals.length} trading signals`);
            if (this.config.logLevel === 'info' || this.config.logLevel === 'debug') {
                console.log("   Top signals:");
                for (let i = 0; i < Math.min(3, this.tradingSignals.length); i++) {
                    const signal = this.tradingSignals[i];
                    console.log(`     ${i+1}. ${signal.type.toUpperCase()} ${signal.instrument} (${signal.sector}) - Strength: ${signal.strength.toFixed(2)}, Corr: ${signal.correlation.toFixed(3)}`);
                }
            }
        } else {
            console.log("ℹ️ No significant trading signals generated");
        }
        
        return this.tradingSignals;
    }
    
    /**
     * Apply sacred sequence to determine signal strength
     * @param {number} correlation - Correlation value
     * @param {number} persistence - Persistence count
     * @param {string} sector - Energy sector
     * @param {string} instrument - Financial instrument
     * @returns {number} Signal strength
     * @private
     */
    _applySequenceToSignal(correlation, persistence, sector, instrument) {
        const nodeId = this.config.solidarityNode;
        
        // Generate harmonic frequencies for the node
        const harmonics = this.sacredSequence.generateHarmonicFrequencies('fibonacci', nodeId);
        
        // Map correlation to fundamental frequency
        const normalizedCorrelation = Math.abs(correlation);
        
        // Calculate signal strength based on correlation and persistence
        const persistenceRatio = persistence / this.config.persistenceWindow;
        const sectorIndex = this.energySectors.indexOf(sector) % harmonics.overtones.length;
        const instrumentIndex = this.financialInstruments.indexOf(instrument) % harmonics.undertones.length;
        
        // Apply harmonic overtones and undertones from the sacred sequence
        const sectorHarmonic = harmonics.overtones[sectorIndex] / harmonics.fundamental;
        const instrumentHarmonic = harmonics.undertones[instrumentIndex] / harmonics.fundamental;
        
        // Calculate signal strength with golden ratio weighting
        const signalStrength = (
            normalizedCorrelation * this.phi +
            persistenceRatio * this.phi +
            sectorHarmonic * this.phiInverse +
            instrumentHarmonic * this.phiInverse
        ) / (this.phi * 2 + this.phiInverse * 2);
        
        return signalStrength;
    }
    
    /**
     * Analyze energy market impact on financial portfolio
     * @param {Object} portfolioData - Current portfolio allocation and values
     * @param {Object} energyExposure - Current exposure to energy markets
     * @returns {Object} Impact analysis and recommendations
     */
    analyzeEnergyImpact(portfolioData, energyExposure) {
        console.log("⚡💹 Analyzing energy market impact on financial portfolio...");
        
        if (!portfolioData || !energyExposure) {
            throw new Error('Portfolio data and energy exposure data required');
        }
        
        const impactByAsset = {};
        const recommendations = [];
        
        // Calculate total portfolio value
        let totalPortfolioValue = 0;
        for (const asset in portfolioData.values) {
            totalPortfolioValue += portfolioData.values[asset];
        }
        
        // Calculate total energy exposure
        let totalEnergyExposure = 0;
        for (const sector in energyExposure) {
            if (this.energySectors.includes(sector)) {
                totalEnergyExposure += energyExposure[sector];
            }
        }
        
        const energyExposureRatio = totalEnergyExposure / totalPortfolioValue;
        
        // Analyze impact for each asset class
        for (const asset in portfolioData.values) {
            impactByAsset[asset] = { risk: 0, opportunity: 0, recommendation: 'hold' };
            let assetCorrelation = 0;
            let correlationCount = 0;
            
            // Aggregate correlations for this asset class
            for (const sector of this.energySectors) {
                if (this.correlationMatrix[sector][asset]) {
                    assetCorrelation += this.correlationMatrix[sector][asset].correlation;
                    correlationCount++;
                }
            }
            
            // Calculate average correlation
            const avgCorrelation = correlationCount > 0 ? assetCorrelation / correlationCount : 0;
            
            // Determine risk and opportunity
            impactByAsset[asset].risk = Math.max(0, avgCorrelation * energyExposureRatio * this.config.energyWeightFactor);
            impactByAsset[asset].opportunity = Math.max(0, -avgCorrelation * energyExposureRatio * this.config.energyWeightFactor);
            
            // Generate recommendation
            if (impactByAsset[asset].risk > 0.1) {
                impactByAsset[asset].recommendation = 'reduce';
                recommendations.push({
                    asset,
                    action: 'reduce',
                    reason: `High energy market risk exposure (${(impactByAsset[asset].risk * 100).toFixed(1)}%)`,
                    priority: impactByAsset[asset].risk
                });
            } else if (impactByAsset[asset].opportunity > 0.1) {
                impactByAsset[asset].recommendation = 'increase';
                recommendations.push({
                    asset,
                    action: 'increase',
                    reason: `Energy market opportunity (${(impactByAsset[asset].opportunity * 100).toFixed(1)}%)`,
                    priority: impactByAsset[asset].opportunity
                });
            }
        }
        
        // Overall energy-financial exposure assessment
        const exposureAssessment = this._assessEnergyFinancialExposure(energyExposureRatio);
        
        // Sort recommendations by priority
        recommendations.sort((a, b) => b.priority - a.priority);
        
        const analysis = {
            timestamp: new Date().toISOString(),
            portfolioValue: totalPortfolioValue,
            energyExposure: totalEnergyExposure,
            energyExposureRatio,
            exposureAssessment,
            impactByAsset,
            recommendations
        };
        
        if (this.config.logLevel === 'info' || this.config.logLevel === 'debug') {
            console.log(`   Energy Exposure: ${(energyExposureRatio * 100).toFixed(2)}% of portfolio`);
            console.log(`   Assessment: ${exposureAssessment.level} - ${exposureAssessment.description}`);
            if (recommendations.length > 0) {
                console.log("   Top recommendations:");
                for (let i = 0; i < Math.min(3, recommendations.length); i++) {
                    const rec = recommendations[i];
                    console.log(`     ${i+1}. ${rec.action.toUpperCase()} ${rec.asset} - ${rec.reason}`);
                }
            }
        }
        
        return analysis;
    }
    
    /**
     * Assess energy-financial exposure level
     * @param {number} exposureRatio - Energy exposure ratio
     * @returns {Object} Exposure assessment
     * @private
     */
    _assessEnergyFinancialExposure(exposureRatio) {
        // Use golden ratio principles for thresholds
        const lowThreshold = this.phiInverse * this.phiInverse; // φ^-2 ≈ 0.382
        const highThreshold = this.phiInverse; // φ^-1 ≈ 0.618
        
        if (exposureRatio < lowThreshold) {
            return {
                level: 'low',
                description: 'Limited energy market exposure',
                recommendation: 'Consider increasing strategic energy holdings if signals are positive'
            };
        } else if (exposureRatio > highThreshold) {
            return {
                level: 'high',
                description: 'Significant energy market exposure',
                recommendation: 'Consider hedging strategies to mitigate energy market volatility'
            };
        } else {
            return {
                level: 'balanced',
                description: 'Balanced energy market exposure',
                recommendation: 'Maintain current exposure with targeted adjustments based on signals'
            };
        }
    }
    
    /**
     * Generate cross-market arbitrage opportunities
     * @returns {Array} List of arbitrage opportunities
     */
    generateArbitrageOpportunities() {
        const opportunities = [];
        const pairwiseRelations = this._analyzePairwiseRelations();
        
        // Find triangular arbitrage patterns
        for (const sector of this.energySectors) {
            for (const instrument1 of this.financialInstruments) {
                const rel1 = this.correlationMatrix[sector][instrument1];
                
                // Skip if no significant correlation
                if (Math.abs(rel1.correlation) < this.config.correlationThreshold * this.phiInverse) {
                    continue;
                }
                
                for (const instrument2 of this.financialInstruments) {
                    // Skip self-comparison
                    if (instrument1 === instrument2) continue;
                    
                    const rel2 = this.correlationMatrix[sector][instrument2];
                    const relPair = pairwiseRelations[instrument1][instrument2];
                    
                    // Skip if not all correlations are significant
                    if (Math.abs(rel2.correlation) < this.config.correlationThreshold * this.phiInverse || 
                        Math.abs(relPair) < this.config.correlationThreshold * this.phiInverse) {
                        continue;
                    }
                    
                    // Check for divergence arbitrage opportunity
                    const divergence = this._calculateDivergence(rel1.correlation, rel2.correlation, relPair);
                    
                    if (divergence > this.config.correlationThreshold * this.phiInverse) {
                        opportunities.push({
                            type: 'triangular',
                            divergenceScore: divergence,
                            elements: {
                                energySector: sector,
                                instrument1,
                                instrument2
                            },
                            correlations: {
                                sectorToInst1: rel1.correlation,
                                sectorToInst2: rel2.correlation,
                                inst1ToInst2: relPair
                            },
                            strategy: this._generateArbitrageStrategy(sector, instrument1, instrument2, rel1, rel2, relPair),
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
        }
        
        // Sort opportunities by divergence score
        opportunities.sort((a, b) => b.divergenceScore - a.divergenceScore);
        
        if (opportunities.length > 0) {
            console.log(`✅ Found ${opportunities.length} cross-market arbitrage opportunities`);
            if (this.config.logLevel === 'info' || this.config.logLevel === 'debug') {
                console.log("   Top opportunities:");
                for (let i = 0; i < Math.min(3, opportunities.length); i++) {
                    const opp = opportunities[i];
                    console.log(`     ${i+1}. ${opp.elements.energySector} ↔ ${opp.elements.instrument1} ↔ ${opp.elements.instrument2} (Score: ${opp.divergenceScore.toFixed(3)})`);
                    console.log(`        Strategy: ${opp.strategy.action}`);
                }
            }
        } else {
            console.log("ℹ️ No significant arbitrage opportunities found");
        }
        
        return opportunities;
    }
    
    /**
     * Analyze pairwise relations between financial instruments
     * @returns {Object} Matrix of pairwise correlations
     * @private
     */
    _analyzePairwiseRelations() {
        const pairwiseMatrix = {};
        
        for (const inst1 of this.financialInstruments) {
            pairwiseMatrix[inst1] = {};
            
            for (const inst2 of this.financialInstruments) {
                // Skip self-comparison
                if (inst1 === inst2) {
                    pairwiseMatrix[inst1][inst2] = 1;
                    continue;
                }
                
                // Check if we already calculated this pair
                if (pairwiseMatrix[inst2] && pairwiseMatrix[inst2][inst1] !== undefined) {
                    pairwiseMatrix[inst1][inst2] = pairwiseMatrix[inst2][inst1];
                    continue;
                }
                
                // Calculate implied correlation
                let sumProduct = 0;
                let count = 0;
                
                for (const sector of this.energySectors) {
                    const corr1 = this.correlationMatrix[sector][inst1].correlation;
                    const corr2 = this.correlationMatrix[sector][inst2].correlation;
                    
                    // Only consider significant correlations
                    if (Math.abs(corr1) > 0.2 && Math.abs(corr2) > 0.2) {
                        sumProduct += corr1 * corr2;
                        count++;
                    }
                }
                
                const impliedCorrelation = count > 0 ? sumProduct / count : 0;
                pairwiseMatrix[inst1][inst2] = impliedCorrelation;
            }
        }
        
        return pairwiseMatrix;
    }
    
    /**
     * Calculate divergence score for potential arbitrage
     * @param {number} corr1 - First correlation
     * @param {number} corr2 - Second correlation
     * @param {number} corrPair - Pair correlation
     * @returns {number} Divergence score
     * @private
     */
    _calculateDivergence(corr1, corr2, corrPair) {
        // Calculate expected correlation based on transitivity
        const expectedCorr = corr1 * corr2;
        
        // Calculate divergence
        return Math.abs(corrPair - expectedCorr);
    }
    
    /**
     * Generate arbitrage strategy based on correlation pattern
     * @param {string} sector - Energy sector
     * @param {string} inst1 - First financial instrument
     * @param {string} inst2 - Second financial instrument
     * @param {Object} rel1 - First relationship data
     * @param {Object} rel2 - Second relationship data
     * @param {number} relPair - Pair relationship
     * @returns {Object} Arbitrage strategy
     * @private
     */
    _generateArbitrageStrategy(sector, inst1, inst2, rel1, rel2, relPair) {
        const signCorr1 = Math.sign(rel1.correlation);
        const signCorr2 = Math.sign(rel2.correlation);
        const signPair = Math.sign(relPair);
        
        let action;
        
        // Generate strategy based on correlation signs
        if (signCorr1 > 0 && signCorr2 > 0 && signPair < 0) {
            action = `Long ${sector} and short the ${inst1}-${inst2} spread`;
        } else if (signCorr1 < 0 && signCorr2 < 0 && signPair < 0) {
            action = `Short ${sector} and short the ${inst1}-${inst2} spread`;
        } else if (signCorr1 > 0 && signCorr2 < 0 && signPair < 0) {
            action = `Long ${sector}, long ${inst1}, and long ${inst2}`;
        } else if (signCorr1 < 0 && signCorr2 > 0 && signPair < 0) {
            action = `Short ${sector}, short ${inst1}, and short ${inst2}`;
        } else if (signCorr1 > 0 && signCorr2 > 0 && signPair > 0) {
            action = `Long ${sector}, long ${inst1}, and short ${inst2}`;
        } else {
            action = `Arbitrage opportunity between ${sector}, ${inst1}, and ${inst2} based on correlation divergence`;
        }
        
        return {
            action,
            position1: signCorr1 > 0 ? 'long' : 'short',
            position2: signCorr2 > 0 ? 'long' : 'short',
            positionPair: signPair > 0 ? 'long' : 'short'
        };
    }
    
    /**
     * Detect harmonic patterns in energy-financial correlations
     * @param {Object} historicalCorrelations - Historical correlation data
     * @returns {Object} Detected harmonic patterns
     */
    detectHarmonicPatterns(historicalCorrelations) {
        if (!historicalCorrelations || !Array.isArray(historicalCorrelations) || historicalCorrelations.length < 10) {
            throw new Error('Sufficient historical correlation data required (minimum 10 periods)');
        }
        
        console.log("🔍 Detecting harmonic patterns in energy-financial correlations...");
        
        const patterns = {};
        
        for (const sector of this.energySectors) {
            patterns[sector] = {};
            
            for (const instrument of this.financialInstruments) {
                const correlationTimeSeries = historicalCorrelations.map(h => 
                    h[sector] && h[sector][instrument] ? h[sector][instrument].correlation : null
                ).filter(c => c !== null);
                
                if (correlationTimeSeries.length < 10) {
                    continue; // Not enough data points
                }
                
                // Detect cycles using sacred sequence
                const cycleDetection = this._detectCycles(correlationTimeSeries);
                
                // Apply sacred sequence to pattern detection
                const sequenceAnalysis = this._applySequenceToPattern(correlationTimeSeries, sector, instrument);
                
                patterns[sector][instrument] = {
                    cycles: cycleDetection,
                    sequenceAnalysis,
                    harmonicPattern: this._determineHarmonicPattern(cycleDetection, sequenceAnalysis),
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        this.harmonicPatterns = patterns;
        
        // Count detected patterns
        let patternCount = 0;
        for (const sector in patterns) {
            for (const instrument in patterns[sector]) {
                if (patterns[sector][instrument].harmonicPattern.type !== 'none') {
                    patternCount++;
                }
            }
        }
        
        console.log(`✅ Detected ${patternCount} harmonic patterns`);
        
        return patterns;
    }
    
    /**
     * Detect cycles in time series using sacred numeric sequence
     * @param {Array} timeSeries - Time series data
     * @returns {Object} Cycle detection results
     * @private
     */
    _detectCycles(timeSeries) {
        const fibSequence = this.sacredSequence.getSequence('fibonacci', 10);
        const lucasSequence = this.sacredSequence.getSequence('lucas', 10);
        
        // Calculate differences
        const differences = [];
        for (let i = 1; i < timeSeries.length; i++) {
            differences.push(timeSeries[i] - timeSeries[i-1]);
        }
        
        // Find zero crossings
        const zeroCrossings = [];
        for (let i = 1; i < differences.length; i++) {
            if (differences[i-1] * differences[i] < 0) {
                zeroCrossings.push(i);
            }
        }
        
        // Calculate intervals between crossings
        const intervals = [];
        for (let i = 1; i < zeroCrossings.length; i++) {
            intervals.push(zeroCrossings[i] - zeroCrossings[i-1]);
        }
        
        // Find best matching Fibonacci/Lucas number for dominant cycle
        let bestFibMatch = null;
        let bestFibDiff = Infinity;
        let bestLucasMatch = null;
        let bestLucasDiff = Infinity;
        
        if (intervals.length > 0) {
            const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            
            for (const fib of fibSequence) {
                const diff = Math.abs(fib - avgInterval);
                if (diff < bestFibDiff) {
                    bestFibDiff = diff;
                    bestFibMatch = fib;
                }
            }
            
            for (const lucas of lucasSequence) {
                const diff = Math.abs(lucas - avgInterval);
                if (diff < bestLucasDiff) {
                    bestLucasDiff = diff;
                    bestLucasMatch = lucas;
                }
            }
        }
        
        // Determine if the cycle matches a golden ratio pattern
        const goldenRatioMatch = bestFibMatch && bestLucasMatch ? 
            Math.abs((bestFibMatch / bestLucasMatch) - this.phiInverse) < 0.1 : false;
        
        return {
            zeroCrossings: zeroCrossings.length,
            averageInterval: intervals.length > 0 ? 
                intervals.reduce((sum, val) => sum + val, 0) / intervals.length : null,
            bestFibonacciMatch: bestFibMatch,
            bestLucasMatch: bestLucasMatch,
            goldenRatioMatch,
            cyclicality: zeroCrossings.length > 3 ? 'strong' : 'weak'
        };
    }
    
    /**
     * Apply sacred sequence to pattern detection
     * @param {Array} timeSeries - Time series data
     * @param {string} sector - Energy sector
     * @param {string} instrument - Financial instrument
     * @returns {Object} Sequence analysis results
     * @private
     */
    _applySequenceToPattern(timeSeries, sector, instrument) {
        // Generate harmonic frequencies
        const nodeId = this.config.solidarityNode;
        const harmonics = this.sacredSequence.generateHarmonicFrequencies('fibonacci', nodeId);
        
        // Map time series to harmonic distribution
        const harmonicDistribution = [];
        const seriesMax = Math.max(...timeSeries.map(Math.abs));
        
        for (let i = 0; i < harmonics.overtones.length && i < timeSeries.length; i++) {
            const normalized = timeSeries[i] / seriesMax;
            const harmonicRatio = harmonics.overtones[i] / harmonics.fundamental;
            
            harmonicDistribution.push({
                period: i,
                value: normalized,
                harmonic: harmonicRatio,
                resonance: Math.abs(normalized * harmonicRatio)
            });
        }
        
        // Sort by resonance
        harmonicDistribution.sort((a, b) => b.resonance - a.resonance);
        
        // Check for golden ratio pattern in top resonances
        const topResonances = harmonicDistribution.slice(0, 3);
        let goldenRatioResonance = false;
        
        if (topResonances.length >= 2) {
            const ratio = topResonances[0].resonance / topResonances[1].resonance;
            goldenRatioResonance = Math.abs(ratio - this.phi) < 0.1 || Math.abs(ratio - this.phiInverse) < 0.1;
        }
        
        return {
            dominantPeriod: harmonicDistribution[0]?.period || null,
            resonanceStrength: harmonicDistribution[0]?.resonance || 0,
            goldenRatioResonance,
            harmonicDistribution: harmonicDistribution.slice(0, 5) // Top 5 resonances
        };
    }
    
    /**
     * Determine harmonic pattern type
     * @param {Object} cycles - Cycle detection results
     * @param {Object} sequenceAnalysis - Sequence analysis results
     * @returns {Object} Harmonic pattern
     * @private
     */
    _determineHarmonicPattern(cycles, sequenceAnalysis) {
        // Determine pattern type based on combined analysis
        let type = 'none';
        let confidence = 0;
        let tradingSignal = 'neutral';
        
        if (cycles.goldenRatioMatch && sequenceAnalysis.goldenRatioResonance) {
            type = 'golden_ratio_convergence';
            confidence = 0.9;
            tradingSignal = 'strong_buy';
        } else if (cycles.bestFibonacciMatch === 8 || cycles.bestFibonacciMatch === 13) {
            type = 'fibonacci_cycle';
            confidence = 0.7;
            tradingSignal = 'buy';
        } else if (cycles.bestLucasMatch === 11 || cycles.bestLucasMatch === 7) {
            type = 'lucas_cycle';
            confidence = 0.7;
            tradingSignal = 'weak_buy';
        } else if (sequenceAnalysis.goldenRatioResonance) {
            type = 'resonance_pattern';
            confidence = 0.6;
            tradingSignal = 'weak_buy';
        } else if (cycles.cyclicality === 'strong') {
            type = 'strong_cycle';
            confidence = 0.5;
            tradingSignal = 'neutral';
        }
        
        return {
            type,
            confidence,
            tradingSignal,
            description: this._getPatternDescription(type)
        };
    }
    
    /**
     * Get pattern description
     * @param {string} patternType - Pattern type
     * @returns {string} Pattern description
     * @private
     */
    _getPatternDescription(patternType) {
        switch (patternType) {
            case 'golden_ratio_convergence':
                return 'High-confidence golden ratio pattern with both cycle and resonance convergence';
            case 'fibonacci_cycle':
                return 'Medium-confidence pattern with dominant Fibonacci-based cycle';
            case 'lucas_cycle':
                return 'Medium-confidence pattern with dominant Lucas-based cycle';
            case 'resonance_pattern':
                return 'Moderate-confidence pattern with harmonic resonance but no clear cycle';
            case 'strong_cycle':
                return 'Basic cyclical pattern without golden ratio characteristics';
            default:
                return 'No significant harmonic pattern detected';
        }
    }
    
    /**
     * Get all trading signals
     * @returns {Array} Array of trading signals
     */
    getTradingSignals() {
        return this.tradingSignals;
    }
    
    /**
     * Get the correlation matrix
     * @returns {Object} Correlation matrix
     */
    getCorrelationMatrix() {
        return this.correlationMatrix;
    }
    
    /**
     * Get all detected harmonic patterns
     * @returns {Object} Harmonic patterns
     */
    getHarmonicPatterns() {
        return this.harmonicPatterns;
    }
    
    /**
     * Set configuration options
     * @param {Object} config - Configuration options
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        
        console.log("⚡💹 Energy-Financial Trading Harmonic reconfigured");
        console.log(`   Correlation Threshold: ${this.config.correlationThreshold}`);
        console.log(`   Persistence Window: ${this.config.persistenceWindow} periods`);
        console.log(`   Energy Weight Factor: ${this.config.energyWeightFactor}`);
    }
}

module.exports = { EnergyFinancialTradingHarmonic };

// Demo if run directly
if (require.main === module) {
    async function demoEnergyFinancialTrading() {
        const harmonic = new EnergyFinancialTradingHarmonic();
        
        // Mock energy market data
        const energyData = {
            oil: { 
                prices: [65, 67, 68, 70, 72, 71, 73, 75, 74, 76],
                volatility: 0.12
            },
            naturalGas: { 
                prices: [3.2, 3.3, 3.4, 3.45, 3.5, 3.6, 3.55, 3.5, 3.45, 3.4],
                volatility: 0.15
            },
            renewables: { 
                prices: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51],
                volatility: 0.08
            },
            electricity: { 
                prices: [120, 122, 125, 128, 130, 132, 135, 138, 140, 142],
                volatility: 0.10
            },
            uranium: { 
                prices: [30, 32, 33, 35, 36, 37, 38, 40, 42, 44],
                volatility: 0.20
            }
        };
        
        // Mock financial market data
        const financialData = {
            stocks: { 
                prices: [4200, 4220, 4250, 4280, 4300, 4320, 4350, 4380, 4400, 4420],
                volatility: 0.14
            },
            bonds: { 
                prices: [102, 101.5, 101, 100.5, 100, 99.5, 99, 98.5, 98, 97.5],
                volatility: 0.05
            },
            commodities: { 
                prices: [85, 87, 88, 90, 92, 94, 95, 97, 99, 100],
                volatility: 0.18
            },
            currencies: { 
                prices: [1.1, 1.09, 1.08, 1.07, 1.08, 1.09, 1.10, 1.11, 1.12, 1.13],
                volatility: 0.07
            }
        };
        
        // Update correlation matrix
        const matrix = harmonic.updateCorrelationMatrix(energyData, financialData);
        console.log("\n📊 Correlation Matrix Sample:", {
            oil_stocks: matrix.oil.stocks,
            naturalGas_bonds: matrix.naturalGas.bonds
        });
        
        // Generate trading signals
        const signals = harmonic.getTradingSignals();
        console.log("\n📈 Generated Trading Signals Count:", signals.length);
        
        // Portfolio and energy exposure
        const portfolioData = {
            allocation: {
                stocks: 0.55,
                bonds: 0.30,
                commodities: 0.10,
                currencies: 0.05
            },
            values: {
                stocks: 550000,
                bonds: 300000,
                commodities: 100000,
                currencies: 50000
            }
        };
        
        const energyExposure = {
            oil: 75000,
            naturalGas: 50000,
            renewables: 25000
        };
        
        // Analyze energy impact
        const impact = harmonic.analyzeEnergyImpact(portfolioData, energyExposure);
        console.log("\n⚡ Energy Market Impact Analysis:", impact.exposureAssessment);
        
        // Generate arbitrage opportunities
        const opportunities = harmonic.generateArbitrageOpportunities();
        console.log("\n💹 Generated Arbitrage Opportunities Count:", opportunities.length);
        
        // Historical correlation data (mock)
        const historicalCorrelations = Array(20).fill().map((_, i) => {
            const mockHistory = {};
            
            for (const sector of harmonic.energySectors) {
                mockHistory[sector] = {};
                
                for (const instrument of harmonic.financialInstruments) {
                    // Generate some mock cyclical correlation data
                    mockHistory[sector][instrument] = {
                        correlation: 0.5 * Math.sin(i / (sector.length % 5 + 2)) + 0.2 * Math.cos(i / (instrument.length % 3 + 2)),
                        trend: 'historical',
                        persistence: 0
                    };
                }
            }
            
            return mockHistory;
        });
        
        // Detect harmonic patterns
        const patterns = harmonic.detectHarmonicPatterns(historicalCorrelations);
        console.log("\n🔍 Detected Pattern Example:", patterns.oil.stocks.harmonicPattern);
    }
    
    demoEnergyFinancialTrading().catch(console.error);
}