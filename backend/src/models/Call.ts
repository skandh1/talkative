import mongoose, { Schema, Document } from 'mongoose';

export interface ICall extends Document {
  _id: mongoose.Types.ObjectId;
  callerId: mongoose.Types.ObjectId;
  calleeId: mongoose.Types.ObjectId;
  status: 'ringing' | 'accepted' | 'declined' | 'canceled' | 'missed' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  durationSec?: number;
  createdAt: Date;
}

const callSchema = new Schema<ICall>({
  callerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calleeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['ringing', 'accepted', 'declined', 'canceled', 'missed', 'ended'],
    default: 'ringing'
  },
  startedAt: Date,
  endedAt: Date,
  durationSec: Number
}, {
  timestamps: true
});

callSchema.index({ callerId: 1, createdAt: -1 });
callSchema.index({ calleeId: 1, createdAt: -1 });
callSchema.index({ status: 1, createdAt: -1 });

export const Call = mongoose.model<ICall>('Call', callSchema);