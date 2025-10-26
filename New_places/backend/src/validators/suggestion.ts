import { z } from 'zod';

export const suggestionCreateSchema = z.object({
  placeName: z.string().min(1),
  description: z.string().optional(),
  contact: z.string().optional(),
});

export const suggestionUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  placeName: z.string().optional(),
  description: z.string().optional(),
  contact: z.string().optional(),
});

export const suggestionIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
