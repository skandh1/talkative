import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchUserProfile,
  updateUserProfile,
  type UpdateProfilePayload,
} from '../api/profileApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { type User as FirebaseUser } from 'firebase/auth';

// The hook now accepts a profileId to fetch a specific user's data
export const useUserProfile = (identifier?: string) => {
  const queryClient = useQueryClient();
  const { currentUser, setDbUser, dbUser } = useAuth();

  // Helper to determine if the identifier is a MongoDB ObjectId
  const isMongoId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);

  // The query key now uses the identifier directly.
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['userProfile', identifier],
    queryFn: () => {
      if (!currentUser || !identifier) {
        throw new Error('Required data for fetch is missing.');
      }
      // This is the key change: we now infer whether the identifier is an ID or a username
      const isById = isMongoId(identifier);

      // Pass the identifier and the type of lookup to the API call.
      return fetchUserProfile(currentUser as FirebaseUser, identifier, isById);
    },
    enabled: !!identifier && !!currentUser,
  });

  // Determine if the currently logged-in user is the owner of the profile being viewed
  const isOwner = identifier && (identifier === dbUser?.username || identifier === dbUser?._id);

  // The mutation to update the profile remains tied to the authenticated user
  const {
    mutate: updateProfile,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => {
      if (!currentUser) throw new Error('User not authenticated');
      return updateUserProfile(currentUser as FirebaseUser, payload);
    },
    onSuccess: (updatedUser) => {
      // If the owner's profile was updated, update the user in the context
      if (isOwner) {
        setDbUser(updatedUser);
      }

      // Invalidate the specific profile's query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['userProfile', identifier] });
      // toast.success('Profile updated successfully! ✅');
    },
    onError: (err) => {
      let message = 'Something went wrong while updating.';

      if ((err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError;
        const serverMsg = axiosErr.response?.data as { message?: string };
        if (serverMsg?.message) message = serverMsg.message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
      console.error('Profile update error:', err);
    },
  });

  return {
    user,
    isLoading,
    isError,
    error,
    updateProfile,
    isUpdating,
    isOwner,
  };
};
