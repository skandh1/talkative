import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Send, Check, CheckCheck, MessageSquareText, Loader2 } from 'lucide-react';

// --- Imports from your application structure ---
// (These are placeholders for your actual file paths)
import { useChat } from '../hooks/useChat'; 


// --- ChatPane Component ---

interface ChatPaneProps {
  conversationId: string;
  currentUserId: string | undefined;
}

export const ChatPane: React.FC<ChatPaneProps> = ({ conversationId, currentUserId }) => {
  // ✅ Now using your real useChat hook
  const { messages, sendMessage, markRead, setActiveConversation, isLoading } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log("messages", messages)

  // Set active conversation when the conversationId prop changes
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId, setActiveConversation]);

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    // Added a small timeout to allow the DOM to update before scrolling
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

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
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-center p-4">
        <MessageSquareText className="w-16 h-16 text-slate-300 mb-4" strokeWidth={1} />
        <h2 className="text-xl font-medium text-slate-600">Welcome to your Chat</h2>
        <p className="text-slate-500 mt-1">Select a conversation to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* ✅ Added a loading state for better UX during initial message fetch */}
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">No messages yet. Be the first to say hi! 👋</p>
          </div>
        ) : (
          sortedMessages.map((message) => {
            const isOwn = message?.senderId?._id === currentUserId;
            return (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md lg:max-w-lg px-4 py-3 shadow-md ${
                    isOwn
                      ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-t-2xl rounded-l-2xl'
                      : 'bg-white text-slate-800 rounded-t-2xl rounded-r-2xl border border-slate-200'
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                  <div className="flex items-center justify-end mt-1.5 space-x-2">
                    <span className={`text-xs ${isOwn ? 'text-sky-100' : 'text-slate-400'}`}>
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

      <div className="bg-white border-t border-slate-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-100 border-transparent rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            maxLength={2000}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex-shrink-0 w-12 h-12 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};