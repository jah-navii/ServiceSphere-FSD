import bcrypt from 'bcryptjs';

const BCRYPT_RE = /^\$2[ab]\$/;

export const hashPassword = (plain) => bcrypt.hash(plain, 10);

// Returns false (never throws) if the stored hash is not a valid bcrypt hash —
// plaintext or other schemes are never accepted as valid credentials.
export const verifyPassword = (plain, hash) => {
  if (!BCRYPT_RE.test(hash ?? '')) return Promise.resolve(false);
  return bcrypt.compare(plain, hash);
};
