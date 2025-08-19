import type { User, FriendRequest, FollowRequest } from "@/types/user";
import StatCard from "./StatCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Define the Props type for the component
type UserInfoDisplayProps = {
  displayUser: User;
  isOwner: boolean;
  status: { isOnline: boolean };
  onSendFriendRequest: (userId: string) => void;
  onCancelFriendRequest: (requestId: string) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onRejectFriendRequest: (requestId: string) => void;
  onSendFollowRequest: (userId: string) => void;
  onCancelFollowRequest: (requestId: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onAddFriend: (userId: string) => void;
  onUnfriend: (userId: string) => void;
};

const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({
  displayUser,
  isOwner,
  status,
  onSendFriendRequest,
  onCancelFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onSendFollowRequest,
  onCancelFollowRequest,
  onFollow,
  onUnfollow,
  onAddFriend,
  onUnfriend,
}) => {
  const { dbUser } = useAuth();
  
  if (!dbUser) {
    return null; // Don't render if current user data isn't loaded
  }

  const isFriend = dbUser.friends?.some((friendId: string) => friendId === displayUser._id) || false;
  const isFollowing = dbUser.following?.some((followingId: string) => followingId === displayUser._id) || false;
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
  
  const renderFriendActionButtons = () => {
    // If the user is a friend
    if (isFriend) {
      return (
        <Button onClick={() => onUnfriend(displayUser._id)} variant="destructive">
          Unfriend
        </Button>
      );
    }

    // If a friend request was sent by the current user
    if (pendingFriendRequest) {
      return (
        <Button onClick={() => onCancelFriendRequest(pendingFriendRequest._id)} variant="outline">
          Cancel Friend Request
        </Button>
      );
    }

    // If a friend request was received from this user
    if (receivedFriendRequest) {
      return (
        <div className="flex gap-2">
          <Button onClick={() => onAcceptFriendRequest(receivedFriendRequest._id)} className="bg-green-500 hover:bg-green-600">
            Accept Friend Request
          </Button>
          <Button onClick={() => onRejectFriendRequest(receivedFriendRequest._id)} variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">
            Reject
          </Button>
        </div>
      );
    }

    // Default: show add friend button
    const canSendFriendRequest = displayUser.settings?.privacy?.allowFriendRequestsFrom === 'everyone' ||
      (displayUser.settings?.privacy?.allowFriendRequestsFrom === 'followers' && isFollowing);

    if (canSendFriendRequest) {
      return (
        <Button onClick={() => onSendFriendRequest(displayUser._id)} className="bg-indigo-600 hover:bg-indigo-700">
          Add Friend
        </Button>
      );
    }
    return null; // Cannot send friend request
  };

  const renderFollowActionButtons = () => {
    const isPrivate = displayUser.settings?.privacy?.profileType === 'private';
    
    // User is already following the target
    if (isFollowing) {
        return (
            <Button onClick={() => onUnfollow(displayUser._id)} variant="outline">
                Unfollow
            </Button>
        );
    }

    // Public profile, not following yet
    if (displayUser.settings?.privacy?.profileType === 'public') {
        return (
            <Button onClick={() => onFollow(displayUser._id)} className="bg-indigo-600 hover:bg-indigo-700">
                Follow
            </Button>
        );
    }
    
    // Private profile logic
    if (isPrivate) {
      if (pendingFollowRequest) {
        return (
          <Button onClick={() => onCancelFollowRequest(pendingFollowRequest._id)} variant="outline">
            Cancel Follow Request
          </Button>
        );
      }
      return (
        <Button onClick={() => onSendFollowRequest(displayUser._id)} className="bg-gray-600 hover:bg-gray-700">
          Request to Follow
        </Button>
      );
    }

    return null;
  };

  const canViewAge = isOwner || displayUser.settings?.privacy?.whoCanViewAge === 'everyone' ||
    (displayUser.settings?.privacy?.whoCanViewAge === 'friends' && isFriend) ||
    (displayUser.settings?.privacy?.whoCanViewAge === 'followers' && isFollowing);

  const canViewOnlineStatus = isOwner || displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'everyone' ||
    (displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'friends' && isFriend) ||
    (displayUser.settings?.privacy?.whoCanSeeOnlineStatus === 'followers' && isFollowing);

  const canViewBio = isOwner || displayUser.settings?.privacy?.whoCanSeeBio === 'everyone' ||
    (displayUser.settings?.privacy?.whoCanSeeBio === 'friends' && isFriend) ||
    (displayUser.settings?.privacy?.whoCanSeeBio === 'followers' && isFollowing);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <img
            src={displayUser.profilePic || 'https://www.gravatar.com/avatar/?d=mp'}
            alt="Profile"
            className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-indigo-500/50"
          />
          {canViewOnlineStatus && (
            <div
              className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800
                ${status?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
              title={status?.isOnline ? "Online" : "Offline"}
            />
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {displayUser.displayName}
            </p>
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
          <div className="mt-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
            {isOwner ? (
              <Button disabled className="bg-gray-500 cursor-not-allowed">
                Your Profile
              </Button>
            ) : (
              <>
                {displayUser.settings?.privacy?.allowChatsFrom !== 'no_one' && (
                  <Button
                    onClick={() => console.log('Chat initiated')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={
                      displayUser.settings?.privacy?.allowChatsFrom === 'friends' && !isFriend ||
                      displayUser.settings?.privacy?.allowChatsFrom === 'followers' && !isFollowing
                    }
                  >
                    Chat
                  </Button>
                )}
                {renderFriendActionButtons()}
                {renderFollowActionButtons()}
                {displayUser.settings?.privacy?.allowDirectCalls && (
                  <Button
                    onClick={() => console.log('Call initiated')}
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {canViewBio && (
            <p className="text-lg col-span-1 sm:col-span-2">
              <strong>About:</strong> {displayUser.about || 'Not set'}
            </p>
          )}
          {canViewAge && (
            <p className="text-lg"><strong>Age:</strong> {displayUser.age ?? 'Not set'}</p>
          )}
          <p className="text-lg"><strong>Gender:</strong> {displayUser.gender ?? 'Not set'}</p>
          <p className="text-lg"><strong>Country:</strong> {displayUser.settings?.preferences?.country || 'Not set'}</p>
          <p className="text-lg"><strong>Languages:</strong> {displayUser.settings?.preferences?.languages?.join(', ') || 'Not set'}</p>
          {isOwner && (
            <>
              <p className="text-md col-span-1 sm:col-span-2 break-all text-gray-500 dark:text-gray-400">
                <strong>User ID:</strong> {displayUser._id}
              </p>
              <p className="text-md col-span-1 sm:col-span-2 text-gray-500 dark:text-gray-400">
                <strong>Email:</strong> {displayUser.email}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Stats</h2>
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interests & Topics</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {displayUser.topics?.length ? (
            displayUser.topics.map((topic: string) => (
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
  );
};

export default UserInfoDisplay;