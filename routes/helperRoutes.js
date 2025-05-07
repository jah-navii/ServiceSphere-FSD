import express from 'express';
import multer from 'multer';
import {
  getHelperProfile,
  updateHelperProfile,
  getHelperRequests,
  updateRequestStatus,
  getHelperSchedule
} from '../controllers/helperController.js';
import { getHelperEarnings } from '../controllers/earningController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/helper/profile', getHelperProfile);
router.post('/helper/profile', upload.single('certifications'), updateHelperProfile);

router.get('/helper/requests', getHelperRequests);
router.post('/helper/requests/update', updateRequestStatus);

router.get('/helper/schedule', getHelperSchedule);

router.get('/helper/earnings', getHelperEarnings);

export default router;
