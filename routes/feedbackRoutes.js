import express from 'express';
import { getHelperFeedback, postFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/helper/feedback', getHelperFeedback);
router.post('/feedback', postFeedback);

export default router;
