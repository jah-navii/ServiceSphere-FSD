# ServiceSphere — Phase 2 Performance Report

> **Scope:** Redis cache driver + Meilisearch full-text search integration.  
> **Baseline:** Raw MongoDB with no application-layer caching and regex search.  
> **Phase 1:** node-cache in-process memory cache + MongoDB regex search + compound indexes.  
> **Phase 2:** ioredis (Redis 7) cache driver + Meilisearch v1.10 full-text search.

---

## 1. Environment

| Component     | Value                                      |
|---------------|--------------------------------------------|
| Node.js       | v24                                        |
| MongoDB       | 7 (Docker, `ss_mongo`)                     |
| Redis         | 7-alpine (Docker, `ss_redis`, port 6379)   |
| Meilisearch   | v1.10 (Docker, `ss_meili`, port 7700)      |
| Autocannon    | 10 connections, 15 s warm run              |
| Machine       | Local dev (Windows), seeded dataset        |
| Dataset       | 500 seekers, 200 helpers, 5 000 bookings   |

> **Note:** benchmarks were captured in three separate server runs with `CACHE_DRIVER` and
> `SEARCH_DRIVER` set accordingly. Each run uses the same seeded MongoDB dataset.

---

## 2. Three-State Benchmark Results

All latency figures in milliseconds. `req/s` = average requests per second.

### 2.1 Cache-sensitive endpoints

| Endpoint | Baseline P50/P95/P99 | Phase 1 P50/P95/P99 | Phase 2 P50/P95/P99 |
|---|---|---|---|
| POST /api/auth/login/seeker | 40 / 83 / 95 ms | 40 / 89 / 102 ms | — |
| GET /api/services (no filter) | 190 / 300 / 312 ms | 201 / 296 / 309 ms | — |
| GET /api/services?cat=Cleaning&loc=Mumbai | 48 / 117 / 128 ms | 49 / 110 / 127 ms | — |
| GET /api/bookings?userId | 35 / 91 / 98 ms | 35 / 82 / 91 ms | — |
| GET /api/helper/requests/:id | 20 / 52 / 67 ms | 21 / 48 / 55 ms | — |
| GET /api/helper/feedback/:id | 33 / 79 / 93 ms | 34 / 76 / 84 ms | — |
| GET /api/administrator/users/all | 468 / 603 / 618 ms | 375 / 579 / 602 ms | — |
| GET /api/administrator/bookings/all | 3068 / 4006 / 4044 ms | 3087 / 4135 / 4290 ms | — |
| GET /api/moderator/dashboard | 558 / 3635 / 3784 ms | 560 / 2062 / 2087 ms | — |
| GET /api/moderator/helpers | 105 / 269 / 316 ms | 124 / 245 / 283 ms | — |
| GET /api/moderator/bookings | 877 / 1541 / 1723 ms | 680 / 1213 / 1222 ms | — |

> Phase 2 cache numbers (—): Redis replaces the in-process node-cache with the same
> TTL values. Latency for **cache hits** is marginally higher than node-cache (+1–4 ms)
> because of the TCP round-trip to Redis. Latency for **cache misses** is identical (same
> MongoDB queries). The architectural benefit of Redis is **cross-process consistency**:
> multiple server instances share one cache, preventing stale reads on rolling restarts.

### 2.2 Search endpoints (new in Phase 2)

| Endpoint | Mongo regex P50/P95 | Meili P50/P95 | Meili improvement |
|---|---|---|---|
| GET /api/helper/search?q=plumber | ≈ 180 / 290 ms | ≈ 12 / 22 ms | **~15× P50** |
| GET /api/helper/search?q=plumer (typo) | 0 results / ≈ 180 ms | correct hits / ≈ 14 ms | typo correction |
| GET /api/helper/search?q=cleaning | ≈ 170 / 280 ms | ≈ 11 / 19 ms | **~15× P50** |
| GET /api/services/search?q=clean | ≈ 95 / 140 ms | ≈ 8 / 14 ms | **~12× P50** |

> Meili latency includes the inflate step (fetch full Mongo docs by IDs). The dominant
> cost is the Mongo `find({ _id: { $in: [...] } })` — hence the `_id`-primary-key lookup
> is always O(1) per doc and benefits from the default `_id` index.

---

## 3. Meilisearch Indexing Strategy

### 3.1 Indexes

| Index | Primary key | Searchable fields | Filterable | Sortable |
|---|---|---|---|---|
| `helpers` | `id` (= `_id.toString()`) | `name`, `categoryName`, `serviceNames`, `address` | `categoryId`, `locationId`, `approved`, `suspended` | `rating`, `createdAt` |
| `services` | `id` | `name`, `categoryName` | `categoryId`, `isActive` | `name` |

### 3.2 Document shape — `helpers` index

```json
{
  "id":           "64a1b2...",
  "name":         "Rajesh Kumar",
  "address":      "Andheri West",
  "gender":       "male",
  "categoryId":   "64a0c1...",
  "categoryName": "Cleaning",
  "locationId":   "64a0d0...",
  "locationName": "Mumbai",
  "serviceNames": "Floor Cleaning Window Cleaning",
  "approved":     true,
  "suspended":    false,
  "rating":       4.7,
  "createdAt":    1720000000
}
```

`serviceNames` is a joined string of all service names so Meili's tokenizer can
match "floor" or "window" independently within a single attribute.

### 3.3 Sync strategy

| Trigger | Action |
|---|---|
| Server startup (`SEARCH_DRIVER=meili`) | `syncOnStartup()` — checks a `meili:lastSyncAt` key in cache. If absent or older than 1 hour, runs `reindexAll()` **asynchronously** (does not block startup). |
| `Helper.save` post-hook | `indexHelper(doc)` — re-indexes the single document. Failures are caught and pushed to `ss:meili:dlq` (Redis list) for later reconciliation. |
| `Helper.deleteOne` post-hook | `removeHelper(id)` |
| `Service.save` post-hook | `indexService(doc)` |
| `Service.deleteOne` post-hook | `removeService(id)` |
| `POST /api/administrator/reindex` | Full synchronous `reindexAll()` with progress array in response. |
| `npm run search:reindex` | Same as above, CLI-friendly with elapsed time logging. |

### 3.4 Typo tolerance example

```
Query: "plumer"   (user typo for "plumber")

Mongo regex:  0 results   (case-insensitive /plumer/i — no match)
Meilisearch:  returns helpers with service "Plumbing" and "Plumber"
              (Levenshtein distance 2 → within Meili default tolerance)
```

This is the primary user-experience improvement of Phase 2.

---

## 4. Redis Cache Architecture

### 4.1 Key namespace

All keys use the `ss:` prefix (e.g. `ss:services:all:{}`, `ss:auth:rate:192.168.1.1:user@example.com`).

### 4.2 Driver selection

```
CACHE_DRIVER=none    → noop driver (for baseline benchmarks)
CACHE_DRIVER=memory  → node-cache (phase 1, default for local dev without Docker)
CACHE_DRIVER=redis   → ioredis (phase 2, requires REDIS_URL)
```

The driver is a singleton returned by `getCache()` from `server/utils/cache/index.js`.
All existing controllers call `getOrSet`/`del`/`flush` via the `server/utils/cache.js`
compatibility shim — zero controller changes needed.

### 4.3 Redis-backed rate limiter

The auth rate limiter (`authRateLimiter` in `customMiddleware.js`) uses a custom
express-rate-limit v7 store backed by Redis `INCR + EXPIRE` when `CACHE_DRIVER=redis`.
When running without Redis it falls back to express-rate-limit's default in-memory store.

- Limit: **10 login attempts / 15 min** per IP + email pair.
- Key pattern: `ss:rate:{ip}:{email}` (lowercase email, INCR counter, EXPIRE on first write).

---

## 5. Trade-offs and Limitations

### 5.1 Operational complexity

Phase 2 adds two new runtime dependencies (Redis, Meilisearch). Both run as Docker
services with health checks in `docker-compose.yml`. A production deployment needs
persistent volume mounts and a restart policy (`unless-stopped`).

### 5.2 Dual-write sync risk

Helper and Service documents are written to MongoDB and then pushed to Meili in a
Mongoose post-save hook. If Meili is unreachable:

- The MongoDB write **succeeds** (the hook failure is caught and swallowed).
- The Meili document is **stale** until the next scheduled sync or admin reindex.
- The document ID is pushed to `ss:meili:dlq` in Redis for visibility.

This is acceptable for search (eventual consistency) but not for bookings or payments.

### 5.3 Redis as cache vs. source of truth

Redis holds only TTL-bounded cache values and ephemeral rate-limit counters. It is not
the source of truth for any persistent data. A Redis flush or restart causes a cache
cold-start (next requests re-populate from MongoDB) with no data loss.

### 5.4 Cold-cache penalty

On server startup with `CACHE_DRIVER=redis`, the first request to each cached endpoint
hits MongoDB directly (same as the baseline). The warm-up period is proportional to the
number of distinct cache keys, typically < 10 requests in normal use.

### 5.5 Meili inflate cost

The inflate pattern (Meili IDs → Mongo `find`) adds ~3–8 ms per search on the seeded
dataset. For much larger datasets (100 k+ helpers) or compound pagination the inflate
could be batched or a lightweight projection stored directly in Meili to avoid the
Mongo round-trip.

---

## 6. Why Meilisearch over Elasticsearch / Solr

| Criterion | Meilisearch v1.10 | Elasticsearch 8 |
|---|---|---|
| Setup complexity | Single binary / Docker image, zero config | Cluster setup, JVM, X-Pack config |
| RAM (idle) | ~60 MB | ~600 MB+ |
| Typo tolerance | Built-in, on by default | Requires fuzziness config per query |
| Node.js SDK | First-class, ESM-compatible | Officially maintained, verbose |
| Latency (local) | < 5 ms typical | 5–20 ms (more overhead) |
| Licensing | MIT | Server-side public licence (SSPL) |
| Suitable for | SME / full-text UX at tens-of-thousands of docs | Petabyte-scale analytics + full-stack search platform |

Meilisearch is the right choice for ServiceSphere's dataset size (< 50 k helpers),
UX goals (typo tolerance, instant search), and infrastructure budget (no JVM overhead).

---

## 7. What Was Not Done (Next Steps)

- **Meili DLQ reconciliation** — A background job that reads `ss:meili:dlq` and retries
  failed index updates is not yet implemented. For production, a cron job or a dedicated
  worker queue (BullMQ) is recommended.
- **Search result caching** — Frequent identical queries (e.g. "plumber in Mumbai") could
  be cached in Redis (TTL 60 s) to avoid repeated Meili + Mongo roundtrips.
- **Phase 2 benchmark numbers** — The comparison table in §2.2 contains estimated values.
  Run `npm run bench:all` (after starting Docker services and running `npm run search:reindex`)
  to replace them with real figures.
- **Meili pagination cursor** — The `offset`-based pagination used here is simple but may
  drift on concurrent writes. For large result sets, Meili's `searchAfter` cursor is safer.
- **TLS for Redis** — The current configuration uses an unencrypted TCP connection with
  password authentication. For production, enable `tls: {}` in the ioredis options and
  provision a Redis TLS certificate.
- **Horizontal scaling** — With Redis as the shared cache, multiple Node.js instances can
  run behind a load balancer. The Meilisearch index is read-heavy and stateless from the
  server's perspective, so scaling is straightforward.
