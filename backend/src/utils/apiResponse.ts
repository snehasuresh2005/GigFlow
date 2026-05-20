import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): void => {
  const body: ApiResponse<T> = { success: true, data };
  if (message) body.message = message;
  res.status(statusCode).json(body);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta
): void => {
  res.status(200).json({
    success: true,
    data,
    pagination
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: { msg: string; path?: string }[]
): void => {
  const body: ApiResponse = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
};
