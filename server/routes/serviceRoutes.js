import express from 'express';
import { getServicesAPI, getCategoriesAPI  } from '../controllers/serviceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Services
 *     description: Public service listing endpoints
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all available services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/', getServicesAPI);

router.get('/categories', getCategoriesAPI);

export default router;