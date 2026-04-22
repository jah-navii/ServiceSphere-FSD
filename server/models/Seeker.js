import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_RE = /^\$2[ab]\$/;

const seekerSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    password:     { type: String, required: true },
    mobilenumber: {
      type:     String,
      required: true,
      unique:   true,
      match:    [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    address:   { type: String, required: true },
    suspended: { type: Boolean, default: false },
    seeded:    { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

seekerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

seekerSchema.methods.comparePassword = function (plain) {
  if (!BCRYPT_RE.test(this.password ?? '')) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('Seeker', seekerSchema);
