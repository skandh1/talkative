import mongoose, { Schema, Document, Model } from "mongoose";

// ---- Gift History Schema (if already defined elsewhere, import it)
const GiftHistorySchema = new Schema({
  giftId: { type: String },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
});

// ---- Friend Request Schema ----
const FriendRequestSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

// ---- Follow Request Schema ----
const FollowRequestSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});
// ---- User Interface ----
export interface IUser extends Document {
  username: string;
  displayName?: string;
  uid: string;
  email: string;
  profilePic: string;
  coverPhoto: string;
  about: string;
  age?: number;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  isVerified: boolean;
  hasSetUsername: boolean;
  usernameLastUpdatedAt?: Date;
  isOnline: boolean;
  lastActive: Date;

  settings: {
    privacy: {
      profileType: "public" | "private";
      allowChatsFrom: "everyone" | "followers" | "friends" | "no_one";
      allowFriendRequestsFrom: "everyone" | "followers" | "no_one";
      allowFollowRequests: boolean;
      whoCanViewAge: "everyone" | "friends" | "followers" | "no_one";
      allowDirectCalls: boolean;
      whoCanSeeOnlineStatus: "everyone" | "friends" | "followers" | "no_one";
      whoCanSeeBio: "everyone" | "friends" | "followers" | "no_one";
    };
    notifications: {
      friendRequests: boolean;
      followRequests: boolean;
      chats: boolean;
      calls: boolean;
      callEnd: boolean;
      clubs: boolean;
      posts: {
        likes: boolean;
        comments: boolean;
      };
      gifts: boolean;
    };
    preferences: {
      languages: string[];
      country: string;
      matchDistance: number;
    };
    account: {
      theme: "light" | "dark" | "system";
    };
  };

  profileStatus: "active" | "inactive" | "banned" | "deleted";
  safetyLevel: "safe" | "under_review" | "restricted";

  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  achievements: string[];
  callCount: number;
  callMinutes: number;
  premiumStatus: "free" | "premium" | "vip";
  giftHistory: typeof GiftHistorySchema[];

  rating: {
    average: number;
    count: number;
  };

  reportCount: number;
  interests: string[];
  topics: string[];

  // relationships
  friends: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  blocked: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  clubs: mongoose.Types.ObjectId[];

  pendingFriendRequests: mongoose.Types.ObjectId[]; // References FriendRequest documents
  pendingFollowRequests: mongoose.Types.ObjectId[];

  badges: string[];
  role: "user" | "moderator" | "admin";
}

export type FriendRequest = {
  _id: string;
  sender: string | UserBasicInfo;
  receiver: string | UserBasicInfo;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
};

export type FollowRequest = {
  _id: string;
  sender: string | UserBasicInfo;
  receiver: string | UserBasicInfo;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
};

export type UserBasicInfo = {
  _id: string;
  username: string;
  profilePic: string;
  isOnline: boolean;
};

// ---- Schema ----
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
        profileType: {
          type: String,
          enum: ["public", "private"],
          default: "public",
        },
        allowChatsFrom: {
          type: String,
          enum: ["everyone", "followers", "friends", "no_one"],
          default: "everyone",
        },
        allowFriendRequestsFrom: {
          type: String,
          enum: ["everyone", "followers", "no_one"],
          default: "everyone",
        },
        allowFollowRequests: { type: Boolean, default: true },
        whoCanViewAge: {
          type: String,
          enum: ["everyone", "friends", "followers", "no_one"],
          default: "everyone",
        },
        allowDirectCalls: { type: Boolean, default: true },
        whoCanSeeOnlineStatus: {
          type: String,
          enum: ["everyone", "friends", "followers", "no_one"],
          default: "everyone",
        },
        whoCanSeeBio: {
          type: String,
          enum: ["everyone", "friends", "followers", "no_one"],
          default: "everyone",
        },
      },

      notifications: {
        friendRequests: { type: Boolean, default: true },
        followRequests: { type: Boolean, default: true },
        chats: { type: Boolean, default: true },
        calls: { type: Boolean, default: true },
        callEnd: { type: Boolean, default: true },
        clubs: { type: Boolean, default: true },
        posts: {
          likes: { type: Boolean, default: true },
          comments: { type: Boolean, default: true },
        },
        gifts: { type: Boolean, default: true },
      },

      preferences: {
        languages: [{ type: String, default: "en" }],
        country: { type: String, default: "" },
        matchDistance: { type: Number, default: 50 },
      },

      account: {
        theme: {
          type: String,
          enum: ["light", "dark", "system"],
          default: "system",
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

    // relationships
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],

    pendingFriendRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "FriendRequest"
    }],
    pendingFollowRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowRequest"
    }],

    badges: [{ type: String }],
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
  },
  { timestamps: true }

);

export const FriendRequest = mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", FriendRequestSchema);

export const FollowRequest = mongoose.models.FollowRequest ||
  mongoose.model("FollowRequest", FollowRequestSchema);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
