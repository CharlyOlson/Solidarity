/**
 * Enhanced Audio Processing JavaScript Wrapper
 * Connects JavaScript ZIP phrase system with Python audio processors
 * Created by Scott Charles Olson (Charly)
 */

const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

class EnhancedAudioProcessingWrapper extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            pythonExecutable: config.pythonExecutable || 'python',
            bridgeScript: config.bridgeScript || path.join(__dirname, 'enhancedAudioProcessingBridge.py'),
            timeout: config.timeout || 30000,
            sampleRate: config.sampleRate || 44100,
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
     * Initialize the Python audio processing bridge
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Starting Python audio processing bridge...');
                
                // Spawn Python process
                this.pythonProcess = spawn(this.config.pythonExecutable, [this.config.bridgeScript], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    cwd: path.dirname(this.config.bridgeScript)
                });
                
                // Handle process output
                this.pythonProcess.stdout.on('data', (data) => {
                    this._handlePythonOutput(data);
                });
                
                // Handle process errors
                this.pythonProcess.stderr.on('data', (data) => {
                    console.error(`Python Bridge Error: ${data}`);
                });
                
                // Handle process exit
                this.pythonProcess.on('close', (code) => {
                    console.log(`Python bridge process exited with code ${code}`);
                    this.isReady = false;
                    this.emit('disconnected');
                });
                
                // Handle process errors
                this.pythonProcess.on('error', (error) => {
                    console.error(`Failed to start Python bridge: ${error}`);
                    reject(error);
                });
                
                // Wait for ready signal
                this.once('ready', () => {
                    console.log('Python audio processing bridge ready');
                    resolve(true);
                });
                
                // Set timeout
                setTimeout(() => {
                    if (!this.isReady) {
                        reject(new Error('Python bridge initialization timeout'));
                    }
                }, this.config.timeout);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Handle output from Python process
     */
    _handlePythonOutput(data) {
        const lines = data.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            try {
                const response = JSON.parse(line);
                
                if (response.status === 'ready') {
                    this.isReady = true;
                    this.emit('ready', response);
                } else if (response.status === 'error') {
                    this.emit('error', new Error(response.message));
                } else if (response.request_id) {
                    this._handleProcessingResponse(response);
                }
                
            } catch (error) {
                console.warn('Failed to parse Python output:', line);
            }
        }
    }
    
    /**
     * Handle processing response from Python
     */
    _handleProcessingResponse(response) {
        const requestData = this.pendingRequests.get(response.request_id);
        
        if (requestData) {
            const { resolve, reject, startTime } = requestData;
            const responseTime = Date.now() - startTime;
            
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
            
            this.pendingRequests.delete(response.request_id);
        }
    }
    
    /**
     * Send request to Python bridge
     */
    async _sendRequest(operation, parameters = {}) {
        if (!this.isReady) {
            throw new Error('Python bridge not ready');
        }
        
        return new Promise((resolve, reject) => {
            const requestId = `req_${++this.requestId}_${Date.now()}`;
            const startTime = Date.now();
            
            const request = {
                operation,
                parameters,
                request_id: requestId,
                timestamp: Date.now()
            };
            
            // Store request for response handling
            this.pendingRequests.set(requestId, { resolve, reject, startTime });
            
            // Send to Python process
            this.pythonProcess.stdin.write(JSON.stringify(request) + '\n');
            
            // Set timeout
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Request timeout'));
                }
            }, this.config.timeout);
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
        if (this.pythonProcess) {
            console.log('Shutting down Python audio processing bridge...');
            
            // Clear pending requests
            for (const [requestId, { reject }] of this.pendingRequests) {
                reject(new Error('Bridge shutting down'));
            }
            this.pendingRequests.clear();
            
            // Kill Python process
            this.pythonProcess.kill();
            this.pythonProcess = null;
            this.isReady = false;
            
            console.log('Python bridge shutdown complete');
        }
    }
}

module.exports = {
    EnhancedAudioProcessingWrapper
};