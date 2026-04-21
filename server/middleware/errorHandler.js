import logger from '../utils/logger.js';

/**
 * ERROR HANDLING MIDDLEWARE
 * Centralized error handler to catch and format errors consistently
 * This is an application-level error-handling middleware with (err, req, res, next) signature
 */

const errorHandler = (err, req, res, next) => {
  logger.error(err.message || 'Unhandled error', {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || err.status || 500,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export default errorHandler;
