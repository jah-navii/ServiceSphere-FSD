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
  cleanupOrphans,
  triggerReindex
} from '../controllers/administratorController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

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
router.delete('/cleanup/orphans', requireAuth('administrator'), cleanupOrphans);

// POST /api/administrator/reindex — trigger full Meilisearch reindex
router.post('/reindex', requireAuth('administrator'), triggerReindex);

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
router.get('/dashboard', requireAuth('administrator'), getAdministratorDashboard);

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
router.get('/users/all', requireAuth('administrator'), getAllUsers);

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
router.patch('/users/:userType/:id/suspend', requireAuth('administrator'), suspendUser);

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
router.get('/bookings/all', requireAuth('administrator'), getAllBookings);

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
router.get('/activity', requireAuth('administrator'), getPlatformActivity);

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
router.get('/analytics', requireAuth('administrator'), getPlatformAnalytics);

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
router.get('/system-health', requireAuth('administrator'), getSystemHealth);

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
router.get('/moderator-applications', requireAuth('administrator'), getModeratorApplications);

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
router.patch('/moderator-applications/:id/approve', requireAuth('administrator'), approveModerator);

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
router.patch('/moderator-applications/:id/reject', requireAuth('administrator'), rejectModerator);

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
router.patch('/moderators/:id/suspend', requireAuth('administrator'), suspendModerator);

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
router.get('/locations-with-moderators', requireAuth('administrator'), getLocationsWithModerators);

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
router.patch('/locations/:locationId/assign-moderator', requireAuth('administrator'), assignModeratorToLocation);

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
router.get('/locations', requireAuth('administrator'), getAllLocations);
router.post('/locations', requireAuth('administrator'), createLocation);

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
router.patch('/locations/:id', requireAuth('administrator'), updateLocation);
router.delete('/locations/:id', requireAuth('administrator'), deleteLocation);

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
router.get('/categories', requireAuth('administrator'), getAllCategories);
router.post('/categories', requireAuth('administrator'), createCategory);

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
router.patch('/categories/:id', requireAuth('administrator'), updateCategory);
router.delete('/categories/:id', requireAuth('administrator'), deleteCategory);

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
router.post('/services', requireAuth('administrator'), createService);

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
router.patch('/services/:id', requireAuth('administrator'), updateService);
router.delete('/services/:id', requireAuth('administrator'), deleteService);

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
router.get('/feedbacks', requireAuth('administrator'), getAllFeedbacks);

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
router.delete('/feedbacks/:id', requireAuth('administrator'), deleteFeedback);

export default router;