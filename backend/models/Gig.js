import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget must be positive']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned'],
    default: 'open'
  },
  assignedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries and atomic operations
gigSchema.index({ status: 1 }); // For finding open gigs
gigSchema.index({ ownerId: 1, status: 1 }); // For user's gigs by status
gigSchema.index({ _id: 1, status: 1 }); // Compound index for atomic findOneAndUpdate

export default mongoose.model('Gig', gigSchema);
