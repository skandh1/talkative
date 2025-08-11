// frontend/types/User.ts
export interface User {
  _id?: string;
  uid: string;
  email: string;
  username?: string;
  displayName?: string;
  profilePic?: string;
  about?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  language?: string;
  country?: string;
  isVerified?: boolean;
  isProfilePublic?: boolean;
  hasSetUsername?: boolean;
  usernameLastUpdatedAt?: string;
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  lastActive: Date;
  profileStatus?: "active" | "inactive" | "banned" | "deleted";
  coins?: number;
  xp?: number;
  level?: number;
  callCount?: number;
  rating?: {
    average: number;
    count: number;
  };
  favs?: string[]; // These will come as string IDs from backend
  blocked?: string[];
  topics?: string[];
  clubs?: string[];
  role?: "user" | "moderator" | "admin";
  createdAt?: string;
  updatedAt?: string;
}
