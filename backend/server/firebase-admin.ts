// Correct import for Firebase Admin v10+
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
// If you need Firestore
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json')
let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(serviceAccountPath)
  });
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp); // Optional if using Firestore