import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PipelineStudio } from './components/PipelineStudio';
import { MasterDatasetView } from './components/MasterDatasetView';
import { RejectedInspectorView } from './components/RejectedInspectorView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { BusinessRulesView } from './components/BusinessRulesView';
import { PytestRunnerView } from './components/PytestRunnerView';
import { ProjectReportModal } from './components/ProjectReportModal';
import { generateBenchmarkDataset } from './data/rawBenchmarkDataset';
import { executeFullPipeline } from './engine/pipelineEngine';
import { RawRecord, PipelineExecutionLog } from './types/pipeline';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(4);

  // Initialize raw records with benchmark dataset (194 rows)
  const [rawRecords, setRawRecords] = useState<RawRecord[]>(() => generateBenchmarkDataset());

  // Pipeline output
  const [pipelineOutput, setPipelineOutput] = useState(() => {
    const initialRaw = generateBenchmarkDataset();
    return executeFullPipeline(initialRaw);
  });

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Execute pipeline runner with visual progression
  const triggerPipelineRun = useCallback((recordsToProcess = rawRecords) => {
    setIsRunning(true);
    setActiveStageIdx(0);

    // Staged visual timing for realistic pipeline simulation
    setTimeout(() => {
      setActiveStageIdx(1); // Clean
      setTimeout(() => {
        setActiveStageIdx(2); // Validate
        setTimeout(() => {
          setActiveStageIdx(3); // Score
          setTimeout(() => {
            setActiveStageIdx(4); // Report
            const output = executeFullPipeline(recordsToProcess);
            setPipelineOutput(output);
            setIsRunning(false);
          }, 350);
        }, 350);
      }, 350);
    }, 350);
  }, [rawRecords]);

  const handleResetBenchmark = () => {
    const freshBenchmark = generateBenchmarkDataset();
    setRawRecords(freshBenchmark);
    triggerPipelineRun(freshBenchmark);
  };

  const handleCustomFileUpload = (customRecords: RawRecord[]) => {
    setRawRecords(customRecords);
    triggerPipelineRun(customRecords);
  };

  const handleRecordFixed = (originalRecordId: string, fixedRecord: RawRecord) => {
    const updated = rawRecords.map((r) => (r.record_id === originalRecordId ? fixedRecord : r));
    setRawRecords(updated);
    triggerPipelineRun(updated);
  };

  const handleExportCsv = () => {
    const records = pipelineOutput.validRecords;
    if (records.length === 0) return;

    const headers = [
      'record_id',
      'bank_name',
      'country',
      'app_name',
      'screen_no',
      'screen_name',
      'screen_category',
      'features_present',
      'auth_method',
      'languages_supported',
      'accessibility_flag',
      'ux_rating',
      'ux_score',
      'ux_grade',
      'rating_component',
      'features_component',
      'accessibility_component',
      'languages_component',
      'collected_by',
      'collected_date',
      'source_file',
    ];

    const rows = records.map((r) => [
      r.record_id,
      `"${r.bank_name}"`,
      `"${r.country_cleaned}"`,
      `"${r.app_name}"`,
      r.screen_no,
      `"${r.screen_name}"`,
      `"${r.screen_category}"`,
      `"${r.features_present}"`,
      `"${r.auth_method}"`,
      `"${r.languages_supported}"`,
      r.accessibility_flag_cleaned,
      r.ux_rating,
      r.ux_score,
      r.ux_grade,
      r.score_breakdown.rating_component,
      r.score_breakdown.features_component,
      r.score_breakdown.accessibility_component,
      r.score_breakdown.languages_component,
      `"${r.collected_by}"`,
      r.collected_date,
      `"${r.source_file || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `master_banking_ux_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Bar Contract (1 row, 3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunPipeline={() => triggerPipelineRun()}
        isRunning={isRunning}
        onExportData={handleExportCsv}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pipeline' && (
          <PipelineStudio
            stats={pipelineOutput.stats}
            logs={pipelineOutput.logs}
            onRunPipeline={() => triggerPipelineRun()}
            isRunning={isRunning}
            onResetBenchmark={handleResetBenchmark}
            onCustomFileUpload={handleCustomFileUpload}
            activeStageIdx={activeStageIdx}
          />
        )}

        {activeTab === 'master' && (
          <MasterDatasetView
            records={pipelineOutput.validRecords}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'rejected' && (
          <RejectedInspectorView
            rejectedRecords={pipelineOutput.rejectedRecords}
            onRecordFixed={handleRecordFixed}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboardView
            bankRankings={pipelineOutput.bankRankings}
            categorySummaries={pipelineOutput.categorySummaries}
            validRecords={pipelineOutput.validRecords}
          />
        )}

        {activeTab === 'rules' && <BusinessRulesView />}

        {activeTab === 'tests' && <PytestRunnerView />}
      </main>

      {/* DIT Final Project Report Modal */}
      <ProjectReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Quiet Footer adhering to anti-slop rules */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-6 mt-16 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>DefineInfoTech Pvt. Ltd. (DIT)</span>
            <span aria-hidden="true">·</span>
            <span>Internship Task 07 Automation Project</span>
            <span aria-hidden="true">·</span>
            <span>Kanmani Suresh & Salman</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              View Full Report
            </button>
            <button
              onClick={handleExportCsv}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Download Master Dataset
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
