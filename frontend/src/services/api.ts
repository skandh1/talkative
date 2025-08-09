import type { User } from 'firebase/auth';

const API_URL = 'http://localhost:5000/api';

export async function getProtectedData(user: User) {
  const idToken = await user.getIdToken();
  // console.log(idToken)
  
  const response = await fetch(`${API_URL}/auth/protected`, {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });

  // console.log(response)

  if (!response.ok) {
    throw new Error('Failed to fetch protected data');
  }

  const data = await response.json();
  return { ...data, idToken };
}