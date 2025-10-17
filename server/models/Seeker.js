import mongoose from 'mongoose';

const seekerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobilenumber: { type: String, required: true },
  address: { type: String, required: true }
});

export default mongoose.model('Seeker', seekerSchema);
