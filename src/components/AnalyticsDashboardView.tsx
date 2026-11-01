import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, Layers, Globe, Star } from 'lucide-react';
import { BankRanking, CategorySummary, ValidatedRecord } from '../types/pipeline';

interface AnalyticsDashboardViewProps {
  bankRankings: BankRanking[];
  categorySummaries: CategorySummary[];
  validRecords: ValidatedRecord[];
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  bankRankings,
  categorySummaries,
  validRecords,
}) => {
  const [selectedBankHighlight, setSelectedBankHighlight] = useState<string | null>(null);

  // Grade counts
  const gradeCounts = {
    Excellent: validRecords.filter((r) => r.ux_grade === 'Excellent').length,
    Good: validRecords.filter((r) => r.ux_grade === 'Good').length,
    Fair: validRecords.filter((r) => r.ux_grade === 'Fair').length,
    Poor: validRecords.filter((r) => r.ux_grade === 'Poor').length,
  };

  const topBank = bankRankings[0] || { bank_name: 'Lion City Bank', avg_score: 79.9, country: 'Singapore' };
  const lowestBank = bankRankings[bankRankings.length - 1] || { bank_name: 'Verde Brasil Bank', avg_score: 59.1, country: 'Brazil' };

  return (
    <div className="space-y-8">
      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Highest Ranking Bank</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {topBank.bank_name}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            {topBank.country} <span aria-hidden="true">·</span> Score: <strong className="text-blue-600 dark:text-blue-400">{topBank.avg_score}</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Top Performing Screen Category</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {categorySummaries[0]?.category || 'Login'}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            Avg Score: <strong className="text-emerald-600 dark:text-emerald-400">{categorySummaries[0]?.avg_score || 78.4}</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Lowest Scoring Category</span>
            <Layers className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {categorySummaries[categorySummaries.length - 1]?.category || 'Dashboard'}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            Avg Score: <strong className="text-slate-600 dark:text-slate-400">{categorySummaries[categorySummaries.length - 1]?.avg_score || 60.2}</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Global Coverage</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            12 Sovereign Nations
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            184 validated screens
          </div>
        </div>
      </div>

      {/* Two Column Visualisation Grid matching Figure 5 & Figure 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Figure 5: Average UX Score by Bank */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-blue-600 dark:text-blue-400">Figure 5 Reproduction</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Average UX Score by Bank (0–100)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">12 International Banks</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {bankRankings.map((b) => {
              const widthPct = Math.max(10, Math.min(100, (b.avg_score / 100) * 100));
              const isSelected = selectedBankHighlight === b.bank_name;

              return (
                <div
                  key={b.bank_name}
                  onClick={() => setSelectedBankHighlight(isSelected ? null : b.bank_name)}
                  className={`group cursor-pointer p-1.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {b.rank}. {b.bank_name} <span className="text-slate-400 text-[11px]">({b.country})</span>
                    </span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {b.avg_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-xs overflow-hidden flex items-center">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-full rounded-xs transition-all duration-500 group-hover:bg-blue-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            In this dataset, <strong>Lion City Bank (Singapore)</strong> has the highest average UX score (79.9) and <strong>Verde Brasil Bank (Brazil)</strong> the lowest (59.1).
          </div>
        </div>

        {/* Figure 6: Average UX Score by Screen Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Figure 6 Reproduction</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Average UX Score by Screen Category
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">13 Banking Categories</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {categorySummaries.map((cat, idx) => {
              const widthPct = Math.max(10, Math.min(100, (cat.avg_score / 100) * 100));

              return (
                <div key={cat.category} className="group p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {cat.category} <span className="text-slate-400 text-[11px]">({cat.screens_count} screens)</span>
                    </span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {cat.avg_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-xs overflow-hidden flex items-center">
                    <div
                      className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-xs transition-all duration-500 group-hover:bg-emerald-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <strong>Login</strong> screens score highest (~78) due to strict biometric integration & multi-language clarity, whereas <strong>Dashboard</strong> screens score lowest (~60) due to visual density and missing accessibility features.
          </div>
        </div>
      </div>

      {/* Table 8.2: Full Bank Ranking Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500">Report Section 8.2</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Comparative Bank Rankings & Feature Densities
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">184 Validated Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Bank Name</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3 text-right">Screens</th>
                <th className="py-2.5 px-3 text-right">Avg UX Rating</th>
                <th className="py-2.5 px-3 text-right">Avg UX Score</th>
                <th className="py-2.5 px-3 text-right">Accessibility %</th>
                <th className="py-2.5 px-3 text-right">Avg Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bankRankings.map((b) => (
                <tr
                  key={b.bank_name}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedBankHighlight === b.bank_name ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-500">#{b.rank}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{b.bank_name}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{b.country}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {b.screens_count}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {b.avg_rating.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
                    {b.avg_score.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {b.accessibility_pct.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {b.avg_features.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
