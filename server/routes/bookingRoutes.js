import express from 'express';
import {
  createBooking,
  getUserBookings,
  payForBooking,
  renderPreviouslyBookedServices,
  getPaymentDetails,
  submitPayment,
  getReviewDetails
} from '../controllers/bookingController.js';
import { bookingRateLimiter } from '../middleware/customMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Booking management endpoints
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, helperId, date]
 *             properties:
 *               serviceId:
 *                 type: string
 *               helperId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 example: "10:00 AM"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 */
router.post('/', bookingRateLimiter, createBooking);
router.get('/', getUserBookings);

/**
 * @swagger
 * /api/bookings/{id}/pay:
 *   patch:
 *     summary: Mark a booking as paid
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking marked as paid
 *       404:
 *         description: Booking not found
 */
router.patch('/:id/pay', payForBooking);

/**
 * @swagger
 * /api/bookings/prevbookings:
 *   get:
 *     summary: Get previously booked services
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Previously booked services
 */
router.get('/prevbookings', renderPreviouslyBookedServices);

/**
 * @swagger
 * /api/bookings/payment:
 *   get:
 *     summary: Get payment form details
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: string
 *         description: Booking ID to pay for
 *     responses:
 *       200:
 *         description: Payment details
 *   post:
 *     summary: Submit payment
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId]
 *             properties:
 *               bookingId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, upi, cash]
 *     responses:
 *       200:
 *         description: Payment processed
 */
router.get('/payment', getPaymentDetails);
router.post('/payment', submitPayment);

/**
 * @swagger
 * /api/bookings/review:
 *   get:
 *     summary: Get review form for a completed booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review form details
 */
router.get('/review', getReviewDetails);

export default router;