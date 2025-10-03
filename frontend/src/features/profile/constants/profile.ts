// constants/profile.ts

export const PROFILE_MESSAGES = {
  SUCCESS: {
    FRIEND_REQUEST_SENT: "Friend request sent! 🎉",
    FRIEND_REQUEST_ACCEPTED: "Friend request accepted! 🥳",
    FOLLOW_REQUEST_SENT: "Follow request sent! ✅",
    NOW_FOLLOWING: "Now following this user.",
    PROFILE_UPDATED: "Profile updated successfully! ✅",
  },
  INFO: {
    FRIEND_REQUEST_CANCELLED: "Friend request cancelled.",
    FRIEND_REQUEST_REJECTED: "Friend request rejected.",
    UNFRIENDED: "Unfriended successfully.",
    UNFOLLOWED: "Unfollowed user.",
    FOLLOW_REQUEST_CANCELLED: "Follow request cancelled.",
  },
  ERROR: {
    FRIEND_REQUEST_FAILED: "Failed to send request",
    CANCEL_REQUEST_FAILED: "Failed to cancel request",
    ACCEPT_REQUEST_FAILED: "Failed to accept request",
    REJECT_REQUEST_FAILED: "Failed to reject request",
    UNFRIEND_FAILED: "Failed to unfriend",
    FOLLOW_FAILED: "Failed to follow",
    UNFOLLOW_FAILED: "Failed to unfollow",
    FOLLOW_REQUEST_FAILED: "Failed to send follow request",
    CANCEL_FOLLOW_REQUEST_FAILED: "Failed to cancel follow request",
    PROFILE_UPDATE_FAILED: "Failed to update profile.",
    UNKNOWN_ERROR: "Unknown error",
  }
};

export const BUTTON_LOADING_STATES = {
  SENDING: 'Sending...',
  CANCELLING: 'Cancelling...',
  ACCEPTING: 'Accepting...',
  REJECTING: 'Rejecting...',
  UNFRIENDING: 'Unfriending...',
  FOLLOWING: 'Following...',
  UNFOLLOWING: 'Unfollowing...',
  REQUESTING: 'Requesting...',
};

export const PRIVACY_LEVELS = {
  EVERYONE: 'everyone',
  FRIENDS: 'friends',
  FOLLOWERS: 'followers',
  NO_ONE: 'no_one',
} as const;

export const PROFILE_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

export const PROFILE_STATUS = {
  ACTIVE: 'active',
  BANNED: 'banned',
  INACTIVE: 'inactive',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const PREMIUM_STATUS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PREMIUM_PLUS: 'premium_plus',
} as const;