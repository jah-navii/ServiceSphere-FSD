/**
 * utils/search/mongoSearch.js
 *
 * MongoDB regex-backed search driver (phase 1 / baseline).
 * Wraps the existing Helper.find + Feedback aggregate pattern so the same
 * interface works regardless of which driver is active.
 *
 * searchHelpers() mirrors the response shape of getServicesAPI so the front-end
 * contract does not change.
 */

import Helper   from '../../models/Helper.js';
import Service  from '../../models/Service.js';
import Feedback from '../../models/Feedback.js';
import Location from '../../models/Location.js';
import Category from '../../models/Category.js';

// ── searchHelpers ──────────────────────────────────────────────────────────────

export async function searchHelpers(queryStr, filters = {}, { page = 1, limit = 50 } = {}) {
  const { category = 'all', location = 'all', gender = 'all', maxPrice = 5000 } = filters;

  const mongoQuery = { approved: true, suspended: false };
  if (category !== 'all') mongoQuery.category = category;
  if (gender   !== 'all') mongoQuery.gender = new RegExp(`^${gender}$`, 'i');

  if (location !== 'all') {
    const locDoc = await Location.findOne({ name: new RegExp(`^${location}$`, 'i') })
      .select('_id').lean();
    if (locDoc) mongoQuery.location = locDoc._id;
  }

  const [helpers, feedbacks] = await Promise.all([
    Helper.find(mongoQuery)
      .populate('category', 'name _id')
      .populate('services.serviceId', 'name price')
      .lean(),
    Feedback.aggregate([
      { $group: { _id: '$helper', avgRating: { $avg: '$rating' } } },
    ]),
  ]);

  const avgRatings = feedbacks.reduce((acc, f) => {
    acc[f._id.toString()] = f.avgRating.toFixed(1);
    return acc;
  }, {});

  const results = [];
  helpers.forEach(helper => {
    if (!helper.services?.length) return;
    helper.services.forEach(svc => {
      const svcDoc = svc.serviceId;
      if (!svcDoc) return;
      const svcPrice = svc.customPrice ?? svcDoc.price ?? 0;
      if (svcPrice > maxPrice) return;
      if (queryStr && !new RegExp(queryStr, 'i').test(svcDoc.name)) return;

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

  const total = results.length;
  const skip  = (page - 1) * limit;
  return { hits: results.slice(skip, skip + limit), total, driver: 'mongo' };
}

// ── searchServices ─────────────────────────────────────────────────────────────

export async function searchServices(queryStr, filters = {}, { page = 1, limit = 50 } = {}) {
  const { category = 'all' } = filters;

  const mongoQuery = { isActive: true };
  if (category !== 'all') mongoQuery.category = category;
  if (queryStr) mongoQuery.name = new RegExp(queryStr, 'i');

  const [services, total] = await Promise.all([
    Service.find(mongoQuery)
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Service.countDocuments(mongoQuery),
  ]);

  return { hits: services, total, driver: 'mongo' };
}

// ── index / remove stubs (no-ops for Mongo driver) ────────────────────────────

export async function indexHelper()   {}
export async function indexService()  {}
export async function removeHelper()  {}
export async function removeService() {}
export async function reindexAll()    {}
export async function syncOnStartup() {}
export async function ping()          { return 'mongo'; }

// ── getServiceTypes helper (shared with getServicesAPI) ───────────────────────

export async function getServiceTypes(category) {
  return Service.find(category !== 'all' ? { category } : {})
    .select('name').lean();
}
