import { useEffect } from "react";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../state/chat.store.js";
import { useChatAPI } from "../api/chat";
import { wsClient } from "../../../lib/ws.js";
import { type MessageEvent, type DeliveryEvent, type ReadEvent } from "../../../types/realtime";
import { useAuth } from "@/contexts/AuthContext";

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
    addConversation,
    setMessages,
    prependMessages,
  } = useChatStore();

  const { dbUser } = useAuth();
  const chatAPI = useChatAPI();

  // ✅ WebSocket subscription with proper error handling and user validation
  useEffect(() => {
    if (!dbUser?._id) {
      console.log("No dbUser._id yet, skipping WebSocket subscription");
      return;
    }

    console.log("Subscribing WebSocket events for user:", dbUser._id);

    // Handle new incoming messages
    const unsubscribeMessage = wsClient.subscribe("chat.message", (message: MessageEvent) => {
      console.log("Received WebSocket message:", message);

      // ✅ Add message to store immediately for real-time display
      addMessage({
        ...message,
        // Ensure proper structure
        senderId: typeof message.senderId === 'string'
          ? { _id: message.senderId, name: 'Unknown' }  // Handle if senderId is just string
          : message.senderId,
        deliveredTo: message.deliveredTo || [],
        readBy: message.readBy || [message.senderId]
      } as any);

      // ✅ Send delivery confirmation only for messages from others
      if (message.senderId !== dbUser._id && message.senderId?._id !== dbUser._id) {
        console.log("Sending delivery confirmation for message:", message._id);
        wsClient.send("chat.message.delivered", {
          messageId: message._id,
          senderId: typeof message.senderId === 'string' ? message.senderId : message.senderId._id,
        });
      }

      // ✅ Invalidate conversations to update last message and timestamps
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    // Handle delivery confirmations
    const unsubscribeDelivered = wsClient.subscribe(
      "chat.message.delivered",
      (event: DeliveryEvent) => {
        console.log("Message delivered event received:", event);
        updateMessage(event.messageId, {
          deliveredTo: [event.userId],
        });
      }
    );

    // Handle read confirmations
    const unsubscribeRead = wsClient.subscribe("chat.message.read", (event: ReadEvent) => {
      console.log("Message read event received:", event);
      updateMessage(event.messageId, {
        readBy: [event.userId],
      });
    });

    return () => {
      console.log("Unsubscribing WebSocket listeners");
      unsubscribeMessage();
      unsubscribeDelivered();
      unsubscribeRead();
    };
  }, [addMessage, updateMessage, dbUser?._id, queryClient]);

  // ✅ Conversations query
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatAPI.getUserConversations(),
    enabled: !!dbUser?._id,
  });

  // ✅ Update conversations when query succeeds
  useEffect(() => {
    if (conversationsQuery.data && Array.isArray(conversationsQuery.data)) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data, setConversations]);

  // ✅ Messages infinite query
  const messagesQuery = useInfiniteQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: ({ pageParam }) =>
      activeConversationId
        ? chatAPI.getMessages(activeConversationId, 50, pageParam)
        : Promise.resolve([]),
    enabled: !!activeConversationId,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].createdAt;
    },
    initialPageParam: undefined as string | undefined,
  });

  // ✅ Update messages when query succeeds
  // A simpler, often correct approach for initial/paginated data
  useEffect(() => {
    if (messagesQuery.data && activeConversationId) {
      const allMessages = messagesQuery.data.pages.flat();

      // 🔥 Remove the check and just set the messages.
      // The query data is the source of truth for all "historical" messages.
      // Real-time updates should handle new messages *after* this load.
      setMessages(activeConversationId, allMessages);
    }
  }, [messagesQuery.data, activeConversationId, setMessages]); // Removed messagesByConversation dependency

  // ✅ Send message mutation with optimistic updates
  // ✅ Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: chatAPI.sendMessage,
    onMutate: async (messageData) => {
      // ✅ Optimistic update - add message immediately
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        text: messageData.text,
        conversationId: messageData.conversationId || activeConversationId!,
        senderId: dbUser,
        createdAt: new Date().toISOString(),
        deliveredTo: [],
        readBy: [dbUser._id],
        isOptimistic: true
      };

      if (optimisticMessage.conversationId) {
        addMessage(optimisticMessage as any);
      }

      return { optimisticMessage };
    },
    onSuccess: (message, variables, context) => {
      console.log('Message sent successfully:', message);

      // ✅ Only replace optimistic message with real one
      if (context?.optimisticMessage) {
        const conversationId = message.conversationId;
        const currentMessages = messagesByConversation[conversationId] || [];

        // Remove optimistic message and add real one (if not already added by WebSocket)
        const filteredMessages = currentMessages.filter(m => !m.isOptimistic && m._id !== message._id);
        setMessages(conversationId, [...filteredMessages, message]);
      }
      // ✅ REMOVED: else branch that was calling addMessage()
      // The WebSocket event will handle adding the message for real-time display

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error, variables, context) => {
      console.error('Failed to send message:', error);

      // ✅ Remove optimistic message on error
      if (context?.optimisticMessage) {
        const conversationId = context.optimisticMessage.conversationId;
        const currentMessages = messagesByConversation[conversationId] || [];
        const filteredMessages = currentMessages.filter(m => !m.isOptimistic);
        setMessages(conversationId, filteredMessages);
      }
    },
  });

  // ✅ Mark read mutation
  const markReadMutation = useMutation({
    mutationFn: chatAPI.markRead,
    onSuccess: (_, conversationId) => {
      if (activeConversationId === conversationId && dbUser?._id) {
        markMessagesAsRead(conversationId, dbUser._id);

        // ✅ Send read confirmation via WebSocket
        const messages = messagesByConversation[conversationId] || [];
        const unreadMessages = messages.filter(m =>
          m.senderId._id !== dbUser._id && !m.readBy.includes(dbUser._id)
        );

        unreadMessages.forEach(message => {
          wsClient.send("chat.message.read", {
            messageId: message._id,
            senderId: message.senderId._id,
          });
        });
      }
    },
  });

  // ✅ Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: chatAPI.createOrGetConversation,
    onSuccess: (conversation) => {
      addConversation(conversation);
    },
  });

  // ✅ Helper functions
  const openOrCreateConversation = async (peerUserId: string) => {
    const conversation = await createConversationMutation.mutateAsync(peerUserId);
    setActiveConversation(conversation._id);
    return conversation;
  };

  const sendMessage = (text: string, conversationId?: string, peerUserId?: string) => {
    const messageData = { text, conversationId, peerUserId };
    console.log('Sending message:', messageData);
    return sendMessageMutation.mutate(messageData);
  };

  const loadMoreMessages = () => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      messagesQuery.fetchNextPage();
    }
  };

  return {
    conversations,
    messages: activeConversationId
      ? messagesByConversation[activeConversationId] || []
      : [],
    activeConversationId,
    isLoading: conversationsQuery.isLoading || messagesQuery.isLoading,
    hasMoreMessages: messagesQuery.hasNextPage,
    isLoadingMore: messagesQuery.isFetchingNextPage,
    loadMoreMessages,
    openOrCreateConversation,
    sendMessage,
    markRead: markReadMutation.mutate,
    setActiveConversation,
  };
};