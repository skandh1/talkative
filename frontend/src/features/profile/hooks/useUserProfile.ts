import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchUserProfile,
  updateUserProfile,
  type UpdateProfilePayload,
} from '../api/profileApi';
import {toast} from 'react-toastify'; // ✅ or your preferred toast lib
import { AxiosError } from 'axios';
import { type User as FirebaseUser } from 'firebase/auth'; // Import the type

// The hook now accepts a profileId to fetch a specific user's data
export const useUserProfile = (profileId?: string) => {
  const queryClient = useQueryClient();
  const { currentUser, setDbUser, dbUser } = useAuth();

  // Determine which user's profile to fetch. If a profileId is provided, use it.
  // Otherwise, default to the current authenticated user's ID.
  const userIdToFetch = profileId || dbUser?._id;
  const isOwner = userIdToFetch === dbUser?._id;
  
  
  // Fetch a specific user's profile based on the userIdToFetch
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    // The queryKey now includes the profileId, ensuring a unique cache for each user's profile
    queryKey: ['userProfile', userIdToFetch ],
    queryFn: () => {
      // The `enabled` prop already handles this check, but an additional check is good practice
      if (!currentUser || !userIdToFetch) {
        throw new Error('Required data for fetch is missing.');
      }
      
      // Corrected: Pass currentUser and userIdToFetch to the API call
      // Cast currentUser to FirebaseUser to satisfy TypeScript
      return fetchUserProfile(currentUser as FirebaseUser, userIdToFetch);
    },
    // The query is only enabled if we have a valid ID to fetch AND a valid user
    enabled: !!userIdToFetch && !!currentUser,
  });

  // The mutation to update the profile remains tied to the authenticated user
  const {
    mutate: updateProfile,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => {
      if (!currentUser) throw new Error('User not authenticated');
      // Cast currentUser to FirebaseUser to satisfy TypeScript
      return updateUserProfile(currentUser as FirebaseUser, payload);
    },
    onSuccess: (updatedUser) => {
      // If the owner's profile was updated, update the user in the context
      if (isOwner) {
        setDbUser(updatedUser);
      }
      
      // Invalidate the specific profile's query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['userProfile', userIdToFetch] });
      toast.success('Profile updated successfully! ✅');
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

      toast.error(message); // ✅ Give user backend-specific feedback
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
