/**
 * tests/integration/bookings.test.js
 *
 * Integration tests for POST /api/bookings and GET /api/bookings
 * Uses in-memory MongoDB from setup.js.
 */

import request    from 'supertest';
import mongoose   from 'mongoose';
import { app }    from '../../index.js';
import Seeker     from '../../models/Seeker.js';
import Helper     from '../../models/Helper.js';
import Booking    from '../../models/Booking.js';
import Category   from '../../models/Category.js';
import Location   from '../../models/Location.js';
import { generateToken } from '../../utils/jwtUtils.js';

// ── Shared fixtures ───────────────────────────────────────────────────────────

let seeker, seekerToken, helper, location, category;

beforeEach(async () => {
  category = await Category.create({ name: 'Cleaning' });
  location = await Location.create({ name: 'Test City' });

  seeker = await Seeker.create({
    name:         'Test Seeker',
    email:        `seeker.${Date.now()}@test.com`,
    password:     'hashed',   // pre-save hook will hash
    mobilenumber: '9000000001',
    address:      '1 Main St',
  });

  seekerToken = generateToken({ id: seeker._id, role: 'seeker' });

  helper = await Helper.create({
    name:         'Test Helper',
    email:        `helper.${Date.now()}@test.com`,
    password:     'hashed',
    mobilenumber: '9000000002',
    aadharnumber: '123456789012',
    gender:       'male',
    category:     category._id,
    location:     location._id,
    approved:     true,
  });
});

const validBookingBody = () => ({
  userId:       '',       // filled in tests
  helperId:     '',       // filled in tests
  helperName:   'Test Helper',
  serviceName:  'Cleaning',
  customerName: 'Test Seeker',
  date:         new Date(Date.now() + 86_400_000).toISOString().split('T')[0], // tomorrow
  time:         '10:00',
  address:      '1 Main St',
  price:        500,
});

// ── POST /api/bookings ────────────────────────────────────────────────────────

describe('POST /api/bookings', () => {
  it('creates a booking for an authenticated seeker', async () => {
    const body = { ...validBookingBody(), userId: seeker._id.toString(), helperId: helper._id.toString() };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.bookingId).toBeDefined();
  });

  it('returns 401 when no auth token is provided', async () => {
    const body = { ...validBookingBody(), userId: seeker._id.toString(), helperId: helper._id.toString() };

    const res = await request(app)
      .post('/api/bookings')
      .send(body);

    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({ userId: seeker._id.toString() }); // missing helperId, date, time, address

    expect(res.status).toBe(400);
  });

  it('returns 404 when the userId does not match a real seeker', async () => {
    const body = {
      ...validBookingBody(),
      userId:   new mongoose.Types.ObjectId().toString(), // non-existent ID
      helperId: helper._id.toString(),
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send(body);

    expect(res.status).toBe(404);
  });
});

// ── GET /api/bookings ─────────────────────────────────────────────────────────

describe('GET /api/bookings', () => {
  beforeEach(async () => {
    // Seed a couple of bookings for the seeker
    await Booking.create([
      {
        seeker:       seeker._id,
        helper:       helper._id,
        service_type: 'Cleaning',
        date:         new Date(Date.now() + 86_400_000),
        time:         '10:00',
        address:      '1 Main St',
        price:        500,
        status:       'pending',
      },
      {
        seeker:       seeker._id,
        helper:       helper._id,
        service_type: 'Cleaning',
        date:         new Date(Date.now() + 2 * 86_400_000),
        time:         '11:00',
        address:      '1 Main St',
        price:        600,
        status:       'confirmed',
      },
    ]);
  });

  it("returns only the requesting seeker's own bookings", async () => {
    const res = await request(app)
      .get(`/api/bookings?userId=${seeker._id}`)
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBe(2);
    // Each booking in the formatted response should have serviceType and status
    res.body.bookings.forEach((b) => {
      expect(b).toHaveProperty('serviceType');
      expect(b).toHaveProperty('status');
    });
  });

  it('returns 400 when userId query param is missing', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(400);
  });
});
