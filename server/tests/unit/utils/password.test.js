/**
 * tests/unit/utils/password.test.js
 *
 * Tests for server/utils/password.js
 * Covers: hashPassword, verifyPassword
 */

import { hashPassword, verifyPassword } from '../../../utils/password.js';

describe('hashPassword', () => {
  it('returns a bcrypt hash string (starts with $2)', async () => {
    const hash = await hashPassword('mySecret123');
    expect(typeof hash).toBe('string');
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it('produces a different hash each call (salt randomisation)', async () => {
    const hash1 = await hashPassword('samePassword');
    const hash2 = await hashPassword('samePassword');
    expect(hash1).not.toBe(hash2);
  });

  it('can hash an empty string without throwing', async () => {
    // bcrypt accepts empty strings — behaviour is defined
    const hash = await hashPassword('');
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it('handles passwords at the bcrypt 72-byte limit correctly', async () => {
    // bcrypt silently truncates at 72 bytes — hashing 72-byte and 73-byte
    // strings produces hashes that both verify against the 72-byte prefix
    const password72  = 'a'.repeat(72);
    const password73  = 'a'.repeat(73);
    const hash72 = await hashPassword(password72);
    const hash73 = await hashPassword(password73);

    // Both hashes are valid bcrypt strings
    expect(hash72).toMatch(/^\$2[ab]\$/);
    expect(hash73).toMatch(/^\$2[ab]\$/);

    // The 73rd byte is silently dropped, so verifying 72-char string against
    // a hash made from 73-char string returns true (bcrypt truncation behaviour)
    await expect(verifyPassword(password72, hash73)).resolves.toBe(true);
  });
});

describe('verifyPassword', () => {
  it('returns true when the plain password matches the hash', async () => {
    const plain = 'correctHorseBatteryStaple';
    const hash  = await hashPassword(plain);
    await expect(verifyPassword(plain, hash)).resolves.toBe(true);
  });

  it('returns false for a wrong password', async () => {
    const hash = await hashPassword('correctPassword');
    await expect(verifyPassword('wrongPassword', hash)).resolves.toBe(false);
  });

  it('returns false (never throws) when the stored hash is plaintext', async () => {
    // Legacy plaintext passwords must be rejected, not cause an error
    await expect(verifyPassword('secret', 'secret')).resolves.toBe(false);
  });

  it('returns false (never throws) when the stored hash is null or undefined', async () => {
    await expect(verifyPassword('secret', null)).resolves.toBe(false);
    await expect(verifyPassword('secret', undefined)).resolves.toBe(false);
  });

  it('returns false for a valid hash from a different password', async () => {
    const hash = await hashPassword('passwordA');
    await expect(verifyPassword('passwordB', hash)).resolves.toBe(false);
  });
});
