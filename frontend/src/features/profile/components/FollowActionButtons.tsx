// components/FollowActionButtons.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import type { User, FollowRequest } from "@/types/user";
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

interface FollowActionButtonsProps {
  displayUser: User;
  dbUser: User;
  followActions: any;
}

export const FollowActionButtons: React.FC<FollowActionButtonsProps> = ({
  displayUser,
  dbUser,
  followActions
}) => {
  const { request } = useApi();
  const { loadingStates } = followActions;

  // Get follow relationship status from API
  const { data: followRelationship, isLoading } = useQuery({
    queryKey: ["followRelationship", displayUser._id, dbUser._id],
    queryFn: () =>
      request(`/users/requests/${displayUser._id}/follow-relationship`, {
        method: "GET",
      }),
    enabled: !!displayUser && !!dbUser,
  });

  const { isFollowing, outgoingFollowRequest, incomingFollowRequest } = followRelationship || {};

  if (isLoading) return null;

  // User is already following the target
  if (isFollowing) {
    return (
      <Button 
        onClick={() => followActions.unfollow(displayUser._id)} 
        variant="outline"
        disabled={loadingStates.isUnfollowing}
      >
        {loadingStates.isUnfollowing ? 'Unfollowing...' : 'Unfollow'}
      </Button>
    );
  }

  // If there's an incoming follow request (user wants to follow you)
  if (incomingFollowRequest) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => followActions.acceptFollowRequest(incomingFollowRequest._id)}
          className="bg-green-500 hover:bg-green-600"
          disabled={loadingStates.isAcceptingFollowRequest}
        >
          {loadingStates.isAcceptingFollowRequest ? 'Accepting...' : 'Accept Follow Request'}
        </Button>
        <Button
          onClick={() => followActions.rejectFollowRequest(incomingFollowRequest._id)}
          variant="outline"
          className="text-red-500 border-red-500 hover:bg-red-50"
          disabled={loadingStates.isRejectingFollowRequest}
        >
          {loadingStates.isRejectingFollowRequest ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    );
  }

  // If user sent a follow request (pending outgoing request)
  if (outgoingFollowRequest) {
    return (
      <Button 
        onClick={() => followActions.cancelFollowRequest(outgoingFollowRequest._id)} 
        variant="outline"
        disabled={loadingStates.isCancellingFollowRequest}
      >
        {loadingStates.isCancellingFollowRequest ? 'Cancelling...' : 'Cancel Follow Request'}
      </Button>
    );
  }

  // Public profile - can follow directly
  if (displayUser.settings?.privacy?.profileType === 'public') {
    return (
      <Button 
        onClick={() => followActions.follow(displayUser._id)} 
        className="bg-indigo-600 hover:bg-indigo-700"
        disabled={loadingStates.isFollowing}
      >
        {loadingStates.isFollowing ? 'Following...' : 'Follow'}
      </Button>
    );
  }
  
  // Private profile - need to send follow request
  if (displayUser.settings?.privacy?.profileType === 'private') {
    return (
      <Button 
        onClick={() => followActions.sendFollowRequest(displayUser._id)} 
        className="bg-gray-600 hover:bg-gray-700"
        disabled={loadingStates.isSendingFollowRequest}
      >
        {loadingStates.isSendingFollowRequest ? 'Requesting...' : 'Request to Follow'}
      </Button>
    );
  }

  return null;
};