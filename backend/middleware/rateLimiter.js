const { RateLimiterMemory } = require('rate-limiter-flexible');

// General API rate limiter
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // 15 minutes
});

// Strict rate limiter for auth endpoints
const authRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 5, // 5 attempts
  duration: 900, // 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

// Login rate limiter (more restrictive)
const loginRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => `${req.ip}_${req.body.email || req.body.username || 'unknown'}`,
  points: 3, // 3 attempts
  duration: 900, // 15 minutes
  blockDuration: 1800, // Block for 30 minutes
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // Bypass rate limiting for admin user
    const adminEmail = 'iamcsubrata@gmail.com';
    const userEmail = req.body?.email || req.user?.email;

    if (userEmail === adminEmail) {
      console.log('🔓 Rate limiting bypassed for admin user:', userEmail);
      return next();
    }

    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

const authRateLimiterMiddleware = async (req, res, next) => {
  try {
    // Bypass rate limiting for admin user
    const adminEmail = 'iamcsubrata@gmail.com';
    const userEmail = req.body?.email || req.user?.email;

    if (userEmail === adminEmail) {
      console.log('🔓 Auth rate limiting bypassed for admin user:', userEmail);
      return next();
    }

    await authRateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Authentication Attempts',
      message: `Too many authentication attempts. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

const loginRateLimiterMiddleware = async (req, res, next) => {
  try {
    // Bypass rate limiting for admin user
    const adminEmail = 'iamcsubrata@gmail.com';
    const userEmail = req.body?.email || req.body?.username;

    if (userEmail === adminEmail) {
      console.log('🔓 Login rate limiting bypassed for admin user:', userEmail);
      return next();
    }

    await loginRateLimiter.consume(`${req.ip}_${req.body.email || req.body.username || 'unknown'}`);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Login Attempts',
      message: `Too many login attempts for this account. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

module.exports = {
  rateLimiterMiddleware,
  authRateLimiterMiddleware,
  loginRateLimiterMiddleware
};
