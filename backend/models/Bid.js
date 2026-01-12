import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected'],
    default: 'pending'
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries and atomic operations
bidSchema.index({ gigId: 1, status: 1 }); // For finding bids by gig and status
bidSchema.index({ freelancerId: 1, status: 1 }); // For finding user's bids by status
bidSchema.index({ _id: 1, status: 1, gigId: 1 }); // Compound index for atomic findOneAndUpdate
bidSchema.index({ freelancerId: 1, status: 'hired' }); // For counting active gigs efficiently

export default mongoose.model('Bid', bidSchema);
