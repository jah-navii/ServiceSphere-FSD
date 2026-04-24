/**
 * utils/cache/memoryCache.js
 *
 * In-process TTL cache backed by node-cache.
 * Implements the standard cache driver interface.
 * All public methods return Promises for API symmetry with redisCache.js.
 */

import NodeCache from 'node-cache';

const _cache = new NodeCache({ stdTTL: 0, checkperiod: 120, useClones: false });

let _hits   = 0;
let _misses = 0;

/** @returns {Promise<any|null>} Cached value or null on miss */
async function get(key) {
  const v = _cache.get(key);
  if (v !== undefined) { _hits++; return v; }
  _misses++;
  return null;
}

/** @returns {Promise<void>} */
async function set(key, value, ttlSeconds) {
  _cache.set(key, value, ttlSeconds);
}

/** @returns {Promise<void>} */
async function del(key) {
  _cache.del(key);
}

/** Delete all keys that start with `prefix`. @returns {Promise<void>} */
async function delByPrefix(prefix) {
  const keys = _cache.keys().filter(k => k.startsWith(prefix));
  if (keys.length) _cache.del(keys);
}

/**
 * Increment a counter key.  If it doesn't exist, initialise at 1 and set TTL.
 * @returns {Promise<number>} New counter value
 */
async function incr(key, ttlSeconds) {
  const current = (_cache.get(key) ?? 0);
  const next = current + 1;
  _cache.set(key, next, ttlSeconds);
  return next;
}

/** Wipe entire cache (tests / admin reset). */
async function flush() {
  _cache.flushAll();
  _hits = 0;
  _misses = 0;
}

/** Stats for health-check / admin endpoints. */
function stats() {
  const total = _hits + _misses;
  return {
    driver:  'memory',
    status:  'ready',
    hits:    _hits,
    misses:  _misses,
    hitRate: total ? Number((_hits / total).toFixed(3)) : 0,
    keys:    _cache.keys().length,
  };
}

/** Noop — memory is always reachable. */
async function ping() {
  return 'PONG';
}

export const memoryDriver = { get, set, del, delByPrefix, incr, flush, stats, ping };
