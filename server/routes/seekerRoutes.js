import express from 'express';
import {
  renderHome,
  getSeekerProfile,
  updateSeekerProfile,
  showCart
} from '../controllers/seekerController.js';

const router = express.Router();

// Middleware to protect seeker routes
function isSeekerLoggedIn(req, res, next) {
  if (req.session.user && req.session.user.role === 'seeker') return next();
  
  // For API/JSON calls, return 401 instead of redirect
  if (req.originalUrl.includes('/api/') || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Seeker login required'
    });
  }
  
  return res.redirect('/login/seeker');
}

router.get('/home', renderHome);
router.get('/profile', isSeekerLoggedIn, getSeekerProfile);
router.post('/update-seeker-profile', isSeekerLoggedIn, updateSeekerProfile);
router.put('/profile', isSeekerLoggedIn, updateSeekerProfile);
router.get("/cart", showCart);


export default router;
