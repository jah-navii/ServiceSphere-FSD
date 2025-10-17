import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    helper: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', required: true },
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'Seeker', required: true },
    customer_name: { type: String, required: true },
    service_type: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'Pending' }
  });
  
export default mongoose.model('ServiceRequest', serviceRequestSchema);
  