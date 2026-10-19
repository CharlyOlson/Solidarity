/**
 * System Configuration for Frontend-Ready Deployment
 * Environment-specific configurations with security and efficiency
 */

const path = require('path');
const fs = require('fs');
const { resolveSampleRateHz } = require('../sampleRate');

class SystemConfig {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.loadEnvironmentConfig();
    this.validateRequiredConfig();
  }

  loadEnvironmentConfig() {
    // Load environment-specific configuration
    const envFile = path.join(__dirname, '../../..', `.env.${this.env}`);
    const defaultEnvFile = path.join(__dirname, '../../..', '.env');
    
    if (fs.existsSync(envFile)) {
      require('dotenv').config({ path: envFile });
    } else if (fs.existsSync(defaultEnvFile)) {
      require('dotenv').config({ path: defaultEnvFile });
    }
  }

  validateRequiredConfig() {
    const required = [
      'JWT_SECRET',
      'DATABASE_URL',
      'AUDIO_SAMPLE_RATE'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Server Configuration
  get server() {
    return {
      port: parseInt(process.env.PORT) || 3000,
      host: process.env.HOST || 'localhost',
      cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
        credentials: true
      },
      bodyLimit: process.env.BODY_LIMIT || '10mb',
      timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
      compression: process.env.COMPRESSION !== 'false'
    };
  }

  // Database Configuration
  get database() {
    return {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/solidarity',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000
      },
      ssl: process.env.NODE_ENV === 'production',
      logging: process.env.NODE_ENV === 'development'
    };
  }

  // Redis Configuration
  get redis() {
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'solidarity:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    };
  }

  // Audio Processing Configuration
  get audio() {
    const sampleRateHz = resolveSampleRateHz();
    return {
      sample_rate_hz: sampleRateHz,
      sampleRate: sampleRateHz,
      bufferSize: parseInt(process.env.AUDIO_BUFFER_SIZE) || 1024,
      maxDuration: parseInt(process.env.AUDIO_MAX_DURATION) || 300, // 5 minutes
      compressionLevel: parseInt(process.env.AUDIO_COMPRESSION_LEVEL) || 6,
      spatialAudio: process.env.SPATIAL_AUDIO !== 'false',
      pythonPath: process.env.PYTHON_PATH || 'python3',
      processingTimeout: parseInt(process.env.AUDIO_PROCESSING_TIMEOUT) || 30000
    };
  }

  // Security Configuration
  get security() {
    return {
      jwtSecret: process.env.JWT_SECRET || 'solidarity-default-secret',
      jwtExpiration: process.env.JWT_EXPIRATION || '24h',
      refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
      encryptionKey: process.env.ENCRYPTION_KEY || 'solidarity-encryption-key',
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      sessionSecret: process.env.SESSION_SECRET || 'solidarity-session-secret',
      httpsOnly: process.env.NODE_ENV === 'production',
      csrf: process.env.CSRF_ENABLED !== 'false'
    };
  }

  // Financial Configuration
  get financial() {
    return {
      enabled: process.env.FINANCIAL_ENABLED !== 'false',
      blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || 'ethereum',
      contractAddress: process.env.CONTRACT_ADDRESS,
      privateKey: process.env.PRIVATE_KEY,
      gasLimit: parseInt(process.env.GAS_LIMIT) || 21000,
      gasPrice: process.env.GAS_PRICE || 'auto',
      confirmations: parseInt(process.env.CONFIRMATIONS) || 3,
      providerUrl: process.env.PROVIDER_URL || 'https://mainnet.infura.io/v3/your-key',
      testMode: process.env.FINANCIAL_TEST_MODE === 'true'
    };
  }

  // Logging Configuration
  get logging() {
    return {
      level: process.env.LOG_LEVEL || (this.env === 'production' ? 'info' : 'debug'),
      format: process.env.LOG_FORMAT || 'combined',
      file: process.env.LOG_FILE || null,
      maxSize: process.env.LOG_MAX_SIZE || '10MB',
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      compress: process.env.LOG_COMPRESS !== 'false'
    };
  }

  // Performance Configuration
  get performance() {
    return {
      clustering: process.env.CLUSTERING === 'true',
      workers: parseInt(process.env.WORKERS) || require('os').cpus().length,
      cacheEnabled: process.env.CACHE_ENABLED !== 'false',
      cacheTTL: parseInt(process.env.CACHE_TTL) || 5 * 60 * 1000, // 5 minutes
      compressionThreshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024,
      memoryLimit: process.env.MEMORY_LIMIT || '512MB',
      metrics: process.env.METRICS_ENABLED !== 'false'
    };
  }

  // Frontend Configuration
  get frontend() {
    return {
      enabled: process.env.FRONTEND_ENABLED !== 'false',
      buildPath: process.env.FRONTEND_BUILD_PATH || path.join(__dirname, '../../frontend/build'),
      apiUrl: process.env.API_URL || `http://localhost:${this.server.port}/api`,
      socketUrl: process.env.SOCKET_URL || `http://localhost:${this.server.port}`,
      assetsPath: process.env.ASSETS_PATH || '/static',
      indexFile: process.env.INDEX_FILE || 'index.html'
    };
  }

  // Development Configuration
  get development() {
    return {
      hotReload: process.env.HOT_RELOAD !== 'false',
      mockData: process.env.MOCK_DATA === 'true',
      debugMode: process.env.DEBUG_MODE === 'true',
      apiDocs: process.env.API_DOCS !== 'false',
      devMiddleware: process.env.DEV_MIDDLEWARE !== 'false',
      sourceMap: process.env.SOURCE_MAP !== 'false'
    };
  }

  // Monitoring Configuration
  get monitoring() {
    return {
      enabled: process.env.MONITORING_ENABLED !== 'false',
      healthCheck: process.env.HEALTH_CHECK !== 'false',
      prometheus: process.env.PROMETHEUS_ENABLED === 'true',
      grafana: process.env.GRAFANA_ENABLED === 'true',
      alerts: process.env.ALERTS_ENABLED !== 'false',
      errorReporting: process.env.ERROR_REPORTING !== 'false'
    };
  }

  // Get configuration for specific environment
  getConfig(section) {
    if (this[section]) {
      return this[section];
    }
    throw new Error(`Configuration section '${section}' not found`);
  }

  // Get all configuration
  getAllConfig() {
    return {
      env: this.env,
      server: this.server,
      database: this.database,
      redis: this.redis,
      audio: this.audio,
      security: this.security,
      financial: this.financial,
      logging: this.logging,
      performance: this.performance,
      frontend: this.frontend,
      development: this.development,
      monitoring: this.monitoring
    };
  }

  // Validate configuration
  validate() {
    const errors = [];

    // Validate server configuration
    if (!this.server.port || this.server.port < 1 || this.server.port > 65535) {
      errors.push('Invalid server port');
    }

    // Validate audio configuration
    if (!this.audio.sampleRate || this.audio.sampleRate < 8000 || this.audio.sampleRate > 192000) {
      errors.push('Invalid audio sample rate');
    }

    // Validate security configuration
    if (!this.security.jwtSecret || this.security.jwtSecret.length < 32) {
      errors.push('JWT secret must be at least 32 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const config = new SystemConfig();

// Export configuration
module.exports = config;