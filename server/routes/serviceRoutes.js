import express from 'express';
import { getServicesAPI, getCategoriesAPI, searchHelpersAPI, searchServicesAPI } from '../controllers/serviceController.js';

const router = express.Router();

router.get('/',          getServicesAPI);
router.get('/categories', getCategoriesAPI);
// Driver-agnostic search endpoints (mongo regex | Meilisearch depending on SEARCH_DRIVER)
router.get('/search',    searchServicesAPI);

export default router;