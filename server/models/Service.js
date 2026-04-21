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
  },
  { timestamps: true }
);

// Prevent duplicate service names within the same category
serviceSchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model('Service', serviceSchema);
