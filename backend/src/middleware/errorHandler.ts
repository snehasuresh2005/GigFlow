import type { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/apiResponse.js';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route not found: ${req.originalUrl}`, 404);
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError
      ? err.message
      : process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

  console.error(err);
  sendError(res, message, statusCode);
};
