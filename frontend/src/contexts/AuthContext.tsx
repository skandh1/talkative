/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { type User as DBUser } from '../types/user';


interface AuthContextType {
  currentUser: FirebaseUser | null;
  dbUser: DBUser | null;
  setDbUser: React.Dispatch<React.SetStateAction<DBUser | null>>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string>;
  showUsernamePrompt: boolean;
  completeGoogleSignup: (newUsername: string) => Promise<void>; // Renamed to be more specific
  checkUsername: (username: string) => Promise<boolean>; // New function to check username availability
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

  // New function to check for username availability on the backend
  const checkUsername = async (username: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/check-username?username=${username}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Failed to check username:', error);
      return false;
    }
  };

  const syncUser = async (firebaseUser: FirebaseUser | null, usernameFromSignup?: string, getEmailDisplayName?: string) => {
    if (!firebaseUser) {
      setDbUser(null);
      return;
    }

    try {
      const idToken = await firebaseUser.getIdToken();
      
      const userData = {
        isFirstLogin: firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime,
        displayName: getEmailDisplayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
        username: usernameFromSignup, // Pass the username for email signups
      };

      const response = await fetch('http://localhost:5000/api/auth/sync-user', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const dbUserData = await response.json();
      setDbUser(dbUserData.user);
      
      // If the user has not set their username yet, show the prompt
      setShowUsernamePrompt(!dbUserData.user?.hasSetUsername);

    } catch (error) {
      console.error('User sync failed:', error);
      setDbUser(null);
    }
  };
  
  // This new function handles a Google-logged-in user setting their username for the first time
  const completeGoogleSignup = async (newUsername: string) => {
    if (!currentUser) return;
    try {
      const idToken = await currentUser.getIdToken();
      
      const response = await fetch('http://localhost:5000/api/auth/set-username', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to set username.');
      }
      
      setDbUser(result.user);
      setShowUsernamePrompt(false);

    } catch (error) {
      console.error('Failed to complete new user setup:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setDbUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getToken = async () => {
    if (!currentUser) throw new Error('No user logged in');
    return await currentUser.getIdToken(true);
  };
  
  // The signupWithEmail function now requires a username
  const signupWithEmail = async (email: string, password: string, username: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        // Sync the user with our backend, sending the username and display name.
        await syncUser(userCredential.user, username, displayName);
      }
    } catch (error) {
      console.error('Email signup failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncUser(userCredential.user);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully.');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if the user exists in our DB and if they have a username
        await syncUser(user);
      } else {
        setDbUser(null);
        setShowUsernamePrompt(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    dbUser,
    setDbUser,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    resetPassword,
    logout,
    getToken,
    showUsernamePrompt,
    completeGoogleSignup,
    checkUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
