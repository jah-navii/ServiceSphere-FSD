import express from 'express';
import { getBookingForm, submitBooking, renderPreviouslyBookedServices, getPaymentDetails, submitPayment, getReviewDetails } from '../controllers/bookingController.js';

const router = express.Router();

//Getting booking form
router.get('/booking', getBookingForm);

// Submitting booking form
router.post('/booking', submitBooking);

//Rendering previously booked services 
router.get('/prevbookings', renderPreviouslyBookedServices);

//Getting payment form and details
router.get('/payment', getPaymentDetails);

// Submitting payment form
router.post("/payment", submitPayment);

//Getting review form
router.get('/review', getReviewDetails);

export default router;
