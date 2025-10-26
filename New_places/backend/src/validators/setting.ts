import { z } from 'zod';

export const settingCreateSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const settingUpdateSchema = settingCreateSchema.partial();

export const settingIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
