/**
 * Mobile Device Testing Configuration
 * Defines configuration parameters for the mobile device testing interface
 */

module.exports = {
    // Server ports for different device types
    serverPorts: {
        iPhone: 3001,
        iPad: 3002,
        watch: 3003
    },
    
    // Test device templates
    deviceTemplates: {
        iPhone: {
            type: 'iPhone',
            models: ['iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 15 Pro'],
            osVersions: ['iOS 16.0', 'iOS 16.5', 'iOS 17.0', 'iOS 17.2']
        },
        iPad: {
            type: 'iPad',
            models: ['iPad Pro 11-inch', 'iPad Air', 'iPad Mini', 'iPad Pro 12.9-inch'],
            osVersions: ['iPadOS 16.0', 'iPadOS 16.5', 'iPadOS 17.0', 'iPadOS 17.2']
        },
        watch: {
            type: 'Apple Watch',
            models: ['Apple Watch Series 7', 'Apple Watch Series 8', 'Apple Watch Ultra', 'Apple Watch Series 9'],
            osVersions: ['watchOS 9.0', 'watchOS 9.5', 'watchOS 10.0', 'watchOS 10.2']
        }
    },
    
    // Test file paths for different device types
    testPaths: {
        iPhone: '/Documents/Solidarity',
        iPad: '/Documents/Solidarity/Projects',
        watch: '/Solidarity/Sync'
    },
    
    // Simulated sync delay range (min-max in ms)
    syncDelayRange: {
        min: 500,
        max: 3000
    },
    
    // Logging configuration
    logging: {
        enabled: true,
        logToConsole: true,
        logToFile: true,
        logPath: '../../logs/mobile-testing.log'
    }
};
