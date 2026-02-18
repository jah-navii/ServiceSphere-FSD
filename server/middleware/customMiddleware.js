// CUSTOM MIDDLEWARE


import rateLimit from 'express-rate-limit';

// Helper to properly handle IPv6 addresses in rate limiting
const getClientIdentifier = (req) => {
  // If user is authenticated and is a seeker, use their ID
  if (req.session?.user?.role === 'seeker' && req.session?.user?.id) {
    return `seeker_${req.session.user.id}`;
  }
  // Fallback to IP address - return undefined to use default IP handler
  return undefined;
};


// Request Logger - Logs incoming requests with timestamp
// Custom middleware that logs method, URL, IP, and timestamp

export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${ip}`);
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
    console.log(`[TIMING] ${req.method} ${req.originalUrl} - ${duration}ms`);
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
    return req.session?.user?.role !== 'seeker';
  },
  handler: (req, res) => {
    console.log(`[RATE LIMIT] Booking limit exceeded for user: ${req.session?.user?.id || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Booking failed. You have made too many bookings. Please try again after 15 minutes.',
      limit: 2,
      windowMs: '15 minutes'
    });
  }
});
