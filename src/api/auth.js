/**
 * Solidarity Authentication Middleware
 * 
 * This module provides secure, efficient authentication and authorization for the Solidarity API.
 * It includes JWT-based access, refresh tokens, password hashing, rate limiting, and fine-grained 
 * permission checks.
 * 
 * Features:
 * - JWT authentication with refresh tokens
 * - Password hashing with bcrypt
 * - Rate limiting for login attempts
 * - Permission-based authorization
 * - Financial access controls
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'solidarity-development-secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
const BCRYPT_SALT_ROUNDS = 10;

// Create router for auth endpoints
const authRouter = express.Router();

/**
 * Rate limiter for authentication attempts
 * Prevents brute force attacks by limiting login attempts
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                    // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  }
});

/**
 * AuthManager Class
 * 
 * Handles user authentication, token generation and verification,
 * and permission management
 */
class AuthManager {
  constructor() {
    // In-memory storage (replace with database in production)
    this.users = new Map();
    this.refreshTokens = new Map();
    this.permissionMap = new Map();
    
    // Initialize demo users
    this.initializeDemoUsers();
  }

  /**
   * Initialize demo users for development
   * In production, replace with database integration
   */
  async initializeDemoUsers() {
    // Create demo user with limited permissions
    const demoUser = {
      id: '1',
      email: 'demo@solidarity.com',
      password: await bcrypt.hash('demo123', BCRYPT_SALT_ROUNDS),
      firstName: 'Demo',
      lastName: 'User',
      role: 'user',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      permissions: ['audio:read', 'audio:write', 'financial:read', 'financial:write']
    };
    
    // Create admin user with all permissions
    const adminUser = {
      id: '2',
      email: 'admin@solidarity.com',
      password: await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      permissions: ['*'] // Wildcard for all permissions
    };
    
    this.users.set(demoUser.id, demoUser);
    this.users.set(adminUser.id, adminUser);
    this.permissionMap.set(demoUser.id, new Set(demoUser.permissions));
    this.permissionMap.set(adminUser.id, new Set(adminUser.permissions));
    
    console.log('Demo users initialized');
  }

  /**
   * Generate a JWT token for a user
   * @param {Object} user - User object
   * @returns {String} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: Array.from(this.permissionMap.get(user.id) || [])
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  }

  /**
   * Generate a refresh token for a user
   * @param {Object} user - User object
   * @returns {String} Refresh token
   */
  generateRefreshToken(user) {
    const refreshToken = uuidv4();
    const expiry = new Date();
    
    // Parse refresh token expiration string (e.g., '7d')
    const match = REFRESH_TOKEN_EXPIRATION.match(/^(\d+)([smhdw])$/);
    if (match) {
      const [, amount, unit] = match;
      const multiplier = {
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000
      };
      
      expiry.setTime(expiry.getTime() + parseInt(amount) * multiplier[unit]);
    } else {
      // Default to 7 days if format is invalid
      expiry.setDate(expiry.getDate() + 7);
    }
    
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: expiry
    });
    
    return refreshToken;
  }

  /**
   * Verify a JWT token
   * @param {String} token - JWT token
   * @returns {Object|null} Decoded token payload or null if invalid
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify a refresh token and return associated user
   * @param {String} refreshToken - Refresh token
   * @returns {Object|null} User object or null if invalid
   */
  verifyRefreshToken(refreshToken) {
    const tokenData = this.refreshTokens.get(refreshToken);
    
    if (!tokenData) {
      return null;
    }
    
    // Check if token has expired
    if (new Date() > new Date(tokenData.expiresAt)) {
      this.refreshTokens.delete(refreshToken);
      return null;
    }
    
    return this.users.get(tokenData.userId);
  }

  /**
   * Delete a refresh token
   * @param {String} refreshToken - Refresh token to delete
   */
  deleteRefreshToken(refreshToken) {
    this.refreshTokens.delete(refreshToken);
  }

  /**
   * Authenticate a user by email and password
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object|null} User object or null if authentication fails
   */
  async authenticate(email, password) {
    // Find user by email
    let foundUser = null;
    
    for (const user of this.users.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      return null;
    }
    
    // Compare password hash
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    
    if (!passwordMatch) {
      return null;
    }
    
    // Update last login time
    foundUser.lastLogin = new Date().toISOString();
    this.users.set(foundUser.id, foundUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = foundUser;
    return userWithoutPassword;
  }

  /**
   * Check if user has a specific permission
   * @param {Object} user - User object
   * @param {String} permission - Permission to check
   * @returns {Boolean} True if user has permission
   */
  hasPermission(user, permission) {
    if (!user || !user.id) {
      return false;
    }
    
    const permissions = this.permissionMap.get(user.id);
    
    if (!permissions) {
      return false;
    }
    
    // Wildcard permission grants access to everything
    if (permissions.has('*')) {
      return true;
    }
    
    return permissions.has(permission);
  }

  /**
   * Get a user by ID
   * @param {String} userId - User ID
   * @returns {Object|null} User object without password
   */
  getUserById(userId) {
    const user = this.users.get(userId);
    
    if (!user) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all permissions for a user
   * @param {String} userId - User ID
   * @returns {Array} Array of permission strings
   */
  getUserPermissions(userId) {
    const permissions = this.permissionMap.get(userId);
    
    if (!permissions) {
      return [];
    }
    
    return Array.from(permissions);
  }
}

// Create global auth manager instance
const authManager = new AuthManager();

/**
 * Middleware to require authentication
 * Verifies JWT token in Authorization header
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = authManager.verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Get full user details
  const user = authManager.getUserById(decoded.userId);
  
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  // Add user and token data to request
  req.user = user;
  req.token = decoded;
  next();
};

/**
 * Middleware to require specific permission
 * @param {String} permission - Required permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!authManager.hasPermission(req.user, permission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    next();
  };
};

/**
 * Middleware to require financial permissions
 * Checks for financial:read or financial:write
 */
const requireFinancialPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const hasReadPermission = authManager.hasPermission(req.user, 'financial:read');
  const hasWritePermission = authManager.hasPermission(req.user, 'financial:write');
  
  if (!hasReadPermission && !hasWritePermission) {
    return res.status(403).json({ error: 'Financial permission denied' });
  }
  
  // Add financial write flag for downstream logic
  req.hasFinancialWrite = hasWritePermission;
  next();
};

/**
 * Middleware for optional authentication
 * If token is provided, adds user to request
 * If not, allows request to continue anonymously
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = authManager.verifyToken(token);
  
  if (decoded) {
    const user = authManager.getUserById(decoded.userId);
    
    if (user) {
      req.user = user;
      req.token = decoded;
    }
  }
  
  next();
};

// Authentication routes
// ---------------------

/**
 * Login route
 * POST /api/auth/login
 */
authRouter.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    const user = await authManager.authenticate(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = authManager.generateToken(user);
    const refreshToken = authManager.generateRefreshToken(user);
    
    // Calculate expiration time
    const decoded = authManager.verifyToken(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    res.json({
      success: true,
      token,
      refreshToken,
      user,
      expiresIn
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Refresh token route
 * POST /api/auth/refresh
 */
authRouter.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }
  
  const user = authManager.verifyRefreshToken(refreshToken);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
  
  // Generate new tokens
  const newToken = authManager.generateToken(user);
  const newRefreshToken = authManager.generateRefreshToken(user);
  
  // Delete old refresh token
  authManager.deleteRefreshToken(refreshToken);
  
  res.json({
    success: true,
    token: newToken,
    refreshToken: newRefreshToken
  });
});

/**
 * Get current user route
 * GET /api/auth/me
 */
authRouter.get('/me', requireAuth, (req, res) => {
  const permissions = authManager.getUserPermissions(req.user.id);
  
  res.json({
    ...req.user,
    permissions
  });
});

/**
 * Logout route
 * POST /api/auth/logout
 */
authRouter.post('/logout', requireAuth, (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    authManager.deleteRefreshToken(refreshToken);
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Get user permissions route
 * GET /api/auth/permissions
 */
authRouter.get('/permissions', requireAuth, (req, res) => {
  const permissions = authManager.getUserPermissions(req.user.id);
  
  // Create structured capabilities object
  const capabilities = {
    audio: {
      read: permissions.includes('audio:read') || permissions.includes('*'),
      write: permissions.includes('audio:write') || permissions.includes('*')
    },
    financial: {
      read: permissions.includes('financial:read') || permissions.includes('*'),
      write: permissions.includes('financial:write') || permissions.includes('*')
    },
    system: {
      read: permissions.includes('system:read') || permissions.includes('*'),
      write: permissions.includes('system:write') || permissions.includes('*')
    },
    admin: permissions.includes('*')
  };
  
  res.json({
    permissions,
    capabilities
  });
});

// Export authentication components
module.exports = {
  authRouter,
  authManager,
  requireAuth,
  requirePermission,
  requireFinancialPermission,
  optionalAuth
};