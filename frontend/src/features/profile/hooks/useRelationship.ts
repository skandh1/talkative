// hooks/useRelationships.ts
import { useMemo } from 'react';
import type { User, FriendRequest, FollowRequest } from "@/types/user";

interface UseRelationshipsProps {
  dbUser: User;
  displayUser: User;
  friendOptimisticStates: any;
  followOptimisticStates: any;
}

export const useRelationships = ({
  dbUser,
  displayUser,
  friendOptimisticStates,
  followOptimisticStates
}: UseRelationshipsProps) => {
  
  return useMemo(() => {
    // Get optimistic states for this specific user
    const friendOptimistic = friendOptimisticStates[displayUser._id] || {};
    const followOptimistic = followOptimisticStates[displayUser._id] || {};
    
    // Calculate relationship states with optimistic overrides
    const actualIsFriend = dbUser.friends?.some((friendId: string) => friendId === displayUser._id) || false;
    const actualIsFollowing = dbUser.following?.some((followingId: string) => followingId === displayUser._id) || false;
    
    const isFriend = friendOptimistic.isFriend !== undefined ? friendOptimistic.isFriend : actualIsFriend;
    const isFollowing = followOptimistic.isFollowing !== undefined ? followOptimistic.isFollowing : actualIsFollowing;
    const isFollower = dbUser.followers?.some((followerId: string) => followerId === displayUser._id) || false;

    // Check for pending requests
    const pendingFriendRequest = (dbUser.pendingFriendRequests as FriendRequest[])?.find(
      (req) => req.receiver === displayUser._id
    );
    const receivedFriendRequest = (displayUser.pendingFriendRequests as FriendRequest[])?.find(
      (req) => req.sender === dbUser._id
    );
    const pendingFollowRequest = (dbUser.pendingFollowRequests as FollowRequest[])?.find(
      (req) => req.targetUser === displayUser._id
    );

    // Privacy permissions
    const canViewAge = displayUser.settings?.privacy?.whoCanViewAge === 'everyone' ||
      (displayUser.settings?.privacy?.whoCanViewAge === 'friends' && isFriend) ||
      (displayUser.settings?.privacy?.whoCanViewAge === 'followers' && isFollowing);

    const canViewOnlineStatus = displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'everyone' ||
      (displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'friends' && isFriend) ||
      (displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'followers' && isFollowing);

    const canViewBio = displayUser.settings?.privacy?.whoCanSeeBio === 'everyone' ||
      (displayUser.settings?.privacy?.whoCanSeeBio === 'friends' && isFriend) ||
      (displayUser.settings?.privacy?.whoCanSeeBio === 'followers' && isFollowing);

    const canChat = displayUser.settings?.privacy?.allowChatsFrom !== 'no_one' &&
      (displayUser.settings?.privacy?.allowChatsFrom === 'everyone' ||
       (displayUser.settings?.privacy?.allowChatsFrom === 'friends' && isFriend) ||
       (displayUser.settings?.privacy?.allowChatsFrom === 'followers' && isFollowing));

    const canSendFriendRequest = displayUser.settings?.privacy?.allowFriendRequestsFrom === 'everyone' ||
      (displayUser.settings?.privacy?.allowFriendRequestsFrom === 'followers' && isFollowing);

    return {
      // Relationship states
      isFriend,
      isFollowing,
      isFollower,
      
      // Pending requests
      pendingFriendRequest,
      receivedFriendRequest,
      pendingFollowRequest,
      
      // Permission states
      canViewAge,
      canViewOnlineStatus,
      canViewBio,
      canChat,
      canSendFriendRequest,
    };
  }, [
    dbUser,
    displayUser,
    friendOptimisticStates,
    followOptimisticStates
  ]);
};