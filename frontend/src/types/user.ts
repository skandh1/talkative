export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type ProfileStatus = "active" | "inactive" | "banned" | "deleted";
export type PremiumStatus = "free" | "premium" | "vip";
export type SafetyLevel = "safe" | "under_review" | "restricted";
export type Role = "user" | "moderator" | "admin";


export type FriendRequest = {
  _id: string;
  sender: string;
  receiver: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string; // ISO date string
};

export type FollowRequest = {
  _id: string;
  sender: string;
  receiver: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string; // ISO date string
};


export interface User {
  _id: string; // plain string instead of ObjectId
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
      profileType: "public" | "private";
      allowChatsFrom: "everyone" | "followers" | "friends" | "no_one";
      allowFriendRequestsFrom: "everyone" | "followers" | "no_one";
      allowFollowRequests: boolean;
      whoCanViewAge: "everyone" | "friends" | "followers" | "no_one";
      allowDirectCalls: boolean;
      whoCanSeeOnlineStatus: "everyone" | "friends" | "followers" | "no_one";
      whoCanSeeBio: "everyone" | "friends" | "followers" | "no_one";
    };
    notifications: {
      friendRequests: boolean;
      followRequests: boolean;
      chats: boolean;
      calls: boolean;
      callEnd: boolean;
      clubs: boolean;
      posts: {
        likes: boolean;
        comments: boolean;
      };
      gifts: boolean;
    };
    preferences: {
      languages: string[];
      country: string;
      matchDistance: number;
    };
    account: {
      theme: "light" | "dark" | "system";
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
  followers: string[];
  following: string[];
  blocked: string[];
  blockedBy: string[];
  badges: string[];
  clubs: string[];

  pendingFriendRequests?: FriendRequest[];
  pendingFollowRequests?: FollowRequest[];

  role: Role;
  createdAt: string;
  updatedAt: string;
}
