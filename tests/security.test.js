/**
 * Test suite for Security Functions
 */

import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import {
    omega_lock_generate,
    omega_lock_validate,
    plugin_security_manager,
    adaptive_failover_detect,
    directional_reversal
} from '../src/security/index.js';

describe('Security Functions', () => {
    
    test('omega_lock_generate should create valid Omega locks', () => {
        const transactionData = { from: 'user1', to: 'user2', amount: 100, timestamp: Date.now() };
        const result = omega_lock_generate(transactionData);
        
        assert(typeof result.lockValue === 'number', 'Lock value should be a number');
        assert(typeof result.lockId === 'string', 'Lock ID should be a string');
        assert(result.algorithm === 'OMEGA_FIBONACCI', 'Should use correct algorithm');
        assert(Array.isArray(result.components.sequence), 'Should have Fibonacci sequence');
        assert(typeof result.strength === 'number', 'Should have strength rating');
        assert(result.components.sequence.length >= 8, 'Sequence should have at least 8 values');
    });
    
    test('omega_lock_validate should validate correct locks', () => {
        const transactionData = { from: 'user1', to: 'user2', amount: 100, timestamp: Date.now() };
        const lock = omega_lock_generate(transactionData);
        const validation = omega_lock_validate(transactionData, lock);
        
        assert(validation.valid === true, 'Valid lock should pass validation');
        assert(validation.lockMatch === true, 'Lock values should match');
        assert(validation.hashMatch === true, 'Hashes should match');
        assert(validation.temporallyValid === true, 'Should be temporally valid');
        assert(validation.securityLevel === 'SECURE', 'Should have secure status');
    });
    
    test('omega_lock_validate should reject invalid locks', () => {
        const transactionData = { from: 'user1', to: 'user2', amount: 100 };
        const differentData = { from: 'user3', to: 'user4', amount: 200 };
        const lock = omega_lock_generate(transactionData);
        const validation = omega_lock_validate(differentData, lock);
        
        assert(validation.valid === false, 'Invalid lock should fail validation');
        assert(validation.securityLevel === 'BREACH_DETECTED', 'Should detect breach');
    });
    
    test('plugin_security_manager should manage security modules', () => {
        const deviceId = 'device-123';
        const modules = [
            { name: 'MFA-Module', type: 'MFA', autoActivate: true },
            { name: 'Hardware-Token', type: 'HARDWARE_TOKEN', autoActivate: false }
        ];
        
        const manager = plugin_security_manager(deviceId, modules);
        
        assert(manager.deviceId === deviceId, 'Should store device ID');
        assert(manager.modules.size === 2, 'Should register all modules');
        assert(manager.activeModules.size === 1, 'Should auto-activate one module');
        assert(manager.securityLevel === 'ENHANCED', 'Should have enhanced security');
        
        // Test module activation
        const moduleIds = Array.from(manager.modules.keys());
        const inactiveModuleId = moduleIds.find(id => !manager.activeModules.has(id));
        const activation = manager.activateModule(inactiveModuleId);
        
        assert(activation.success === true, 'Should successfully activate module');
        assert(manager.activeModules.size === 2, 'Should have two active modules');
        assert(manager.securityLevel === 'HIGH', 'Should upgrade to high security');
    });
    
    test('adaptive_failover_detect should detect system issues', () => {
        const normalState = {
            cpu: 50,
            memory: 60,
            disk: 70,
            network: 40,
            errorRate: 2,
            responseTime: 200,
            temperature: 45
        };
        
        const result = adaptive_failover_detect(normalState);
        
        assert(result.severityLevel === 'NORMAL', 'Normal state should be normal');
        assert(result.brokenGlass === false, 'Should not detect broken glass');
        assert(result.failures.length === 0, 'Should have no failures');
        assert(result.healthScore > 90, 'Should have high health score');
    });
    
    test('adaptive_failover_detect should detect critical failures', () => {
        const criticalState = {
            cpu: 96,
            memory: 97,
            disk: 99,
            network: 98,
            errorRate: 60,
            responseTime: 12000,
            temperature: 95
        };
        
        const result = adaptive_failover_detect(criticalState);
        
        assert(result.severityLevel === 'CRITICAL', 'Should detect critical state');
        assert(result.brokenGlass === true, 'Should detect broken glass scenario');
        assert(result.failures.length > 0, 'Should have failures');
        assert(result.healthScore < 50, 'Should have low health score');
        assert(Array.isArray(result.recommendedActions), 'Should have recommended actions');
    });
    
    test('directional_reversal should handle node failures', () => {
        const flowData = {
            direction: 'FORWARD',
            route: ['node1', 'node2', 'node3'],
            pendingItems: 10
        };
        
        const failureContext = {
            type: 'NODE_FAILURE',
            failedNode: 'node2',
            severity: 'HIGH'
        };
        
        const result = directional_reversal(flowData, failureContext);
        
        assert(result.reversalPlan.newDirection === 'BYPASS', 'Should plan bypass');
        assert(Array.isArray(result.reversalPlan.bypassRoutes), 'Should have bypass routes');
        assert(result.execution.status === 'IN_PROGRESS', 'Should be in progress');
        assert(Array.isArray(result.execution.steps), 'Should have execution steps');
        assert(result.monitoringRequired === true, 'Should require monitoring');
    });
    
    test('directional_reversal should handle security breaches', () => {
        const flowData = {
            direction: 'FORWARD',
            route: ['node1', 'node2'],
            pendingItems: 5
        };
        
        const failureContext = {
            type: 'SECURITY_BREACH',
            severity: 'CRITICAL'
        };
        
        const result = directional_reversal(flowData, failureContext);
        
        assert(result.reversalPlan.newDirection === 'HALT_AND_SECURE', 'Should halt and secure');
        assert(result.reversalPlan.dataBuffering === true, 'Should enable data buffering');
        assert(result.emergencyContact === true, 'Should require emergency contact');
    });
    
    test('error handling should work for security functions', () => {
        // Test omega_lock_generate with missing data
        assert.throws(() => omega_lock_generate(null), /Transaction data is required/);
        
        // Test plugin_security_manager with missing device ID
        assert.throws(() => plugin_security_manager(null, []), /Device ID is required/);
        
        // Test adaptive_failover_detect with missing system state
        assert.throws(() => adaptive_failover_detect(null), /System state is required/);
        
        // Test directional_reversal with missing parameters
        assert.throws(() => directional_reversal(null, null), /Flow data and failure context are required/);
    });
    
    test('omega locks should have temporal expiration', async () => {
        const transactionData = { test: 'data' };
        const lock = omega_lock_generate(transactionData);
        
        // Simulate expired lock by modifying creation time
        const expiredLock = {
            ...lock,
            createdAt: Date.now() - 3700000 // 1 hour and 10 minutes ago
        };
        
        const validation = omega_lock_validate(transactionData, expiredLock);
        assert(validation.valid === false, 'Expired lock should be invalid');
        assert(validation.temporallyValid === false, 'Should detect temporal expiration');
    });
});