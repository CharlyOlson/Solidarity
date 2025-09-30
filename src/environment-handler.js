/**
 * Environment Handler
 * Manages environment configuration with configurable allowed environments
 * 
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 */

export class EnvironmentHandler {
    constructor(config = {}) {
        this.config = {
            allowedEnvironments: config.allowedEnvironments ?? ['production', 'staging', 'development', 'testing'],
            ...config
        };
        
        this.allowedEnvironments = this.config.allowedEnvironments;
    }

    /**
     * Check if an environment is allowed
     * @param {string} environment - The environment to check
     * @returns {boolean} - True if the environment is allowed
     */
    isAllowed(environment) {
        return this.allowedEnvironments.includes(environment);
    }

    /**
     * Get the list of allowed environments
     * @returns {Array<string>} - Array of allowed environment names
     */
    getAllowedEnvironments() {
        return [...this.allowedEnvironments];
    }

    /**
     * Validate an environment and throw if not allowed
     * @param {string} environment - The environment to validate
     * @throws {Error} - If the environment is not allowed
     */
    validateEnvironment(environment) {
        if (!this.isAllowed(environment)) {
            throw new Error(`Environment '${environment}' is not allowed. Allowed environments: ${this.allowedEnvironments.join(', ')}`);
        }
        return true;
    }
}

export default EnvironmentHandler;
