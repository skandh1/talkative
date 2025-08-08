import axios from 'axios';
import { type User as FirebaseUser } from 'firebase/auth';
import { type User } from '../../../types/user';

const API_BASE_URL = 'http://localhost:5000/api';

export interface UpdateProfilePayload {
  username?: string;
  displayName?: string;
  age?: number;
  gender?: User['gender'];
  profilePic?: string;
  about?: string;
  topics?: string[];
}

/**
 * Fetches a user profile from the backend by ID or username.
 * @param currentUser The authenticated Firebase user.
 * @param identifier The user's _id or username.
 * @param isById Flag to indicate if the identifier is an ID.
 * @returns A promise that resolves to the user's data.
 */
export const fetchUserProfile = async (
  currentUser: FirebaseUser,
  identifier: string,
  isById: boolean
): Promise<User> => {
  const token = await currentUser.getIdToken();
  const url = isById
    ? `${API_BASE_URL}/users/id/${identifier}`
    : `${API_BASE_URL}/users/username/${identifier}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Updates the current user's profile on the backend.
 * @param currentUser The authenticated Firebase user.
 * @param payload The data to update the profile with.
 * @returns A promise that resolves to the updated user's data.
 */
export const updateUserProfile = async (
  currentUser: FirebaseUser,
  payload: UpdateProfilePayload
): Promise<User> => {
  const token = await currentUser.getIdToken();
  const response = await axios.put(`${API_BASE_URL}/users/update`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.user;
};
