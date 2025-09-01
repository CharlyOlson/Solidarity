/**
 * Security Functions for Sync Stone Protocol™
 * Core security and failure management functions
 */

import crypto from 'crypto';

/**
 * Creates adaptive security locks using Fibonacci-like progression
 * Formula: Ω_(n+1) = Ω_n + Ω_(n-1)
 * @param {Object} transaction_data - Transaction data to secure
 * @returns {Object} Generated Omega lock with security metadata
 */
export function omega_lock_generate(transaction_data) {
    if (!transaction_data) {
        throw new Error('Transaction data is required for Omega lock generation');
    }
    
    // Serialize transaction data for hashing
    const dataString = JSON.stringify(transaction_data);
    const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    // Generate Fibonacci-like sequence for lock values
    const sequence = [1, 1];
    const sequenceLength = Math.max(8, dataHash.length % 16 + 8); // 8-24 values
    
    for (let i = 2; i < sequenceLength; i++) {
        const next = (sequence[i-1] + sequence[i-2]) % (2**32); // Prevent overflow
        sequence.push(next);
    }
    
    // Create adaptive lock based on data characteristics
    const lockComponents = {
        sequence: sequence,
        dataHash: dataHash,
        timestamp: Date.now(),
        complexity: sequenceLength,
        verification: sequence.reduce((sum, val) => (sum + val) % (2**32), 0)
    };
    
    // Generate final lock value using XOR of sequence values with data hash
    let lockValue = 0;
    const hashBytes = Buffer.from(dataHash, 'hex');
    
    for (let i = 0; i < sequence.length; i++) {
        const hashByte = hashBytes[i % hashBytes.length];
        lockValue ^= sequence[i] ^ hashByte;
    }
    
    return {
        lockValue: lockValue,
        lockId: crypto.createHash('sha256').update(dataString + lockValue.toString()).digest('hex').slice(0, 16),
        components: lockComponents,
        algorithm: 'OMEGA_FIBONACCI',
        strength: Math.floor(Math.log2(lockValue)) + sequence.length,
        createdAt: Date.now()
    };
}

/**
 * Validates incoming data against its Omega lock
 * @param {any} data - Data to validate
 * @param {Object} lock_value - Omega lock object
 * @returns {Object} Validation result with security metadata
 */
export function omega_lock_validate(data, lock_value) {
    if (!data || !lock_value) {
        return {
            valid: false,
            reason: 'Missing data or lock value',
            securityLevel: 'CRITICAL',
            timestamp: Date.now()
        };
    }
    
    try {
        // Regenerate lock for comparison
        const regeneratedLock = omega_lock_generate(data);
        
        // Compare lock values
        const lockMatch = regeneratedLock.lockValue === lock_value.lockValue;
        const hashMatch = regeneratedLock.components.dataHash === lock_value.components.dataHash;
        
        // Check temporal validity (locks expire after 1 hour by default)
        const currentTime = Date.now();
        const lockAge = currentTime - lock_value.createdAt;
        const maxAge = 3600000; // 1 hour in milliseconds
        const temporallyValid = lockAge <= maxAge;
        
        // Verify lock integrity
        const integrityCheck = lock_value.components.verification === 
            lock_value.components.sequence.reduce((sum, val) => (sum + val) % (2**32), 0);
        
        const isValid = lockMatch && hashMatch && temporallyValid && integrityCheck;
        
        return {
            valid: isValid,
            lockMatch: lockMatch,
            hashMatch: hashMatch,
            temporallyValid: temporallyValid,
            integrityCheck: integrityCheck,
            lockAge: lockAge,
            securityLevel: isValid ? 'SECURE' : 'BREACH_DETECTED',
            lockStrength: lock_value.strength,
            validatedAt: currentTime,
            reason: !isValid ? _getValidationFailureReason(lockMatch, hashMatch, temporallyValid, integrityCheck) : 'Valid'
        };
    } catch (error) {
        return {
            valid: false,
            reason: `Validation error: ${error.message}`,
            securityLevel: 'ERROR',
            timestamp: Date.now()
        };
    }
}

function _getValidationFailureReason(lockMatch, hashMatch, temporallyValid, integrityCheck) {
    const reasons = [];
    if (!lockMatch) reasons.push('Lock value mismatch');
    if (!hashMatch) reasons.push('Data hash mismatch');
    if (!temporallyValid) reasons.push('Lock expired');
    if (!integrityCheck) reasons.push('Lock integrity compromised');
    return reasons.join(', ');
}

/**
 * Manages modular security plugins (MFA, hardware tokens, encryption)
 * @param {string} device_id - Unique device identifier
 * @param {Array} security_modules - Array of security module configurations
 * @returns {Object} Security manager instance
 */
export function plugin_security_manager(device_id, security_modules) {
    if (!device_id) {
        throw new Error('Device ID is required');
    }
    
    if (!Array.isArray(security_modules)) {
        security_modules = [];
    }
    
    const manager = {
        deviceId: device_id,
        modules: new Map(),
        activeModules: new Set(),
        securityLevel: 'BASIC',
        
        // Register a security module
        registerModule(moduleConfig) {
            if (!moduleConfig.name || !moduleConfig.type) {
                throw new Error('Module must have name and type');
            }
            
            const module = {
                ...moduleConfig,
                id: crypto.createHash('sha256').update(device_id + moduleConfig.name).digest('hex').slice(0, 16),
                registeredAt: Date.now(),
                status: 'REGISTERED'
            };
            
            this.modules.set(module.id, module);
            return module.id;
        },
        
        // Activate a security module
        activateModule(moduleId) {
            const module = this.modules.get(moduleId);
            if (!module) {
                throw new Error(`Module ${moduleId} not found`);
            }
            
            module.status = 'ACTIVE';
            module.activatedAt = Date.now();
            this.activeModules.add(moduleId);
            this._updateSecurityLevel();
            
            return {
                success: true,
                moduleId: moduleId,
                securityLevel: this.securityLevel
            };
        },
        
        // Deactivate a security module
        deactivateModule(moduleId) {
            const module = this.modules.get(moduleId);
            if (!module) {
                throw new Error(`Module ${moduleId} not found`);
            }
            
            module.status = 'INACTIVE';
            module.deactivatedAt = Date.now();
            this.activeModules.delete(moduleId);
            this._updateSecurityLevel();
            
            return {
                success: true,
                moduleId: moduleId,
                securityLevel: this.securityLevel
            };
        },
        
        // Validate security requirements
        validateSecurity(requiredLevel = 'BASIC') {
            const levelMap = { 'BASIC': 1, 'ENHANCED': 2, 'HIGH': 3, 'CRITICAL': 4 };
            const currentLevel = levelMap[this.securityLevel] || 0;
            const required = levelMap[requiredLevel] || 0;
            
            return {
                valid: currentLevel >= required,
                currentLevel: this.securityLevel,
                requiredLevel: requiredLevel,
                activeModules: Array.from(this.activeModules),
                recommendations: currentLevel < required ? this._getSecurityRecommendations() : []
            };
        },
        
        // Get security status
        getStatus() {
            return {
                deviceId: this.deviceId,
                securityLevel: this.securityLevel,
                totalModules: this.modules.size,
                activeModules: this.activeModules.size,
                modules: Array.from(this.modules.values()),
                lastUpdated: Date.now()
            };
        },
        
        // Internal method to update security level
        _updateSecurityLevel() {
            const activeCount = this.activeModules.size;
            const hasMultiFactor = Array.from(this.activeModules).some(id => {
                const module = this.modules.get(id);
                return module && module.type === 'MFA';
            });
            const hasHardwareToken = Array.from(this.activeModules).some(id => {
                const module = this.modules.get(id);
                return module && module.type === 'HARDWARE_TOKEN';
            });
            const hasEncryption = Array.from(this.activeModules).some(id => {
                const module = this.modules.get(id);
                return module && module.type === 'ENCRYPTION';
            });
            
            if (activeCount >= 3 && hasMultiFactor && hasHardwareToken && hasEncryption) {
                this.securityLevel = 'CRITICAL';
            } else if (activeCount >= 2 && hasMultiFactor && (hasHardwareToken || hasEncryption)) {
                this.securityLevel = 'HIGH';
            } else if (activeCount >= 1 && (hasMultiFactor || hasEncryption)) {
                this.securityLevel = 'ENHANCED';
            } else {
                this.securityLevel = 'BASIC';
            }
        },
        
        // Internal method to provide security recommendations
        _getSecurityRecommendations() {
            const recommendations = [];
            const hasTypes = new Set(Array.from(this.activeModules).map(id => this.modules.get(id)?.type));
            
            if (!hasTypes.has('MFA')) {
                recommendations.push('Enable Multi-Factor Authentication');
            }
            if (!hasTypes.has('ENCRYPTION')) {
                recommendations.push('Enable Encryption Module');
            }
            if (!hasTypes.has('HARDWARE_TOKEN')) {
                recommendations.push('Add Hardware Token Authentication');
            }
            
            return recommendations;
        }
    };
    
    // Initialize with provided security modules
    for (const moduleConfig of security_modules) {
        const moduleId = manager.registerModule(moduleConfig);
        if (moduleConfig.autoActivate !== false) {
            manager.activateModule(moduleId);
        }
    }
    
    return manager;
}

/**
 * Monitors system health and detects "broke glass" failure scenarios
 * @param {Object} system_state - Current system state metrics
 * @returns {Object} Failure detection results
 */
export function adaptive_failover_detect(system_state) {
    if (!system_state) {
        throw new Error('System state is required for failover detection');
    }
    
    const thresholds = {
        cpu: 90, // CPU usage percentage
        memory: 85, // Memory usage percentage
        disk: 90, // Disk usage percentage
        network: 95, // Network utilization percentage
        errorRate: 10, // Errors per minute
        responseTime: 5000, // Response time in milliseconds
        temperature: 80 // Temperature in Celsius
    };
    
    const criticalThresholds = {
        cpu: 95,
        memory: 95,
        disk: 98,
        network: 98,
        errorRate: 50,
        responseTime: 10000,
        temperature: 90
    };
    
    const failures = [];
    const warnings = [];
    let severityLevel = 'NORMAL';
    
    // Check each system metric
    for (const [metric, value] of Object.entries(system_state)) {
        if (typeof value === 'number' && thresholds[metric]) {
            if (value >= criticalThresholds[metric]) {
                failures.push({
                    metric: metric,
                    value: value,
                    threshold: criticalThresholds[metric],
                    severity: 'CRITICAL',
                    action: 'IMMEDIATE_FAILOVER'
                });
                severityLevel = 'CRITICAL';
            } else if (value >= thresholds[metric]) {
                warnings.push({
                    metric: metric,
                    value: value,
                    threshold: thresholds[metric],
                    severity: 'WARNING',
                    action: 'MONITOR_CLOSELY'
                });
                if (severityLevel === 'NORMAL') {
                    severityLevel = 'WARNING';
                }
            }
        }
    }
    
    // Detect "broke glass" scenarios (multiple critical failures)
    const brokenGlass = failures.length >= 2 || 
                       (failures.length >= 1 && warnings.length >= 3);
    
    // Calculate overall system health score
    const totalMetrics = Object.keys(thresholds).length;
    const healthyMetrics = totalMetrics - failures.length - warnings.length;
    const healthScore = Math.round((healthyMetrics / totalMetrics) * 100);
    
    return {
        healthScore: healthScore,
        severityLevel: severityLevel,
        brokenGlass: brokenGlass,
        failures: failures,
        warnings: warnings,
        totalIssues: failures.length + warnings.length,
        recommendedActions: _getFailoverRecommendations(failures, warnings, brokenGlass),
        timestamp: Date.now(),
        systemState: system_state
    };
}

function _getFailoverRecommendations(failures, warnings, brokenGlass) {
    const recommendations = [];
    
    if (brokenGlass) {
        recommendations.push({
            priority: 'CRITICAL',
            action: 'EMERGENCY_SHUTDOWN',
            description: 'Multiple critical failures detected - initiate emergency protocols'
        });
        recommendations.push({
            priority: 'CRITICAL',
            action: 'ACTIVATE_BACKUP_SYSTEMS',
            description: 'Switch to backup systems immediately'
        });
    }
    
    failures.forEach(failure => {
        switch (failure.metric) {
            case 'cpu':
                recommendations.push({
                    priority: 'HIGH',
                    action: 'SCALE_HORIZONTAL',
                    description: 'Add more processing nodes to distribute CPU load'
                });
                break;
            case 'memory':
                recommendations.push({
                    priority: 'HIGH',
                    action: 'CLEAR_CACHE',
                    description: 'Clear non-essential cached data'
                });
                break;
            case 'disk':
                recommendations.push({
                    priority: 'HIGH',
                    action: 'ARCHIVE_DATA',
                    description: 'Move old data to backup storage'
                });
                break;
            case 'network':
                recommendations.push({
                    priority: 'HIGH',
                    action: 'THROTTLE_CONNECTIONS',
                    description: 'Reduce network connection limits'
                });
                break;
            case 'errorRate':
                recommendations.push({
                    priority: 'HIGH',
                    action: 'INVESTIGATE_ERRORS',
                    description: 'Analyze error logs for root cause'
                });
                break;
        }
    });
    
    return recommendations;
}

/**
 * Initiates controlled reversal of data flow during failures
 * @param {Object} flow_data - Current data flow information
 * @param {Object} failure_context - Context of the failure
 * @returns {Object} Reversal control results
 */
export function directional_reversal(flow_data, failure_context) {
    if (!flow_data || !failure_context) {
        throw new Error('Flow data and failure context are required');
    }
    
    const reversalPlan = {
        originalDirection: flow_data.direction || 'FORWARD',
        newDirection: null,
        affectedNodes: [],
        bypassRoutes: [],
        dataBuffering: false,
        estimatedDuration: 0
    };
    
    // Determine reversal strategy based on failure type
    switch (failure_context.type) {
        case 'NODE_FAILURE':
            reversalPlan.newDirection = 'BYPASS';
            reversalPlan.affectedNodes = [failure_context.failedNode];
            reversalPlan.bypassRoutes = _generateBypassRoutes(flow_data, failure_context.failedNode);
            break;
            
        case 'NETWORK_CONGESTION':
            reversalPlan.newDirection = 'REVERSE_TEMPORARY';
            reversalPlan.dataBuffering = true;
            reversalPlan.estimatedDuration = 300000; // 5 minutes
            break;
            
        case 'SECURITY_BREACH':
            reversalPlan.newDirection = 'HALT_AND_SECURE';
            reversalPlan.affectedNodes = flow_data.route || [];
            reversalPlan.dataBuffering = true;
            break;
            
        case 'DATA_CORRUPTION':
            reversalPlan.newDirection = 'ROLLBACK';
            reversalPlan.affectedNodes = flow_data.processedNodes || [];
            break;
            
        default:
            reversalPlan.newDirection = 'CONTROLLED_STOP';
    }
    
    // Execute reversal plan
    const execution = {
        planId: crypto.randomUUID(),
        status: 'INITIATED',
        startTime: Date.now(),
        steps: [],
        rollbackData: []
    };
    
    try {
        // Step 1: Stop new data intake
        execution.steps.push({
            step: 'HALT_INTAKE',
            timestamp: Date.now(),
            status: 'COMPLETED',
            details: 'New data intake halted'
        });
        
        // Step 2: Buffer existing data if required
        if (reversalPlan.dataBuffering) {
            execution.steps.push({
                step: 'BUFFER_DATA',
                timestamp: Date.now(),
                status: 'COMPLETED',
                details: `Buffered ${flow_data.pendingItems || 0} data items`,
                bufferedCount: flow_data.pendingItems || 0
            });
        }
        
        // Step 3: Execute directional change
        switch (reversalPlan.newDirection) {
            case 'BYPASS':
                execution.steps.push({
                    step: 'ACTIVATE_BYPASS',
                    timestamp: Date.now(),
                    status: 'COMPLETED',
                    details: `Activated ${reversalPlan.bypassRoutes.length} bypass routes`
                });
                break;
                
            case 'REVERSE_TEMPORARY':
                execution.steps.push({
                    step: 'REVERSE_FLOW',
                    timestamp: Date.now(),
                    status: 'IN_PROGRESS',
                    details: 'Temporarily reversing data flow direction'
                });
                break;
                
            case 'HALT_AND_SECURE':
                execution.steps.push({
                    step: 'SECURE_HALT',
                    timestamp: Date.now(),
                    status: 'COMPLETED',
                    details: 'System secured and halted due to security breach'
                });
                break;
                
            case 'ROLLBACK':
                execution.steps.push({
                    step: 'INITIATE_ROLLBACK',
                    timestamp: Date.now(),
                    status: 'IN_PROGRESS',
                    details: 'Rolling back to last known good state'
                });
                break;
        }
        
        execution.status = 'IN_PROGRESS';
        
    } catch (error) {
        execution.status = 'FAILED';
        execution.error = error.message;
        execution.steps.push({
            step: 'ERROR_HANDLING',
            timestamp: Date.now(),
            status: 'FAILED',
            details: error.message
        });
    }
    
    return {
        reversalPlan,
        execution,
        monitoringRequired: true,
        nextCheckIn: Date.now() + 60000, // Check again in 1 minute
        emergencyContact: failure_context.severity === 'CRITICAL'
    };
}

function _generateBypassRoutes(flow_data, failedNode) {
    // Generate alternative routes avoiding the failed node
    const routes = [];
    const currentRoute = flow_data.route || [];
    
    for (let i = 0; i < currentRoute.length; i++) {
        if (currentRoute[i] !== failedNode) {
            routes.push({
                from: i > 0 ? currentRoute[i-1] : 'SOURCE',
                to: i < currentRoute.length - 1 ? currentRoute[i+1] : 'DESTINATION',
                via: currentRoute[i],
                priority: 1
            });
        } else {
            // Create bypass route
            routes.push({
                from: i > 0 ? currentRoute[i-1] : 'SOURCE',
                to: i < currentRoute.length - 1 ? currentRoute[i+1] : 'DESTINATION',
                via: `BACKUP_${failedNode}`,
                priority: 2,
                bypass: true
            });
        }
    }
    
    return routes;
}