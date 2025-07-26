import type { User } from 'firebase/auth';

const API_URL = 'http://localhost:5000/api';

export async function getProtectedData(user: User) {
  const idToken = await user.getIdToken();
  
  const response = await fetch(`${API_URL}/protected`, {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch protected data');
  }

  return response.json();
}