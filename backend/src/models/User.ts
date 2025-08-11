import mongoose, { Document, Schema, Model, Types } from "mongoose";
import "./Club";

export type Gender = "male" | "female" | "other" | "prefer_not_to-say";
export type ProfileStatus = "active" | "inactive" | "banned" | "deleted";

export interface IUser extends Document {
  _id: Types.ObjectId;
  uid: string;
  username?: string;
  displayName?: string;
  email: string;
  profilePic?: string;
  about?: string;

  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  language?: string;
  country?: string;
  isVerified?: boolean;

  isProfilePublic?: boolean;
  hasSetUsername?: boolean;
  usernameLastUpdatedAt?: Date;
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  lastActive: Date;
  

  profileStatus?: "active" | "inactive" | "banned" | "deleted";

  coins?: number;
  xp?: number;
  level?: number;
  callCount?: number;

  rating?: {
    average: number;
    count: number;
  };

  favs?: Types.ObjectId[];
  blocked?: Types.ObjectId[];
  topics?: string[];
  clubs?: Types.ObjectId[];

  role?: "user" | "moderator" | "admin";

  createdAt?: Date;
  updatedAt?: Date;// New field to track if a user has chosen a unique username
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: { type: String, unique: true, sparse: true, lowercase: true },
    displayName: { type: String },
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    profilePic: { type: String, default: "" },
    about: { type: String, default: "" },
    age: { type: Number, min: 13, max: 100 },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    language: { type: String, default: "en" },
    country: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },

    isProfilePublic: { type: Boolean, default: true },
    hasSetUsername: { type: Boolean, default: false },
    usernameLastUpdatedAt: { type: Date },
    isOnline: { type: Boolean, default: false },
    showOnlineStatus: { type: Boolean, default: true }, // privacy toggle
    lastActive: { type: Date, default: Date.now },

    profileStatus: {
      type: String,
      enum: ["active", "inactive", "banned", "deleted"],
      default: "active",
    },

    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    callCount: { type: Number, default: 0 },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    favs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    topics: [{ type: String }],
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],

    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);


// Prevent model overwrite issue during dev with hot-reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
