import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchUserProfile,
  updateUserProfile,
  type UpdateProfilePayload,
} from '../api/profileApi';
import {toast} from 'react-toastify'; // ✅ or your preferred toast lib
import { AxiosError } from 'axios';

export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const { currentUser, setDbUser } = useAuth();

  // Fetch current user's profile
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => {
      if (!currentUser) throw new Error('User not authenticated');
      return fetchUserProfile(currentUser);
    },
    enabled: !!currentUser,
  });

  // Mutation to update profile
  const {
    mutate: updateProfile,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => {
      if (!currentUser) throw new Error('User not authenticated');

      return updateUserProfile(currentUser, payload);
    },
    onSuccess: (updatedUser) => {
      console.log("hihihidifhishfid")
      console.log("updatedUser", updatedUser)
      setDbUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
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
  };
};
