import {
  ALLOWED_REGIONS,
  ALLOWED_SOURCES,
  ALLOWED_STATUSES,
  ALLOWED_TIMELINES,
  SALES_TEAM,
} from '../data/salesTeam';
import {
  DuplicateLead,
  LeadGrade,
  LeadRegion,
  LeadSource,
  LeadStatus,
  LeadTimeline,
  PipelineLog,
  PipelineStats,
  ProcessedLead,
  RawLead,
  RejectedLead,
  ScoreBreakdown,
  SummaryByGrade,
  SummaryByOwner,
  SummaryBySource,
  ValidatedLead,
} from '../types/crm';

// Helper to sanitize and validate phone
export function cleanIndianPhone(phoneRaw: string | number | undefined | null): string | null {
  if (phoneRaw === undefined || phoneRaw === null) return null;
  const str = phoneRaw.toString().trim();
  if (!str) return null;

  // Remove spaces, dashes, dots, parentheses
  let digits = str.replace(/[\s\-\.\(\)]/g, '');

  // Remove +91 or 91 prefix if followed by 10 digits
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  }

  // Must be exactly 10 digits
  if (/^\d{10}$/.test(digits)) {
    return digits;
  }
  return null;
}

// Helper to validate email format
export function isValidEmail(emailRaw: string | undefined | null): boolean {
  if (!emailRaw) return false;
  const email = emailRaw.toString().trim();
  // Standard strict email pattern
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

// 1. VALIDATION MODULE (validators.py)
export function runValidationStage(
  rawLeads: RawLead[],
  addLog?: (log: Omit<PipelineLog, 'id' | 'timestamp'>) => void
): { validLeads: ValidatedLead[]; rejectedLeads: RejectedLead[] } {
  const validLeads: ValidatedLead[] = [];
  const rejectedLeads: RejectedLead[] = [];

  addLog?.({
    level: 'INFO',
    module: 'validators.py',
    message: `Reading raw leads... Found ${rawLeads.length} input records.`,
  });

  rawLeads.forEach((raw) => {
    const fieldErrors: Record<string, string> = {};
    const cleanMods: string[] = [];

    // Mandatory: lead_id, name
    if (!raw.lead_id || raw.lead_id.toString().trim() === '') {
      fieldErrors.lead_id = 'lead_id is mandatory and cannot be blank';
    }
    if (!raw.name || raw.name.toString().trim() === '') {
      fieldErrors.name = 'name is mandatory and cannot be blank';
    }

    // Email validation
    if (!raw.email || raw.email.toString().trim() === '') {
      fieldErrors.email = 'Missing email';
    } else if (!isValidEmail(raw.email)) {
      fieldErrors.email = 'Invalid email';
    }

    // Phone validation (10-digit Indian mobile)
    const cleanedPhone = cleanIndianPhone(raw.phone);
    if (!raw.phone || raw.phone.toString().trim() === '') {
      fieldErrors.phone = 'Missing phone';
    } else if (!cleanedPhone) {
      fieldErrors.phone = 'Invalid phone number (must be 10-digit mobile)';
    } else if (raw.phone.toString().includes('+91')) {
      cleanMods.push(`Removed +91 prefix: ${raw.phone} -> ${cleanedPhone}`);
    }

    // Source validation
    const trimmedSource = (raw.source || '').toString().trim();
    const matchedSource = ALLOWED_SOURCES.find(
      (s) => s.toLowerCase() === trimmedSource.toLowerCase()
    );
    if (!matchedSource) {
      fieldErrors.source = `Unknown source '${trimmedSource}'`;
    }

    // Region validation
    const trimmedRegion = (raw.region || '').toString().trim();
    const matchedRegion = ALLOWED_REGIONS.find(
      (r) => r.toLowerCase() === trimmedRegion.toLowerCase()
    );
    if (!matchedRegion) {
      fieldErrors.region = `Invalid region '${trimmedRegion}' (must be North, South, East, West)`;
    }

    // Created date validation
    let validCreatedDate = (raw.created_date || '').toString().trim();
    if (!validCreatedDate) {
      fieldErrors.created_date = 'Missing created date';
    } else {
      const parsedDate = new Date(validCreatedDate);
      if (isNaN(parsedDate.getTime()) || validCreatedDate.includes('_') || !/^\d{4}-\d{2}-\d{2}$/.test(validCreatedDate)) {
        fieldErrors.created_date = 'Invalid created date';
      }
    }

    // Budget validation (non-negative)
    let parsedBudget = typeof raw.budget === 'number' ? raw.budget : parseFloat(raw.budget as string);
    if (isNaN(parsedBudget)) {
      parsedBudget = 0;
      cleanMods.push('Defaulted budget to 0');
    } else if (parsedBudget < 0) {
      fieldErrors.budget = 'Invalid budget (cannot be negative)';
    }

    // Company size validation (non-negative)
    let parsedCompSize = typeof raw.company_size === 'number' ? raw.company_size : parseInt(raw.company_size as string, 10);
    if (isNaN(parsedCompSize) || parsedCompSize < 0) {
      parsedCompSize = 10;
      cleanMods.push('Defaulted company size to 10');
    }

    // Status validation
    const trimmedStatus = (raw.status || '').toString().trim();
    const matchedStatus = ALLOWED_STATUSES.find(
      (st) => st.toLowerCase() === trimmedStatus.toLowerCase()
    ) || 'New';

    // Timeline validation
    const trimmedTimeline = (raw.timeline || '').toString().trim();
    const matchedTimeline = ALLOWED_TIMELINES.find(
      (t) => t.toLowerCase() === trimmedTimeline.toLowerCase()
    ) || '1-3 Months';

    // Engagement values
    const visits = Math.max(0, parseInt(raw.website_visits as any, 10) || 0);
    const emails = Math.max(0, parseInt(raw.emails_opened as any, 10) || 0);

    // If errors exist, reject
    if (Object.keys(fieldErrors).length > 0) {
      const primaryReason = Object.values(fieldErrors)[0];
      rejectedLeads.push({
        lead: raw,
        reject_reason: primaryReason,
        field_errors: fieldErrors,
        suggested_fix: `Correct the following field(s): ${Object.keys(fieldErrors).join(', ')}`,
      });

      addLog?.({
        level: 'WARNING',
        module: 'validators.py',
        message: `Rejected ${raw.lead_id || 'unknown'}: ${primaryReason}`,
      });
    } else {
      validLeads.push({
        lead_id: raw.lead_id.toString().trim(),
        name: raw.name.toString().trim(),
        company: (raw.company || '').toString().trim(),
        industry: (raw.industry || '').toString().trim(),
        email: raw.email.toString().trim().toLowerCase(),
        phone: cleanedPhone!,
        source: matchedSource!,
        region: matchedRegion!,
        created_date: validCreatedDate,
        status: matchedStatus,
        budget: parsedBudget,
        company_size: parsedCompSize,
        timeline: matchedTimeline,
        website_visits: visits,
        emails_opened: emails,
        clean_modifications: cleanMods,
      });
    }
  });

  addLog?.({
    level: 'SUCCESS',
    module: 'validators.py',
    message: `Validation complete: ${validLeads.length} valid rows, ${rejectedLeads.length} rejected records.`,
  });

  return { validLeads, rejectedLeads };
}

// 2. DEDUPLICATION MODULE (dedupe.py)
export function runDeduplicationStage(
  validLeads: ValidatedLead[],
  addLog?: (log: Omit<PipelineLog, 'id' | 'timestamp'>) => void
): { uniqueLeads: ValidatedLead[]; duplicateLeads: DuplicateLead[] } {
  // Sort by created_date ascending (earliest first)
  const sorted = [...validLeads].sort(
    (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
  );

  const seenEmails = new Map<string, ValidatedLead>();
  const uniqueLeads: ValidatedLead[] = [];
  const duplicateLeads: DuplicateLead[] = [];

  sorted.forEach((lead) => {
    const emailKey = lead.email.toLowerCase();
    if (seenEmails.has(emailKey)) {
      const original = seenEmails.get(emailKey)!;
      duplicateLeads.push({
        duplicate_lead: lead,
        original_lead_id: original.lead_id,
        original_created_date: original.created_date,
        duplicate_reason: `Duplicate email '${lead.email}' already registered under lead ${original.lead_id} (${original.created_date})`,
      });
    } else {
      seenEmails.set(emailKey, lead);
      uniqueLeads.push(lead);
    }
  });

  addLog?.({
    level: 'INFO',
    module: 'dedupe.py',
    message: `Deduplication complete: ${duplicateLeads.length} duplicates quarantined, ${uniqueLeads.length} unique leads retained.`,
  });

  return { uniqueLeads, duplicateLeads };
}

// 3. SCORING MODULE (scoring.py)
export function calculateLeadScore(lead: ValidatedLead): {
  score: number;
  grade: LeadGrade;
  breakdown: ScoreBreakdown;
} {
  // Factor 1: Source (max 25)
  let sourcePoints = 5;
  switch (lead.source) {
    case 'Referral':
      sourcePoints = 25;
      break;
    case 'Webinar':
      sourcePoints = 20;
      break;
    case 'Website':
    case 'Trade Show':
      sourcePoints = 15;
      break;
    case 'Social Media':
      sourcePoints = 8;
      break;
    case 'Cold Call':
      sourcePoints = 5;
      break;
  }

  // Factor 2: Budget INR (max 25)
  let budgetPoints = 5;
  if (lead.budget >= 1000000) {
    budgetPoints = 25; // 10L+
  } else if (lead.budget >= 500000) {
    budgetPoints = 20; // 5L+
  } else if (lead.budget >= 100000) {
    budgetPoints = 10; // 1L+
  } else {
    budgetPoints = 5; // below 1L
  }

  // Factor 3: Company size (max 15)
  let compPoints = 3;
  if (lead.company_size >= 200) {
    compPoints = 15;
  } else if (lead.company_size >= 50) {
    compPoints = 10;
  } else if (lead.company_size >= 11) {
    compPoints = 6;
  } else {
    compPoints = 3;
  }

  // Factor 4: Engagement (max 15) = min(15, website_visits * 2 + emails_opened)
  const engagementPoints = Math.min(15, lead.website_visits * 2 + lead.emails_opened);

  // Factor 5: Timeline (max 20)
  let timelinePoints = 2;
  switch (lead.timeline) {
    case '0-1 Months':
      timelinePoints = 20;
      break;
    case '1-3 Months':
      timelinePoints = 12;
      break;
    case '3-6 Months':
      timelinePoints = 6;
      break;
    case '6+ Months':
      timelinePoints = 2;
      break;
  }

  const totalScore = sourcePoints + budgetPoints + compPoints + engagementPoints + timelinePoints;

  // Grade: Hot = 70+, Warm = 40 to 69, Cold = below 40
  let grade: LeadGrade = 'Cold';
  if (totalScore >= 70) {
    grade = 'Hot';
  } else if (totalScore >= 40) {
    grade = 'Warm';
  } else {
    grade = 'Cold';
  }

  return {
    score: totalScore,
    grade,
    breakdown: {
      source_points: sourcePoints,
      budget_points: budgetPoints,
      company_size_points: compPoints,
      engagement_points: engagementPoints,
      timeline_points: timelinePoints,
      total_score: totalScore,
    },
  };
}

// 4. ASSIGNMENT & SLA MODULE (assignment.py & followup.py)
export function runAssignmentAndSLAModule(
  uniqueLeads: ValidatedLead[],
  referenceDateStr: string = '2026-11-02',
  addLog?: (log: Omit<PipelineLog, 'id' | 'timestamp'>) => void
): ProcessedLead[] {
  // Counters for round-robin assignment by region and seniority
  const roundRobinCounters: Record<string, number> = {
    'North_Senior': 0,
    'North_Junior': 0,
    'South_Senior': 0,
    'South_Junior': 0,
    'West_Senior': 0,
    'West_Junior': 0,
    'East_Senior': 0,
    'East_Junior': 0,
  };

  const referenceDate = new Date(referenceDateStr);
  let slaBreachCount = 0;

  const processed: ProcessedLead[] = uniqueLeads.map((lead) => {
    // 1. Scoring
    const { score, grade, breakdown } = calculateLeadScore(lead);

    // 2. Assignment
    let assignedOwner = 'N/A (closed)';
    let repSeniority: 'Senior' | 'Junior' | 'None' = 'None';

    const isOpen = ['New', 'Contacted', 'Qualified'].includes(lead.status);

    if (isOpen) {
      const isSeniorNeeded = grade === 'Hot';
      repSeniority = isSeniorNeeded ? 'Senior' : 'Junior';
      const key = `${lead.region}_${repSeniority}`;

      const eligibleReps = SALES_TEAM.filter(
        (r) => r.region === lead.region && r.seniority === repSeniority
      );

      if (eligibleReps.length > 0) {
        const currIdx = roundRobinCounters[key] % eligibleReps.length;
        assignedOwner = eligibleReps[currIdx].name;
        roundRobinCounters[key]++;
      } else {
        assignedOwner = 'Unassigned Pool';
      }
    }

    // 3. Followup SLA Calculation
    // SLA days: Hot 1 day, Warm 3 days, Cold 7 days
    let slaDays = 7;
    if (grade === 'Hot') slaDays = 1;
    else if (grade === 'Warm') slaDays = 3;

    const createdD = new Date(lead.created_date);
    const dueD = new Date(createdD.getTime() + slaDays * 24 * 60 * 60 * 1000);
    const dueDateStr = dueD.toISOString().slice(0, 10);

    // SLA breach applies strictly to leads with status 'New'
    let isSlaBreach = false;
    let daysOverdue = 0;

    if (lead.status === 'New') {
      const diffTime = referenceDate.getTime() - dueD.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        isSlaBreach = true;
        daysOverdue = diffDays;
        slaBreachCount++;
      }
    }

    return {
      ...lead,
      score,
      grade,
      score_breakdown: breakdown,
      assigned_to: assignedOwner,
      rep_seniority: repSeniority,
      followup_due_date: dueDateStr,
      sla_days: slaDays,
      is_sla_breach: isSlaBreach,
      days_overdue: daysOverdue,
    };
  });

  addLog?.({
    level: 'INFO',
    module: 'assignment.py',
    message: `Assignment complete: assigned ${processed.filter((p) => p.assigned_to !== 'N/A (closed)').length} open leads via regional round-robin.`,
  });

  addLog?.({
    level: 'SUCCESS',
    module: 'followup.py',
    message: `SLA checking evaluated at reference date ${referenceDateStr}: identified ${slaBreachCount} response SLA breaches.`,
  });

  return processed;
}

// 5. REPORTING & SUMMARY MODULE (reports.py)
export function runReportingStage(
  processedLeads: ProcessedLead[],
  rejectedLeads: RejectedLead[],
  duplicateLeads: DuplicateLead[],
  executionTimeMs: number
): {
  stats: PipelineStats;
  summaryByGrade: SummaryByGrade[];
  summaryBySource: SummaryBySource[];
  summaryByOwner: SummaryByOwner[];
} {
  const totalBudget = processedLeads.reduce((acc, l) => acc + l.budget, 0);
  const avgScore = processedLeads.reduce((acc, l) => acc + l.score, 0) / (processedLeads.length || 1);
  const slaBreaches = processedLeads.filter((l) => l.is_sla_breach).length;

  // Grade summaries matching Section 7.1
  const grades: LeadGrade[] = ['Hot', 'Warm', 'Cold'];
  const summaryByGrade: SummaryByGrade[] = grades.map((g) => {
    const matching = processedLeads.filter((l) => l.grade === g);
    const count = matching.length;
    const gAvgScore = count > 0 ? matching.reduce((acc, l) => acc + l.score, 0) / count : 0;
    const gTotalBudget = matching.reduce((acc, l) => acc + l.budget, 0);
    return {
      grade: g,
      leads_count: count,
      avg_score: Math.round(gAvgScore * 10) / 10,
      total_budget_inr: gTotalBudget,
    };
  });

  // Source summaries matching Section 7.2
  const sources: LeadSource[] = ['Referral', 'Webinar', 'Trade Show', 'Website', 'Social Media', 'Cold Call'];
  const summaryBySource: SummaryBySource[] = sources.map((s) => {
    const matching = processedLeads.filter((l) => l.source === s);
    const count = matching.length;
    const sAvgScore = count > 0 ? matching.reduce((acc, l) => acc + l.score, 0) / count : 0;
    const hotCount = matching.filter((l) => l.grade === 'Hot').length;
    const convertedCount = matching.filter((l) => l.status === 'Converted').length;
    return {
      source: s,
      leads_count: count,
      avg_score: Math.round(sAvgScore * 10) / 10,
      hot_leads: hotCount,
      converted: convertedCount,
    };
  });

  // Owner summaries
  const ownerMap = new Map<string, ProcessedLead[]>();
  processedLeads.forEach((l) => {
    if (l.assigned_to !== 'N/A (closed)') {
      if (!ownerMap.has(l.assigned_to)) {
        ownerMap.set(l.assigned_to, []);
      }
      ownerMap.get(l.assigned_to)!.push(l);
    }
  });

  const summaryByOwner: SummaryByOwner[] = Array.from(ownerMap.entries()).map(([owner, leads]) => {
    const rep = SALES_TEAM.find((r) => r.name === owner);
    const hotLeads = leads.filter((l) => l.grade === 'Hot').length;
    const ownerBreaches = leads.filter((l) => l.is_sla_breach).length;
    const budgetSum = leads.reduce((acc, l) => acc + l.budget, 0);

    return {
      owner,
      region: rep?.region || 'North',
      seniority: rep?.seniority || 'Junior',
      leads_count: leads.length,
      hot_leads: hotLeads,
      sla_breaches: ownerBreaches,
      total_budget_inr: budgetSum,
    };
  }).sort((a, b) => b.leads_count - a.leads_count);

  const stats: PipelineStats = {
    input_records: processedLeads.length + rejectedLeads.length + duplicateLeads.length,
    valid_records: processedLeads.length + duplicateLeads.length,
    rejected_records: rejectedLeads.length,
    duplicates_removed: duplicateLeads.length,
    processed_leads: processedLeads.length,
    sla_breaches: slaBreaches,
    total_pipeline_value_inr: totalBudget,
    avg_score: Math.round(avgScore * 10) / 10,
    execution_time_ms: executionTimeMs,
  };

  return {
    stats,
    summaryByGrade,
    summaryBySource,
    summaryByOwner,
  };
}

// Complete Pipeline Execution
export function executeCRMPipeline(
  rawLeads: RawLead[],
  referenceDate: string = '2026-11-02',
  onLog?: (log: PipelineLog) => void
): {
  stats: PipelineStats;
  processedLeads: ProcessedLead[];
  rejectedLeads: RejectedLead[];
  duplicateLeads: DuplicateLead[];
  summaryByGrade: SummaryByGrade[];
  summaryBySource: SummaryBySource[];
  summaryByOwner: SummaryByOwner[];
  logs: PipelineLog[];
} {
  const startTime = performance.now();
  const logs: PipelineLog[] = [];

  const addLog = (entry: Omit<PipelineLog, 'id' | 'timestamp'>) => {
    const fullLog: PipelineLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      ...entry,
    };
    logs.push(fullLog);
    onLog?.(fullLog);
  };

  // 1. Validate
  const { validLeads, rejectedLeads } = runValidationStage(rawLeads, addLog);

  // 2. Dedupe
  const { uniqueLeads, duplicateLeads } = runDeduplicationStage(validLeads, addLog);

  // 3. Score & Assign & SLA
  const processedLeads = runAssignmentAndSLAModule(uniqueLeads, referenceDate, addLog);

  // 4. Report
  const elapsed = Math.round(performance.now() - startTime);
  const { stats, summaryByGrade, summaryBySource, summaryByOwner } = runReportingStage(
    processedLeads,
    rejectedLeads,
    duplicateLeads,
    elapsed
  );

  addLog({
    level: 'SUCCESS',
    module: 'reports.py',
    message: `Pipeline finished in ${elapsed}ms: processed ${processedLeads.length} leads with ₹${(
      stats.total_pipeline_value_inr / 10000000
    ).toFixed(2)} Cr pipeline value.`,
  });

  return {
    stats,
    processedLeads,
    rejectedLeads,
    duplicateLeads,
    summaryByGrade,
    summaryBySource,
    summaryByOwner,
    logs,
  };
}
