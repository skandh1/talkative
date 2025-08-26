// ProfilePage.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileForm } from './components/ProfileForm';
import { useUserProfile } from './hooks/useUserProfile';
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useOtherUserStatus } from '@/hooks/useOtherUserStatus';
import UserInfoDisplay from './components/UserInfoDisplay';
import { useFriendActions } from './hooks/useFriendActions';
import { useFollowActions } from './hooks/useFollowActions';

export const ProfilePage: React.FC = () => {
  const { identifier } = useParams<{ identifier?: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const { dbUser } = useAuth();
  const { updateProfile, user, isUpdating, isError, error } = useUserProfile(identifier);
  const navigate = useNavigate();

  // Use the new hook to get the real-time status
  const status = useOtherUserStatus(user?.uid, user?.settings?.privacy?.whoCanSeeOnlineStatus);

  // Use custom hooks for actions
  const friendActions = useFriendActions();
  const followActions = useFollowActions();

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isOwner ? 'My Profile' : `${displayUser.displayName}'s Profile`}
          </h1>
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
            friendActions={friendActions}
            followActions={followActions}
          />
        )}
      </div>
    </div>
  );
};