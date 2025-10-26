import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

export function validate(schema: AnyZodObject, part: RequestPart = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[part]);
      (req as any)[part] = data;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.issues,
        });
      }

      return next(error instanceof Error ? error : new Error('Unknown validation error'));
    }
  };
}
