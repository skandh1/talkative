import axios from 'axios';
import type { User as UserProfile } from '../../../types/user';
import type { User as FirebaseUser } from 'firebase/auth';

export type UpdateProfilePayload = Partial<Omit<UserProfile, 'id' | 'email'>>;

const API_BASE_URL = 'http://localhost:5000/api/users';

/**
 * Fetches the current user's full profile.
 * @param currentUser - The Firebase authenticated user object.
 */
export const fetchUserProfile = async (
  currentUser: FirebaseUser
): Promise<UserProfile> => {
  const token = await currentUser.getIdToken();
  const response = await axios.get(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.user;
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
  console.log(data)
  const response = await axios.put(`${API_BASE_URL}/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.user;
};
