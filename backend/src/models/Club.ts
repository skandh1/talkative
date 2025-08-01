// models/Club.ts
import mongoose, { Document, Schema, Model } from "mongoose";
 

export type ClubStatus = "public" | "private" | "hidden";
export type ClubCategory = "sports" | "gaming" | "books" | "music" | "other";

export interface IClub extends Document {
  name: string;
  description: string;
  category: ClubCategory;
  status: ClubStatus;
  members: mongoose.Types.ObjectId[]; // References User model
  admins: mongoose.Types.ObjectId[]; // References User model
  createdBy: mongoose.Types.ObjectId; // References User model
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema: Schema<IClub> = new Schema<IClub>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["sports", "gaming", "books", "music", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["public", "private", "hidden"],
      default: "public",
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Club: Model<IClub> =
  mongoose.models.Club || mongoose.model<IClub>("Club", ClubSchema);