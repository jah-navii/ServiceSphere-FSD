import express from 'express';
import {
  applyModerator,
  loginModerator,
  getModeratorDashboard,
  getLocationHelpers,
  approveHelper,
  rejectHelper,
  getLocationBookings,
  getLocationServices,
  getModeratorProfile,
  updateModeratorProfile,
  getLocationEarningsData
} from '../controllers/moderatorController.js';
import { getLocations } from '../controllers/adminController.js';
import { isModerator } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/apply/moderator', applyModerator);
router.post('/login/moderator', loginModerator);
router.get('/api/locations', getLocations); // Public endpoint for moderator application form

// Protected routes - Moderator only
router.get('/api/moderator/dashboard', isModerator, getModeratorDashboard);
router.get('/api/moderator/helpers', isModerator, getLocationHelpers);
router.patch('/api/moderator/helpers/:helperId/approve', isModerator, approveHelper);
router.patch('/api/moderator/helpers/:helperId/reject', isModerator, rejectHelper);
router.get('/api/moderator/bookings', isModerator, getLocationBookings);
router.get('/api/moderator/services', isModerator, getLocationServices);
router.get('/api/moderator/profile', isModerator, getModeratorProfile);
router.put('/api/moderator/profile', isModerator, updateModeratorProfile);
router.get('/api/moderator/earnings-data', isModerator, getLocationEarningsData);

export default router;
