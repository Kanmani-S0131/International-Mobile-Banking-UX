export type ScreenCategory =
  | 'Login'
  | 'Investments'
  | 'Loans'
  | 'Statements'
  | 'Transfers'
  | 'Settings'
  | 'Payments'
  | 'Notifications'
  | 'Support'
  | 'Onboarding'
  | 'Cards'
  | 'Accounts'
  | 'Dashboard';

export type UXGrade = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface RawRecord {
  record_id: string;
  bank_name: string;
  country: string;
  app_name: string;
  screen_no: number | string;
  screen_name: string;
  screen_category: string;
  features_present: string;
  auth_method: string;
  languages_supported: string;
  accessibility_flag: string;
  ux_rating: number | string;
  collected_by: string;
  collected_date: string;
  source_file?: string;
}

export interface CleanedRecord extends RawRecord {
  screen_no: number;
  ux_rating: number;
  country_cleaned: string;
  accessibility_flag_cleaned: 'Yes' | 'No';
  features_list: string[];
  languages_list: string[];
  clean_modifications: string[];
}

export interface ValidatedRecord extends CleanedRecord {
  ux_score: number;
  ux_grade: UXGrade;
  score_breakdown: {
    rating_component: number; // Max 60
    features_component: number; // Max 20
    accessibility_component: number; // Max 10
    languages_component: number; // Max 10
    total: number;
  };
}

export interface RejectedRecord {
  record: RawRecord;
  rule_id: 'BR1' | 'BR2' | 'BR3' | 'BR4' | 'BR5';
  rejection_reason: string;
  rejected_at_stage: 'validate' | 'load';
  suggested_fix: string;
}

export interface PipelineExecutionLog {
  id: string;
  timestamp: string;
  stage: 'Load' | 'Clean' | 'Validate' | 'Score' | 'Report';
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface PipelineStats {
  files_read: number;
  records_loaded: number;
  records_cleaned: number;
  records_valid: number;
  records_rejected: number;
  banks_covered: number;
  avg_ux_score: number;
  avg_ux_rating: number;
  execution_time_ms: number;
}

export interface BankRanking {
  rank: number;
  bank_name: string;
  country: string;
  screens_count: number;
  avg_rating: number;
  avg_score: number;
  accessibility_pct: number;
  avg_features: number;
}

export interface CategorySummary {
  category: ScreenCategory;
  screens_count: number;
  avg_score: number;
  avg_rating: number;
  top_bank: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  expected_result: string;
  actual_result: string;
  passed: boolean;
  duration_ms: number;
  details: string;
  sample_input: Record<string, any>;
}

export interface BusinessRuleDef {
  id: string;
  name: string;
  description: string;
  on_failure: 'Reject' | 'Reject duplicate' | 'Auto-fix' | 'Computed';
  stage: 'Clean' | 'Validate' | 'Score';
  status: 'active' | 'customized';
}
