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
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seeker's user ID
 *     responses:
 *       200:
 *         description: Seeker profile data
 */
router.get('/profile', getSeekerProfile);
router.put('/profile', isSeeker, updateSeekerProfile);

export default router;
