import express from 'express';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from "express-session";
import authRoutes from './routes/authRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import seekerRoutes from './routes/seekerRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler.js';
import { requestLogger, requestTimer, notFoundHandler } from './middleware/customMiddleware.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// APPLICATION-LEVEL MIDDLEWARE
// ============================================

// Third-party: Security headers (helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Adjust as needed for your frontend
}));

// Third-party: HTTP request logger (morgan)
app.use(morgan('dev')); // Use 'combined' for production

// Custom: Request logger with timestamp
app.use(requestLogger);

// Custom: Request timing tracker
app.use(requestTimer);

// Third-party: CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // your React dev server
    credentials: true, // if using cookies or sessions later
  })
);


// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Built-in: Body parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Built-in: Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Third-party: Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: true
}));

// Built-in: Additional static files 
app.use('/styles', express.static(path.join(__dirname, 'styles'), { 
  setHeaders: (res, filePath) => { 
    if (filePath.endsWith('.css')) { 
      res.setHeader('Content-Type', 'text/css'); 
    }
  }
}));

app.use('/javascript', express.static(path.join(__dirname, 'javascript'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use('/pics', express.static(path.join(__dirname, 'pics')));

connectDB();

// ============================================
// ROUTER-LEVEL MIDDLEWARE (Route Handlers)
// ============================================
app.use('/', authRoutes);
app.use('/', helperRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/', feedbackRoutes);
app.use('/', adminRoutes);
app.use('/', seekerRoutes);
app.use('/', serviceRoutes);
app.use('/', messageRoutes);


// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + "/pages/signup.html");
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + "/pages/login.html");
});

//Contact page
app.get('/contact', (req, res) => {
  res.sendFile(__dirname + "/pages/contact.html");
});

// About page
app.get('/about', (req, res) => {
  res.sendFile(__dirname + "/pages/about.html");
});

// Terms page
app.get('/terms', (req, res) => {
  res.sendFile(__dirname + "/pages/terms.html");
});

// ============================================
// ERROR HANDLING MIDDLEWARE (Must be last)
// ============================================

// Custom: 404 handler for undefined routes
app.use(notFoundHandler);

// Error-handling middleware: Centralized error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
