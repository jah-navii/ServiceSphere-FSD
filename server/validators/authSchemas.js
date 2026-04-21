import { z } from 'zod';

// ── Reusable primitives ───────────────────────────────────────────────────────
const email     = z.string().email('Invalid email format');
const password  = z.string().min(6, 'Password must be at least 6 characters');
const phone     = z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits');
const alphaName = z.string().min(2).regex(/^[A-Za-z\s]+$/, 'Name must contain only letters');

// ── Auth schemas ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const seekerSignupSchema = z
  .object({
    name:            alphaName,
    email,
    password,
    confirmPassword: z.string(),
    mobilenumber:    phone,
    address:         z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const helperSignupSchema = z
  .object({
    name:            z.string().min(2, 'Name is required'),
    email,
    password,
    confirmPassword: z.string(),
    mobilenumber:    phone,
    aadharnumber:    z.string().min(1, 'Aadhaar number is required'),
    gender:          z.string().optional(),
    category:        z.string().min(1, 'Category is required'),
    address:         z.string().optional(),
    location:        z.string().optional(),
    services:        z.array(z.string()).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const adminSignupSchema = z
  .object({
    name:            z.string().min(2, 'Name is required'),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const moderatorApplicationSchema = z.object({
  name:             z.string().min(2, 'Name is required'),
  email,
  phone,
  password,
  desiredLocation:  z.string().min(1, 'Location is required'),
  coverLetter:      z.string().min(1, 'Cover letter is required'),
  experience:       z.string().optional(),
  linkedinProfile:  z.union([z.string().url(), z.literal('')]).optional(),
});

// ── validate(schema) middleware factory ───────────────────────────────────────
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Validation failed';
    return res.status(400).json({ error: message });
  }
  req.body = result.data;
  next();
};
