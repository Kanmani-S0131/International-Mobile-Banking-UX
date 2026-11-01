import {
  APPROVED_AUTH_METHODS,
  APPROVED_CATEGORIES,
  APPROVED_COUNTRIES,
  APPROVED_FEATURES,
  COUNTRY_ALIASES,
} from '../data/constants';
import {
  BankRanking,
  CategorySummary,
  CleanedRecord,
  PipelineExecutionLog,
  PipelineStats,
  RawRecord,
  RejectedRecord,
  ScreenCategory,
  UXGrade,
  ValidatedRecord,
} from '../types/pipeline';

// 1. LOADER STAGE (loader.py)
export function runLoaderStage(
  rawInputs: RawRecord[],
  addLog?: (log: Omit<PipelineExecutionLog, 'id' | 'timestamp'>) => void
): { records: RawRecord[]; fileCount: number; errors: string[] } {
  const errors: string[] = [];
  const requiredColumns: (keyof RawRecord)[] = [
    'record_id',
    'bank_name',
    'country',
    'app_name',
    'screen_no',
    'screen_name',
    'screen_category',
    'features_present',
    'auth_method',
    'languages_supported',
    'accessibility_flag',
    'ux_rating',
  ];

  addLog?.({
    stage: 'Load',
    type: 'info',
    message: `Reading contributor files... Found ${rawInputs.length} total input rows across sources.`,
  });

  const sourceFiles = new Set<string>();
  const validLoaded: RawRecord[] = [];

  rawInputs.forEach((row, idx) => {
    if (row.source_file) {
      sourceFiles.add(row.source_file);
    }
    // Check if missing critical structure
    const missingKeys = requiredColumns.filter((col) => row[col] === undefined);
    if (missingKeys.length > 0) {
      errors.push(`Row ${idx + 1} (${row.record_id || 'unknown'}): missing columns [${missingKeys.join(', ')}]`);
    } else {
      validLoaded.push(row);
    }
  });

  addLog?.({
    stage: 'Load',
    type: 'success',
    message: `Loader complete: combined ${validLoaded.length} rows across ${Math.max(1, sourceFiles.size)} contributor files.`,
  });

  return {
    records: validLoaded,
    fileCount: Math.max(1, sourceFiles.size),
    errors,
  };
}

// 2. CLEANER STAGE (cleaner.py)
export function runCleanerStage(
  records: RawRecord[],
  addLog?: (log: Omit<PipelineExecutionLog, 'id' | 'timestamp'>) => void
): CleanedRecord[] {
  let cleanedCount = 0;
  let aliasFixes = 0;
  let ynFixes = 0;
  let dateFixes = 0;

  const cleanedRecords: CleanedRecord[] = records.map((rec) => {
    const modifications: string[] = [];

    // Trim text
    const trimmedBank = (rec.bank_name || '').toString().trim();
    const trimmedApp = (rec.app_name || '').toString().trim();
    const trimmedScreenName = (rec.screen_name || '').toString().trim();
    const trimmedCategory = (rec.screen_category || '').toString().trim();
    const rawCountry = (rec.country || '').toString().trim();

    // Standardise country alias (BR6)
    const countryKey = rawCountry.toLowerCase();
    let cleanedCountry = rawCountry;
    if (COUNTRY_ALIASES[countryKey]) {
      cleanedCountry = COUNTRY_ALIASES[countryKey];
      modifications.push(`Normalized country alias '${rawCountry}' -> '${cleanedCountry}'`);
      aliasFixes++;
    } else {
      // Find case-insensitive match in approved countries
      const foundMatch = APPROVED_COUNTRIES.find((c) => c.toLowerCase() === countryKey);
      if (foundMatch) {
        cleanedCountry = foundMatch;
      }
    }

    // Standardise accessibility yes/no (BR6)
    const rawAccess = (rec.accessibility_flag || '').toString().trim().toLowerCase();
    let cleanedAccess: 'Yes' | 'No' = 'No';
    if (['y', 'yes', 'true', '1'].includes(rawAccess)) {
      cleanedAccess = 'Yes';
      if (rec.accessibility_flag !== 'Yes') {
        modifications.push(`Standardised accessibility '${rec.accessibility_flag}' -> 'Yes'`);
        ynFixes++;
      }
    } else {
      cleanedAccess = 'No';
      if (rec.accessibility_flag !== 'No') {
        modifications.push(`Standardised accessibility '${rec.accessibility_flag}' -> 'No'`);
        ynFixes++;
      }
    }

    // Standardise features list
    const rawFeats = (rec.features_present || '').toString();
    const featuresList = rawFeats
      .split(/[;,|]/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // Standardise languages list
    const rawLangs = (rec.languages_supported || '').toString();
    const languagesList = rawLangs
      .split(/[;,|]/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Standardise date
    let rawDate = (rec.collected_date || '').toString().trim();
    if (rawDate.includes('/') || rawDate.includes('.')) {
      // Convert formats like 2026/09/15 or 18-09-2026 or 2026.09.22 to YYYY-MM-DD
      const sanitized = rawDate.replace(/\//g, '-').replace(/\./g, '-');
      const parts = sanitized.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          rawDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else if (parts[2].length === 4) {
          rawDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      modifications.push(`Standardised date format to '${rawDate}'`);
      dateFixes++;
    }

    // Parse numeric fields
    const parsedScreenNo = typeof rec.screen_no === 'number' ? rec.screen_no : parseInt(rec.screen_no, 10);
    const parsedUxRating = typeof rec.ux_rating === 'number' ? rec.ux_rating : parseFloat(rec.ux_rating);

    if (modifications.length > 0) {
      cleanedCount++;
    }

    return {
      ...rec,
      bank_name: trimmedBank,
      country: cleanedCountry,
      country_cleaned: cleanedCountry,
      app_name: trimmedApp,
      screen_no: isNaN(parsedScreenNo) ? (rec.screen_no as any) : parsedScreenNo,
      screen_name: trimmedScreenName,
      screen_category: trimmedCategory,
      features_present: featuresList.join('; '),
      features_list: featuresList,
      languages_supported: languagesList.join('; '),
      languages_list: languagesList,
      accessibility_flag: cleanedAccess,
      accessibility_flag_cleaned: cleanedAccess,
      ux_rating: isNaN(parsedUxRating) ? (rec.ux_rating as any) : parsedUxRating,
      collected_date: rawDate,
      clean_modifications: modifications,
    };
  });

  addLog?.({
    stage: 'Clean',
    type: 'success',
    message: `Cleaner complete: fixed ${cleanedCount} messy records (${aliasFixes} country aliases, ${ynFixes} Y/N flags, ${dateFixes} date formats).`,
  });

  return cleanedRecords;
}

// 3. VALIDATOR STAGE (validator.py)
export function runValidatorStage(
  cleaned: CleanedRecord[],
  cutoffDate: string = '2026-11-01',
  addLog?: (log: Omit<PipelineExecutionLog, 'id' | 'timestamp'>) => void
): { valid: CleanedRecord[]; rejected: RejectedRecord[] } {
  const valid: CleanedRecord[] = [];
  const rejected: RejectedRecord[] = [];
  const seenCompositeKeys = new Set<string>();

  cleaned.forEach((rec) => {
    // BR1: Mandatory fields must not be blank or unreadable
    if (!rec.bank_name || rec.bank_name.trim().length === 0) {
      rejected.push({
        record: rec,
        rule_id: 'BR1',
        rejection_reason: 'bank name is missing or invalid',
        rejected_at_stage: 'validate',
        suggested_fix: 'Provide a valid bank institution name from the approved list.',
      });
      return;
    }

    if (!rec.screen_category || rec.screen_category.trim().length === 0) {
      rejected.push({
        record: rec,
        rule_id: 'BR1',
        rejection_reason: 'screen category is missing or blank',
        rejected_at_stage: 'validate',
        suggested_fix: 'Assign one of the 13 approved screen categories.',
      });
      return;
    }

    // BR2: Country, category, authentication method and features must come from approved lists
    if (!APPROVED_COUNTRIES.includes(rec.country_cleaned)) {
      rejected.push({
        record: rec,
        rule_id: 'BR2',
        rejection_reason: 'unsupported country',
        rejected_at_stage: 'validate',
        suggested_fix: `Change country '${rec.country}' to an approved country (e.g., United States, Japan, Singapore).`,
      });
      return;
    }

    if (!APPROVED_CATEGORIES.includes(rec.screen_category as ScreenCategory)) {
      rejected.push({
        record: rec,
        rule_id: 'BR2',
        rejection_reason: 'invalid screen_category',
        rejected_at_stage: 'validate',
        suggested_fix: `Change category '${rec.screen_category}' to an approved banking category (e.g., Dashboard, Login, Cards).`,
      });
      return;
    }

    if (!APPROVED_AUTH_METHODS.includes(rec.auth_method)) {
      rejected.push({
        record: rec,
        rule_id: 'BR2',
        rejection_reason: 'invalid auth_method',
        rejected_at_stage: 'validate',
        suggested_fix: `Replace '${rec.auth_method}' with an approved method: Biometric, Password, Multi-Factor, PIN, Face ID.`,
      });
      return;
    }

    const invalidFeatures = rec.features_list.filter((f) => !APPROVED_FEATURES.includes(f));
    if (invalidFeatures.length > 0) {
      rejected.push({
        record: rec,
        rule_id: 'BR2',
        rejection_reason: 'unknown feature',
        rejected_at_stage: 'validate',
        suggested_fix: `Remove or correct unapproved feature '${invalidFeatures.join(', ')}'.`,
      });
      return;
    }

    // BR3: ux_rating between 1 and 5; screen_no a positive whole number
    if (typeof rec.ux_rating !== 'number' || isNaN(rec.ux_rating)) {
      rejected.push({
        record: rec,
        rule_id: 'BR3',
        rejection_reason: 'UX rating is missing or invalid',
        rejected_at_stage: 'validate',
        suggested_fix: 'Enter a valid numeric rating between 1.0 and 5.0.',
      });
      return;
    }

    if (rec.ux_rating < 1 || rec.ux_rating > 5) {
      rejected.push({
        record: rec,
        rule_id: 'BR3',
        rejection_reason: 'UX rating out of range 1-5',
        rejected_at_stage: 'validate',
        suggested_fix: `Scale the rating '${rec.ux_rating}' into the standard 1.0 - 5.0 UX rating scale.`,
      });
      return;
    }

    if (typeof rec.screen_no !== 'number' || isNaN(rec.screen_no) || rec.screen_no <= 0 || !Number.isInteger(rec.screen_no)) {
      rejected.push({
        record: rec,
        rule_id: 'BR3',
        rejection_reason: 'screen_no must be a positive whole number',
        rejected_at_stage: 'validate',
        suggested_fix: 'Provide a positive integer screen sequence index.',
      });
      return;
    }

    // BR4: collected_date cannot be in the future
    if (rec.collected_date) {
      const recDate = new Date(rec.collected_date);
      const limitDate = new Date(cutoffDate);
      if (!isNaN(recDate.getTime()) && recDate > limitDate) {
        rejected.push({
          record: rec,
          rule_id: 'BR4',
          rejection_reason: 'collected_date is in the future',
          rejected_at_stage: 'validate',
          suggested_fix: `Correct the timestamp '${rec.collected_date}' to a historical date on or before ${cutoffDate}.`,
        });
        return;
      }
    }

    // BR5: (bank, app, screen_no) must be unique; first kept
    const compositeKey = `${rec.bank_name.toLowerCase()}___${rec.app_name.toLowerCase()}___${rec.screen_no}`;
    if (seenCompositeKeys.has(compositeKey)) {
      rejected.push({
        record: rec,
        rule_id: 'BR5',
        rejection_reason: 'duplicate of an earlier record (bank, app, screen_no)',
        rejected_at_stage: 'validate',
        suggested_fix: `Assign a unique screen number or verify if screen ${rec.screen_no} was already ingested.`,
      });
      return;
    }
    seenCompositeKeys.add(compositeKey);

    // Passed all validations
    valid.push(rec);
  });

  addLog?.({
    stage: 'Validate',
    type: 'info',
    message: `Validation complete: ${valid.length} passed business rules, ${rejected.length} records rejected (${
      rejected.filter((r) => r.rule_id === 'BR5').length
    } duplicates + ${rejected.filter((r) => r.rule_id !== 'BR5').length} invalid rows).`,
  });

  return { valid, rejected };
}

// 4. SCORER STAGE (rules.py)
export function runScorerStage(
  validRecords: CleanedRecord[],
  addLog?: (log: Omit<PipelineExecutionLog, 'id' | 'timestamp'>) => void
): ValidatedRecord[] {
  // BR7 & BR8 calculations
  const scoredRecords: ValidatedRecord[] = validRecords.map((rec) => {
    // 1. Rating component: rating / 5 * 60 (max 60 pts)
    const ratingComponent = Math.round((rec.ux_rating / 5) * 60 * 10) / 10;

    // 2. Features component: max 20 pts (each approved feature gives 5 pts up to 20 pts)
    const featuresComponent = Math.min(20, rec.features_list.length * 5);

    // 3. Accessibility component: Yes = 10 pts, No = 0 pts
    const accessibilityComponent = rec.accessibility_flag_cleaned === 'Yes' ? 10 : 0;

    // 4. Languages component: >= 2 gives 10 pts, 1 gives 5 pts, 0 gives 0 pts
    const languagesComponent = rec.languages_list.length >= 2 ? 10 : rec.languages_list.length === 1 ? 5 : 0;

    const rawTotal = ratingComponent + featuresComponent + accessibilityComponent + languagesComponent;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawTotal * 10) / 10));

    // BR8 Grade calculation
    let grade: UXGrade = 'Poor';
    if (finalScore >= 85) {
      grade = 'Excellent';
    } else if (finalScore >= 70) {
      grade = 'Good';
    } else if (finalScore >= 55) {
      grade = 'Fair';
    } else {
      grade = 'Poor';
    }

    return {
      ...rec,
      ux_score: finalScore,
      ux_grade: grade,
      score_breakdown: {
        rating_component: ratingComponent,
        features_component: featuresComponent,
        accessibility_component: accessibilityComponent,
        languages_component: languagesComponent,
        total: finalScore,
      },
    };
  });

  const avgScore = scoredRecords.reduce((acc, r) => acc + r.ux_score, 0) / (scoredRecords.length || 1);
  const excellentCount = scoredRecords.filter((r) => r.ux_grade === 'Excellent').length;
  const goodCount = scoredRecords.filter((r) => r.ux_grade === 'Good').length;

  addLog?.({
    stage: 'Score',
    type: 'success',
    message: `Scoring complete: evaluated ${scoredRecords.length} screens. Avg Score: ${avgScore.toFixed(
      1
    )} | Excellent: ${excellentCount}, Good: ${goodCount}`,
  });

  return scoredRecords;
}

// 5. REPORTER STAGE (report.py)
export function runReporterStage(
  scoredRecords: ValidatedRecord[],
  rejectedRecords: RejectedRecord[],
  fileCount: number,
  executionTimeMs: number,
  addLog?: (log: Omit<PipelineExecutionLog, 'id' | 'timestamp'>) => void
): {
  stats: PipelineStats;
  bankRankings: BankRanking[];
  categorySummaries: CategorySummary[];
  rejectionBreakdown: Record<string, number>;
} {
  // Aggregate by bank
  const bankMap = new Map<
    string,
    {
      country: string;
      screens: ValidatedRecord[];
    }
  >();

  scoredRecords.forEach((r) => {
    if (!bankMap.has(r.bank_name)) {
      bankMap.set(r.bank_name, { country: r.country_cleaned, screens: [] });
    }
    bankMap.get(r.bank_name)!.screens.push(r);
  });

  // Calculate Bank Rankings matching Table 8.2 & Figure 5
  const bankRankings: BankRanking[] = Array.from(bankMap.entries())
    .map(([bankName, data]) => {
      const screensCount = data.screens.length;
      const totalRating = data.screens.reduce((acc, s) => acc + s.ux_rating, 0);
      const totalScore = data.screens.reduce((acc, s) => acc + s.ux_score, 0);
      const accessCount = data.screens.filter((s) => s.accessibility_flag_cleaned === 'Yes').length;
      const totalFeatures = data.screens.reduce((acc, s) => acc + s.features_list.length, 0);

      return {
        rank: 0,
        bank_name: bankName,
        country: data.country,
        screens_count: screensCount,
        avg_rating: Math.round((totalRating / (screensCount || 1)) * 100) / 100,
        avg_score: Math.round((totalScore / (screensCount || 1)) * 10) / 10,
        accessibility_pct: Math.round((accessCount / (screensCount || 1)) * 10000) / 100,
        avg_features: Math.round((totalFeatures / (screensCount || 1)) * 100) / 100,
      };
    })
    .sort((a, b) => b.avg_score - a.avg_score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Aggregate by Screen Category matching Figure 6 (Login highest, Dashboard lowest)
  const categoryMap = new Map<
    ScreenCategory,
    {
      count: number;
      totalScore: number;
      totalRating: number;
      bankScores: Map<string, number[]>;
    }
  >();

  APPROVED_CATEGORIES.forEach((cat) => {
    categoryMap.set(cat, { count: 0, totalScore: 0, totalRating: 0, bankScores: new Map() });
  });

  scoredRecords.forEach((r) => {
    const entry = categoryMap.get(r.screen_category as ScreenCategory);
    if (entry) {
      entry.count += 1;
      entry.totalScore += r.ux_score;
      entry.totalRating += r.ux_rating;
      if (!entry.bankScores.has(r.bank_name)) {
        entry.bankScores.set(r.bank_name, []);
      }
      entry.bankScores.get(r.bank_name)!.push(r.ux_score);
    }
  });

  const categorySummaries: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([cat, data]) => {
      let topBank = 'N/A';
      let highestBankAvg = -1;
      data.bankScores.forEach((scores, bank) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg > highestBankAvg) {
          highestBankAvg = avg;
          topBank = bank;
        }
      });

      return {
        category: cat,
        screens_count: data.count,
        avg_score: data.count > 0 ? Math.round((data.totalScore / data.count) * 10) / 10 : 0,
        avg_rating: data.count > 0 ? Math.round((data.totalRating / data.count) * 100) / 100 : 0,
        top_bank: topBank,
      };
    })
    .sort((a, b) => b.avg_score - a.avg_score);

  // Rejection Breakdown (Section 8.1)
  const rejectionBreakdown: Record<string, number> = {};
  rejectedRecords.forEach((r) => {
    rejectionBreakdown[r.rejection_reason] = (rejectionBreakdown[r.rejection_reason] || 0) + 1;
  });

  const avgUxScore =
    scoredRecords.reduce((acc, r) => acc + r.ux_score, 0) / (scoredRecords.length || 1);
  const avgUxRating =
    scoredRecords.reduce((acc, r) => acc + r.ux_rating, 0) / (scoredRecords.length || 1);

  const stats: PipelineStats = {
    files_read: fileCount,
    records_loaded: scoredRecords.length + rejectedRecords.length,
    records_cleaned: scoredRecords.length + rejectedRecords.length,
    records_valid: scoredRecords.length,
    records_rejected: rejectedRecords.length,
    banks_covered: bankRankings.length,
    avg_ux_score: Math.round(avgUxScore * 10) / 10,
    avg_ux_rating: Math.round(avgUxRating * 100) / 100,
    execution_time_ms: executionTimeMs,
  };

  addLog?.({
    stage: 'Report',
    type: 'success',
    message: `Report generated: ${bankRankings.length} banks ranked, ${categorySummaries.length} categories analyzed, outputs synchronized.`,
  });

  return {
    stats,
    bankRankings,
    categorySummaries,
    rejectionBreakdown,
  };
}

// Complete Full Pipeline Runner
export function executeFullPipeline(
  rawRecords: RawRecord[],
  onLog?: (log: PipelineExecutionLog) => void
): {
  stats: PipelineStats;
  validRecords: ValidatedRecord[];
  rejectedRecords: RejectedRecord[];
  bankRankings: BankRanking[];
  categorySummaries: CategorySummary[];
  rejectionBreakdown: Record<string, number>;
  logs: PipelineExecutionLog[];
} {
  const startTime = performance.now();
  const logs: PipelineExecutionLog[] = [];

  const addLog = (entry: Omit<PipelineExecutionLog, 'id' | 'timestamp'>) => {
    const fullLog: PipelineExecutionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...entry,
    };
    logs.push(fullLog);
    onLog?.(fullLog);
  };

  // Stage 1: Load
  const { records: loadedRecords, fileCount } = runLoaderStage(rawRecords, addLog);

  // Stage 2: Clean
  const cleanedRecords = runCleanerStage(loadedRecords, addLog);

  // Stage 3: Validate
  const { valid, rejected } = runValidatorStage(cleanedRecords, '2026-11-01', addLog);

  // Stage 4: Score
  const scoredRecords = runScorerStage(valid, addLog);

  // Stage 5: Report
  const elapsed = Math.round(performance.now() - startTime);
  const { stats, bankRankings, categorySummaries, rejectionBreakdown } = runReporterStage(
    scoredRecords,
    rejected,
    fileCount,
    elapsed,
    addLog
  );

  return {
    stats,
    validRecords: scoredRecords,
    rejectedRecords: rejected,
    bankRankings,
    categorySummaries,
    rejectionBreakdown,
    logs,
  };
}

// Quick Single Record Live Tester
export function testSingleRecord(record: RawRecord): {
  is_valid: boolean;
  cleaned: CleanedRecord;
  rejection?: RejectedRecord;
  scored?: ValidatedRecord;
} {
  const [cleaned] = runCleanerStage([record]);
  const { valid, rejected } = runValidatorStage([cleaned], '2026-11-01');

  if (rejected.length > 0) {
    return {
      is_valid: false,
      cleaned,
      rejection: rejected[0],
    };
  }

  const [scored] = runScorerStage(valid);
  return {
    is_valid: true,
    cleaned,
    scored,
  };
}
