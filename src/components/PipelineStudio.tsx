import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Upload,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Terminal,
  IndianRupee,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { PipelineLog, PipelineStats, RawLead } from '../types/crm';
import { calculateLeadScore, cleanIndianPhone, runValidationStage } from '../engine/crmPipelineEngine';

interface PipelineStudioProps {
  stats: PipelineStats;
  logs: PipelineLog[];
  onRunPipeline: () => void;
  isRunning: boolean;
  onResetBenchmark: () => void;
  onCustomFileUpload: (leads: RawLead[]) => void;
  referenceDate: string;
  setReferenceDate: (val: string) => void;
  activeStageIdx: number;
}

export const PipelineStudio: React.FC<PipelineStudioProps> = ({
  stats,
  logs,
  onRunPipeline,
  isRunning,
  onResetBenchmark,
  onCustomFileUpload,
  referenceDate,
  setReferenceDate,
  activeStageIdx,
}) => {
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxLead, setSandboxLead] = useState<Partial<RawLead>>({
    name: 'Suresh Raina',
    company: 'Raina Infotech',
    industry: 'Information Technology',
    email: 'suresh@rainainfotech.in',
    phone: '+91 98765 43210',
    source: 'Referral',
    region: 'North',
    created_date: '2026-10-15',
    status: 'New',
    budget: 1500000,
    company_size: 250,
    timeline: '0-1 Months',
    website_visits: 6,
    emails_opened: 4,
  });

  const [sandboxResult, setSandboxResult] = useState<any>(null);

  const stages = [
    {
      num: 1,
      name: 'Read & Ingest',
      module: 'main.py',
      desc: 'Ingests raw leads buffer from leads_raw.csv with 14 mandatory & optional schema attributes.',
      metric: `${stats.input_records} Records`,
      sub: 'Input File Buffer',
    },
    {
      num: 2,
      name: 'Validate & Clean',
      module: 'validators.py',
      desc: 'Validates email, normalizes Indian phone (+91 strip), bounds check budget, isolates 12 corrupted rows.',
      metric: `${stats.valid_records} Valid Rows`,
      sub: `${stats.rejected_records} Rejected`,
    },
    {
      num: 3,
      name: 'Deduplicate',
      module: 'dedupe.py',
      desc: 'Groups by email, keeps earliest created_date record, isolates 6 duplicates to duplicate_leads.csv.',
      metric: `${stats.processed_leads} Unique Leads`,
      sub: `${stats.duplicates_removed} Duplicates`,
    },
    {
      num: 4,
      name: 'Score & Grade',
      module: 'scoring.py',
      desc: 'Evaluates 5 scoring factors (Source 25, Budget 25, Size 15, Engagement 15, Timeline 20). Tiers: Hot, Warm, Cold.',
      metric: `${stats.avg_score.toFixed(1)} / 100`,
      sub: 'Avg Lead Score',
    },
    {
      num: 5,
      name: 'Regional Assignment',
      module: 'assignment.py',
      desc: 'Assigns open leads to sales team by region (North/South/East/West) via round-robin. Hot leads to Senior reps.',
      metric: 'Round-Robin',
      sub: 'Senior/Junior Rules',
    },
    {
      num: 6,
      name: 'SLA Tracking',
      module: 'followup.py',
      desc: 'Calculates response due dates (Hot: 1d, Warm: 3d, Cold: 7d). Evaluates delays against reference date.',
      metric: `${stats.sla_breaches} Breaches`,
      sub: `Checked @ ${referenceDate}`,
    },
  ];

  const handleTestSandboxLead = () => {
    const raw: RawLead = {
      lead_id: 'SANDBOX_' + Math.floor(Math.random() * 1000),
      name: sandboxLead.name || 'Sample Lead',
      company: sandboxLead.company || 'Sample Co',
      industry: sandboxLead.industry || 'Tech',
      email: sandboxLead.email || '',
      phone: sandboxLead.phone || '',
      source: sandboxLead.source || 'Referral',
      region: sandboxLead.region || 'North',
      created_date: sandboxLead.created_date || '2026-10-15',
      status: sandboxLead.status || 'New',
      budget: sandboxLead.budget || 0,
      company_size: sandboxLead.company_size || 10,
      timeline: sandboxLead.timeline || '1-3 Months',
      website_visits: sandboxLead.website_visits || 0,
      emails_opened: sandboxLead.emails_opened || 0,
    };

    const { validLeads, rejectedLeads } = runValidationStage([raw]);
    if (rejectedLeads.length > 0) {
      setSandboxResult({ is_valid: false, error: rejectedLeads[0].reject_reason });
    } else {
      const valid = validLeads[0];
      const scoring = calculateLeadScore(valid);

      // SLA
      let slaDays = 7;
      if (scoring.grade === 'Hot') slaDays = 1;
      else if (scoring.grade === 'Warm') slaDays = 3;

      const createdD = new Date(valid.created_date);
      const dueD = new Date(createdD.getTime() + slaDays * 24 * 60 * 60 * 1000);
      const refD = new Date(referenceDate);
      const isBreach = valid.status === 'New' && dueD.getTime() < refD.getTime();
      const overdue = isBreach ? Math.floor((refD.getTime() - dueD.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      setSandboxResult({
        is_valid: true,
        valid,
        score: scoring.score,
        grade: scoring.grade,
        breakdown: scoring.breakdown,
        slaDays,
        dueDate: dueD.toISOString().slice(0, 10),
        isBreach,
        overdue,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
          const customRows: RawLead[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            const obj: any = {};
            headers.forEach((h, idx) => {
              obj[h] = cols[idx] !== undefined ? cols[idx] : '';
            });
            customRows.push({
              lead_id: obj.lead_id || `CUST_${i}`,
              name: obj.name || 'Unnamed',
              company: obj.company || 'Unknown Co',
              industry: obj.industry || 'General',
              email: obj.email || '',
              phone: obj.phone || '',
              source: obj.source || 'Website',
              region: obj.region || 'North',
              created_date: obj.created_date || '2026-10-01',
              status: obj.status || 'New',
              budget: obj.budget || 0,
              company_size: obj.company_size || 10,
              timeline: obj.timeline || '1-3 Months',
              website_visits: obj.website_visits || 0,
              emails_opened: obj.emails_opened || 0,
            });
          }
          if (customRows.length > 0) {
            onCustomFileUpload(customRows);
          }
        }
      } catch (err) {
        console.error('File parse error', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Top Hero & Control Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
              <span>Project ID: DIT-P06</span>
              <span aria-hidden="true">·</span>
              <span>DefineInfoTech Pvt. Ltd. (Team T06)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              CRM Lead Management & Intelligent SLA Dispatch Engine
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Automates the complete inbound lead pipeline: cleans incoming data, eliminates duplicates,
              scores leads 0–100 (Hot/Warm/Cold), assigns sales reps by region & seniority, and flags SLA breaches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Reference Date Config */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500">Ref Date:</span>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="bg-transparent font-mono text-slate-900 dark:text-white focus:outline-hidden text-xs"
              />
            </div>

            <button
              onClick={onResetBenchmark}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 126 Benchmark</span>
            </button>

            <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setSandboxOpen(!sandboxOpen)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lead Sandbox</span>
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
                  <span>Executing Pipeline...</span>
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

        {/* Live Metrics Row (Section 7 Results) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500">Input Records</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {stats.input_records}
            </div>
            <div className="text-[11px] text-slate-400">leads_raw.csv</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Valid Records</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {stats.valid_records}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Passed checks</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Rejected Leads</div>
            <div className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
              {stats.rejected_records}
            </div>
            <div className="text-[11px] text-slate-400">Quarantined</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Duplicates Removed</div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
              {stats.duplicates_removed}
            </div>
            <div className="text-[11px] text-slate-400">Same email kept 1st</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Processed (Unique)</div>
            <div className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
              {stats.processed_leads}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Scored & Assigned</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">SLA Breaches</div>
            <div className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
              {stats.sla_breaches}
            </div>
            <div className="text-[11px] text-rose-500">All status 'New'</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Pipeline Budget</div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{(stats.total_pipeline_value_inr / 10000000).toFixed(2)} Cr
            </div>
            <div className="text-[11px] text-slate-400">INR Pipeline</div>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox Drawer */}
      {sandboxOpen && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Single Lead Sandbox (Test Validation, Scoring & SLA Rules)
              </h3>
            </div>
            <button
              onClick={() => setSandboxOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Contact Name</label>
              <input
                type="text"
                value={sandboxLead.name || ''}
                onChange={(e) => setSandboxLead({ ...sandboxLead, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Company</label>
              <input
                type="text"
                value={sandboxLead.company || ''}
                onChange={(e) => setSandboxLead({ ...sandboxLead, company: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={sandboxLead.email || ''}
                onChange={(e) => setSandboxLead({ ...sandboxLead, email: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Phone (+91 supported)</label>
              <input
                type="text"
                value={sandboxLead.phone || ''}
                onChange={(e) => setSandboxLead({ ...sandboxLead, phone: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Source</label>
              <select
                value={sandboxLead.source || 'Referral'}
                onChange={(e) => setSandboxLead({ ...sandboxLead, source: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Referral">Referral (25 pts)</option>
                <option value="Webinar">Webinar (20 pts)</option>
                <option value="Website">Website (15 pts)</option>
                <option value="Trade Show">Trade Show (15 pts)</option>
                <option value="Social Media">Social Media (8 pts)</option>
                <option value="Cold Call">Cold Call (5 pts)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Region</label>
              <select
                value={sandboxLead.region || 'North'}
                onChange={(e) => setSandboxLead({ ...sandboxLead, region: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="North">North (Arjun Rao / Meena / Karan)</option>
                <option value="South">South (Priya Nair / Rajesh / Deepa)</option>
                <option value="West">West (Rohan Mehta / Neha / Vikram)</option>
                <option value="East">East (Ananya Sen / Amit / Sayan)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Budget in INR (₹)</label>
              <input
                type="number"
                value={sandboxLead.budget}
                onChange={(e) => setSandboxLead({ ...sandboxLead, budget: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Timeline</label>
              <select
                value={sandboxLead.timeline || '0-1 Months'}
                onChange={(e) => setSandboxLead({ ...sandboxLead, timeline: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="0-1 Months">0-1 Months (20 pts)</option>
                <option value="1-3 Months">1-3 Months (12 pts)</option>
                <option value="3-6 Months">3-6 Months (6 pts)</option>
                <option value="6+ Months">6+ Months (2 pts)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTestSandboxLead}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Validate & Score Lead
            </button>
            <span className="text-xs text-slate-500">
              Evaluates rules in validators.py, scoring.py, and followup.py against reference date {referenceDate}.
            </span>
          </div>

          {sandboxResult && (
            <div
              className={`p-4 rounded-lg text-xs border ${
                sandboxResult.is_valid
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
              }`}
            >
              {!sandboxResult.is_valid ? (
                <div className="text-rose-700 dark:text-rose-300 font-medium">
                  Validation Failed: {sandboxResult.error}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-800 dark:text-emerald-300">
                      Lead Validated & Scored: {sandboxResult.score} / 100 ({sandboxResult.grade} Lead)
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      SLA: {sandboxResult.slaDays} day(s) | Due: {sandboxResult.dueDate}{' '}
                      {sandboxResult.isBreach ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          (BREACH: {sandboxResult.overdue}d overdue)
                        </span>
                      ) : (
                        <span className="text-emerald-600">On Track</span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-slate-600 dark:text-slate-300 pt-1">
                    <div>Source: <strong className="font-mono">{sandboxResult.breakdown.source_points}/25</strong></div>
                    <div>Budget: <strong className="font-mono">{sandboxResult.breakdown.budget_points}/25</strong></div>
                    <div>Comp Size: <strong className="font-mono">{sandboxResult.breakdown.company_size_points}/15</strong></div>
                    <div>Engagement: <strong className="font-mono">{sandboxResult.breakdown.engagement_points}/15</strong></div>
                    <div>Timeline: <strong className="font-mono">{sandboxResult.breakdown.timeline_points}/20</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6-Stage Workflow Architecture Grid (Figure 1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              6-Stage Lead Processing Workflow (Figure 1: Project Workflow)
            </h2>
            <p className="text-xs text-slate-500">
              Modular Python pipeline running sequentially from raw ingestion to management reports.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            DIT-P06 Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
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
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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

      {/* Terminal Logging Window (logs/pipeline.log) */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              Pipeline Execution Terminal (logs/pipeline.log)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>{logs.length} events logged</span>
            <span aria-hidden="true">·</span>
            <span>Ref: {referenceDate}</span>
          </div>
        </div>

        <div className="p-4 font-mono text-xs space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
          {logs.length === 0 ? (
            <div className="text-slate-500">Pipeline ready. Click 'Execute Full Pipeline' to begin.</div>
          ) : (
            logs.map((log) => {
              const colorClass =
                log.level === 'SUCCESS'
                  ? 'text-emerald-400'
                  : log.level === 'ERROR'
                  ? 'text-rose-400'
                  : log.level === 'WARNING'
                  ? 'text-amber-400'
                  : 'text-slate-300';

              return (
                <div key={log.id} className="flex items-start gap-3 leading-relaxed">
                  <span className="text-slate-500 tabular-nums shrink-0">{log.timestamp}</span>
                  <span className="text-blue-400 font-semibold shrink-0">[{log.module}]</span>
                  <span className="text-slate-500 shrink-0">[{log.level}]</span>
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
