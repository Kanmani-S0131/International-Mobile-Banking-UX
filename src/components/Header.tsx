import React from 'react';
import { Play, Download, Sun, Moon, FileText, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunPipeline: () => void;
  isRunning: boolean;
  onExportData: () => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunPipeline,
  isRunning,
  onExportData,
  isDark,
  setIsDark,
  onOpenReportModal,
}) => {
  const navItems = [
    { id: 'pipeline', label: 'Pipeline Studio' },
    { id: 'master', label: 'Master Dataset' },
    { id: 'rejected', label: 'Rejected Inspector' },
    { id: 'analytics', label: 'Analytics & Rankings' },
    { id: 'rules', label: 'Business Rules' },
    { id: 'tests', label: 'Pytest Suite' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('pipeline')}
              className="text-left font-bold text-slate-900 dark:text-white tracking-tight text-lg whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Banking UX Automation
            </button>
          </div>

          {/* Zone 2: 4-6 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary action + Utility controls + Top Right Logos */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenReportModal}
              title="View DIT Internship Final Project Report"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Project Report</span>
            </button>

            <button
              onClick={onExportData}
              title="Export Master Dataset (CSV)"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white rounded-md shadow-xs transition-all whitespace-nowrap shrink-0 ${
                isRunning
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Top Right Logo */}
            <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
              <div
                title="DefineInfoTech - We Define Intellect"
                className="flex items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0"
              >
                <img
                  src="/assets/aistudio/DIT_orginal_logo_png_a203d580.png"
                  alt="DefineInfoTech - We Define Intellect"
                  className="h-6 sm:h-7 max-w-[150px] sm:max-w-[180px] object-contain shrink-0"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="lg:hidden flex items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-medium no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap shrink-0 px-2 py-1 rounded ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
