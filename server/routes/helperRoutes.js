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

// Driver-agnostic helper search (mongo regex | Meilisearch depending on SEARCH_DRIVER)
// GET /api/helper/search?q=plumber&category=...&location=...&gender=...&maxPrice=...
router.get('/search', searchHelpersAPI);

export default router;