import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
// import { verifyFirebaseToken } from '../utils/firebaseAuth.js';
import { adminAuth } from '../firebase-admin';
import { UserPresence } from '../types/global';

export class WSServer {
  private wss: WebSocketServer;
  private presenceMap = new Map<string, UserPresence>();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Setup heartbeat
    this.heartbeatInterval = setInterval(this.heartbeat.bind(this), 30000);
  }

  private async handleConnection(ws: WebSocket, req: any) {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'No token provided');
        return;
      }
      const decodedToken = await adminAuth.verifyIdToken(token);
      const userId = decodedToken.uid
      // const userId = await verifyFirebaseToken(token);
      
      // Store user presence
      this.presenceMap.set(userId, {
        userId,
        socket: ws,
        lastSeen: new Date()
      });

      ws.on('message', (data) => this.handleMessage(ws, userId, data));
      ws.on('close', () => this.handleDisconnect(userId));
      ws.on('pong', () => this.handlePong(userId));

      // Send connection confirmation
      this.send(ws, 'connection.confirmed', { userId });
      
    } catch (error) {
      ws.close(1008, 'Authentication failed');
    }
  }

  private handleMessage(ws: WebSocket, userId: string, data: Buffer) {
    try {
      const message = JSON.parse(data.toString());
      this.routeMessage(userId, message);
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  }

  private routeMessage(userId: string, message: any) {
    const { type, payload } = message;

    if (type.startsWith('call.webrtc.')) {
      this.handleWebRTCSignaling(userId, type, payload);
    } else if (type.startsWith('chat.')) {
      this.handleChatEvent(userId, type, payload);
    }
  }

  private handleWebRTCSignaling(userId: string, type: string, payload: any) {
    const { callId } = payload;
    
    // Find the other participant in the call
    // This would need to query the Call model to find the peer
    // For now, we'll broadcast to the intended recipient
    
    if (type === 'call.webrtc.offer' || type === 'call.webrtc.answer' || type === 'call.webrtc.ice') {
      // Determine the target user based on the call
      this.broadcastToCall(callId, userId, type, payload);
    }
  }

  private handleChatEvent(userId: string, type: string, payload: any) {
    if (type === 'chat.message.delivered') {
      this.broadcastToUser(payload.senderId, 'chat.message.delivered', {
        messageId: payload.messageId,
        userId,
        at: new Date().toISOString()
      });
    } else if (type === 'chat.message.read') {
      this.broadcastToUser(payload.senderId, 'chat.message.read', {
        messageId: payload.messageId,
        userId,
        at: new Date().toISOString()
      });
    }
  }

  private handleDisconnect(userId: string) {
    this.presenceMap.delete(userId);
  }

  private handlePong(userId: string) {
    const presence = this.presenceMap.get(userId);
    if (presence) {
      presence.lastSeen = new Date();
    }
  }

  private heartbeat() {
    this.presenceMap.forEach((presence, userId) => {
      if (presence.socket.readyState === WebSocket.OPEN) {
        presence.socket.ping();
      } else {
        this.presenceMap.delete(userId);
      }
    });
  }

  public broadcastToUser(userId: string, type: string, payload: any) {
    const presence = this.presenceMap.get(userId);
    if (presence && presence.socket.readyState === WebSocket.OPEN) {
      this.send(presence.socket, type, payload);
    }
  }

  public broadcastToCall(callId: string, excludeUserId: string, type: string, payload: any) {
    // This would query the Call model to find participants
    // For simplicity, we'll pass the target in the payload
    if (payload.targetUserId) {
      this.broadcastToUser(payload.targetUserId, type, payload);
    }
  }

  private send(ws: WebSocket, type: string, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  public close() {
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }
}