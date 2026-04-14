import express from 'express';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';
import { requestLogger, requestTimer, notFoundHandler } from './middleware/customMiddleware.js';

// Route imports
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

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GLOBAL MIDDLEWARE
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(requestLogger);
app.use(requestTimer);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: true,
}));

// STATIC FILES
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  },
}));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/javascript', express.static(path.join(__dirname, 'javascript')));
app.use('/pics', express.static(path.join(__dirname, 'pics')));

// SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
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


connectDB();
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});