import { type WSMessage, type WSEventType } from '../types/realtime';

class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private isAuthenticated = false;
  private currentToken: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';
  }

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated) {
      return;
      
    }
    // Store token for reconnection
    this.currentToken = token;

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close existing connection if any
    if (this.ws) {
      this.ws.close();
    }

    const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.isAuthenticated = false;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        if (message.type === 'connection.confirmed') {
          console.log('WebSocket authentication confirmed');
          this.isAuthenticated = true;
          return;
        }

        const listeners = this.listeners.get(message.type);
        if (listeners) {
          listeners.forEach(callback => {
            try {
              callback(message.payload);
            } catch (error) {
              console.error('Error in WebSocket listener:', error);
            }
          });
        } else {
          console.log('No listeners for message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isAuthenticated = false;
      
      // Only attempt reconnect if we have a token and it wasn't a manual close
      if (this.currentToken && event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.currentToken) {
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect(this.currentToken);
      }
    }, delay);
  }

  send(type: WSEventType, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated) {
      const message = { type, payload };
      console.log('Sending WebSocket message:', message);
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('Cannot send message - WebSocket not ready:', {
        readyState: this.ws?.readyState,
        isAuthenticated: this.isAuthenticated
      });
      return false;
    }
  }

  subscribe(eventType: WSEventType, callback: (data: any) => void) {
    console.log('Subscribing to WebSocket event:', eventType);
    
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from WebSocket event:', eventType);
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  disconnect() {
    console.log('Manually disconnecting WebSocket');
    
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Clear token to prevent reconnection
    this.currentToken = null;
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.listeners.clear();
    this.isAuthenticated = false;
    this.reconnectAttempts = 0;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  get connectionState() {
    return {
      readyState: this.ws?.readyState,
      isAuthenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
      hasToken: !!this.currentToken
    };
  }
}

export const wsClient = new WSClient();