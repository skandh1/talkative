import { z } from 'zod';

// This schema is used by React Hook Form for client-side validation
export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters.')
    .max(25, 'Username must be 25 characters or less.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.')
    .optional(),

  profilePic: z.string()
    .url('Must be a valid URL.')
    .or(z.literal('')) // Allow empty string
    .optional(),

  about: z.string()
    .max(500, 'About section cannot exceed 500 characters.')
    .optional(),

  age: z.coerce.number() // Coerce input string to number
    .min(13, 'You must be at least 13 years old.')
    .max(120, 'Please enter a realistic age.')
    .optional(),

  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),

  // For the form, we'll handle topics as a single string
  topics: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;