import express from 'express';
import {
  getAdministratorDashboard,
  getAllUsers,
  getAllBookings,
  getPlatformActivity,
  getPlatformAnalytics,
  getSystemHealth,
  suspendUser,
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
  deleteFeedback,
  cleanupOrphans
} from '../controllers/administratorController.js';
import { isAdministrator } from '../middleware/authMiddleware.js';

const router = express.Router();

// ---- Cleanup ----

/**
 * @swagger
 * /api/administrator/cleanup/orphans:
 *   delete:
 *     summary: Delete orphaned records referencing deleted users
 *     description: Removes feedbacks, bookings, and service requests whose helper or seeker no longer exists.
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orphaned records deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 deleted:
 *                   type: object
 *                   properties:
 *                     feedbacks:
 *                       type: integer
 *                     bookings:
 *                       type: integer
 *                     serviceRequests:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Cleanup failed
 */
router.delete('/cleanup/orphans', isAdministrator, cleanupOrphans);

/**
 * @swagger
 * tags:
 *   - name: Administrator
 *     description: Super admin / platform owner endpoints (highest access level)
 */

// ---- Dashboard ----

/**
 * @swagger
 * /api/administrator/dashboard:
 *   get:
 *     summary: Get platform-wide dashboard overview
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats and overview
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — administrator only
 */
router.get('/dashboard', isAdministrator, getAdministratorDashboard);

// ---- Users ----

/**
 * @swagger
 * /api/administrator/users/all:
 *   get:
 *     summary: Get all users across the platform
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users (helpers, seekers, admins, moderators)
 */
router.get('/users/all', isAdministrator, getAllUsers);

/**
 * @swagger
 * /api/administrator/users/{userType}/{id}/suspend:
 *   patch:
 *     summary: Suspend or unsuspend a helper or seeker
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [helper, seeker]
 *         description: Type of user to suspend
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User suspension status toggled
 *       403:
 *         description: Cannot suspend administrators
 *       404:
 *         description: User not found
 */
router.patch('/users/:userType/:id/suspend', isAdministrator, suspendUser);

// ---- Bookings ----

/**
 * @swagger
 * /api/administrator/bookings/all:
 *   get:
 *     summary: Get all bookings platform-wide
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get('/bookings/all', isAdministrator, getAllBookings);

// ---- Activity & Analytics ----

/**
 * @swagger
 * /api/administrator/activity:
 *   get:
 *     summary: Get platform activity log
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent platform activity
 */
router.get('/activity', isAdministrator, getPlatformActivity);

/**
 * @swagger
 * /api/administrator/analytics:
 *   get:
 *     summary: Get platform analytics and insights
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data (user growth, booking trends, revenue)
 */
router.get('/analytics', isAdministrator, getPlatformAnalytics);

/**
 * @swagger
 * /api/administrator/system-health:
 *   get:
 *     summary: Monitor system health and status
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health metrics (DB status, uptime, memory)
 */
router.get('/system-health', isAdministrator, getSystemHealth);

// ---- Moderator Management ----

/**
 * @swagger
 * /api/administrator/moderator-applications:
 *   get:
 *     summary: Get all pending moderator applications
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of moderator applications
 */
router.get('/moderator-applications', isAdministrator, getModeratorApplications);

/**
 * @swagger
 * /api/administrator/moderator-applications/{id}/approve:
 *   patch:
 *     summary: Approve a moderator application
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application approved
 *       404:
 *         description: Application not found
 */
router.patch('/moderator-applications/:id/approve', isAdministrator, approveModerator);

/**
 * @swagger
 * /api/administrator/moderator-applications/{id}/reject:
 *   patch:
 *     summary: Reject a moderator application
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application rejected
 *       404:
 *         description: Application not found
 */
router.patch('/moderator-applications/:id/reject', isAdministrator, rejectModerator);

/**
 * @swagger
 * /api/administrator/moderators/{id}/suspend:
 *   patch:
 *     summary: Suspend an active moderator
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Moderator ID
 *     responses:
 *       200:
 *         description: Moderator suspended
 *       404:
 *         description: Moderator not found
 */
router.patch('/moderators/:id/suspend', isAdministrator, suspendModerator);

// ---- Location-Moderator Assignment ----

/**
 * @swagger
 * /api/administrator/locations-with-moderators:
 *   get:
 *     summary: Get all locations with their assigned moderators
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Locations with moderator assignments
 */
router.get('/locations-with-moderators', isAdministrator, getLocationsWithModerators);

/**
 * @swagger
 * /api/administrator/locations/{locationId}/assign-moderator:
 *   patch:
 *     summary: Assign a moderator to a location
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moderatorId]
 *             properties:
 *               moderatorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Moderator assigned to location
 *       404:
 *         description: Location or moderator not found
 */
router.patch('/locations/:locationId/assign-moderator', isAdministrator, assignModeratorToLocation);

// ---- Location CRUD ----

/**
 * @swagger
 * /api/administrator/locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all locations
 *   post:
 *     summary: Create a new location
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location created
 */
router.get('/locations', isAdministrator, getAllLocations);
router.post('/locations', isAdministrator, createLocation);

/**
 * @swagger
 * /api/administrator/locations/{id}:
 *   patch:
 *     summary: Update a location
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated
 *       404:
 *         description: Location not found
 *   delete:
 *     summary: Delete a location
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location deleted
 *       404:
 *         description: Location not found
 */
router.patch('/locations/:id', isAdministrator, updateLocation);
router.delete('/locations/:id', isAdministrator, deleteLocation);

// ---- Categories CRUD ----

/**
 * @swagger
 * /api/administrator/categories:
 *   get:
 *     summary: Get all service categories
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create a new category
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.get('/categories', isAdministrator, getAllCategories);
router.post('/categories', isAdministrator, createCategory);

/**
 * @swagger
 * /api/administrator/categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete a category
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.patch('/categories/:id', isAdministrator, updateCategory);
router.delete('/categories/:id', isAdministrator, deleteCategory);

// ---- Services CRUD ----

/**
 * @swagger
 * /api/administrator/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, categoryId]
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Service created
 */
router.post('/services', isAdministrator, createService);

/**
 * @swagger
 * /api/administrator/services/{id}:
 *   patch:
 *     summary: Update a service
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated
 *   delete:
 *     summary: Delete a service
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted
 */
router.patch('/services/:id', isAdministrator, updateService);
router.delete('/services/:id', isAdministrator, deleteService);

// ---- Feedback Management ----

/**
 * @swagger
 * /api/administrator/feedbacks:
 *   get:
 *     summary: Get all feedback across the platform
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all feedback entries
 */
router.get('/feedbacks', isAdministrator, getAllFeedbacks);

/**
 * @swagger
 * /api/administrator/feedbacks/{id}:
 *   delete:
 *     summary: Delete a feedback entry
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback deleted
 *       404:
 *         description: Feedback not found
 */
router.delete('/feedbacks/:id', isAdministrator, deleteFeedback);

export default router;