import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logsDir = path.join(__dirname, '..', 'logs');

// Custom format: timestamp + level + message + optional meta
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return stack
      ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}${metaStr}`
      : `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

// Rotate error logs daily, keep 14 days
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '14d',
  zippedArchive: true,
});

// Rotate combined logs daily, keep 7 days
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  zippedArchive: true,
});

const transports = [errorFileTransport, combinedFileTransport];

// Console output only in development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    })
  );
}

const logger = winston.createLogger({
  levels: { ...winston.config.npm.levels, http: 3 },
  level: process.env.LOG_LEVEL || 'http',
  format: logFormat,
  transports,
  exitOnError: false,
});

export default logger;
