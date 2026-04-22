import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    seeker:   { type: mongoose.Schema.Types.ObjectId, ref: 'Seeker', required: true },
    helper:   { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', required: true },
    feedback: { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    seeded:   { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

feedbackSchema.index({ helper: 1, createdAt: -1 });
feedbackSchema.index({ seeker: 1, createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);
