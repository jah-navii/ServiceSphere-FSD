import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    helper: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', required: true },
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'Seeker', required: true },
    service_type: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    address: { type: String, required: true },
    status: {type: String, required: true},
    price: { type: Number, required: true },
    paid: { type: Boolean, default: false }
});
  
export default mongoose.model('Booking', bookingSchema);
