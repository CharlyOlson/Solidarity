/**
 * Enhanced Audio Processing JavaScript Wrapper
 * Connects JavaScript ZIP phrase system with Python audio processors
 * Created by Scott Charles Olson (Charly)
 *
 * Transport protocol (Python bridge stdout): newline-delimited JSON, one
 * complete message per line, UTF-8. Python's stdout carries protocol messages
 * only; diagnostics go to stderr. Stdout chunks are arbitrary slices of that
 * byte stream, so the wrapper buffers bytes and only decodes/parses once a
 * full line has arrived. Pending partial data is bounded by maxResponseBytes.
 */

const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');
const { StringDecoder } = require('string_decoder');

const NEWLINE = 0x0a;
const DEFAULT_MAX_RESPONSE_BYTES = 256 * 1024 * 1024;
const DEFAULT_KILL_GRACE_MS = 2000;

class EnhancedAudioProcessingWrapper extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            pythonExecutable: config.pythonExecutable || 'python',
            bridgeScript: config.bridgeScript || path.join(__dirname, 'enhancedAudioProcessingBridge.py'),
            timeout: config.timeout || 30000,
            sampleRate: config.sampleRate || 44100,
            maxResponseBytes: config.maxResponseBytes || DEFAULT_MAX_RESPONSE_BYTES,
            killGraceMs: config.killGraceMs || DEFAULT_KILL_GRACE_MS,
            ...config
        };
        
        this.pythonProcess = null;
        this.isReady = false;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0
        };
        
        console.log('Enhanced Audio Processing Wrapper initialized');
    }
    
    /**
     * Initialize the Python audio processing bridge.
     * Settles exactly once: ready, spawn error, early exit, fatal bridge
     * error, protocol error or timeout (the child is terminated on failure).
     */
    async initialize() {
        if (this.pythonProcess && this.isReady) {
            return true;
        }
        
        return new Promise((resolve, reject) => {
            let settled = false;
            const settle = (error) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                if (this._init === state) this._init = null;
                if (error) reject(error); else resolve(true);
            };
            
            let child;
            try {
                console.log('Starting Python audio processing bridge...');
                child = spawn(this.config.pythonExecutable, [this.config.bridgeScript], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    cwd: path.dirname(this.config.bridgeScript),
                    env: { ...process.env, ...(this.config.env || {}) }
                });
            } catch (error) {
                reject(error);
                return;
            }
            
            const state = {
                child,
                settleInit: settle,
                chunks: [],
                chunkBytes: 0,
                stderrDecoder: new StringDecoder('utf8'),
                failed: false,
                exited: false,
                exitWaiters: []
            };
            const timer = setTimeout(() => {
                this._failBridge(state, new Error('Python bridge initialization timeout'));
            }, this.config.timeout);
            
            this.pythonProcess = child;
            this._init = state;
            this._state = state;
            
            child.stdout.on('data', (data) => this._handleStdoutChunk(state, data));
            
            child.stderr.on('data', (data) => {
                const text = state.stderrDecoder.write(data);
                if (text) {
                    console.error(`Python Bridge Error: ${text}`);
                    this.emit('stderr', text);
                }
            });
            
            // Broken stdin (e.g. EPIPE after the child died) must not crash the process
            child.stdin.on('error', (error) => {
                this._failBridge(state, new Error(`Python bridge stdin error: ${error.message}`));
            });
            
            child.on('close', (code, signal) => this._handleClose(state, code, signal));
            
            child.on('error', (error) => {
                console.error(`Failed to start Python bridge: ${error}`);
                this._failBridge(state, error);
            });
        });
    }
    
    /**
     * Buffer raw stdout bytes and dispatch each complete newline-delimited
     * message. Bytes are only decoded once a full line is available so
     * multibyte UTF-8 sequences split across chunks stay intact.
     */
    _handleStdoutChunk(state, data) {
        if (state.failed) return;
        
        let start = 0;
        let index;
        while ((index = data.indexOf(NEWLINE, start)) !== -1) {
            const tail = data.subarray(start, index);
            if (state.chunkBytes + tail.length > this.config.maxResponseBytes) {
                this._failBridge(state, this._oversizeError());
                return;
            }
            let line = tail;
            if (state.chunks.length) {
                state.chunks.push(tail);
                line = Buffer.concat(state.chunks, state.chunkBytes + tail.length);
            }
            state.chunks = [];
            state.chunkBytes = 0;
            start = index + 1;
            
            this._handleLine(state, line);
            if (state.failed) return;
        }
        
        if (start < data.length) {
            const rest = data.subarray(start);
            if (state.chunkBytes + rest.length > this.config.maxResponseBytes) {
                this._failBridge(state, this._oversizeError());
                return;
            }
            state.chunks.push(Buffer.from(rest));
            state.chunkBytes += rest.length;
        }
    }
    
    _oversizeError() {
        return new Error(`Python bridge response exceeded ${this.config.maxResponseBytes} bytes without a message terminator`);
    }
    
    /**
     * Decode and dispatch one complete protocol line
     */
    _handleLine(state, lineBuffer) {
        let response;
        try {
            const text = new TextDecoder('utf-8', { fatal: true }).decode(lineBuffer);
            if (!text.trim()) return;
            response = JSON.parse(text);
        } catch (error) {
            this._failBridge(state, new Error(`Malformed Python bridge output: ${error.message}`));
            return;
        }
        
        if (response === null || typeof response !== 'object' || Array.isArray(response)) {
            this._failBridge(state, new Error('Malformed Python bridge output: message is not a JSON object'));
            return;
        }
        
        this._handlePythonMessage(state, response);
    }
    
    /**
     * Handle a parsed message from Python
     */
    _handlePythonMessage(state, response) {
        if (response.status === 'ready') {
            if (!this.isReady && this._state === state) {
                this.isReady = true;
                console.log('Python audio processing bridge ready');
                state.settleInit(null);
                this.emit('ready', response);
            }
        } else if (response.status === 'error') {
            const error = new Error(response.message || 'Python bridge error');
            if (this.isReady) {
                // EventEmitter throws on unhandled 'error'; only emit when observed
                if (this.listenerCount('error') > 0) this.emit('error', error);
            } else {
                this._failBridge(state, error);
            }
        } else if (response.request_id) {
            this._handleProcessingResponse(response);
        } else {
            this._failBridge(state, new Error('Malformed Python bridge output: unrecognized message'));
        }
    }
    
    /**
     * Child process exited: fail anything outstanding (truncated output included)
     */
    _handleClose(state, code, signal) {
        state.exited = true;
        const waiters = state.exitWaiters;
        state.exitWaiters = [];
        waiters.forEach((fn) => fn());
        
        const rest = state.stderrDecoder.end();
        if (rest) {
            console.error(`Python Bridge Error: ${rest}`);
            this.emit('stderr', rest);
        }
        
        console.log(`Python bridge process exited with code ${code}`);
        
        if (!state.failed) {
            const truncated = state.chunkBytes > 0
                ? ' (truncated output: incomplete final message)'
                : '';
            const detail = code === null ? `signal ${signal}` : `code ${code}`;
            this._failBridge(state, new Error(`Python bridge process exited with ${detail}${truncated}`));
        }
        
        if (this._state === state) {
            this._state = null;
            this.pythonProcess = null;
            this.isReady = false;
        }
        this.emit('disconnected');
    }
    
    /**
     * Fail the bridge once: reject init and every pending request, then
     * terminate the child. Safe to call repeatedly.
     */
    _failBridge(state, error) {
        if (state.failed) return;
        state.failed = true;
        state.chunks = [];
        state.chunkBytes = 0;
        
        if (this._state === state) this.isReady = false;
        state.settleInit(error);
        this._rejectAllPending(error);
        this._terminateChild(state);
    }
    
    _rejectAllPending(error) {
        for (const [requestId, entry] of Array.from(this.pendingRequests)) {
            this.pendingRequests.delete(requestId);
            clearTimeout(entry.timer);
            this.stats.totalRequests++;
            this.stats.failedRequests++;
            entry.reject(error);
        }
    }
    
    /**
     * SIGTERM, then SIGKILL after killGraceMs if the child is still alive
     */
    _terminateChild(state) {
        if (state.exited) return;
        const { child } = state;
        try { child.stdin.destroy(); } catch (_) { /* already closed */ }
        try { child.kill(); } catch (_) { /* already dead */ }
        const killer = setTimeout(() => {
            if (!state.exited) {
                try { child.kill('SIGKILL'); } catch (_) { /* already dead */ }
            }
        }, this.config.killGraceMs);
        killer.unref();
        state.exitWaiters.push(() => clearTimeout(killer));
    }
    
    /**
     * Handle processing response from Python
     */
    _handleProcessingResponse(response) {
        const requestData = this.pendingRequests.get(response.request_id);
        
        // Unknown/late responses (e.g. after a request timeout) are ignored
        if (requestData) {
            const { resolve, reject, startTime, timer } = requestData;
            const responseTime = Date.now() - startTime;
            
            this.pendingRequests.delete(response.request_id);
            clearTimeout(timer);
            
            // Update statistics
            this.stats.totalRequests++;
            if (response.success) {
                this.stats.successfulRequests++;
                this._updateAverageResponseTime(responseTime);
                resolve(response);
            } else {
                this.stats.failedRequests++;
                reject(new Error(response.error || 'Unknown processing error'));
            }
        }
    }
    
    /**
     * Send request to Python bridge
     */
    async _sendRequest(operation, parameters = {}) {
        if (!this.isReady) {
            throw new Error('Python bridge not ready');
        }
        
        const state = this._state;
        const requestId = `req_${++this.requestId}_${Date.now()}`;
        const payload = JSON.stringify({
            operation,
            parameters,
            request_id: requestId,
            timestamp: Date.now()
        }) + '\n';
        
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            // A running Python request cannot be cancelled, so a timeout
            // terminates the bridge; initialize() can be called again.
            const timer = setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this._failBridge(state, new Error('Request timeout'));
                }
            }, this.config.timeout);
            
            // Store request for response handling
            this.pendingRequests.set(requestId, { resolve, reject, startTime, timer });
            
            // Send to Python process
            state.child.stdin.write(payload, (error) => {
                if (error) {
                    this._failBridge(state, new Error(`Failed to send request to Python bridge: ${error.message}`));
                }
            });
        });
    }
    
    /**
     * Process ZIP phrase with enhanced audio processing
     */
    async processZipPhrase(phrase, options = {}) {
        const parameters = {
            phrase,
            signal: options.signal || null,
            mode: options.mode || 'standard',
            frequency: options.frequency || 440,
            duration: options.duration || 1.0,
            ...options
        };
        
        return await this._sendRequest('process_zip_phrase', parameters);
    }
    
    /**
     * Process harmonic series
     */
    async processHarmonicSeries(harmonics, options = {}) {
        const parameters = {
            harmonics,
            duration: options.duration || 1.0,
            ...options
        };
        
        return await this._sendRequest('process_harmonic_series', parameters);
    }
    
    /**
     * Process spatial audio
     */
    async processSpatialAudio(signal, options = {}) {
        const parameters = {
            signal,
            frequency: options.frequency || 440,
            duration: options.duration || 1.0,
            ...options
        };
        
        return await this._sendRequest('spatial_audio_processing', parameters);
    }
    
    /**
     * Process gradient transference
     */
    async processGradientTransference(sourceSignal, targetSignal, options = {}) {
        const parameters = {
            source_signal: sourceSignal,
            target_signal: targetSignal,
            ...options
        };
        
        return await this._sendRequest('gradient_transference', parameters);
    }
    
    /**
     * Apply professional audio effects
     */
    async applyProfessionalEffects(signal, effects, options = {}) {
        const parameters = {
            signal,
            effects: effects || ['reverb', 'compressor'],
            frequency: options.frequency || 440,
            duration: options.duration || 1.0,
            ...options
        };
        
        return await this._sendRequest('professional_audio_effects', parameters);
    }
    
    /**
     * Process through complete audio pipeline
     */
    async processCompleteAudioPipeline(signal, config = {}) {
        const parameters = {
            signal,
            config,
            frequency: config.frequency || 440,
            duration: config.duration || 1.0
        };
        
        return await this._sendRequest('complete_audio_pipeline', parameters);
    }
    
    /**
     * Get system status from Python bridge
     */
    async getSystemStatus() {
        return await this._sendRequest('get_system_status');
    }
    
    /**
     * Process ZIP phrase with comprehensive audio pipeline
     */
    async processZipPhraseComplete(phrase, audioData = null, config = {}) {
        try {
            console.log(`Processing ZIP phrase: "${phrase}" with complete pipeline`);
            
            // Step 1: Process ZIP phrase
            const zipResult = await this.processZipPhrase(phrase, {
                signal: audioData,
                mode: config.mode || 'enhanced',
                ...config
            });
            
            // Step 2: Apply spatial processing if enabled
            let spatialResult = null;
            if (config.enableSpatialProcessing !== false) {
                spatialResult = await this.processSpatialAudio(
                    zipResult.result.processed_signal || zipResult.result.original_signal,
                    config
                );
            }
            
            // Step 3: Apply professional effects if specified
            let effectsResult = null;
            if (config.effects && config.effects.length > 0) {
                const signalForEffects = spatialResult 
                    ? spatialResult.result.spatially_processed 
                    : (zipResult.result.processed_signal || zipResult.result.original_signal);
                    
                effectsResult = await this.applyProfessionalEffects(
                    signalForEffects,
                    config.effects,
                    config
                );
            }
            
            // Step 4: Generate harmonic series if harmonics provided
            let harmonicResult = null;
            if (config.harmonics && config.harmonics.length > 0) {
                harmonicResult = await this.processHarmonicSeries(config.harmonics, config);
            }
            
            // Compile comprehensive result
            const comprehensiveResult = {
                phrase,
                timestamp: Date.now(),
                processing_stages: {
                    zip_phrase: zipResult,
                    spatial_processing: spatialResult,
                    effects_processing: effectsResult,
                    harmonic_processing: harmonicResult
                },
                final_signal: this._getFinalSignal(zipResult, spatialResult, effectsResult),
                processing_summary: this._generateProcessingSummary(zipResult, spatialResult, effectsResult, harmonicResult),
                config_used: config
            };
            
            console.log(`ZIP phrase processing complete: ${comprehensiveResult.processing_summary.total_stages} stages`);
            return comprehensiveResult;
            
        } catch (error) {
            console.error(`Failed to process ZIP phrase "${phrase}":`, error);
            throw error;
        }
    }
    
    /**
     * Get final processed signal from processing chain
     */
    _getFinalSignal(zipResult, spatialResult, effectsResult) {
        if (effectsResult && effectsResult.result.processed_signal) {
            return effectsResult.result.processed_signal;
        } else if (spatialResult && spatialResult.result.spatially_processed) {
            return spatialResult.result.spatially_processed;
        } else if (zipResult && zipResult.result.processed_signal) {
            return zipResult.result.processed_signal;
        } else if (zipResult && zipResult.result.original_signal) {
            return zipResult.result.original_signal;
        }
        return [];
    }
    
    /**
     * Generate processing summary
     */
    _generateProcessingSummary(zipResult, spatialResult, effectsResult, harmonicResult) {
        const stages = [];
        let totalProcessingTime = 0;
        
        if (zipResult) {
            stages.push('ZIP Phrase Processing');
            totalProcessingTime += zipResult.processing_time || 0;
        }
        
        if (spatialResult) {
            stages.push('Spatial Audio Processing');
            totalProcessingTime += spatialResult.processing_time || 0;
        }
        
        if (effectsResult) {
            stages.push('Professional Effects');
            totalProcessingTime += effectsResult.processing_time || 0;
        }
        
        if (harmonicResult) {
            stages.push('Harmonic Series Generation');
            totalProcessingTime += harmonicResult.processing_time || 0;
        }
        
        return {
            stages_completed: stages,
            total_stages: stages.length,
            total_processing_time: totalProcessingTime,
            success: stages.length > 0
        };
    }
    
    /**
     * Update average response time statistics
     */
    _updateAverageResponseTime(responseTime) {
        const successful = this.stats.successfulRequests;
        if (successful === 1) {
            this.stats.averageResponseTime = responseTime;
        } else {
            this.stats.averageResponseTime = (
                (this.stats.averageResponseTime * (successful - 1) + responseTime) / successful
            );
        }
    }
    
    /**
     * Get processing statistics
     */
    getStats() {
        return {
            ...this.stats,
            isReady: this.isReady,
            pendingRequests: this.pendingRequests.size,
            successRate: this.stats.totalRequests > 0 
                ? (this.stats.successfulRequests / this.stats.totalRequests) * 100 
                : 0
        };
    }
    
    /**
     * Test the audio processing pipeline
     */
    async testAudioProcessing() {
        try {
            console.log('Testing enhanced audio processing pipeline...');
            
            // Test 1: Basic ZIP phrase processing
            const zipTest = await this.processZipPhrase('Compression Wave', {
                frequency: 440,
                duration: 0.5
            });
            
            console.log('✓ ZIP phrase processing test passed');
            
            // Test 2: Harmonic series processing
            const harmonicTest = await this.processHarmonicSeries([
                { frequency: 440, amplitude: 1.0 },
                { frequency: 880, amplitude: 0.5 },
                { frequency: 1320, amplitude: 0.25 }
            ], { duration: 0.5 });
            
            console.log('✓ Harmonic series processing test passed');
            
            // Test 3: System status
            const statusTest = await this.getSystemStatus();
            
            console.log('✓ System status test passed');
            
            const testResults = {
                zipProcessing: zipTest.success,
                harmonicProcessing: harmonicTest.success,
                systemStatus: statusTest.success,
                allTestsPassed: zipTest.success && harmonicTest.success && statusTest.success
            };
            
            console.log('Enhanced audio processing pipeline tests completed');
            return testResults;
            
        } catch (error) {
            console.error('Audio processing pipeline test failed:', error);
            throw error;
        }
    }
    
    /**
     * Shutdown the Python bridge
     */
    async shutdown() {
        const state = this._state;
        if (state) {
            console.log('Shutting down Python audio processing bridge...');
            
            // Mark failed first so the close handler does not re-report
            state.failed = true;
            state.settleInit(new Error('Bridge shutting down'));
            this._rejectAllPending(new Error('Bridge shutting down'));
            
            const exited = new Promise((resolve) => {
                if (state.exited) resolve(); else state.exitWaiters.push(resolve);
            });
            this._terminateChild(state);
            await exited;
            
            this.pythonProcess = null;
            this._state = null;
            this.isReady = false;
            
            console.log('Python bridge shutdown complete');
        }
    }
}

module.exports = {
    EnhancedAudioProcessingWrapper
};
