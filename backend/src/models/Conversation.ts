import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: {
    text: string;
    senderId: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  unreadCountByUser: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    text: String,
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  },
  unreadCountByUser: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Ensure unique pair of participants
  // conversationSchema.index(
  //   { participants: 1 },
  //   {
  //     partialFilterExpression: { 'participants.1': { $exists: true } }
  //   }
  // );

  // conversationSchema.index({ 'participants': 1, 'updatedAt': -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);