import express from 'express';
import {signupAdmin,
  loginAdmin,
  getContactMessages,
  deleteContactMessage,
  getUsers,
  approveUser,
  rejectUser,
  getSeekers,
  deleteHelper,
  deleteSeeker,
  getServiceManagementData,
  addCategory,
  deleteCategory,
  addService,
  deleteService,
  getEarningsData,
  getLocations,
  addLocation,
  deleteLocation,
  getLocationAnalytics
} from '../controllers/adminController.js';
import { isAdmin, isAdminOrAdministrator } from '../middleware/authMiddleware.js';
import Helper from '../models/Helper.js';

// dealt with

const router = express.Router();

// Public routes (no auth required)
router.post("/signup/admin", signupAdmin);
router.post("/login/admin", loginAdmin);

// Protected routes - Admin or Administrator can access
router.get('/api/admin/messages', isAdminOrAdministrator, getContactMessages);
router.delete('/api/admin/messages/:id', isAdminOrAdministrator, deleteContactMessage);

router.get('/api/admin/users', isAdminOrAdministrator, getUsers);
router.patch('/api/admin/users/approve', isAdminOrAdministrator, approveUser);
router.patch('/api/admin/users/reject', isAdminOrAdministrator, rejectUser);
router.get('/api/admin/seekers', isAdminOrAdministrator, getSeekers);
router.delete('/api/admin/users/helper/:id', isAdminOrAdministrator, deleteHelper);
router.delete('/api/admin/users/seeker/:id', isAdminOrAdministrator, deleteSeeker);

router.get('/api/admin/services-data', isAdminOrAdministrator, getServiceManagementData);
router.post('/api/admin/categories/add', isAdminOrAdministrator, addCategory);
router.delete('/api/admin/categories/:id', isAdminOrAdministrator, deleteCategory);
router.post('/api/admin/services/add', isAdminOrAdministrator, addService);
router.delete('/api/admin/services/:id', isAdminOrAdministrator, deleteService);

router.get('/api/admin/earnings-data', isAdminOrAdministrator, getEarningsData);

// Location Management
router.get('/api/admin/locations', isAdminOrAdministrator, getLocations);
router.post('/api/admin/locations/add', isAdminOrAdministrator, addLocation);
router.delete('/api/admin/locations/:id', isAdminOrAdministrator, deleteLocation);
router.get('/api/admin/location-analytics', isAdminOrAdministrator, getLocationAnalytics);

export default router;
