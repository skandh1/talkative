import { z } from "zod";

export const settingsPatchSchema = z.object({
  privacy: z.object({
    profileType: z.enum(["public", "private"]).optional(),

    allowChatsFrom: z.enum(["everyone", "followers", "friends", "no_one"]).optional(),
    allowFriendRequestsFrom: z.enum(["everyone", "followers", "no_one"]).optional(),
    allowFollowRequests: z.boolean().optional(),

    whoCanViewAge: z.enum(["everyone", "friends", "followers", "no_one"]).optional(),
    allowDirectCalls: z.boolean().optional(),
    whoCanSeeOnlineStatus: z.enum(["everyone", "friends", "followers", "no_one"]).optional(),
    whoCanSeeBio: z.enum(["everyone", "friends", "followers", "no_one"]).optional(),
  }).strict().optional(),

  notifications: z.object({
    friendRequests: z.boolean().optional(),
    followRequests: z.boolean().optional(),
    chats: z.boolean().optional(),
    calls: z.boolean().optional(),
    callEnd: z.boolean().optional(),
    clubs: z.boolean().optional(),
    posts: z.object({
      likes: z.boolean().optional(),
      comments: z.boolean().optional(),
    }).strict().optional(),
    gifts: z.boolean().optional(),
  }).strict().optional(),

  preferences: z.object({
    languages: z.array(z.string()).max(20).optional(),
    country: z.union([z.string(), z.literal("")]).optional(), // allow "" explicitly
    matchDistance: z.number().min(0).max(1000).optional(),
  }).strict().optional(),

  account: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
  }).strict().optional(),
  
  blocked: z.array(z.string()).optional(),
}).strict();
