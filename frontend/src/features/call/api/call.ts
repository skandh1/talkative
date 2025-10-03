import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Call {
  _id: string;
  callerId: string;
  calleeId: string;
  status: 'ringing' | 'accepted' | 'declined' | 'canceled' | 'missed' | 'ended';
  startedAt?: string;
  endedAt?: string;
  durationSec?: number;
  createdAt: string;
}

export const callAPI = {
  startCall: async (calleeId: string): Promise<Call> => {
    const response = await axios.post(`${API_BASE}/call/start`, { calleeId });
    return response.data;
  },

  acceptCall: async (callId: string): Promise<{ call: Call; sessionId: string }> => {
    const response = await axios.post(`${API_BASE}/call/accept`, { callId });
    return response.data;
  },

  declineCall: async (callId: string): Promise<Call> => {
    const response = await axios.post(`${API_BASE}/call/decline`, { callId });
    return response.data;
  },

  cancelCall: async (callId: string): Promise<Call> => {
    const response = await axios.post(`${API_BASE}/call/cancel`, { callId });
    return response.data;
  },

  endCall: async (callId: string, reason?: 'hangup' | 'failed'): Promise<Call> => {
    const response = await axios.post(`${API_BASE}/call/end`, { callId, reason });
    return response.data;
  }
};