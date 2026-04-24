/**
 * tests/integration/auth.test.js
 *
 * Integration tests for auth routes via supertest.
 * Uses the in-memory MongoDB from tests/setup.js — no real DB required.
 *
 * Routes tested:
 *   POST /api/auth/signup/seeker
 *   POST /api/auth/login/seeker
 */

import request from 'supertest';
import { app } from '../../index.js';
import Seeker from '../../models/Seeker.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const validSeeker = () => ({
  name:            'Jane Doe',
  email:           `jane.${Date.now()}@example.com`,   // unique per test
  password:        'Secret123',
  confirmPassword: 'Secret123',
  mobilenumber:    '9876543210',
  address:         '42 Test Street',
});

// ── POST /api/auth/signup/seeker ──────────────────────────────────────────────

describe('POST /api/auth/signup/seeker', () => {
  it('creates a new seeker and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send(validSeeker());

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered/i);
  });

  it('stores the password as a bcrypt hash, not plaintext', async () => {
    const data = validSeeker();
    await request(app).post('/api/auth/signup/seeker').send(data);

    const seeker = await Seeker.findOne({ email: data.email });
    expect(seeker).not.toBeNull();
    expect(seeker.password).not.toBe(data.password);
    expect(seeker.password).toMatch(/^\$2[ab]\$/);
  });

  it('returns 409 when the email is already registered', async () => {
    const data = validSeeker();
    await request(app).post('/api/auth/signup/seeker').send(data);

    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send({ ...data, mobilenumber: '1234567890' }); // different mobile

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 409 when the mobile number is already registered', async () => {
    const data = validSeeker();
    await request(app).post('/api/auth/signup/seeker').send(data);

    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send({ ...data, email: 'other@example.com' }); // different email

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/mobile/i);
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send({ ...validSeeker(), email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send({ ...validSeeker(), confirmPassword: 'DifferentPassword' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  it('returns 400 for a 9-digit mobile number', async () => {
    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send({ ...validSeeker(), mobilenumber: '123456789' }); // 9 digits

    expect(res.status).toBe(400);
  });

  it('returns 400 for an 11-digit mobile number', async () => {
    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send({ ...validSeeker(), mobilenumber: '12345678901' }); // 11 digits

    expect(res.status).toBe(400);
  });

  it('returns 400 when a required field is missing', async () => {
    const { name: _omitted, ...withoutName } = validSeeker();
    const res = await request(app)
      .post('/api/auth/signup/seeker')
      .send(withoutName);

    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/login/seeker ───────────────────────────────────────────────

describe('POST /api/auth/login/seeker', () => {
  // Create a seeker to log in with for each test
  let seeker;
  const PASSWORD = 'TestPass456';

  beforeEach(async () => {
    const data = { ...validSeeker(), password: PASSWORD, confirmPassword: PASSWORD };
    seeker = data;
    await request(app).post('/api/auth/signup/seeker').send(data);
  });

  it('returns 200 and a JWT token on successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login/seeker')
      .send({ email: seeker.email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.user.role).toBe('seeker');
  });

  it('returns 401 for a wrong password — does not leak whether email exists', async () => {
    const res = await request(app)
      .post('/api/auth/login/seeker')
      .send({ email: seeker.email, password: 'WrongPassword' });

    expect(res.status).toBe(401);
    // The message must be identical to the "email not found" message
    expect(res.body.error).toBe('Invalid email or password!');
  });

  it('returns 401 for a non-existent email — same message as wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login/seeker')
      .send({ email: 'nobody@example.com', password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password!');
  });

  it('rejects a user whose stored password is plaintext (legacy account)', async () => {
    // Bypass the pre-save hook by using updateOne to set a plaintext "hash"
    await Seeker.updateOne(
      { email: seeker.email },
      { $set: { password: PASSWORD } }, // plaintext — not a bcrypt hash
    );

    const res = await request(app)
      .post('/api/auth/login/seeker')
      .send({ email: seeker.email, password: PASSWORD });

    // verifyPassword checks for $2 prefix — plaintext hash is rejected
    expect(res.status).toBe(401);
  });

  it('returns 400 when the email field is omitted', async () => {
    const res = await request(app)
      .post('/api/auth/login/seeker')
      .send({ password: PASSWORD });

    expect(res.status).toBe(400);
  });

  it('returns 400 when the password field is omitted', async () => {
    const res = await request(app)
      .post('/api/auth/login/seeker')
      .send({ email: seeker.email });

    expect(res.status).toBe(400);
  });

  it('returns 403 for a suspended account', async () => {
    await Seeker.updateOne({ email: seeker.email }, { $set: { suspended: true } });

    const res = await request(app)
      .post('/api/auth/login/seeker')
      .send({ email: seeker.email, password: PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/suspended/i);
  });
});
