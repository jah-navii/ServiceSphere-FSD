import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  city: { type: String },
  state: { type: String },
  // Assigned moderator for this location
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  // Location status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_moderator'],
    default: 'pending_moderator'
  },
  seeded: { type: Boolean, default: false, select: false },
}, {
  timestamps: true
});

// Index for efficient queries
locationSchema.index({ moderator: 1 });
locationSchema.index({ status: 1 });

export default mongoose.model('Location', locationSchema);