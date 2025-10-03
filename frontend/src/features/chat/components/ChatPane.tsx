import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
  import { Send, Check, CheckCheck, MessageSquareText, Loader2, ArrowDown } from 'lucide-react';
  
  // --- Imports from your application structure ---
  // (These are placeholders for your actual file paths)
  import { useChat } from '../hooks/useChat'; 
  
  
  // --- ChatPane Component ---
  
  interface ChatPaneProps {
    conversationId: string;
    currentUserId: string | undefined;
  }
  
  export const ChatPane: React.FC<ChatPaneProps> = ({ conversationId, currentUserId }) => {
    // ✅ Now using your real useChat hook with pagination support
    const { 
      messages, 
      sendMessage, 
      markRead, 
      setActiveConversation, 
      isLoading,
      hasMoreMessages,
      isLoadingMore,
      loadMoreMessages
    } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    // console.log("messages", messages)
  
    // Set active conversation when the conversationId prop changes
    useEffect(() => {
      if (conversationId) {
        console.log('Setting active conversation:', conversationId);
        setActiveConversation(conversationId);
      }
    }, [conversationId, setActiveConversation]);
  
    // ✅ Scroll to bottom logic - only when user is near bottom
    useEffect(() => {
      if (isNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, [messages, isNearBottom]);
  
    // ✅ Track if user is near bottom of chat
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(nearBottom);
      setShowScrollButton(!nearBottom && messages.length > 0);
  
      // ✅ Load more messages when scrolled to top
      if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
        loadMoreMessages();
      }
    }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    // Mark messages as read when the conversation is viewed
    useEffect(() => {
      if (conversationId && messages.length > 0) {
        // Find unread messages from the other user
        const unreadMessages = messages.some(m => 
          m.senderId?._id !== currentUserId && !m.readBy.includes(currentUserId || '')
        );
        if (unreadMessages) {
            markRead(conversationId);
        }
      }
    }, [conversationId, messages, currentUserId, markRead]);
  
    // ✅ Memoize and sort messages to ensure chronological order, even with real-time updates.
    const sortedMessages = useMemo(() => {
      // The hook provides already-filtered messages, so we just sort them.
      return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages]);
  
  
    const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (newMessage.trim() && conversationId) {
        // ✅ The hook's sendMessage function is used here
        sendMessage(newMessage.trim(), conversationId);
        setNewMessage('');
      }
    };
  
    const getMessageStatus = (message: any) => {
      const isOwn = message.senderId?._id === currentUserId;
      if (!isOwn) return null;
  
      const isRead = message.readBy.length > 1; // Assumes sender is always in readBy
      const isDelivered = message.deliveredTo.length > 0;
  
      if (isRead) {
        return <CheckCheck className="w-4 h-4 text-sky-300" />;
      }
      if (isDelivered) {
        return <CheckCheck className="w-4 h-4 text-slate-400" />;
      }
      return <Check className="w-4 h-4 text-slate-400" />;
    };
  
    if (!conversationId) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100 text-center p-8">
          <div className="bg-white rounded-full p-6 shadow-lg mb-6">
            <MessageSquareText className="w-12 h-12 text-sky-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Welcome to Chat</h2>
          <p className="text-slate-500 max-w-md leading-relaxed">Select a conversation from the sidebar to start messaging, or create a new conversation to connect with someone.</p>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-white to-slate-50 relative">
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          onScroll={handleScroll}
        >
          {/* ✅ Loading indicator for loading more messages */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="bg-white rounded-full px-4 py-2 shadow-sm border">
                <Loader2 className="w-4 h-4 text-sky-500 animate-spin inline mr-2" />
                <span className="text-sm text-slate-600">Loading messages...</span>
              </div>
            </div>
          )}
          
          {/* ✅ Added a loading state for better UX during initial message fetch */}
          {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white rounded-full p-4 shadow-lg mb-4">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                  </div>
                  <p className="text-slate-500">Loading conversation...</p>
              </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-8 text-center max-w-sm">
                <div className="text-4xl mb-4">👋</div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">Start the conversation</h3>
                <p className="text-slate-500 text-sm">No messages yet. Send the first message to get things started!</p>
              </div>
            </div>
          ) : (
            sortedMessages.map((message) => {
              const isOwn = message?.senderId?._id === currentUserId;
              return (
                <div
                  key={message._id}
                  className={`flex items-end gap-3 ${isOwn ? 'justify-end' : 'justify-start'} group`}
                >
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {message.senderId?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div
                    className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md ${
                      isOwn
                        ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-100'
                    }`}
                  >
                    <p className="text-sm break-words leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-end mt-2 space-x-1">
                      <span className={`text-xs ${isOwn ? 'text-sky-100' : 'text-slate-400'} opacity-75`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      {getMessageStatus(message)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
  
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-6 bg-white hover:bg-slate-50 text-slate-600 rounded-full p-3 shadow-lg border border-slate-200 transition-all duration-200 hover:shadow-xl z-10"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
  
        <div className="bg-white border-t border-slate-100 p-4 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 hover:bg-white"
              maxLength={2000}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  };