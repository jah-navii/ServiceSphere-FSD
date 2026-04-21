import express from 'express';
import {
  getModeratorDashboard,
  getLocationHelpers,
  approveHelper,
  rejectHelper,
  suspendHelper,
  reactivateHelper,
  getLocationUsers,
  getLocationBookings,
  getLocationServices,
  getModeratorProfile,
  updateModeratorProfile,
  getLocationEarningsData,
  getLocationFeedbacks
} from '../controllers/moderatorController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Moderator
 *     description: Moderator panel endpoints
 */

/**
 * @swagger
 * /api/moderator/dashboard:
 *   get:
 *     summary: Get moderator dashboard overview
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data for moderator's assigned location
 */
router.get('/dashboard', requireAuth('moderator'), getModeratorDashboard);

/**
 * @swagger
 * /api/moderator/helpers:
 *   get:
 *     summary: Get helpers in moderator's location
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of helpers
 */
router.get('/helpers', requireAuth('moderator'), getLocationHelpers);

/**
 * @swagger
 * /api/moderator/helpers/{helperId}/approve:
 *   patch:
 *     summary: Approve a helper
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: helperId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Helper approved
 */
router.patch('/helpers/:helperId/approve', requireAuth('moderator'), approveHelper);

/**
 * @swagger
 * /api/moderator/helpers/{helperId}/reject:
 *   patch:
 *     summary: Reject a helper
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: helperId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Helper rejected
 */
router.patch('/helpers/:helperId/reject', requireAuth('moderator'), rejectHelper);
router.patch('/helpers/:helperId/suspend', requireAuth('moderator'), suspendHelper);
router.patch('/helpers/:helperId/reactivate', requireAuth('moderator'), reactivateHelper);

/**
 * @swagger
 * /api/moderator/bookings:
 *   get:
 *     summary: Get bookings in moderator's location
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/bookings', requireAuth('moderator'), getLocationBookings);

/**
 * @swagger
 * /api/moderator/services:
 *   get:
 *     summary: Get services in moderator's location
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/services', requireAuth('moderator'), getLocationServices);

/**
 * @swagger
 * /api/moderator/profile:
 *   get:
 *     summary: Get moderator's profile
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Moderator profile data
 *   put:
 *     summary: Update moderator's profile
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/profile', requireAuth('moderator'), getModeratorProfile);
router.put('/profile', requireAuth('moderator'), updateModeratorProfile);

/**
 * @swagger
 * /api/moderator/earnings-data:
 *   get:
 *     summary: Get earnings data for moderator's location
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings breakdown
 */
router.get('/earnings-data', requireAuth('moderator'), getLocationEarningsData);

/**
 * @swagger
 * /api/moderator/feedbacks:
 *   get:
 *     summary: Get feedbacks for helpers in moderator's location
 *     tags: [Moderator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedbacks and stats for the location
 */
router.get('/feedbacks', requireAuth('moderator'), getLocationFeedbacks);
router.get('/users', requireAuth('moderator'), getLocationUsers);

export default router;