#!/usr/bin/env node
/**
 * scripts/reindex-meili.js
 *
 * Idempotent full reindex of Meilisearch from MongoDB.
 * Safe to run at any time — Meili's addDocuments is an upsert.
 *
 * Usage:
 *   node scripts/reindex-meili.js
 * or via npm:
 *   npm run search:reindex
 *
 * Requirements: server/.env must be loadable (MONGO_URI, MEILI_HOST,
 * MEILI_MASTER_KEY). SEARCH_DRIVER does NOT need to be set — this script
 * always uses the Meili driver directly.
 *
 * Progress is printed to stdout.  The script exits 0 on success, 1 on error.
 */

import '../config/env.js';          // validates .env and populates process.env
import mongoose     from 'mongoose';
import { env }      from '../config/env.js';
import { reindexAll } from '../utils/search/meiliSearch.js';

const START = Date.now();

function log(msg) {
  const elapsed = ((Date.now() - START) / 1000).toFixed(1);
  process.stdout.write(`  [${elapsed}s] ${msg}\n`);
}

async function main() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  Meilisearch Full Reindex');
  console.log(`  Meili host : ${process.env.MEILI_HOST ?? 'http://localhost:7700'}`);
  console.log(`  Mongo URI  : ${env.MONGO_URI.replace(/\/\/[^@]+@/, '//***@')}`);
  console.log('══════════════════════════════════════════════════\n');

  log('Connecting to MongoDB…');
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10_000 });
  log('Connected.\n');

  log('Indexing helpers and services…');
  const { helpers, services } = await reindexAll({
    onProgress: (msg) => log(msg),
  });

  log(`\nDone!  helpers=${helpers}  services=${services}  elapsed=${((Date.now() - START) / 1000).toFixed(1)}s`);

  await mongoose.disconnect();
  console.log('\n══════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n[reindex] Fatal:', err.message);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
