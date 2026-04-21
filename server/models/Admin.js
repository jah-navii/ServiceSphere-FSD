import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_RE = /^\$2[ab]\$/;

const adminSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type:     String,
      enum:     ['moderator', 'administrator'],
      default:  'moderator',
      required: true,
    },
    assignedLocation: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Location',
      default: null,
    },
    status: {
      type:    String,
      enum:    ['pending', 'active', 'suspended', 'rejected'],
      default: function () {
        return this.role === 'moderator' ? 'pending' : 'active';
      },
    },
    coverLetter:      { type: String, default: null },
    experience:       { type: String, default: null },
    linkedinProfile:  { type: String, default: null },
    resume:           { type: String, default: null },
    applicationDate:  { type: Date,   default: Date.now },
    approvedBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Admin',
      default: null,
    },
    approvedDate:     { type: Date },
    rejectionReason:  { type: String },
  },
  { timestamps: true }
);

adminSchema.index({ role: 1, status: 1 });
adminSchema.index({ assignedLocation: 1 });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = function (plain) {
  if (!BCRYPT_RE.test(this.password ?? '')) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('Admin', adminSchema);
