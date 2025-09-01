import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface UserPresence {
  userId: string;
  socket: WebSocket;
  lastSeen: Date;
}

export interface CallStartDTO {
  calleeId: string;
}

export interface CallAcceptDTO {
  callId: string;
}

export interface CallEndDTO {
  callId: string;
  reason?: 'hangup' | 'failed';
}

export interface CreateOrGetConversationDTO {
  peerUserId: string;
}

export interface SendMessageDTO {
  conversationId?: string;
  peerUserId?: string;
  text: string;
}

export interface MessageEvent {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface DeliveryEvent {
  messageId: string;
  userId: string;
  at: string;
}

export interface ReadEvent {
  messageId: string;
  userId: string;
  at: string;
}

export interface SDPEvent {
  callId: string;
  sdp: string;
  type: 'offer' | 'answer';
}

export interface ICEEvent {
  callId: string;
  candidate: RTCIceCandidateInit;
}

export interface WSCallRingEvent {
  callId: string;
  caller: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface WSCallStateEvent {
  callId: string;
  status: 'canceled' | 'declined' | 'accepted' | 'ended';
}