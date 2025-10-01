/**
 * Hanko Authentication Router
 * 
 * Provides REST API endpoints for the EnhancedHankoSystem authentication
 * including user input collection, validation, and verification.
 */

const express = require('express');
const router = express.Router();
const EnhancedHankoSystem = require('../../security/EnhancedHankoSystem');
const { requireAuth } = require('../../api/auth');
const path = require('path');
const fs = require('fs');

// Storage for active authentication sessions
const activeSessions = new Map();

// Configure storage location
const STAMP_STORAGE_DIR = path.join(process.cwd(), 'hanko_stamps');
if (!fs.existsSync(STAMP_STORAGE_DIR)) {
    fs.mkdirSync(STAMP_STORAGE_DIR, { recursive: true });
}

/**
 * Initialize a new authentication session
 * POST /api/auth/hanko/init
 */
router.post('/init', (req, res) => {
    try {
        // Create a new instance with stamp storage directory
        const hankoSystem = new EnhancedHankoSystem({
            outputDir: STAMP_STORAGE_DIR,
            useColorHarmonics: true
        });
        
        // Generate a session ID
        const sessionId = generateSessionId();
        
        // Store the session
        activeSessions.set(sessionId, {
            hankoSystem,
            created: Date.now(),
            status: 'initialized',
            steps: {
                userInputs: false,
                shape: false,
                labyrinth: false,
                color: false,
                device: false,
                stamp: false,
                audit: false
            }
        });
        
        // Send the session ID to the client
        res.status(201).json({
            sessionId,
            status: 'initialized',
            timestamp: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        });
    } catch (error) {
        console.error('Error initializing Hanko session:', error);
        res.status(500).json({
            error: 'Failed to initialize authentication session',
            message: error.message
        });
    }
});

/**
 * Submit user inputs for authentication
 * POST /api/auth/hanko/inputs
 * Body: { sessionId: string, inputs: [string, string, string, string, string, string, string] }
 */
router.post('/inputs', (req, res) => {
    const { sessionId, inputs } = req.body;
    
    if (!sessionId || !inputs || !Array.isArray(inputs) || inputs.length !== 7) {
        return res.status(400).json({
            error: 'Invalid request',
            message: 'Session ID and 7 input values are required'
        });
    }
    
    // Get the session
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            message: 'Authentication session has expired or does not exist'
        });
    }
    
    try {
        // Process the user inputs
        const baseKey = session.hankoSystem.collectUserInputs(inputs);
        
        // Update session status
        session.status = 'inputs_collected';
        session.steps.userInputs = true;
        
        res.json({
            sessionId,
            status: session.status,
            baseKey,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing inputs:', error);
        res.status(500).json({
            error: 'Failed to process inputs',
            message: error.message
        });
    }
});

/**
 * Generate authentication shape
 * POST /api/auth/hanko/shape
 * Body: { sessionId: string }
 */
router.post('/shape', (req, res) => {
    const { sessionId } = req.body;
    
    // Get the session
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            message: 'Authentication session has expired or does not exist'
        });
    }
    
    if (!session.steps.userInputs) {
        return res.status(400).json({
            error: 'Invalid sequence',
            message: 'User inputs must be collected first'
        });
    }
    
    try {
        // Generate the shape
        const shape = session.hankoSystem.generateShape();
        
        // Update session status
        session.status = 'shape_generated';
        session.steps.shape = true;
        
        res.json({
            sessionId,
            status: session.status,
            shapePoints: shape.points,
            centroid: shape.centroid,
            furthestPoint: shape.furthestPoint,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating shape:', error);
        res.status(500).json({
            error: 'Failed to generate shape',
            message: error.message
        });
    }
});

/**
 * Process labyrinth spin
 * POST /api/auth/hanko/labyrinth
 * Body: { sessionId: string, startPosition: number (optional) }
 */
router.post('/labyrinth', (req, res) => {
    const { sessionId, startPosition = 12 } = req.body;
    
    // Get the session
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            message: 'Authentication session has expired or does not exist'
        });
    }
    
    if (!session.steps.shape) {
        return res.status(400).json({
            error: 'Invalid sequence',
            message: 'Shape must be generated first'
        });
    }
    
    try {
        // Process labyrinth path
        const path = session.hankoSystem.processLabyrinthSpin(startPosition);
        
        // Update session status
        session.status = 'labyrinth_processed';
        session.steps.labyrinth = true;
        
        res.json({
            sessionId,
            status: session.status,
            labyrinthPath: path,
            startPosition,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing labyrinth:', error);
        res.status(500).json({
            error: 'Failed to process labyrinth path',
            message: error.message
        });
    }
});

/**
 * Determine color landing
 * POST /api/auth/hanko/color
 * Body: { sessionId: string }
 */
router.post('/color', (req, res) => {
    const { sessionId } = req.body;
    
    // Get the session
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            message: 'Authentication session has expired or does not exist'
        });
    }
    
    if (!session.steps.labyrinth) {
        return res.status(400).json({
            error: 'Invalid sequence',
            message: 'Labyrinth path must be processed first'
        });
    }
    
    try {
        // Determine color landing
        const color = session.hankoSystem.determineColorLanding();
        
        // Update session status
        session.status = 'color_determined';
        session.steps.color = true;
        
        res.json({
            sessionId,
            status: session.status,
            colorName: color.name,
            colorRGB: color.rgb,
            harmonicPalette: color.harmonicPalette,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error determining color:', error);
        res.status(500).json({
            error: 'Failed to determine color landing',
            message: error.message
        });
    }
});

/**
 * Sync with device and generate QR code
 * POST /api/auth/hanko/device
 * Body: { sessionId: string }
 */
router.post('/device', async (req, res) => {
    const { sessionId } = req.body;
    
    // Get the session
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            message: 'Authentication session has expired or does not exist'
        });
    }
    
    if (!session.steps.color) {
        return res.status(400).json({
            error: 'Invalid sequence',
            message: 'Color must be determined first'
        });
    }
    
    try {
        // Sync with device
        const deviceInfo = await session.hankoSystem.syncWithDevice();
        
        // Update session status
        session.status = 'device_synced';
        session.steps.device = true;
        session.deviceId = deviceInfo.deviceID;
        
        res.json({
            sessionId,
            status: session.status,
            deviceId: deviceInfo.deviceID,
            timestamp: deviceInfo.timestamp,
            qrCodePath: session.hankoSystem.qrCode.replace(/^\.\//, '/'),  // Make path relative to API root
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error syncing with device:', error);
        res.status(500).json({
            error: 'Failed to sync with device',
            message: error.message
        });
    }
});

/**
 * Generate legal stamp
 * POST /api/auth/hanko/stamp
 * Body: { sessionId: string }
 */
router.post('/stamp', async (req, res) => {
    const { sessionId } = req.body;
    
    // Get the session
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            message: 'Authentication session has expired or does not exist'
        });
    }
    
    if (!session.steps.device) {
        return res.status(400).json({
            error: 'Invalid sequence',
            message: 'Device sync must be completed first'
        });
    }
    
    try {
        // Generate legal stamp
        const stamp = await session.hankoSystem.generateLegalStamp();
        
        // Update session status
        session.status = 'stamp_generated';
        session.steps.stamp = true;
        
        // Generate ASCII art representation
        const asciiArt = session.hankoSystem.generateHankoAsciiArt();
        
        res.json({
            sessionId,
            status: session.status,
            stampPath: stamp.path.replace(/^\.\//, '/'),  // Make path relative to API root
            asciiArt,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating stamp:', error);
        res.status(500).json({
            error: 'Failed to generate stamp',
            message: error.message
        });
    }
});

/**
 * Prepare audit trail
 * POST /api/auth/hanko/audit
 * Body: { sessionId: string }
 */
router.post('/audit', (req, res) => {
    const { sessionId } = req.body;
    
    // Get the session
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            message: 'Authentication session has expired or does not exist'
        });
    }
    
    if (!session.steps.stamp) {
        return res.status(400).json({
            error: 'Invalid sequence',
            message: 'Stamp must be generated first'
        });
    }
    
    try {
        // Prepare audit trail
        const audit = session.hankoSystem.prepareAuditTrail();
        
        // Update session status
        session.status = 'completed';
        session.steps.audit = true;
        
        // Export for digital use
        const digitalExport = session.hankoSystem.exportForDigital();
        
        res.json({
            sessionId,
            status: session.status,
            verificationHash: audit.hash,
            timestamp: audit.timestamp,
            deviceId: audit.deviceID,
            colorCode: audit.colorCode,
            digitalExport,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error preparing audit trail:', error);
        res.status(500).json({
            error: 'Failed to prepare audit trail',
            message: error.message
        });
    }
});

/**
 * Validate a stamp against stored verification data
 * POST /api/auth/hanko/validate
 * Body: { verificationHash: string, stampData?: object }
 */
router.post('/validate', (req, res) => {
    const { verificationHash, stampData } = req.body;
    
    if (!verificationHash) {
        return res.status(400).json({
            error: 'Invalid request',
            message: 'Verification hash is required'
        });
    }
    
    // Find the session by verification hash
    let matchingSession = null;
    for (const [sessionId, session] of activeSessions.entries()) {
        if (session.hankoSystem.verificationHash === verificationHash) {
            matchingSession = session;
            break;
        }
    }
    
    if (!matchingSession) {
        return res.status(404).json({
            error: 'Verification failed',
            message: 'No matching authentication session found'
        });
    }
    
    try {
        // Validate the stamp
        const validation = matchingSession.hankoSystem.validateCryptographically(verificationHash);
        
        res.json({
            valid: validation.isValid,
            matchPercentage: validation.matchPercentage,
            message: validation.message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error validating stamp:', error);
        res.status(500).json({
            error: 'Failed to validate stamp',
            message: error.message
        });
    }
});

/**
 * Get QR code image
 * GET /api/auth/hanko/qr/:deviceId
 */
router.get('/qr/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    
    // Find session by device ID
    let matchingSession = null;
    for (const [sessionId, session] of activeSessions.entries()) {
        if (session.deviceId === deviceId) {
            matchingSession = session;
            break;
        }
    }
    
    if (!matchingSession || !matchingSession.hankoSystem.qrCode) {
        return res.status(404).json({
            error: 'Not found',
            message: 'QR code not found for the specified device'
        });
    }
    
    // Send the QR code image
    res.sendFile(matchingSession.hankoSystem.qrCode);
});

/**
 * Get stamp image
 * GET /api/auth/hanko/stamp/:deviceId
 */
router.get('/stamp/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    
    // Find session by device ID
    let matchingSession = null;
    for (const [sessionId, session] of activeSessions.entries()) {
        if (session.deviceId === deviceId) {
            matchingSession = session;
            break;
        }
    }
    
    if (!matchingSession || !matchingSession.hankoSystem.visualStamp) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Stamp not found for the specified device'
        });
    }
    
    // Send the stamp image
    res.sendFile(matchingSession.hankoSystem.visualStamp.path);
});

/**
 * Generate a unique session ID
 */
function generateSessionId() {
    return 'hanko_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

// Cleanup expired sessions every 5 minutes
setInterval(() => {
    const now = Date.now();
    const expirationTime = 30 * 60 * 1000; // 30 minutes
    
    for (const [sessionId, session] of activeSessions.entries()) {
        if (now - session.created > expirationTime) {
            activeSessions.delete(sessionId);
            console.log(`Removed expired session: ${sessionId}`);
        }
    }
}, 5 * 60 * 1000);

module.exports = router;