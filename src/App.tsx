import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PipelineStudio } from './components/PipelineStudio';
import { ProcessedLeadsView } from './components/ProcessedLeadsView';
import { SLABreachView } from './components/SLABreachView';
import { QuarantineView } from './components/QuarantineView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { ScoringRulesView } from './components/ScoringRulesView';
import { UnitTestRunnerView } from './components/UnitTestRunnerView';
import { ProjectReportModal } from './components/ProjectReportModal';
import { generateBenchmarkLeads } from './data/rawBenchmarkLeads';
import { executeCRMPipeline } from './engine/crmPipelineEngine';
import { RawLead } from './types/crm';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(5);
  const [referenceDate, setReferenceDate] = useState<string>('2026-11-02');

  // Initialize raw leads with benchmark dataset (126 records)
  const [rawLeads, setRawLeads] = useState<RawLead[]>(() => generateBenchmarkLeads());

  // Pipeline output state
  const [pipelineOutput, setPipelineOutput] = useState(() => {
    const initialRaw = generateBenchmarkLeads();
    return executeCRMPipeline(initialRaw, '2026-11-02');
  });

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Execute pipeline runner with staged visual progression
  const triggerPipelineRun = useCallback(
    (leadsToProcess = rawLeads, refDate = referenceDate) => {
      setIsRunning(true);
      setActiveStageIdx(0); // Ingest

      setTimeout(() => {
        setActiveStageIdx(1); // Validate
        setTimeout(() => {
          setActiveStageIdx(2); // Dedupe
          setTimeout(() => {
            setActiveStageIdx(3); // Score
            setTimeout(() => {
              setActiveStageIdx(4); // Assign
              setTimeout(() => {
                setActiveStageIdx(5); // SLA & Output
                const output = executeCRMPipeline(leadsToProcess, refDate);
                setPipelineOutput(output);
                setIsRunning(false);
              }, 300);
            }, 300);
          }, 300);
        }, 300);
      }, 300);
    },
    [rawLeads, referenceDate]
  );

  const handleReferenceDateChange = (newDate: string) => {
    setReferenceDate(newDate);
    const output = executeCRMPipeline(rawLeads, newDate);
    setPipelineOutput(output);
  };

  const handleResetBenchmark = () => {
    const fresh = generateBenchmarkLeads();
    setRawLeads(fresh);
    triggerPipelineRun(fresh, referenceDate);
  };

  const handleCustomFileUpload = (customLeads: RawLead[]) => {
    setRawLeads(customLeads);
    triggerPipelineRun(customLeads, referenceDate);
  };

  const handleLeadFixed = (originalLeadId: string, fixedLead: RawLead) => {
    const updated = rawLeads.map((l) => (l.lead_id === originalLeadId ? fixedLead : l));
    setRawLeads(updated);
    triggerPipelineRun(updated, referenceDate);
  };

  const handleMarkContacted = (leadId: string) => {
    const updated = rawLeads.map((l) =>
      l.lead_id === leadId ? { ...l, status: 'Contacted' } : l
    );
    setRawLeads(updated);
    const output = executeCRMPipeline(updated, referenceDate);
    setPipelineOutput(output);
  };

  const handleReassignLead = (leadId: string, newOwner: string) => {
    setPipelineOutput((prev) => {
      const updatedLeads = prev.processedLeads.map((l) =>
        l.lead_id === leadId ? { ...l, assigned_to: newOwner } : l
      );
      return { ...prev, processedLeads: updatedLeads };
    });
  };

  const handleExportCsv = () => {
    const leads = pipelineOutput.processedLeads;
    if (leads.length === 0) return;

    const headers = [
      'lead_id',
      'name',
      'company',
      'industry',
      'email',
      'phone',
      'source',
      'region',
      'created_date',
      'status',
      'budget',
      'company_size',
      'timeline',
      'website_visits',
      'emails_opened',
      'score',
      'grade',
      'assigned_to',
      'rep_seniority',
      'followup_due_date',
      'is_sla_breach',
      'days_overdue',
    ];

    const rows = leads.map((l) => [
      l.lead_id,
      `"${l.name}"`,
      `"${l.company}"`,
      `"${l.industry}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.source}"`,
      `"${l.region}"`,
      l.created_date,
      `"${l.status}"`,
      l.budget,
      l.company_size,
      `"${l.timeline}"`,
      l.website_visits,
      l.emails_opened,
      l.score,
      `"${l.grade}"`,
      `"${l.assigned_to}"`,
      `"${l.rep_seniority}"`,
      l.followup_due_date,
      l.is_sla_breach ? 'True' : 'False',
      l.days_overdue,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `processed_leads_${referenceDate}.csv`);
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
            referenceDate={referenceDate}
            setReferenceDate={handleReferenceDateChange}
            activeStageIdx={activeStageIdx}
          />
        )}

        {activeTab === 'processed' && (
          <ProcessedLeadsView
            leads={pipelineOutput.processedLeads}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'sla' && (
          <SLABreachView
            leads={pipelineOutput.processedLeads}
            summaryByOwner={pipelineOutput.summaryByOwner}
            onMarkContacted={handleMarkContacted}
            onReassignLead={handleReassignLead}
            referenceDate={referenceDate}
          />
        )}

        {activeTab === 'quarantine' && (
          <QuarantineView
            rejectedLeads={pipelineOutput.rejectedLeads}
            duplicateLeads={pipelineOutput.duplicateLeads}
            onLeadFixed={handleLeadFixed}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboardView
            summaryByGrade={pipelineOutput.summaryByGrade}
            summaryBySource={pipelineOutput.summaryBySource}
            summaryByOwner={pipelineOutput.summaryByOwner}
            processedLeads={pipelineOutput.processedLeads}
          />
        )}

        {activeTab === 'rules' && <ScoringRulesView />}

        {activeTab === 'tests' && <UnitTestRunnerView />}
      </main>

      {/* DIT-P06 Final Project Report Modal */}
      <ProjectReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-6 mt-16 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>DefineInfoTech Pvt. Ltd. (DIT)</span>
            <span aria-hidden="true">·</span>
            <span>CRM Lead Management Automation (DIT-P06)</span>
            <span aria-hidden="true">·</span>
            <span>Madhumitha & Kanmani (Team T06)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              View Project Report
            </button>
            <button
              onClick={handleExportCsv}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Export processed_leads.csv
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
