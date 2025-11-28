import express from 'express';
import { getServicesAPI } from '../controllers/serviceController.js';

const router = express.Router();

// router.get('/search', showAllServices);
// router.get('/search/filter', filterServices);
// router.get('/search/search', searchByName);
// router.post('/search', postSearch);

router.get('/api/services', getServicesAPI);

export default router;
