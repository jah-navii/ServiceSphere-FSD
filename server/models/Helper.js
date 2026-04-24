import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_RE = /^\$2[ab]\$/;

const helperSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, unique: true, required: true, lowercase: true, trim: true },
    password:     { type: String, required: true },
    mobilenumber: { type: String, required: true },
    aadharnumber: { type: String, required: true },
    gender:       { type: String, required: true },
    address:      { type: String },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Location',
    },
    category: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Category',
      required: true,
    },

    // Ref-only: populate services.serviceId on read to get name/price from the
    // Service document. customPrice overrides the Service base price for this
    // helper if set. Do NOT store cached name here — sync issues are too painful.
    services: [
      {
        serviceId: {
          type:     mongoose.Schema.Types.ObjectId,
          ref:      'Service',
          required: true,
        },
        customPrice: { type: Number },
      },
    ],

    availability:   { type: String },
    certifications: [String],
    approved:       { type: Boolean, default: false },
    suspended:      { type: Boolean, default: false },
    seeded:         { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

helperSchema.index({ location: 1, approved: 1 });
helperSchema.index({ approved: 1, suspended: 1 });
helperSchema.index({ category: 1, approved: 1 });

helperSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ── Meilisearch sync hooks ────────────────────────────────────────────────────
// Wrapped in try/catch so a Meili outage never breaks Mongo writes.
helperSchema.post('save', async function (doc) {
  try {
    if (process.env.SEARCH_DRIVER !== 'meili') return;
    const { indexHelper } = await import('../utils/search/meiliSearch.js');
    // Populate before indexing so category/services are available
    const populated = await doc.constructor.findById(doc._id)
      .populate('category', 'name _id')
      .populate('services.serviceId', 'name price')
      .lean();
    if (populated) await indexHelper(populated);
  } catch (err) {
    console.error('[meili] helper post-save sync failed:', err.message);
  }
});

helperSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  try {
    if (process.env.SEARCH_DRIVER !== 'meili') return;
    const { removeHelper } = await import('../utils/search/meiliSearch.js');
    await removeHelper(doc._id);
  } catch (err) {
    console.error('[meili] helper post-delete sync failed:', err.message);
  }
});

helperSchema.methods.comparePassword = function (plain) {
  if (!BCRYPT_RE.test(this.password ?? '')) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('Helper', helperSchema);
