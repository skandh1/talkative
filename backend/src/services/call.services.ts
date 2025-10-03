import mongoose from 'mongoose';
import { Call, ICall } from '../models/Call';

export class CallService {
  static async startCall(callerId: string, calleeId: string): Promise<ICall> {
    // Check if there's already an active call involving either user
    const activeCall = await Call.findOne({
      $or: [
        { callerId: new mongoose.Types.ObjectId(callerId), status: { $in: ['ringing', 'accepted'] } },
        { calleeId: new mongoose.Types.ObjectId(callerId), status: { $in: ['ringing', 'accepted'] } },
        { callerId: new mongoose.Types.ObjectId(calleeId), status: { $in: ['ringing', 'accepted'] } },
        { calleeId: new mongoose.Types.ObjectId(calleeId), status: { $in: ['ringing', 'accepted'] } }
      ]
    });

    if (activeCall) {
      throw new Error('User is already in a call');
    }

    const call = new Call({
      callerId: new mongoose.Types.ObjectId(callerId),
      calleeId: new mongoose.Types.ObjectId(calleeId),
      status: 'ringing'
    });

    await call.save();
    return call;
  }

  static async acceptCall(callId: string, calleeId: string): Promise<ICall> {
    const call = await Call.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(callId),
        calleeId: new mongoose.Types.ObjectId(calleeId),
        status: 'ringing'
      },
      { 
        status: 'accepted',
        startedAt: new Date()
      },
      { new: true }
    );

    if (!call) {
      throw new Error('Call not found or already answered');
    }

    return call;
  }

  static async declineCall(callId: string, calleeId: string): Promise<ICall> {
    const call = await Call.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(callId),
        calleeId: new mongoose.Types.ObjectId(calleeId),
        status: 'ringing'
      },
      { status: 'declined' },
      { new: true }
    );

    if (!call) {
      throw new Error('Call not found or already answered');
    }

    return call;
  }

  static async cancelCall(callId: string, callerId: string): Promise<ICall> {
    const call = await Call.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(callId),
        callerId: new mongoose.Types.ObjectId(callerId),
        status: 'ringing'
      },
      { status: 'canceled' },
      { new: true }
    );

    if (!call) {
      throw new Error('Call not found or already answered');
    }

    return call;
  }

  static async endCall(callId: string, userId: string): Promise<ICall> {
    const call = await Call.findOne({
      _id: new mongoose.Types.ObjectId(callId),
      $or: [
        { callerId: new mongoose.Types.ObjectId(userId) },
        { calleeId: new mongoose.Types.ObjectId(userId) }
      ],
      status: 'accepted'
    });

    if (!call) {
      throw new Error('Active call not found');
    }

    const endedAt = new Date();
    const durationSec = call.startedAt ? 
      Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000) : 0;

    call.status = 'ended';
    call.endedAt = endedAt;
    call.durationSec = durationSec;
    
    await call.save();
    return call;
  }

  static async markMissed(callId: string): Promise<void> {
    await Call.findByIdAndUpdate(callId, { status: 'missed' });
  }
}