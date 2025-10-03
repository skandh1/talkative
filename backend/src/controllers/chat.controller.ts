import { Request, Response } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chat.services';
import { safeParse, createErrorResponse } from '../utils/zod';

const createConversationSchema = z.object({
  peerUserId: z.string()
});

const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  peerUserId: z.string().optional(),
  text: z.string().min(1).max(2000)
}).refine(data => data.conversationId || data.peerUserId, {
  message: "Either conversationId or peerUserId must be provided"
});

const markReadSchema = z.object({
  conversationId: z.string()
});

export class ChatController {
  static async createOrGetConversation(req: Request, res: Response) {
    try {
      const { peerUserId } = safeParse(createConversationSchema, req.body);
      const userId = req.user?._id!;
      
      if (userId === peerUserId) {
        return res.status(400).json(createErrorResponse('INVALID_PEER', 'Cannot create conversation with yourself'));
      }
      // console.log(userId, peerUserId)
      
      const conversation = await ChatService.getOrCreate1to1(userId, peerUserId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json(createErrorResponse('CREATE_CONVERSATION_ERROR', (error as Error).message));
    }
  }

  static async getUserConversations(req: Request, res: Response) {
    try {
      const userId = req.user?._id!!;
      const limit = parseInt(req.query.limit as string) || 20;
      const cursor = req.query.cursor as string;
      
      const conversations = await ChatService.getUserConversations(userId, limit, cursor);
      res.json(conversations);
    } catch (error) {
      res.status(500).json(createErrorResponse('GET_CONVERSATIONS_ERROR', (error as Error).message));
    }
  }

  static async getMessages(req: Request, res: Response) {
    try {
      const { id: conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const cursor = req.query.cursor as string;
      
      const messages = await ChatService.getMessages(conversationId, limit, cursor);
      res.json(messages);
    } catch (error) {
      res.status(500).json(createErrorResponse('GET_MESSAGES_ERROR', (error as Error).message));
    }
  }

  // static async sendMessage(req: Request, res: Response) {
  //   try {
  //     const { conversationId, peerUserId, text } = safeParse(sendMessageSchema, req.body);
  //     const userId = req.user?._id!!;
  //     // console.log({ conversationId, peerUserId, text, userId });
      
  //     let finalConversationId = conversationId;
      
  //     if (!conversationId && peerUserId) {
  //       const conversation = await ChatService.getOrCreate1to1(userId, peerUserId);
  //       finalConversationId = conversation._id.toString();
  //     }
      
  //     if (!finalConversationId) {
  //       return res.status(400).json(createErrorResponse('INVALID_CONVERSATION', 'Invalid conversation'));
  //     }
      
  //     const message = await ChatService.sendMessage(userId, finalConversationId, text);
  //     res.json(message);
  //   } catch (error) {
  //     res.status(500).json(createErrorResponse('SEND_MESSAGE_ERROR', (error as Error).message));
  //   }
  // }

  static async sendMessage(req: Request, res: Response) {
  try {
    const { conversationId, peerUserId, text } = safeParse(sendMessageSchema, req.body);
    const userId = req.user?._id!!;
    
    let finalConversationId = conversationId;
    
    if (!conversationId && peerUserId) {
      const conversation = await ChatService.getOrCreate1to1(userId, peerUserId);
      finalConversationId = conversation._id.toString();
    }
    
    if (!finalConversationId) {
      return res.status(400).json(createErrorResponse('INVALID_CONVERSATION', 'Invalid conversation'));
    }
    
    // ✅ Send message and get conversation data
    const { message, conversation } = await ChatService.sendMessage(userId, finalConversationId, text);
    
    // ✅ Broadcast to other participants via WebSocket
    const wsServer = req.app.get('wsServer'); // Make sure wsServer is attached to app
    if (wsServer) {
      conversation.participants.forEach((participantId) => {
        const participantIdStr = participantId.toString();
        if (participantIdStr !== userId) {
          console.log('[Controller] Broadcasting message to participant:', participantIdStr);
          wsServer.broadcastToUser(participantIdStr, 'chat.message', message);
        }
      });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json(createErrorResponse('SEND_MESSAGE_ERROR', (error as Error).message));
  }
}
  static async markRead(req: Request, res: Response) {
    try {
      const { conversationId } = safeParse(markReadSchema, req.body);
      const userId = req.user?._id!!;
      
      await ChatService.markRead(conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json(createErrorResponse('MARK_READ_ERROR', (error as Error).message));
    }
  }
}