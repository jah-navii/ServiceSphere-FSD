/**
 * utils/search/meiliSearch.js
 *
 * Meilisearch-backed search driver (phase 2).
 * Uses the "inflate from IDs" pattern: Meili returns ranked document IDs,
 * then full documents are fetched from MongoDB.
 *
 * Index schema:
 *   helpers  — primaryKey: id (= _id.toString())
 *              filterable: categoryId, locationId, approved, suspended
 *              sortable:   createdAt, rating
 *   services — primaryKey: id
 *              filterable: categoryId, isActive
 *              sortable:   name
 *
 * Sync strategy:
 *   - syncOnStartup() runs reindexAll() if last sync was > 1 hour ago (tracked in Redis/memory cache).
 *   - Per-document updates pushed via indexHelper/indexService from Mongoose hooks.
 *   - Failures are caught and logged; a dead-letter list ("ss:meili:dlq") is
 *     stored in Redis so failed syncs can be retried by the /api/admin/reindex endpoint.
 */

import { Meilisearch as MeiliSearch } from 'meilisearch';
import Helper   from '../../models/Helper.js';
import Service  from '../../models/Service.js';
import Feedback from '../../models/Feedback.js';
import Location from '../../models/Location.js';
import '../../models/Category.js';
import { getCache }  from '../cache/index.js';

const CHUNK       = 1000;          // bulk indexing batch size
const SYNC_TTL    = 60 * 60;      // re-sync interval: 1 hour (in seconds)
const SYNC_KEY    = 'meili:lastSyncAt';
const DLQ_KEY     = 'meili:dlq';  // dead-letter queue key (Redis list)

let _client    = null;
let _helperIdx = null;
let _serviceIdx= null;

function client() {
  if (!_client) {
    _client = new MeiliSearch({
      host:   process.env.MEILI_HOST       ?? 'http://localhost:7700',
      apiKey: process.env.MEILI_MASTER_KEY ?? '',
    });
  }
  return _client;
}

async function helperIndex() {
  if (!_helperIdx) _helperIdx = client().index('helpers');
  return _helperIdx;
}

async function serviceIndex() {
  if (!_serviceIdx) _serviceIdx = client().index('services');
  return _serviceIdx;
}

// ── Document shape helpers ─────────────────────────────────────────────────────

/**
 * Build a Meili-ready helper document from a populated Mongoose Helper doc.
 * The `id` field is Meili's primary key.
 */
function helperToDoc(helper, avgRating) {
  return {
    id:           helper._id.toString(),
    name:         helper.name,
    address:      helper.address   ?? '',
    gender:       helper.gender    ?? '',
    categoryId:   helper.category?._id?.toString()  ?? '',
    categoryName: helper.category?.name             ?? '',
    locationId:   helper.location?.toString()       ?? '',
    locationName: '',  // will be populated during reindexAll
    serviceNames: (helper.services ?? [])
      .map(s => s.serviceId?.name ?? s.name ?? '')
      .filter(Boolean)
      .join(' '),
    approved:     helper.approved   ?? false,
    suspended:    helper.suspended  ?? false,
    rating:       avgRating         ?? 4.5,
    createdAt:    helper.createdAt  ? Math.floor(new Date(helper.createdAt).getTime() / 1000) : 0,
  };
}

function serviceToDoc(service) {
  return {
    id:           service._id.toString(),
    name:         service.name,
    categoryId:   service.category?._id?.toString() ?? service.category?.toString() ?? '',
    categoryName: service.category?.name            ?? '',
    isActive:     service.isActive ?? true,
  };
}

// ── Index configuration ────────────────────────────────────────────────────────

async function ensureIndexSettings() {
  const hi = await helperIndex();
  const si = await serviceIndex();

  await Promise.all([
    hi.updateSettings({
      filterableAttributes: ['categoryId', 'locationId', 'approved', 'suspended'],
      sortableAttributes:   ['createdAt', 'rating'],
      searchableAttributes: ['name', 'categoryName', 'serviceNames', 'address'],
      typoTolerance:        { enabled: true },
      stopWords:            ['the', 'a', 'an', 'and', 'or', 'of', 'in', 'for', 'to', 'is', 'are'],
    }),
    si.updateSettings({
      filterableAttributes: ['categoryId', 'isActive'],
      sortableAttributes:   ['name'],
      searchableAttributes: ['name', 'categoryName'],
      typoTolerance:        { enabled: true },
    }),
  ]);
}

// ── reindexAll ────────────────────────────────────────────────────────────────

export async function reindexAll({ onProgress } = {}) {
  await ensureIndexSettings();

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const [helpers, feedbacks, locations] = await Promise.all([
    Helper.find({ approved: true })
      .populate('category', 'name _id')
      .populate('services.serviceId', 'name price')
      .lean(),
    Feedback.aggregate([
      { $group: { _id: '$helper', avgRating: { $avg: '$rating' } } },
    ]),
    Location.find().lean(),
  ]);

  const locMap = locations.reduce((m, l) => { m[l._id.toString()] = l.name; return m; }, {});
  const ratingMap = feedbacks.reduce((m, f) => { m[f._id.toString()] = f.avgRating; return m; }, {});

  const helperDocs = helpers.map(h => {
    const doc = helperToDoc(h, ratingMap[h._id.toString()] ?? 4.5);
    doc.locationName = locMap[doc.locationId] ?? '';
    return doc;
  });

  const hi = await helperIndex();
  for (let i = 0; i < helperDocs.length; i += CHUNK) {
    await hi.addDocuments(helperDocs.slice(i, i + CHUNK));
    onProgress?.(`helpers: indexed ${Math.min(i + CHUNK, helperDocs.length)}/${helperDocs.length}`);
  }

  // ── Services ─────────────────────────────────────────────────────────────────
  const services    = await Service.find({ isActive: true }).populate('category', 'name _id').lean();
  const serviceDocs = services.map(serviceToDoc);

  const si = await serviceIndex();
  for (let i = 0; i < serviceDocs.length; i += CHUNK) {
    await si.addDocuments(serviceDocs.slice(i, i + CHUNK));
    onProgress?.(`services: indexed ${Math.min(i + CHUNK, serviceDocs.length)}/${serviceDocs.length}`);
  }

  // Record last sync timestamp
  await getCache().set(SYNC_KEY, Date.now(), SYNC_TTL + 60);
  return { helpers: helperDocs.length, services: serviceDocs.length };
}

// ── syncOnStartup ─────────────────────────────────────────────────────────────

export async function syncOnStartup() {
  const lastSync = await getCache().get(SYNC_KEY);
  const stale    = !lastSync || (Date.now() - lastSync) > SYNC_TTL * 1000;
  if (!stale) {
    console.info('[meili] index fresh — skipping startup sync');
    return;
  }
  console.info('[meili] index stale — running async reindex (does not block startup)');
  reindexAll({ onProgress: (msg) => console.info(`[meili] ${msg}`) }).catch(err =>
    console.error('[meili] reindex error:', err.message),
  );
}

// ── Per-document sync ─────────────────────────────────────────────────────────

async function pushToMeili(fn, label) {
  try {
    await fn();
  } catch (err) {
    console.error(`[meili] ${label} failed:`, err.message);
    // Push to dead-letter queue for later reconciliation
    const cache = getCache();
    if (typeof cache._client?.rpush === 'function') {
      await cache._client.rpush('ss:' + DLQ_KEY, JSON.stringify({ label, ts: Date.now() }))
        .catch(() => {});
    }
  }
}

export async function indexHelper(helperDoc) {
  const avgRating = await Feedback.aggregate([
    { $match: { helper: helperDoc._id } },
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]).then(r => r[0]?.avg ?? 4.5);

  const loc = helperDoc.location
    ? await Location.findById(helperDoc.location).select('name').lean()
    : null;

  const doc = helperToDoc(helperDoc, avgRating);
  doc.locationName = loc?.name ?? '';

  await pushToMeili(
    async () => (await helperIndex()).addDocuments([doc]),
    `indexHelper(${helperDoc._id})`,
  );
}

export async function indexService(serviceDoc) {
  const doc = serviceToDoc(serviceDoc);
  await pushToMeili(
    async () => (await serviceIndex()).addDocuments([doc]),
    `indexService(${serviceDoc._id})`,
  );
}

export async function removeHelper(id) {
  await pushToMeili(
    async () => (await helperIndex()).deleteDocument(id.toString()),
    `removeHelper(${id})`,
  );
}

export async function removeService(id) {
  await pushToMeili(
    async () => (await serviceIndex()).deleteDocument(id.toString()),
    `removeService(${id})`,
  );
}

// ── searchHelpers ─────────────────────────────────────────────────────────────

export async function searchHelpers(queryStr, filters = {}, { page = 1, limit = 50 } = {}) {
  const { category = 'all', location = 'all', gender = 'all', maxPrice = 5000 } = filters;

  // Build Meili filter expression
  const filterParts = ['approved = true', 'suspended = false'];
  if (category !== 'all') filterParts.push(`categoryId = "${category}"`);
  if (location !== 'all') {
    // Resolve location name → ID
    const locDoc = await Location.findOne({ name: new RegExp(`^${location}$`, 'i') })
      .select('_id').lean();
    if (locDoc) filterParts.push(`locationId = "${locDoc._id}"`);
  }

  const hi     = await helperIndex();
  const result = await hi.search(queryStr || '', {
    filter:      filterParts.join(' AND '),
    limit:       limit,
    offset:      (page - 1) * limit,
    sort:        ['rating:desc'],
    attributesToRetrieve: ['id', 'name', 'categoryId', 'categoryName', 'locationId', 'locationName', 'rating', 'address', 'gender', 'serviceNames'],
  });

  // Inflate: fetch full helper docs from Mongo by the IDs Meili returned
  const ids = result.hits.map(h => h.id);
  if (!ids.length) return { hits: [], total: result.estimatedTotalHits, driver: 'meili' };

  const helpers = await Helper.find({ _id: { $in: ids } })
    .populate('category', 'name _id')
    .populate('services.serviceId', 'name price')
    .lean();

  const helperMap = helpers.reduce((m, h) => { m[h._id.toString()] = h; return m; }, {});

  // Collect avg ratings
  const feedbacks = await Feedback.aggregate([
    { $match: { helper: { $in: helpers.map(h => h._id) } } },
    { $group: { _id: '$helper', avgRating: { $avg: '$rating' } } },
  ]);
  const ratingMap = feedbacks.reduce((m, f) => { m[f._id.toString()] = f.avgRating.toFixed(1); return m; }, {});

  // Build the same result shape as mongoSearch / getServicesAPI
  const hits = [];
  result.hits.forEach(hit => {
    const helper = helperMap[hit.id];
    if (!helper?.services?.length) return;
    helper.services.forEach(svc => {
      const svcDoc = svc.serviceId;
      if (!svcDoc) return;
      const svcPrice = svc.customPrice ?? svcDoc.price ?? 0;
      if (svcPrice > maxPrice) return;
      if (gender !== 'all' && helper.gender?.toLowerCase() !== gender.toLowerCase()) return;
      hits.push({
        id:           helper._id,
        name:         helper.name,
        availability: helper.availability,
        gender:       helper.gender,
        address:      helper.address,
        rating:       ratingMap[helper._id.toString()] || hit.rating?.toFixed(1) || '4.5',
        service:      svcDoc.name,
        price:        svcPrice,
        categoryName: helper.category?.name,
        categoryId:   helper.category?._id,
      });
    });
  });

  return { hits, total: result.estimatedTotalHits, driver: 'meili' };
}

// ── searchServices ─────────────────────────────────────────────────────────────

export async function searchServices(queryStr, filters = {}, { page = 1, limit = 50 } = {}) {
  const { category = 'all' } = filters;

  const filterParts = ['isActive = true'];
  if (category !== 'all') filterParts.push(`categoryId = "${category}"`);

  const si     = await serviceIndex();
  const result = await si.search(queryStr || '', {
    filter: filterParts.join(' AND '),
    limit:  limit,
    offset: (page - 1) * limit,
  });

  // Inflate from Mongo
  const ids      = result.hits.map(h => h.id);
  const services = ids.length
    ? await Service.find({ _id: { $in: ids } }).populate('category', 'name _id').lean()
    : [];

  return { hits: services, total: result.estimatedTotalHits, driver: 'meili' };
}

// ── ping ──────────────────────────────────────────────────────────────────────

export async function ping() {
  try {
    const health = await client().health();
    return health.status; // 'available'
  } catch (err) {
    throw new Error(`Meili unreachable: ${err.message}`);
  }
}
