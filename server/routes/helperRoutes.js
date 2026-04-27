import express from 'express';
import multer from 'multer';
import {
  getHelperProfile,
  getHelperRequests,
  updateHelperProfile,
  updateRequestStatus,
  getHelperSchedule,
  getHelperEarnings,
  getHelperFeedback,
  seedDemoBookings
} from '../controllers/helperController.js';
import { searchHelpersAPI } from '../controllers/serviceController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   - name: Helper
 *     description: Helper profile and dashboard endpoints
 */

/**
 * @swagger
 * /api/helper/profile/{id}:
 *   get:
 *     summary: Get helper's profile by ID
 *     tags: [Helper]
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
 *         description: Helper profile data
 *       404:
 *         description: Helper not found
 */
router.get('/profile/:id', getHelperProfile);

/**
 * @swagger
 * /api/helper/profile:
 *   put:
 *     summary: Update helper's profile
 *     tags: [Helper]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               bio:
 *                 type: string
 *               certifications:
 *                 type: string
 *                 format: binary
 *                 description: PDF file upload
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', upload.single('certifications'), updateHelperProfile);

/**
 * @swagger
 * /api/helper/requests/{helperId}:
 *   get:
 *     summary: Get booking requests for a helper
 *     tags: [Helper]
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
 *         description: List of booking requests
 */
router.get('/requests/:helperId', getHelperRequests);

/**
 * @swagger
 * /api/helper/requests/update:
 *   patch:
 *     summary: Accept or reject a booking request
 *     tags: [Helper]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, status]
 *             properties:
 *               requestId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Request status updated
 */
router.patch('/requests/update', updateRequestStatus);

/**
 * @swagger
 * /api/helper/schedule/{helperId}:
 *   get:
 *     summary: Get helper's schedule
 *     tags: [Helper]
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
 *         description: Schedule data
 */
router.get('/schedule/:helperId', getHelperSchedule);

/**
 * @swagger
 * /api/helper/earnings/{helperId}:
 *   get:
 *     summary: Get helper's earnings
 *     tags: [Helper]
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
 *         description: Earnings data
 */
router.get('/earnings/:helperId', getHelperEarnings);

/**
 * @swagger
 * /api/helper/feedback/{helperId}:
 *   get:
 *     summary: Get feedback for a helper
 *     tags: [Helper]
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
 *         description: List of feedback
 */
router.get('/feedback/:helperId', getHelperFeedback);

/**
 * @swagger
 * /api/helper/seed-demo-bookings:
 *   post:
 *     summary: Seed demo bookings (testing only)
 *     tags: [Helper]
 *     responses:
 *       201:
 *         description: Demo bookings created
 */
router.post('/seed-demo-bookings', seedDemoBookings);

/**
 * @swagger
 * /api/helper/search:
 *   get:
 *     summary: Full-text search for helpers
 *     description: >
 *       Driver-agnostic search. When `SEARCH_DRIVER=meili` uses Meilisearch
 *       (typo-tolerant, ~12 ms P50). When `SEARCH_DRIVER=mongo` falls back to
 *       MongoDB regex (~180 ms P50). No authentication required.
 *     tags: [Helper]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term, e.g. "plumber" or "plumer" (typos tolerated in Meili mode)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ObjectId filter (default "all")
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location ObjectId filter (default "all")
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [all, male, female]
 *         description: Gender filter (default "all")
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Maximum service price filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Helper search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 hits:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:  { type: integer, example: 8 }
 *                 page:   { type: integer, example: 1 }
 *                 limit:  { type: integer, example: 50 }
 *       500:
 *         description: Search failed
 */
// Driver-agnostic helper search (mongo regex | Meilisearch depending on SEARCH_DRIVER)
// GET /api/helper/search?q=plumber&category=...&location=...&gender=...&maxPrice=...
router.get('/search', searchHelpersAPI);

export default router;