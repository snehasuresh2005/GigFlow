import type { Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';
import type { AuthRequest, UserRole } from '../types/index.js';

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Not authorized', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Forbidden: insufficient permissions', 403);
      return;
    }

    next();
  };
};
