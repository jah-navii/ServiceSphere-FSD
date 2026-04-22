import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  description: { type: String }, 
  image: { type: String }, // Optional icon for the UI
  seeded: { type: Boolean, default: false, select: false },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);