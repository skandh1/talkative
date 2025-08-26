/* eslint-disable react-hooks/rules-of-hooks */
// components/UserInfoDisplay.tsx
import React, { useMemo } from 'react';
import type { User } from "@/types/user";
import StatCard from "./StatCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FriendActionButtons } from "./FriendActionButtons";
import { FollowActionButtons } from "./FollowActionButtons";

type UserInfoDisplayProps = {
  displayUser: User;
  isOwner: boolean;
  status: { isOnline: boolean };
  friendActions: any;
  followActions: any;
};

const  UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({
  displayUser,
  isOwner,
  status,
  friendActions,
  followActions,
}) => {
  const { dbUser } = useAuth();
  
  if (!dbUser) {
    return null;
  }

  // Memoize relationship states for better performance
  const relationshipState = useMemo(() => {
    const optimisticFriend = friendActions.optimisticStates[displayUser._id];
    const optimisticFollow = followActions.optimisticStates[displayUser._id];
    
    return {
      isFriend: optimisticFriend?.isFriend !== undefined 
        ? optimisticFriend.isFriend 
        : dbUser.friends?.some((friendId: string) => friendId === displayUser._id) || false,
      isFollowing: optimisticFollow?.isFollowing !== undefined
        ? optimisticFollow.isFollowing
        : dbUser.following?.some((followingId: string) => followingId === displayUser._id) || false,
      isFollower: dbUser.followers?.some((followerId: string) => followerId === displayUser._id) || false,
    };
  }, [dbUser, displayUser._id, friendActions.optimisticStates, followActions.optimisticStates]);

  // Memoize privacy permissions
  const privacyPermissions = useMemo(() => {
    const { isFriend, isFollowing } = relationshipState;
    
    return {
      canViewAge: isOwner || 
        displayUser.settings?.privacy?.whoCanViewAge === 'everyone' ||
        (displayUser.settings?.privacy?.whoCanViewAge === 'friends' && isFriend) ||
        (displayUser.settings?.privacy?.whoCanViewAge === 'followers' && isFollowing),
      
      canViewOnlineStatus: isOwner || 
        displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'everyone' ||
        (displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'friends' && isFriend) ||
        (displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'followers' && isFollowing),
      
      canViewBio: isOwner || 
        displayUser.settings?.privacy?.whoCanSeeBio === 'everyone' ||
        (displayUser.settings?.privacy?.whoCanSeeBio === 'friends' && isFriend) ||
        (displayUser.settings?.privacy?.whoCanSeeBio === 'followers' && isFollowing),
        
      canChat: displayUser.settings?.privacy?.allowChatsFrom !== 'no_one' &&
        (displayUser.settings?.privacy?.allowChatsFrom === 'everyone' ||
         (displayUser.settings?.privacy?.allowChatsFrom === 'friends' && isFriend) ||
         (displayUser.settings?.privacy?.allowChatsFrom === 'followers' && isFollowing)),
    };
  }, [displayUser, relationshipState, isOwner]);

  const handleChatClick = () => {
    // Implement chat functionality
    console.log('Chat initiated');
  };

  const handleCallClick = () => {
    // Implement call functionality
    console.log('Call initiated');
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <img
            src={displayUser.profilePic || 'https://www.gravatar.com/avatar/?d=mp'}
            alt="Profile"
            className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-indigo-500/50"
          />
          {privacyPermissions.canViewOnlineStatus && (
            <div
              className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 transition-colors duration-200
                ${status?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
              title={status?.isOnline ? "Online" : "Offline"}
            />
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {displayUser.displayName}
            </h2>
            {displayUser.isVerified && (
              <span title="Verified User" className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.815a.75.75 0 0 1 0 1.06l-3.36 3.36a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 1.06-1.06l1.72 1.72 2.83-2.83a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
            @{displayUser.username}
          </p>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
              displayUser.profileStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
              displayUser.profileStatus === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {displayUser.profileStatus}
            </span>
            {displayUser.premiumStatus !== 'free' && (
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                {displayUser.premiumStatus}
              </span>
            )}
            {displayUser.role !== 'user' && (
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                {displayUser.role}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
            {isOwner ? (
              <Button disabled className="bg-gray-500 cursor-not-allowed">
                Your Profile
              </Button>
            ) : (
              <>
                {privacyPermissions.canChat && (
                  <Button
                    onClick={handleChatClick}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Chat
                  </Button>
                )}
                
                <FriendActionButtons
                  displayUser={displayUser}
                  dbUser={dbUser}
                  friendActions={friendActions}
                  isFollowing={relationshipState.isFollowing}
                />
                
                <FollowActionButtons
                  displayUser={displayUser}
                  dbUser={dbUser}
                  followActions={followActions}
                />
                
                {displayUser.settings?.privacy?.allowDirectCalls && (
                  <Button
                    onClick={handleCallClick}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Call
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {privacyPermissions.canViewBio && (
            <div className="col-span-1 sm:col-span-2">
              <p className="text-lg">
                <strong className="text-gray-700 dark:text-gray-300">About:</strong>{' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {displayUser.about || 'Not set'}
                </span>
              </p>
            </div>
          )}
          
          {privacyPermissions.canViewAge && (
            <p className="text-lg">
              <strong className="text-gray-700 dark:text-gray-300">Age:</strong>{' '}
              <span className="text-gray-600 dark:text-gray-400">
                {displayUser.age ?? 'Not set'}
              </span>
            </p>
          )}
          
          <p className="text-lg">
            <strong className="text-gray-700 dark:text-gray-300">Gender:</strong>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {displayUser.gender ?? 'Not set'}
            </span>
          </p>
          
          <p className="text-lg">
            <strong className="text-gray-700 dark:text-gray-300">Country:</strong>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {displayUser.settings?.preferences?.country || 'Not set'}
            </span>
          </p>
          
          <p className="text-lg">
            <strong className="text-gray-700 dark:text-gray-300">Languages:</strong>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {displayUser.settings?.preferences?.languages?.join(', ') || 'Not set'}
            </span>
          </p>
          
          {isOwner && (
            <>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-sm break-all text-gray-500 dark:text-gray-400">
                  <strong>User ID:</strong> {displayUser._id}
                </p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Email:</strong> {displayUser.email}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account Stats */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Account Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isOwner && <StatCard label="Coins" value={displayUser.coins ?? 0} />}
          <StatCard label="Level" value={displayUser.level ?? 1} />
          <StatCard label="Rating" value={displayUser.rating?.average ?? 0} />
          <StatCard label="Call Minutes" value={displayUser.callMinutes ?? 0} />
          <StatCard label="Friends" value={displayUser.friends?.length ?? 0} />
          <StatCard label="Followers" value={displayUser.followers?.length ?? 0} />
          <StatCard label="Following" value={displayUser.following?.length ?? 0} />
          <StatCard label="Report Count" value={displayUser.reportCount ?? 0} />
        </div>
      </div>

      {/* Interests & Topics */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Interests & Topics</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {displayUser.topics?.length ? (
            displayUser.topics.map((topic: string) => (
              <span
                key={topic}
                className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-3 py-1 rounded-full shadow-sm transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-800"
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
  );
};

export default UserInfoDisplay;