const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { authRateLimiterMiddleware, loginRateLimiterMiddleware } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  role: Joi.string().valid('admin', 'traffic_officer', 'sanitation_officer', 'environmental_officer', 'citizen').default('citizen'),
  department: Joi.string().max(100).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Helper function to generate service tokens
const generateServiceToken = (serviceId, serviceName) => {
  const serviceToken = jwt.sign(
    {
      userId: serviceId,
      serviceId,
      serviceName,
      type: 'service'
    },
    process.env.JWT_SECRET,
    { expiresIn: '365d' } // Long-lived service token
  );

  return serviceToken;
};

// Register endpoint
router.post('/register', authRateLimiterMiddleware, async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { email: value.email },
          { username: value.username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Email or username already registered'
      });
    }

    // Create new user
    const user = await User.create(value);
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    await user.update({ refreshToken });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', loginRateLimiterMiddleware, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: value.email } });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(value.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update user with refresh token and last login
    await user.update({
      refreshToken,
      lastLogin: new Date()
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'No refresh token provided'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Not a refresh token'
      });
    }

    const user = await User.findByPk(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Token not found or user inactive'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);
    
    // Update refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    res.json({
      message: 'Tokens refreshed successfully',
      tokens
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Token expired or invalid'
      });
    }
    
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await req.user.update({ refreshToken: null });
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error'
    });
  }
});

// IoT Service Authentication - generates a service token for IoT simulation
router.post('/iot-service', async (req, res) => {
  try {
    const { serviceKey } = req.body;

    // Check if the service key matches the expected IoT service key
    const expectedServiceKey = process.env.IOT_SERVICE_KEY || 'iot-service-key-2024';

    if (serviceKey !== expectedServiceKey) {
      return res.status(401).json({
        error: 'Invalid service key',
        message: 'Unauthorized IoT service access'
      });
    }

    // Find or create IoT service user
    let iotUser = await User.findOne({ where: { email: 'iot-service@smartcity.local' } });

    if (!iotUser) {
      iotUser = await User.create({
        username: 'iotservice',
        email: 'iot-service@smartcity.local',
        password: Math.random().toString(36).slice(2, 12), // Random password
        firstName: 'IoT',
        lastName: 'Service',
        role: 'admin', // Give admin role for sensor management
        department: 'IoT Services',
        isActive: true
      });
    }

    // Generate service token
    const serviceToken = generateServiceToken(iotUser.id, 'iot-service');

    res.json({
      message: 'IoT service authenticated successfully',
      token: serviceToken,
      user: {
        id: iotUser.id,
        username: iotUser.username,
        email: iotUser.email,
        role: iotUser.role,
        department: iotUser.department
      }
    });

  } catch (error) {
    console.error('IoT service auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON(),
      permissions: User.getRolePermissions(req.user.role)
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
