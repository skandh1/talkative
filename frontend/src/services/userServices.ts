// services/userService.ts
import { type User as FirebaseUser } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

export const checkUsername = async (username: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/check-username?username=${username}`);
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Failed to check username:', error);
    return false;
  }
};

export const syncUser = async (firebaseUser: FirebaseUser) => {
  const idToken = await firebaseUser.getIdToken();
  const userData = {
    isFirstLogin: firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
    photoURL: firebaseUser.photoURL || '',
  };

  const response = await fetch(`${API_URL}/sync-user`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error('User sync failed');
  return response.json();
};

export const setUsername = async (firebaseUser: FirebaseUser, newUsername: string) => {
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch(`${API_URL}/set-username`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: newUsername }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to set username.');
  return result;
};
