import axios from 'axios';
import type { User as UserProfile } from '../../../types/user';
import type { User as FirebaseUser } from 'firebase/auth';

export type UpdateProfilePayload = Partial<Omit<UserProfile, 'id' | 'email'>>;

const API_BASE_URL = 'http://localhost:5000/api/users';

/**
 * Fetches a user's profile.
 * It will fetch the authenticated user's profile by default, or a specific user's
 * profile if a userId is provided.
 * @param currentUser - The Firebase authenticated user object.
 * @param userId - Optional ID of the user to fetch.
 */
export const fetchUserProfile = async (
  currentUser: FirebaseUser,
  userId?: string
): Promise<UserProfile> => {
  const token = await currentUser.getIdToken();

  
  // Conditionally set the API endpoint based on whether a userId is provided.
  // If no userId, fetch the current user's profile via the '/me' endpoint.
  // If a userId is present, fetch that specific user's profile via a separate endpoint.
  const endpoint = userId ? `${API_BASE_URL}/find/${userId}` : `${API_BASE_URL}/me`;
  
  const response = await axios.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("response from api", response.data)
  return response.data;
};

/**
 * Updates the authenticated user's profile.
 * @param currentUser - The Firebase authenticated user object.
 * @param data - The profile fields to update.
 */
export const updateUserProfile = async (
  currentUser: FirebaseUser,
  data: UpdateProfilePayload
): Promise<UserProfile> => {
  const token = await currentUser.getIdToken();
  const response = await axios.put(`${API_BASE_URL}/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.user;
};
