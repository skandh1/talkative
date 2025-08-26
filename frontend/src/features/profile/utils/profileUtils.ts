// utils/profileUtils.ts
import type { User } from "@/types/user";
import { PRIVACY_LEVELS, PROFILE_STATUS, PREMIUM_STATUS, USER_ROLES } from '../constants/profile';

export const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case PROFILE_STATUS.ACTIVE:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case PROFILE_STATUS.BANNED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getPremiumBadgeStyles = (premiumStatus: string) => {
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
};

export const getRoleBadgeStyles = (role: string) => {
  return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
};

export const checkPrivacyPermission = (
  permission: string | undefined,
  isOwner: boolean,
  isFriend: boolean,
  isFollowing: boolean
): boolean => {
  if (isOwner) return true;
  
  switch (permission) {
    case PRIVACY_LEVELS.EVERYONE:
      return true;
    case PRIVACY_LEVELS.FRIENDS:
      return isFriend;
    case PRIVACY_LEVELS.FOLLOWERS:
      return isFollowing;
    case PRIVACY_LEVELS.NO_ONE:
      return false;
    default:
      return false;
  }
};

export const getProfileImageUrl = (profilePic?: string): string => {
  return profilePic || 'https://www.gravatar.com/avatar/?d=mp';
};

export const formatUserDisplayInfo = (user: User) => {
  return {
    displayName: user.displayName || 'Unknown User',
    username: user.username || 'unknown',
    about: user.about || 'Not set',
    age: user.age ?? 'Not set',
    gender: user.gender ?? 'Not set',
    country: user.settings?.preferences?.country || 'Not set',
    languages: user.settings?.preferences?.languages?.join(', ') || 'Not set',
  };
};

export const isOwnerProfile = (identifier: string | undefined, dbUser: User | null): boolean => {
  return !!(identifier && dbUser && (identifier === dbUser.username || identifier === dbUser._id));
};

export const shouldShowPremiumBadge = (premiumStatus: string): boolean => {
  return premiumStatus !== PREMIUM_STATUS.FREE;
};

export const shouldShowRoleBadge = (role: string): boolean => {
  return role !== USER_ROLES.USER;
};