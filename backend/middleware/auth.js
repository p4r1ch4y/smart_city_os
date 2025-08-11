const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyWithJWKS } = require('../utils/jwks');

const STACK_JWKS_URL = process.env.STACK_AUTH_JWKS_URL;
const USE_STACK_AUTH = process.env.USE_STACK_AUTH === 'true';

async function verifyToken(token) {
  // If Stack Auth is enabled and JWKS URL is set, try JWKS verification first
  if (USE_STACK_AUTH && STACK_JWKS_URL) {
    try {
      const decoded = await verifyWithJWKS(token, STACK_JWKS_URL);
      return { method: 'jwks', payload: decoded };
    } catch (e) {
      // fall through to local JWT verification
      console.warn('JWKS verification failed, falling back to local JWT:', e.message || e);
    }
  }
  // Fallback to local secret-based JWT
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return { method: 'local', payload };
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const { method, payload } = await verifyToken(token);

    let user = null;
    if (method === 'jwks') {
      // Stack Auth payload shape assumptions
      // Common fields: sub (user id), email, name, roles/role
      const externalId = payload.sub || payload.user_id || payload.id;
      const email = payload.email || payload['email'] || null;
      const role = payload.role || payload.roles?.[0] || 'citizen';

      // Try to find or auto-provision a user record to keep compatibility
      user = await User.findOne({ where: email ? { email } : { id: externalId } });
      if (!user) {
        // Create a minimal user record for compatibility with existing code
        user = await User.create({
          username: (email ? email.split('@')[0] : `user_${externalId}`).slice(0,50),
          email: email || `${externalId}@stackauth.local`,
          password: Math.random().toString(36).slice(2, 12), // hashed by model hook
          firstName: payload.given_name || payload.name?.split(' ')?.[0] || 'Stack',
          lastName: payload.family_name || payload.name?.split(' ')?.slice(1).join(' ') || 'User',
          role: ['admin','traffic_officer','sanitation_officer','environmental_officer','citizen'].includes(role) ? role : 'citizen',
          department: null,
          isActive: true,
        });
      }
    } else {
      // local JWT path remains
      user = await User.findByPk(payload.userId);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token or user inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Authentication failed'
    });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!User.hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Required: ${permission}`
      });
    }

    next();
  };
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requirePermission,
  requireRole
};
