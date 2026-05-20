import type { LeadSource, LeadStatus } from '../types';

export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];

export const LEAD_SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};
