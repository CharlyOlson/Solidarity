/**
 * Greek Letter Nodes API Routes
 * API endpoints for managing Alpha, Beta, Theta, and Omega nodes
 * 
 * @author Scott Charles Olson (Charly)
 * @platform Solidarity Platform
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// Import Greek Letter Nodes System
const { GreekLetterNodesSystem } = require('../../src/nodes/GreekLetterNodesSystem');

// Initialize system singleton
let greekNodesSystem = null;

const getOrCreateSystem = () => {
  if (!greekNodesSystem) {
    greekNodesSystem = new GreekLetterNodesSystem({
      systemId: 'API-GREEK-SYSTEM-001',
      enableAutoActivation: true,
      enableCrossNodeCommunication: true,
      enableUserInterface: true,
      displayMode: 'enhanced',
      colorScheme: 'vibrant'
    });
  }
  return greekNodesSystem;
};

/**
 * @swagger
 * /api/greek-nodes/status:
 *   get:
 *     summary: Get Greek Letter Nodes system status
 *     description: Returns comprehensive status of all Greek letter nodes
 *     tags: [Greek Nodes]
 *     responses:
 *       200:
 *         description: System status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 systemStatus:
 *                   type: object
 *                 nodesStatus:
 *                   type: object
 *                 timestamp:
 *                   type: string
 */
router.get('/status', async (req, res) => {
  try {
    const system = getOrCreateSystem();
    const status = system.getSystemStatus();
    
    res.json({
      success: true,
      systemStatus: {
        systemHealth: status.systemHealth,
        operationalMode: status.operationalMode,
        activeNodes: status.activationSequence ? status.activationSequence.length : 0,
        totalOperations: Math.floor(Math.random() * 500) + 100, // Simulated for demo
        lastUpdate: status.lastUpdate
      },
      nodesStatus: status.nodesStatus,
      communicationStatus: status.communicationStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/greek-nodes/initialize:
 *   post:
 *     summary: Initialize Greek Letter Nodes system
 *     description: Initializes all Greek letter nodes with specified configuration
 *     tags: [Greek Nodes]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enableAllNodes:
 *                 type: boolean
 *               sequentialStart:
 *                 type: boolean
 *               nodeConfigs:
 *                 type: object
 *     responses:
 *       200:
 *         description: System initialized successfully
 *       500:
 *         description: Initialization failed
 */
router.post('/initialize', async (req, res) => {
  try {
    const system = getOrCreateSystem();
    const initConfig = req.body || {};
    
    const result = await system.initializeSystem({
      enableAllNodes: initConfig.enableAllNodes !== undefined ? initConfig.enableAllNodes : true,
      sequentialStart: initConfig.sequentialStart !== undefined ? initConfig.sequentialStart : true,
      nodeConfigs: initConfig.nodeConfigs || {}
    });
    
    res.json({
      success: true,
      initializationResult: result,
      message: 'Greek Letter Nodes system initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize system',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/greek-nodes/activate/{nodeType}:
 *   post:
 *     summary: Activate specific Greek letter node
 *     description: Activates Alpha, Beta, Theta, or Omega node
 *     tags: [Greek Nodes]
 *     parameters:
 *       - in: path
 *         name: nodeType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [alpha, beta, theta, omega]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: Node activated successfully
 *       400:
 *         description: Invalid node type
 *       500:
 *         description: Activation failed
 */
router.post('/activate/:nodeType', async (req, res) => {
  try {
    const { nodeType } = req.params;
    const activationConfig = req.body || {};
    
    const validNodes = ['alpha', 'beta', 'theta', 'omega'];
    if (!validNodes.includes(nodeType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid node type',
        message: `Node type must be one of: ${validNodes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const system = getOrCreateSystem();
    
    // Initialize system if not already done
    if (!system.systemState.initialized) {
      await system.initializeSystem();
    }
    
    const result = await system.activateNode(nodeType, {
      reason: activationConfig.reason || 'api_request',
      ...activationConfig.config
    });
    
    res.json({
      success: true,
      nodeType: nodeType,
      activationResult: result,
      message: `${nodeType.toUpperCase()} node activated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to activate ${req.params.nodeType} node`,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/greek-nodes/deactivate/{nodeType}:
 *   post:
 *     summary: Deactivate specific Greek letter node
 *     description: Deactivates Alpha, Beta, Theta, or Omega node
 *     tags: [Greek Nodes]
 *     parameters:
 *       - in: path
 *         name: nodeType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [alpha, beta, theta, omega]
 *     responses:
 *       200:
 *         description: Node deactivated successfully
 *       400:
 *         description: Invalid node type
 *       500:
 *         description: Deactivation failed
 */
router.post('/deactivate/:nodeType', async (req, res) => {
  try {
    const { nodeType } = req.params;
    
    const validNodes = ['alpha', 'beta', 'theta', 'omega'];
    if (!validNodes.includes(nodeType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid node type',
        message: `Node type must be one of: ${validNodes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const system = getOrCreateSystem();
    
    // Simulate deactivation (would implement actual deactivation logic)
    const activeNodes = system.systemState.activeNodes;
    const nodeIndex = activeNodes.indexOf(nodeType);
    if (nodeIndex > -1) {
      activeNodes.splice(nodeIndex, 1);
    }
    
    res.json({
      success: true,
      nodeType: nodeType,
      message: `${nodeType.toUpperCase()} node deactivated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to deactivate ${req.params.nodeType} node`,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/greek-nodes/cross-node-operation:
 *   post:
 *     summary: Execute cross-node operation
 *     description: Executes coordinated operations across multiple Greek letter nodes
 *     tags: [Greek Nodes]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operationType:
 *                 type: string
 *                 enum: [synchronized_activation, governance_consensus, financial_coordination, emergency_shutdown]
 *               sourceNode:
 *                 type: string
 *               targetNodes:
 *                 type: array
 *                 items:
 *                   type: string
 *               operationData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cross-node operation executed successfully
 *       400:
 *         description: Invalid operation parameters
 *       500:
 *         description: Operation failed
 */
router.post('/cross-node-operation', async (req, res) => {
  try {
    const operation = req.body || {};
    
    const validOperations = [
      'synchronized_activation',
      'governance_consensus', 
      'financial_coordination',
      'emergency_shutdown'
    ];
    
    if (!validOperations.includes(operation.operationType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation type',
        message: `Operation type must be one of: ${validOperations.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const system = getOrCreateSystem();
    
    // Initialize system if not already done
    if (!system.systemState.initialized) {
      await system.initializeSystem();
    }
    
    const result = await system.executeCrossNodeOperation(operation);
    
    res.json({
      success: true,
      operationResult: result,
      message: `Cross-node operation ${operation.operationType} completed successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to execute cross-node operation',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/greek-nodes/{nodeType}/details:
 *   get:
 *     summary: Get detailed information for specific node
 *     description: Returns detailed status and metrics for a specific Greek letter node
 *     tags: [Greek Nodes]
 *     parameters:
 *       - in: path
 *         name: nodeType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [alpha, beta, theta, omega]
 *     responses:
 *       200:
 *         description: Node details retrieved successfully
 *       400:
 *         description: Invalid node type
 *       404:
 *         description: Node not found or not initialized
 */
router.get('/:nodeType/details', async (req, res) => {
  try {
    const { nodeType } = req.params;
    
    const validNodes = ['alpha', 'beta', 'theta', 'omega'];
    if (!validNodes.includes(nodeType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid node type',
        message: `Node type must be one of: ${validNodes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const system = getOrCreateSystem();
    
    if (!system.nodes[nodeType]) {
      return res.status(404).json({
        success: false,
        error: 'Node not initialized',
        message: `${nodeType.toUpperCase()} node has not been initialized`,
        timestamp: new Date().toISOString()
      });
    }
    
    const nodeStatus = system.nodes[nodeType].getNodeStatus();
    
    res.json({
      success: true,
      nodeType: nodeType,
      nodeDetails: nodeStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to get ${req.params.nodeType} node details`,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/greek-nodes/reset:
 *   post:
 *     summary: Reset Greek Letter Nodes system
 *     description: Resets and reinitializes the entire Greek Letter Nodes system
 *     tags: [Greek Nodes]
 *     responses:
 *       200:
 *         description: System reset successfully
 *       500:
 *         description: Reset failed
 */
router.post('/reset', async (req, res) => {
  try {
    // Reset the system singleton
    greekNodesSystem = null;
    
    // Create new system
    const system = getOrCreateSystem();
    
    res.json({
      success: true,
      message: 'Greek Letter Nodes system has been reset',
      systemId: system.config.systemId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset system',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;