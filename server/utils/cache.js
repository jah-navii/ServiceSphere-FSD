/**
 * utils/cache.js — backward-compatibility shim
 *
 * All existing controllers import { getOrSet, del, delPrefix, flush, stats }
 * from this file.  This shim re-implements those helpers on top of the new
 * driver-pattern cache (utils/cache/index.js) so zero controller code changes
 * are needed.
 *
 * New code should import getCache() directly from utils/cache/index.js.
 */

export { getCache, resetCache } from './cache/index.js';
import { getCache } from './cache/index.js';

/**
 * Return cached value or call `fn` to produce + cache it.
 * @param {string}   key  Cache key
 * @param {number}   ttl  Seconds until expiry
 * @param {Function} fn   Async factory — called only on miss
 */
export async function getOrSet(key, ttl, fn) {
  const cache = getCache();
  const hit   = await cache.get(key);
  if (hit !== null) return hit;
  const value = await fn();
  await cache.set(key, value, ttl);
  return value;
}

/** Invalidate a single key. */
export async function del(key) {
  return getCache().del(key);
}

/** Invalidate all keys whose name starts with `prefix`. */
export async function delPrefix(prefix) {
  return getCache().delByPrefix(prefix);
}

/** Wipe entire cache (tests / admin reset). */
export async function flush() {
  return getCache().flush();
}

/** Expose stats for health-check / admin endpoints. */
export function stats() {
  return getCache().stats();
}
