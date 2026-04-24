/**
 * tests/unit/validators/authSchemas.test.js
 *
 * Tests for server/validators/authSchemas.js
 * Covers: loginSchema, seekerSignupSchema, validate() middleware
 */

import {
  loginSchema,
  seekerSignupSchema,
  validate,
} from '../../../validators/authSchemas.js';

// ── loginSchema ───────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('passes with a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Secret123' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('email');
  });

  it('rejects a missing password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('password');
  });

  it('rejects an empty password string', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

// ── seekerSignupSchema ────────────────────────────────────────────────────────

const validSeekerData = () => ({
  name:            'Jane Doe',
  email:           'jane@example.com',
  password:        'Secret123',
  confirmPassword: 'Secret123',
  mobilenumber:    '9876543210',
  address:         '42 Test Street',
});

describe('seekerSignupSchema', () => {
  it('passes with all valid fields', () => {
    const result = seekerSignupSchema.safeParse(validSeekerData());
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const result = seekerSignupSchema.safeParse({ ...validSeekerData(), email: 'bad-email' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('email');
  });

  it('rejects a 9-digit mobile number', () => {
    const result = seekerSignupSchema.safeParse({ ...validSeekerData(), mobilenumber: '123456789' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('mobilenumber');
  });

  it('accepts exactly a 10-digit mobile number', () => {
    const result = seekerSignupSchema.safeParse({ ...validSeekerData(), mobilenumber: '1234567890' });
    expect(result.success).toBe(true);
  });

  it('rejects an 11-digit mobile number', () => {
    const result = seekerSignupSchema.safeParse({ ...validSeekerData(), mobilenumber: '12345678901' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('mobilenumber');
  });

  it('rejects when passwords do not match', () => {
    const result = seekerSignupSchema.safeParse({ ...validSeekerData(), confirmPassword: 'Different' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('confirmPassword');
    expect(result.error.issues[0].message).toMatch(/match/i);
  });

  it('rejects when the name is missing', () => {
    const { name: _omit, ...data } = validSeekerData();
    const result = seekerSignupSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('name');
  });

  it('rejects when the password is shorter than 6 characters', () => {
    const result = seekerSignupSchema.safeParse({
      ...validSeekerData(),
      password:        'abc',
      confirmPassword: 'abc',
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('password');
  });

  it('strips unknown extra fields (zod strips by default)', () => {
    const result = seekerSignupSchema.safeParse({ ...validSeekerData(), hackerField: 'evil' });
    // safeParse succeeds and the extra field is removed from result.data
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('hackerField');
  });
});

// ── validate() middleware factory ─────────────────────────────────────────────

describe('validate middleware', () => {
  const makeRes = () => {
    const res = { statusCode: null, body: null };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json   = (body)  => { res.body = body; return res; };
    return res;
  };

  it('calls next() and replaces req.body with parsed data on success', () => {
    const middleware = validate(loginSchema);
    const req  = { body: { email: 'user@example.com', password: 'Secret' } };
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.email).toBe('user@example.com');
  });

  it('returns 400 with an error message on validation failure', () => {
    const middleware = validate(loginSchema);
    const req  = { body: { email: 'bad-email', password: '' } };
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(typeof res.body.error).toBe('string');
  });
});
