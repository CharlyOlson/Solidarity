/**
 * Solidarity Platform Integration
 * Main module that orchestrates all components of the Henry 7 Step 14 Shoe Waltz system
 * 
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 * @trademark Scott Charles Olson
 */

import Henry7Step14ShoeWaltz from './henry-7-step-14-shoe-waltz.js';
import SolidarityProcessor from './processor.js';
import SoulEdXchang from './soul-edxchang.js';
import StonenSync from './stonensync.js';
import CubitCalculationSystem from './cubit-calculation.js';
import ErrorHandler from './error-handler.js';

export class SolidarityPlatform {
    constructor(config = {}) {
        this.config = {
            enableAllModules: config.enableAllModules ?? true,
            preferredDimension: config.preferredDimension ?? '9D',
            archiveDimension: config.archiveDimension ?? '12D',
            autoStartSync: config.autoStartSync ?? false,
            ...config
        };

        // Initialize error handler first
        this.errorHandler = new ErrorHandler(this.config);

        // Initialize core components
        this.waltz = new Henry7Step14ShoeWaltz();
        this.processor = new SolidarityProcessor(this.config);
        this.soulEdXchang = new SoulEdXchang(this.config);
        this.stonenSync = new StonenSync(this.config);
        this.cubitSystem = new CubitCalculationSystem(this.config);

        this.platformState = 'initialized';
        this.integratedSessions = new Map();
        this.systemMetrics = {
            startTime: Date.now(),
            totalSessions: 0,
            successfulCompletions: 0,
            totalCubitsAllocated: this.cubitSystem.calculations.totalCubits
        };

        if (this.config.autoStartSync) {
            this.stonenSync.startSync();
        }
    }

    /**
     * Execute complete integrated session with all components
     */
    async executeIntegratedSession(sessionData = {}) {
        const sessionId = `integrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            this.systemMetrics.totalSessions++;
            
            const session = {
                id: sessionId,
                startTime: Date.now(),
                phases: {},
                components: {
                    waltz: null,
                    processor: null,
                    soulEdXchang: null,
                    stonenSync: null,
                    cubitAllocation: null
                },
                state: 'running'
            };

            // Phase 1: Execute Henry 7 Step 14 Shoe Waltz
            session.phases.waltz = await this.executeWaltzPhase(session);
            
            // Phase 2: Process through staged pipeline
            session.phases.processor = await this.executeProcessorPhase(session);
            
            // Phase 3: Soul.Ed.Xchang negotiation and exchange
            session.phases.exchange = await this.executeExchangePhase(session, sessionData);
            
            // Phase 4: StonenSync stone state management
            session.phases.sync = await this.executeSyncPhase(session);
            
            // Phase 5: Cubit allocation and validation
            session.phases.cubits = await this.executeCubitPhase(session);
            
            // Final integration validation
            const validation = await this.validateIntegratedSession(session);
            
            session.state = validation.success ? 'completed' : 'failed';
            session.validation = validation;
            session.endTime = Date.now();
            session.duration = session.endTime - session.startTime;

            this.integratedSessions.set(sessionId, session);
            
            if (validation.success) {
                this.systemMetrics.successfulCompletions++;
            }

            return {
                sessionId,
                success: validation.success,
                session,
                totalCubits: this.systemMetrics.totalCubitsAllocated,
                platformMetrics: this.getSystemMetrics()
            };

        } catch (error) {
            // Log error appropriately based on environment
            this.errorHandler.logError(error, `integrated session ${sessionId}`);
            
            const errorResponse = this.errorHandler.createErrorResponse(error, {
                sessionId
            });
            
            const errorSession = {
                id: sessionId,
                state: 'error',
                error: error.message,
                timestamp: Date.now()
            };
            
            this.integratedSessions.set(sessionId, errorSession);
            
            return errorResponse;
        }
    }

    /**
     * Execute waltz phase
     */
    async executeWaltzPhase(session) {
        const waltzResult = this.waltz.waltz();
        session.components.waltz = waltzResult;
        
        return {
            completed: true,
            result: waltzResult,
            harmonicValidation: waltzResult.validated,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute processor phase with staged gating
     */
    async executeProcessorPhase(session) {
        const processorResult = await this.processor.processWithStaging();
        session.components.processor = processorResult;
        
        return {
            completed: processorResult.success,
            result: processorResult,
            phases: processorResult.stages || null,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute exchange phase
     */
    async executeExchangePhase(session, sessionData) {
        // Initialize soul.edXchang session
        const participantA = sessionData.participantA || { id: 'system', type: 'platform' };
        const participantB = sessionData.participantB || { id: 'user', type: 'external' };
        
        const exchangeSession = this.soulEdXchang.initializeSession(participantA, participantB, 'integrated');
        
        // Negotiate exchange
        const proposalA = sessionData.proposalA || { value: 7, type: 'truth_seeking' };
        const proposalB = sessionData.proposalB || { value: 14, type: 'scaled_share' };
        
        const negotiation = await this.soulEdXchang.negotiateExchange(
            exchangeSession.sessionId, 
            proposalA, 
            proposalB
        );
        
        // Execute exchange
        const exchangeData = sessionData.exchangeData || { 
            content: 'henry_7_step_14_shoe_waltz_integration',
            value: 49 
        };
        
        const exchange = await this.soulEdXchang.executeExchange(
            exchangeSession.sessionId,
            exchangeData
        );
        
        // Certify completion
        const certification = await this.soulEdXchang.certifyCompletion(exchangeSession.sessionId);
        
        session.components.soulEdXchang = {
            session: exchangeSession,
            negotiation,
            exchange,
            certification
        };
        
        return {
            completed: true,
            sessionId: exchangeSession.sessionId,
            negotiated: negotiation.success,
            certified: certification.certified,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute sync phase
     */
    async executeSyncPhase(session) {
        const stoneId = `stone_${session.id}`;
        
        // Set stone state based on session progress
        const stoneResult = this.stonenSync.setStoneState(stoneId, 'integrated_session', {
            finalize: true
        });
        
        session.components.stonenSync = stoneResult;
        
        return {
            completed: true,
            stoneId,
            stoneResult,
            syncStatus: this.stonenSync.getSyncStatus(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute cubit allocation phase
     */
    async executeCubitPhase(session) {
        const cubitAllocation = this.cubitSystem.getCubitAllocation();
        const validation = this.cubitSystem.validateCubitSystem();
        
        session.components.cubitAllocation = {
            allocation: cubitAllocation,
            validation
        };
        
        return {
            completed: true,
            totalCubits: cubitAllocation.total.cubits,
            allocation: cubitAllocation,
            validated: validation.valid,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validate complete integrated session
     */
    async validateIntegratedSession(session) {
        const validations = {
            waltzValid: session.components.waltz?.validated || false,
            processorValid: session.components.processor?.success || false,
            exchangeValid: session.components.soulEdXchang?.certification?.certified || false,
            syncValid: session.components.stonenSync?.updated || false,
            cubitValid: session.components.cubitAllocation?.validation?.valid || false
        };

        const allValid = Object.values(validations).every(v => v === true);

        // Additional harmonic validation
        const harmonicAlignment = this.validateHarmonicAlignment(session);
        
        return {
            success: allValid && harmonicAlignment.aligned,
            validations,
            harmonicAlignment,
            totalCubits: session.components.cubitAllocation?.allocation?.total?.cubits || 0,
            sessionDuration: Date.now() - session.startTime,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validate harmonic alignment across all components
     */
    validateHarmonicAlignment(session) {
        const components = session.components;
        
        // Check if all components are aligned to the 7-14-49 progression
        const alignments = {
            waltzBase: components.waltz?.progression?.base === 7,
            processorPhases: components.processor?.stages?.base?.value === 7,
            exchangeBasis: components.soulEdXchang?.session?.truthSeekingBasis === 7,
            cubitProgression: components.cubitAllocation?.validation?.validations?.henryProgression || false
        };

        const aligned = Object.values(alignments).every(a => a === true);
        
        return {
            aligned,
            alignments,
            harmonicResonance: aligned ? 'complete' : 'partial'
        };
    }

    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        return {
            platform: {
                state: this.platformState,
                uptime: Date.now() - this.systemMetrics.startTime,
                preferredDimension: this.config.preferredDimension,
                archiveDimension: this.config.archiveDimension
            },
            components: {
                waltz: { available: true, validated: this.waltz.validateBase() },
                processor: this.processor.getStatus(),
                soulEdXchang: { 
                    activeSessions: this.soulEdXchang.sessions.size,
                    activeNegotiations: this.soulEdXchang.activeNegotiations.size
                },
                stonenSync: this.stonenSync.getSyncStatus(),
                cubitSystem: {
                    totalCubits: this.cubitSystem.calculations.totalCubits,
                    validated: this.cubitSystem.validateCubitSystem().valid
                }
            },
            metrics: this.systemMetrics,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get system metrics
     */
    getSystemMetrics() {
        return {
            ...this.systemMetrics,
            successRate: this.systemMetrics.totalSessions > 0 
                ? this.systemMetrics.successfulCompletions / this.systemMetrics.totalSessions 
                : 0,
            averageSessionDuration: this.calculateAverageSessionDuration(),
            uptime: Date.now() - this.systemMetrics.startTime
        };
    }

    /**
     * Calculate average session duration
     */
    calculateAverageSessionDuration() {
        const completedSessions = Array.from(this.integratedSessions.values())
            .filter(s => s.duration);
            
        if (completedSessions.length === 0) return 0;
        
        const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
        return totalDuration / completedSessions.length;
    }

    /**
     * Get session history
     */
    getSessionHistory(limit = 10) {
        return Array.from(this.integratedSessions.values())
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, limit);
    }

    /**
     * Shutdown platform gracefully
     */
    async shutdown() {
        this.platformState = 'shutting_down';
        
        // Stop sync if running
        if (this.stonenSync.syncState === 'syncing') {
            this.stonenSync.stopSync();
        }
        
        this.platformState = 'shutdown';
        
        return {
            shutdown: true,
            finalMetrics: this.getSystemMetrics(),
            timestamp: new Date().toISOString()
        };
    }
}

export default SolidarityPlatform;