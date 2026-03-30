
// ============================================
// routes/contactRoutes.js  [NEW FILE]
// Mounted at: /api/contact
// ============================================
import express from 'express';
import { submitContactForm } from '../controllers/messageController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Contact
 *     description: Public contact form
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact form message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               message:
 *                 type: string
 *                 example: I have a question about your services
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post('/', submitContactForm);

export default router;
