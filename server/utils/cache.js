/**
 * utils/cache.js
 *
 * Thin wrapper around node-cache providing a typed, self-documenting TTL cache.
 * A single shared instance is used across the process — safe for single-process
 * Node deployments.  For multi-process / clustered deployments swap this for Redis.
 *
 * Usage:
 *   import { getOrSet, del, flush } from '../utils/cache.js';
 *
 *   const data = await getOrSet('my-key', 60, () => fetchExpensiveThing());
 */

import NodeCache from 'node-cache';

// Check period = 120s (background TTL reaper).  stdTTL = 0 means "no default TTL".
const _cache = new NodeCache({ stdTTL: 0, checkperiod: 120, useClones: false });

/**
 * Return cached value for `key`, or call `fn` to produce + cache it.
 *
 * @param {string}   key    Cache key
 * @param {number}   ttl    Seconds until expiry
 * @param {Function} fn     Async factory — called only on a cache miss
 * @returns {Promise<any>}
 */
export async function getOrSet(key, ttl, fn) {
  const hit = _cache.get(key);
  if (hit !== undefined) return hit;
  const value = await fn();
  _cache.set(key, value, ttl);
  return value;
}

/** Invalidate a single key. */
export function del(key) {
  _cache.del(key);
}

/** Invalidate all keys matching a prefix. */
export function delPrefix(prefix) {
  const keys = _cache.keys().filter(k => k.startsWith(prefix));
  _cache.del(keys);
}

/** Wipe entire cache (use in tests / admin reset). */
export function flush() {
  _cache.flushAll();
}

/** Expose stats for health-check / admin endpoints. */
export function stats() {
  return _cache.getStats();
}
