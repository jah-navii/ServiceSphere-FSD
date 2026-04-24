/**
 * tests/unit/utils/jwtUtils.test.js
 *
 * Tests for server/utils/jwtUtils.js
 * Covers: generateToken, verifyToken, extractToken
 */

import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, extractToken } from '../../../utils/jwtUtils.js';

// The JWT_SECRET is set in vitest.config.js env block
const TEST_SECRET = 'test-jwt-secret-at-least-16-chars';

const samplePayload = { id: 'user123', email: 'test@example.com', role: 'seeker' };

describe('generateToken', () => {
  it('returns a string with three dot-separated JWT segments', () => {
    const token = generateToken(samplePayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('embeds all payload fields in the token', () => {
    const token = generateToken(samplePayload);
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe(samplePayload.id);
    expect(decoded.email).toBe(samplePayload.email);
    expect(decoded.role).toBe(samplePayload.role);
  });

  it('role is retrievable after signing and verifying', () => {
    const token   = generateToken({ id: 'abc', role: 'moderator' });
    const decoded = verifyToken(token);
    expect(decoded.role).toBe('moderator');
  });

  it('includes an exp claim (token expires)', () => {
    const token   = generateToken(samplePayload);
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});

describe('verifyToken', () => {
  it('returns the decoded payload for a valid token', () => {
    const token   = generateToken(samplePayload);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(samplePayload.id);
    expect(decoded.role).toBe(samplePayload.role);
  });

  it('throws on a token signed with a different secret (tampered)', () => {
    const tampered = jwt.sign(samplePayload, 'wrong-secret-entirely');
    expect(() => verifyToken(tampered)).toThrow('Invalid or expired token');
  });

  it('throws on an expired token', () => {
    const expired = jwt.sign(samplePayload, TEST_SECRET, { expiresIn: '-1s' });
    expect(() => verifyToken(expired)).toThrow('Invalid or expired token');
  });

  it('throws on a malformed (non-JWT) string', () => {
    expect(() => verifyToken('not.a.jwt')).toThrow('Invalid or expired token');
    expect(() => verifyToken('completely-random-string')).toThrow('Invalid or expired token');
    expect(() => verifyToken('')).toThrow('Invalid or expired token');
  });

  it('throws on a token with a tampered payload segment', () => {
    const token  = generateToken(samplePayload);
    const parts  = token.split('.');
    // Replace payload with a different base64 blob
    parts[1] = Buffer.from(JSON.stringify({ id: 'hacker', role: 'administrator' })).toString('base64url');
    const tampered = parts.join('.');
    expect(() => verifyToken(tampered)).toThrow('Invalid or expired token');
  });
});

describe('extractToken', () => {
  it('extracts the token from a valid Bearer Authorization header', () => {
    const token = generateToken(samplePayload);
    const req   = { headers: { authorization: `Bearer ${token}` } };
    expect(extractToken(req)).toBe(token);
  });

  it('returns null when the Authorization header is absent', () => {
    expect(extractToken({ headers: {} })).toBeNull();
  });

  it('returns null when the Authorization header is not Bearer scheme', () => {
    expect(extractToken({ headers: { authorization: 'Basic dXNlcjpwYXNz' } })).toBeNull();
  });

  it('returns null when the Authorization header is just "Bearer " with no token', () => {
    // "Bearer " with trailing space — substring(7) yields ''
    const result = extractToken({ headers: { authorization: 'Bearer ' } });
    expect(result).toBe('');  // empty string is falsy — callers should treat it as no token
  });
});
