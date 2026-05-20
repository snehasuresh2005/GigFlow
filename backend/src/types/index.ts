import type { Request } from 'express';
import type { Document, Types } from 'mongoose';

export type UserRole = 'admin' | 'sales';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';

export type LeadSource = 'Website' | 'Instagram' | 'Referral';

export type SortOrder = 'latest' | 'oldest';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { msg: string; path?: string }[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
