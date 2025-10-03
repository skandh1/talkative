import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wsClient } from '../lib/ws';

const WebSocketConnectionManager: React.FC = () => {
  // Destructure the needed values from the hook
  const { dbUser, getToken } = useAuth();

  useEffect(() => {
    // Define an async function to fetch the token and connect
    const connectWebSocket = async () => {
      if (dbUser) {
        try {
          // Await the token here, inside the async function
          const token = await getToken();
          wsClient.connect(token);
        } catch (error) {
          console.error('Failed to get Firebase token:', error);
        }
      }
    };

    connectWebSocket(); // Call the async function

    // The cleanup function for the effect
    return () => {
      wsClient.disconnect();
    };
  }, [dbUser, getToken]); // Add getToken to the dependency array

  return null;
};

export default WebSocketConnectionManager;