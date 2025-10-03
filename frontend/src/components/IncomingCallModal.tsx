import React from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';
import { useCall } from '../features/call/hooks/useCall';

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, acceptCall, declineCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
        <div className="mb-4">
          {incomingCall.caller.avatar ? (
            <img
              src={incomingCall.caller.avatar}
              alt={incomingCall.caller.name}
              className="w-20 h-20 rounded-full mx-auto mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <h3 className="text-lg font-semibold">{incomingCall.caller.name}</h3>
          <p className="text-gray-500">Incoming call...</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={declineCall}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={acceptCall}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 transition-colors"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};