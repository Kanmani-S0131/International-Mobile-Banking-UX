import React from 'react';
import { TrendingUp, Award, Layers, IndianRupee, PieChart, BarChart3, Users } from 'lucide-react';
import { SummaryByGrade, SummaryByOwner, SummaryBySource, ProcessedLead } from '../types/crm';

interface AnalyticsDashboardViewProps {
  summaryByGrade: SummaryByGrade[];
  summaryBySource: SummaryBySource[];
  summaryByOwner: SummaryByOwner[];
  processedLeads: ProcessedLead[];
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  summaryByGrade,
  summaryBySource,
  summaryByOwner,
  processedLeads,
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const totalBudget = summaryByGrade.reduce((acc, g) => acc + g.total_budget_inr, 0);

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Highest Scoring Channel</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {summaryBySource[0]?.source || 'Referral'}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            Avg Score: <strong className="text-emerald-600 dark:text-emerald-400">{summaryBySource[0]?.avg_score || 73.1}</strong> (12 Hot Leads)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>High-Priority Hot Leads</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            39 Leads (36.1%)
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            Total Budget: <strong className="text-rose-600 dark:text-rose-400">₹5.40 Cr</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Pipeline Value</span>
            <IndianRupee className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{(totalBudget / 10000000).toFixed(2)} Crores
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            Across 108 unique leads
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Top Performing Channel</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            Webinar (2 Converted)
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            24 Total Leads · 11 Hot
          </div>
        </div>
      </div>

      {/* Two Column Layout: Table 7.1 and Table 7.2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 7.1: Leads by Grade */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-blue-600 dark:text-blue-400">Report Section 7.1</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Leads by Quality Grade
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">108 Processed Leads</span>
          </div>

          <div className="space-y-3 pt-2">
            {summaryByGrade.map((g) => {
              const pct = (g.leads_count / processedLeads.length) * 100;
              const color =
                g.grade === 'Hot'
                  ? 'bg-rose-500 text-rose-600'
                  : g.grade === 'Warm'
                  ? 'bg-amber-500 text-amber-600'
                  : 'bg-slate-400 text-slate-500';

              return (
                <div key={g.grade} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {g.grade} Leads ({g.grade === 'Hot' ? 'Score ≥ 70' : g.grade === 'Warm' ? 'Score 40–69' : 'Score < 40'})
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {g.leads_count} leads ({pct.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full ${color.split(' ')[0]}`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                    <span>Avg Score: <strong>{g.avg_score.toFixed(1)}</strong></span>
                    <span>Budget: <strong>{formatINR(g.total_budget_inr)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Observation: <strong>Hot leads</strong> represent 60.9% of the total budget (₹5.40 Cr) despite being 36% of volume. Senior rep assignment is critical.
          </div>
        </div>

        {/* Section 7.2: Performance by Lead Source */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-purple-600 dark:text-purple-400">Report Section 7.2</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Performance by Lead Source
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">6 Acquisition Channels</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                  <th className="py-2 px-2.5">Source Channel</th>
                  <th className="py-2 px-2.5 text-right font-mono">Leads</th>
                  <th className="py-2 px-2.5 text-right font-mono">Avg Score</th>
                  <th className="py-2 px-2.5 text-right font-mono">Hot Leads</th>
                  <th className="py-2 px-2.5 text-right font-mono">Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summaryBySource.map((s) => (
                  <tr key={s.source} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-white">{s.source}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">{s.leads_count}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400">{s.avg_score.toFixed(1)}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">{s.hot_leads}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{s.converted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Observation: <strong>Referral</strong> (73.1) and <strong>Webinar</strong> (68.6) yield the highest average scores and generate 23 out of 39 Hot leads.
          </div>
        </div>
      </div>
    </div>
  );
};
