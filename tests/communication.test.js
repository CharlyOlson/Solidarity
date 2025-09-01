/**
 * Test suite for Communication Protocol Functions
 */

import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import {
    sync_stone_handshake,
    bluetooth_integration_layer,
    protocol_negotiation,
    backwards_compatibility_check
} from '../src/communication/index.js';

describe('Communication Protocol Functions', () => {
    
    test('sync_stone_handshake should establish connection between compatible devices', () => {
        const deviceA = {
            id: 'device-a-123',
            capabilities: {
                bluetooth: true,
                wifi: true,
                cellular: false,
                encryption: ['basic', 'aes-128', 'aes-256'],
                protocols: ['sync-stone-1.0', 'sync-stone-2.0']
            }
        };
        
        const deviceB = {
            id: 'device-b-456',
            capabilities: {
                bluetooth: true,
                wifi: false,
                cellular: true,
                encryption: ['basic', 'aes-128'],
                protocols: ['sync-stone-1.0']
            }
        };
        
        const result = sync_stone_handshake(deviceA, deviceB);
        
        assert(typeof result.handshakeId === 'string', 'Should have handshake ID');
        assert(result.status === 'SUCCESS', 'Should succeed with compatible devices');
        assert(result.connection.method === 'bluetooth', 'Should select best common method');
        assert(result.security.level === 'MEDIUM', 'Should negotiate appropriate security');
        assert(result.negotiated.protocol === 'sync-stone-1.0', 'Should select compatible protocol');
        assert(typeof result.devices.deviceA.challenge === 'string', 'Should generate challenge for device A');
        assert(typeof result.devices.deviceB.challenge === 'string', 'Should generate challenge for device B');
    });
    
    test('sync_stone_handshake should fail with incompatible devices', () => {
        const deviceA = {
            id: 'device-a-123',
            capabilities: {
                bluetooth: false,
                wifi: true,
                cellular: false,
                encryption: ['aes-256'],
                protocols: ['sync-stone-2.0']
            }
        };
        
        const deviceB = {
            id: 'device-b-456',
            capabilities: {
                bluetooth: false,
                wifi: false,
                cellular: true,
                encryption: ['basic'],
                protocols: ['sync-stone-1.0']
            }
        };
        
        const result = sync_stone_handshake(deviceA, deviceB);
        
        assert(result.status === 'FAILED', 'Should fail with incompatible devices');
        assert(result.reason.includes('No common connection methods'), 'Should explain failure reason');
    });
    
    test('sync_stone_handshake should prioritize better connection methods', () => {
        const deviceA = {
            id: 'device-a-123',
            capabilities: {
                bluetooth: true,
                wifi: true,
                cellular: true,
                encryption: ['basic'],
                protocols: ['sync-stone-1.0']
            }
        };
        
        const deviceB = {
            id: 'device-b-456',
            capabilities: {
                bluetooth: true,
                wifi: true,
                cellular: true,
                encryption: ['basic'],
                protocols: ['sync-stone-1.0']
            }
        };
        
        const result = sync_stone_handshake(deviceA, deviceB);
        
        assert(result.connection.method === 'wifi', 'Should prioritize WiFi over other methods');
        assert(result.connection.priority === 3, 'WiFi should have highest priority');
    });
    
    test('bluetooth_integration_layer should create integration for compatible stack', () => {
        const bluetoothStack = {
            version: '5.0',
            profiles: ['A2DP', 'HFP', 'SPP', 'GATT'],
            services: ['audio', 'data'],
            maxConnections: 8,
            security: 'enhanced',
            mtu: 512
        };
        
        const syncStoneFeatures = {
            dataCompression: true,
            harmonicEncoding: true,
            multiSignal: false,
            adaptiveSecurity: true,
            nodeArchitecture: false
        };
        
        const result = bluetooth_integration_layer(bluetoothStack, syncStoneFeatures);
        
        assert(result.status === 'SUCCESS', 'Should succeed with compatible stack');
        assert(result.compatibility.bluetoothVersion === true, 'Should support Bluetooth version');
        assert(result.compatibility.profileSupport === true, 'Should support required profiles');
        assert(result.integrationLayer.characteristics.length > 0, 'Should create characteristics');
        assert(typeof result.integrationLayer.serviceUuid === 'string', 'Should generate service UUID');
    });
    
    test('bluetooth_integration_layer should fail with incompatible stack', () => {
        const bluetoothStack = {
            version: '3.0',
            profiles: ['A2DP'],
            maxConnections: 1,
            security: 'basic'
        };
        
        const syncStoneFeatures = {
            dataCompression: true,
            harmonicEncoding: true
        };
        
        const result = bluetooth_integration_layer(bluetoothStack, syncStoneFeatures);
        
        assert(result.status === 'INCOMPATIBLE', 'Should fail with incompatible stack');
        assert(Array.isArray(result.recommendations), 'Should provide recommendations');
        assert(result.recommendations.length > 0, 'Should have specific recommendations');
    });
    
    test('bluetooth_integration_layer should create appropriate characteristics', () => {
        const bluetoothStack = {
            version: '5.0',
            profiles: ['SPP', 'GATT'],
            security: 'enhanced',
            maxConnections: 8
        };
        
        const syncStoneFeatures = {
            dataCompression: true,
            harmonicEncoding: false,
            multiSignal: true,
            adaptiveSecurity: true
        };
        
        const result = bluetooth_integration_layer(bluetoothStack, syncStoneFeatures);
        
        const characteristics = result.integrationLayer.characteristics;
        const hasDataCompression = characteristics.some(c => c.description.includes('compression'));
        const hasMultiSignal = characteristics.some(c => c.description.toLowerCase().includes('multi-signal'));
        const hasAdaptiveSecurity = characteristics.some(c => c.description.includes('security'));
        const hasHarmonicEncoding = characteristics.some(c => c.description.includes('harmonic'));
        
        assert(hasDataCompression === true, 'Should create data compression characteristic');
        assert(hasMultiSignal === true, 'Should create multi-signal characteristic');
        assert(hasAdaptiveSecurity === true, 'Should create adaptive security characteristic');
        assert(hasHarmonicEncoding === false, 'Should not create harmonic encoding characteristic');
    });
    
    test('protocol_negotiation should negotiate features based on device capabilities', () => {
        const deviceCapabilities = {
            cpu: 'high',
            memory: 'standard',
            storage: 'high',
            network: 'enhanced',
            battery: 'unlimited',
            os: 'linux'
        };
        
        const availableFeatures = [
            'septet-encoding',
            'timbr-compression',
            'foil-folding',
            'multi-signal',
            'omega-locking',
            'adaptive-security',
            'node-architecture'
        ];
        
        const result = protocol_negotiation(deviceCapabilities, availableFeatures);
        
        assert(typeof result.negotiationId === 'string', 'Should have negotiation ID');
        assert(Array.isArray(result.negotiatedFeatures), 'Should have negotiated features');
        assert(Array.isArray(result.unsupportedFeatures), 'Should track unsupported features');
        assert(typeof result.efficiency === 'number', 'Should calculate efficiency percentage');
        assert(result.protocolVersion === '2.0', 'High-capability device should get latest protocol');
    });
    
    test('protocol_negotiation should handle limited device capabilities', () => {
        const deviceCapabilities = {
            cpu: 'low',
            memory: 'limited',
            storage: 'minimal',
            network: 'basic',
            battery: 'finite',
            os: 'embedded'
        };
        
        const availableFeatures = [
            'septet-encoding',
            'timbr-compression',
            'multi-signal',
            'node-architecture',
            'adaptive-security'
        ];
        
        const result = protocol_negotiation(deviceCapabilities, availableFeatures);
        
        assert(result.efficiency < 100, 'Limited device should have reduced efficiency');
        assert(result.unsupportedFeatures.length > 0, 'Should have unsupported features');
        assert(Array.isArray(result.recommendations), 'Should provide recommendations');
        assert(result.protocolVersion !== '2.0', 'Limited device should get reduced protocol version');
    });
    
    test('protocol_negotiation should prioritize features correctly', () => {
        const deviceCapabilities = {
            cpu: 'medium',
            memory: 'standard',
            battery: 'limited'
        };
        
        const availableFeatures = [
            'septet-encoding',
            'sync-stone-handshake',
            'omega-locking',
            'node-architecture',
            'multi-signal'
        ];
        
        const result = protocol_negotiation(deviceCapabilities, availableFeatures);
        
        // Find essential features that should be prioritized
        const encodingFeature = result.negotiatedFeatures.find(f => f.feature === 'septet-encoding');
        const handshakeFeature = result.negotiatedFeatures.find(f => f.feature === 'sync-stone-handshake');
        
        if (encodingFeature && handshakeFeature) {
            assert(encodingFeature.priority >= handshakeFeature.priority - 1, 'Essential features should have high priority');
        }
    });
    
    test('backwards_compatibility_check should handle legacy devices', () => {
        const legacyDevice = {
            id: 'legacy-device-001',
            type: 'embedded',
            version: '1.0',
            protocols: ['basic', 'sync-stone-1.0'],
            capabilities: {
                cpu: 'low',
                memory: 'limited'
            }
        };
        
        const modernFeatures = [
            'septet-encoding',
            'timbr-compression',
            'foil-folding',
            'omega-locking',
            'sync-stone-handshake'
        ];
        
        const result = backwards_compatibility_check(legacyDevice, modernFeatures);
        
        assert(typeof result.compatibilityId === 'string', 'Should have compatibility ID');
        assert(Array.isArray(result.compatibilityResults), 'Should have compatibility results');
        assert(typeof result.compatibilityScore === 'number', 'Should calculate compatibility score');
        assert(result.compatibilityScore >= 0 && result.compatibilityScore <= 100, 'Score should be 0-100');
        assert(['FULL', 'PARTIAL', 'LIMITED'].includes(result.supportLevel), 'Should have valid support level');
    });
    
    test('backwards_compatibility_check should support native features for modern legacy devices', () => {
        const legacyDevice = {
            id: 'semi-modern-device',
            version: '1.5',
            protocols: ['sync-stone-1.5']
        };
        
        const modernFeatures = [
            'septet-encoding',
            'timbr-compression',
            'foil-folding'
        ];
        
        const result = backwards_compatibility_check(legacyDevice, modernFeatures);
        
        const nativeSupport = result.compatibilityResults.filter(r => r.method === 'native');
        assert(nativeSupport.length > 0, 'Should have some native support');
        
        const emulationSupport = result.compatibilityResults.filter(r => r.method === 'emulation');
        assert(emulationSupport.length >= 0, 'May have emulation support');
    });
    
    test('backwards_compatibility_check should create bridge configuration', () => {
        const legacyDevice = {
            id: 'old-device',
            version: '0.9',
            protocols: ['basic']
        };
        
        const modernFeatures = [
            'multi-signal',
            'node-architecture',
            'adaptive-security'
        ];
        
        const result = backwards_compatibility_check(legacyDevice, modernFeatures);
        
        assert(typeof result.bridge === 'object', 'Should have bridge configuration');
        assert(typeof result.bridge.enabled === 'boolean', 'Bridge should have enabled flag');
        
        if (result.bridge.enabled) {
            assert(Array.isArray(result.bridge.bridgeConfig), 'Should have bridge config array');
            assert(typeof result.bridge.translationMap === 'object', 'Should have translation map');
        }
    });
    
    test('error handling should work for communication functions', () => {
        // Test sync_stone_handshake with missing devices
        assert.throws(() => sync_stone_handshake(null, null), /Both devices must be provided/);
        assert.throws(() => sync_stone_handshake({ id: null }, { id: 'valid' }), /must have valid IDs/);
        
        // Test bluetooth_integration_layer with invalid parameters
        assert.throws(() => bluetooth_integration_layer(null, {}), /Valid Bluetooth stack configuration is required/);
        assert.throws(() => bluetooth_integration_layer({}, null), /Valid Sync Stone features configuration is required/);
        
        // Test protocol_negotiation with invalid parameters
        assert.throws(() => protocol_negotiation(null, []), /Device capabilities must be provided/);
        assert.throws(() => protocol_negotiation({}, 'invalid'), /must be provided as an array/);
        
        // Test backwards_compatibility_check with invalid parameters
        assert.throws(() => backwards_compatibility_check(null, []), /Legacy device information is required/);
        assert.throws(() => backwards_compatibility_check({}, 'invalid'), /must be provided as an array/);
    });
    
    test('complete communication flow should work end-to-end', () => {
        // Step 1: Device handshake
        const deviceA = {
            id: 'device-a',
            capabilities: {
                bluetooth: true,
                wifi: true,
                encryption: ['aes-128'],
                protocols: ['sync-stone-1.0']
            }
        };
        
        const deviceB = {
            id: 'device-b',
            capabilities: {
                bluetooth: true,
                wifi: false,
                encryption: ['aes-128'],
                protocols: ['sync-stone-1.0']
            }
        };
        
        const handshakeResult = sync_stone_handshake(deviceA, deviceB);
        assert(handshakeResult.status === 'SUCCESS');
        
        // Step 2: Protocol negotiation
        const negotiationResult = protocol_negotiation(
            { cpu: 'medium', memory: 'standard', network: 'bluetooth' },
            ['septet-encoding', 'omega-locking', 'sync-stone-handshake']
        );
        assert(negotiationResult.efficiency > 0);
        
        // Step 3: Bluetooth integration
        const integrationResult = bluetooth_integration_layer(
            {
                version: '5.0',
                profiles: ['SPP', 'GATT'],
                security: 'enhanced'
            },
            { dataCompression: true, adaptiveSecurity: false }
        );
        assert(integrationResult.status === 'SUCCESS');
        
        // Step 4: Backwards compatibility check
        const compatibilityResult = backwards_compatibility_check(
            { id: 'legacy', version: '1.0', protocols: ['sync-stone-1.0'] },
            ['septet-encoding', 'omega-locking']
        );
        assert(compatibilityResult.compatibilityScore > 0);
    });
});