#!/usr/bin/env node
/**
 * Audit script — reports accounts whose stored password is NOT a bcrypt hash.
 * These accounts cannot log in under the new security policy and require a
 * forced password reset via the admin panel or a direct DB update.
 *
 * Usage:  cd server && node scripts/migratePasswords.js
 */

import '../config/env.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import Admin from '../models/Admin.js';

const BCRYPT_RE = /^\$2[ab]\$/;

async function audit() {
  await mongoose.connect(env.MONGO_URI);
  console.log(`Connected to ${env.MONGO_URI}\n`);

  const models = [
    { label: 'Helper',          Model: Helper },
    { label: 'Seeker',          Model: Seeker },
    { label: 'Admin/Moderator', Model: Admin  },
  ];

  let totalUnhashed = 0;

  for (const { label, Model } of models) {
    const all      = await Model.find({}, 'email password').lean();
    const unhashed = all.filter((u) => !BCRYPT_RE.test(u.password ?? ''));

    if (unhashed.length === 0) {
      console.log(`${label}: all ${all.length} password(s) are bcrypt ✓`);
    } else {
      console.log(`\n${label}: ${unhashed.length} account(s) with non-bcrypt passwords:`);
      unhashed.forEach((u) => console.log(`  id=${u._id}  email=${u.email}`));
      totalUnhashed += unhashed.length;
    }
  }

  console.log(`\n──────────────────────────────────────────`);
  if (totalUnhashed === 0) {
    console.log('All accounts are secure. No action needed.');
  } else {
    console.log(`${totalUnhashed} account(s) require a password reset.`);
    console.log('These users cannot log in until their password is reset.');
    console.log('Use the admin panel (Suspend → force-reset) or update the DB directly.');
  }

  await mongoose.disconnect();
}

audit().catch((err) => {
  console.error(err);
  process.exit(1);
});
