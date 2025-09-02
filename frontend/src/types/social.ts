// src/types/social.ts

// Basic user info for lists and previews
export type UserBasicInfo = {
  _id: string;
  username: string;
  profilePic: string;
  isOnline: boolean;
};

// Represents a friend request with sender's info populated
export type PopulatedFriendRequest = {
  _id: string;
  sender: UserBasicInfo;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

// Represents a follow request with requester's info populated
export type PopulatedFollowRequest = {
  _id: string;
  sender: UserBasicInfo;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

// API response for the main social page data
export interface SocialDataResponse {
  friends: UserBasicInfo[];
  followers: UserBasicInfo[];
  following: UserBasicInfo[];
  friendRequests: PopulatedFriendRequest[];
  followRequests: PopulatedFollowRequest[];
}

// API response for handling actions
export interface ActionResponse {
    success: boolean;
    message: string;
}
