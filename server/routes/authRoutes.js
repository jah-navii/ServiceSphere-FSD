import express from 'express';
import { signupHelper, loginHelper } from '../controllers/authController.js';
import { signupSeeker, loginSeeker } from '../controllers/authController.js';

const router = express.Router();

router.get('/signup/helper', (req, res) => {
  res.render('signup-helper', { error: null, name: null, email: null, mobilenumber: null, aadharnumber: null, gender: null });
});

router.post('/signup/helper', signupHelper);

router.get('/login/helper', (req, res) => {
  res.render('login-helper', { error: null, email: null });
});

router.post('/login/helper', loginHelper);

router.get('/signup/seeker', (req, res) => {
  res.render('signup-seeker', { error: null, name: null, email: null, mobilenumber: null, address: null });
});

router.post('/signup/seeker', signupSeeker);

router.get('/login/seeker', (req, res) => {
  res.render('login-seeker', { error: null, email: null });
});

router.post('/login/seeker', loginSeeker);

// Logout route (works for all user types)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
});

export default router;
