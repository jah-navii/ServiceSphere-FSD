/**
 * CUSTOM MIDDLEWARE COLLECTION
 * User-defined middleware for various application needs
 */

/**
 * Request Logger - Logs incoming requests with timestamp
 * Custom middleware that logs method, URL, IP, and timestamp
 */
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
