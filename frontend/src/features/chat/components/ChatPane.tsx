import React, { useEffect, useRef, useState } from 'react';
import { Send, Check, CheckCheck } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { type Message } from '../api/chat';

interface ChatPaneProps {
  conversationId: string;
  currentUserId: string;
}

export const ChatPane: React.FC<ChatPaneProps> = ({ conversationId, currentUserId }) => {
  const { messages, sendMessage, markRead } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when conversation is viewed
    markRead(conversationId);
  }, [conversationId, markRead]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim(), conversationId);
      setNewMessage('');
    }
  };

  const getMessageStatus = (message: Message) => {
    const isOwn = message.senderId._id === currentUserId;
    if (!isOwn) return null;

    const isRead = message.readBy.length > 1; // More than just sender
    const isDelivered = message.deliveredTo.length > 0;

    if (isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else if (isDelivered) {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
    return <Check className="w-4 h-4 text-gray-300" />;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId._id === currentUserId;
          return (
            <div
              key={message._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {getMessageStatus(message)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};