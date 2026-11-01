import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Edit3, ArrowRight, X, Sparkles } from 'lucide-react';
import { RejectedRecord, RawRecord } from '../types/pipeline';
import { testSingleRecord } from '../engine/pipelineEngine';

interface RejectedInspectorViewProps {
  rejectedRecords: RejectedRecord[];
  onRecordFixed?: (originalRecordId: string, fixedRecord: RawRecord) => void;
}

export const RejectedInspectorView: React.FC<RejectedInspectorViewProps> = ({
  rejectedRecords,
  onRecordFixed,
}) => {
  const [editingItem, setEditingItem] = useState<RejectedRecord | null>(null);
  const [editedPayload, setEditedPayload] = useState<RawRecord | null>(null);
  const [fixTestResult, setFixTestResult] = useState<any>(null);

  // Group by reason
  const reasonCounts = rejectedRecords.reduce((acc, curr) => {
    acc[curr.rejection_reason] = (acc[curr.rejection_reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleStartEdit = (rej: RejectedRecord) => {
    setEditingItem(rej);
    setEditedPayload({ ...rej.record });
    setFixTestResult(null);
  };

  const handleFieldChange = (field: keyof RawRecord, val: any) => {
    if (!editedPayload) return;
    setEditedPayload({ ...editedPayload, [field]: val });
  };

  const handleTestFix = () => {
    if (!editedPayload) return;
    const res = testSingleRecord(editedPayload);
    setFixTestResult(res);
  };

  const handleApplyFix = () => {
    if (!editedPayload || !editingItem || !fixTestResult?.is_valid) return;
    onRecordFixed?.(editingItem.record.record_id, editedPayload);
    setEditingItem(null);
    setEditedPayload(null);
    setFixTestResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Rejected Records Inspector ({rejectedRecords.length} Quarantine Rows)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Isolated per Section 8.1 of report. Contributors can review exact failure reasons and test inline fixes.
          </p>
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Rejected Rows</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {rejectedRecords.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            8 Invalid records + 2 Duplicates
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:col-span-2">
          <div className="text-xs text-slate-500 mb-2">Failure Reasons Distribution (Figure 4)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {Object.entries(reasonCounts).map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{reason}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejected Records Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-rose-50/50 dark:bg-rose-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold select-none">
                <th className="py-2.5 px-3 whitespace-nowrap">ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Bank & Source</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Rule</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Rejection Reason</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Offending Value / Context</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rejectedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No rejected records. All records passed validation!
                  </td>
                </tr>
              ) : (
                rejectedRecords.map((item) => (
                  <tr key={item.record.record_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.record.record_id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.record.bank_name || <span className="text-rose-500 italic">[Blank Bank]</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.record.source_file || 'contributor_file'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {item.rule_id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-rose-700 dark:text-rose-300">
                      {item.rejection_reason}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-slate-800 dark:text-slate-200">
                        {item.rule_id === 'BR1'
                          ? 'bank_name=""'
                          : item.rule_id === 'BR3'
                          ? `ux_rating="${item.record.ux_rating}"`
                          : item.rule_id === 'BR4'
                          ? `collected_date="${item.record.collected_date}"`
                          : item.rule_id === 'BR5'
                          ? `screen_no=${item.record.screen_no} (duplicate)`
                          : `cat="${item.record.screen_category}", feats="${item.record.features_present}"`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Fix & Re-run</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Fix Modal */}
      {editingItem && editedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-slate-500">Fix Contributor Row: {editingItem.record.record_id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Resolve: {editingItem.rejection_reason}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
              <strong>Suggested Fix:</strong> {editingItem.suggested_fix}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={editedPayload.bank_name}
                  onChange={(e) => handleFieldChange('bank_name', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Country</label>
                <input
                  type="text"
                  value={editedPayload.country}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Screen Category</label>
                <input
                  type="text"
                  value={editedPayload.screen_category}
                  onChange={(e) => handleFieldChange('screen_category', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Screen No (Uniqueness)</label>
                <input
                  type="number"
                  value={editedPayload.screen_no}
                  onChange={(e) => handleFieldChange('screen_no', parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">UX Rating (1.0 - 5.0)</label>
                <input
                  type="text"
                  value={editedPayload.ux_rating}
                  onChange={(e) => handleFieldChange('ux_rating', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Collected Date</label>
                <input
                  type="text"
                  value={editedPayload.collected_date}
                  onChange={(e) => handleFieldChange('collected_date', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Auth Method</label>
                <input
                  type="text"
                  value={editedPayload.auth_method}
                  onChange={(e) => handleFieldChange('auth_method', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Features Present</label>
                <input
                  type="text"
                  value={editedPayload.features_present}
                  onChange={(e) => handleFieldChange('features_present', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleTestFix}
                className="px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-colors"
              >
                Validate Repaired Values
              </button>
            </div>

            {fixTestResult && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  fixTestResult.is_valid
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {fixTestResult.is_valid ? (
                  <div className="flex items-center justify-between">
                    <span>Fix Verified! Passed all business rules. Computed UX Score: {fixTestResult.scored?.ux_score}</span>
                    <button
                      onClick={handleApplyFix}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold transition-colors"
                    >
                      Promote to Master Dataset
                    </button>
                  </div>
                ) : (
                  <div>Still Rejected: {fixTestResult.rejection?.rejection_reason}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
