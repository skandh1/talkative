import { create } from 'zustand';
import { type Conversation, type Message } from '../api/chat.js';

interface ChatState {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  activeConversationId: string | null;
  isLoading: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setActiveConversation: (conversationId: string | null) => void;
  markMessagesAsRead: (conversationId: string, userId: string) => void;
  updateUnreadCount: (conversationId: string, userId: string, count: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messagesByConversation: {},
  activeConversationId: null,
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations.filter(c => c._id !== conversation._id)]
  })),

  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv._id === conversationId ? { ...conv, ...updates } : conv
    )
  })),

  setMessages: (conversationId, messages) => set((state) => ({
    messagesByConversation: {
      ...state.messagesByConversation,
      [conversationId]: messages
    }
  })),

  addMessage: (message) => set((state) => {
    const conversationMessages = state.messagesByConversation[message.conversationId] || [];
    
    // Avoid duplicates
    if (conversationMessages.some(m => m._id === message._id)) {
      return state;
    }

    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [message.conversationId]: [message, ...conversationMessages]
      }
    };
  }),

  updateMessage: (messageId, updates) => set((state) => {
    const newMessagesByConversation = { ...state.messagesByConversation };
    
    Object.keys(newMessagesByConversation).forEach(conversationId => {
      newMessagesByConversation[conversationId] = newMessagesByConversation[conversationId].map(msg => 
        msg._id === messageId ? { ...msg, ...updates } : msg
      );
    });

    return { messagesByConversation: newMessagesByConversation };
  }),

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  markMessagesAsRead: (conversationId, userId) => set((state) => {
    const messages = state.messagesByConversation[conversationId] || [];
    const updatedMessages = messages.map(msg => ({
      ...msg,
      readBy: msg.readBy.includes(userId) ? msg.readBy : [...msg.readBy, userId]
    }));

    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: updatedMessages
      }
    };
  }),

  updateUnreadCount: (conversationId, userId, count) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv._id === conversationId 
        ? { 
            ...conv, 
            unreadCountByUser: { ...conv.unreadCountByUser, [userId]: count }
          }
        : conv
    )
  }))
}));  