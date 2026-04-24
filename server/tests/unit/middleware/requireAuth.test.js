/**
 * tests/unit/middleware/requireAuth.test.js
 *
 * Tests for server/middleware/authMiddleware.js — requireAuth()
 */

import { requireAuth } from '../../../middleware/authMiddleware.js';
import { generateToken } from '../../../utils/jwtUtils.js';
import jwt from 'jsonwebtoken';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal Express-style request object with the given Bearer token */
const makeReq = (token) => ({
  headers: token ? { authorization: `Bearer ${token}` } : {},
});

/** Build a minimal Express-style response spy */
const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json   = vi.fn().mockReturnValue(res);
  return res;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('requireAuth()', () => {
  it('returns 401 when no Authorization header is present', () => {
    const middleware = requireAuth();
    const req  = makeReq(null);
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is invalid / malformed', () => {
    const middleware = requireAuth();
    const req  = makeReq('totally.not.valid');
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for an expired token', () => {
    const expired = jwt.sign(
      { id: 'u1', role: 'seeker' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' },
    );
    const middleware = requireAuth();
    const req  = makeReq(expired);
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 when the token role is not in the allowed list', () => {
    const token = generateToken({ id: 'u1', role: 'seeker' });
    const middleware = requireAuth('administrator', 'moderator');
    const req  = makeReq(token);
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and attaches req.user for a valid token with allowed role', () => {
    const payload = { id: 'u1', email: 'a@b.com', role: 'seeker' };
    const token   = generateToken(payload);
    const middleware = requireAuth('seeker');
    const req  = makeReq(token);
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(payload.id);
    expect(req.user.role).toBe('seeker');
  });

  it('calls next() for any authenticated user when requireAuth() is called with no args', () => {
    const token      = generateToken({ id: 'u2', role: 'helper' });
    const middleware = requireAuth();   // no role restriction
    const req  = makeReq(token);
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('calls next() when token has one of multiple allowed roles', () => {
    const token      = generateToken({ id: 'u3', role: 'moderator' });
    const middleware = requireAuth('administrator', 'moderator');
    const req  = makeReq(token);
    const res  = makeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
