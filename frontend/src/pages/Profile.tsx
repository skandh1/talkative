import React, { useState, useEffect } from 'react';
import { type User } from '../types/user'; // CORRECT: Import frontend type
import { fetchUserProfile, updateUserProfile } from '../lib/userApi';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileForm } from '../components/profile/ProfileForm';
import { Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // Use frontend User type
  // ... rest of the component logic remains the same
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const currentUserId = 'user123'; 

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const userData = await fetchUserProfile(currentUserId);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentUserId]);

  const handleSave = async (updatedData: Partial<User>) => { // Use frontend User type
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile(user.id, updatedData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ... the rest of the JSX remains the same
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-10">User not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <ProfileHeader user={user} onEdit={() => setIsEditing(true)} isEditing={isEditing} />
        <div className="p-6">
          <ProfileForm
            user={user}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;