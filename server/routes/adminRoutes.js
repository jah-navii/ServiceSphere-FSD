import express from 'express';
import {
  loginAdmin,
  renderDashboard,
  renderUsers,
  renderServices,
  renderEarnings,
  approveHelper,
  rejectHelper, 
  addService,
  removeService
} from '../controllers/adminController.js';
import Helper from '../models/Helper.js';

const router = express.Router();

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/login/admin');
}

router.get('/login/admin', (req, res) => {
  res.render('login-admin', { error: null, email: null });
});

router.post('/login/admin', loginAdmin);

router.get('/admin/dashboard', isAdmin, renderDashboard);

// router.get('/admin/users', isAdmin, renderUsers);
router.get('/admin/users', async (req, res) => {
  try {
      const helpers = await Helper.find(); // Fetch all helpers
      res.render('adminDashboard', { 
          title: 'User Management', 
          content: 'partials/user-management',
          helpers 
      });
  } catch (error) {
      console.error('Error fetching helpers:', error);
      res.status(500).send('Error fetching helpers');
  }
});

// Approve user
router.patch('/admin/users/approve', async (req, res) => {
  try {
      const { helperId } = req.body;
      const helper = await Helper.findByIdAndUpdate(helperId, { approved: true }, { new: true });
      if (helper) {
          res.json({ message: 'User approved successfully' });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ message: 'Failed to approve user' });
  }
});

// Reject user
router.patch('/admin/users/reject', async (req, res) => {
  try {
      const { helperId } = req.body;
      const helper = await Helper.findByIdAndUpdate(helperId, { approved: false }, { new: true });
      if (helper) {
          res.json({ message: 'User rejected successfully' });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ message: 'Failed to reject user' });
  }
});


router.get('/admin/services', isAdmin, renderServices);
router.post('/admin/services/add', isAdmin, addService);
router.delete('/admin/services/:serviceName', isAdmin, removeService);

router.get('/admin/earnings', isAdmin, renderEarnings);

router.post('/admin/users/approve/:id', isAdmin, approveHelper);
router.post('/admin/users/reject/:id', isAdmin, rejectHelper);

export default router;
