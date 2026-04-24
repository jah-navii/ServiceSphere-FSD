// CUSTOM MIDDLEWARE

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import logger from '../utils/logger.js';
import { getCache } from '../utils/cache/index.js';

// Helper to properly handle IPv6 addresses in rate limiting
const getClientIdentifier = (req) => {
  // If user is authenticated and is a seeker, use their ID
  if (req.user?.role === 'seeker' && req.user?.id) {
    return `seeker_${req.user.id}`;
  }
  // Fallback to IP address - return undefined to use default IP handler
  return undefined;
};


// Request Logger - Logs incoming requests with timestamp
// Custom middleware that logs method, URL, IP, and timestamp

export const requestLogger = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  logger.info(`${req.method} ${req.originalUrl}`, { ip });
  next();
};

/**
 * Request Timer - Adds response time tracking
 * Custom middleware to measure and log request processing time
 */
export const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * Async Error Wrapper
 * Custom utility to wrap async route handlers and catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Handler
 * Custom middleware for handling 404 errors
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Booking Rate Limiter
 * Limits the number of bookings a seeker can make within a time window
 * Protects against booking spam and ensures fair resource usage
 */
export const bookingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // Limit each seeker to 2 bookings per window
  message: {
    success: false,
    message: 'Booking failed. You have made too many bookings. Please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use seeker ID as the key for rate limiting (user-specific)
  keyGenerator: getClientIdentifier,
  // Only apply to seekers
  skip: (req) => {
    // Skip rate limiting if not a seeker (e.g., admin or helper)
    return req.user?.role !== 'seeker';
  },
  handler: (req, res) => {
    logger.warn(`Booking rate limit exceeded for user: ${req.user?.id || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Booking failed. You have made too many bookings. Please try again after 15 minutes.',
      limit: 2,
      windowMs: '15 minutes'
    });
  }
});

// ── Auth Rate Limiter ─────────────────────────────────────────────────────────
//
// Limits login attempts to 10 per IP per 15 minutes.
// When CACHE_DRIVER=redis the backing store uses Redis so the counter persists
// across server restarts and is shared across all Node.js worker processes —
// properties in-memory rate limiting cannot provide.
//
// Rate-limit key = IP + email (body field) for maximum precision.  The email
// is extracted in keyGenerator to prevent an attacker enumerating accounts via
// a single shared IP counter.

function buildAuthRateLimitStore() {
  const cache = getCache();
  const driver = process.env.CACHE_DRIVER ?? 'memory';

  if (driver !== 'redis') return undefined; // use express-rate-limit default (memory)

  // Custom express-rate-limit v7 store backed by our Redis driver
  return {
    async increment(key) {
      const ttl = 15 * 60; // 15 minutes in seconds
      const hits = await cache.incr(`rl:auth:${key}`, ttl);
      // pttl in ms for resetTime — approximate from TTL
      const resetTime = new Date(Date.now() + ttl * 1000);
      return { totalHits: hits, resetTime };
    },
    async decrement(key) {
      const current = await cache.get(`rl:auth:${key}`);
      if (current && current > 0) await cache.set(`rl:auth:${key}`, current - 1, 15 * 60);
    },
    async resetKey(key) {
      await cache.del(`rl:auth:${key}`);
    },
  };
}

export const authRateLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,              // 10 login attempts per window per key
  standardHeaders:  true,
  legacyHeaders:    false,
  store:            buildAuthRateLimitStore(),
  keyGenerator(req) {
    // Key = IP + email so one abuser doesn't block a whole shared IP
    const email = req.body?.email ?? '';
    return `${ipKeyGenerator(req)}:${email.toLowerCase()}`;
  },
  handler(req, res) {
    logger.warn(`Auth rate limit exceeded: IP=${req.ip} email=${req.body?.email ?? ''}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      retryAfter: '15 minutes',
    });
  },
});

