import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  // Link to Category (e.g., "Plumbing" belongs to "Home Repairs")
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  isActive: { type: Boolean, default: true }
});

// Prevent duplicate service names inside the SAME category
serviceSchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model('Service', serviceSchema);