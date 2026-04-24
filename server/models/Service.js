import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    category: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Category',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    seeded: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

// Prevent duplicate service names within the same category
serviceSchema.index({ name: 1, category: 1 }, { unique: true });

// ── Meilisearch sync hooks ────────────────────────────────────────────────────
serviceSchema.post('save', async function (doc) {
  try {
    if (process.env.SEARCH_DRIVER !== 'meili') return;
    const { indexService } = await import('../utils/search/meiliSearch.js');
    const populated = await doc.constructor.findById(doc._id)
      .populate('category', 'name _id').lean();
    if (populated) await indexService(populated);
  } catch (err) {
    console.error('[meili] service post-save sync failed:', err.message);
  }
});

serviceSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  try {
    if (process.env.SEARCH_DRIVER !== 'meili') return;
    const { removeService } = await import('../utils/search/meiliSearch.js');
    await removeService(doc._id);
  } catch (err) {
    console.error('[meili] service post-delete sync failed:', err.message);
  }
});

export default mongoose.model('Service', serviceSchema);
