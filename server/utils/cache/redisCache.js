/**
 * utils/cache/redisCache.js
 *
 * ioredis-backed cache driver.
 * Implements the same interface as memoryCache.js so controllers are agnostic.
 *
 * Key design decisions:
 *  - All keys are prefixed "ss:" to namespace the Redis DB.
 *  - SETEX (single round-trip) instead of SET + EXPIRE.
 *  - SCAN + DEL (never KEYS) for prefix deletion.
 *  - lazyConnect: true — the app starts even if Redis is temporarily down.
 *  - Exponential back-off retry capped at 30 s.
 *  - All errors are caught and logged; a cache miss is returned on failure so
 *    the application degrades gracefully rather than crashing.
 */

import Redis from 'ioredis';

const NS = 'ss:'; // key namespace

let _hits   = 0;
let _misses = 0;

/**
 * Create and return a Redis cache driver bound to `redisUrl`.
 * Call once at startup via cache/index.js.
 *
 * @param {string} redisUrl  ioredis-compatible connection URL
 * @returns {object}         Cache driver
 */
export function createRedisDriver(redisUrl) {
  const client = new Redis(redisUrl, {
    lazyConnect:          true,
    maxRetriesPerRequest: 3,
    enableReadyCheck:     true,
    retryStrategy(times) {
      // 1 s, 2 s, 4 s … capped at 30 s
      return Math.min(1000 * 2 ** (times - 1), 30_000);
    },
  });

  client.on('error',   (err) => console.error('[Redis] error:', err.message));
  client.on('connect', ()    => console.info('[Redis] connected'));
  client.on('ready',   ()    => console.info('[Redis] ready'));

  // Kick off the connection without blocking startup
  client.connect().catch(() => {});

  // ── Interface ────────────────────────────────────────────────────────────────

  async function get(key) {
    try {
      const raw = await client.get(NS + key);
      if (raw === null) { _misses++; return null; }
      _hits++;
      return JSON.parse(raw);
    } catch (err) {
      console.error('[Redis] GET error:', err.message);
      _misses++;
      return null;
    }
  }

  async function set(key, value, ttlSeconds) {
    try {
      // SETEX = SET + EX in a single command
      await client.setex(NS + key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      console.error('[Redis] SETEX error:', err.message);
    }
  }

  async function del(key) {
    try { await client.del(NS + key); } catch (err) {
      console.error('[Redis] DEL error:', err.message);
    }
  }

  /**
   * Delete all keys whose name starts with `prefix`.
   * Uses SCAN to avoid blocking the server (unlike KEYS).
   */
  async function delByPrefix(prefix) {
    try {
      let cursor = '0';
      do {
        const [next, keys] = await client.scan(
          cursor, 'MATCH', NS + prefix + '*', 'COUNT', '100',
        );
        cursor = next;
        if (keys.length) await client.del(...keys);
      } while (cursor !== '0');
    } catch (err) {
      console.error('[Redis] SCAN/DEL error:', err.message);
    }
  }

  /**
   * Atomic increment.  Sets TTL on first increment so the key auto-expires.
   * @returns {Promise<number>} New value
   */
  async function incr(key, ttlSeconds) {
    try {
      const val = await client.incr(NS + key);
      if (val === 1) await client.expire(NS + key, ttlSeconds);
      return val;
    } catch (err) {
      console.error('[Redis] INCR error:', err.message);
      return 0;
    }
  }

  async function flush() {
    try { await client.flushdb(); _hits = 0; _misses = 0; } catch (err) {
      console.error('[Redis] FLUSHDB error:', err.message);
    }
  }

  function stats() {
    const total = _hits + _misses;
    return {
      driver:  'redis',
      status:  client.status,   // 'ready' | 'connecting' | 'reconnecting' | 'end'
      hits:    _hits,
      misses:  _misses,
      hitRate: total ? Number((_hits / total).toFixed(3)) : 0,
    };
  }

  async function ping() {
    try { return await client.ping(); } catch { return null; }
  }

  return { get, set, del, delByPrefix, incr, flush, stats, ping, _client: client };
}
