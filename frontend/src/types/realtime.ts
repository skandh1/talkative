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

export interface CallRingEvent {
  callId: string;
  caller: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CallStateEvent {
  callId: string;
  status: 'canceled' | 'declined' | 'accepted' | 'ended';
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

export type WSEventType = 
  | 'connection.confirmed'
  | 'call.ring'
  | 'call.state' 
  | 'call.webrtc.sdp'
  | 'call.webrtc.ice'
  | 'chat.message'
  | 'chat.message.delivered'
  | 'chat.message.read';

export interface WSMessage {
  type: WSEventType;
  payload: any;
}