/**
 * Test suite for Node Architecture Functions
 */

import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import {
    alpha_node_ingest,
    beta_node_process,
    gamma_node_store,
    delta_node_orchestrate
} from '../src/nodes/index.js';

describe('Node Architecture Functions', () => {
    
    test('alpha_node_ingest should validate and sanitize raw data', () => {
        const rawData = 'Hello Sync Stone Protocol';
        const result = alpha_node_ingest(rawData);
        
        assert(typeof result.ingestionId === 'string', 'Should have ingestion ID');
        assert(typeof result.timestamp === 'number', 'Should have timestamp');
        assert(result.originalData === rawData, 'Should preserve original data');
        assert(typeof result.sanitizedData === 'string', 'Should have sanitized data');
        assert(result.validation.dataType === 'string', 'Should identify data type');
        assert(result.validation.integrity === true, 'Should validate data integrity');
        assert(result.status === 'VALIDATED', 'Should have validated status');
        assert(result.nextNode === 'BETA', 'Should route to Beta node');
    });
    
    test('alpha_node_ingest should handle different data types', () => {
        // Test with object
        const objectData = { test: 'data', value: 123 };
        const objectResult = alpha_node_ingest(objectData);
        assert(objectResult.validation.dataType === 'object');
        assert(objectResult.validation.structure === 'structured');
        
        // Test with array
        const arrayData = [1, 2, 3, 4, 5];
        const arrayResult = alpha_node_ingest(arrayData);
        assert(arrayResult.validation.dataType === 'object'); // Arrays are objects in JS
        assert(arrayResult.validation.structure === 'list');
        
        // Test with number
        const numberData = 42;
        const numberResult = alpha_node_ingest(numberData);
        assert(numberResult.validation.dataType === 'number');
        assert(numberResult.validation.structure === 'primitive');
    });
    
    test('alpha_node_ingest should handle throttling for large data', () => {
        const largeData = 'x'.repeat(15000); // Ensure size > 10000
        const result = alpha_node_ingest(largeData);
        
        assert(typeof result.throttling.score === 'number', 'Should calculate throttle score');
        assert(result.throttling.score >= 0, 'Throttle score should be non-negative');
        assert(result.routing.priority === 'HIGH', 'Large data should have high priority');
    });
    
    test('beta_node_process should process validated data with business rules', () => {
        const validatedData = alpha_node_ingest('test data');
        const businessRules = {
            transformations: [{ type: 'uppercase' }],
            filters: [{ type: 'remove_empty' }],
            outputFormat: 'structured'
        };
        
        const result = beta_node_process(validatedData, businessRules);
        
        assert(typeof result.processingId === 'string', 'Should have processing ID');
        assert(result.status === 'PROCESSED', 'Should have processed status');
        assert(result.nextNode === 'GAMMA', 'Should route to Gamma node');
        assert(Array.isArray(result.metadata.transformations), 'Should track transformations');
        assert(result.appliedRules.outputFormat === 'structured', 'Should apply business rules');
    });
    
    test('beta_node_process should handle transformation errors gracefully', () => {
        const validatedData = alpha_node_ingest('test data');
        const businessRules = {
            transformations: [{ type: 'invalid_transformation' }],
            errorHandling: 'graceful'
        };
        
        const result = beta_node_process(validatedData, businessRules);
        
        assert(result.status === 'PROCESSED', 'Should still process with graceful error handling');
        assert(Array.isArray(result.metadata.errors), 'Should track errors');
    });
    
    test('beta_node_process should apply various transformations', () => {
        const validatedData = alpha_node_ingest('  Hello World  ');
        const businessRules = {
            transformations: [
                { type: 'trim' },
                { type: 'uppercase' }
            ]
        };
        
        const result = beta_node_process(validatedData, businessRules);
        
        assert(result.processedData === 'HELLO WORLD', 'Should apply transformations in sequence');
    });
    
    test('gamma_node_store should store processed data with encryption', () => {
        const validatedData = alpha_node_ingest('test data');
        const processedData = beta_node_process(validatedData);
        const storageConfig = {
            encryption: true,
            compression: true,
            backup: true
        };
        
        const result = gamma_node_store(processedData, storageConfig);
        
        assert(typeof result.storageId === 'string', 'Should have storage ID');
        assert(typeof result.storageKey === 'string', 'Should have storage key');
        assert(result.status === 'STORED', 'Should have stored status');
        assert(result.nextNode === 'DELTA', 'Should route to Delta node');
        assert(result.config.encryption === true, 'Should enable encryption');
        assert(result.config.compression === true, 'Should enable compression');
        assert(result.backupLocation !== null, 'Should create backup location');
    });
    
    test('gamma_node_store should handle storage operations', () => {
        const validatedData = alpha_node_ingest({ key: 'value', data: [1, 2, 3] });
        const processedData = beta_node_process(validatedData);
        const result = gamma_node_store(processedData);
        
        assert(result.metadata.size > 0, 'Should calculate data size');
        assert(typeof result.metadata.checksums.sha256 === 'string', 'Should generate SHA256 checksum');
        assert(typeof result.metadata.checksums.md5 === 'string', 'Should generate MD5 checksum');
        assert(Array.isArray(result.metadata.operations), 'Should track storage operations');
    });
    
    test('delta_node_orchestrate should coordinate system components', () => {
        const systemComponents = [
            { id: 'alpha-1', status: 'healthy', metrics: { cpu: 50 } },
            { id: 'beta-1', status: 'degraded', metrics: { cpu: 85 } },
            { id: 'gamma-1', status: 'failed', metrics: { cpu: 0 } }
        ];
        
        const healthMetrics = {
            cpu: 60,
            memory: 70,
            responseTime: 500,
            unauthorizedAccess: 0,
            dataIntegrityFailures: 0
        };
        
        const result = delta_node_orchestrate(systemComponents, healthMetrics);
        
        assert(typeof result.orchestrationId === 'string', 'Should have orchestration ID');
        assert(typeof result.systemHealth.score === 'number', 'Should calculate health score');
        assert(result.systemHealth.components.total === 3, 'Should count total components');
        assert(result.systemHealth.components.healthy === 1, 'Should count healthy components');
        assert(result.systemHealth.components.degraded === 1, 'Should count degraded components');
        assert(result.systemHealth.components.failed === 1, 'Should count failed components');
    });
    
    test('delta_node_orchestrate should make load balancing decisions', () => {
        const systemComponents = [
            { id: 'node-1', status: 'healthy' },
            { id: 'node-2', status: 'healthy' },
            { id: 'node-3', status: 'degraded' },
            { id: 'node-4', status: 'failed' }
        ];
        
        const healthMetrics = { cpu: 50, memory: 60 };
        const result = delta_node_orchestrate(systemComponents, healthMetrics);
        
        assert(result.decisions.loadBalancing.enabled === true, 'Should enable load balancing');
        assert(result.decisions.loadBalancing.weights['node-1'] === 1.0, 'Healthy nodes should have full weight');
        assert(result.decisions.loadBalancing.weights['node-3'] === 0.5, 'Degraded nodes should have reduced weight');
        assert(result.decisions.loadBalancing.weights['node-4'] === 0.0, 'Failed nodes should have zero weight');
    });
    
    test('delta_node_orchestrate should detect critical conditions', () => {
        const systemComponents = [
            { id: 'node-1', status: 'failed' },
            { id: 'node-2', status: 'failed' },
            { id: 'node-3', status: 'healthy' }
        ];
        
        const healthMetrics = {
            cpu: 95,
            memory: 90,
            unauthorizedAccess: 5
        };
        
        const result = delta_node_orchestrate(systemComponents, healthMetrics);
        
        assert(result.systemHealth.score < 50, 'Should have low health score');
        assert(result.decisions.errorHandling.criticalErrors.length > 0, 'Should detect critical errors');
        assert(result.decisions.securityEnforcement.threatLevel === 'HIGH', 'Should detect high threat level');
        assert(Array.isArray(result.actions), 'Should provide recovery actions');
    });
    
    test('delta_node_orchestrate should make scaling decisions', () => {
        const systemComponents = [
            { id: 'node-1', status: 'healthy' }
        ];
        
        const healthMetrics = {
            cpu: 85,
            memory: 90,
            responseTime: 1500
        };
        
        const result = delta_node_orchestrate(systemComponents, healthMetrics);
        
        const scalingDecisions = result.decisions.adaptiveManagement.scalingDecisions;
        assert(Array.isArray(scalingDecisions), 'Should have scaling decisions');
        
        const scaleUpDecision = scalingDecisions.find(d => d.action === 'SCALE_UP');
        assert(scaleUpDecision !== undefined, 'Should recommend scaling up for high resource usage');
    });
    
    test('error handling should work for node functions', () => {
        // Test alpha_node_ingest with null data
        assert.throws(() => alpha_node_ingest(null), /cannot be null or undefined/);
        
        // Test beta_node_process with invalid data
        assert.throws(() => beta_node_process({ status: 'INVALID' }), /must be validated data/);
        
        // Test gamma_node_store with invalid data
        assert.throws(() => gamma_node_store({ status: 'INVALID' }), /must be processed data/);
        
        // Test delta_node_orchestrate with invalid inputs
        assert.throws(() => delta_node_orchestrate('invalid', {}), /must be provided as an array/);
        assert.throws(() => delta_node_orchestrate([], 'invalid'), /must be provided as an object/);
    });
    
    test('complete node flow should work end-to-end', () => {
        // Alpha: Ingest
        const rawData = { message: 'Hello Sync Stone', value: 42, items: [1, 2, 3] };
        const alphaResult = alpha_node_ingest(rawData);
        assert(alphaResult.status === 'VALIDATED');
        
        // Beta: Process
        const businessRules = {
            transformations: [{ type: 'normalize' }],
            filters: [{ type: 'remove_nulls' }],
            outputFormat: 'structured'
        };
        const betaResult = beta_node_process(alphaResult, businessRules);
        assert(betaResult.status === 'PROCESSED');
        
        // Gamma: Store
        const gammaResult = gamma_node_store(betaResult, { encryption: true });
        assert(gammaResult.status === 'STORED');
        
        // Delta: Orchestrate
        const systemComponents = [
            { id: 'alpha-1', status: 'healthy' },
            { id: 'beta-1', status: 'healthy' },
            { id: 'gamma-1', status: 'healthy' }
        ];
        const healthMetrics = { cpu: 50, memory: 60, responseTime: 300 };
        const deltaResult = delta_node_orchestrate(systemComponents, healthMetrics);
        
        assert(deltaResult.systemHealth.score > 80, 'Should have high system health');
        assert(deltaResult.systemHealth.status === 'EXCELLENT', 'Should have excellent status');
    });
});