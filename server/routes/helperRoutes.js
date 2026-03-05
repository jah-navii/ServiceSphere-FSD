import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getHelperProfile,
  getHelperRequests,
  updateHelperProfile,
  updateRequestStatus,
  getHelperSchedule,
  getHelperEarnings,
  getHelperFeedback,
  seedDemoBookings
} from '../controllers/helperController.js';

const router = express.Router();

// Multer Config 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists in your root
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// GET Profile (needs ID)
router.get('/profile/:id', getHelperProfile);

// PUT Profile (Update) - Handles 'certifications' file field
router.put('/profile', upload.single('certifications'), updateHelperProfile);

// Request Routes
router.get('/requests/:helperId', getHelperRequests);
router.patch('/requests/update', updateRequestStatus);

router.get('/schedule/:helperId', getHelperSchedule);

router.get('/earnings/:helperId', getHelperEarnings);

router.get('/feedback/:helperId', getHelperFeedback);

// Demo/Testing endpoint - Creates historical bookings for testing
router.post('/seed-demo-bookings', seedDemoBookings);

export default router;


