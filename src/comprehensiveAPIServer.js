/**
 * Comprehensive Solidarity API Server
 * Express.js server integrating all 400+ functions from the platform
 * Created by Scott Charles Olson (Charly)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import all integration systems
const { SolidarityMasterIntegration } = require('./comprehensiveIntegrationSystem');
const { EnhancedAudioProcessingWrapper } = require('./enhancedAudioProcessingWrapper');
const { SolidarityBlockchainConnector } = require('./blockchainConnector');
const { ComprehensiveIntegrationTester } = require('./comprehensiveIntegrationTester');

class ComprehensiveAPIServer {
    constructor(config = {}) {
        this.config = {
            port: config.port || process.env.PORT || 3000,
            host: config.host || 'localhost',
            corsOrigin: config.corsOrigin || '*',
            rateLimit: config.rateLimit || { windowMs: 15 * 60 * 1000, max: 100 },
            enableAudio: config.enableAudio !== false,
            enableBlockchain: config.enableBlockchain !== false,
            enableTesting: config.enableTesting !== false,
            ...config
        };
        
        this.app = express();
        this.server = null;
        this.systems = {};
        this.isReady = false;
        
        console.log('Comprehensive API Server initializing...');
    }
    
    /**
     * Initialize all integrated systems
     */
    async initializeSystems() {
        try {
            console.log('Initializing all integrated systems...');
            
            // Initialize Master Integration System
            this.systems.masterIntegration = new SolidarityMasterIntegration();
            await this.systems.masterIntegration.initializeSystem();
            console.log('✓ Master Integration System ready');
            
            // Initialize Audio Processing System
            if (this.config.enableAudio) {
                try {
                    this.systems.audioProcessor = new EnhancedAudioProcessingWrapper();
                    await this.systems.audioProcessor.initialize();
                    console.log('✓ Audio Processing System ready');
                } catch (error) {
                    console.warn('Audio Processing System initialization failed:', error.message);
                    this.config.enableAudio = false;
                }
            }
            
            // Initialize Blockchain System
            if (this.config.enableBlockchain) {
                try {
                    this.systems.blockchain = new SolidarityBlockchainConnector();
                    await this.systems.blockchain.initialize();
                    console.log('✓ Blockchain System ready');
                } catch (error) {
                    console.warn('Blockchain System initialization failed:', error.message);
                    this.config.enableBlockchain = false;
                }
            }
            
            console.log('All available systems initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize systems:', error);
            throw error;
        }
    }
    
    /**
     * Configure Express middleware
     */
    configureMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: this.config.corsOrigin,
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit(this.config.rateLimit);
        this.app.use('/api/', limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });
        
        // Error handling
        this.app.use((error, req, res, next) => {
            console.error('API Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: Date.now()
            });
        });
        
        console.log('Express middleware configured');
    }
    
    /**
     * Configure API routes
     */
    configureRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                status: 'healthy',
                timestamp: Date.now(),
                systems: {
                    masterIntegration: !!this.systems.masterIntegration,
                    audioProcessor: !!this.systems.audioProcessor,
                    blockchain: !!this.systems.blockchain
                }
            });
        });
        
        // System status endpoint
        this.app.get('/api/status', async (req, res) => {
            try {
                const status = await this.getSystemStatus();
                res.json({
                    success: true,
                    status: status,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Master Integration System Routes
        this.configureMasterIntegrationRoutes();
        
        // Audio Processing Routes
        if (this.config.enableAudio) {
            this.configureAudioProcessingRoutes();
        }
        
        // Blockchain Routes
        if (this.config.enableBlockchain) {
            this.configureBlockchainRoutes();
        }
        
        // Cross-System Integration Routes
        this.configureCrossSystemRoutes();
        
        // Testing Routes
        if (this.config.enableTesting) {
            this.configureTestingRoutes();
        }
        
        // Demonstration Routes
        this.configureDemonstrationRoutes();
        
        console.log('API routes configured');
    }
    
    /**
     * Configure Master Integration System routes
     */
    configureMasterIntegrationRoutes() {
        const router = express.Router();
        
        // ZIP Phrase processing
        router.post('/zip-phrase', async (req, res) => {
            try {
                const { phrase, options = {} } = req.body;
                const result = await this.systems.masterIntegration.processZipPhrase(phrase, options);
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Harmonic calculations
        router.post('/harmonic-series', async (req, res) => {
            try {
                const { harmonics } = req.body;
                const result = await this.systems.masterIntegration.calculateHarmonicSeries(harmonics);
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Greek Letter Node operations
        router.post('/node/:nodeName', async (req, res) => {
            try {
                const { nodeName } = req.params;
                const { operation, parameters = {} } = req.body;
                
                const result = await this.systems.masterIntegration.executeNodeOperation(
                    nodeName, operation, parameters
                );
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Cross-system operations
        router.post('/cross-system', async (req, res) => {
            try {
                const { operation, parameters = {} } = req.body;
                
                const result = await this.systems.masterIntegration.executeCrossSystemOperation(
                    operation, parameters
                );
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // System configuration
        router.get('/config', async (req, res) => {
            try {
                const config = await this.systems.masterIntegration.getSystemConfiguration();
                
                res.json({
                    success: true,
                    config: config,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        this.app.use('/api/master', router);
    }
    
    /**
     * Configure Audio Processing routes
     */
    configureAudioProcessingRoutes() {
        const router = express.Router();
        
        // ZIP phrase audio processing
        router.post('/zip-phrase', async (req, res) => {
            try {
                const { phrase, options = {} } = req.body;
                const result = await this.systems.audioProcessor.processZipPhrase(phrase, options);
                
                res.json({
                    success: true,
                    result: result.result,
                    processingTime: result.processing_time,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Harmonic series processing
        router.post('/harmonic-series', async (req, res) => {
            try {
                const { harmonics, options = {} } = req.body;
                const result = await this.systems.audioProcessor.processHarmonicSeries(harmonics, options);
                
                res.json({
                    success: true,
                    result: result.result,
                    processingTime: result.processing_time,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Spatial audio processing
        router.post('/spatial-audio', async (req, res) => {
            try {
                const { signal, options = {} } = req.body;
                const result = await this.systems.audioProcessor.processSpatialAudio(signal, options);
                
                res.json({
                    success: true,
                    result: result.result,
                    processingTime: result.processing_time,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Professional audio effects
        router.post('/effects', async (req, res) => {
            try {
                const { signal, effects, options = {} } = req.body;
                const result = await this.systems.audioProcessor.applyProfessionalEffects(signal, effects, options);
                
                res.json({
                    success: true,
                    result: result.result,
                    processingTime: result.processing_time,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Complete audio pipeline
        router.post('/pipeline', async (req, res) => {
            try {
                const { phrase, audioData, config = {} } = req.body;
                const result = await this.systems.audioProcessor.processZipPhraseComplete(phrase, audioData, config);
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Audio system status
        router.get('/status', async (req, res) => {
            try {
                const status = await this.systems.audioProcessor.getSystemStatus();
                
                res.json({
                    success: true,
                    status: status.result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        this.app.use('/api/audio', router);
    }
    
    /**
     * Configure Blockchain routes
     */
    configureBlockchainRoutes() {
        const router = express.Router();
        
        // ZIP phrase blockchain processing
        router.post('/zip-phrase', async (req, res) => {
            try {
                const { phrase, processingFee = 0 } = req.body;
                const result = await this.systems.blockchain.processZipPhraseOnChain(phrase, processingFee);
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Harmonic data storage
        router.post('/harmonic-data', async (req, res) => {
            try {
                const { harmonicData, processor } = req.body;
                const result = await this.systems.blockchain.storeHarmonicDataOnChain(harmonicData, processor);
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Token balance
        router.get('/balance/:address?', async (req, res) => {
            try {
                const { address } = req.params;
                const result = await this.systems.blockchain.getTokenBalance(address);
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Transfer tokens
        router.post('/transfer', async (req, res) => {
            try {
                const { toAddress, amount } = req.body;
                const result = await this.systems.blockchain.transferTokens(toAddress, amount);
                
                res.json({
                    success: true,
                    result: result,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Network information
        router.get('/network', async (req, res) => {
            try {
                const networkInfo = await this.systems.blockchain.getNetworkInfo();
                
                res.json({
                    success: true,
                    networkInfo: networkInfo,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        this.app.use('/api/blockchain', router);
    }
    
    /**
     * Configure Cross-System Integration routes
     */
    configureCrossSystemRoutes() {
        const router = express.Router();
        
        // Complete ZIP phrase processing across all systems
        router.post('/zip-phrase-complete', async (req, res) => {
            try {
                const { phrase, options = {} } = req.body;
                const results = {};
                
                // Process with master integration
                if (this.systems.masterIntegration) {
                    results.masterIntegration = await this.systems.masterIntegration.processZipPhrase(phrase, options);
                }
                
                // Process with audio system
                if (this.systems.audioProcessor && options.enableAudio !== false) {
                    results.audioProcessing = await this.systems.audioProcessor.processZipPhrase(phrase, options);
                }
                
                // Process with blockchain
                if (this.systems.blockchain && options.enableBlockchain !== false) {
                    results.blockchainProcessing = await this.systems.blockchain.processZipPhraseOnChain(
                        phrase, options.processingFee || 0
                    );
                }
                
                res.json({
                    success: true,
                    results: results,
                    systemsProcessed: Object.keys(results).length,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Complete harmonic processing across all systems
        router.post('/harmonic-complete', async (req, res) => {
            try {
                const { harmonics, options = {} } = req.body;
                const results = {};
                
                // Process with master integration
                if (this.systems.masterIntegration) {
                    results.masterIntegration = await this.systems.masterIntegration.calculateHarmonicSeries(harmonics);
                }
                
                // Process with audio system
                if (this.systems.audioProcessor && options.enableAudio !== false) {
                    results.audioProcessing = await this.systems.audioProcessor.processHarmonicSeries(harmonics, options);
                }
                
                // Store on blockchain
                if (this.systems.blockchain && options.enableBlockchain !== false) {
                    results.blockchainStorage = await this.systems.blockchain.storeHarmonicDataOnChain(harmonics);
                }
                
                res.json({
                    success: true,
                    results: results,
                    systemsProcessed: Object.keys(results).length,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // System coordination endpoint
        router.post('/coordinate', async (req, res) => {
            try {
                const { operation, parameters = {}, systems = [] } = req.body;
                const results = {};
                
                for (const systemName of systems) {
                    if (this.systems[systemName]) {
                        try {
                            // Execute operation on each system
                            results[systemName] = await this.executeSystemOperation(systemName, operation, parameters);
                        } catch (error) {
                            results[systemName] = { success: false, error: error.message };
                        }
                    }
                }
                
                res.json({
                    success: true,
                    results: results,
                    systemsCoordinated: Object.keys(results).length,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        this.app.use('/api/integration', router);
    }
    
    /**
     * Configure Testing routes
     */
    configureTestingRoutes() {
        const router = express.Router();
        
        // Run comprehensive tests
        router.post('/comprehensive', async (req, res) => {
            try {
                const testConfig = req.body || {};
                const tester = new ComprehensiveIntegrationTester(testConfig);
                
                await tester.initializeSystems();
                const results = await tester.runComprehensiveTests();
                
                res.json({
                    success: true,
                    testResults: results,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Test individual system
        router.post('/system/:systemName', async (req, res) => {
            try {
                const { systemName } = req.params;
                const system = this.systems[systemName];
                
                if (!system) {
                    return res.status(404).json({
                        success: false,
                        error: `System ${systemName} not available`,
                        timestamp: Date.now()
                    });
                }
                
                const testResult = await this.testIndividualSystem(systemName, system);
                
                res.json({
                    success: true,
                    testResult: testResult,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        this.app.use('/api/test', router);
    }
    
    /**
     * Configure Demonstration routes
     */
    configureDemonstrationRoutes() {
        const router = express.Router();
        
        // Complete platform demonstration
        router.get('/complete', async (req, res) => {
            try {
                const demo = await this.runCompleteDemo();
                
                res.json({
                    success: true,
                    demonstration: demo,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Interactive demo endpoint
        router.post('/interactive', async (req, res) => {
            try {
                const { demoType, parameters = {} } = req.body;
                const demo = await this.runInteractiveDemo(demoType, parameters);
                
                res.json({
                    success: true,
                    demonstration: demo,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        this.app.use('/api/demo', router);
    }
    
    /**
     * Execute operation on specific system
     */
    async executeSystemOperation(systemName, operation, parameters) {
        const system = this.systems[systemName];
        
        switch (systemName) {
            case 'masterIntegration':
                if (operation === 'processZipPhrase') {
                    return await system.processZipPhrase(parameters.phrase, parameters.options);
                } else if (operation === 'calculateHarmonicSeries') {
                    return await system.calculateHarmonicSeries(parameters.harmonics);
                }
                break;
                
            case 'audioProcessor':
                if (operation === 'processZipPhrase') {
                    return await system.processZipPhrase(parameters.phrase, parameters.options);
                } else if (operation === 'processHarmonicSeries') {
                    return await system.processHarmonicSeries(parameters.harmonics, parameters.options);
                }
                break;
                
            case 'blockchain':
                if (operation === 'processZipPhrase') {
                    return await system.processZipPhraseOnChain(parameters.phrase, parameters.processingFee || 0);
                } else if (operation === 'storeHarmonicData') {
                    return await system.storeHarmonicDataOnChain(parameters.harmonics);
                }
                break;
        }
        
        throw new Error(`Unknown operation ${operation} for system ${systemName}`);
    }
    
    /**
     * Test individual system
     */
    async testIndividualSystem(systemName, system) {
        const tests = [];
        
        switch (systemName) {
            case 'masterIntegration':
                tests.push(await system.processZipPhrase('Test Phrase'));
                tests.push(await system.calculateHarmonicSeries([440, 880, 1320]));
                break;
                
            case 'audioProcessor':
                tests.push(await system.processZipPhrase('Test Audio Phrase'));
                tests.push(await system.getSystemStatus());
                break;
                
            case 'blockchain':
                tests.push(await system.getNetworkInfo());
                tests.push(await system.processZipPhraseOnChain('Test Blockchain Phrase', 0));
                break;
        }
        
        const successfulTests = tests.filter(test => test.success).length;
        
        return {
            systemName: systemName,
            testsRun: tests.length,
            testsPassed: successfulTests,
            success: successfulTests === tests.length,
            details: tests
        };
    }
    
    /**
     * Run complete demonstration
     */
    async runCompleteDemo() {
        const demo = {
            title: 'Solidarity Platform Complete Integration Demonstration',
            startTime: Date.now(),
            stages: [],
            systemsInvolved: Object.keys(this.systems),
            totalFunctions: '400+'
        };
        
        // Stage 1: System Status
        demo.stages.push({
            name: 'System Status Check',
            result: await this.getSystemStatus(),
            description: 'Verify all systems are operational'
        });
        
        // Stage 2: ZIP Phrase Processing
        demo.stages.push({
            name: 'ZIP Phrase Processing',
            result: await this.demonstrateZipPhraseProcessing(),
            description: 'Process ZIP phrase across all systems'
        });
        
        // Stage 3: Harmonic Calculations
        demo.stages.push({
            name: 'Harmonic Calculations',
            result: await this.demonstrateHarmonicCalculations(),
            description: 'Calculate and process harmonic series'
        });
        
        // Stage 4: Cross-System Integration
        demo.stages.push({
            name: 'Cross-System Integration',
            result: await this.demonstrateCrossSystemIntegration(),
            description: 'Coordinate operations across all systems'
        });
        
        demo.endTime = Date.now();
        demo.duration = demo.endTime - demo.startTime;
        demo.success = demo.stages.every(stage => stage.result.success);
        
        return demo;
    }
    
    /**
     * Demonstrate ZIP phrase processing
     */
    async demonstrateZipPhraseProcessing() {
        const phrase = 'Solidarity Platform Demonstration Wave';
        const results = {};
        
        if (this.systems.masterIntegration) {
            results.masterIntegration = await this.systems.masterIntegration.processZipPhrase(phrase);
        }
        
        if (this.systems.audioProcessor) {
            results.audioProcessing = await this.systems.audioProcessor.processZipPhrase(phrase);
        }
        
        if (this.systems.blockchain) {
            results.blockchainProcessing = await this.systems.blockchain.processZipPhraseOnChain(phrase, 0);
        }
        
        return {
            success: Object.values(results).every(r => r.success),
            phrase: phrase,
            systemResults: results,
            systemsProcessed: Object.keys(results).length
        };
    }
    
    /**
     * Demonstrate harmonic calculations
     */
    async demonstrateHarmonicCalculations() {
        const harmonics = [440, 880, 1320, 1760, 2200]; // A4 harmonic series
        const results = {};
        
        if (this.systems.masterIntegration) {
            results.masterIntegration = await this.systems.masterIntegration.calculateHarmonicSeries(harmonics);
        }
        
        if (this.systems.audioProcessor) {
            results.audioProcessing = await this.systems.audioProcessor.processHarmonicSeries(
                harmonics.map((freq, i) => ({ frequency: freq, amplitude: 1.0 / (i + 1) }))
            );
        }
        
        if (this.systems.blockchain) {
            results.blockchainStorage = await this.systems.blockchain.storeHarmonicDataOnChain(harmonics);
        }
        
        return {
            success: Object.values(results).every(r => r.success),
            harmonics: harmonics,
            systemResults: results,
            systemsProcessed: Object.keys(results).length
        };
    }
    
    /**
     * Demonstrate cross-system integration
     */
    async demonstrateCrossSystemIntegration() {
        const integrationTests = [];
        
        // Test 1: ZIP phrase across systems
        integrationTests.push(await this.demonstrateZipPhraseProcessing());
        
        // Test 2: Harmonic processing
        integrationTests.push(await this.demonstrateHarmonicCalculations());
        
        // Test 3: System coordination
        if (this.systems.masterIntegration) {
            integrationTests.push(
                await this.systems.masterIntegration.executeCrossSystemOperation('demo-coordination', {
                    systems: Object.keys(this.systems)
                })
            );
        }
        
        return {
            success: integrationTests.every(test => test.success),
            tests: integrationTests,
            testsCompleted: integrationTests.length,
            crossSystemCoordination: true
        };
    }
    
    /**
     * Get comprehensive system status
     */
    async getSystemStatus() {
        const status = {
            server: {
                ready: this.isReady,
                uptime: process.uptime(),
                nodeVersion: process.version,
                platform: process.platform
            },
            systems: {}
        };
        
        for (const [name, system] of Object.entries(this.systems)) {
            try {
                if (name === 'masterIntegration') {
                    status.systems[name] = await system.getSystemStatus();
                } else if (name === 'audioProcessor') {
                    status.systems[name] = await system.getSystemStatus();
                } else if (name === 'blockchain') {
                    status.systems[name] = await system.getNetworkInfo();
                }
            } catch (error) {
                status.systems[name] = { error: error.message, available: false };
            }
        }
        
        return status;
    }
    
    /**
     * Start the API server
     */
    async start() {
        try {
            console.log('Starting Comprehensive Solidarity API Server...');
            
            // Initialize systems
            await this.initializeSystems();
            
            // Configure middleware and routes
            this.configureMiddleware();
            this.configureRoutes();
            
            // Start server
            this.server = this.app.listen(this.config.port, this.config.host, () => {
                this.isReady = true;
                console.log(`\\n🚀 Solidarity API Server running at http://${this.config.host}:${this.config.port}`);
                console.log(`\\n📊 Available systems: ${Object.keys(this.systems).join(', ')}`);
                console.log('\\n🎵 All 400+ functions integrated and ready!\\n');
            });
            
            // Handle graceful shutdown
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());
            
            return this.server;
            
        } catch (error) {
            console.error('Failed to start API server:', error);
            throw error;
        }
    }
    
    /**
     * Shutdown the server
     */
    async shutdown() {
        try {
            console.log('\\nShutting down Solidarity API Server...');
            
            this.isReady = false;
            
            // Shutdown systems
            if (this.systems.audioProcessor) {
                await this.systems.audioProcessor.shutdown();
            }
            
            if (this.systems.blockchain) {
                await this.systems.blockchain.shutdown();
            }
            
            // Close server
            if (this.server) {
                this.server.close();
            }
            
            console.log('Solidarity API Server shutdown complete');
            process.exit(0);
            
        } catch (error) {
            console.error('Error during server shutdown:', error);
            process.exit(1);
        }
    }
}

module.exports = {
    ComprehensiveAPIServer
};

// CLI execution
if (require.main === module) {
    const config = {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        enableAudio: !process.argv.includes('--no-audio'),
        enableBlockchain: !process.argv.includes('--no-blockchain'),
        enableTesting: !process.argv.includes('--no-testing')
    };
    
    const server = new ComprehensiveAPIServer(config);
    
    server.start()
        .then(() => {
            console.log('Solidarity API Server started successfully');
        })
        .catch(error => {
            console.error('Failed to start server:', error);
            process.exit(1);
        });
}