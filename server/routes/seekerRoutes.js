import express from 'express';
import {
  renderHome,
  getSeekerProfile,
  updateSeekerProfile,
  showCart
} from '../controllers/seekerController.js';
import { isSeeker } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/home', renderHome);
router.get('/profile', isSeeker, getSeekerProfile);
router.post('/update-seeker-profile', isSeeker, updateSeekerProfile);
router.put('/profile', isSeeker, updateSeekerProfile);
router.get("/cart", showCart);


export default router;
