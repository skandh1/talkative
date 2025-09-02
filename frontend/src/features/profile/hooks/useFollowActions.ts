// hooks/useFollowActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export const useFollowActions = () => {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const { dbUser, setDbUser } = useAuth();
  
  // Optimistic update states
  const [optimisticStates, setOptimisticStates] = useState<{
    [userId: string]: {
      isFollowing?: boolean;
      pendingFollowRequest?: boolean;
    }
  }>({});

  const updateOptimisticState = (userId: string, updates: any) => {
    setOptimisticStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], ...updates }
    }));
  };

  const clearOptimisticState = (userId: string) => {
    setOptimisticStates(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
  };

  const { mutate: follow, isPending: isFollowing } = useMutation({
    mutationFn: (userId: string) => request(`/users/${userId}/follow`, {
      method: 'POST'
    }),
    onMutate: (userId: string) => {
      updateOptimisticState(userId, { isFollowing: true });
    },
    onSuccess: (data, userId) => {
      toast.success("Now following this user.");
      clearOptimisticState(userId);
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any, userId) => {
      clearOptimisticState(userId);
      toast.error(`Failed to follow: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: unfollow, isPending: isUnfollowing } = useMutation({
    mutationFn: (userId: string) => request(`/users/${userId}/unfollow`, {
      method: 'DELETE'
    }),
    onMutate: (userId: string) => {
      updateOptimisticState(userId, { isFollowing: false });
    },
    onSuccess: (data, userId) => {
      toast.info("Unfollowed user.");
      clearOptimisticState(userId);
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any, userId) => {
      clearOptimisticState(userId);
      toast.error(`Failed to unfollow: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: sendFollowRequest, isPending: isSendingFollowRequest } = useMutation({
    mutationFn: (userId: string) => request(`/users/requests/follow/${userId}`, {
      method: 'POST'
    }),
    onMutate: (userId: string) => {
      updateOptimisticState(userId, { pendingFollowRequest: true });
    },
    onSuccess: (data, userId) => {
      toast.success("Follow request sent!");
      clearOptimisticState(userId);
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any, userId) => {
      clearOptimisticState(userId);
      toast.error(`Failed to send follow request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: cancelFollowRequest, isPending: isCancellingFollowRequest } = useMutation({
    mutationFn: (requestId: string) => request(`/users/requests/follow/${requestId}/cancel`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast.info("Follow request cancelled.");
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to cancel follow request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: acceptFollowRequest, isPending: isAcceptingFollowRequest } = useMutation({
    mutationFn: (requestId: string) => request(`/users/requests/follow/${requestId}/accept`, {
      method: 'PUT'
    }),
    onSuccess: () => {
      toast.success("Follow request accepted!");
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to accept follow request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: rejectFollowRequest, isPending: isRejectingFollowRequest } = useMutation({
    mutationFn: (requestId: string) => request(`/users/requests/follow/${requestId}/reject`, {
      method: 'PUT'
    }),
    onSuccess: () => {
      toast.info("Follow request rejected.");
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to reject follow request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  return {
    follow,
    unfollow,
    sendFollowRequest,
    cancelFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
    optimisticStates,
    loadingStates: {
      isFollowing,
      isUnfollowing,
      isSendingFollowRequest,
      isCancellingFollowRequest,
      isAcceptingFollowRequest,
      isRejectingFollowRequest,
    }
  };
};