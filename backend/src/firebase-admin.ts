import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

// 1. Secure path resolution
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// 2. Verify key file exists
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('Firebase service account key not found at: ' + serviceAccountPath);
}

// 3. Initialize with error handling
let adminApp: App;

try {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(serviceAccountPath),
      databaseURL: process.env.FIREBASE_DATABASE_URL // Recommended
    });
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
  throw error; // Fail fast during startup
}

// 4. Export services
export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);