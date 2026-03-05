import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { 
        type: String, 
        enum: ['moderator', 'administrator'], 
        default: 'moderator',
        required: true 
    },
    // Location assignment (only for moderators)
    assignedLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    // Application status (for moderator applications)
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'rejected'],
        default: function() {
            return this.role === 'moderator' ? 'pending' : 'active';
        }
    },
    // Tracking fields
    applicationDate: { type: Date, default: Date.now },
    approvedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin',
        default: null 
    },
    approvedDate: { type: Date },
    rejectionReason: { type: String }
}, {
    timestamps: true
});

// Index for efficient queries
adminSchema.index({ role: 1, status: 1 });
adminSchema.index({ assignedLocation: 1 });
  
export default mongoose.model('Admin', adminSchema);

