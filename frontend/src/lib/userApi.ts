import { type User } from '../types/user'; // Corrected import path

// Mock user data now conforms to the frontend User type
const mockUser: User = {
  _id: 'user123',
  displayName: 'rohit',
  username: "Alex Ryder",
  email: "alex.ryder@example.com",
  profilePic: "https://i.pravatar.cc/150?u=alexryder",
  about: "Tech enthusiast, coffee addict, and aspiring world traveler...",
  coins: 1250,
  rating: 4.8,
  callCount: 88,
  isOnline: true,
  profileStatus: "active",
  age: 28,
  gender: "male",
  topics: ["AI", "React", "Sci-Fi", "Travel", "Coffee"],
  friends: [],
  friends: [],
  blocked: [],
  clubs: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  hasSetUsername: false
};

// Functions now use the frontend 'User' type
export const fetchUserProfile = async (userId: string): Promise<User> => {
  console.log(`Fetching profile for user: ${userId}...`);
  return new Promise(resolve => setTimeout(() => resolve(mockUser), 1000));
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
  console.log(`Updating profile for user: ${userId} with data:`, data);
  return new Promise(resolve => setTimeout(() => {
    const updatedUser = { ...mockUser, ...data };
    resolve(updatedUser);
  }, 1500));
};