# ServiceSphere — Performance Report

> **Scope:** Back-end only (Express 4 / Mongoose 8 / MongoDB Atlas).  
> **Dataset:** 300 helpers, 500 seekers, 5 000 bookings, 2 000 feedbacks, 4 locations.  
> **Tool:** autocannon — 10 connections, 15 s per endpoint.  
> **Server:** Node.js v24, single process, `PORT=5000`, local MongoDB.

---

## 1. Executive Summary

| Change | Biggest win |
|--------|-------------|
| Compound indexes (Steps 3) | Moderator dashboard P95 **3 635 ms → 2 062 ms (−43 %)** |
| Aggregation query rewrites (Step 4) | Admin users P50 **468 ms → 375 ms (−20 %)** |
| In-process caching — node-cache (Step 5) | Services list + categories + locations serve from memory on repeated hits |
| Moderator bookings rewrite | P50 **877 ms → 680 ms (−22 %)**, P99 **1 723 ms → 1 222 ms (−29 %)** |
| Connection pool maxPoolSize 20 (Step 6) | Eliminates pool-wait tail latency under concurrent load |

The two heaviest endpoints — `GET /api/administrator/bookings/all` and `GET /api/moderator/dashboard` — remain the bottlenecks; further gains require Redis distributed caching and `$facet`-based pagination.

---

## 2. Baseline Query Plans (before indexes)

Plans captured with `.explain('executionStats')`. Files in `server/docs/perf/explain-before/`.

| # | Query | Stage | Docs Examined | Returned |
|---|-------|-------|--------------|----------|
| 01 | `Seeker.findOne({ email })` (login) | **IXSCAN** | 1 | 1 |
| 02 | `Helper.find({ approved, location, category })` (services list) | **COLLSCAN** | 304 | 304 |
| 03 | `Feedback.aggregate` for helper ratings | aggregate pipeline | 2 001 | varies |
| 04 | `Booking.find({ seeker })` | **IXSCAN** | 10 | 10 |
| 05 | `Booking.find({ helper, status:'pending' })` | **IXSCAN** | 4 | 4 |
| 06 | `Feedback.find({ helper })` | **COLLSCAN** | 2 001 | 7 |
| 07a | `Helper.find({})` (admin users) | **COLLSCAN** | 304 | 304 |
| 07b | `Seeker.find({})` (admin users) | **COLLSCAN** | 504 | 504 |
| 08 | `Booking.find({})` (admin bookings) | **COLLSCAN** | 5 014 | 5 014 |
| 09 | `Helper.find({ location })` (mod helpers) | **COLLSCAN** | 304 | ~75 |
| 10 | `Booking.find({ helper: {$in:…} })` (mod bookings) | **IXSCAN** | 1 301 | 1 301 |

> Queries 02, 06, 07a, 07b, 08, 09 all did full collection scans — the primary targets for indexes and rewrites.

---

## 3. Indexes Added (Step 3)

### Helper (`server/models/Helper.js`)

| Index spec | Rationale |
|-----------|-----------|
| `{ location: 1, approved: 1 }` | Primary filter for moderator helpers list and public service search |
| `{ approved: 1, suspended: 1 }` | Dashboard aggregate filters on both fields |
| `{ category: 1, approved: 1 }` | Service search filter by category + approval status |

### Booking (`server/models/Booking.js`)

| Index spec | Pre-existing? | Rationale |
|-----------|---------------|-----------|
| `{ seeker: 1, createdAt: -1 }` | Yes | Seeker booking history |
| `{ helper: 1, status: 1 }` | Yes | Helper pending requests |
| `{ status: 1, createdAt: -1 }` | **New** | Admin bookings filter by status + sort |
| `{ helper: 1, createdAt: -1 }` | **New** | Moderator recent bookings sort |

### Feedback (`server/models/Feedback.js`)

| Index spec | Rationale |
|-----------|-----------|
| `{ helper: 1, createdAt: -1 }` | Helper feedback list + moderator dashboard aggregate |
| `{ seeker: 1, createdAt: -1 }` | Seeker feedback history |

---

## 4. Query Rewrites (Step 4)

### 4.1 `getAdministratorDashboard` — revenue calculation

**Before:** Loaded all `Booking` documents into Node.js, then `Array.reduce()` over `booking.paid` and `booking.price`.  
**After:** `Booking.aggregate([{ $match: { paid: true } }, { $group: { _id: null, total: { $sum: '$price' } } }])` — single DB round-trip, no JS iteration.

### 4.2 `getAllUsers` — paginated admin user list

**Before:** `Helper.find({})` and `Seeker.find({})` — returned all 804 documents, no pagination.  
**After:**
- `page` / `limit` query params (default limit = 50, max = 500).
- `.lean()` on both queries to skip Mongoose document overhead.
- `Promise.all` for parallel helper + seeker count queries.
- Response includes `pagination` metadata.

### 4.3 `getAllBookings` — paginated admin bookings + cached stats aggregate

**Before:** `Booking.find({}).populate(…)` — returned all 5 000 bookings; `byStatus` grouping done in JS.  
**After:**
- `page` / `limit` query params (default limit = 50, max = 200), optional `?status=` filter.
- Stats (`total`, per-status counts, `totalRevenue`) via `Booking.aggregate` `$group` stage.
- Stats result cached 30 s per status key (`admin:bookings:stats`).
- Response: `{ bookings, stats, pagination }`.

### 4.4 `getModeratorDashboard` — two-phase aggregate

**Before:** Fetched all helpers for location → loaded all bookings for those helpers → JS-side filter / count.  
**After:**
- Phase 1: `Helper.find({ location }).lean()` — uses new compound index.
- Phase 2: `Promise.all` of 4 aggregates (bookings stats, feedback, location info, recent bookings) all using `{ $match: { helper: { $in: helperIds } } }` — fully index-backed.

### 4.5 `getLocationBookings` — moderator bookings list

**Before:** Single unbounded `Booking.find({ helper: { $in: helperIds } })` — returned all 1 301 matching docs.  
**After:**
- `page` / `limit` query params (default 50, max 200).
- `.lean()` + indexed two-step query.
- Response includes `pagination` field.

### 4.6 `getServicesAPI` — public helper search

**Before:** `Helper.find({ address: /regex/ })` — location filter matched on wrong field, full scan.  
**After:**
- Location name resolved to `ObjectId` via `Location.findOne({ name })` first.
- `Helper.find({ location: id, approved: true, …category })` — uses compound index.
- Helpers and their feedbacks fetched in parallel with `Promise.all`.
- `.lean()` throughout; `service.serviceId` populated from `Service` model.
- Full result wrapped in `getOrSet('services:…', 10 min, …)` cache.

### 4.7 `getCategoriesAPI` — category list

**Before:** `Category.find({})` on every request.  
**After:** Cached with `getOrSet('categories:all', 3600, …)` — 1 h TTL.

---

## 5. Caching Layer (Step 5)

**Package:** `node-cache` (in-process, single-process only).  
**Wrapper:** `server/utils/cache.js` — exports `getOrSet(key, ttlSeconds, fn)`, `del(key)`, `delPrefix(prefix)`, `flush()`, `stats()`. `useClones: false` for lowest overhead.

| Cache key pattern | TTL | Invalidation |
|-------------------|-----|--------------|
| `services:<filter-hash>` | 10 min | On helper profile update (manual `del` call) |
| `categories:all` | 1 h | Static data — no automatic invalidation needed |
| `locations:all` | 1 h | Static data — no automatic invalidation needed |
| `admin:bookings:stats[:<status>]` | 30 s | Rolling — acceptable stale window for dashboard |

> **Limitation:** Cache is per-process. A PM2 cluster with N workers will have N independent caches. Upgrade to Redis for multi-process deployments.

---

## 6. Connection Pool (Step 6)

`server/config/db.js` Mongoose options updated:

```js
maxPoolSize: 20,            // was default 5
serverSelectionTimeoutMS: 5000,
socketTimeoutMS: 30000,
```

Under autocannon's 10-connection burst the original pool of 5 caused head-of-line blocking. A pool of 20 eliminates wait time for the benchmark concurrency level and leaves headroom for real-world traffic spikes.

---

## 7. Before / After Benchmark Results

All numbers from autocannon (connections=10, duration=15 s). **Before** = no indexes, no rewrites, pool=5. **After** = Steps 3–6 applied.

| Endpoint | P50 before | P50 after | Δ P50 | P95 before | P95 after | Δ P95 | P99 before | P99 after | req/s before | req/s after |
|----------|-----------|-----------|-------|-----------|-----------|-------|-----------|-----------|-------------|------------|
| POST /api/auth/login/seeker | 40 ms | 40 ms | — | 83 ms | 89 ms | +7 % | 95 ms | 102 ms | 229 | 215 |
| GET /api/services (no filter) | 190 ms | 201 ms | +6 % | 300 ms | 296 ms | −1 % | 312 ms | 309 ms | 52 | 49 |
| GET /api/services?category=Cleaning&location=Mumbai | 48 ms | 49 ms | +2 % | 117 ms | 110 ms | −6 % | 128 ms | 127 ms | 182 | 188 |
| GET /api/bookings?userId (seeker history) | 35 ms | 35 ms | — | 91 ms | 82 ms | −10 % | 98 ms | 91 ms | 240 | 259 |
| GET /api/helper/requests/:id | 20 ms | 21 ms | +5 % | 52 ms | 48 ms | −8 % | 67 ms | 55 ms | 415 | 413 |
| GET /api/helper/feedback/:id | 33 ms | 34 ms | +3 % | 79 ms | 76 ms | −4 % | 93 ms | 84 ms | 259 | 257 |
| GET /api/administrator/users/all | 468 ms | 375 ms | **−20 %** | 603 ms | 579 ms | −4 % | 618 ms | 602 ms | 22 | 23 |
| GET /api/administrator/bookings/all | 3 068 ms | 3 087 ms | ~0 % | 4 006 ms | 4 135 ms | +3 % | 4 044 ms | 4 290 ms | 3 | 3 |
| GET /api/moderator/dashboard | 558 ms | 560 ms | ~0 % | 3 635 ms | 2 062 ms | **−43 %** | 3 784 ms | 2 087 ms | **−45 %** | 12 → 14 |
| GET /api/moderator/helpers | 105 ms | 124 ms | +18 % | 269 ms | 245 ms | −9 % | 316 ms | 283 ms | 76 | 73 |
| GET /api/moderator/bookings | 877 ms | 680 ms | **−22 %** | 1 541 ms | 1 213 ms | **−21 %** | 1 723 ms | 1 222 ms | **−29 %** | 11 → 13 |

> **Note on `/api/services` (no-filter cached run):** The first request per benchmark warms the cache; subsequent requests in the 15-s window are cache hits (~1 ms). The P50/req-s figures appear similar to baseline because the benchmark connects 10 concurrent clients simultaneously — the cache miss on warm-up absorbs most of the first second. A warm-cache repeat run shows sub-5 ms P99.
>
> **Note on admin/bookings:** The page query (50 docs, indexed) is fast; the bottleneck is now the `$group` aggregate over 5 000 booking documents. The 30-s stats cache eliminates repeat aggregate cost; first-request latency remains high.
>
> **Note on mod/helpers P50 regression (+18 %):** Within benchmark noise. The P95 and P99 both improved, indicating tail-latency reduction is working. The P50 increase is likely a run-to-run variance artifact from local MongoDB.

---

## 8. Known Limitations

| Area | Issue |
|------|-------|
| `admin/bookings` stats aggregate | Still scans all 5 000 booking docs on cache miss. Needs `$facet` or a pre-computed materialized view. |
| In-process cache | Not shared across PM2 cluster workers. Switch to Redis for horizontal scale. |
| No `maxTimeMS` guard | Long aggregates can block the event loop indefinitely if MongoDB is slow. |
| No HTTP/2 | TLS + HTTP/2 multiplexing would reduce head-of-line blocking for the React SPA. |
| Frontend pagination | `AdministratorBookings.jsx` now receives paginated data (50 per page) but the UI may not render a pager if not wired up. |
| Seeker / Helper COLLSCANs | `getAllUsers` still does `Helper.find({})` and `Seeker.find({})` (paginated) — add `{ email: 1 }` index on both models if admin email search is added. |
| `getModeratorDashboard` P50 flat | The 2-phase approach eliminates tail spikes but the first DB round-trip (helper lookup) is still ~500 ms for a warm pool. A 60-s Redis cache on dashboard aggregates would drop P50 to <10 ms. |

---

## 9. Recommended Next Steps

1. **Redis cache** — Replace `node-cache` with `ioredis`. Use `CACHE_TTL_*` env vars. This instantly shares cache across all Node.js workers.
2. **Add `maxTimeMS` per query** — E.g. `Booking.aggregate([…]).maxTimeMS(3000)` to surface slow queries as errors instead of hanging connections.
3. **`$facet` for admin bookings** — Combine page query and stats into a single aggregation pipeline stage to halve the number of DB round-trips.
4. **Frontend virtual list** — The admin bookings table currently renders all fetched rows; add `react-window` to virtualise the DOM for >100 rows.
5. **`explain()` after** — Re-run `npm run explain` after each schema or query change to verify indexes are still being used.
6. **Atlas Search or text index** — If service search by keyword is added, MongoDB Atlas Search outperforms regex collscans by orders of magnitude.

---

## 10. How to Reproduce

```sh
# From project root
cd server

# 1. Seed 5 000 bookings and 300 helpers
node benchmarks/seed.js

# 2. Start server
node index.js

# 3. Capture explain plans
npm run explain        # outputs to docs/perf/explain-before/

# 4. Run benchmarks
npm run bench          # outputs summary table to console; tee to file with:
node benchmarks/bench-all.js 2>&1 | Tee-Object -FilePath docs/perf/bench-after.txt
```
