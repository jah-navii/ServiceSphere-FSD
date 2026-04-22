#!/usr/bin/env node
/**
 * benchmarks/bench-all.js
 *
 * Runs all 10 hot-path benchmarks sequentially.
 * Requires the server to be running on localhost:5000 and the DB to be seeded.
 *
 * Usage:  npm run bench
 *   or:   node benchmarks/bench-all.js
 *
 * Each benchmark: connections=10, duration=15s (warm run after a 3s cold hit).
 * Authentication: real JWTs obtained by logging in as seeded users before each
 * timed run. Unauthenticated hits would return 401 in ~2ms and teach nothing.
 */

import '../config/env.js';
import mongoose from 'mongoose';
import autocannon from 'autocannon';
import { env } from '../config/env.js';
import { authHeader } from './helpers/auth.js';

const BASE = 'http://localhost:5000';
const CONNECTIONS = 10;
const DURATION    = 15; // seconds

// ── Single DB connection block: gather all seed-user data we need ─────────────
async function gatherSeedData() {
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  const { default: Seeker   } = await import('../models/Seeker.js');
  const { default: Helper   } = await import('../models/Helper.js');
  const { default: Admin    } = await import('../models/Admin.js');
  const { default: Category } = await import('../models/Category.js');
  const { default: Location } = await import('../models/Location.js');

  const [seeker, helper, mod, admin, cat, loc] = await Promise.all([
    Seeker.findOne({ seeded: true }).select('_id email').lean(),
    Helper.findOne({ seeded: true, approved: true }).select('_id email').lean(),
    Admin.findOne({ seeded: true, role: 'moderator', status: 'active' })
      .select('_id email assignedLocation').lean(),
    Admin.findOne({ seeded: true, role: 'administrator' }).select('_id email').lean(),
    Category.findOne({ name: 'Cleaning' }).lean(),
    Location.findOne({ name: 'Mumbai' }).lean(),
  ]);

  await mongoose.disconnect();

  return {
    seekerId: seeker._id.toString(),  seekerEmail: seeker.email,
    helperId: helper._id.toString(),  helperEmail: helper.email,
    mod,  modEmail: mod.email,
    adminEmail: admin.email,
    catId: cat?._id?.toString(),
    locName: loc?.name ?? 'Mumbai',
  };
}

// ── HTTP login helper (no DB) ─────────────────────────────────────────────────
async function login(path, email, password) {
  const res  = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!body.token) throw new Error(`Login failed (${email}): ${JSON.stringify(body)}`);
  return body.token;
}

// ── Runner ────────────────────────────────────────────────────────────────────
function bench(label, opts) {
  return new Promise((resolve, reject) => {
    const instance = autocannon({ ...opts, connections: CONNECTIONS, duration: DURATION }, (err, result) => {
      if (err) return reject(err);
      resolve({ label, result });
    });
    autocannon.track(instance, { renderProgressBar: false });
  });
}

function p(latency, pct) {
  // autocannon result.latency.p50 / p97_5 / p99
  return latency?.[pct] ?? 'n/a';
}

function summarise({ label, result }) {
  const lat = result.latency;
  console.log(
    `\n  ► ${label}\n` +
    `    P50=${p(lat,'p50')}ms  P95=${p(lat,'p97_5')}ms  P99=${p(lat,'p99')}ms  ` +
    `req/s=${result.requests.average.toFixed(0)}  errors=${result.errors}`
  );
  return {
    label,
    p50:  p(lat, 'p50'),
    p95:  p(lat, 'p97_5'),
    p99:  p(lat, 'p99'),
    rps:  result.requests.average.toFixed(0),
    errors: result.errors,
    '2xx': result['2xx'],
    non2xx: result.non2xx,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n[bench] Fetching seed data from DB (single connection)...');
  const data = await gatherSeedData();
  const { seekerId, helperId, mod, seekerEmail, helperEmail, modEmail, adminEmail, catId, locName } = data;
  console.log(`  seekerId=${seekerId}  helperId=${helperId}  modLocation=${mod.assignedLocation}`);

  console.log('[bench] Logging in as seeded users (HTTP, no DB)...');
  const [seekerToken, helperToken, modToken, adminToken] = await Promise.all([
    login('/api/auth/login/seeker',        seekerEmail, 'Password123!'),
    login('/api/auth/login/helper',        helperEmail, 'Password123!'),
    login('/api/auth/login/moderator',     modEmail,    'Moderator123!'),
    login('/api/auth/login/administrator', adminEmail,  'Admin123!'),
  ]);
  console.log('  Tokens obtained.\n');

  const results = [];

  // ── 1. POST /api/auth/login/seeker ───────────────────────────────────────────
  console.log('[bench] 01 POST /api/auth/login/seeker');
  {
    const body = JSON.stringify({ email: seekerEmail, password: 'Password123!' });
    results.push(summarise(await bench('POST /api/auth/login/seeker', {
      url: `${BASE}/api/auth/login/seeker`,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    })));
  }

  // ── 2. GET /api/services (no filters) ────────────────────────────────────────
  console.log('[bench] 02 GET /api/services');
  results.push(summarise(await bench('GET /api/services (no filter)', {
    url: `${BASE}/api/services`,
    method: 'GET',
  })));

  // ── 3. GET /api/services?category=...&location=... ───────────────────────────
  console.log('[bench] 03 GET /api/services?category=Cleaning&location=Mumbai');
  results.push(summarise(await bench('GET /api/services?category=Cleaning&location=Mumbai', {
    url: `${BASE}/api/services?category=${catId}&location=${locName}`,
    method: 'GET',
  })));

  // ── 4. GET /api/bookings?userId= (seeker history) ────────────────────────────
  console.log('[bench] 04 GET /api/bookings?userId=');
  results.push(summarise(await bench('GET /api/bookings?userId (seeker history)', {
    url: `${BASE}/api/bookings?userId=${seekerId}`,
    method: 'GET',
    headers: authHeader(seekerToken),
  })));

  // ── 5. GET /api/helper/requests/:id (helper pending queue) ───────────────────
  console.log('[bench] 05 GET /api/helper/requests/:helperId');
  results.push(summarise(await bench('GET /api/helper/requests/:id', {
    url: `${BASE}/api/helper/requests/${helperId}`,
    method: 'GET',
    headers: authHeader(helperToken),
  })));

  // ── 6. GET /api/helper/feedback/:id ──────────────────────────────────────────
  console.log('[bench] 06 GET /api/helper/feedback/:helperId');
  results.push(summarise(await bench('GET /api/helper/feedback/:id', {
    url: `${BASE}/api/helper/feedback/${helperId}`,
    method: 'GET',
    headers: authHeader(helperToken),
  })));

  // ── 7. GET /api/administrator/users/all ──────────────────────────────────────
  console.log('[bench] 07 GET /api/administrator/users/all');
  results.push(summarise(await bench('GET /api/administrator/users/all', {
    url: `${BASE}/api/administrator/users/all`,
    method: 'GET',
    headers: authHeader(adminToken),
  })));

  // ── 8. GET /api/administrator/bookings/all ────────────────────────────────────
  console.log('[bench] 08 GET /api/administrator/bookings/all');
  results.push(summarise(await bench('GET /api/administrator/bookings/all', {
    url: `${BASE}/api/administrator/bookings/all`,
    method: 'GET',
    headers: authHeader(adminToken),
  })));

  // ── 9. GET /api/moderator/dashboard ──────────────────────────────────────────
  console.log('[bench] 09 GET /api/moderator/dashboard');
  results.push(summarise(await bench('GET /api/moderator/dashboard', {
    url: `${BASE}/api/moderator/dashboard`,
    method: 'GET',
    headers: authHeader(modToken),
  })));

  // ── 10. GET /api/moderator/helpers ───────────────────────────────────────────
  console.log('[bench] 10 GET /api/moderator/helpers');
  results.push(summarise(await bench('GET /api/moderator/helpers', {
    url: `${BASE}/api/moderator/helpers`,
    method: 'GET',
    headers: authHeader(modToken),
  })));

  // ── 11. GET /api/moderator/bookings ──────────────────────────────────────────
  console.log('[bench] 11 GET /api/moderator/bookings');
  results.push(summarise(await bench('GET /api/moderator/bookings', {
    url: `${BASE}/api/moderator/bookings`,
    method: 'GET',
    headers: authHeader(modToken),
  })));

  // ── Summary table ─────────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('BASELINE SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Endpoint'.padEnd(52) + 'P50'.padStart(6) + 'P95'.padStart(8) + 'P99'.padStart(8) + 'req/s'.padStart(8));
  console.log('─'.repeat(82));
  for (const r of results) {
    console.log(
      r.label.substring(0, 51).padEnd(52) +
      String(r.p50 + 'ms').padStart(6) +
      String(r.p95 + 'ms').padStart(8) +
      String(r.p99 + 'ms').padStart(8) +
      String(r.rps).padStart(8)
    );
  }
  console.log('═'.repeat(82));
  console.log('\n[bench] Done. Copy the table above into docs/PERF.md as the baseline.\n');
}

main().catch(err => {
  console.error('[bench] Fatal:', err.message);
  process.exit(1);
});
