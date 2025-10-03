/**
 * Quantum Scaling and Cubic Calculation Routes
 * API endpoints for advanced cubic calculations and quantum scaling operations
 * Handles quantum integrated questions and big ask potential scaling
 * 
 * Author: Scott Charles Olson (Charly)
 * Contributors: Hank Charles H. Dykes, et al.
 * Trademarked by Scott Charles Olson
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// Import the corrected solidarity system for quantum operations
const { CorrectedSolidaritySystem } = require('../../src/correctedSolidaritySystem');

// Initialize quantum system
const quantumSystem = new CorrectedSolidaritySystem({
    cubicPrecision: 64,
    quantumDepth: 14,
    cubitBase: 697,
    quantumRecursionLevels: 49
});

/**
 * GET /api/quantum/status
 * Get quantum system status and configuration
 */
router.get('/status', (req, res) => {
    try {
        const status = quantumSystem.getQuantumSystemStatus();
        res.json({
            success: true,
            status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/quantum/cubic-root
 * Calculate quantum-scaled cubic root
 * Body: { value: number, quantumDepth?: number }
 */
router.post('/cubic-root', async (req, res) => {
    try {
        const { value, quantumDepth = 14 } = req.body;
        
        if (typeof value !== 'number' || isNaN(value)) {
            return res.status(400).json({
                success: false,
                error: 'Value must be a valid number',
                timestamp: new Date().toISOString()
            });
        }
        
        // Calculate using JavaScript method
        const jsResult = quantumSystem.calculateQuantumCubicRoot(value, quantumDepth);
        
        // Also calculate using Python backend for comparison
        const pythonResult = await callPythonBackend('cubic', [value.toString(), quantumDepth.toString()]);
        
        res.json({
            success: true,
            data: {
                input: { value, quantumDepth },
                javascript_result: jsResult,
                python_result: pythonResult,
                comparison: {
                    difference: pythonResult ? Math.abs(jsResult - pythonResult.quantum_scaled_result) : null,
                    precision_match: pythonResult ? Math.abs(jsResult - pythonResult.quantum_scaled_result) < 0.000001 : false
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/quantum/big-ask
 * Process big ask quantum integrated questions
 * Body: { question: string, complexity?: number }
 */
router.post('/big-ask', async (req, res) => {
    try {
        const { question, complexity = 7 } = req.body;
        
        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Question must be a non-empty string',
                timestamp: new Date().toISOString()
            });
        }
        
        if (complexity < 1 || complexity > 49) {
            return res.status(400).json({
                success: false,
                error: 'Complexity must be between 1 and 49',
                timestamp: new Date().toISOString()
            });
        }
        
        // Process using JavaScript method
        const jsResult = quantumSystem.processBigAskQuestion(question, complexity);
        
        // Also process using Python backend
        const pythonResult = await callPythonBackend('bigask', [complexity.toString(), question]);
        
        res.json({
            success: true,
            data: {
                input: { question, complexity },
                javascript_result: jsResult,
                python_result: pythonResult,
                processing_notes: {
                    big_ask_activated: complexity > 7,
                    quantum_recursion: complexity > 35,
                    coherence_maintained: jsResult.coherenceLevel > 0.1
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/quantum/batch-cubic
 * Process multiple cubic calculations in batch
 * Body: { values: number[], quantumDepths?: number[] }
 */
router.post('/batch-cubic', async (req, res) => {
    try {
        const { values, quantumDepths } = req.body;
        
        if (!Array.isArray(values) || values.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Values must be a non-empty array of numbers',
                timestamp: new Date().toISOString()
            });
        }
        
        // Validate all values are numbers
        const invalidValues = values.filter(v => typeof v !== 'number' || isNaN(v));
        if (invalidValues.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'All values must be valid numbers',
                timestamp: new Date().toISOString()
            });
        }
        
        // Process batch using JavaScript
        const jsResults = values.map((value, index) => {
            const depth = quantumDepths && quantumDepths[index] ? quantumDepths[index] : 14;
            return quantumSystem.calculateQuantumCubicRoot(value, depth);
        });
        
        // Also process using Python backend
        const pythonResults = await callPythonBackend('batch', values.map(v => v.toString()));
        
        res.json({
            success: true,
            data: {
                input: { values, quantumDepths },
                count: values.length,
                javascript_results: jsResults,
                python_results: pythonResults,
                summary: {
                    min_result: Math.min(...jsResults),
                    max_result: Math.max(...jsResults),
                    average_result: jsResults.reduce((a, b) => a + b, 0) / jsResults.length
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/quantum/report
 * Generate comprehensive quantum system report
 */
router.get('/report', async (req, res) => {
    try {
        const systemStatus = quantumSystem.getQuantumSystemStatus();
        const pythonReport = await callPythonBackend('report', []);
        
        res.json({
            success: true,
            report: {
                system_status: systemStatus,
                python_backend: pythonReport,
                integration_status: {
                    javascript_engine: 'operational',
                    python_backend: pythonReport ? 'operational' : 'unavailable',
                    quantum_coherence: systemStatus.currentCoherence,
                    cubic_calculations: 'active',
                    big_ask_processing: 'ready'
                },
                capabilities: [
                    'Quantum cubic root extraction',
                    'Big ask question processing', 
                    'Multi-dimensional cubic calculations',
                    'Batch processing support',
                    'JavaScript + Python integration',
                    'Golden ratio scaling',
                    'Cubit-based sacred geometry',
                    '7→14→49 progression scaling'
                ]
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Helper function to call Python quantum backend
 */
function callPythonBackend(command, args = []) {
    return new Promise((resolve, reject) => {
        const pythonPath = process.env.PYTHON_PATH || 'python3';
        const scriptPath = path.join(__dirname, '../../quantum_cubic_backend.py');
        
        const pythonProcess = spawn(pythonPath, [scriptPath, command, ...args], {
            cwd: path.dirname(scriptPath)
        });
        
        let output = '';
        let error = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (parseError) {
                    resolve(null); // Return null if JSON parsing fails
                }
            } else {
                console.warn(`Python backend warning (exit code ${code}):`, error);
                resolve(null); // Return null on error to allow graceful degradation
            }
        });
        
        // Set timeout to prevent hanging
        setTimeout(() => {
            pythonProcess.kill();
            resolve(null);
        }, 10000); // 10 second timeout
    });
}

module.exports = router;