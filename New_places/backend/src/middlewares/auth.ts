import { NextFunction, Request, Response } from 'express';
import env from '../config/environment';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  if (!env.adminToken) {
    return res.status(500).json({ message: 'Admin token not configured' });
  }

  const token = req.header('x-admin-token');
  if (!token || token !== env.adminToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}
