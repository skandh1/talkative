import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileForm } from './components/profileForm';
import { useUserProfile } from './hooks/useUserProfile'; // ✅ Import your custom hook

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { dbUser } = useAuth(); // We no longer need currentUser here
  const { updateProfile, user, isUpdating } = useUserProfile(); // ✅ Use the custom hook

  // The `user` returned by `useUserProfile` is the fetched data.
  // We should use this instead of `dbUser` to get the most up-to-date data.
  // Use `user` for displaying, and `dbUser` (from context) for other auth-related checks.
  const displayUser = user || dbUser;

  if (!displayUser) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <ProfileForm
              user={displayUser}
              onSubmit={(data) => {
                // ✅ Call the `updateProfile` mutate function
                updateProfile(data, {
                  onSuccess: () => {
                    // Optional: you can add a local `onSuccess` handler here as well
                    setIsEditing(false); // Close the form on success
                  },
                });
              }}
              onCancel={() => setIsEditing(false)}
              isUpdating={isUpdating} // ✅ Pass the correct `isUpdating` state
            />
          ) : (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              {/* ... Display logic using displayUser ... */}
              <div className="flex items-center space-x-4">
                <img
                  src={displayUser.profilePic || 'https://via.placeholder.com/96'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <p className="text-xl font-semibold">{displayUser.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{displayUser.email}</p>
                </div>
              </div>
              <p><strong>About:</strong> {displayUser.about || 'Not set'}</p>
              <p><strong>Age:</strong> {displayUser.age ?? 'Not set'}</p>
              <p><strong>Gender:</strong> {displayUser.gender ?? 'Not set'}</p>
              <div>
                <strong>Topics:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {displayUser.topics?.length ? (
                    displayUser.topics.map((topic) => (
                      <span
                        key={topic}
                        className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {topic}
                      </span>
                    ))
                  ) : (
                    'No topics added.'
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};