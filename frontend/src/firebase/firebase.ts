import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAsE9mon5T9ICsSlRPAZ_JJy66YE0Idhgo",
  authDomain: "talkataive-88fd9.firebaseapp.com",
  databaseUrl: "https://talkataive-88fd9-default-rtdb.firebaseio.com/",
  projectId: "talkataive-88fd9",
  storageBucket: "talkataive-88fd9.firebasestorage.app",
  messagingSenderId: "148245019493",
  appId: "1:148245019493:web:ad78165afe844936e83f8c",
  measurementId: "G-RLVWFT22E1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
