// hooks/useFriendActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export const useFriendActions = () => {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const { dbUser, setDbUser } = useAuth();

  // Optimistic update states
  const [optimisticStates, setOptimisticStates] = useState<{
    [userId: string]: {
      isFriend?: boolean;
      pendingOutgoing?: boolean;
      pendingIncoming?: boolean;
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

  // Removed the useQuery from here since it's now in FriendActionButtons
  // This hook should only handle mutations

  const { mutate: sendFriendRequest, isPending: isSendingRequest } = useMutation({
    mutationFn: (userId: string) => request(`/users/requests/friend/${userId}`, {
      method: 'POST'
    }),
    onMutate: (userId: string) => {
      updateOptimisticState(userId, { pendingOutgoing: true });
    },
    onSuccess: (data, userId) => {
      toast.success("Friend request sent!");
      clearOptimisticState(userId);
      // Invalidate relationship queries
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any, userId) => {
      clearOptimisticState(userId);
      toast.error(`Failed to send request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: cancelFriendRequest, isPending: isCancellingRequest } = useMutation({
    mutationFn: (requestId: string) => request(`/users/requests/friend/${requestId}/cancel`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast.info("Friend request cancelled.");
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to cancel request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: acceptFriendRequest, isPending: isAcceptingRequest } = useMutation({
    mutationFn: (requestId: string) => request(`/users/requests/friend/${requestId}/accept`, {
      method: 'PUT'
    }),
    onSuccess: () => {
      toast.success("Friend request accepted!");
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to accept request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: rejectFriendRequest, isPending: isRejectingRequest } = useMutation({
    mutationFn: (requestId: string) => request(`/users/requests/friend/${requestId}/reject`, {
      method: 'PUT'
    }),
    onSuccess: () => {
      toast.info("Friend request rejected.");
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to reject request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: unfriend, isPending: isUnfriending } = useMutation({
    mutationFn: (userId: string) => request(`/users/${userId}/unfriend`, {
      method: 'DELETE'
    }),
    onMutate: (userId: string) => {
      updateOptimisticState(userId, { isFriend: false });
    },
    onSuccess: (data, userId) => {
      toast.info("Unfriended successfully.");
      clearOptimisticState(userId);
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any, userId) => {
      clearOptimisticState(userId);
      toast.error(`Failed to unfriend: ${err.body?.message || 'Unknown error'}`);
    },
  });

  return {
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    optimisticStates,
    loadingStates: {
      isSendingRequest,
      isCancellingRequest,
      isAcceptingRequest,
      isRejectingRequest,
      isUnfriending,
    }
  };
};