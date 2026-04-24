/**
 * tests/unit/utils/cache.test.js
 *
 * Tests for the cache driver layer:
 *   - Memory driver (memoryCache.js) behaviour
 *   - Driver factory (cache/index.js) picks the right backend
 */

import { vi } from 'vitest';
import { resetCache, getCache } from '../../../utils/cache/index.js';
import { memoryDriver }         from '../../../utils/cache/memoryCache.js';

// Each test gets a fresh driver singleton
beforeEach(() => resetCache());
afterEach(()  => resetCache());

// ── Memory driver — basic operations ──────────────────────────────────────────

describe('memory driver — set / get / del', () => {
  it('returns null for a key that has never been set', async () => {
    await expect(memoryDriver.get('missing')).resolves.toBeNull();
  });

  it('stores and retrieves a value', async () => {
    await memoryDriver.set('foo', { bar: 1 }, 60);
    const val = await memoryDriver.get('foo');
    expect(val).toEqual({ bar: 1 });
  });

  it('returns null after the key is deleted', async () => {
    await memoryDriver.set('toDelete', 'data', 60);
    await memoryDriver.del('toDelete');
    await expect(memoryDriver.get('toDelete')).resolves.toBeNull();
  });

  it('overwrites an existing key on set', async () => {
    await memoryDriver.set('k', 'first',  60);
    await memoryDriver.set('k', 'second', 60);
    await expect(memoryDriver.get('k')).resolves.toBe('second');
  });
});

// ── Memory driver — TTL expiry ────────────────────────────────────────────────

describe('memory driver — TTL expiry', () => {
  it('returns null after the TTL has elapsed (fake timers)', async () => {
    vi.useFakeTimers();

    // node-cache works in real time; to test TTL we need to fast-forward
    // the internal timer. Set a 1-second TTL.
    await memoryDriver.set('ephemeral', 'value', 1);

    // Value present before TTL
    await expect(memoryDriver.get('ephemeral')).resolves.toBe('value');

    // Advance time past the TTL
    vi.advanceTimersByTime(1500);

    // node-cache uses setInterval for cleanup; trigger it
    vi.runAllTimers();

    // After the checkperiod (node-cache default = 120s, but we can call
    // flushExpired indirectly by checking the raw cache).
    // Because node-cache's checkperiod timer fires asynchronously we
    // verify expiry via the raw node-cache API instead.
    // This test documents known behaviour — the key expires when accessed
    // past its TTL even if the cleanup loop hasn't run yet.
    // node-cache evaluates TTL on get(), so this should return undefined → null.
    await expect(memoryDriver.get('ephemeral')).resolves.toBeNull();

    vi.useRealTimers();
  });
});

// ── Memory driver — prefix deletion ──────────────────────────────────────────

describe('memory driver — delByPrefix', () => {
  it('deletes only keys that match the prefix', async () => {
    await memoryDriver.set('user:1', 'A', 60);
    await memoryDriver.set('user:2', 'B', 60);
    await memoryDriver.set('post:1', 'C', 60);

    await memoryDriver.delByPrefix('user:');

    await expect(memoryDriver.get('user:1')).resolves.toBeNull();
    await expect(memoryDriver.get('user:2')).resolves.toBeNull();
    await expect(memoryDriver.get('post:1')).resolves.toBe('C');
  });

  it('is a no-op when no keys match the prefix', async () => {
    await memoryDriver.set('other:1', 'X', 60);
    await expect(memoryDriver.delByPrefix('nonexistent:')).resolves.toBeUndefined();
    await expect(memoryDriver.get('other:1')).resolves.toBe('X');
  });
});

// ── Memory driver — stats ─────────────────────────────────────────────────────

describe('memory driver — stats()', () => {
  it('reports driver name as "memory"', () => {
    expect(memoryDriver.stats().driver).toBe('memory');
  });

  it('increments hits and misses correctly', async () => {
    // Reset internal counters by creating a fresh import-level state
    // (node-cache module-level counters persist in the same process —
    // so we just verify the shape and direction of the values)
    const before = memoryDriver.stats();

    await memoryDriver.set('statKey', 'v', 60);
    await memoryDriver.get('statKey');   // hit
    await memoryDriver.get('statKey');   // hit
    await memoryDriver.get('noKey');     // miss

    const after = memoryDriver.stats();
    expect(after.hits).toBeGreaterThan(before.hits);
    expect(after.misses).toBeGreaterThan(before.misses);
  });

  it('hitRate is a number between 0 and 1', () => {
    const { hitRate } = memoryDriver.stats();
    expect(hitRate).toBeGreaterThanOrEqual(0);
    expect(hitRate).toBeLessThanOrEqual(1);
  });
});

// ── Driver factory — CACHE_DRIVER env var ─────────────────────────────────────

describe('getCache() driver factory', () => {
  it('returns the memory driver when CACHE_DRIVER=memory', () => {
    process.env.CACHE_DRIVER = 'memory';
    const driver = getCache();
    expect(driver.stats().driver).toBe('memory');
  });

  it('returns the none (no-op) driver when CACHE_DRIVER=none', () => {
    resetCache();
    process.env.CACHE_DRIVER = 'none';
    const driver = getCache();
    expect(driver.stats().driver).toBe('none');
    resetCache();
    process.env.CACHE_DRIVER = 'memory';
  });

  it('falls back to memory when CACHE_DRIVER=redis but REDIS_URL is missing', () => {
    resetCache();
    const saved = process.env.REDIS_URL;
    delete process.env.REDIS_URL;
    process.env.CACHE_DRIVER = 'redis';

    const driver = getCache();
    expect(driver.stats().driver).toBe('memory');

    process.env.REDIS_URL    = saved;
    process.env.CACHE_DRIVER = 'memory';
    resetCache();
  });

  it('returns the same singleton on repeated calls (no re-creation)', () => {
    process.env.CACHE_DRIVER = 'memory';
    const a = getCache();
    const b = getCache();
    expect(a).toBe(b);
  });
});
