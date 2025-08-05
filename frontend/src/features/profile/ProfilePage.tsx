import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileForm } from './components/ProfileForm';
import { useUserProfile } from './hooks/useUserProfile';
import { Button } from "../../components/ui/button";
// import { type User } from '../../../types/user';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { dbUser, currentUser } = useAuth();
  const { updateProfile, user, isUpdating } = useUserProfile();

  console.log("dbuser", dbUser, "currentUser", currentUser)

  const displayUser = user || dbUser;

  if (!displayUser) {
    return <div className="text-center p-10 text-gray-700 dark:text-gray-300">Loading profile...</div>;
  }
  
  // A simple component to display stats in a card format
  const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-sm">
      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-8 transition-all duration-300 transform">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:ring-indigo-500"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <ProfileForm
            user={displayUser}
            onSubmit={(data) => {
              updateProfile(data, {
                onSuccess: () => {
                  setIsEditing(false);
                },
              });
            }}
            onCancel={() => setIsEditing(false)}
            isUpdating={isUpdating}
          />
        ) : (
          <div className="space-y-8">
            {/* User Info Section */}
            <div className="flex items-start md:items-center space-x-6 md:space-x-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <img
                  src={displayUser.profilePic || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-indigo-500/50"
                />
                {/* Online/Offline status indicator */}
                <div
                  className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800
                    ${displayUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                  title={displayUser.isOnline ? "Online" : "Offline"}
                />
              </div>
              <div className="flex-1">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {displayUser.username}
                  {/* Profile Status Badge */}
                  {displayUser.profileStatus && (
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ml-2
                      ${displayUser.profileStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        displayUser.profileStatus === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`
                    }>
                      {displayUser.profileStatus}
                    </span>
                  )}
                </p>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{displayUser.email}</p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
                  <strong>About:</strong> {displayUser.about || 'Not set'}
                </p>
              </div>
            </div>

            {/* General Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p className="text-lg"><strong>Age:</strong> {displayUser.age ?? 'Not set'}</p>
                <p className="text-lg"><strong>Gender:</strong> {displayUser.gender ?? 'Not set'}</p>
                {/* Displaying User ID is important for multi-user apps */}
                <p className="text-sm col-span-1 sm:col-span-2 break-all text-gray-500 dark:text-gray-400">
                  <strong>User ID:</strong> {displayUser.id}
                </p>
              </div>
            </div>
            
            {/* User Stats Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Coins" value={displayUser.coins} />
                <StatCard label="Rating" value={displayUser.rating} />
                <StatCard label="Calls" value={displayUser.callCount} />
                <StatCard label="Friends" value={displayUser.friends.length} />
              </div>
            </div>

            {/* Topics Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interests</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {displayUser.topics?.length ? (
                  displayUser.topics.map((topic) => (
                    <span
                      key={topic}
                      className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">No topics added.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
