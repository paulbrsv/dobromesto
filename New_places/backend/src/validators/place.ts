import { z } from 'zod';

export const placeCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  categoryId: z.coerce.number().int().positive(),
  filterIds: z.array(z.coerce.number().int().positive()).optional(),
});

export const placeUpdateSchema = placeCreateSchema.partial();

export const placeIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
