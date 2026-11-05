export type LeadSource =
  | 'Referral'
  | 'Webinar'
  | 'Website'
  | 'Trade Show'
  | 'Social Media'
  | 'Cold Call';

export type LeadRegion = 'North' | 'South' | 'East' | 'West';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type LeadTimeline = '0-1 Months' | '1-3 Months' | '3-6 Months' | '6+ Months';

export type LeadGrade = 'Hot' | 'Warm' | 'Cold';

export interface RawLead {
  lead_id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  source: string;
  region: string;
  created_date: string;
  status: string;
  budget: number | string;
  company_size: number | string;
  timeline: string;
  website_visits: number | string;
  emails_opened: number | string;
}

export interface ValidatedLead {
  lead_id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string; // Cleaned 10-digit Indian phone
  source: LeadSource;
  region: LeadRegion;
  created_date: string; // YYYY-MM-DD
  status: LeadStatus;
  budget: number;
  company_size: number;
  timeline: LeadTimeline;
  website_visits: number;
  emails_opened: number;
  clean_modifications: string[];
}

export interface RejectedLead {
  lead: RawLead;
  reject_reason: string;
  field_errors: Record<string, string>;
  suggested_fix: string;
}

export interface DuplicateLead {
  duplicate_lead: ValidatedLead;
  original_lead_id: string;
  original_created_date: string;
  duplicate_reason: string;
}

export interface ScoreBreakdown {
  source_points: number; // max 25
  budget_points: number; // max 25
  company_size_points: number; // max 15
  engagement_points: number; // max 15
  timeline_points: number; // max 20
  total_score: number; // max 100
}

export interface ProcessedLead extends ValidatedLead {
  score: number;
  grade: LeadGrade;
  score_breakdown: ScoreBreakdown;
  assigned_to: string; // Sales rep name or "N/A (closed)"
  rep_seniority: 'Senior' | 'Junior' | 'None';
  followup_due_date: string;
  sla_days: number;
  is_sla_breach: boolean;
  days_overdue: number;
}

export interface PipelineStats {
  input_records: number;
  valid_records: number;
  rejected_records: number;
  duplicates_removed: number;
  processed_leads: number;
  sla_breaches: number;
  total_pipeline_value_inr: number;
  avg_score: number;
  execution_time_ms: number;
}

export interface SummaryByGrade {
  grade: LeadGrade;
  leads_count: number;
  avg_score: number;
  total_budget_inr: number;
}

export interface SummaryBySource {
  source: LeadSource;
  leads_count: number;
  avg_score: number;
  hot_leads: number;
  converted: number;
}

export interface SummaryByOwner {
  owner: string;
  region: LeadRegion;
  seniority: 'Senior' | 'Junior';
  leads_count: number;
  hot_leads: number;
  sla_breaches: number;
  total_budget_inr: number;
}

export interface PipelineLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  module: string;
  message: string;
}

export interface TestCaseResult {
  no: number;
  name: string;
  input_summary: string;
  expected_result: string;
  actual_result: string;
  passed: boolean;
  duration_ms: number;
  details: string;
}
