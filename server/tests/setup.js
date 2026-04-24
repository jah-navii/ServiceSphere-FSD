/**
 * tests/setup.js
 *
 * Global test setup for vitest.
 * Runs once before all test files (via setupFiles in vitest.config.js).
 *
 * Responsibilities:
 *  - Starts an in-memory MongoDB instance (mongodb-memory-server)
 *  - Connects mongoose to that instance
 *  - Resets all collections after each individual test (isolation)
 *  - Disconnects and stops the in-memory server after all tests
 *  - Forces CACHE_DRIVER=memory and SEARCH_DRIVER=mongo so no Redis or
 *    Meilisearch instance is required to run the test suite
 *  - Suppresses console.log noise from the app under test;
 *    console.error is left through so real failures still surface
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { resetCache } from '../utils/cache/index.js';
import { resetSearch } from '../utils/search/index.js';

// ── Noise suppression ──────────────────────────────────────────────────────────
// Keep a reference so we can restore if needed
const _originalLog  = console.log;
const _originalInfo = console.info;
const _originalWarn = console.warn;

console.log  = () => {};
console.info = () => {};
console.warn = () => {};
// console.error intentionally left alone

// ── In-memory MongoDB ──────────────────────────────────────────────────────────
let mongod;

beforeAll(async () => {
  // Force in-memory drivers (env vars already set by vitest.config.js env block,
  // but we reset singletons here in case any module cached them at import time)
  resetCache();
  resetSearch();

  // Start the in-memory server and override the URI so any later
  // mongoose.connect() calls (e.g. inside the app) go to the right place
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;

  await mongoose.connect(uri);
}, 30_000); // allow up to 30 s for the binary download on first run

afterEach(async () => {
  // Wipe all collections so each test starts with a clean slate
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((col) => col.deleteMany({})),
  );

  // Reset cache singleton so TTL counters don't bleed between tests
  resetCache();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();

  // Restore console
  console.log  = _originalLog;
  console.info = _originalInfo;
  console.warn = _originalWarn;
});
