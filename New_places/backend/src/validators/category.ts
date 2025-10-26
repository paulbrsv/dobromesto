import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const categoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
