import mongoose from "mongoose";

// Add this to your types (or create a env.d.ts file)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
    }
  }
}

export const connectDB = async (): Promise<void> => {
  try {
    // Move this INSIDE the function so it executes after dotenv.config()
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/talkitiveApp";
    
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};