// components/FriendActionButtons.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import type { User, FriendRequest } from "@/types/user";
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi'; // Fixed import

interface FriendActionButtonsProps {
  displayUser: User;
  dbUser: User;
  friendActions: any;
  isFollowing: boolean;
}

export const FriendActionButtons: React.FC<FriendActionButtonsProps> = ({
  displayUser,
  dbUser,
  friendActions,
  isFollowing
}) => {
  const { request } = useApi(); // Use the API hook
  const { loadingStates } = friendActions;

  const { data: relationship, isLoading, error } = useQuery({
    queryKey: ["relationship", displayUser._id, dbUser._id], // Include both user IDs
    queryFn: () =>
      request(`/users/requests/${displayUser._id}/relationship`, { // Fixed endpoint
        method: "GET",
      }),
    enabled: !!displayUser && !!dbUser, // fetch only when both users are defined
  });

  const { isFriend, outgoingRequest, incomingRequest } = relationship || {};

  if (isLoading) return null;

  // If the user is a friend
  if (isFriend) {
    return (
      <Button
        onClick={() => friendActions.unfriend(displayUser._id)}
        variant="destructive"
        disabled={loadingStates.isUnfriending}
      >
        {loadingStates.isUnfriending ? 'Unfriending...' : 'Unfriend'}
      </Button>
    );
  }

  // If a friend request was sent by the current user
  if (outgoingRequest) {
    return (
      <Button
        onClick={() => friendActions.cancelFriendRequest(outgoingRequest._id)} // Use the ID from relationship data
        variant="outline"
        disabled={loadingStates.isCancellingRequest}
      >
        {loadingStates.isCancellingRequest ? 'Cancelling...' : 'Cancel Friend Request'}
      </Button>
    );
  }

  // If a friend request was received from this user
  if (incomingRequest) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => friendActions.acceptFriendRequest(incomingRequest._id)} // Use the ID from relationship data
          className="bg-green-500 hover:bg-green-600"
          disabled={loadingStates.isAcceptingRequest}
        >
          {loadingStates.isAcceptingRequest ? 'Accepting...' : 'Accept Friend Request'}
        </Button>
        <Button
          onClick={() => friendActions.rejectFriendRequest(incomingRequest._id)} // Use the ID from relationship data
          variant="outline"
          className="text-red-500 border-red-500 hover:bg-red-50"
          disabled={loadingStates.isRejectingRequest}
        >
          {loadingStates.isRejectingRequest ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    );
  }

  // Default: show add friend button
  const canSendFriendRequest = displayUser.settings?.privacy?.allowFriendRequestsFrom === 'everyone' ||
    (displayUser.settings?.privacy?.allowFriendRequestsFrom === 'followers' && isFollowing);

  if (canSendFriendRequest) {
    return (
      <Button
        onClick={() => friendActions.sendFriendRequest(displayUser._id)}
        className="bg-indigo-600 hover:bg-indigo-700"
        disabled={loadingStates.isSendingRequest}
      >
        {loadingStates.isSendingRequest ? 'Sending...' : 'Add Friend'}
      </Button>
    );
  }

  return null; // Cannot send friend request
};