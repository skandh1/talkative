// The possible values for gender, matching your backend schema.
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

// The possible values for profile status.
export type ProfileStatus = "active" | "inactive" | "banned" | "deleted";

// The User interface for your frontend application.
export interface User {
  id: string; // MongoDB's _id is usually sent as a string.
  username: string;
  email: string;
  profilePic?: string;
  about?: string;
  coins: number;
  rating: number;
  callCount: number;
  isOnline: boolean;
  profileStatus: ProfileStatus;
  age?: number;
  gender?: Gender;
  favs: string[];       // ObjectId becomes string
  friends: string[];    // ObjectId becomes string
  blocked: string[];    // ObjectId becomes string
  topics: string[];
  clubs: string[];      // ObjectId becomes string
  createdAt: string;    // Date becomes string
  updatedAt:string;     // Date becomes string
}