// src/middlewares/validator.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodObject } from 'zod';

export const validate = (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // For PATCH /users/me/settings, we expect the settings object in req.body
      console.log(req.body)
      schema.parse(req.body);
      next();
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input dataaaa',
        errors: e.errors,
      });
    }
  };