#!/usr/bin/env node
/**
 * benchmarks/bench-runner.js
 *
 * Three-state benchmark runner. Runs bench-all.js three times with different
 * environment variable configurations:
 *
 *   State 0 — Baseline:  CACHE_DRIVER=none  SEARCH_DRIVER=mongo
 *   State 1 — Phase 1:   CACHE_DRIVER=memory SEARCH_DRIVER=mongo
 *   State 2 — Phase 2:   CACHE_DRIVER=redis  SEARCH_DRIVER=meili
 *
 * Each state:
 *   1. Starts the Express server as a child process with the correct env vars.
 *   2. Waits for it to be ready (polls /api/health).
 *   3. Runs bench-all.js against it.
 *   4. Saves JSON results to docs/perf/bench-{state}.json.
 *   5. Kills the server.
 *
 * The final comparison table is printed to stdout and saved to docs/perf/bench-comparison.txt.
 *
 * Usage:
 *   npm run bench:all
 * or:
 *   node benchmarks/bench-runner.js [--state baseline|phase1|phase2]
 *
 * Requirements:
 *   - MongoDB must be running and seeded (npm run seed).
 *   - Redis must be running for the phase 2 state (docker compose up -d ss_redis).
 *   - Meilisearch must be running and indexed for phase 2 (docker compose up -d ss_meili, then npm run search:reindex).
 *   - server/.env must contain valid MONGO_URI, REDIS_URL, MEILI_HOST, MEILI_MASTER_KEY.
 */

import '../config/env.js';
import { spawn, exec }   from 'child_process';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { existsSync }    from 'fs';
import path              from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(__dirname, '..');
const DOCS_DIR   = path.resolve(SERVER_DIR, '..', 'docs', 'perf');
const BASE        = 'http://localhost:5000';
const SERVER_READY_TIMEOUT = 30_000; // ms
const SERVER_PORT = 5000;

// ── State definitions ─────────────────────────────────────────────────────────

const STATES = [
  {
    id:    'baseline',
    label: 'Baseline (no cache, mongo search)',
    env:   { CACHE_DRIVER: 'none',   SEARCH_DRIVER: 'mongo' },
  },
  {
    id:    'phase1',
    label: 'Phase 1 (node-cache, mongo search)',
    env:   { CACHE_DRIVER: 'memory', SEARCH_DRIVER: 'mongo' },
  },
  {
    id:    'phase2',
    label: 'Phase 2 (Redis cache, Meili search)',
    env:   { CACHE_DRIVER: 'redis',  SEARCH_DRIVER: 'meili' },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(timeoutMs = SERVER_READY_TIMEOUT) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok || res.status === 503) return; // 503 = health up but sub-service down
    } catch (_) { /* not ready yet */ }
    await sleep(500);
  }
  throw new Error(`Server did not become ready within ${timeoutMs / 1000}s`);
}

function startServer(extraEnv) {
  const env = { ...process.env, ...extraEnv };
  const child = spawn('node', ['index.js'], {
    cwd:   SERVER_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  return child;
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  // Give it 5s to exit cleanly
  await new Promise(resolve => {
    const t = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 5000);
    child.once('exit', () => { clearTimeout(t); resolve(); });
  });
}

// ── Single-state benchmark ────────────────────────────────────────────────────

async function runState(state) {
  console.log(`\n${'═'.repeat(72)}`);
  console.log(`  BENCH STATE: ${state.label}`);
  console.log(`  env: ${JSON.stringify(state.env)}`);
  console.log(`${'═'.repeat(72)}\n`);

  let server;
  try {
    console.log('[runner] Starting server…');
    server = startServer(state.env);

    await waitForServer();
    console.log('[runner] Server ready. Starting bench-all.js…\n');

    // Run bench-all.js as a child process inheriting our env (same state)
    const results = await new Promise((resolve, reject) => {
      const benchEnv = { ...process.env, ...state.env, BENCH_JSON_OUTPUT: '1' };
      const child = spawn('node', ['benchmarks/bench-all.js'], {
        cwd:   SERVER_DIR,
        env:   benchEnv,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      child.stdout.on('data', d => { process.stdout.write(d); stdout += d.toString(); });
      child.stderr.on('data', d => { process.stderr.write(d); });
      child.on('close', code => {
        if (code !== 0) return reject(new Error(`bench-all.js exited with code ${code}`));
        // Parse last JSON block if available, else extract from stdout
        try {
          const match = stdout.match(/\[BENCH_JSON\]([\s\S]+?)\[\/BENCH_JSON\]/);
          if (match) return resolve(JSON.parse(match[1]));
        } catch (_) {}
        resolve({ raw: stdout });
      });
    });

    // Save results
    await mkdir(DOCS_DIR, { recursive: true });
    const outPath = path.join(DOCS_DIR, `bench-${state.id}.json`);
    await writeFile(outPath, JSON.stringify({ state: state.id, label: state.label, results }, null, 2), 'utf8');
    console.log(`\n[runner] Results saved to docs/perf/bench-${state.id}.json`);

    return { state, results };
  } finally {
    console.log('[runner] Stopping server…');
    await stopServer(server);
    await sleep(1000); // brief cooldown before next state
  }
}

// ── Comparison table ──────────────────────────────────────────────────────────

async function buildComparisonTable(stateResults) {
  // Try to read saved JSON for each state
  const rows = {};

  for (const sr of stateResults) {
    const jsonPath = path.join(DOCS_DIR, `bench-${sr.state.id}.json`);
    if (!existsSync(jsonPath)) continue;
    const data = JSON.parse(await readFile(jsonPath, 'utf8'));
    if (!Array.isArray(data.results)) continue;
    for (const r of data.results) {
      if (!rows[r.label]) rows[r.label] = {};
      rows[r.label][sr.state.id] = r;
    }
  }

  const lines = [];
  lines.push('');
  lines.push('Three-State Benchmark Comparison');
  lines.push('═'.repeat(110));
  const hdr = 'Endpoint'.padEnd(52) + 'Baseline'.padStart(14) + 'Phase 1'.padStart(14) + 'Phase 2'.padStart(14);
  lines.push(hdr);
  lines.push('  '.padEnd(52) + 'P50 / req/s'.padStart(14) + 'P50 / req/s'.padStart(14) + 'P50 / req/s'.padStart(14));
  lines.push('─'.repeat(110));

  for (const [label, states] of Object.entries(rows)) {
    const cell = (id) => {
      const r = states[id];
      return r ? `${r.p50}ms/${r.rps}` : 'n/a';
    };
    lines.push(
      label.substring(0, 51).padEnd(52) +
      cell('baseline').padStart(14) +
      cell('phase1').padStart(14) +
      cell('phase2').padStart(14)
    );
  }
  lines.push('═'.repeat(110));

  const table = lines.join('\n');
  console.log(table);

  const outPath = path.join(DOCS_DIR, 'bench-comparison.txt');
  await mkdir(DOCS_DIR, { recursive: true });
  await writeFile(outPath, table + '\n', 'utf8');
  console.log(`\n[runner] Comparison table saved to docs/perf/bench-comparison.txt`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Allow running a single state via --state flag
  const stateFlag = process.argv.indexOf('--state');
  let statesToRun = STATES;
  if (stateFlag !== -1) {
    const stateId = process.argv[stateFlag + 1];
    const found = STATES.find(s => s.id === stateId);
    if (!found) {
      console.error(`Unknown state "${stateId}". Valid: ${STATES.map(s => s.id).join(', ')}`);
      process.exit(1);
    }
    statesToRun = [found];
  }

  const stateResults = [];
  for (const state of statesToRun) {
    const result = await runState(state);
    stateResults.push(result);
  }

  if (statesToRun.length > 1) {
    await buildComparisonTable(stateResults);
  }

  console.log('\n[runner] All states complete.\n');
}

main().catch(err => {
  console.error('[runner] Fatal:', err.message);
  process.exit(1);
});
