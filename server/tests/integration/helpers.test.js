/**
 * tests/integration/helpers.test.js
 *
 * Integration tests for GET /api/services (helper search/filter)
 * Uses in-memory MongoDB from setup.js.
 */

import request  from 'supertest';
import { app }  from '../../index.js';
import Helper   from '../../models/Helper.js';
import Category from '../../models/Category.js';
import Location from '../../models/Location.js';
import Service  from '../../models/Service.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

let category, location, service;

beforeEach(async () => {
  category = await Category.create({ name: 'Plumbing' });
  location = await Location.create({ name: 'Metro City' });
  service  = await Service.create({ name: 'Pipe Repair', category: category._id });

  // Approved helper with a service
  await Helper.create({
    name:         'Approved Helper',
    email:        `approved.${Date.now()}@test.com`,
    password:     'pass',
    mobilenumber: '8000000001',
    aadharnumber: '111111111111',
    gender:       'male',
    category:     category._id,
    location:     location._id,
    approved:     true,
    suspended:    false,
    services:     [{ serviceId: service._id }],
  });

  // Unapproved helper — must NOT appear in public results
  await Helper.create({
    name:         'Pending Helper',
    email:        `pending.${Date.now()}@test.com`,
    password:     'pass',
    mobilenumber: '8000000002',
    aadharnumber: '222222222222',
    gender:       'female',
    category:     category._id,
    location:     location._id,
    approved:     false,
    suspended:    false,
    services:     [{ serviceId: service._id }],
  });
});

// ── GET /api/services ─────────────────────────────────────────────────────────

describe('GET /api/services', () => {
  // Helper to extract the helpers array from the response body
  // GET /api/services returns { success: true, helpers: [...], serviceTypes: [...] }
  const getHelpers = (body) => body.helpers ?? [];

  it('returns 200 with a helpers array in the response', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.helpers)).toBe(true);
  });

  it('only returns approved, non-suspended helpers', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);

    const names = getHelpers(res.body).map((h) => h.name);
    expect(names).toContain('Approved Helper');
    expect(names).not.toContain('Pending Helper');
  });

  it('filters by category ID', async () => {
    const otherCat = await Category.create({ name: 'Electrical' });
    await Helper.create({
      name:         'Electrician',
      email:        `elec.${Date.now()}@test.com`,
      password:     'pass',
      mobilenumber: '8000000003',
      aadharnumber: '333333333333',
      gender:       'male',
      category:     otherCat._id,
      location:     location._id,
      approved:     true,
    });

    const res = await request(app).get(`/api/services?category=${category._id}`);
    expect(res.status).toBe(200);

    const names = getHelpers(res.body).map((h) => h.name);
    // The plumbing category filter should exclude the electrician
    names.forEach((n) => expect(n).not.toBe('Electrician'));
  });

  it('filters by location name', async () => {
    const otherLoc = await Location.create({ name: 'Remote Village' });
    await Helper.create({
      name:         'Remote Helper',
      email:        `remote.${Date.now()}@test.com`,
      password:     'pass',
      mobilenumber: '8000000004',
      aadharnumber: '444444444444',
      gender:       'male',
      category:     category._id,
      location:     otherLoc._id,
      approved:     true,
    });

    const res = await request(app).get('/api/services?location=Metro+City');
    expect(res.status).toBe(200);
    const names = getHelpers(res.body).map((h) => h.name);
    expect(names).not.toContain('Remote Helper');
  });

  it('returns an empty helpers array when no helpers match the search term', async () => {
    const res = await request(app).get('/api/services?search=xyznonexistentservice');
    expect(res.status).toBe(200);
    expect(getHelpers(res.body)).toEqual([]);
  });
});
