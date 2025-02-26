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

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set views directory
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: false,
  saveUninitialized: true
}));

//Static files 
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

app.use('/', authRoutes);
app.use('/', helperRoutes);
app.use('/', bookingRoutes);
app.use('/', feedbackRoutes);
app.use('/', adminRoutes);
app.use('/', seekerRoutes);
app.use('/', serviceRoutes);
app.use('/', messageRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/landing.html");
});

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
