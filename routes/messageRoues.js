import express from "express";
import { getAdminDashboard, submitContactForm, deleteMessages } from "../controllers/messageController.js";

const router = express.Router();

// Middleware to protect admin routes
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
      return next();
    } else {
      return res.redirect('/login/admin');
    }
  }

// Get admin dashboard
router.get('/admin/dashboard', isAdmin, getAdminDashboard);

// Submitting contact form
router.post('/contact', submitContactForm);

//Deleting messages in admin dashboard
router.delete('/admin/messages/delete', deleteMessages); 

export default router;
