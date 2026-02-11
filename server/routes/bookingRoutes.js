import express from 'express';
import { renderPreviouslyBookedServices, payForBooking, getPaymentDetails, submitPayment, getReviewDetails } from '../controllers/bookingController.js';
import { bookingRateLimiter } from '../middleware/customMiddleware.js';

import { createBooking, getUserBookings } from '../controllers/bookingController.js';

const router = express.Router();

// Route to submit a new booking (with rate limiting)
router.post('/', bookingRateLimiter, createBooking);

// Route to get all bookings for the Cart/Dashboard page
router.get('/', getUserBookings);

router.patch('/:id/pay', payForBooking);


//Rendering previously booked services 
router.get('/prevbookings', renderPreviouslyBookedServices);

//Getting payment form and details
router.get('/payment', getPaymentDetails);

// Submitting payment form
router.post("/payment", submitPayment);

//Getting review form
router.get('/review', getReviewDetails);

export default router;
