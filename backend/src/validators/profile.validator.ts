import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters long')
      .max(25, 'Username must be no more than 25 characters long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .optional(),

    profilePic: z.string()
      .url('Profile picture must be a valid URL')
      .or(z.literal(''))
      .optional(),

    about: z.string()
      .max(500, 'About section cannot be more than 500 characters')
      .optional(),

    age: z.number()
      .min(13, 'You must be at least 13 years old')
      .max(100, 'Age must be a realistic number')
      .optional(),

    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),

    topics: z.array(z.string().max(30, 'Each topic must be 30 characters or less'))
      .max(15, 'You can have a maximum of 15 topics')
      .optional(),
  }).strict(), // Prevents extra fields
});

// This is a middleware function that you can use in your routes
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: e.errors,
      });
    }
  };