import { WSServer } from '../ws/server';
import { Call } from '../models/Call';
import mongoose from 'mongoose';

export class WebRTCSignaling {
  constructor(private wsServer: WSServer) {}

  async handleCallRing(callId: string, callerId: string, calleeId: string) {
    // Get caller info for the ring event
    const User = mongoose.model('User');
    const caller = await User.findById(callerId).select('name avatar');
    
    this.wsServer.broadcastToUser(calleeId, 'call.ring', {
      callId,
      caller: {
        id: callerId,
        name: caller?.name || 'Unknown',
        avatar: caller?.avatar
      }
    });
  }

  async handleCallStateChange(callId: string, status: string, toUserId: string) {
    this.wsServer.broadcastToUser(toUserId, 'call.state', {
      callId,
      status
    });
  }

  async handleSDP(callId: string, fromUserId: string, sdp: string, type: 'offer' | 'answer') {
    const call = await Call.findById(callId);
    if (!call) return;

    const targetUserId = call.callerId.toString() === fromUserId ? 
      call.calleeId.toString() : call.callerId.toString();

    this.wsServer.broadcastToUser(targetUserId, 'call.webrtc.sdp', {
      callId,
      sdp,
      type
    });
  }

  async handleICE(callId: string, fromUserId: string, candidate: RTCIceCandidateInit) {
    const call = await Call.findById(callId);
    if (!call) return;

    const targetUserId = call.callerId.toString() === fromUserId ? 
      call.calleeId.toString() : call.callerId.toString();

    this.wsServer.broadcastToUser(targetUserId, 'call.webrtc.ice', {
      callId,
      candidate
    });
  }
}