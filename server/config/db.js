import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 20,              // up from default 5 — handles concurrent requests
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message });
    process.exit(1);
  }
};

export default connectDB;
