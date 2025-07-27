/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebase';
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { googleProvider } from '../firebase/firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  dbUser: { email: string; username?: string; profilePic?: string } | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePic: (newUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<{ email: string; username?: string; profilePic?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setDbUser(null);
      return;
    }

    try {
      const idToken = await firebaseUser.getIdToken();
      const isFirstLogin = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;

      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFirstLogin,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });

      const userData = await response.json();
      setDbUser({
        email: userData.email,
        username: userData.username,
        profilePic: userData.profilePic,
      });
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

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
      setDbUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateProfilePic = async (newUrl: string) => {
    if (!dbUser || !currentUser) return;

    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
        body: JSON.stringify({ profilePic: newUrl }),
      });

      setDbUser({ ...dbUser, profilePic: newUrl });
    } catch (error) {
      console.error('Failed to update profile:', error);
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
    loginWithGoogle,
    logout,
    updateProfilePic,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
