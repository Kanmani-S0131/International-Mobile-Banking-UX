import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, UserCheck, ShieldAlert, ArrowRight, User } from 'lucide-react';
import { ProcessedLead, SummaryByOwner } from '../types/crm';
import { SALES_TEAM } from '../data/salesTeam';

interface SLABreachViewProps {
  leads: ProcessedLead[];
  summaryByOwner: SummaryByOwner[];
  onMarkContacted: (leadId: string) => void;
  onReassignLead: (leadId: string, newOwner: string) => void;
  referenceDate: string;
}

export const SLABreachView: React.FC<SLABreachViewProps> = ({
  leads,
  summaryByOwner,
  onMarkContacted,
  onReassignLead,
  referenceDate,
}) => {
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const breachedLeads = leads.filter((l) => l.is_sla_breach);

  const filteredBreaches = breachedLeads.filter(
    (l) => selectedRegionFilter === 'all' || l.region === selectedRegionFilter
  );

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Section 7 & Table 7 SLA Enforcement</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              SLA Breach Control & Sales Representative Assignment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies leads with status 'New' that exceeded first-response deadlines as of {referenceDate} (Hot: 1d, Warm: 3d, Cold: 7d).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Total SLA Breaches</div>
              <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                {breachedLeads.length}
              </div>
            </div>
            <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-700">
              <div className="text-[11px] text-slate-500">Breached Pipeline Value</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {formatINR(breachedLeads.reduce((acc, l) => acc + l.budget, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Team Workload & Round-Robin Assignment Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sales Representative Round-Robin Workload (assignment.py)
            </h3>
            <p className="text-xs text-slate-500">
              Hot leads assigned to Senior representatives; Warm and Cold leads assigned to Junior representatives.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">12 Sales Reps Across 4 Regions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryByOwner.map((rep) => (
            <div
              key={rep.owner}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">{rep.owner}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {rep.region} · {rep.seniority}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    rep.seniority === 'Senior'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}
                >
                  {rep.seniority}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Assigned</div>
                  <div className="font-bold text-slate-900 dark:text-white">{rep.leads_count}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Hot</div>
                  <div className="font-bold text-rose-600 dark:text-rose-400">{rep.hot_leads}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">SLA Delays</div>
                  <div className={`font-bold ${rep.sla_breaches > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {rep.sla_breaches}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Breaches Action Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active SLA Breaches Awaiting First Contact ({filteredBreaches.length} Leads)
            </h3>
            <p className="text-xs text-slate-500">
              Click 'Log Contact' to advance status to Contacted and clear the breach flag.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Region:</span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
              <option value="East">East</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-rose-50/50 dark:bg-rose-950/20 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                <th className="py-2.5 px-3">Lead ID</th>
                <th className="py-2.5 px-3">Contact & Company</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Assigned Owner</th>
                <th className="py-2.5 px-3 font-mono">Created Date</th>
                <th className="py-2.5 px-3 font-mono">SLA Due Date</th>
                <th className="py-2.5 px-3 text-right font-mono">Overdue</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBreaches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No active SLA breaches in this view.
                  </td>
                </tr>
              ) : (
                filteredBreaches.map((lead) => (
                  <tr key={lead.lead_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{lead.lead_id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{lead.company} · {lead.phone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          lead.grade === 'Hot' ? 'text-rose-600' : lead.grade === 'Warm' ? 'text-amber-600' : 'text-slate-500'
                        }`}
                      >
                        {lead.grade} ({lead.score})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">{lead.region}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      {lead.assigned_to}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{lead.created_date}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{lead.followup_due_date}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      +{lead.days_overdue} days
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onMarkContacted(lead.lead_id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-xs"
                      >
                        Log Contact
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
