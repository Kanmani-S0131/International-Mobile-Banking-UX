import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Download, ChevronRight, X, ExternalLink, Sparkles } from 'lucide-react';
import { ValidatedRecord, ScreenCategory, UXGrade } from '../types/pipeline';
import { APPROVED_CATEGORIES } from '../data/constants';

interface MasterDatasetViewProps {
  records: ValidatedRecord[];
  onExportCsv: () => void;
}

export const MasterDatasetView: React.FC<MasterDatasetViewProps> = ({ records, onExportCsv }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof ValidatedRecord>('ux_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [activeRecord, setActiveRecord] = useState<ValidatedRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.bank_name))).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesSearch =
          searchTerm === '' ||
          rec.screen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.country_cleaned.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.features_present.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.record_id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBank = selectedBank === 'all' || rec.bank_name === selectedBank;
        const matchesCat = selectedCategory === 'all' || rec.screen_category === selectedCategory;
        const matchesGrade = selectedGrade === 'all' || rec.ux_grade === selectedGrade;

        return matchesSearch && matchesBank && matchesCat && matchesGrade;
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
  }, [records, searchTerm, selectedBank, selectedCategory, selectedGrade, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const toggleSort = (field: keyof ValidatedRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getGradeColor = (grade: UXGrade) => {
    switch (grade) {
      case 'Excellent':
        return 'text-emerald-700 dark:text-emerald-400 font-semibold';
      case 'Good':
        return 'text-blue-700 dark:text-blue-400 font-semibold';
      case 'Fair':
        return 'text-amber-700 dark:text-amber-400 font-semibold';
      case 'Poor':
        return 'text-rose-700 dark:text-rose-400 font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Master Banking UX Dataset ({records.length} Validated Screens)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingested from 3 contributor files, validated against BR1-BR6, scored via BR7, graded via BR8.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master Sheet (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search screen, feature, bank..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Bank Select */}
          <select
            value={selectedBank}
            onChange={(e) => {
              setSelectedBank(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-48 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Banks ({uniqueBanks.length})</option>
            {uniqueBanks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-44 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {APPROVED_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Grade Select */}
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-36 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Grades</option>
            <option value="Excellent">Excellent (&ge;85)</option>
            <option value="Good">Good (&ge;70)</option>
            <option value="Fair">Fair (&ge;55)</option>
            <option value="Poor">Poor (&lt;55)</option>
          </select>

          {(searchTerm || selectedBank !== 'all' || selectedCategory !== 'all' || selectedGrade !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBank('all');
                setSelectedCategory('all');
                setSelectedGrade('all');
                setCurrentPage(1);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Results summary unboxed text */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredRecords.length} matching screens</span>
          <span aria-hidden="true">·</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* High-density Data Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                <th className="py-2.5 px-3 whitespace-nowrap">
                  <button onClick={() => toggleSort('record_id')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">
                  <button onClick={() => toggleSort('bank_name')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                    <span>Bank & Country</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">
                  <button onClick={() => toggleSort('screen_category')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">Screen Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Auth Method</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Features</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Access</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">
                  <button onClick={() => toggleSort('ux_rating')} className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white">
                    <span>Rating</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">
                  <button onClick={() => toggleSort('ux_score')} className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white">
                    <span>UX Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Grade</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No matching records found. Try clearing filters or running pipeline.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr
                    key={rec.record_id}
                    onClick={() => setActiveRecord(rec)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-500">{rec.record_id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 dark:text-white">{rec.bank_name}</div>
                      <div className="text-[11px] text-slate-500">{rec.country_cleaned}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {rec.screen_category}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {rec.screen_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {rec.auth_method}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={rec.features_present}>
                      {rec.features_present || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {rec.accessibility_flag_cleaned === 'Yes' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {rec.ux_rating.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
                      {rec.ux_score.toFixed(1)}
                    </td>
                    <td className={`py-2.5 px-3 text-center ${getGradeColor(rec.ux_grade)}`}>
                      {rec.ux_grade}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRecord(rec);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 font-mono">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Screen Detail Inspector Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>{activeRecord.record_id}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeRecord.source_file || 'Ingested File'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeRecord.screen_name}
                </h3>
              </div>
              <button
                onClick={() => setActiveRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Breakdown Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  BR7 Composite UX Scoring Breakdown
                </span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                  {activeRecord.ux_score} / 100 ({activeRecord.ux_grade})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Rating (Max 60)</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeRecord.score_breakdown.rating_component} pts
                  </div>
                  <div className="text-[10px] text-slate-400">({activeRecord.ux_rating}/5.0)</div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Features (Max 20)</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeRecord.score_breakdown.features_component} pts
                  </div>
                  <div className="text-[10px] text-slate-400">({activeRecord.features_list.length} features)</div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Accessibility (10)</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeRecord.score_breakdown.accessibility_component} pts
                  </div>
                  <div className="text-[10px] text-slate-400">({activeRecord.accessibility_flag_cleaned})</div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Languages (10)</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeRecord.score_breakdown.languages_component} pts
                  </div>
                  <div className="text-[10px] text-slate-400">({activeRecord.languages_list.length} langs)</div>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Bank Organization</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeRecord.bank_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Country Jurisdiction</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeRecord.country_cleaned}</span>
              </div>
              <div>
                <span className="text-slate-500 block">App Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeRecord.app_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Screen Category & Index</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeRecord.screen_category} (Screen #{activeRecord.screen_no})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Authentication Method</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeRecord.auth_method}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date Ingested</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{activeRecord.collected_date}</span>
              </div>
              <div className="col-span-full">
                <span className="text-slate-500 block">Features Detected</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {activeRecord.features_present || 'None reported'}
                </span>
              </div>
              <div className="col-span-full">
                <span className="text-slate-500 block">Languages Supported</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {activeRecord.languages_supported}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveRecord(null)}
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
