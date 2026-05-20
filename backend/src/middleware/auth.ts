import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';
import type { AuthRequest } from '../types/index.js';

interface JwtPayload {
  userId: string;
}

const extractToken = (req: AuthRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.token ?? null;
};

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      sendError(res, 'Not authorized, no token', 401);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    req.user = user;
    next();
  } catch {
    sendError(res, 'Not authorized, token failed', 401);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      next();
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};
