export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type ProfileStatus = "active" | "inactive" | "banned" | "deleted";
export type PremiumStatus = "free" | "premium" | "vip";
export type SafetyLevel = "safe" | "under_review" | "restricted";
export type Role = "user" | "moderator" | "admin";

export interface IUser {
  id: string; // plain string instead of ObjectId
  uid: string;
  username?: string;
  displayName?: string;
  email: string;
  profilePic?: string;
  coverPhoto?: string;
  about?: string;
  age?: number;
  gender: Gender;
  isVerified: boolean;
  hasSetUsername: boolean;
  usernameLastUpdatedAt?: string; // ISO date string
  isOnline: boolean;
  lastActive?: string; // ISO date string

  settings: {
    privacy: {
      isProfilePublic: boolean;
      showOnlineStatus: boolean;
      showLastActive: boolean;
      hideAge: boolean;
      hideLocation: boolean;
    };
    communication: {
      allowFriendRequests: boolean;
      allowChatRequests: boolean;
      allowCalls: boolean;
      allowGiftRequests: boolean;
    };
    preferences: {
      languages: string[];
      country: string;
      matchDistance?: number;
    };
    account: {
      theme: "light" | "dark" | "system";
      notifications: {
        chat: boolean;
        calls: boolean;
        gifts: boolean;
      };
    };
  };

  profileStatus: ProfileStatus;
  safetyLevel: SafetyLevel;

  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  achievements: string[];
  callCount: number;
  callMinutes: number;
  premiumStatus: PremiumStatus;
  giftHistory: {
    giftId: string;
    fromUser?: string;
    toUser?: string;
    date: string;
  }[];

  rating: { average: number; count: number };
  reportCount: number;

  interests: string[];
  topics: string[];
  friends: string[]; // user IDs
  blocked: string[];
  blockedBy: string[];
  badges: string[];
  clubs: string[];

  role: Role;
  createdAt: string;
  updatedAt: string;
}
