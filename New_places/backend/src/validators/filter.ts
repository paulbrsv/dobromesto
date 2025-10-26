import { z } from 'zod';

export const filterCreateSchema = z.object({
  name: z.string().min(1),
});

export const filterUpdateSchema = filterCreateSchema.partial();

export const filterIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
