import { z } from 'zod';

export const safeParse = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.message}`);
  }
  return result.data;
};

export const createErrorResponse = (code: string, message: string, details?: any) => ({
  code,
  message,
  details,
});