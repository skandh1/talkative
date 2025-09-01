import React, { useEffect, useState } from 'react';
import { Phone, Mic, MicOff } from 'lucide-react';
import { useCall } from '../hooks/useCall';

export const ActiveCallBar: React.FC = () => {
  const { activeCall, endCall, toggleMute } = useCall();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!activeCall) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall]);

  if (!activeCall) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg px-4 py-2 flex items-center space-x-4 shadow-lg z-40">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-sm font-medium">{activeCall.peerName}</span>
      </div>
      
      <span className="text-sm text-gray-300">{formatDuration(duration)}</span>
      
      <div className="flex space-x-2">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-full transition-colors ${
            activeCall.isMuted 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {activeCall.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        
        <button
          onClick={endCall}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};