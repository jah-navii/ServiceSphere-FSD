/**
 * reset-password.js — one-shot password reset utility
 *
 * Usage:
 *   1. Edit the TARGET_EMAIL and NEW_PASSWORD below.
 *   2. Optionally change TARGET_COLLECTION if the account is not a seeker.
 *   3. Run:  node scripts/reset-password.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config(); // loads server/.env

// ──────────────────────────────────────────────────────────────────────────────
// ★ EDIT THESE THREE LINES
// ──────────────────────────────────────────────────────────────────────────────
const TARGET_EMAIL      = 'seed_admin_0011_mocdq6jg@servicesphere.test';
const NEW_PASSWORD      = 'administrator';
const TARGET_COLLECTION = 'admins'; // 'seekers' | 'helpers' | 'admins'
// ──────────────────────────────────────────────────────────────────────────────

await mongoose.connect(process.env.MONGO_URI);

const hash = await bcrypt.hash(NEW_PASSWORD, 10);
const result = await mongoose.connection
  .collection(TARGET_COLLECTION)
  .updateOne({ email: TARGET_EMAIL }, { $set: { password: hash } });

if (result.matchedCount === 0) {
  console.error(`✘ No document found with email "${TARGET_EMAIL}" in "${TARGET_COLLECTION}"`);
} else {
  console.log(`✔ Password updated for ${TARGET_EMAIL} in "${TARGET_COLLECTION}"`);
}

await mongoose.disconnect();
