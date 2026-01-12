import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['hired', 'bid_received', 'bid_rejected'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig'
  },
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
