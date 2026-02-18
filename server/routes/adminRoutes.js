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
import Helper from '../models/Helper.js';

// dealt with

const router = express.Router();

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/login/admin');
}

router.post("/signup/admin", signupAdmin);
router.post("/login/admin", loginAdmin);

router.get('/api/admin/messages', getContactMessages);
router.delete('/api/admin/messages/:id', deleteContactMessage);

router.get('/api/admin/users', getUsers);
router.patch('/api/admin/users/approve', approveUser);
router.patch('/api/admin/users/reject', rejectUser);
router.get('/api/admin/seekers', getSeekers);
router.delete('/api/admin/users/helper/:id', deleteHelper);
router.delete('/api/admin/users/seeker/:id', deleteSeeker);

router.get('/api/admin/services-data', getServiceManagementData);
router.post('/api/admin/categories/add', addCategory);
router.delete('/api/admin/categories/:id', deleteCategory);
router.post('/api/admin/services/add', addService);
router.delete('/api/admin/services/:id', deleteService);

router.get('/api/admin/earnings-data', getEarningsData);

// Location Management
router.get('/api/admin/locations', getLocations);
router.post('/api/admin/locations/add', addLocation);
router.delete('/api/admin/locations/:id', deleteLocation);
router.get('/api/admin/location-analytics', getLocationAnalytics);

export default router;
