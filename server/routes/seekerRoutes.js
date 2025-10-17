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
  return res.redirect('/login/seeker');
}

router.get('/home', renderHome);
router.get('/profile', isSeekerLoggedIn, getSeekerProfile);
router.post('/update-seeker-profile', isSeekerLoggedIn, updateSeekerProfile);
router.get("/cart", showCart);


export default router;
