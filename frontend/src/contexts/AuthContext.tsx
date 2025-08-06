/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { type User as DBUser } from '../types/user';

// Extend the context type to include new email/password functions
interface AuthContextType {
  currentUser: FirebaseUser | null;
  dbUser: DBUser | null;
  setDbUser: React.Dispatch<React.SetStateAction<DBUser | null>>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePic: (newUrl: string) => Promise<void>;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Syncs the Firebase user with the backend database.
   * This function is now generic and works for all authentication providers.
   * It sends user data (conditionally) to a new, general-purpose backend endpoint.
   */
  const syncUser = async (firebaseUser: FirebaseUser | null, displayNameOverRide?: string) => {
    if (!firebaseUser) {
      setDbUser(null);
      return;
    }

    try {
      const idToken = await firebaseUser.getIdToken();
      
      // Determine if this is the first login. This is a robust way to check.
      const isFirstLogin =
        firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;

      // Extract user data, providing fallbacks for non-Google providers.

      const userData = {
        isFirstLogin,
        displayName: displayNameOverRide || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
      };

      // Changed the endpoint to a more generic name that reflects its new purpose.
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
      console.log('Synced user:', dbUserData.user);
    } catch (error) {
      console.error('User sync failed:', error);
    }
  };

  // --- EXISTING FUNCTIONS ---

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUser(result.user);
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

  const updateProfilePic = async (newUrl: string) => {
    if (!dbUser || !currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePic: newUrl }),
      });

      setDbUser({ ...dbUser, profilePic: newUrl });
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    }
  };

  const getToken = async () => {
    if (!currentUser) throw new Error('No user logged in');
    return await currentUser.getIdToken(true); // true = force refresh if needed
  };

  // --- NEW FUNCTIONS FOR EMAIL/PASSWORD AUTH ---

  const signupWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      // Create the user in Firebase Auth
    
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // After creation, the user is automatically logged in.
      // Call syncUser to create the user in your database and set up the dbUser state.
      await syncUser(userCredential.user, displayName);
      // Note: You might want to update the displayName here, but the syncUser already handles a default name.
      // You can add a fetch to your backend to update the username if needed.
    } catch (error) {
      console.error('Email signup failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      // Sign in the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // After successful login, call syncUser to get the corresponding dbUser from your database.
      await syncUser(userCredential.user);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Send a password reset email to the user.
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
      await syncUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    dbUser,
    setDbUser,
    loginWithGoogle,
    loginWithEmail, // Add the new function to the context
    signupWithEmail, // Add the new function to the context
    resetPassword, // Add the new function to the context
    logout,
    updateProfilePic,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
