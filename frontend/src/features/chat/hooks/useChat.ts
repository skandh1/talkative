import { useEffect } from "react";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../state/chat.store.js";
import { useChatAPI } from "../api/chat"; // ✅ updated name
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
    prependMessages, // ✅ Added for pagination
  } = useChatStore();

  const { dbUser } = useAuth(); // ✅ get current logged-in user
  const chatAPI = useChatAPI(); // ✅ new API wrapper

  // ✅ Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeMessage = wsClient.subscribe("chat.message", (message: MessageEvent) => {
      addMessage(message as any);

      // Mark as delivered immediately
      wsClient.send("chat.message.delivered", {
        messageId: message.id,
        senderId: message.senderId,
      });
    });

    const unsubscribeDelivered = wsClient.subscribe(
      "chat.message.delivered",
      (event: DeliveryEvent) => {
        updateMessage(event.messageId, {
          deliveredTo: [event.userId], // ⚠️ should merge properly in real impl
        });
      }
    );

    const unsubscribeRead = wsClient.subscribe("chat.message.read", (event: ReadEvent) => {
      updateMessage(event.messageId, {
        readBy: [event.userId], // ⚠️ should merge properly in real impl
      });
    });

    return () => {
      unsubscribeMessage();
      unsubscribeDelivered();
      unsubscribeRead();
    };
  }, [addMessage, updateMessage]);

  // ✅ Fixed Queries with proper React Query v5 syntax and correct typing
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatAPI.getUserConversations(), // ✅ Wrap in arrow function with no parameters
  });

  // ✅ Update conversations when query succeeds
  useEffect(() => {
    if (conversationsQuery.data && Array.isArray(conversationsQuery.data)) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data, setConversations]);

  // ✅ Changed to useInfiniteQuery for pagination
  const messagesQuery = useInfiniteQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: ({ pageParam }) =>
      activeConversationId
        ? chatAPI.getMessages(activeConversationId, 50, pageParam)
        : Promise.resolve([]),
    enabled: !!activeConversationId,
    getNextPageParam: (lastPage) => {
      // Use the oldest message's createdAt as the cursor for next page
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].createdAt;
    },
    initialPageParam: undefined as string | undefined,
  });

  // ✅ Update messages when query succeeds - handle infinite query data
  useEffect(() => {
    if (messagesQuery.data && activeConversationId) {
      // Flatten all pages and set messages
      const allMessages = messagesQuery.data.pages.flat();
      setMessages(activeConversationId, allMessages);
    }
  }, [messagesQuery.data, activeConversationId, setMessages]);

  // ✅ Mutations
  const sendMessageMutation = useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (message) => {
      addMessage(message);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: chatAPI.markRead,
    onSuccess: (_, conversationId) => {
      if (activeConversationId === conversationId && dbUser) {
        markMessagesAsRead(conversationId, dbUser._id);
      }
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: chatAPI.createOrGetConversation,
    onSuccess: (conversation) => {
      addConversation(conversation);
    },
  });

  // ✅ Helpers
  const openOrCreateConversation = async (peerUserId: string) => {
    const conversation = await createConversationMutation.mutateAsync(peerUserId);
    setActiveConversation(conversation._id);
    return conversation;
  };

  const sendMessage = (text: string, conversationId?: string, peerUserId?: string) => {
    return sendMessageMutation.mutate({ text, conversationId, peerUserId });
  };

  // ✅ Load more messages function
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