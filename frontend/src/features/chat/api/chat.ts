import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
  };
  unreadCountByUser: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  deliveredTo: string[];
  readBy: string[];
  createdAt: string;
}

export const chatAPI = {
  createOrGetConversation: async (peerUserId: string): Promise<Conversation> => {
    const response = await axios.post(`${API_BASE}/chat/conversations`, {
      peerUserId
    });
    return response.data;
  },

  getUserConversations: async (limit = 20, cursor?: string): Promise<Conversation[]> => {
    const response = await axios.get(`${API_BASE}/chat/conversations`, {
      params: { limit, cursor }
    });
    return response.data;
  },

  getMessages: async (conversationId: string, limit = 50, cursor?: string): Promise<Message[]> => {
    const response = await axios.get(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      params: { limit, cursor }
    });
    return response.data;
  },

  sendMessage: async (data: { conversationId?: string; peerUserId?: string; text: string }): Promise<Message> => {
    const response = await axios.post(`${API_BASE}/chat/messages`, data);
    return response.data;
  },

  markRead: async (conversationId: string): Promise<void> => {
    await axios.post(`${API_BASE}/chat/mark-read`, { conversationId });
  }
};