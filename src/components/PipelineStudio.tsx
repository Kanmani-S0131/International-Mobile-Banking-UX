import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Terminal,
  FileCheck,
  ArrowRight,
  Filter,
  PlusCircle,
} from 'lucide-react';
import { PipelineExecutionLog, PipelineStats, RawRecord } from '../types/pipeline';
import { testSingleRecord } from '../engine/pipelineEngine';

interface PipelineStudioProps {
  stats: PipelineStats;
  logs: PipelineExecutionLog[];
  onRunPipeline: () => void;
  isRunning: boolean;
  onResetBenchmark: () => void;
  onCustomFileUpload: (records: RawRecord[]) => void;
  activeStageIdx: number;
}

export const PipelineStudio: React.FC<PipelineStudioProps> = ({
  stats,
  logs,
  onRunPipeline,
  isRunning,
  onResetBenchmark,
  onCustomFileUpload,
  activeStageIdx,
}) => {
  const [testerOpen, setTesterOpen] = useState(false);
  const [testPayload, setTestPayload] = useState<Partial<RawRecord>>({
    bank_name: 'Lion City Bank',
    country: 'USA',
    app_name: 'LionPay',
    screen_no: 99,
    screen_name: 'Custom Instant Pay Hub',
    screen_category: 'Payments',
    features_present: 'Biometrics; Instant Pay; QR Pay',
    auth_method: 'Biometric',
    languages_supported: 'English; Mandarin',
    accessibility_flag: 'y',
    ux_rating: 4.8,
    collected_by: 'Kanmani S.',
    collected_date: '2026-09-25',
  });
  const [testResult, setTestResult] = useState<any>(null);

  const stages = [
    {
      num: 1,
      name: 'Load',
      module: 'loader.py',
      desc: 'Reads contributor CSV/Excel files, verifies 14 required columns, and merges multi-source rows into a single ingested buffer.',
      metric: `${stats.files_read} Files Read`,
      sub: `${stats.records_loaded} Raw Records`,
    },
    {
      num: 2,
      name: 'Clean',
      module: 'cleaner.py',
      desc: 'Trims text, normalizes country aliases (USA -> United States), standardizes Y/N flags, cleans delimited lists, and canonicalizes date formats.',
      metric: `${stats.records_cleaned} Rows Cleaned`,
      sub: '12 Fixable Repaired',
    },
    {
      num: 3,
      name: 'Validate',
      module: 'validator.py',
      desc: 'Applies business rules BR1 to BR5. Isolates valid screens from rejected records with explicit reason diagnostics and duplicate detection.',
      metric: `${stats.records_valid} Valid Screens`,
      sub: `${stats.records_rejected} Rejected Rows`,
    },
    {
      num: 4,
      name: 'Score',
      module: 'rules.py',
      desc: 'Evaluates BR7 UX scoring formula (Rating 60 + Features 20 + Accessibility 10 + Languages 10) and assigns BR8 Quality Grade tiers.',
      metric: `${stats.avg_ux_score.toFixed(1)} / 100`,
      sub: 'Avg UX Score',
    },
    {
      num: 5,
      name: 'Report',
      module: 'report.py',
      desc: 'Builds comparative bank rankings, screen category performance curves, Excel workbook outputs, and executive documentation.',
      metric: `${stats.banks_covered} Banks Ranked`,
      sub: '13 Categories Sync',
    },
  ];

  const handleRunTester = () => {
    const fullRec: RawRecord = {
      record_id: 'TEST_LIVE_' + Math.floor(Math.random() * 1000),
      bank_name: testPayload.bank_name || '',
      country: testPayload.country || '',
      app_name: testPayload.app_name || '',
      screen_no: Number(testPayload.screen_no) || 1,
      screen_name: testPayload.screen_name || 'Test Screen',
      screen_category: testPayload.screen_category || 'Login',
      features_present: testPayload.features_present || '',
      auth_method: testPayload.auth_method || 'Password',
      languages_supported: testPayload.languages_supported || 'English',
      accessibility_flag: testPayload.accessibility_flag || 'No',
      ux_rating: testPayload.ux_rating !== undefined ? testPayload.ux_rating : 3,
      collected_by: testPayload.collected_by || 'Tester',
      collected_date: testPayload.collected_date || '2026-09-20',
      source_file: 'sandbox_test.csv',
    };
    const res = testSingleRecord(fullRec);
    setTestResult(res);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Simple CSV or JSON parsing
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            onCustomFileUpload(parsed);
          }
        } else {
          // Parse CSV
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
            const customRows: RawRecord[] = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
              const obj: any = {};
              headers.forEach((h, idx) => {
                obj[h] = cols[idx] !== undefined ? cols[idx] : '';
              });
              customRows.push({
                record_id: obj.record_id || `CUSTOM_${i}`,
                bank_name: obj.bank_name || '',
                country: obj.country || '',
                app_name: obj.app_name || '',
                screen_no: obj.screen_no || i,
                screen_name: obj.screen_name || `Screen ${i}`,
                screen_category: obj.screen_category || 'Login',
                features_present: obj.features_present || '',
                auth_method: obj.auth_method || 'Password',
                languages_supported: obj.languages_supported || 'English',
                accessibility_flag: obj.accessibility_flag || 'No',
                ux_rating: obj.ux_rating || 3.0,
                collected_by: obj.collected_by || 'Custom Contributor',
                collected_date: obj.collected_date || '2026-09-15',
                source_file: file.name,
              });
            }
            if (customRows.length > 0) {
              onCustomFileUpload(customRows);
            }
          }
        }
      } catch (err) {
        console.error('File parsing error', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Top Hero / Control Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
              <span>Automated Banking UX Pipeline</span>
              <span aria-hidden="true">·</span>
              <span>DefineInfoTech</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Automated Mobile Banking UX Ingestion & Scoring Engine
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Converts inconsistent contributor spreadsheets from 12 countries into a clean, analysis-ready
              dataset with validated business rules, composite UX scores, and anomaly separation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onResetBenchmark}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load 194-Record Benchmark</span>
            </button>

            <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Contributor File</span>
              <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setTesterOpen(!testerOpen)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Single Record Sandbox</span>
            </button>

            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-lg shadow-sm transition-all ${
                isRunning
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running Stages...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Full Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Files Ingested</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {stats.files_read}
            </div>
            <div className="text-[11px] text-slate-500">2 CSV, 1 Excel</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Loaded</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {stats.records_loaded}
            </div>
            <div className="text-[11px] text-slate-500">100% Ingested</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Valid Screens</div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.records_valid}
            </div>
            <div className="text-[11px] text-slate-500">Passed BR1-BR5</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Rejected Rows</div>
            <div className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
              {stats.records_rejected}
            </div>
            <div className="text-[11px] text-slate-500">8 Invalid + 2 Dupes</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Mean UX Score</div>
            <div className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
              {stats.avg_ux_score.toFixed(1)}
            </div>
            <div className="text-[11px] text-slate-500">Scale 0 - 100</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Execution Speed</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {stats.execution_time_ms} ms
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Instant Pipeline</div>
          </div>
        </div>
      </div>

      {/* Interactive Single Record Sandbox Drawer */}
      {testerOpen && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Single Record Sandbox (Test Cleaner & Business Rules)
              </h3>
            </div>
            <button
              onClick={() => setTesterOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Bank Name</label>
              <input
                type="text"
                value={testPayload.bank_name || ''}
                onChange={(e) => setTestPayload({ ...testPayload, bank_name: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Country (or Alias e.g. USA, UK)</label>
              <input
                type="text"
                value={testPayload.country || ''}
                onChange={(e) => setTestPayload({ ...testPayload, country: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={testPayload.screen_category || ''}
                onChange={(e) => setTestPayload({ ...testPayload, screen_category: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">UX Rating (1.0 - 5.0)</label>
              <input
                type="number"
                step="0.1"
                value={testPayload.ux_rating !== undefined ? testPayload.ux_rating : ''}
                onChange={(e) => setTestPayload({ ...testPayload, ux_rating: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Accessibility Flag (y / n / Yes)</label>
              <input
                type="text"
                value={testPayload.accessibility_flag || ''}
                onChange={(e) => setTestPayload({ ...testPayload, accessibility_flag: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Features Present (; separated)</label>
              <input
                type="text"
                value={testPayload.features_present || ''}
                onChange={(e) => setTestPayload({ ...testPayload, features_present: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Auth Method</label>
              <input
                type="text"
                value={testPayload.auth_method || ''}
                onChange={(e) => setTestPayload({ ...testPayload, auth_method: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Date Collected (YYYY-MM-DD)</label>
              <input
                type="text"
                value={testPayload.collected_date || ''}
                onChange={(e) => setTestPayload({ ...testPayload, collected_date: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRunTester}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Validate & Compute Score
            </button>
            <span className="text-xs text-slate-500">
              Evaluates BR1-BR6 standardizations and BR7-BR8 scoring.
            </span>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg text-xs border ${
                testResult.is_valid
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center justify-between font-semibold mb-2">
                <span className={testResult.is_valid ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}>
                  {testResult.is_valid ? 'Screen Passed All Business Rules!' : `Validation Failed: ${testResult.rejection?.rule_id}`}
                </span>
                {testResult.is_valid && (
                  <span className="font-mono text-emerald-900 dark:text-emerald-200">
                    UX Score: {testResult.scored?.ux_score} / 100 ({testResult.scored?.ux_grade})
                  </span>
                )}
              </div>

              {!testResult.is_valid ? (
                <div className="text-rose-700 dark:text-rose-300 space-y-1">
                  <div><strong>Reason:</strong> {testResult.rejection?.rejection_reason}</div>
                  <div><strong>Suggested Fix:</strong> {testResult.rejection?.suggested_fix}</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300 pt-1">
                  <div>Rating Component: <strong className="font-mono">{testResult.scored?.score_breakdown.rating_component}/60</strong></div>
                  <div>Features Component: <strong className="font-mono">{testResult.scored?.score_breakdown.features_component}/20</strong></div>
                  <div>Accessibility: <strong className="font-mono">{testResult.scored?.score_breakdown.accessibility_component}/10</strong></div>
                  <div>Languages: <strong className="font-mono">{testResult.scored?.score_breakdown.languages_component}/10</strong></div>
                  {testResult.cleaned.clean_modifications.length > 0 && (
                    <div className="col-span-full pt-1 text-slate-600 dark:text-slate-400">
                      <strong>Auto-fixed by Cleaner:</strong> {testResult.cleaned.clean_modifications.join('; ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5-Stage Architecture Pipeline Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            5-Stage Automated Ingestion Architecture
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Modular Python Architecture (VS Code / Pytest / Pandas)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stg, idx) => {
            const isActive = isRunning && activeStageIdx === idx;
            const isCompleted = !isRunning || activeStageIdx > idx;

            return (
              <div
                key={stg.num}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    STAGE 0{stg.num}
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {stg.module}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {stg.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-3 mb-3">
                  {stg.desc}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {stg.metric}
                    </div>
                    <div className="text-[10px] text-slate-500">{stg.sub}</div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Terminal Logs Stream */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              Pipeline Execution Terminal (main.py / logging output)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>{logs.length} events logged</span>
            <span aria-hidden="true">·</span>
            <span>UTF-8</span>
          </div>
        </div>

        <div className="p-4 font-mono text-xs space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
          {logs.length === 0 ? (
            <div className="text-slate-500">Pipeline ready. Click 'Execute Full Pipeline' to initiate.</div>
          ) : (
            logs.map((log) => {
              const colorClass =
                log.type === 'success'
                  ? 'text-emerald-400'
                  : log.type === 'error'
                  ? 'text-rose-400'
                  : log.type === 'warning'
                  ? 'text-amber-400'
                  : 'text-slate-300';

              return (
                <div key={log.id} className="flex items-start gap-3 leading-relaxed">
                  <span className="text-slate-500 tabular-nums shrink-0">{log.timestamp}</span>
                  <span className="text-blue-400 font-semibold shrink-0">[{log.stage}]</span>
                  <span className={colorClass}>{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
