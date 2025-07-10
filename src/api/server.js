/**
 * Solidarity Platform - Main API Router
 * Efficient, secure API endpoints for frontend integration
 * Supports both low-data and high-data modes for optimal performance
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Import route modules
const audioRoutes = require('./routes/audio');
const financialRoutes = require('./routes/financial');
const systemRoutes = require('./routes/system');
const authRoutes = require('./routes/auth');

// Import middleware
const auth = require('./middleware/auth');
const validation = require('./middleware/validation');
const errorHandler = require('./middleware/errorHandler');
const dataOptimization = require('./middleware/dataOptimization');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression for efficiency
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balanced compression
  threshold: 1024 // Only compress if > 1KB
}));

// Body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Data optimization middleware
app.use(dataOptimization);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION || '2.41.0',
    services: {
      audio: 'operational',
      financial: 'operational',
      database: 'operational'
    }
  });
});

// Authentication routes (no auth middleware needed)
app.use('/api/auth', authRoutes);

// System routes (some require auth)
app.use('/api/system', systemRoutes);

// Protected routes - require authentication
app.use('/api/audio', auth.requireAuth, audioRoutes);
app.use('/api/financial', auth.requireAuth, auth.requireFinancialPermission, financialRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Solidarity Platform API',
    version: '2.41.0',
    endpoints: {
      auth: '/api/auth',
      audio: '/api/audio',
      financial: '/api/financial',
      system: '/api/system'
    },
    documentation: '/docs',
    support: 'https://solidarity.com/support'
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    suggestion: 'Check /api/docs for available endpoints',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Solidarity Platform API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
});

module.exports = app;