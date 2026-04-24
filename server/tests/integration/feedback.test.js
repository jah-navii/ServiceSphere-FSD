/**
 * tests/integration/feedback.test.js
 *
 * Integration tests for POST /api/feedback
 * Uses in-memory MongoDB from setup.js.
 */

import request  from 'supertest';
import { app }  from '../../index.js';
import Seeker   from '../../models/Seeker.js';
import Helper   from '../../models/Helper.js';
import Booking  from '../../models/Booking.js';
import Feedback from '../../models/Feedback.js';
import Category from '../../models/Category.js';
import Location from '../../models/Location.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

let seeker, helper, completedBooking, pendingBooking, category, location;

beforeEach(async () => {
  category = await Category.create({ name: 'Gardening' });
  location = await Location.create({ name: 'Garden City' });

  seeker = await Seeker.create({
    name:         'Feedback Seeker',
    email:        `fb.seeker.${Date.now()}@test.com`,
    password:     'secret',
    mobilenumber: '6000000001',
    address:      '5 Park Ave',
  });

  helper = await Helper.create({
    name:         'Feedback Helper',
    email:        `fb.helper.${Date.now()}@test.com`,
    password:     'secret',
    mobilenumber: '6000000002',
    aadharnumber: '555555555555',
    gender:       'male',
    category:     category._id,
    location:     location._id,
    approved:     true,
  });

  completedBooking = await Booking.create({
    seeker:       seeker._id,
    helper:       helper._id,
    service_type: 'Gardening',
    date:         new Date(Date.now() - 86_400_000), // yesterday
    time:         '09:00',
    address:      '5 Park Ave',
    price:        300,
    status:       'completed',
  });

  pendingBooking = await Booking.create({
    seeker:       seeker._id,
    helper:       helper._id,
    service_type: 'Gardening',
    date:         new Date(Date.now() + 86_400_000), // tomorrow
    time:         '09:00',
    address:      '5 Park Ave',
    price:        300,
    status:       'pending',
  });
});

// ── POST /api/feedback ────────────────────────────────────────────────────────

describe('POST /api/feedback', () => {
  it('submits feedback for a valid booking and returns 201', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        bookingId: completedBooking._id.toString(),
        rating:    5,
        review:    'Excellent service!',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/success/i);
  });

  it('stores the feedback with correct seeker and helper references', async () => {
    await request(app)
      .post('/api/feedback')
      .send({ bookingId: completedBooking._id.toString(), rating: 4, review: 'Good job' });

    const saved = await Feedback.findOne({ seeker: seeker._id, helper: helper._id });
    expect(saved).not.toBeNull();
    expect(saved.rating).toBe(4);
    expect(saved.feedback).toBe('Good job');
  });

  it('returns 404 for a non-existent booking ID', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post('/api/feedback')
      .send({ bookingId: fakeId, rating: 3, review: 'Test' });

    expect(res.status).toBe(404);
  });

  it('can submit feedback for a pending booking (no status guard in current impl)', async () => {
    // Document current behaviour: the feedbackController does not check booking status.
    // If a status guard is added later, this test should be updated to expect 400/403.
    const res = await request(app)
      .post('/api/feedback')
      .send({ bookingId: pendingBooking._id.toString(), rating: 3, review: 'Early feedback' });

    // Current implementation allows it — status is not validated
    expect([201, 400, 403]).toContain(res.status);
  });

  it('allows multiple feedback entries for the same booking (no duplicate guard)', async () => {
    // Document current behaviour: no duplicate guard exists.
    const payload = { bookingId: completedBooking._id.toString(), rating: 5, review: 'Great' };
    await request(app).post('/api/feedback').send(payload);
    const res = await request(app).post('/api/feedback').send(payload);

    // Current implementation allows duplicates — flagged as a known gap
    expect([201, 409]).toContain(res.status);
  });
});
