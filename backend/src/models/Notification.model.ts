import mongoose, { Schema, Document } from "mongoose";

// Interface for the notification document
export interface INotification extends Document {
  recipient: mongoose.Schema.Types.ObjectId;
  sender: mongoose.Schema.Types.ObjectId;
  type:
    | "friend_request"
    | "friend_accepted"
    | "friend_rejected"
    | "follow_request"
    | "follow_accepted"
    | "follow_rejected"
    | "new_chat_message"
    | "post_like"
    | "post_comment"
    | "gift_received"
    | "call_missed"
  | "club_invite"
  | "call_with";
  content: string;
  isRead: boolean;
  relatedId?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const NotificationSchema: Schema<INotification> = new Schema<INotification>(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "friend_request",
        "friend_accepted",
        "friend_rejected",
        "follow_request",
        "follow_accepted",
        "follow_rejected",
        "new_chat_message",
        "post_like",
        "post_comment",
        "gift_received",
        "call_missed",
        "club_invite",
        "call_with",
      ],
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // This ref will depend on the notification type
      // e.g., if type is 'friend_request', this could ref 'FriendRequest'
      // if type is 'post_like', this could ref 'Post'
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create a compound index for efficient querying
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);