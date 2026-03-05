import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobilenumber: { type: String, required: true },
  aadharnumber: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String }, // String name of location for display
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location'
  },

  // NEW: The Single Category Constraint
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },

  // Services selected from THAT category
  services: [{
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Service',
      required: true
    },
    // We store name here for easier frontend display without deep population every time
    name: { type: String, required: true }, 
    price: { type: Number, required: true }
  }],

  availability: { type: String },
  certifications: [String], // Array of file paths/filenames
  approved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Helper', helperSchema);