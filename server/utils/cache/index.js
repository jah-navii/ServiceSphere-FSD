/**
 * utils/cache/index.js
 *
 * Driver factory — returns the correct cache backend based on the CACHE_DRIVER
 * environment variable.
 *
 *   CACHE_DRIVER=memory  (default) → node-cache (in-process, no deps)
 *   CACHE_DRIVER=redis             → ioredis (requires REDIS_URL)
 *   CACHE_DRIVER=none              → no-op driver (bypass all caching — for benchmarks)
 *
 * The driver singleton is created once on first call to getCache() and reused
 * for the lifetime of the process. All controllers and middleware call getCache()
 * so swapping the backend requires only an env-var change + server restart.
 */

import { memoryDriver }     from './memoryCache.js';
import { createRedisDriver } from './redisCache.js';

let _driver = null;

/** No-op driver used when CACHE_DRIVER=none (baseline benchmarks). */
const noneDriver = {
  get:         async ()  => null,
  set:         async ()  => {},
  del:         async ()  => {},
  delByPrefix: async ()  => {},
  incr:        async ()  => 0,
  flush:       async ()  => {},
  stats:       ()        => ({ driver: 'none', status: 'disabled', hits: 0, misses: 0, hitRate: 0 }),
  ping:        async ()  => 'PONG',
};

/**
 * Return the singleton cache driver.
 * @returns {{ get, set, del, delByPrefix, incr, flush, stats, ping }}
 */
export function getCache() {
  if (_driver) return _driver;

  const driver = (process.env.CACHE_DRIVER ?? 'memory').toLowerCase();

  if (driver === 'none') {
    _driver = noneDriver;
    return _driver;
  }

  if (driver === 'redis') {
    const url = process.env.REDIS_URL;
    if (!url) {
      console.warn(
        '[cache] CACHE_DRIVER=redis but REDIS_URL is not set — falling back to memory cache.',
      );
      _driver = memoryDriver;
    } else {
      _driver = createRedisDriver(url);
    }
    return _driver;
  }

  // Default: memory
  _driver = memoryDriver;
  return _driver;
}

/** Reset the driver singleton (used in tests / bench runner between states). */
export function resetCache() {
  _driver = null;
}
