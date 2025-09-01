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
      const userId = req.userId!;
      
      if (userId === peerUserId) {
        return res.status(400).json(createErrorResponse('INVALID_PEER', 'Cannot create conversation with yourself'));
      }
      
      const conversation = await ChatService.getOrCreate1to1(userId, peerUserId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json(createErrorResponse('CREATE_CONVERSATION_ERROR', (error as Error).message));
    }
  }

  static async getUserConversations(req: Request, res: Response) {
    try {
      const userId = req.userId!;
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

  static async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId, peerUserId, text } = safeParse(sendMessageSchema, req.body);
      const userId = req.userId!;
      
      let finalConversationId = conversationId;
      
      if (!conversationId && peerUserId) {
        const conversation = await ChatService.getOrCreate1to1(userId, peerUserId);
        finalConversationId = conversation._id.toString();
      }
      
      if (!finalConversationId) {
        return res.status(400).json(createErrorResponse('INVALID_CONVERSATION', 'Invalid conversation'));
      }
      
      const message = await ChatService.sendMessage(userId, finalConversationId, text);
      res.json(message);
    } catch (error) {
      res.status(500).json(createErrorResponse('SEND_MESSAGE_ERROR', (error as Error).message));
    }
  }

  static async markRead(req: Request, res: Response) {
    try {
      const { conversationId } = safeParse(markReadSchema, req.body);
      const userId = req.userId!;
      
      await ChatService.markRead(conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json(createErrorResponse('MARK_READ_ERROR', (error as Error).message));
    }
  }
}