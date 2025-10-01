/**
 * Solidarity Platform - Data Optimization Middleware
 * 
 * Efficiently adapts audio and financial data for frontends operating under varying bandwidth conditions.
 * Implements caching, compression, and mode-based data reduction.
 * 
 * Features:
 * - Low-Data vs. High-Data Modes
 * - Audio Optimization
 * - Financial Optimization
 * - Compression Utility
 * - In-Memory Caching
 */

const zlib = require('zlib');
const crypto = require('crypto');

// Configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_MAX_SIZE = 1000;     // Maximum number of cached entries
const COMPRESSION_THRESHOLD = 1024; // Minimum size in bytes for compression

/**
 * In-memory cache storage
 */
class CacheStore {
  constructor() {
    this.cache = new Map();
    this.keys = []; // Track key insertion order
  }
  
  /**
   * Generate MD5 hash cache key from request
   * @param {Object} req - Express request object
   * @returns {String} - Cache key
   */
  generateKey(req) {
    const { method, path } = req;
    const query = JSON.stringify(req.query || {});
    const dataMode = req.dataMode || 'high';
    
    const hash = crypto
      .createHash('md5')
      .update(`${method}:${path}:${query}:${dataMode}`)
      .digest('hex');
    
    return hash;
  }
  
  /**
   * Set cache entry with TTL
   * @param {String} key - Cache key
   * @param {*} data - Data to cache
   */
  set(key, data) {
    // Check if key already exists to update instead of adding
    const exists = this.cache.has(key);
    
    // Add or update the cache entry
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // If this is a new key, manage the keys array
    if (!exists) {
      // Add to keys array
      this.keys.push(key);
      
      // Evict oldest entry if cache is full
      if (this.keys.length > CACHE_MAX_SIZE) {
        const oldestKey = this.keys.shift(); // Remove and return the first element
        this.cache.delete(oldestKey);
      }
    }
  }
  
  /**
   * Get cache entry if not expired
   * @param {String} key - Cache key
   * @returns {*|null} - Cached data or null if expired/not found
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      
      // Also remove from keys array
      const index = this.keys.indexOf(key);
      if (index !== -1) {
        this.keys.splice(index, 1);
      }
      
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.keys = [];
  }
}

// Create cache store instance
const cacheStore = new CacheStore();

/**
 * Determines current data mode from request
 * @param {Object} req - Express request object
 * @returns {String} - 'low' or 'high' data mode
 */
function getDataMode(req) {
  // Check header first
  if (req.headers['x-data-mode'] === 'low') {
    return 'low';
  }
  
  // Check query parameter
  if (req.query.dataMode === 'low') {
    return 'low';
  }
  
  // Check user agent for mobile devices
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  
  // Check for slow connection hints
  const saveData = req.headers['save-data'] === 'on';
  const networkInfo = req.headers['network-information'];
  const isSlowConnection = networkInfo && /2g|slow-2g/.test(networkInfo);
  
  // Default to low-data mode for mobile or slow connections
  if (isMobile || saveData || isSlowConnection) {
    return 'low';
  }
  
  // Default to high-data mode
  return 'high';
}

/**
 * Optimize audio data based on data mode
 * @param {Object} data - Audio data to optimize
 * @param {String} mode - 'low' or 'high' data mode
 * @returns {Object} - Optimized audio data
 */
async function optimizeAudioData(data, mode) {
  if (mode === 'low') {
    // For low-data mode: downsample to mono 22.05 kHz, 16-bit
    const { audioData, sampleRate, channels, bitDepth } = data;
    
    // Only optimize if we have high-quality audio
    if (sampleRate > 22050 || channels > 1 || bitDepth > 16) {
      // In a real implementation, this would perform actual downsampling
      // Here we simulate the process
      const downsampledData = simulateDownsampling(audioData, sampleRate, channels, bitDepth);
      
      // Compress the downsampled data
      const compressedData = await compressData(downsampledData);
      
      return {
        audioData: compressedData,
        sampleRate: 22050,
        channels: 1,
        bitDepth: 16,
        compressed: true
      };
    }
  }
  
  // For high-data mode or if data is already low quality, return original
  return data;
}

/**
 * Simulate audio downsampling (placeholder for actual implementation)
 * @param {Array|Buffer} audioData - Original audio data
 * @param {Number} originalSampleRate - Original sample rate
 * @param {Number} originalChannels - Original number of channels
 * @param {Number} originalBitDepth - Original bit depth
 * @returns {Array|Buffer} - Downsampled audio data
 */
function simulateDownsampling(audioData, originalSampleRate, originalChannels, originalBitDepth) {
  // In a real implementation, this would perform actual downsampling
  // Here we just return a smaller array to simulate the reduced data size
  
  if (Array.isArray(audioData)) {
    // Simulate downsampling by taking every nth sample
    const downsampleRatio = Math.floor(originalSampleRate / 22050);
    const channelRatio = originalChannels;
    
    return audioData.filter((_, index) => index % (downsampleRatio * channelRatio) === 0);
  } else if (Buffer.isBuffer(audioData)) {
    // For Buffer data, create a smaller buffer
    const downsampleRatio = Math.floor(originalSampleRate / 22050);
    const bitDepthRatio = originalBitDepth / 16;
    const channelRatio = originalChannels;
    const totalRatio = downsampleRatio * bitDepthRatio * channelRatio;
    
    const newSize = Math.floor(audioData.length / totalRatio);
    const result = Buffer.alloc(newSize);
    
    for (let i = 0; i < newSize; i++) {
      result[i] = audioData[i * totalRatio];
    }
    
    return result;
  }
  
  // If unsupported format, return as is
  return audioData;
}

/**
 * Optimize financial data based on data mode
 * @param {Object} data - Financial data to optimize
 * @param {String} mode - 'low' or 'high' data mode
 * @returns {Object} - Optimized financial data
 */
function optimizeFinancialData(data, mode) {
  if (mode === 'low') {
    // Clone data to avoid modifying the original
    const optimized = JSON.parse(JSON.stringify(data));
    
    // Round monetary amounts to 2 decimal places
    if (optimized.balance !== undefined) {
      optimized.balance = Number(optimized.balance.toFixed(2));
    }
    
    if (optimized.availableBalance !== undefined) {
      optimized.availableBalance = Number(optimized.availableBalance.toFixed(2));
    }
    
    // Truncate transaction history and add summary counts
    if (Array.isArray(optimized.transactions)) {
      const totalCount = optimized.transactions.length;
      
      // Keep only the 10 most recent transactions
      if (totalCount > 10) {
        optimized.transactions = optimized.transactions.slice(0, 10);
        optimized.transactionSummary = {
          totalCount,
          displayedCount: 10,
          omittedCount: totalCount - 10
        };
      }
      
      // Round transaction amounts
      optimized.transactions.forEach(tx => {
        if (tx.amount !== undefined) {
          tx.amount = Number(tx.amount.toFixed(2));
        }
      });
    }
    
    return optimized;
  }
  
  // For high-data mode, return original
  return data;
}

/**
 * Compress data using gzip
 * @param {Object|Buffer|Array} data - Data to compress
 * @returns {Promise<Buffer>} - Compressed data as Buffer
 */
function compressData(data) {
  return new Promise((resolve, reject) => {
    // Convert data to JSON string if it's not already a Buffer
    const input = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
    
    // Only compress if data is large enough
    if (input.length < COMPRESSION_THRESHOLD) {
      return resolve(input);
    }
    
    zlib.gzip(input, { level: 6 }, (err, compressed) => {
      if (err) {
        return reject(err);
      }
      resolve(compressed);
    });
  });
}

/**
 * Express middleware for data optimization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function dataOptimizationMiddleware(req, res, next) {
  // Determine data mode
  req.dataMode = getDataMode(req);
  
  // Add data mode header to response
  res.setHeader('X-Data-Mode', req.dataMode);
  res.setHeader('X-Compression-Available', 'gzip');
  
  // Attach optimization utilities to request object
  req.optimize = {
    audio: (data) => optimizeAudioData(data, req.dataMode),
    financial: (data) => optimizeFinancialData(data, req.dataMode),
    compress: compressData
  };
  
  // For GET requests, intercept res.json to implement caching
  if (req.method === 'GET') {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Skip caching for errors or empty responses
      if (!data || (data.error !== undefined && data.error !== null)) {
        return originalJson.call(this, data);
      }
      
      // Generate cache key
      const cacheKey = cacheStore.generateKey(req);
      
      // Store in cache
      cacheStore.set(cacheKey, data);
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    // Check cache before proceeding
    const cacheKey = cacheStore.generateKey(req);
    const cachedData = cacheStore.get(cacheKey);
    
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }
    
    res.setHeader('X-Cache', 'MISS');
  }
  
  next();
}

module.exports = dataOptimizationMiddleware;