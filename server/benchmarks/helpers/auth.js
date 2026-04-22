/**
 * benchmarks/helpers/auth.js
 *
 * Finds a seeded user in the DB (bypassing the API), then POSTs to the
 * correct login endpoint to obtain a JWT. All benchmark scripts call this
 * before firing autocannon so every hot-path hit carries a real token.
 *
 * Connection lifecycle: connect → query → disconnect → HTTP login.
 * This avoids leaving a dangling Mongoose connection open during benchmarking.
 */

import '../../config/env.js';
import mongoose from 'mongoose';
import { env } from '../../config/env.js';

const API = 'http://localhost:5000';

// role → { loginPath, password, findUser(mongoose) }
const ROLE_CONFIG = {
  seeker: {
    loginPath: '/api/auth/login/seeker',
    password: 'Password123!',
    async findUser() {
      const { default: Seeker } = await import('../../models/Seeker.js');
      return Seeker.findOne({ seeded: true }).select('email').lean();
    },
  },
  helper: {
    loginPath: '/api/auth/login/helper',
    password: 'Password123!',
    async findUser() {
      const { default: Helper } = await import('../../models/Helper.js');
      return Helper.findOne({ seeded: true, approved: true }).select('email _id').lean();
    },
  },
  moderator: {
    loginPath: '/api/auth/login/moderator',
    password: 'Moderator123!',
    async findUser() {
      const { default: Admin } = await import('../../models/Admin.js');
      return Admin
        .findOne({ seeded: true, role: 'moderator', status: 'active' })
        .select('email _id assignedLocation')
        .lean();
    },
  },
  administrator: {
    loginPath: '/api/auth/login/administrator',
    password: 'Admin123!',
    async findUser() {
      const { default: Admin } = await import('../../models/Admin.js');
      return Admin
        .findOne({ seeded: true, role: 'administrator' })
        .select('email _id')
        .lean();
    },
  },
};

/**
 * getToken(role) → { token, user }
 * Connects, finds a seeded user, disconnects, then POSTs to the login endpoint.
 */
export async function getToken(role) {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) throw new Error(`Unknown role: ${role}`);

  // Short-lived DB connection to find the seeded user's email
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  }
  const dbUser = await cfg.findUser();
  await mongoose.disconnect();

  if (!dbUser?.email) {
    throw new Error(
      `No seeded ${role} found in DB. Did you run "npm run seed"?`
    );
  }

  // POST to the login endpoint — server must be running on localhost:5000
  const res = await fetch(`${API}${cfg.loginPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: dbUser.email, password: cfg.password }),
  });

  const body = await res.json();
  if (!body.token) {
    throw new Error(
      `Login failed for ${role} (${dbUser.email}): ${JSON.stringify(body)}`
    );
  }

  return { token: body.token, user: { ...body.user, _id: dbUser._id, assignedLocation: dbUser.assignedLocation } };
}

/**
 * authHeader(token) → { authorization: 'Bearer ...' }
 * Convenience wrapper for autocannon headers.
 */
export function authHeader(token) {
  return { authorization: `Bearer ${token}` };
}
