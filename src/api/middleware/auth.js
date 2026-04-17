/**
 * Authentication Middleware
 * Secure, efficient authentication for API endpoints
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  }
});

class AuthManager {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'solidarity-audio-platform-secret';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '24h';
    this.refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
    
    // In production, these would be stored in a database
    this.users = new Map();
    this.refreshTokens = new Map();
    this.permissions = new Map();
    
    // Initialize demo user
    this.initializeDemoUser();
  }

  async initializeDemoUser() {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    this.users.set('demo@solidarity.com', {
      id: 'demo-user-1',
      email: 'demo@solidarity.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'user',
      permissions: ['audio:read', 'audio:write', 'financial:read'],
      createdAt: new Date(),
      lastLogin: null
    });

    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    this.users.set('admin@solidarity.com', {
      id: 'admin-user-1',
      email: 'admin@solidarity.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      permissions: ['*'], // All permissions
      createdAt: new Date(),
      lastLogin: null
    });
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiration }
    );
  }

  // Generate refresh token
  generateRefreshToken(user) {
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiration }
    );
    
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      createdAt: new Date()
    });
    
    return refreshToken;
  }

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Authenticate user
  async authenticate(email, password) {
    const user = this.users.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    // Update last login
    user.lastLogin = new Date();
    
    return user;
  }

  // Check permission
  hasPermission(user, permission) {
    if (!user.permissions) return false;
    
    // Admin has all permissions
    if (user.permissions.includes('*')) return true;
    
    // Check specific permission
    return user.permissions.includes(permission);
  }

  // Get user by ID
  getUserById(userId) {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  }
}

const authManager = new AuthManager();

// Middleware: Require authentication
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header required',
        format: 'Bearer <token>'
      });
    }

    const token = authHeader.substring(7);
    const decoded = authManager.verifyToken(token);
    
    if (!decoded.userId) {
      return res.status(401).json({
        error: 'Invalid token format'
      });
    }

    const user = authManager.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

// Middleware: Require specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!authManager.hasPermission(req.user, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

// Middleware: Require financial permission
const requireFinancialPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  const hasFinancialRead = authManager.hasPermission(req.user, 'financial:read');
  const hasFinancialWrite = authManager.hasPermission(req.user, 'financial:write');
  
  if (!hasFinancialRead && !hasFinancialWrite) {
    return res.status(403).json({
      error: 'Financial permissions required',
      availablePermissions: ['financial:read', 'financial:write']
    });
  }

  req.hasFinancialWrite = hasFinancialWrite;
  next();
};

// Middleware: Optional authentication
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authManager.verifyToken(token);
      const user = authManager.getUserById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.token = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Auth routes
const authRouter = express.Router();

// Register
authRouter.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    for (const user of authManager.users.values()) {
      if (user.email === email) {
        return res.status(409).json({
          error: 'An account with this email already exists'
        });
      }
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name: email.split('@')[0],
      role: 'user',
      permissions: ['audio:read', 'audio:write', 'financial:read'],
      createdAt: new Date(),
      lastLogin: new Date()
    };

    authManager.users.set(email, newUser);

    const token = authManager.generateToken(newUser);
    const refreshToken = authManager.generateRefreshToken(newUser);

    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: safeUser,
      expiresIn: authManager.jwtExpiration
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Login
authRouter.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    const user = await authManager.authenticate(email, password);
    const token = authManager.generateToken(user);
    const refreshToken = authManager.generateRefreshToken(user);

    // Don't return password
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      token,
      refreshToken,
      user: safeUser,
      expiresIn: authManager.jwtExpiration
    });
  } catch (error) {
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

// Refresh token
authRouter.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required'
      });
    }

    const tokenData = authManager.refreshTokens.get(refreshToken);
    if (!tokenData) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    const user = authManager.getUserById(tokenData.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    const newToken = authManager.generateToken(user);
    const newRefreshToken = authManager.generateRefreshToken(user);

    // Remove old refresh token
    authManager.refreshTokens.delete(refreshToken);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: authManager.jwtExpiration
    });
  } catch (error) {
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
});

// Get current user
authRouter.get('/me', requireAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json({
    user: safeUser,
    permissions: req.user.permissions
  });
});

// Logout
authRouter.post('/logout', requireAuth, (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      authManager.refreshTokens.delete(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
});

// Check permissions
authRouter.get('/permissions', requireAuth, (req, res) => {
  const permissions = req.user.permissions;
  const permissionCheck = {
    audio: {
      read: authManager.hasPermission(req.user, 'audio:read'),
      write: authManager.hasPermission(req.user, 'audio:write')
    },
    financial: {
      read: authManager.hasPermission(req.user, 'financial:read'),
      write: authManager.hasPermission(req.user, 'financial:write')
    },
    system: {
      read: authManager.hasPermission(req.user, 'system:read'),
      write: authManager.hasPermission(req.user, 'system:write')
    },
    admin: authManager.hasPermission(req.user, '*')
  };

  res.json({
    permissions,
    capabilities: permissionCheck
  });
});

module.exports = {
  requireAuth,
  requirePermission,
  requireFinancialPermission,
  optionalAuth,
  authManager,
  authRouter
};