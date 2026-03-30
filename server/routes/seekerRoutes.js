import express from 'express';
import { getSeekerProfile, updateSeekerProfile } from '../controllers/seekerController.js';
import { isSeeker } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Seeker
 *     description: Seeker profile endpoints
 */

/**
 * @swagger
 * /api/seeker/profile:
 *   get:
 *     summary: Get seeker's profile
 *     tags: [Seeker]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seeker profile data
 *   put:
 *     summary: Update seeker's profile
 *     tags: [Seeker]
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
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/profile', isSeeker, getSeekerProfile);
router.put('/profile', isSeeker, updateSeekerProfile);

export default router;
