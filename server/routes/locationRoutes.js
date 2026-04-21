
// ============================================
// routes/locationRoutes.js  [NEW FILE]
// Mounted at: /api/locations
// (Extracted from moderatorRoutes + adminRoutes)
// ============================================
import express from 'express';
import { getLocations, addLocation, deleteLocation, getOpenLocations } from '../controllers/locationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Locations
 *     description: Location management
 */

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations (public)
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of locations
 *   post:
 *     summary: Add a new location (admin only)
 *     tags: [Locations]
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
router.get('/', getLocations);
router.get('/open', getOpenLocations);
router.post('/', requireAuth('administrator'), addLocation);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete a location (admin only)
 *     tags: [Locations]
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
 */
router.delete('/:id', requireAuth('administrator'), deleteLocation);

export default router;

