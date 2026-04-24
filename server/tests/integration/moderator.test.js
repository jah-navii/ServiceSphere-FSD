/**
 * tests/integration/moderator.test.js
 *
 * Integration tests for moderator-scoped routes.
 * Key invariant: a moderator sees ONLY helpers in their assignedLocation.
 */

import request  from 'supertest';
import { app }  from '../../index.js';
import Admin    from '../../models/Admin.js';
import Helper   from '../../models/Helper.js';
import Category from '../../models/Category.js';
import Location from '../../models/Location.js';
import { generateToken } from '../../utils/jwtUtils.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

let locationA, locationB, moderatorA, tokenA, tokenB, category;

beforeEach(async () => {
  category  = await Category.create({ name: 'Cleaning' });
  locationA = await Location.create({ name: 'City A' });
  locationB = await Location.create({ name: 'City B' });

  // Active moderator assigned to locationA
  moderatorA = await Admin.create({
    name:             'Mod A',
    email:            `moda.${Date.now()}@test.com`,
    password:         'ModPass123',
    role:             'moderator',
    status:           'active',
    assignedLocation: locationA._id,
  });

  // Active moderator assigned to locationB
  const moderatorB = await Admin.create({
    name:             'Mod B',
    email:            `modb.${Date.now()}@test.com`,
    password:         'ModPass123',
    role:             'moderator',
    status:           'active',
    assignedLocation: locationB._id,
  });

  tokenA = generateToken({ id: moderatorA._id, role: 'moderator', locationId: locationA._id });
  tokenB = generateToken({ id: moderatorB._id, role: 'moderator', locationId: locationB._id });

  // Helper in locationA
  await Helper.create({
    name:         'Helper In A',
    email:        `helperA.${Date.now()}@test.com`,
    password:     'pass',
    mobilenumber: '7000000001',
    aadharnumber: '100000000001',
    gender:       'male',
    category:     category._id,
    location:     locationA._id,
    approved:     false,
  });

  // Helper in locationB
  await Helper.create({
    name:         'Helper In B',
    email:        `helperB.${Date.now()}@test.com`,
    password:     'pass',
    mobilenumber: '7000000002',
    aadharnumber: '200000000002',
    gender:       'female',
    category:     category._id,
    location:     locationB._id,
    approved:     false,
  });
});

// ── GET /api/moderator/helpers ────────────────────────────────────────────────

describe('GET /api/moderator/helpers', () => {
  it("returns only helpers in the moderator's assigned location", async () => {
    const res = await request(app)
      .get('/api/moderator/helpers')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const names = (res.body.helpers ?? res.body.data ?? res.body).map?.((h) => h.name) ?? [];
    expect(names).toContain('Helper In A');
    expect(names).not.toContain('Helper In B');
  });

  it('moderator B does not see helpers from location A', async () => {
    const res = await request(app)
      .get('/api/moderator/helpers')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    const names = (res.body.helpers ?? res.body.data ?? res.body).map?.((h) => h.name) ?? [];
    expect(names).not.toContain('Helper In A');
    expect(names).toContain('Helper In B');
  });

  it('returns 401 for an unauthenticated request', async () => {
    const res = await request(app).get('/api/moderator/helpers');
    expect(res.status).toBe(401);
  });

  it('returns 403 for a seeker token (wrong role)', async () => {
    const seekerToken = generateToken({ id: 'u1', role: 'seeker' });
    const res = await request(app)
      .get('/api/moderator/helpers')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(403);
  });
});

// ── GET /api/moderator/dashboard ─────────────────────────────────────────────

describe('GET /api/moderator/dashboard', () => {
  it("returns dashboard data for the moderator's own location", async () => {
    const res = await request(app)
      .get('/api/moderator/dashboard')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('returns 403 when the moderator has no assignedLocation', async () => {
    const noLocMod = await Admin.create({
      name:             'No Loc Mod',
      email:            `noloc.${Date.now()}@test.com`,
      password:         'ModPass123',
      role:             'moderator',
      status:           'active',
      assignedLocation: null,
    });
    const noLocToken = generateToken({ id: noLocMod._id, role: 'moderator' });

    const res = await request(app)
      .get('/api/moderator/dashboard')
      .set('Authorization', `Bearer ${noLocToken}`);

    expect(res.status).toBe(403);
  });
});
