import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
// Add this to your types (or create a env.d.ts file)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
    }
  }
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/talkitiveApp";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};