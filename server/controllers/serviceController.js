import Helper from '../models/Helper.js';
import Service from '../models/Service.js';
import Feedback from '../models/Feedback.js';
import Category from '../models/Category.js';
import Location from '../models/Location.js';
import { getOrSet } from '../utils/cache.js';
import { getSearch } from '../utils/search/index.js';

const SERVICES_TTL  = 10 * 60;  // 10 min — helpers change infrequently
const LOCATIONS_TTL = 60 * 60;  // 1 hr  — locations almost never change

// GET /api/services
export const getServicesAPI = async (req, res) => {
    try {
        const rawSearch = req.query.search || req.query.q || "";
        const search = rawSearch.trim();

        const {
            type = "all",
            gender = "all",
            price = 5000,
            category = "all",
            location = "all"
        } = req.query;

        // Build DB-side query — push as many filters as possible to Mongo
        const query = { approved: true, suspended: false };
        if (category !== "all") query.category = category;
        if (gender !== 'all') query.gender = new RegExp(`^${gender}$`, 'i');

        // Resolve location name → ObjectId so we can use the indexed Helper.location field
        if (location !== 'all') {
            const locDoc = await Location.findOne({ name: new RegExp(`^${location}$`, 'i') }).select('_id').lean();
            if (locDoc) query.location = locDoc._id;
        }

        // Cache key encodes all filter dimensions
        const cacheKey = `services:${JSON.stringify({ query, type, search, maxPrice: Number(price) })}`;

        const payload = await getOrSet(cacheKey, SERVICES_TTL, async () => {
        const [helpers, feedbacks] = await Promise.all([
            Helper.find(query)
                .populate('category', 'name _id')
                .populate('services.serviceId', 'name price')
                .lean(),
            Feedback.aggregate([
                { $group: { _id: "$helper", avgRating: { $avg: "$rating" } } }
            ]),
        ]);

        const avgRatings = feedbacks.reduce((acc, f) => {
            acc[f._id.toString()] = f.avgRating.toFixed(1);
            return acc;
        }, {});

        const maxPrice = Number(price) || 5000;
        const results = [];

        helpers.forEach(helper => {
            if (!helper.services?.length) return;
            helper.services.forEach(svc => {
                const svcDoc = svc.serviceId; // populated Service doc
                if (!svcDoc) return;
                const svcPrice = svc.customPrice ?? svcDoc.price ?? 0;
                if (svcPrice > maxPrice) return;
                if (type !== "all" && svcDoc.name !== type) return;
                if (search && !new RegExp(search, 'i').test(svcDoc.name)) return;

                results.push({
                    id:           helper._id,
                    name:         helper.name,
                    availability: helper.availability,
                    gender:       helper.gender,
                    address:      helper.address,
                    rating:       avgRatings[helper._id.toString()] || '4.5',
                    service:      svcDoc.name,
                    price:        svcPrice,
                    categoryName: helper.category?.name,
                    categoryId:   helper.category?._id,
                });
            });
        });

        const availableServiceTypes = await Service.find(category !== "all" ? { category } : {})
            .select('name').lean();

            return { helpers: results, serviceTypes: availableServiceTypes };
        });

        res.status(200).json({ success: true, ...payload });

    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
};


export const getCategoriesAPI = async (req, res) => {
  try {
    const categories = await getOrSet('categories:all', LOCATIONS_TTL, () =>
      Category.find().lean()
    );
    res.status(200).json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// ── Search endpoints (driver-agnostic) ─────────────────────────────────────────

/**
 * GET /api/helpers/search
 * Query params: q, category, location, gender, maxPrice, page, limit
 *
 * When SEARCH_DRIVER=meili: full-text + typo-tolerant search via Meilisearch.
 * When SEARCH_DRIVER=mongo: existing regex search (phase 1 / baseline).
 * Response shape is identical in both cases.
 */
export const searchHelpersAPI = async (req, res) => {
  try {
    const q        = (req.query.q || req.query.search || '').trim();
    const filters  = {
      category: req.query.category || 'all',
      location: req.query.location || 'all',
      gender:   req.query.gender   || 'all',
      maxPrice: Number(req.query.maxPrice) || 5000,
    };
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);

    const result = await getSearch().searchHelpers(q, filters, { page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[searchHelpersAPI]', err.message);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

/**
 * GET /api/services/search
 * Query params: q, category, page, limit
 */
export const searchServicesAPI = async (req, res) => {
  try {
    const q       = (req.query.q || req.query.search || '').trim();
    const filters = { category: req.query.category || 'all' };
    const page    = Math.max(1, parseInt(req.query.page)  || 1);
    const limit   = Math.min(100, parseInt(req.query.limit) || 50);

    const result = await getSearch().searchServices(q, filters, { page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[searchServicesAPI]', err.message);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};