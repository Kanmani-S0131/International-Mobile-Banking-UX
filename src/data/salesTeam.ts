import { LeadRegion } from '../types/crm';

export interface SalesRep {
  id: string;
  name: string;
  region: LeadRegion;
  seniority: 'Senior' | 'Junior';
  email: string;
}

export const SALES_TEAM: SalesRep[] = [
  // North
  { id: 'N_SR_1', name: 'Arjun Rao', region: 'North', seniority: 'Senior', email: 'arjun.rao@defineinfotech.com' },
  { id: 'N_JR_1', name: 'Meena Iyer', region: 'North', seniority: 'Junior', email: 'meena.iyer@defineinfotech.com' },
  { id: 'N_JR_2', name: 'Karan Singh', region: 'North', seniority: 'Junior', email: 'karan.singh@defineinfotech.com' },

  // South
  { id: 'S_SR_1', name: 'Priya Nair', region: 'South', seniority: 'Senior', email: 'priya.nair@defineinfotech.com' },
  { id: 'S_JR_1', name: 'Rajesh Kumar', region: 'South', seniority: 'Junior', email: 'rajesh.kumar@defineinfotech.com' },
  { id: 'S_JR_2', name: 'Deepa V.', region: 'South', seniority: 'Junior', email: 'deepa.v@defineinfotech.com' },

  // West
  { id: 'W_SR_1', name: 'Rohan Mehta', region: 'West', seniority: 'Senior', email: 'rohan.mehta@defineinfotech.com' },
  { id: 'W_JR_1', name: 'Neha Patil', region: 'West', seniority: 'Junior', email: 'neha.patil@defineinfotech.com' },
  { id: 'W_JR_2', name: 'Vikram Joshi', region: 'West', seniority: 'Junior', email: 'vikram.joshi@defineinfotech.com' },

  // East
  { id: 'E_SR_1', name: 'Ananya Sen', region: 'East', seniority: 'Senior', email: 'ananya.sen@defineinfotech.com' },
  { id: 'E_JR_1', name: 'Amit Roy', region: 'East', seniority: 'Junior', email: 'amit.roy@defineinfotech.com' },
  { id: 'E_JR_2', name: 'Sayan Das', region: 'East', seniority: 'Junior', email: 'sayan.das@defineinfotech.com' },
];

export const ALLOWED_SOURCES = [
  'Referral',
  'Webinar',
  'Website',
  'Trade Show',
  'Social Media',
  'Cold Call',
] as const;

export const ALLOWED_REGIONS = ['North', 'South', 'East', 'West'] as const;

export const ALLOWED_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost',
] as const;

export const ALLOWED_TIMELINES = [
  '0-1 Months',
  '1-3 Months',
  '3-6 Months',
  '6+ Months',
] as const;
