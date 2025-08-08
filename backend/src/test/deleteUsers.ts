import { Request, Response } from 'express';
import admin from 'firebase-admin';
import mongoose from 'mongoose';
import { User } from '../models/User';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('Firebase service account file not found!');
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL // Optional
  });
}

export const deleteAllUsers = async (req: Request, res: Response) => {
  try {
    console.log('🚀 Starting user deletion process...');

    // ======== 1. MONGOOSE CONNECTION ========
    if (mongoose.connection.readyState !== 1) {
      console.log('⚡ Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_URI!, {
        serverSelectionTimeoutMS: 30000 // 30s timeout
      });
    }

    // ======== 2. DELETE MONGODB USERS ========
    console.log('🗑️ Deleting MongoDB users...');
    const deleteMongoResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteMongoResult.deletedCount} MongoDB users.`);

    // ======== 3. DELETE FIREBASE USERS ========
    console.log('🔥 Deleting Firebase Auth users...');
    const firebaseUsers = await admin.auth().listUsers();
    const firebaseUids = firebaseUsers.users.map((user) => user.uid);

    if (firebaseUids.length > 0) {
      await admin.auth().deleteUsers(firebaseUids);
      console.log(`✅ Deleted ${firebaseUids.length} Firebase users.`);
    } else {
      console.log('ℹ️ No Firebase users found to delete.');
    }

    res.status(200).json({
      success: true,
      message: 'All users deleted successfully',
      mongoDeleted: deleteMongoResult.deletedCount,
      firebaseDeleted: firebaseUids.length,
    });
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete users',
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    // Close connection if running standalone
    if (process.argv.includes('--run-manually')) {
      await mongoose.disconnect();
    }
  }
};

// Standalone execution
(async () => {
  if (process.env.NODE_ENV === 'test' || process.argv.includes('--run-manually')) {
    console.log('🛠️ Running deleteAllUsers in standalone mode...');
    await deleteAllUsers({} as Request, {
      status: (code) => ({
        json: (data) => console.log(`HTTP ${code}:`, data),
      }),
    } as Response);
  }
})();