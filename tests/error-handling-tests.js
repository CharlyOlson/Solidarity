/**
 * Error Handling Tests
 * Comprehensive tests for environment-aware error handling
 */

import ErrorHandler from '../src/error-handler.js';
import SolidarityPlatform from '../src/solidarity-platform.js';

// Simple test runner
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
        }
    }

    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    async run() {
        console.log('🧪 Running Error Handling Tests\n');

        for (const { name, fn } of this.tests) {
            try {
                await fn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log('\n📊 Error Handling Test Results:');
        console.log(`   Passed: ${this.passed}`);
        console.log(`   Failed: ${this.failed}`);
        console.log(`   Total: ${this.passed + this.failed}`);
        console.log(`   Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    }
}

const runner = new TestRunner();

// Test environment detection
runner.test('ErrorHandler - Environment Detection (Default)', () => {
    const handler = new ErrorHandler();
    // Should default to production for security
    runner.assertEqual(handler.getConfig().environment, 'production');
    runner.assert(!handler.isDevelopment(), 'Should not be development by default');
    runner.assert(handler.isProduction(), 'Should be production by default');
});

runner.test('ErrorHandler - Development Environment', () => {
    const handler = new ErrorHandler({ environment: 'development' });
    runner.assertEqual(handler.getConfig().environment, 'development');
    runner.assert(handler.isDevelopment(), 'Should detect development');
    runner.assert(!handler.isProduction(), 'Should not be production');
    runner.assert(handler.getConfig().enableStackTraces, 'Should enable stack traces in dev');
});

runner.test('ErrorHandler - Production Environment', () => {
    const handler = new ErrorHandler({ environment: 'production' });
    runner.assertEqual(handler.getConfig().environment, 'production');
    runner.assert(!handler.isDevelopment(), 'Should not be development');
    runner.assert(handler.isProduction(), 'Should detect production');
    runner.assert(!handler.getConfig().enableStackTraces, 'Should disable stack traces in prod');
});

// Test error response creation
runner.test('ErrorHandler - Development Error Response', () => {
    const handler = new ErrorHandler({ environment: 'development' });
    const testError = new Error('Test error message');
    testError.stack = 'Error: Test error message\n    at test line';
    
    const response = handler.createErrorResponse(testError, { context: 'test' });
    
    runner.assert(response.success === false, 'Should mark as unsuccessful');
    runner.assertEqual(response.error, 'Test error message');
    runner.assert(response.stack, 'Should include stack trace in development');
    runner.assert(response.debug, 'Should include debug info in development');
    runner.assertEqual(response.context, 'test');
});

runner.test('ErrorHandler - Production Error Response', () => {
    const handler = new ErrorHandler({ environment: 'production' });
    const testError = new Error('Test error message');
    testError.stack = 'Error: Test error message\n    at test line';
    
    const response = handler.createErrorResponse(testError, { context: 'test' });
    
    runner.assert(response.success === false, 'Should mark as unsuccessful');
    runner.assertEqual(response.error, 'Test error message');
    runner.assert(!response.stack, 'Should not include stack trace in production');
    runner.assert(!response.debug, 'Should not include debug info in production');
    runner.assertEqual(response.context, 'test');
});

// Test error scenarios in actual components
runner.test('SolidarityPlatform - Error Handling Integration', async () => {
    const platform = new SolidarityPlatform({ environment: 'development' });
    
    // This should fail due to invalid session data
    const result = await platform.executeIntegratedSession({});
    
    runner.assert(!result.success, 'Should fail with invalid session data');
    runner.assert(result.error, 'Should have error message');
    runner.assert(result.timestamp, 'Should have timestamp');
});

// Test stack trace restrictions
runner.test('Error Logging - Stack Trace Restriction', () => {
    // Capture console output
    let consoleOutput = '';
    const originalError = console.error;
    console.error = (...args) => {
        consoleOutput += args.join(' ') + '\n';
    };
    
    try {
        // Test production environment
        const prodHandler = new ErrorHandler({ environment: 'production' });
        const testError = new Error('Test error');
        testError.stack = 'Error: Test error\n    at sensitive location';
        
        prodHandler.logError(testError, 'test context');
        
        runner.assert(consoleOutput.includes('Test error'), 'Should log error message');
        runner.assert(!consoleOutput.includes('sensitive location'), 'Should not log stack trace in production');
        
        // Reset and test development environment
        consoleOutput = '';
        const devHandler = new ErrorHandler({ environment: 'development' });
        devHandler.logError(testError, 'test context');
        
        runner.assert(consoleOutput.includes('Test error'), 'Should log error message in dev');
        runner.assert(consoleOutput.includes('sensitive location'), 'Should log stack trace in development');
        
    } finally {
        console.error = originalError;
    }
});

// Test error consistency across modules
runner.test('Error Response Consistency', async () => {
    const platform = new SolidarityPlatform({ environment: 'development' });
    
    // Test processor error handling
    const processorResult = await platform.processor.processWithStaging();
    if (!processorResult.success) {
        runner.assert(processorResult.error, 'Processor should return error message');
        runner.assert(processorResult.timestamp, 'Processor should return timestamp');
    }
    
    // Test platform error handling  
    const sessionResult = await platform.executeIntegratedSession({});
    runner.assert(!sessionResult.success, 'Session should fail with invalid data');
    runner.assert(sessionResult.error, 'Session should return error message');
    runner.assert(sessionResult.timestamp, 'Session should return timestamp');
});

// Run all tests
runner.run().catch(error => {
    console.error('Fatal test error:', error.message);
    process.exit(1);
});