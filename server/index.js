import { env } from './config/env.js';
import express from 'express';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';
import { requestLogger, requestTimer, notFoundHandler } from './middleware/customMiddleware.js';
import logger from './utils/logger.js';

import { getCache } from './utils/cache/index.js';
import { getSearch } from './utils/search/index.js';
import authRoutes from './routes/authRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import seekerRoutes from './routes/seekerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import administratorRoutes from './routes/administratorRoutes.js';
import moderatorRoutes from './routes/moderatorRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GLOBAL MIDDLEWARE
app.use(compression());

// Helmet — CSP disabled only for the Swagger UI
app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs')) {
    return helmet({ contentSecurityPolicy: false })(req, res, next);
  }
  return helmet()(req, res, next);
});

app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(requestLogger);
app.use(requestTimer);

const corsOrigins = env.CLIENT_URL.split(',').map((u) => u.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

// STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  },
}));

// SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// HEALTH CHECK — reports MongoDB, Redis, Meilisearch connectivity
app.get('/api/health', async (_req, res) => {
  const t = (fn) => {
    const start = Date.now();
    return fn().then(
      (r) => ({ ok: true,  result: r, latencyMs: Date.now() - start }),
      (e) => ({ ok: false, error: e.message, latencyMs: Date.now() - start }),
    );
  };

  const [mongoOk, cacheOk, searchOk] = await Promise.all([
    t(() => Promise.resolve(mongoose.connection.readyState === 1 ? 'connected' : 'disconnected')),
    t(() => getCache().ping()),
    t(() => getSearch().ping()),
  ]);

  const allOk = mongoOk.ok && cacheOk.ok && searchOk.ok;

  res.status(allOk ? 200 : 503).json({
    ok:     allOk,
    uptime: process.uptime(),
    drivers: {
      cache:  process.env.CACHE_DRIVER  ?? 'memory',
      search: process.env.SEARCH_DRIVER ?? 'mongo',
    },
    mongo:  mongoOk,
    cache:  { ...cacheOk, stats: getCache().stats() },
    search: searchOk,
  });
});

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/helper', helperRoutes);
app.use('/api/seeker', seekerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/administrator', administratorRoutes);
app.use('/api/moderator', moderatorRoutes);

// ERROR HANDLING
app.use(notFoundHandler);
app.use(errorHandler);

// Export app for testing (supertest imports this without starting the server)
export { app };

// Start only after DB connects — skipped in test environment
if (env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });

    // Warm up the cache driver eagerly (connects Redis if CACHE_DRIVER=redis)
    getCache();

    // Kick off async Meili sync if SEARCH_DRIVER=meili
    if ((process.env.SEARCH_DRIVER ?? 'mongo') === 'meili') {
      getSearch().syncOnStartup().catch((err) =>
        logger.error('[meili] startup sync failed:', err.message),
      );
    }
  });
}
