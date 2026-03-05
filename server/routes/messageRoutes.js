import express from "express";
import { getAdminDashboard, submitContactForm, deleteMessages } from "../controllers/messageController.js";
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get admin dashboard
router.get('/admin/dashboard', isAdmin, getAdminDashboard);

// Submitting contact form
router.post('/contact', submitContactForm);

//Deleting messages in admin dashboard
router.delete('/admin/messages/delete', deleteMessages); 

export default router;
