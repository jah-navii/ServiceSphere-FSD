import express from 'express';
import { postFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Feedback
 *     description: User feedback endpoints
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               bookingId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback submitted
 *       400:
 *         description: Validation error
 */
router.post('/', postFeedback);

export default router;