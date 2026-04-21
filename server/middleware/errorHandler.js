import logger from '../utils/logger.js';
import { env } from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  logger.error(err.message || 'Unhandled error', {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || err.status || 500,
  });

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export default errorHandler;
