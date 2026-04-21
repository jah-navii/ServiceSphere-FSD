import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    email:     { type: String, required: true },
    adminId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Admin',
      required: true,
    },
    phone:     { type: String, required: true },
    issueType: { type: String, required: true },
    message:   { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
