import express from 'express';
import { getServicesAPI, getCategoriesAPI, searchHelpersAPI, searchServicesAPI } from '../controllers/serviceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Services
 *     description: Public service and helper listings (no authentication required)
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: List all available helpers and their services
 *     description: >
 *       Returns a flat list of helper+service pairs for approved, non-suspended helpers.
 *       Results are cached (10 min). All query parameters are optional — omitting them
 *       returns the full unfiltered list.
 *     tags: [Services]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ObjectId to filter by (default "all")
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location name to filter by, e.g. "Mumbai" (default "all")
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [all, male, female]
 *         description: Filter helpers by gender (default "all")
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Exact service name to filter by, e.g. "Plumbing" (default "all")
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Maximum service price
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Partial text search on service name (regex)
 *     responses:
 *       200:
 *         description: List of helper+service pairs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 helpers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: string, example: "664a1b2c3d4e5f6789abcdef" }
 *                       name:         { type: string, example: "Ravi Kumar" }
 *                       availability: { type: string, example: "Weekdays" }
 *                       gender:       { type: string, example: "male" }
 *                       address:      { type: string, example: "Andheri West" }
 *                       rating:       { type: string, example: "4.5" }
 *                       service:      { type: string, example: "Plumbing" }
 *                       price:        { type: number, example: 350 }
 *                       categoryName: { type: string, example: "Home Repair" }
 *                       categoryId:   { type: string, example: "664a000000000000000000aa" }
 *                 serviceTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:  { type: string }
 *                       name: { type: string }
 *       500:
 *         description: Server error
 */
router.get('/', getServicesAPI);

/**
 * @swagger
 * /api/services/categories:
 *   get:
 *     summary: Get all service categories
 *     description: Returns every category in the database. Results are cached for 1 hour.
 *     tags: [Services]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:  { type: string, example: "664a000000000000000000aa" }
 *                       name: { type: string, example: "Home Repair" }
 *       500:
 *         description: Server error
 */
router.get('/categories', getCategoriesAPI);

/**
 * @swagger
 * /api/services/search:
 *   get:
 *     summary: Full-text search for services
 *     description: >
 *       Driver-agnostic search endpoint. When `SEARCH_DRIVER=meili` uses Meilisearch
 *       (typo-tolerant, ~10 ms). When `SEARCH_DRIVER=mongo` falls back to MongoDB regex.
 *     tags: [Services]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query, e.g. "cleaning"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ObjectId filter (default "all")
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 hits:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:  { type: integer, example: 12 }
 *                 page:   { type: integer, example: 1 }
 *                 limit:  { type: integer, example: 50 }
 *       500:
 *         description: Search failed
 */
// Driver-agnostic search endpoints (mongo regex | Meilisearch depending on SEARCH_DRIVER)
router.get('/search', searchServicesAPI);

export default router;