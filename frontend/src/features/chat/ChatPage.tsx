import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatPane } from './components/ChatPane';
import { useAuth } from '@/contexts/AuthContext';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { dbUser } = useAuth()
  // You would get this from your user context
  const currentUserId = dbUser?._id; // Replace with actual user context

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatPane conversationId={conversationId} currentUserId={currentUserId} />
    </div>
  );
};