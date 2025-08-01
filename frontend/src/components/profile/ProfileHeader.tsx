import React from 'react';
import { type User } from '../../types/user'
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Edit3, CheckCircle, BarChart, Coins, Phone } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isEditing, onEdit }) => {
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="h-32 md:h-48 bg-gray-200 dark:bg-gray-700">
        {/* You can add a banner image here */}
      </div>
      
      {/* Profile Picture and Info */}
      <div className="absolute top-20 md:top-28 left-6 flex flex-col sm:flex-row items-center sm:items-end gap-4">
        <img
          src={user.profilePic || 'https://i.pravatar.cc/150'}
          alt={user.username}
          className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md"
        />
        <div className="pb-2 text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{user.username}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      {/* Stats and Edit Button Container */}
      <div className="flex flex-col sm:flex-row justify-end items-center px-6 pt-4 pb-20 sm:pb-6">
         {!isEditing && (
            <Button onClick={onEdit} className="absolute top-4 right-4 sm:static sm:mt-0 mt-28">
               <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
         )}
      </div>

       {/* Stats Section */}
      <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700 text-center border-t border-gray-200 dark:border-gray-700">
          <StatItem icon={<Coins className="h-5 w-5 mx-auto"/>} label="Coins" value={user.coins} />
          <StatItem icon={<BarChart className="h-5 w-5 mx-auto"/>} label="Rating" value={user.rating.toFixed(1)} />
          <StatItem icon={<Phone className="h-5 w-5 mx-auto"/>} label="Calls" value={user.callCount} />
      </div>
    </div>
  );
};

// A small component for displaying stats
const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="bg-white dark:bg-gray-800 p-4">
        <div className="text-blue-500 dark:text-blue-400 mb-1">{icon}</div>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{label}</p>
    </div>
);