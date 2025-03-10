import express from 'express';
import {
  showAllServices,
  filterServices,
  searchByName,
  postSearch
} from '../controllers/serviceController.js';

const router = express.Router();

router.get('/search', showAllServices);
router.get('/search/filter', filterServices);
router.get('/search/search', searchByName);
router.post('/search', postSearch);

export default router;
