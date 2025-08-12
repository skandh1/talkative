import mongoose, { Document, Schema, Model, Types } from "mongoose";
import "./Club";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type ProfileStatus = "active" | "inactive" | "banned" | "deleted";
export type PremiumStatus = "free" | "premium" | "vip";
export type SafetyLevel = "safe" | "under_review" | "restricted";
export type Role = "user" | "moderator" | "admin";

// Gift history sub-schema (if you already have GiftHistorySchema defined elsewhere, import instead)
const GiftHistorySchema = new Schema({
  giftId: { type: String, required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
});

export interface IUser extends Document {
  _id: Types.ObjectId;
  uid: string;
  username?: string;
  displayName?: string;
  email: string;
  profilePic?: string;
  coverPhoto?: string;
  about?: string;
  age?: number;
  gender?: Gender;
  languages?: string[];
  country?: string;
  isVerified?: boolean;
  hasSetUsername?: boolean;
  usernameLastUpdatedAt?: Date;
  isOnline?: boolean;
  lastActive?: Date;

  settings: {
    privacy: {
      isProfilePublic: boolean;
      showOnlineStatus: boolean;
      showLastActive: boolean;
      hideAge: boolean;
      hideLocation: boolean;
    };
    communication: {
      allowFriendRequests: boolean;
      allowChatRequests: boolean;
      allowCalls: boolean;
      allowGiftRequests: boolean;
    };
    preferences: {
      languages: string[];
      country: string;
      matchDistance?: number;
    };
    account: {
      theme: "light" | "dark" | "system";
      notifications: {
        chat: boolean;
        calls: boolean;
        gifts: boolean;
      };
    };
  };

  profileStatus: ProfileStatus;
  safetyLevel: SafetyLevel;
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  achievements: string[];
  callCount: number;
  callMinutes: number;
  premiumStatus: PremiumStatus;
  giftHistory: any[];
  rating: { average: number; count: number };
  reportCount: number;
  interests: string[];
  topics: string[];
  friends: Types.ObjectId[];
  blocked: Types.ObjectId[];
  blockedBy: Types.ObjectId[];
  badges: string[];
  clubs: Types.ObjectId[];
  role: Role;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: { type: String, unique: true, sparse: true, lowercase: true },
    displayName: { type: String },
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    profilePic: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    about: { type: String, default: "" },
    age: { type: Number, min: 13, max: 100 },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    isVerified: { type: Boolean, default: false },
    hasSetUsername: { type: Boolean, default: false },
    usernameLastUpdatedAt: { type: Date },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },

    settings: {
      privacy: {
        isProfilePublic: { type: Boolean, default: true },
        showOnlineStatus: { type: Boolean, default: true },
        showLastActive: { type: Boolean, default: true },
        hideAge: { type: Boolean, default: false },
        hideLocation: { type: Boolean, default: false },
      },
      communication: {
        allowFriendRequests: { type: Boolean, default: true },
        allowChatRequests: { type: Boolean, default: true },
        allowCalls: { type: Boolean, default: true },
        allowGiftRequests: { type: Boolean, default: true },
      },
      preferences: {
        languages: [{ type: String, default: "en" }],
        country: { type: String, default: "" },
        matchDistance: { type: Number, default: 50 }, // in km or miles
      },
      account: {
        theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
        notifications: {
          chat: { type: Boolean, default: true },
          calls: { type: Boolean, default: true },
          gifts: { type: Boolean, default: true },
        },
      },
    },

    profileStatus: {
      type: String,
      enum: ["active", "inactive", "banned", "deleted"],
      default: "active",
    },
    safetyLevel: {
      type: String,
      enum: ["safe", "under_review", "restricted"],
      default: "safe",
    },

    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakCount: { type: Number, default: 0 },
    achievements: [{ type: String }],
    callCount: { type: Number, default: 0 },
    callMinutes: { type: Number, default: 0 },
    premiumStatus: {
      type: String,
      enum: ["free", "premium", "vip"],
      default: "free",
    },
    giftHistory: [GiftHistorySchema],

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reportCount: { type: Number, default: 0 },

    interests: [{ type: String }],
    topics: [{ type: String }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    badges: [{ type: String }],
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],

    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
