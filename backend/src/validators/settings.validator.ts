// src/validators/settings.validator.ts
import { z } from "zod";

export const settingsPatchSchema = z.object({
  privacy: z.object({
    isProfilePublic: z.boolean().optional(),
    showOnlineStatus: z.boolean().optional(),
    showLastActive: z.boolean().optional(),
    hideAge: z.boolean().optional(),
    hideLocation: z.boolean().optional(),
  }).strict().optional(),
  communication: z.object({
    allowFriendRequests: z.boolean().optional(),
    allowChatRequests: z.boolean().optional(),
    allowCalls: z.boolean().optional(),
    allowGiftRequests: z.boolean().optional(),
  }).strict().optional(),
  preferences: z.object({
    languages: z.array(z.string()).max(20).optional(),
    country: z.string().nullable().optional(),
    matchDistance: z.number().min(0).max(1000).optional()
  }).strict().optional(),
  account: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    notifications: z.object({
      chat: z.boolean().optional(),
      calls: z.boolean().optional(),
      gifts: z.boolean().optional()
    }).strict().optional()
  }).strict().optional(),
  blocked: z.array(z.string()).optional()
}).strict();

export type SettingsPatchInput = z.infer<typeof settingsPatchSchema>;