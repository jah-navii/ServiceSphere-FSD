import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobilenumber: { type: String, required: true },
  aadharnumber: { type: String, required: true },
  gender: { type: String, required: true },
  services: [{
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  availability: { type: String },
  certifications: [String],
  approved: { type: Boolean, default: false }
});

export default mongoose.model('Helper', helperSchema);
