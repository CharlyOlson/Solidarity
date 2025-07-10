/**
 * Data Optimization Middleware
 * Handles low-data and high-data modes for efficient frontend integration
 */

const crypto = require('crypto');
const zlib = require('zlib');

class DataOptimizer {
  constructor() {
    this.cache = new Map();
    this.cacheMaxSize = 1000;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Determine data mode from request
  getDataMode(req) {
    const mode = req.headers['x-data-mode'] || req.query.dataMode || 'auto';
    const bandwidth = req.headers['x-bandwidth'] || 'unknown';
    
    if (mode === 'low' || bandwidth === 'low') {
      return 'low';
    } else if (mode === 'high' || bandwidth === 'high') {
      return 'high';
    }
    
    // Auto-detect based on user agent and connection
    const userAgent = req.headers['user-agent'] || '';
    const connection = req.headers.connection || '';
    
    if (userAgent.includes('Mobile') || connection.includes('slow')) {
      return 'low';
    }
    
    return 'high';
  }

  // Optimize audio data based on mode
  optimizeAudioData(data, mode) {
    if (mode === 'low') {
      return {
        audioData: this.compressAudioData(data.audioData),
        sampleRate: 22050, // Reduced sample rate
        channels: 1, // Mono
        bitDepth: 16, // Reduced bit depth
        compressed: true
      };
    }
    
    return {
      audioData: data.audioData,
      sampleRate: 44100, // Full quality
      channels: 2, // Stereo
      bitDepth: 24, // High quality
      compressed: false
    };
  }

  // Optimize financial data
  optimizeFinancialData(data, mode) {
    if (mode === 'low') {
      return {
        balance: Math.round(data.balance * 100) / 100, // 2 decimal places
        transactions: data.transactions.slice(0, 10), // Limit to 10 recent
        summary: {
          totalIn: Math.round(data.totalIn * 100) / 100,
          totalOut: Math.round(data.totalOut * 100) / 100,
          count: data.transactions.length
        }
      };
    }
    
    return data; // Full data in high mode
  }

  // Compress data using gzip
  compressData(data) {
    return new Promise((resolve, reject) => {
      const jsonString = JSON.stringify(data);
      zlib.gzip(jsonString, (err, compressed) => {
        if (err) reject(err);
        else resolve(compressed);
      });
    });
  }

  // Generate cache key
  generateCacheKey(req) {
    const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}:${req.headers['x-data-mode'] || 'auto'}`;
    return crypto.createHash('md5').update(key).digest('hex');
  }

  // Cache management
  setCache(key, data) {
    if (this.cache.size >= this.cacheMaxSize) {
      // Remove oldest entries
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check TTL
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Audio data compression
  compressAudioData(audioData) {
    if (!audioData || !Array.isArray(audioData)) return audioData;
    
    // Simple downsampling for low-data mode
    const compressed = [];
    for (let i = 0; i < audioData.length; i += 2) {
      compressed.push(audioData[i]);
    }
    
    return compressed;
  }
}

const optimizer = new DataOptimizer();

// Middleware function
const dataOptimization = (req, res, next) => {
  const dataMode = optimizer.getDataMode(req);
  req.dataMode = dataMode;
  
  // Add optimization utilities to request
  req.optimize = {
    audio: (data) => optimizer.optimizeAudioData(data, dataMode),
    financial: (data) => optimizer.optimizeFinancialData(data, dataMode),
    compress: (data) => optimizer.compressData(data)
  };
  
  // Cache handling for GET requests
  if (req.method === 'GET') {
    const cacheKey = optimizer.generateCacheKey(req);
    const cached = optimizer.getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Store original res.json to intercept response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      optimizer.setCache(cacheKey, data);
      return originalJson.call(this, data);
    };
  }
  
  // Add response headers for data mode
  res.setHeader('X-Data-Mode', dataMode);
  res.setHeader('X-Compression-Available', 'gzip');
  
  next();
};

module.exports = dataOptimization;