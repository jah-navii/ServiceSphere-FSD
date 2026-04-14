import express from 'express';
import { signupHelper, loginHelper, signupSeeker, loginSeeker, signupAdministrator, loginAdministrator } from '../controllers/authController.js';
import { applyModerator, loginModerator } from '../controllers/moderatorController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints for all user types
 */

// ---- Helper Auth ----

/**
 * @swagger
 * /api/auth/signup/helper:
 *   post:
 *     summary: Register a new helper
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Helper registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post('/signup/helper', signupHelper);

/**
 * @swagger
 * /api/auth/login/helper:
 *   post:
 *     summary: Login as helper
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/helper', loginHelper);

// ---- Seeker Auth ----

/**
 * @swagger
 * /api/auth/signup/seeker:
 *   post:
 *     summary: Register a new seeker
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Seeker registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post('/signup/seeker', signupSeeker);

/**
 * @swagger
 * /api/auth/login/seeker:
 *   post:
 *     summary: Login as seeker
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/seeker', loginSeeker);

// ---- Administrator Auth ----

/**
 * @swagger
 * /api/auth/signup/administrator:
 *   post:
 *     summary: Register a new administrator
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Administrator registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/signup/administrator', signupAdministrator);

/**
 * @swagger
 * /api/auth/login/administrator:
 *   post:
 *     summary: Login as administrator
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/administrator', loginAdministrator);

// ---- Moderator Auth ----

/**
 * @swagger
 * /api/auth/apply/moderator:
 *   post:
 *     summary: Apply to become a moderator
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, location]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               location:
 *                 type: string
 *                 description: Preferred location to moderate
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Validation error
 */
router.post('/apply/moderator', applyModerator);

/**
 * @swagger
 * /api/auth/login/moderator:
 *   post:
 *     summary: Login as moderator
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/moderator', loginModerator);

// ---- Logout (all user types) ----

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (all user types)
 *     tags: [Auth]
 *     description: With JWT, logout is handled client-side. This endpoint confirms logout.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export default router;