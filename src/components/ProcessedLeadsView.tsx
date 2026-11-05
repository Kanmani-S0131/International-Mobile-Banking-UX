import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronRight,
  X,
  Clock,
  AlertTriangle,
  User,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ProcessedLead, LeadGrade, LeadRegion, LeadSource, LeadStatus } from '../types/crm';
import { ALLOWED_REGIONS, ALLOWED_SOURCES, ALLOWED_STATUSES } from '../data/salesTeam';

interface ProcessedLeadsViewProps {
  leads: ProcessedLead[];
  onExportCsv: () => void;
}

export const ProcessedLeadsView: React.FC<ProcessedLeadsViewProps> = ({ leads, onExportCsv }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof ProcessedLead>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [activeLead, setActiveLead] = useState<ProcessedLead | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const matchesSearch =
          searchTerm === '' ||
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.lead_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGrade = selectedGrade === 'all' || lead.grade === selectedGrade;
        const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
        const matchesRegion = selectedRegion === 'all' || lead.region === selectedRegion;
        const matchesSource = selectedSource === 'all' || lead.source === selectedSource;

        let matchesSla = true;
        if (slaFilter === 'breached') matchesSla = lead.is_sla_breach;
        else if (slaFilter === 'on_track') matchesSla = !lead.is_sla_breach;

        return matchesSearch && matchesGrade && matchesStatus && matchesRegion && matchesSource && matchesSla;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [leads, searchTerm, selectedGrade, selectedStatus, selectedRegion, selectedSource, slaFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  const toggleSort = (field: keyof ProcessedLead) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Processed Leads Master Dataset ({leads.length} Unique Leads)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deduplicated, scored (0–100), graded (Hot/Warm/Cold), assigned by regional round-robin, and tracked for response SLAs.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export processed_leads.csv</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Grade Select */}
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Grades (39 Hot, 62 Warm, 7 Cold)</option>
            <option value="Hot">Hot (Score &ge; 70)</option>
            <option value="Warm">Warm (Score 40–69)</option>
            <option value="Cold">Cold (Score &lt; 40)</option>
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            {ALLOWED_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Region Select */}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Regions</option>
            {ALLOWED_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r} Region
              </option>
            ))}
          </select>

          {/* SLA Filter */}
          <select
            value={slaFilter}
            onChange={(e) => {
              setSlaFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All SLA States</option>
            <option value="breached">SLA Breached Only</option>
            <option value="on_track">On Track / Closed</option>
          </select>
        </div>

        {/* Results summary unboxed text */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing {filteredLeads.length} matching leads</span>
            <span aria-hidden="true">·</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          {(searchTerm || selectedGrade !== 'all' || selectedStatus !== 'all' || selectedRegion !== 'all' || slaFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGrade('all');
                setSelectedStatus('all');
                setSelectedRegion('all');
                setSlaFilter('all');
                setCurrentPage(1);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                <th className="py-2.5 px-3 whitespace-nowrap">
                  <button onClick={() => toggleSort('lead_id')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">Lead & Company</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Source</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Region</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">
                  <button onClick={() => toggleSort('budget')} className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white">
                    <span>Budget (INR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">
                  <button onClick={() => toggleSort('score')} className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Grade</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Assigned Owner</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">SLA Status</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No leads match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isBreach = lead.is_sla_breach;

                  return (
                    <tr
                      key={lead.lead_id}
                      onClick={() => setActiveLead(lead)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-500">{lead.lead_id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="text-[11px] text-slate-500">{lead.company}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {lead.source}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {lead.region}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                        {formatINR(lead.budget)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
                        {lead.score}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-semibold ${
                            lead.grade === 'Hot'
                              ? 'text-rose-600 dark:text-rose-400'
                              : lead.grade === 'Warm'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {lead.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-medium ${
                            lead.status === 'Converted'
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : lead.status === 'New'
                              ? 'text-blue-600 dark:text-blue-400'
                              : lead.status === 'Lost'
                              ? 'text-slate-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{lead.assigned_to}</div>
                        {lead.rep_seniority !== 'None' && (
                          <div className="text-[10px] text-slate-400">{lead.rep_seniority} Representative</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isBreach ? (
                          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 text-[11px]">
                            Breach ({lead.days_overdue}d)
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {lead.status === 'New' ? 'Due ' + lead.followup_due_date : 'Met'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLead(lead);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 font-mono">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="text-slate-600 dark:text-slate-400 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>{activeLead.lead_id}</span>
                  <span aria-hidden="true">·</span>
                  <span>Created {activeLead.created_date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeLead.region} Region</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeLead.name} – {activeLead.company}
                </h3>
              </div>
              <button
                onClick={() => setActiveLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Assignment Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Lead Score & Grade</span>
                  <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                    {activeLead.score} / 100 ({activeLead.grade} Lead)
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">Assigned Representative</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeLead.assigned_to}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {activeLead.rep_seniority !== 'None' ? `${activeLead.rep_seniority} Rep (${activeLead.region})` : 'Closed Lead'}
                  </div>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Source (25)</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeLead.score_breakdown.source_points} pts
                  </div>
                  <div className="text-[10px] text-slate-500">{activeLead.source}</div>
                </div>

                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Budget (25)</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeLead.score_breakdown.budget_points} pts
                  </div>
                  <div className="text-[10px] text-slate-500">{formatINR(activeLead.budget)}</div>
                </div>

                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Size (15)</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeLead.score_breakdown.company_size_points} pts
                  </div>
                  <div className="text-[10px] text-slate-500">{activeLead.company_size} staff</div>
                </div>

                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Engage (15)</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeLead.score_breakdown.engagement_points} pts
                  </div>
                  <div className="text-[10px] text-slate-500">{activeLead.website_visits}v / {activeLead.emails_opened}e</div>
                </div>

                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Timeline (20)</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeLead.score_breakdown.timeline_points} pts
                  </div>
                  <div className="text-[10px] text-slate-500">{activeLead.timeline}</div>
                </div>
              </div>
            </div>

            {/* SLA Alert Box */}
            <div
              className={`p-3 rounded-lg text-xs border ${
                activeLead.is_sla_breach
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span>First-Response SLA Target: {activeLead.sla_days} day(s) from creation</span>
                <span>Follow-up Due: {activeLead.followup_due_date}</span>
              </div>
              <p className="mt-1">
                {activeLead.is_sla_breach
                  ? `SLA BREACH: Lead has status 'New' and was not contacted within the required ${activeLead.sla_days} day window (${activeLead.days_overdue} days overdue).`
                  : activeLead.status === 'New'
                  ? 'Lead is within the SLA response window.'
                  : `First response completed (Current status: ${activeLead.status}).`}
              </p>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="font-mono text-slate-900 dark:text-white">{activeLead.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Normalized Mobile</span>
                <span className="font-mono text-slate-900 dark:text-white">{activeLead.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Industry</span>
                <span className="font-medium text-slate-900 dark:text-white">{activeLead.industry}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pipeline Status</span>
                <span className="font-medium text-slate-900 dark:text-white">{activeLead.status}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveLead(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
