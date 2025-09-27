/**
 * Error Handler Utility
 * Provides environment-aware error handling and logging
 * 
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 */

export class ErrorHandler {
    constructor(config = {}) {
        this.config = {
            environment: config.environment ?? this.detectEnvironment(),
            enableStackTraces: config.enableStackTraces ?? null, // null = auto-detect based on env
            logLevel: config.logLevel ?? 'info',
            ...config
        };
        
        // Auto-detect stack trace setting based on environment
        if (this.config.enableStackTraces === null) {
            this.config.enableStackTraces = this.isDevelopment();
        }
    }
    
    /**
     * Detect current environment
     */
    detectEnvironment() {
        // Check NODE_ENV first
        if (process.env.NODE_ENV) {
            return process.env.NODE_ENV.toLowerCase();
        }
        
        // Check for development indicators
        if (process.env.DEBUG || 
            process.env.DEVELOPMENT || 
            process.argv.includes('--dev') ||
            process.argv.includes('--development')) {
            return 'development';
        }
        
        // Check for production indicators
        if (process.env.PRODUCTION ||
            process.argv.includes('--prod') ||
            process.argv.includes('--production')) {
            return 'production';
        }
        
        // Default to production for security
        return 'production';
    }
    
    /**
     * Check if running in development environment
     */
    isDevelopment() {
        return this.config.environment === 'development' || 
               this.config.environment === 'dev' ||
               this.config.environment === 'test';
    }
    
    /**
     * Check if running in production environment
     */
    isProduction() {
        return this.config.environment === 'production' || 
               this.config.environment === 'prod';
    }
    
    /**
     * Create standardized error response
     */
    createErrorResponse(error, context = {}) {
        const baseResponse = {
            success: false,
            error: error.message || 'An error occurred',
            timestamp: new Date().toISOString(),
            ...context
        };
        
        // Only include stack trace in development
        if (this.config.enableStackTraces && error.stack) {
            baseResponse.stack = error.stack;
        }
        
        // Add debug information in development
        if (this.isDevelopment()) {
            baseResponse.debug = {
                errorType: error.constructor.name,
                environment: this.config.environment
            };
        }
        
        return baseResponse;
    }
    
    /**
     * Log error with appropriate level based on environment
     */
    logError(error, context = '') {
        if (this.isDevelopment()) {
            console.error(`❌ Error${context ? ` (${context})` : ''}:`, error.message);
            if (this.config.enableStackTraces && error.stack) {
                console.error(error.stack);
            }
        } else {
            // Production: log minimal information
            console.error(`Error${context ? ` in ${context}` : ''}:`, error.message);
        }
    }
    
    /**
     * Handle fatal errors with appropriate exit strategy
     */
    handleFatalError(error, context = '') {
        this.logError(error, context);
        
        if (this.isDevelopment()) {
            console.error('\n🛑 Fatal error encountered - exiting...');
        } else {
            console.error('Fatal error - application stopping');
        }
        
        process.exit(1);
    }
    
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}

export default ErrorHandler;