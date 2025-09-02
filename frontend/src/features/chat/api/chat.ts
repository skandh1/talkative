import { useApi } from "@/hooks/useApi"; // adjust path if needed

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

export function useChatAPI() {
  const { request } = useApi();

  return {
    createOrGetConversation: async (peerUserId: string): Promise<Conversation> => {
      return request<Conversation>(`/chat/conversations`, {
        method: "POST",
        body: JSON.stringify({ peerUserId }),
      });
    },

    getUserConversations: async (limit = 20, cursor?: string): Promise<Conversation[]> => {
      const query = new URLSearchParams({ limit: String(limit) });
      if (cursor) query.append("cursor", cursor);

      return request<Conversation[]>(`/chat/conversations?${query.toString()}`);
    },

    getMessages: async (conversationId: string, limit = 50, cursor?: string): Promise<Message[]> => {
      const query = new URLSearchParams({ limit: String(limit) });
      if (cursor) query.append("cursor", cursor);

      return request<Message[]>(`/chat/conversations/${conversationId}/messages?${query.toString()}`);
    },

    sendMessage: async (data: { conversationId?: string; peerUserId?: string; text: string }): Promise<Message> => {
      return request<Message>(`/chat/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    markRead: async (conversationId: string): Promise<void> => {
      await request(`/chat/mark-read`, {
        method: "POST",
        body: JSON.stringify({ conversationId }),
      });
    },
  };
}
