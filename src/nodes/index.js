/**
 * Node Architecture Functions for Sync Stone Protocol™
 * Four-node system implementation (Alpha, Beta, Gamma, Delta)
 */

import crypto from 'crypto';

/**
 * Alpha Node: Handles data ingestion and initial validation
 * @param {any} raw_data - Raw data to be ingested
 * @returns {Object} Validated data ready for processing
 */
export function alpha_node_ingest(raw_data) {
    if (raw_data === null || raw_data === undefined) {
        throw new Error('Raw data cannot be null or undefined');
    }

    const ingestionId = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Initialize validation metrics
    const validation = {
        dataType: typeof raw_data,
        size: 0,
        encoding: 'unknown',
        structure: 'unknown',
        integrity: false,
        sanitized: false
    };
    
    // Determine data characteristics
    if (typeof raw_data === 'string') {
        validation.size = raw_data.length;
        validation.encoding = 'string';
        validation.structure = 'text';
    } else if (Buffer.isBuffer(raw_data)) {
        validation.size = raw_data.length;
        validation.encoding = 'buffer';
        validation.structure = 'binary';
    } else if (Array.isArray(raw_data)) {
        validation.size = raw_data.length;
        validation.encoding = 'array';
        validation.structure = 'list';
    } else if (typeof raw_data === 'object') {
        validation.size = JSON.stringify(raw_data).length;
        validation.encoding = 'object';
        validation.structure = 'structured';
    } else {
        validation.size = String(raw_data).length;
        validation.encoding = validation.dataType;
        validation.structure = 'primitive';
    }
    
    // Data integrity check
    try {
        const dataHash = crypto.createHash('sha256')
            .update(JSON.stringify(raw_data))
            .digest('hex');
        validation.integrity = true;
        validation.checksum = dataHash;
    } catch (error) {
        validation.integrity = false;
        validation.error = error.message;
    }
    
    // Data sanitization (basic)
    let sanitizedData = raw_data;
    try {
        if (typeof raw_data === 'string') {
            // Remove potentially dangerous characters
            sanitizedData = raw_data.replace(/[<>]/g, '');
            validation.sanitized = true;
        } else if (typeof raw_data === 'object' && raw_data !== null) {
            // Deep clone to prevent reference issues
            sanitizedData = JSON.parse(JSON.stringify(raw_data));
            validation.sanitized = true;
        } else {
            validation.sanitized = true; // Primitive types are safe
        }
    } catch (error) {
        validation.sanitized = false;
        validation.sanitizationError = error.message;
    }
    
    // Throttling check (simulated)
    const throttleScore = Math.min(validation.size / 1000, 10); // Score 0-10 based on size
    const throttleDelay = throttleScore > 5 ? (throttleScore - 5) * 100 : 0;
    
    // Route determination for Beta node
    const routingDecision = {
        priority: validation.size > 10000 ? 'HIGH' : validation.size > 1000 ? 'MEDIUM' : 'LOW',
        processingType: validation.structure === 'structured' ? 'COMPLEX' : 'SIMPLE',
        estimatedProcessingTime: validation.size * 0.1, // milliseconds
        recommendedBetaNode: `beta-${validation.structure}-processor`
    };
    
    return {
        ingestionId,
        timestamp,
        originalData: raw_data,
        sanitizedData,
        validation,
        throttling: {
            score: throttleScore,
            delay: throttleDelay,
            applied: throttleDelay > 0
        },
        routing: routingDecision,
        status: 'VALIDATED',
        nextNode: 'BETA',
        metadata: {
            alphaNodeId: 'alpha-001',
            processingTime: Date.now() - timestamp,
            memoryUsage: process.memoryUsage?.()?.heapUsed || 0
        }
    };
}

/**
 * Beta Node: Core data transformation and business logic application
 * @param {Object} validated_data - Data from Alpha node
 * @param {Object} business_rules - Business rules to apply
 * @returns {Object} Processed data ready for storage
 */
export function beta_node_process(validated_data, business_rules = {}) {
    if (!validated_data || validated_data.status !== 'VALIDATED') {
        throw new Error('Input must be validated data from Alpha node');
    }
    
    const processingId = crypto.randomUUID();
    const startTime = Date.now();
    
    // Default business rules
    const defaultRules = {
        transformations: [],
        filters: [],
        aggregations: [],
        validationRules: [],
        outputFormat: 'structured',
        parallelProcessing: false,
        cacheResults: true,
        errorHandling: 'graceful'
    };
    
    const rules = { ...defaultRules, ...business_rules };
    const data = validated_data.sanitizedData;
    let processedData = data;
    const processedMetadata = {
        transformations: [],
        filters: [],
        aggregations: [],
        errors: [],
        warnings: []
    };
    
    try {
        // Apply transformations
        if (Array.isArray(rules.transformations)) {
            for (const transformation of rules.transformations) {
                try {
                    processedData = applyTransformation(processedData, transformation);
                    processedMetadata.transformations.push({
                        type: transformation.type,
                        applied: true,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    processedMetadata.errors.push({
                        stage: 'transformation',
                        transformation: transformation.type,
                        error: error.message
                    });
                    if (rules.errorHandling === 'strict') {
                        throw error;
                    }
                }
            }
        }
        
        // Apply filters
        if (Array.isArray(rules.filters)) {
            for (const filter of rules.filters) {
                try {
                    processedData = applyFilter(processedData, filter);
                    processedMetadata.filters.push({
                        type: filter.type,
                        applied: true,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    processedMetadata.errors.push({
                        stage: 'filtering',
                        filter: filter.type,
                        error: error.message
                    });
                    if (rules.errorHandling === 'strict') {
                        throw error;
                    }
                }
            }
        }
        
        // Apply aggregations
        if (Array.isArray(rules.aggregations)) {
            for (const aggregation of rules.aggregations) {
                try {
                    processedData = applyAggregation(processedData, aggregation);
                    processedMetadata.aggregations.push({
                        type: aggregation.type,
                        applied: true,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    processedMetadata.errors.push({
                        stage: 'aggregation',
                        aggregation: aggregation.type,
                        error: error.message
                    });
                    if (rules.errorHandling === 'strict') {
                        throw error;
                    }
                }
            }
        }
        
        // Validate processed data against validation rules
        if (Array.isArray(rules.validationRules)) {
            for (const validationRule of rules.validationRules) {
                try {
                    const isValid = validateProcessedData(processedData, validationRule);
                    if (!isValid) {
                        processedMetadata.warnings.push({
                            stage: 'validation',
                            rule: validationRule.type,
                            message: 'Validation failed but processing continued'
                        });
                    }
                } catch (error) {
                    processedMetadata.errors.push({
                        stage: 'validation',
                        rule: validationRule.type,
                        error: error.message
                    });
                }
            }
        }
        
    } catch (error) {
        return {
            processingId,
            originalData: validated_data,
            processedData: null,
            status: 'FAILED',
            error: error.message,
            metadata: processedMetadata,
            processingTime: Date.now() - startTime
        };
    }
    
    return {
        processingId,
        originalData: validated_data,
        processedData,
        status: 'PROCESSED',
        appliedRules: rules,
        metadata: processedMetadata,
        processingTime: Date.now() - startTime,
        nextNode: 'GAMMA',
        storage: {
            priority: validated_data.routing.priority,
            format: rules.outputFormat,
            cacheEnabled: rules.cacheResults
        }
    };
}

/**
 * Gamma Node: Secure data storage and retrieval management
 * @param {Object} processed_data - Data from Beta node
 * @param {Object} storage_config - Storage configuration
 * @returns {Object} Storage result with metadata
 */
export function gamma_node_store(processed_data, storage_config = {}) {
    if (!processed_data || processed_data.status !== 'PROCESSED') {
        throw new Error('Input must be processed data from Beta node');
    }
    
    const storageId = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Default storage configuration
    const defaultConfig = {
        storageType: 'memory', // memory, file, database
        encryption: true,
        compression: true,
        backup: true,
        retention: 86400000, // 24 hours in milliseconds
        indexing: true,
        replication: false
    };
    
    const config = { ...defaultConfig, ...storage_config };
    
    // Generate storage key
    const storageKey = crypto.createHash('sha256')
        .update(processed_data.processingId + timestamp)
        .digest('hex').slice(0, 16);
    
    let storedData = processed_data.processedData;
    const storageMetadata = {
        operations: [],
        size: 0,
        checksums: {},
        indexes: []
    };
    
    try {
        // Apply compression if enabled
        if (config.compression) {
            const originalSize = JSON.stringify(storedData).length;
            // Simulate compression (in real implementation, use actual compression library)
            const compressedData = {
                compressed: true,
                data: storedData,
                originalSize,
                compressionRatio: 0.7 // Simulated 30% reduction
            };
            storedData = compressedData;
            storageMetadata.operations.push({
                operation: 'compression',
                originalSize,
                compressedSize: Math.round(originalSize * 0.7),
                ratio: 0.7
            });
        }
        
        // Apply encryption if enabled
        if (config.encryption) {
            const cipher = crypto.createCipher('aes256', storageKey);
            const dataString = JSON.stringify(storedData);
            let encrypted = cipher.update(dataString, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            storedData = {
                encrypted: true,
                data: encrypted,
                algorithm: 'aes256'
            };
            
            storageMetadata.operations.push({
                operation: 'encryption',
                algorithm: 'aes256',
                keyHash: crypto.createHash('sha256').update(storageKey).digest('hex').slice(0, 16)
            });
        }
        
        // Calculate final size and checksums
        const finalDataString = JSON.stringify(storedData);
        storageMetadata.size = finalDataString.length;
        storageMetadata.checksums.sha256 = crypto.createHash('sha256').update(finalDataString).digest('hex');
        storageMetadata.checksums.md5 = crypto.createHash('md5').update(finalDataString).digest('hex');
        
        // Create indexes if enabled
        if (config.indexing) {
            const indexes = createDataIndexes(processed_data.originalData, processed_data.processedData);
            storageMetadata.indexes = indexes;
        }
        
        // Simulate storage operation
        const storageLocation = `${config.storageType}://${storageKey}`;
        
        // Create backup if enabled
        let backupLocation = null;
        if (config.backup) {
            const backupKey = storageKey + '_backup';
            backupLocation = `backup://${backupKey}`;
            storageMetadata.operations.push({
                operation: 'backup',
                location: backupLocation
            });
        }
        
        return {
            storageId,
            storageKey,
            location: storageLocation,
            backupLocation,
            storedData: config.storageType === 'memory' ? storedData : null, // Only include data for memory storage
            metadata: storageMetadata,
            config,
            status: 'STORED',
            timestamp,
            expiration: timestamp + config.retention,
            nextNode: 'DELTA',
            retrieval: {
                key: storageKey,
                encrypted: config.encryption,
                compressed: config.compression
            }
        };
        
    } catch (error) {
        return {
            storageId,
            storageKey,
            status: 'FAILED',
            error: error.message,
            timestamp,
            metadata: storageMetadata
        };
    }
}

/**
 * Delta Node: System coordination, monitoring, and adaptive management
 * @param {Array} system_components - Array of system component states
 * @param {Object} health_metrics - Current system health metrics
 * @returns {Object} Orchestration decisions and actions
 */
export function delta_node_orchestrate(system_components, health_metrics) {
    if (!Array.isArray(system_components)) {
        throw new Error('System components must be provided as an array');
    }
    
    if (!health_metrics || typeof health_metrics !== 'object') {
        throw new Error('Health metrics must be provided as an object');
    }
    
    const orchestrationId = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Analyze system components
    const componentAnalysis = {
        total: system_components.length,
        healthy: 0,
        degraded: 0,
        failed: 0,
        components: {}
    };
    
    for (const component of system_components) {
        const status = component.status || 'unknown';
        componentAnalysis.components[component.id || 'unknown'] = {
            status,
            lastSeen: component.lastSeen || timestamp,
            metrics: component.metrics || {}
        };
        
        switch (status.toLowerCase()) {
            case 'healthy':
            case 'active':
            case 'running':
                componentAnalysis.healthy++;
                break;
            case 'degraded':
            case 'warning':
            case 'slow':
                componentAnalysis.degraded++;
                break;
            case 'failed':
            case 'error':
            case 'down':
                componentAnalysis.failed++;
                break;
        }
    }
    
    // Calculate system health score
    const healthScore = componentAnalysis.total > 0 
        ? Math.round(((componentAnalysis.healthy * 100) + (componentAnalysis.degraded * 50)) / componentAnalysis.total)
        : 0;
    
    // Load balancing decisions
    const loadBalancing = {
        enabled: healthScore > 30,
        strategy: 'round-robin',
        weights: {},
        recommendations: []
    };
    
    // Calculate load distribution weights
    for (const [componentId, component] of Object.entries(componentAnalysis.components)) {
        if (component.status === 'healthy') {
            loadBalancing.weights[componentId] = 1.0;
        } else if (component.status === 'degraded') {
            loadBalancing.weights[componentId] = 0.5;
        } else {
            loadBalancing.weights[componentId] = 0.0;
            loadBalancing.recommendations.push(`Remove ${componentId} from load balancer`);
        }
    }
    
    // Error handling decisions
    const errorHandling = {
        criticalErrors: [],
        recoveryActions: [],
        escalations: []
    };
    
    // Check for critical conditions
    if (componentAnalysis.failed > componentAnalysis.healthy) {
        errorHandling.criticalErrors.push('More components failed than healthy');
        errorHandling.recoveryActions.push('Initiate emergency protocols');
        errorHandling.escalations.push('CRITICAL_SYSTEM_FAILURE');
    }
    
    if (healthScore < 20) {
        errorHandling.criticalErrors.push('System health critically low');
        errorHandling.recoveryActions.push('Scale up healthy components');
        errorHandling.escalations.push('LOW_SYSTEM_HEALTH');
    }
    
    // Security enforcement decisions
    const securityEnforcement = {
        threatLevel: 'LOW',
        activeThreats: 0,
        mitigations: [],
        accessControls: []
    };
    
    // Analyze health metrics for security indicators
    if (health_metrics.unauthorizedAccess > 0) {
        securityEnforcement.threatLevel = 'HIGH';
        securityEnforcement.activeThreats++;
        securityEnforcement.mitigations.push('Enable additional authentication');
    }
    
    if (health_metrics.dataIntegrityFailures > 0) {
        securityEnforcement.threatLevel = 'MEDIUM';
        securityEnforcement.activeThreats++;
        securityEnforcement.mitigations.push('Verify data checksums');
    }
    
    // Adaptive management decisions
    const adaptiveManagement = {
        scalingDecisions: [],
        configurationChanges: [],
        optimizations: []
    };
    
    // Auto-scaling logic
    if (health_metrics.cpu > 80 || health_metrics.memory > 85) {
        adaptiveManagement.scalingDecisions.push({
            action: 'SCALE_UP',
            reason: 'High resource utilization',
            priority: 'HIGH'
        });
    } else if (health_metrics.cpu < 20 && health_metrics.memory < 30 && componentAnalysis.healthy > 3) {
        adaptiveManagement.scalingDecisions.push({
            action: 'SCALE_DOWN',
            reason: 'Low resource utilization',
            priority: 'LOW'
        });
    }
    
    // Configuration optimizations
    if (health_metrics.responseTime > 1000) {
        adaptiveManagement.configurationChanges.push({
            parameter: 'timeout',
            currentValue: health_metrics.responseTime,
            recommendedValue: Math.min(health_metrics.responseTime * 1.5, 3000),
            reason: 'Increase timeout due to slow response'
        });
    }
    
    return {
        orchestrationId,
        timestamp,
        systemHealth: {
            score: healthScore,
            status: healthScore > 80 ? 'EXCELLENT' : healthScore > 60 ? 'GOOD' : healthScore > 40 ? 'FAIR' : 'POOR',
            components: componentAnalysis
        },
        decisions: {
            loadBalancing,
            errorHandling,
            securityEnforcement,
            adaptiveManagement
        },
        actions: [
            ...errorHandling.recoveryActions,
            ...securityEnforcement.mitigations,
            ...adaptiveManagement.scalingDecisions.map(d => d.action)
        ],
        recommendations: [
            ...loadBalancing.recommendations,
            ...adaptiveManagement.optimizations
        ],
        nextReview: timestamp + 300000, // 5 minutes
        metadata: {
            deltaNodeId: 'delta-001',
            processingTime: Date.now() - timestamp
        }
    };
}

// Helper functions

function applyTransformation(data, transformation) {
    switch (transformation.type) {
        case 'uppercase':
            return typeof data === 'string' ? data.toUpperCase() : data;
        case 'lowercase':
            return typeof data === 'string' ? data.toLowerCase() : data;
        case 'trim':
            return typeof data === 'string' ? data.trim() : data;
        case 'normalize':
            if (Array.isArray(data) && data.every(n => typeof n === 'number')) {
                const max = Math.max(...data);
                return max > 0 ? data.map(n => n / max) : data;
            }
            return data;
        default:
            return data;
    }
}

function applyFilter(data, filter) {
    switch (filter.type) {
        case 'remove_nulls':
            return Array.isArray(data) ? data.filter(item => item !== null && item !== undefined) : data;
        case 'remove_empty':
            return Array.isArray(data) ? data.filter(item => item !== '' && item !== null && item !== undefined) : data;
        case 'numeric_only':
            return Array.isArray(data) ? data.filter(item => typeof item === 'number') : data;
        case 'unique':
            return Array.isArray(data) ? [...new Set(data)] : data;
        default:
            return data;
    }
}

function applyAggregation(data, aggregation) {
    if (!Array.isArray(data)) return data;
    
    switch (aggregation.type) {
        case 'sum':
            return data.filter(n => typeof n === 'number').reduce((sum, n) => sum + n, 0);
        case 'average':
            const numbers = data.filter(n => typeof n === 'number');
            return numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
        case 'count':
            return data.length;
        case 'group':
            const grouped = {};
            data.forEach(item => {
                const key = typeof item === 'object' ? JSON.stringify(item) : String(item);
                grouped[key] = (grouped[key] || 0) + 1;
            });
            return grouped;
        default:
            return data;
    }
}

function validateProcessedData(data, validationRule) {
    switch (validationRule.type) {
        case 'not_empty':
            return data !== null && data !== undefined && data !== '';
        case 'is_array':
            return Array.isArray(data);
        case 'is_object':
            return typeof data === 'object' && data !== null;
        case 'is_number':
            return typeof data === 'number' && !isNaN(data);
        case 'min_length':
            return (typeof data === 'string' || Array.isArray(data)) && data.length >= validationRule.value;
        case 'max_length':
            return (typeof data === 'string' || Array.isArray(data)) && data.length <= validationRule.value;
        default:
            return true;
    }
}

function createDataIndexes(originalData, processedData) {
    const indexes = [];
    
    // Create type index
    indexes.push({
        type: 'data_type',
        value: typeof processedData
    });
    
    // Create size index
    if (Array.isArray(processedData)) {
        indexes.push({
            type: 'array_length',
            value: processedData.length
        });
    } else if (typeof processedData === 'string') {
        indexes.push({
            type: 'string_length',
            value: processedData.length
        });
    }
    
    // Create content hash index
    indexes.push({
        type: 'content_hash',
        value: crypto.createHash('md5').update(JSON.stringify(processedData)).digest('hex')
    });
    
    return indexes;
}