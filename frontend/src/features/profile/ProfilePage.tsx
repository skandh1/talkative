import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileForm } from './components/ProfileForm';
import { useUserProfile } from './hooks/useUserProfile';
import { Button } from "../../components/ui/button";
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useOtherUserStatus } from '@/hooks/useOtherUserStatus';
import UserInfoDisplay from './components/UserInfoDisplay';

// Reusable component for displaying profile information
// A simple component to display stats in a card format

export const ProfilePage: React.FC = () => {
  const { identifier } = useParams<{ identifier?: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const { dbUser } = useAuth();
  const { updateProfile, user, isUpdating } = useUserProfile(identifier);

  const displayUser = user || dbUser;
  // Use the new hook to get the real-time status
  const status = useOtherUserStatus(displayUser?.uid, displayUser?.showOnlineStatus);

  if (!displayUser) {
    return <div className="text-center p-10 text-gray-700 dark:text-gray-300">Loading profile...</div>;
  }

  const isOwner = identifier && (identifier === dbUser?.username || identifier === dbUser?._id);

  const handleUpdateSubmit = (data: Partial<typeof displayUser>) => {
    updateProfile(data, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success("Profile updated successfully! ✅");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile.");
      }
    });
  };

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
          <UserInfoDisplay displayUser={displayUser} isOwner={isOwner} status={status} />
        )}
      </div>
    </div>
  );
};