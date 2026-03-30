import express from 'express';
import {
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
  getLocationAnalytics
} from '../controllers/adminController.js';
import { getAdminDashboard, deleteMessages } from '../controllers/messageController.js';
import { isAdmin, isAdminOrAdministrator } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin panel endpoints (Admin & Administrator access)
 */

// ---- Dashboard (absorbed from messageRoutes) ----

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', isAdmin, getAdminDashboard);

// ---- Contact Messages ----

/**
 * @swagger
 * /api/admin/messages:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact messages
 */
router.get('/messages', isAdminOrAdministrator, getContactMessages);

/**
 * @swagger
 * /api/admin/messages/{id}:
 *   delete:
 *     summary: Delete a contact message
 *     tags: [Admin]
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
 *         description: Message deleted
 *       404:
 *         description: Message not found
 */
router.delete('/messages/:id', isAdminOrAdministrator, deleteContactMessage);

/**
 * @swagger
 * /api/admin/messages:
 *   delete:
 *     summary: Bulk delete messages
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Messages deleted
 */
router.delete('/messages', isAdmin, deleteMessages);

// ---- User Management ----

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all helpers (pending/approved)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of helpers
 */
router.get('/users', isAdminOrAdministrator, getUsers);

/**
 * @swagger
 * /api/admin/users/approve:
 *   patch:
 *     summary: Approve a helper
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [helperId]
 *             properties:
 *               helperId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Helper approved
 */
router.patch('/users/approve', isAdminOrAdministrator, approveUser);

/**
 * @swagger
 * /api/admin/users/reject:
 *   patch:
 *     summary: Reject a helper
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [helperId]
 *             properties:
 *               helperId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Helper rejected
 */
router.patch('/users/reject', isAdminOrAdministrator, rejectUser);

/**
 * @swagger
 * /api/admin/seekers:
 *   get:
 *     summary: Get all seekers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of seekers
 */
router.get('/seekers', isAdminOrAdministrator, getSeekers);

/**
 * @swagger
 * /api/admin/users/helper/{id}:
 *   delete:
 *     summary: Delete a helper
 *     tags: [Admin]
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
 *         description: Helper deleted
 */
router.delete('/users/helper/:id', isAdminOrAdministrator, deleteHelper);

/**
 * @swagger
 * /api/admin/users/seeker/{id}:
 *   delete:
 *     summary: Delete a seeker
 *     tags: [Admin]
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
 *         description: Seeker deleted
 */
router.delete('/users/seeker/:id', isAdminOrAdministrator, deleteSeeker);

// ---- Service Management ----

/**
 * @swagger
 * /api/admin/services-data:
 *   get:
 *     summary: Get service management data (categories + services)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories and services data
 */
router.get('/services-data', isAdminOrAdministrator, getServiceManagementData);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Add a new category
 *     tags: [Admin]
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
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/categories', isAdminOrAdministrator, addCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
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
router.delete('/categories/:id', isAdminOrAdministrator, deleteCategory);

/**
 * @swagger
 * /api/admin/services:
 *   post:
 *     summary: Add a new service
 *     tags: [Admin]
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
router.post('/services', isAdminOrAdministrator, addService);

/**
 * @swagger
 * /api/admin/services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Admin]
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
router.delete('/services/:id', isAdminOrAdministrator, deleteService);

// ---- Earnings ----

/**
 * @swagger
 * /api/admin/earnings-data:
 *   get:
 *     summary: Get platform earnings data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings data
 */
router.get('/earnings-data', isAdminOrAdministrator, getEarningsData);

// ---- Location Analytics ----

/**
 * @swagger
 * /api/admin/location-analytics:
 *   get:
 *     summary: Get location-based analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Location analytics data
 */
router.get('/location-analytics', isAdminOrAdministrator, getLocationAnalytics);

export default router;