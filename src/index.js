/**
 * Sync Stone Protocol™ & Soul.Ed.Xchange
 * Main entry point for all system functions
 */

// Phase 1: Data Management Functions
export {
    septet_encode,
    timbr_compress,
    foil_harmonic_fold,
    multi_signal_encode,
    closed_hub_unzip
} from './data-management/index.js';

// Phase 1: Core Security Functions
export {
    omega_lock_generate,
    omega_lock_validate,
    plugin_security_manager,
    adaptive_failover_detect,
    directional_reversal
} from './security/index.js';

// Phase 2: Node Architecture Functions
export {
    alpha_node_ingest,
    beta_node_process,
    gamma_node_store,
    delta_node_orchestrate
} from './nodes/index.js';

// Phase 2: Communication Protocol Functions
export {
    sync_stone_handshake,
    bluetooth_integration_layer,
    protocol_negotiation,
    backwards_compatibility_check
} from './communication/index.js';

// System information
export const SYNC_STONE_PROTOCOL_VERSION = '1.0.0';
export const SOUL_ED_XCHANGE_VERSION = '1.0.0';

/**
 * Initialize the Sync Stone Protocol system
 * @param {Object} config - System configuration
 * @returns {Object} Initialized system instance
 */
export function initializeSyncStoneProtocol(config = {}) {
    const defaultConfig = {
        enableDataManagement: true,
        enableSecurity: true,
        enableNodeArchitecture: true,  // Phase 2 - now available
        enableCommunication: true,     // Phase 2 - now available
        enableFinancial: false,        // Phase 3
        enableIntegration: false,      // Phase 3
        enableUtilities: false,        // Phase 4
        enableGovernance: false,       // Phase 4
        enableMonitoring: false,       // Phase 4
        enableEmergency: false,        // Phase 4
        logLevel: 'info'
    };
    
    const systemConfig = { ...defaultConfig, ...config };
    
    return {
        version: SYNC_STONE_PROTOCOL_VERSION,
        config: systemConfig,
        initialized: true,
        timestamp: Date.now(),
        
        // System health check
        healthCheck() {
            return {
                status: 'healthy',
                version: SYNC_STONE_PROTOCOL_VERSION,
                modules: {
                    dataManagement: systemConfig.enableDataManagement,
                    security: systemConfig.enableSecurity,
                    nodeArchitecture: systemConfig.enableNodeArchitecture,
                    communication: systemConfig.enableCommunication,
                    financial: systemConfig.enableFinancial,
                    integration: systemConfig.enableIntegration,
                    utilities: systemConfig.enableUtilities,
                    governance: systemConfig.enableGovernance,
                    monitoring: systemConfig.enableMonitoring,
                    emergency: systemConfig.enableEmergency
                },
                timestamp: Date.now()
            };
        },
        
        // Get available functions
        getAvailableFunctions() {
            const functions = [];
            
            if (systemConfig.enableDataManagement) {
                functions.push(
                    'septet_encode',
                    'timbr_compress',
                    'foil_harmonic_fold',
                    'multi_signal_encode',
                    'closed_hub_unzip'
                );
            }
            
            if (systemConfig.enableSecurity) {
                functions.push(
                    'omega_lock_generate',
                    'omega_lock_validate',
                    'plugin_security_manager',
                    'adaptive_failover_detect',
                    'directional_reversal'
                );
            }
            
            if (systemConfig.enableNodeArchitecture) {
                functions.push(
                    'alpha_node_ingest',
                    'beta_node_process',
                    'gamma_node_store',
                    'delta_node_orchestrate'
                );
            }
            
            if (systemConfig.enableCommunication) {
                functions.push(
                    'sync_stone_handshake',
                    'bluetooth_integration_layer',
                    'protocol_negotiation',
                    'backwards_compatibility_check'
                );
            }
            
            // Additional phases will be added as implemented
            
            return functions;
        }
    };
}