// services/authService.ts
import {
  auth,
  googleProvider,
} from '../firebase/firebase';
import {
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification,
  type User as FirebaseUser
} from 'firebase/auth';

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logoutUser = () => signOut(auth);

export const signupWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  await signOut(auth);
};

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const sendPasswordlessLink = (email: string, actionCodeSettings: any) =>
  sendSignInLinkToEmail(auth, email, actionCodeSettings);

export const isEmailSignInLink = (link: string) =>
  isSignInWithEmailLink(auth, link);

export const signInWithEmailLinkFn = (email: string, link: string) =>
  signInWithEmailLink(auth, email, link);

export const getUserToken = (user: FirebaseUser, forceRefresh = false) =>
  user.getIdToken(forceRefresh);
