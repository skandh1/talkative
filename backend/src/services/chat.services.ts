import mongoose from 'mongoose';
import { Conversation, IConversation } from '../models/Conversation';
import { Message, IMessage } from '../models/Message';

export class ChatService {
  static async getOrCreate1to1(userId: string, peerUserId: string): Promise<IConversation> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const peerObjectId = new mongoose.Types.ObjectId(peerUserId);
    
    // Sort participants to ensure consistent ordering
    const participants = [userObjectId, peerObjectId].sort((a, b) => a.toString().localeCompare(b.toString()));
    
    let conversation = await Conversation.findOne({ participants });
    
    if (!conversation) {
      conversation = new Conversation({
        participants,
        unreadCountByUser: new Map([
          [userId, 0],
          [peerUserId, 0]
        ])
      });
      await conversation.save();
    }
    
    return conversation;
  }

  static async getUserConversations(userId: string, limit = 20, cursor?: string): Promise<IConversation[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query: any = { participants: userObjectId };
    
    if (cursor) {
      query.updatedAt = { $lt: new Date(cursor) };
    }
    
    return Conversation.find(query)
      .populate('participants', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  static async getMessages(conversationId: string, limit = 50, cursor?: string): Promise<IMessage[]> {
    const query: any = { conversationId: new mongoose.Types.ObjectId(conversationId) };
    
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }
    
    return Message.find(query)
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async sendMessage(
    userId: string, 
    conversationId: string, 
    text: string
  ): Promise<IMessage> {
    const message = new Message({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(userId),
      text: text.trim()
    });
    
    await message.save();
    await message.populate('senderId', 'name avatar');
    
    // Update conversation last message and increment unread count
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.lastMessage = {
        text: message.text,
        senderId: message.senderId as mongoose.Types.ObjectId,
        createdAt: message.createdAt
      };
      
      // Increment unread count for all participants except sender
      conversation.participants.forEach((participantId) => {
        const participantIdStr = participantId.toString();
        if (participantIdStr !== userId) {
          const currentCount = conversation.unreadCountByUser.get(participantIdStr) || 0;
          conversation.unreadCountByUser.set(participantIdStr, currentCount + 1);
        }
      });
      
      conversation.updatedAt = new Date();
      await conversation.save();
    }
    
    return message;
  }

  static async markDelivered(messageId: string, userId: string): Promise<void> {
    await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deliveredTo: new mongoose.Types.ObjectId(userId) } }
    );
  }

  static async markRead(conversationId: string, userId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Mark all unread messages as read
    await Message.updateMany(
      { 
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: { $ne: userObjectId },
        readBy: { $ne: userObjectId }
      },
      { $addToSet: { readBy: userObjectId } }
    );
    
    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(
      conversationId,
      { [`unreadCountByUser.${userId}`]: 0 }
    );
  }
}