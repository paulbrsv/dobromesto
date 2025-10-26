import { z } from 'zod';

export const reviewCreateSchema = z.object({
  placeId: z.coerce.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const reviewUpdateSchema = reviewCreateSchema.partial();

export const reviewIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const reviewQuerySchema = z.object({
  placeId: z.coerce.number().int().positive().optional(),
});
