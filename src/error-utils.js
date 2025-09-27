/**
 * Error Handling Utilities
 * Provides secure error logging that conditionally exposes stack traces
 * 
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 */

/**
 * Securely log error with conditional stack trace exposure
 * Only shows stack traces when NODE_ENV is 'development'
 * 
 * @param {Error} error - The error to log
 * @param {string} message - Optional custom message
 */
export function logError(error, message = 'Error occurred') {
    console.error(message, error.message);
    
    // Only expose stack traces in development environment
    if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
    }
}

/**
 * Securely log fatal error and exit process
 * Only shows stack traces when NODE_ENV is 'development'
 * 
 * @param {Error} error - The error to log
 * @param {string} message - Optional custom message
 * @param {number} exitCode - Exit code (default: 1)
 */
export function logFatalError(error, message = 'Fatal error', exitCode = 1) {
    logError(error, message);
    process.exit(exitCode);
}

export default { logError, logFatalError };