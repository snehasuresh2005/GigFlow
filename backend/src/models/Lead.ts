import mongoose, { Schema } from 'mongoose';
import type { ILead } from '../types/index.js';

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost'],
      default: 'New'
    },
    source: {
      type: String,
      enum: ['Website', 'Instagram', 'Referral'],
      required: [true, 'Source is required']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

leadSchema.index({ status: 1, source: 1, createdAt: -1 });
leadSchema.index({ name: 'text', email: 'text' });

export default mongoose.model<ILead>('Lead', leadSchema);
