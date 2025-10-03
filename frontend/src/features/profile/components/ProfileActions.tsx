import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useCall } from '../../call/hooks/useCall';
import { useChat } from  '../../chat/hooks/useChat';
import { useNavigate } from 'react-router-dom';

interface ProfileActionsProps {
  userId: string;
  userName: string;
  currentUserId: string;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({ 
  userId, 
  userName, 
  currentUserId 
}) => {
  const { startCall } = useCall();
  const { openOrCreateConversation } = useChat();
  const navigate = useNavigate();

  const handleCall = async () => {
    try {
      await startCall(userId, userName);
    } catch (error) {
      console.error('Failed to start call:', error);
      // You might want to show a toast notification here
    }
  };

  const handleChat = async () => {
    try {
      const conversation = await openOrCreateConversation(userId);
      console.log("conversation", conversation)
      navigate(`/chat/${conversation._id}`);
    } catch (error) {
      console.error('Failed to open chat:', error);
      // You might want to show a toast notification here
    }
  };

  // Don't show actions for own profile
  if (userId === currentUserId) {
    return null;
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={handleCall}
        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Phone className="w-4 h-4" />
        <span>Call</span>
      </button>
      
      <button
        onClick={handleChat}
        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Chat</span>
      </button>
    </div>
  );
};