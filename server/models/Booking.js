import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    helper:       { type: mongoose.Schema.Types.ObjectId, ref: 'Helper',  required: true },
    seeker:       { type: mongoose.Schema.Types.ObjectId, ref: 'Seeker',  required: true },
    service_type: { type: String,  required: true },
    date:         { type: Date,    required: true },
    time: {
      type:     String,
      required: true,
      match:    [/^\d{2}:\d{2}$/, 'time must be in HH:MM format'],
    },
    address:      { type: String,  required: true },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    price:        { type: Number,  required: true },
    paid:         { type: Boolean, default: false },
    seeded:       { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

bookingSchema.index({ seeker: 1, createdAt: -1 });
bookingSchema.index({ helper: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ helper: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
