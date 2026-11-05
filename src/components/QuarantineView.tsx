import React, { useState } from 'react';
import { AlertTriangle, Copy, Edit3, X, CheckCircle, RefreshCw } from 'lucide-react';
import { DuplicateLead, RawLead, RejectedLead } from '../types/crm';
import { runValidationStage } from '../engine/crmPipelineEngine';

interface QuarantineViewProps {
  rejectedLeads: RejectedLead[];
  duplicateLeads: DuplicateLead[];
  onLeadFixed: (originalLeadId: string, fixedLead: RawLead) => void;
}

export const QuarantineView: React.FC<QuarantineViewProps> = ({
  rejectedLeads,
  duplicateLeads,
  onLeadFixed,
}) => {
  const [activeTab, setActiveTab] = useState<'rejected' | 'duplicates'>('rejected');
  const [editingItem, setEditingItem] = useState<RejectedLead | null>(null);
  const [editedLead, setEditedLead] = useState<RawLead | null>(null);
  const [fixTestError, setFixTestError] = useState<string | null>(null);

  const handleStartEdit = (rej: RejectedLead) => {
    setEditingItem(rej);
    setEditedLead({ ...rej.lead });
    setFixTestError(null);
  };

  const handleFieldChange = (field: keyof RawLead, val: any) => {
    if (!editedLead) return;
    setEditedLead({ ...editedLead, [field]: val });
  };

  const handleApplyFix = () => {
    if (!editedLead || !editingItem) return;

    // Validate the edited row
    const { validLeads, rejectedLeads: testRej } = runValidationStage([editedLead]);
    if (testRej.length > 0) {
      setFixTestError(testRej[0].reject_reason);
      return;
    }

    onLeadFixed(editingItem.lead.lead_id, editedLead);
    setEditingItem(null);
    setEditedLead(null);
    setFixTestError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Lead Quarantine & Deduplication Repository
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Isolated per FR2 & FR3 requirements into rejected_leads.csv and duplicate_leads.csv without halting the pipeline.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'rejected'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Rejected Leads ({rejectedLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'duplicates'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Duplicate Leads ({duplicateLeads.length})
          </button>
        </div>
      </div>

      {activeTab === 'rejected' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-rose-50/50 dark:bg-rose-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                12 Quarantined Invalid Leads (rejected_leads.csv)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Section 4.1 Deliberate Injections
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                    <th className="py-2.5 px-3">Lead ID</th>
                    <th className="py-2.5 px-3">Name & Company</th>
                    <th className="py-2.5 px-3">Rejection Diagnostic</th>
                    <th className="py-2.5 px-3">Offending Value</th>
                    <th className="py-2.5 px-3">Region & Source</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rejectedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No rejected leads. All leads are valid!
                      </td>
                    </tr>
                  ) : (
                    rejectedLeads.map((rej) => (
                      <tr key={rej.lead.lead_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{rej.lead.lead_id}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{rej.lead.name}</div>
                          <div className="text-[11px] text-slate-500">{rej.lead.company}</div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-rose-700 dark:text-rose-400">
                          {rej.reject_reason}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {rej.reject_reason.includes('email')
                            ? rej.lead.email
                            : rej.reject_reason.includes('phone')
                            ? rej.lead.phone || '[BLANK]'
                            : rej.reject_reason.includes('date')
                            ? rej.lead.created_date
                            : rej.reject_reason.includes('budget')
                            ? rej.lead.budget
                            : rej.lead.source}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {rej.lead.region} · {rej.lead.source}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleStartEdit(rej)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors mx-auto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Fix & Promote</span>
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
      )}

      {activeTab === 'duplicates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              6 Deduplicated Leads (duplicate_leads.csv)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Earliest Record Preserved (dedupe.py)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                  <th className="py-2.5 px-3">Duplicate ID</th>
                  <th className="py-2.5 px-3">Matching Email</th>
                  <th className="py-2.5 px-3">Duplicate Created Date</th>
                  <th className="py-2.5 px-3">Original Lead ID (Retained)</th>
                  <th className="py-2.5 px-3">Original Created Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {duplicateLeads.map((dup) => (
                  <tr key={dup.duplicate_lead.lead_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{dup.duplicate_lead.lead_id}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {dup.duplicate_lead.email}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {dup.duplicate_lead.created_date} (Later)
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {dup.original_lead_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                      {dup.original_created_date} (Kept)
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-amber-600 text-[11px]">
                        Quarantined
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fix Lead Modal */}
      {editingItem && editedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-slate-500">Fixing Quarantined Row: {editingItem.lead.lead_id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Resolve: {editingItem.reject_reason}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={editedLead.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editedLead.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Created Date</label>
                <input
                  type="date"
                  value={editedLead.created_date}
                  onChange={(e) => handleFieldChange('created_date', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Budget (INR)</label>
                <input
                  type="number"
                  value={editedLead.budget}
                  onChange={(e) => handleFieldChange('budget', parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Source</label>
                <input
                  type="text"
                  value={editedLead.source}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {fixTestError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded text-xs">
                Still invalid: {fixTestError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFix}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Verify & Promote to Master
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
