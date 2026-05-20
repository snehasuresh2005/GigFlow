import type { FilterQuery } from 'mongoose';
import type { ILead, LeadSource, LeadStatus, SortOrder } from '../types/index.js';

const PAGE_LIMIT = 10;

export interface LeadQueryParams {
  status?: string;
  source?: string;
  search?: string;
  sort?: string;
  page?: string;
}

export const buildLeadFilter = (params: LeadQueryParams): FilterQuery<ILead> => {
  const filter: FilterQuery<ILead> = {};

  const validStatuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
  if (params.status && validStatuses.includes(params.status as LeadStatus)) {
    filter.status = params.status as LeadStatus;
  }

  const validSources: LeadSource[] = ['Website', 'Instagram', 'Referral'];
  if (params.source && validSources.includes(params.source as LeadSource)) {
    filter.source = params.source as LeadSource;
  }

  if (params.search?.trim()) {
    const searchRegex = new RegExp(params.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  return filter;
};

export const getSortOrder = (sort?: string): SortOrder => {
  return sort === 'oldest' ? 'oldest' : 'latest';
};

export const getPagination = (page?: string) => {
  const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
  const skip = (pageNum - 1) * PAGE_LIMIT;
  return { page: pageNum, limit: PAGE_LIMIT, skip };
};

export { PAGE_LIMIT };
