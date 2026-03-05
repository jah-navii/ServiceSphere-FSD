import express from 'express';
import {
  getAdministratorDashboard,
  getAllUsers,
  getAllBookings,
  getPlatformActivity,
  getPlatformAnalytics,
  getSystemHealth,
  deleteUser,
  getModeratorApplications,
  approveModerator,
  rejectModerator,
  suspendModerator,
  getLocationsWithModerators,
  assignModeratorToLocation,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createService,
  updateService,
  deleteService,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllFeedbacks,
  deleteFeedback
} from '../controllers/administratorController.js';
import { isAdministrator, isAdminOrAdministrator } from '../middleware/authMiddleware.js';

const router = express.Router();

// Administrator-only routes (highest level access)

// Dashboard - Overview of entire platform
router.get('/dashboard', isAdministrator, getAdministratorDashboard);

// Users Management - View all users
router.get('/users/all', isAdministrator, getAllUsers);

// Bookings - View all bookings
router.get('/bookings/all', isAdministrator, getAllBookings);

// Activity Log - View platform activity
router.get('/activity', isAdministrator, getPlatformActivity);

// Analytics - Platform analytics and insights
router.get('/analytics', isAdministrator, getPlatformAnalytics);

// System Health - Monitor system status
router.get('/system-health', isAdministrator, getSystemHealth);

// Delete any user (except other administrators)
router.delete('/users/:userType/:id', isAdministrator, deleteUser);

// Moderator Management
router.get('/moderator-applications', isAdministrator, getModeratorApplications);
router.patch('/moderator-applications/:id/approve', isAdministrator, approveModerator);
router.patch('/moderator-applications/:id/reject', isAdministrator, rejectModerator);
router.patch('/moderators/:id/suspend', isAdministrator, suspendModerator);

// Location-Moderator Management
router.get('/locations-with-moderators', isAdministrator, getLocationsWithModerators);
router.patch('/locations/:locationId/assign-moderator', isAdministrator, assignModeratorToLocation);

// Location Management
router.get('/locations', isAdministrator, getAllLocations);
router.post('/locations', isAdministrator, createLocation);
router.patch('/locations/:id', isAdministrator, updateLocation);
router.delete('/locations/:id', isAdministrator, deleteLocation);

// Categories & Services Management
router.get('/categories', isAdministrator, getAllCategories);
router.post('/categories', isAdministrator, createCategory);
router.patch('/categories/:id', isAdministrator, updateCategory);
router.delete('/categories/:id', isAdministrator, deleteCategory);

router.post('/services', isAdministrator, createService);
router.patch('/services/:id', isAdministrator, updateService);
router.delete('/services/:id', isAdministrator, deleteService);

// Feedback Management
router.get('/feedbacks', isAdministrator, getAllFeedbacks);
router.delete('/feedbacks/:id', isAdministrator, deleteFeedback);

// Note: Administrator can also access all admin routes
// This is handled by the isAdminOrAdministrator middleware

export default router;
