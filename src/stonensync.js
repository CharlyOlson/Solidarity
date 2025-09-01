/**
 * StonenSync - Synchronization and stabilization module
 * Implements 7/14 beat structures with 3.5 micro-pulse drift correction
 * 
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 */

export class StonenSync {
    constructor(config = {}) {
        this.config = {
            beatStructure: config.beatStructure ?? '7', // '7' or '14'
            enableMicroPulse: config.enableMicroPulse ?? true,
            lockOnlyAt49: config.lockOnlyAt49 ?? true,
            syncPulseInterval: config.syncPulseInterval ?? 1000, // ms
            ...config
        };
        
        this.syncState = 'idle';
        this.currentBeat = 0;
        this.stoneStates = new Map();
        this.syncHistory = [];
        this.intervalId = null;
        this.driftCorrection = 0;
        this.lastSyncTime = null;
    }

    /**
     * Start synchronization with 7/14 beat structure
     */
    startSync() {
        if (this.syncState !== 'idle') {
            throw new Error('Sync already active');
        }

        this.syncState = 'syncing';
        this.currentBeat = 0;
        this.lastSyncTime = Date.now();
        
        const beatInterval = this.getBeatInterval();
        
        this.intervalId = setInterval(() => {
            this.processSyncTick();
        }, beatInterval);

        return {
            started: true,
            beatStructure: this.config.beatStructure,
            interval: beatInterval,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Stop synchronization
     */
    stopSync() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.syncState = 'idle';
        
        return {
            stopped: true,
            finalBeat: this.currentBeat,
            totalDrift: this.driftCorrection,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Process each sync tick
     */
    processSyncTick() {
        const currentTime = Date.now();
        const expectedTime = this.lastSyncTime + this.getBeatInterval();
        const drift = currentTime - expectedTime;
        
        this.currentBeat++;
        
        // Apply micro-pulse drift correction at 3.5 intervals
        if (this.config.enableMicroPulse && this.shouldApplyMicroPulse()) {
            this.applyMicroPulseDriftCorrection(drift);
        }
        
        // Record sync history
        this.syncHistory.push({
            beat: this.currentBeat,
            timestamp: currentTime,
            drift: drift,
            corrected: this.driftCorrection !== 0
        });
        
        // Limit history size
        if (this.syncHistory.length > 100) {
            this.syncHistory.shift();
        }
        
        // Check for resync pulse at beat boundaries
        this.checkForResyncPulse();
        
        this.lastSyncTime = currentTime;
        this.driftCorrection = 0; // Reset after application
    }

    /**
     * Check if micro-pulse should be applied (at 3.5 ratio intervals)
     */
    shouldApplyMicroPulse() {
        const microPulseInterval = 3.5;
        return (this.currentBeat % Math.floor(microPulseInterval)) === 0;
    }

    /**
     * Apply micro-pulse drift correction
     */
    applyMicroPulseDriftCorrection(drift) {
        const maxCorrection = this.getBeatInterval() * 0.1; // Max 10% correction
        this.driftCorrection = Math.sign(drift) * Math.min(Math.abs(drift), maxCorrection);
        
        // Apply correction to next interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
            const correctedInterval = this.getBeatInterval() - this.driftCorrection;
            
            this.intervalId = setInterval(() => {
                this.processSyncTick();
            }, Math.max(correctedInterval, 10)); // Minimum 10ms interval
        }
    }

    /**
     * Check for resync pulse at 7/14 beat boundaries
     */
    checkForResyncPulse() {
        const beatStructure = parseInt(this.config.beatStructure);
        
        if (this.currentBeat % beatStructure === 0) {
            this.emitResyncPulse({
                beat: this.currentBeat,
                boundary: beatStructure,
                type: 'structural_resync'
            });
        }
    }

    /**
     * Emit resync pulse event
     */
    emitResyncPulse(pulseData) {
        // In real implementation, would emit event for other components to synchronize
        console.log(`Resync pulse emitted:`, pulseData);
        
        // Opportunity for other components to realign
        this.alignConnectedComponents(pulseData);
    }

    /**
     * Align connected components during resync pulse
     */
    alignConnectedComponents(pulseData) {
        // Placeholder for component alignment logic
        // In full implementation, would notify processor, soul.edXchang, etc.
    }

    /**
     * Create or update stone state (only lock at 49 ticks)
     */
    setStoneState(stoneId, state, options = {}) {
        const currentStone = this.stoneStates.get(stoneId) || {
            id: stoneId,
            state: 'pending',
            lockBeat: null,
            createdAt: Date.now()
        };

        // Check if we can finalize (lock) the stone state
        if (options.finalize && this.canLockStone()) {
            currentStone.state = state;
            currentStone.lockBeat = this.currentBeat;
            currentStone.lockedAt = Date.now();
            currentStone.locked = true;
        } else if (!currentStone.locked) {
            // Only update if not already locked
            currentStone.state = state;
            currentStone.lastUpdated = Date.now();
        }

        this.stoneStates.set(stoneId, currentStone);
        
        return {
            stoneId,
            updated: true,
            locked: currentStone.locked || false,
            lockBeat: currentStone.lockBeat,
            canLock: this.canLockStone()
        };
    }

    /**
     * Check if stone can be locked (only at 49 ticks)
     */
    canLockStone() {
        if (!this.config.lockOnlyAt49) return true;
        
        return this.currentBeat > 0 && (this.currentBeat % 49) === 0;
    }

    /**
     * Set pre-lock state at 14 ticks (reversible)
     */
    setPreLockState(stoneId, state) {
        if (this.currentBeat % 14 !== 0) {
            throw new Error('Pre-lock states can only be set at 14-tick boundaries');
        }

        return this.setStoneState(stoneId, state, { 
            finalize: false,
            preLock: true,
            reversible: true 
        });
    }

    /**
     * Reverse pre-lock state (if still reversible)
     */
    reversePreLockState(stoneId) {
        const stone = this.stoneStates.get(stoneId);
        
        if (!stone) {
            throw new Error(`Stone ${stoneId} not found`);
        }
        
        if (stone.locked) {
            throw new Error(`Stone ${stoneId} is already locked and cannot be reversed`);
        }
        
        stone.state = 'pending';
        stone.lastUpdated = Date.now();
        stone.reversed = true;
        stone.reversedAt = Date.now();
        
        this.stoneStates.set(stoneId, stone);
        
        return {
            stoneId,
            reversed: true,
            newState: 'pending'
        };
    }

    /**
     * Get beat interval based on configuration
     */
    getBeatInterval() {
        const baseInterval = this.config.syncPulseInterval;
        const beatStructure = this.config.beatStructure;
        
        // Adjust interval based on beat structure
        if (beatStructure === '14') {
            return baseInterval * 0.5; // Faster beats for 14-structure
        }
        
        return baseInterval; // Default for 7-structure
    }

    /**
     * Calculate synchronization quality metrics
     */
    getSyncQuality() {
        if (this.syncHistory.length < 5) {
            return { quality: 'insufficient_data' };
        }
        
        const recentHistory = this.syncHistory.slice(-10);
        const avgDrift = recentHistory.reduce((sum, entry) => sum + Math.abs(entry.drift), 0) / recentHistory.length;
        const maxDrift = Math.max(...recentHistory.map(entry => Math.abs(entry.drift)));
        
        const quality = avgDrift < 50 ? 'excellent' : avgDrift < 100 ? 'good' : avgDrift < 200 ? 'fair' : 'poor';
        
        return {
            quality,
            averageDrift: avgDrift,
            maxDrift,
            correctionRate: recentHistory.filter(entry => entry.corrected).length / recentHistory.length,
            beatStructure: this.config.beatStructure
        };
    }

    /**
     * Get current sync status
     */
    getSyncStatus() {
        return {
            state: this.syncState,
            currentBeat: this.currentBeat,
            beatStructure: this.config.beatStructure,
            enableMicroPulse: this.config.enableMicroPulse,
            stoneCount: this.stoneStates.size,
            lockedStones: Array.from(this.stoneStates.values()).filter(stone => stone.locked).length,
            quality: this.getSyncQuality(),
            nextLockOpportunity: this.getNextLockOpportunity(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calculate when next stone lock opportunity occurs
     */
    getNextLockOpportunity() {
        if (!this.config.lockOnlyAt49) return 'immediate';
        
        const beatsUntilNext49 = 49 - (this.currentBeat % 49);
        const timeUntilNext49 = beatsUntilNext49 * this.getBeatInterval();
        
        return {
            beatsRemaining: beatsUntilNext49,
            estimatedTime: timeUntilNext49,
            nextBeat: this.currentBeat + beatsUntilNext49
        };
    }

    /**
     * Get stone state
     */
    getStoneState(stoneId) {
        return this.stoneStates.get(stoneId) || null;
    }

    /**
     * List all stones with their states
     */
    listStones() {
        return Array.from(this.stoneStates.entries()).map(([id, stone]) => ({
            id,
            ...stone
        }));
    }

    /**
     * Get sync history
     */
    getSyncHistory(limit = 20) {
        return this.syncHistory.slice(-limit);
    }

    /**
     * Reset synchronization state
     */
    reset() {
        this.stopSync();
        this.currentBeat = 0;
        this.stoneStates.clear();
        this.syncHistory = [];
        this.driftCorrection = 0;
        this.lastSyncTime = null;
        
        return {
            reset: true,
            timestamp: new Date().toISOString()
        };
    }
}

export default StonenSync;