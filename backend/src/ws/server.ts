import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { adminAuth } from '../firebase-admin';
import { UserPresence } from '../types/global';
import { User } from '../models/User';

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
      console.log("[WS] New connection attempt. Token:", !!token);

      if (!token) {
        console.warn("[WS] Connection rejected: No token provided");
        ws.close(1008, 'No token provided');
        return;
      }

      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log("[WS] Firebase token decoded:", decodedToken.name || decodedToken.uid);

      const firebaseUid = decodedToken.uid;

      // ✅ Query MongoDB to get the real user document
      const user = await User.findOne({ uid: firebaseUid });
      if (!user) {
        console.warn("[WS] No user found in MongoDB for firebaseUid:", firebaseUid);
        ws.close(1008, 'User not found');
        return;
      }

      const userId = user.id.toString();
      console.log("[WS] User authenticated. Firebase UID:", firebaseUid, "MongoDB ID:", userId);

      // ✅ Store user information in WebSocket for easy access
      (ws as any).userId = userId;
      (ws as any).user = user;

      // Store presence
      this.presenceMap.set(userId, {
        userId,
        socket: ws,
        lastSeen: new Date()
      });
      console.log("[WS] Presence map updated. Current users:", Array.from(this.presenceMap.keys()));

      ws.on('message', (data) => {
        console.log("[WS] Message received from", userId, ":", data.toString());
        this.handleMessage(ws, userId, data);
      });

      ws.on('close', () => {
        console.log("[WS] Disconnected:", userId);
        this.handleDisconnect(userId);
      });

      ws.on('pong', () => {
        console.log("[WS] Pong received from", userId);
        this.handlePong(userId);
      });

      // ✅ Send connection confirmation
      this.send(ws, 'connection.confirmed', { userId });
      console.log("[WS] Connection confirmed sent to", userId);

    } catch (error) {
      console.error("[WS] Authentication failed:", error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private handleMessage(ws: WebSocket, userId: string, data: Buffer) {
    try {
      const message = JSON.parse(data.toString());
      console.log("[WS] Routing message from", userId, ":", message);
      this.routeMessage(userId, message);
    } catch (error) {
      console.error('[WS] Invalid message format:', error);
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
    console.log("[WS] Handling WebRTC signaling:", type, "from", userId);

    if (type === 'call.webrtc.offer' || type === 'call.webrtc.answer' || type === 'call.webrtc.ice') {
      this.broadcastToCall(callId, userId, type, payload);
    }
  }

  private handleChatEvent(userId: string, type: string, payload: any) {
    console.log("[WS] Handling chat event:", type, "from", userId, "payload:", payload);

    if (type === 'chat.message.delivered') {
      // ✅ FIXED: Send delivery confirmation to the MESSAGE SENDER, not the receiver
      console.log("[WS] Broadcasting delivery confirmation to sender:", payload.senderId);
      this.broadcastToUser(payload.senderId, 'chat.message.delivered', {
        messageId: payload.messageId,
        userId, // The user who received the message
        at: new Date().toISOString()
      });

    } else if (type === 'chat.message.read') {
      // ✅ FIXED: Send read confirmation to the MESSAGE SENDER, not the reader  
      console.log("[WS] Broadcasting read confirmation to sender:", payload.senderId);
      this.broadcastToUser(payload.senderId, 'chat.message.read', {
        messageId: payload.messageId,
        userId, // The user who read the message
        at: new Date().toISOString()
      });
    }
  }

  private handleDisconnect(userId: string) {
    console.log("[WS] Cleaning up user presence:", userId);
    this.presenceMap.delete(userId);
  }

  private handlePong(userId: string) {
    const presence = this.presenceMap.get(userId);
    if (presence) {
      presence.lastSeen = new Date();
    }
  }

  private heartbeat() {
    console.log("[WS] Running heartbeat. Connected users:", Array.from(this.presenceMap.keys()));
    this.presenceMap.forEach((presence, userId) => {
      if (presence.socket.readyState === WebSocket.OPEN) {
        console.log("[WS] Pinging user:", userId);
        presence.socket.ping();
      } else {
        console.warn("[WS] Removing dead connection:", userId);
        this.presenceMap.delete(userId);
      }
    });
  }

  // ✅ Enhanced broadcast method with better logging
  public broadcastToUser(userId: string, type: string, payload: any) {
    console.log("[WS] Attempting to broadcast to userId:", userId, "Type:", type, "Payload:", payload);

    const presence = this.presenceMap.get(userId);
    if (!presence) {
      console.warn("[WS] User not in presenceMap:", userId, "Available users:", Array.from(this.presenceMap.keys()));
      return false;
    }

    if (presence.socket.readyState === WebSocket.OPEN) {
      console.log("[WS] ✅ Broadcast success →", userId);
      this.send(presence.socket, type, payload);
      return true;
    } else {
      console.warn("[WS] Socket not open for user:", userId, "ReadyState:", presence.socket.readyState);
      this.presenceMap.delete(userId); // Clean up dead connection
      return false;
    }
  }

  // ✅ Method to broadcast new messages to conversation participants
  public broadcastNewMessage(conversationId: string, message: any, excludeUserId?: string) {
    console.log("[WS] Broadcasting new message to conversation:", conversationId, "excluding:", excludeUserId);
    
    // Get all participants in the conversation (you'll need to query your Conversation model)
    // For now, we'll broadcast to all connected users except the sender
    this.presenceMap.forEach((presence, userId) => {
      if (userId !== excludeUserId) {
        console.log("[WS] Broadcasting message to participant:", userId);
        this.broadcastToUser(userId, 'chat.message', message);
      }
    });
  }

  public broadcastToCall(callId: string, excludeUserId: string, type: string, payload: any) {
    console.log("[WS] Broadcasting to call:", callId, "excluding:", excludeUserId);
    
    // This would query the Call model to find participants
    // For simplicity, we'll pass the target in the payload
    if (payload.targetUserId) {
      this.broadcastToUser(payload.targetUserId, type, payload);
    }
  }

  private send(ws: WebSocket, type: string, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      console.log("[WS] Sending message:", type, "Payload:", payload);
      ws.send(message);
    } else {
      console.warn("[WS] Cannot send message - socket not open");
    }
  }

  public close() {
    console.log("[WS] Closing WebSocket server");
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }

  // ✅ Helper method to get connection statistics
  public getStats() {
    return {
      totalConnections: this.presenceMap.size,
      connectedUsers: Array.from(this.presenceMap.keys()),
      serverStatus: 'running'
    };
  }
}