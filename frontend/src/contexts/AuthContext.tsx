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
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { type User as DBUser } from '../types/user';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  dbUser: DBUser | null;
  setDbUser: React.Dispatch<React.SetStateAction<DBUser | null>>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string>;
  showUsernamePrompt: boolean;
  completeNewUserSetup: (newUsername: string) => Promise<void>;
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

  const syncUser = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setDbUser(null);
      return;
    }

    try {
      const idToken = await firebaseUser.getIdToken();
      const isFirstLogin = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;

      console.log("frontend", firebaseUser.displayName)

      const userData = {
        isFirstLogin,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
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
      // console.log('Synced user:', dbUserData.user);
    } catch (error) {
      console.error('User sync failed:', error);
    }
  };

  const completeNewUserSetup = async (newUsername: string) => {
    if (!currentUser) return;
    try {
      await updateProfile(currentUser, {
        displayName: newUsername,
      });
      setShowUsernamePrompt(false);
      await syncUser(currentUser);
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

  const signupWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        await syncUser(userCredential.user);
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
      console.log(user)
      setCurrentUser(user);
      if (user) {
        // Use a more robust check: if displayName is not set, we need to prompt the user.
        if (!user.displayName) {
          setShowUsernamePrompt(true);
        } else {
          await syncUser(user);
          setShowUsernamePrompt(false);
        }
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
    completeNewUserSetup
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}