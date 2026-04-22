#!/usr/bin/env node
/**
 * benchmarks/helpers/run-explains.js
 *
 * Standalone script — does NOT require the server to be running.
 * Connects directly to MongoDB, runs .explain('executionStats') for the
 * queries underlying each of the 10 hot endpoints, and writes the output
 * to docs/perf/explain-before/<route-name>.json.
 *
 * Usage:  node benchmarks/helpers/run-explains.js
 */

import '../../config/env.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env.js';

// Models
import Helper   from '../../models/Helper.js';
import Seeker   from '../../models/Seeker.js';
import Booking  from '../../models/Booking.js';
import Feedback from '../../models/Feedback.js';
import Admin    from '../../models/Admin.js';
import Service  from '../../models/Service.js';

const OUT_DIR = path.resolve('docs/perf/explain-before');

async function saveExplain(name, explain) {
  const file = path.join(OUT_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(explain, null, 2));
  const stage = explain?.queryPlanner?.winningPlan?.stage
    ?? explain?.stages?.[0]?.stage
    ?? explain?.queryPlanner?.winningPlan?.inputStage?.stage
    ?? 'unknown';
  const docsExamined = explain?.executionStats?.totalDocsExamined ?? 'n/a';
  const docsReturned = explain?.executionStats?.totalDocsReturned ?? 'n/a';
  console.log(`  [${name}]  stage=${stage}  examined=${docsExamined}  returned=${docsReturned}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await mongoose.connect(env.MONGO_URI);
  console.log(`\n[explain] Connected to ${env.MONGO_URI}`);
  console.log(`[explain] Saving to ${OUT_DIR}\n`);

  // ── 1. POST /api/auth/login/seeker  (Seeker.findOne({ email })) ─────────────
  {
    const sample = await Seeker.findOne({ seeded: true }).select('email').lean();
    const ex = await Seeker.findOne({ email: sample.email })
      .explain('executionStats');
    await saveExplain('01-login-seeker', ex);
  }

  // ── 2. GET /api/services  (Helper.find({ approved: true })) ─────────────────
  {
    const ex = await Helper.find({ approved: true }).explain('executionStats');
    await saveExplain('02-services-helpers', ex);
  }

  // ── 3. GET /api/services  (Feedback.aggregate for avg ratings) ──────────────
  {
    const ex = await Feedback.aggregate([
      { $group: { _id: '$helper', avgRating: { $avg: '$rating' } } },
    ]).explain();
    await saveExplain('03-services-feedback-agg', ex);
  }

  // ── 4. GET /api/bookings?userId=  (seeker booking history) ──────────────────
  {
    const sample = await Seeker.findOne({ seeded: true }).select('_id').lean();
    const ex = await Booking.find({ seeker: sample._id })
      .sort({ createdAt: -1 })
      .explain('executionStats');
    await saveExplain('04-bookings-seeker', ex);
  }

  // ── 5. GET /api/helper/requests/:id  (helper pending bookings) ───────────────
  {
    const sample = await Helper.findOne({ seeded: true }).select('_id').lean();
    const ex = await Booking.find({ helper: sample._id, status: 'pending' })
      .explain('executionStats');
    await saveExplain('05-helper-requests', ex);
  }

  // ── 6. GET /api/helper/feedback/:id ─────────────────────────────────────────
  {
    const sample = await Helper.findOne({ seeded: true }).select('_id').lean();
    const ex = await Feedback.find({ helper: sample._id })
      .sort({ createdAt: -1 })
      .explain('executionStats');
    await saveExplain('06-helper-feedback', ex);
  }

  // ── 7. GET /api/administrator/users/all (three separate queries) ─────────────
  {
    const ex = await Helper.find({}).select('-password').explain('executionStats');
    await saveExplain('07-admin-users-helpers', ex);
  }
  {
    const ex = await Seeker.find({}).select('-password').explain('executionStats');
    await saveExplain('07-admin-users-seekers', ex);
  }

  // ── 8. GET /api/administrator/bookings/all ───────────────────────────────────
  {
    const ex = await Booking.find({}).sort({ createdAt: -1 }).explain('executionStats');
    await saveExplain('08-admin-bookings', ex);
  }

  // ── 9. GET /api/moderator/helpers  (Helper.find by location) ────────────────
  {
    const mod = await Admin.findOne({ seeded: true, role: 'moderator', status: 'active' }).lean();
    const ex = await Helper.find({ location: mod.assignedLocation }).explain('executionStats');
    await saveExplain('09-mod-helpers', ex);
  }

  // ── 10. GET /api/moderator/bookings  (two-step: helpers then $in bookings) ───
  {
    const mod = await Admin.findOne({ seeded: true, role: 'moderator', status: 'active' }).lean();
    const helperIds = (
      await Helper.find({ location: mod.assignedLocation }).select('_id').lean()
    ).map(h => h._id);

    const ex = await Booking.find({ helper: { $in: helperIds } })
      .sort({ createdAt: -1 })
      .explain('executionStats');
    await saveExplain('10-mod-bookings', ex);
  }

  await mongoose.disconnect();
  console.log('\n[explain] Done. Check docs/perf/explain-before/\n');
}

main().catch(err => {
  console.error('[explain] Fatal:', err);
  process.exit(1);
});
