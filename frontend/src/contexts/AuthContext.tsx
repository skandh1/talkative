/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { type User as FirebaseUser, onAuthStateChanged, type UserCredential } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { type User as DBUser } from '../types/user';

import {
  loginWithGoogle,
  logoutUser,
  signupWithEmail,
  loginWithEmail as loginEmailFn,
  resetPassword as resetPasswordFn,
  sendPasswordlessLink as sendPasswordlessFn,
  isEmailSignInLink,
  signInWithEmailLinkFn,
  getUserToken
} from '../services/authServices';

import {
  checkUsername,
  syncUser,
  setUsername
} from '../services/userServices';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  dbUser: DBUser | null;
  setDbUser: React.Dispatch<React.SetStateAction<DBUser | null>>;
  loginWithGoogle: () => Promise<UserCredential>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string>;
  showUsernamePrompt: boolean;
  completeGoogleSignup: (newUsername: string) => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  sendPasswordlessLink: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

  const actionCodeSettings = {
    url: import.meta.env.VITE_FRONTEND_URL + '/auth',
    handleCodeInApp: true,
  };

  const completeGoogleSignup = async (newUsername: string) => {
    if (!currentUser) return;
    const result = await setUsername(currentUser, newUsername);
    setDbUser(result.user);
    setShowUsernamePrompt(false);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const userCredential = await loginEmailFn(email, password);
    await userCredential.user.reload();
    if (!userCredential.user.emailVerified) {
      await logoutUser();
      throw new Error('Please verify your email address to log in.');
    }
    const dbUserData = await syncUser(userCredential.user);
    setDbUser(dbUserData.user);
  };

  const sendPasswordlessLink = async (email: string) => {
    await sendPasswordlessFn(email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isEmailSignInLink(window.location.href)) {
        const email = window.localStorage.getItem('emailForSignIn');
        if (email) {
          await signInWithEmailLinkFn(email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
        }
      }
    };
    handleEmailLinkSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setCurrentUser(user);
        try {
          const dbUserData = await syncUser(user);
          setDbUser(dbUserData.user);
          setShowUsernamePrompt(!dbUserData.user?.hasSetUsername);
        } catch {
          setDbUser(null);
        }
      } else {
        setCurrentUser(null);
        setDbUser(null);
        setShowUsernamePrompt(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    currentUser,
    dbUser,
    setDbUser,
    loginWithGoogle: () => loginWithGoogle(),
    loginWithEmail,
    signupWithEmail: (email, password) => signupWithEmail(email, password),
    resetPassword: (email) => resetPasswordFn(email),
    logout: () => logoutUser(),
    getToken: async () => {
      if (!currentUser) throw new Error('No user logged in');
      return getUserToken(currentUser);
    },
    showUsernamePrompt,
    completeGoogleSignup,
    checkUsername,
    sendPasswordlessLink
  }), [currentUser, dbUser, showUsernamePrompt]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
