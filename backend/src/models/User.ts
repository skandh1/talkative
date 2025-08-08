import mongoose, { Document, Schema, Model } from "mongoose";
import "./Club";

export type Gender = "male" | "female" | "other" | "prefer_not_to-say";
export type ProfileStatus = "active" | "inactive" | "banned" | "deleted";

export interface IUser extends Document {
  username: string;
  displayName?: string;
  email: string;
  profilePic?: string;
  about?: string;
  coins: number;
  rating: number;
  callCount: number;
  isOnline: boolean;
  profileStatus: ProfileStatus;
  age?: number;
  gender?: Gender;
  favs: mongoose.Types.ObjectId[]; // Favorited users
  friends: mongoose.Types.ObjectId[]; // Mutual friends
  blocked: mongoose.Types.ObjectId[]; // Blocked users
  topics: string[]; // User interests
  clubs: mongoose.Types.ObjectId[];
  usernameLastUpdatedAt?: Date; // Joined clubs
  createdAt: Date;
  updatedAt: Date;
  hasSetUsername: boolean; // New field to track if a user has chosen a unique username
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    // The username is now the unique identifier. It is not required on creation, but is required to be non-empty later.
    username: { type: String, unique: true, sparse: true, lowercase: true },
    displayName: { type: String }, // Display name is not unique
    email: { type: String, required: true, unique: true, lowercase: true },
    profilePic: { type: String, default: "" },
    about: { type: String, default: "" },
    coins: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    callCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    profileStatus: {
      type: String,
      enum: ["active", "inactive", "banned", "deleted"],
      default: "active",
    },
    age: { type: Number, min: 13, max: 100 },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    usernameLastUpdatedAt: { type: Date },
    favs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    topics: [{ type: String }], // optional: add validation list
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
    hasSetUsername: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);


// Prevent model overwrite issue during dev with hot-reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
