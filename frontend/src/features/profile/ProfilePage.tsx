/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileForm } from './components/ProfileForm';
import { useUserProfile } from './hooks/useUserProfile';
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useOtherUserStatus } from '@/hooks/useOtherUserStatus';
import UserInfoDisplay from './components/UserInfoDisplay';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export const ProfilePage: React.FC = () => {
const { identifier } = useParams<{ identifier?: string }>();
const [isEditing, setIsEditing] = useState(false);
const { dbUser, setDbUser } = useAuth();
const { updateProfile, user, isUpdating, isError, error } = useUserProfile(identifier);
const navigate = useNavigate();
const queryClient = useQueryClient();
const { request } = useApi();

// Use the new hook to get the real-time status
const status = useOtherUserStatus(user?.uid, user?.settings?.privacy?.whoCanSeeOnlineStatus);

// --- All API handlers must be defined before any early returns ---
const { mutate: sendFriendRequest, isPending: isSendingRequest } = useMutation({
  mutationFn: (userId: string) => request(`/users/requests/friend/${userId}`, {
    method: 'POST'
  }),
  onSuccess: () => {
    toast.success("Friend request sent! 🎉");
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to send request: ${err.body?.message || 'Unknown error'}`);
  },
});

const { mutate: cancelFriendRequest, isPending: isCancellingRequest } = useMutation({
  mutationFn: (requestId: string) => request(`/users/requests/friend/${requestId}/cancel`, {
    method: 'DELETE'
  }),
  onSuccess: () => {
    toast.info("Friend request cancelled.");
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
    toast.success("Friend request accepted! 🥳");
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
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to reject request: ${err.body?.message || 'Unknown error'}`);
  },
});

const { mutate: addFriend, isPending: isAddingFriend } = useMutation({
  mutationFn: (userId: string) => request(`/users/${userId}/add-friend`, {
    method: 'POST'
  }),
  onSuccess: () => {
    toast.success("Friend added successfully!");
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to add friend: ${err.body?.message || 'Unknown error'}`);
  },
});

const { mutate: unfriend, isPending: isUnfriending } = useMutation({
  mutationFn: (userId: string) => request(`/users/${userId}/unfriend`, {
    method: 'DELETE'
  }),
  onSuccess: () => {
    toast.info("Unfriended successfully.");
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to unfriend: ${err.body?.message || 'Unknown error'}`);
  },
});

const { mutate: follow, isPending: isFollowing } = useMutation({
  mutationFn: (userId: string) => request(`/users/${userId}/follow`, {
    method: 'POST'
  }),
  onSuccess: () => {
    toast.success("Now following this user.");
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to follow: ${err.body?.message || 'Unknown error'}`);
  },
});

const { mutate: unfollow, isPending: isUnfollowing } = useMutation({
  mutationFn: (userId: string) => request(`/users/${userId}/unfollow`, {
    method: 'DELETE'
  }),
  onSuccess: () => {
    toast.info("Unfollowed user.");
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to unfollow: ${err.body?.message || 'Unknown error'}`);
  },
});

const { mutate: sendFollowRequest, isPending: isSendingFollowRequest } = useMutation({
  mutationFn: (userId: string) => request(`/users/requests/follow/${userId}`, {
    method: 'POST'
  }),
  onSuccess: () => {
    toast.success("Follow request sent! ✅");
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to send follow request: ${err.body?.message || 'Unknown error'}`);
  },
});

const { mutate: cancelFollowRequest, isPending: isCancellingFollowRequest } = useMutation({
  mutationFn: (requestId: string) => request(`/users/requests/follow/${requestId}/cancel`, {
    method: 'DELETE'
  }),
  onSuccess: () => {
    toast.info("Follow request cancelled.");
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  },
  onError: (err: any) => {
    toast.error(`Failed to cancel follow request: ${err.body?.message || 'Unknown error'}`);
  },
});

// Early returns after all hooks are defined
if (isError && error?.message?.includes('404')) {
  return <div className="text-center p-10 text-red-500 dark:text-red-400">User not found.</div>;
}

const displayUser = user;
const isOwner = !!(identifier && (identifier === dbUser?.username || identifier === dbUser?._id));

const handleUpdateSubmit = (data: any) => {
  updateProfile(data, {
    onSuccess: (updatedUser: any) => {
      setIsEditing(false);
      toast.success("Profile updated successfully! ✅");
      if (updatedUser.username !== displayUser?.username) {
        navigate(`/profile/${updatedUser.username}`, { replace: true });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile.");
    },
  });
};

if (!displayUser || !dbUser) {
  return <div className="text-center p-10 text-gray-700 dark:text-gray-300">Loading profile...</div>;
}

return (
  <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-8 transition-all duration-300 transform">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isOwner ? 'My Profile' : `${displayUser.displayName}'s Profile`}</h1>
        {isOwner && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:ring-indigo-500"
          >
            Edit Profile
          </Button>
        )}
      </div>
      {isEditing && isOwner ? (
        <ProfileForm
          user={displayUser}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setIsEditing(false)}
          isUpdating={isUpdating}
        />
      ) : (
        <UserInfoDisplay
          displayUser={displayUser}
          isOwner={isOwner}
          status={status || { isOnline: false }}
          onSendFriendRequest={() => sendFriendRequest(displayUser._id)}
          onCancelFriendRequest={(requestId: string) => cancelFriendRequest(requestId)}
          onAcceptFriendRequest={(requestId: string) => acceptFriendRequest(requestId)}
          onRejectFriendRequest={(requestId: string) => rejectFriendRequest(requestId)}
          onAddFriend={() => addFriend(displayUser._id)}
          onUnfriend={() => unfriend(displayUser._id)}
          onSendFollowRequest={() => sendFollowRequest(displayUser._id)}
          onCancelFollowRequest={(requestId: string) => cancelFollowRequest(requestId)}
          onFollow={() => follow(displayUser._id)}
          onUnfollow={() => unfollow(displayUser._id)}
        />
      )}
    </div>
  </div>
);
};