import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../state/chat.store.js';
import { chatAPI } from '../api/chat.js';
import { wsClient } from '../../../lib/ws.js';
import { type MessageEvent, type DeliveryEvent, type ReadEvent } from '../../../types/realtime';

export const useChat = () => {
  const queryClient = useQueryClient();
  const {
    conversations,
    messagesByConversation,
    activeConversationId,
    setConversations,
    addMessage,
    updateMessage,
    setActiveConversation,
    markMessagesAsRead,
    addConversation
  } = useChatStore();

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeMessage = wsClient.subscribe('chat.message', (message: MessageEvent) => {
      addMessage(message as any);
      
      // Mark as delivered immediately
      wsClient.send('chat.message.delivered', {
        messageId: message.id,
        senderId: message.senderId
      });
    });

    const unsubscribeDelivered = wsClient.subscribe('chat.message.delivered', (event: DeliveryEvent) => {
      updateMessage(event.messageId, {
        deliveredTo: [event.userId] // This should be merged properly in a real implementation
      });
    });

    const unsubscribeRead = wsClient.subscribe('chat.message.read', (event: ReadEvent) => {
      updateMessage(event.messageId, {
        readBy: [event.userId] // This should be merged properly in a real implementation  
      });
    });

    return () => {
      unsubscribeMessage();
      unsubscribeDelivered();
      unsubscribeRead();
    };
  }, [addMessage, updateMessage]);

  // Queries
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: chatAPI.getUserConversations,
    onSuccess: setConversations
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId ? chatAPI.getMessages(activeConversationId) : Promise.resolve([]),
    enabled: !!activeConversationId
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (message) => {
      addMessage(message);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: chatAPI.markRead,
    onSuccess: (_, conversationId) => {
      if (activeConversationId === conversationId) {
        // Mark messages as read in local state
        // In a real implementation, you'd get the current user ID from context
        markMessagesAsRead(conversationId, 'currentUserId');
      }
    }
  });

  const createConversationMutation = useMutation({
    mutationFn: chatAPI.createOrGetConversation,
    onSuccess: (conversation) => {
      addConversation(conversation);
    }
  });

  const openOrCreateConversation = async (peerUserId: string) => {
    const conversation = await createConversationMutation.mutateAsync(peerUserId);
    setActiveConversation(conversation._id);
    return conversation;
  };

  const sendMessage = (text: string, conversationId?: string, peerUserId?: string) => {
    return sendMessageMutation.mutate({ text, conversationId, peerUserId });
  };

  return {
    conversations,
    messages: activeConversationId ? messagesByConversation[activeConversationId] || [] : [],
    activeConversationId,
    isLoading: conversationsQuery.isLoading || messagesQuery.isLoading,
    openOrCreateConversation,
    sendMessage,
    markRead: markReadMutation.mutate,
    setActiveConversation
  };
};