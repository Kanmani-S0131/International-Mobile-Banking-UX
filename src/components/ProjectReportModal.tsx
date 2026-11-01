import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Download, Printer, User, Building, Calendar, Layers, ExternalLink } from 'lucide-react';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({ isOpen, onClose }) => {
  const [learningNotes, setLearningNotes] = useState(
    'Handling inconsistent contributor formats required resilient regex parsing and alias mapping. Storing the raw un-sanitized values alongside the rejected records was crucial so contributors could understand exactly what failed and re-submit. Synthetic data allowed us to deliberately test edge cases like future dates and duplicates without risking proprietary customer info. Claude accelerated boilerplate module generation, but manual testing was required to tune scoring thresholds.'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 text-slate-900 dark:text-white">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="text-xs font-mono text-slate-500 block">TASK 07 · FINAL PROJECT REPORT</span>
              <h2 className="text-xl font-bold tracking-tight">International Mobile Banking UX Dataset Automation</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Metadata Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Organisation</span>
            <strong className="text-slate-900 dark:text-white">DefineInfoTech Pvt. Ltd. (DIT)</strong>
            <div className="text-[11px] text-slate-400">Internship 2026</div>
          </div>
          <div>
            <span className="text-slate-500 block">Date</span>
            <strong className="text-slate-900 dark:text-white font-mono">1 November 2026</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Team Member 1</span>
            <strong className="text-slate-900 dark:text-white">Kanmani Suresh</strong>
            <div className="text-[11px] font-mono text-slate-400">DIT2026S1048</div>
          </div>
          <div>
            <span className="text-slate-500 block">Team Member 2</span>
            <strong className="text-slate-900 dark:text-white">Salman</strong>
            <div className="text-[11px] font-mono text-slate-400">DIT2026S1046</div>
          </div>
        </div>

        {/* Section 1 & 2 */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">1. Introduction</h3>
            <p>
              Mobile banking apps differ widely between countries. Data about their screens, features, security and usability is usually collected by hand in spreadsheets, so different contributors record the same information in different ways. Merging these files by hand is slow and error-prone. This project automates the process: a modular pipeline loads the contributors’ files, cleans and standardises them, validates every record against business rules, scores the UX quality of each screen, and produces a trusted master dataset and reports.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">2. Objective and Business Outcome</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>One clean master dataset</strong> of banking-app screens with UX scores and grades.</li>
              <li><strong>A separate list of rejected records</strong>, each with the reason, so contributors can correct them.</li>
              <li><strong>Summaries comparing banks, regions and screen categories</strong>, with visual charts.</li>
              <li>Less manual effort, fewer data errors, and a repeatable process.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">3. Tools and AI Usage</h3>
            <p>
              <strong>Tools:</strong> Python 3, pandas, openpyxl, matplotlib, pytest and Visual Studio Code.
            </p>
            <p className="mt-1">
              <strong>AI Usage:</strong> An AI assistant (Claude) was used for requirements analysis, architecture, synthetic dataset design, module-by-module code generation, test design and documentation. Important prompts and AI-assisted changes are recorded in <code>AI_USAGE_LOG.md</code>. No confidential or personal data was given to the AI tool.
            </p>
          </div>

          {/* Workflow Diagram */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. System Design (Figure 1: Workflow Flowchart)</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center text-xs font-mono">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">Raw Input Files</div>
                  <div className="text-[10px] text-slate-500">2 CSV, 1 Excel</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">1. LOADER (loader.py)</div>
                  <div className="text-[10px] text-slate-500">Columns check & merge</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">2. CLEANER (cleaner.py)</div>
                  <div className="text-[10px] text-slate-500">Trim, aliases, Y/N, dates</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">3. VALIDATOR (validator.py)</div>
                  <div className="text-[10px] text-slate-500">BR1–BR5 + Quarantined</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">4. SCORER (rules.py)</div>
                  <div className="text-[10px] text-slate-500">Score 0–100 + Grade</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">5. REPORT (report.py)</div>
                  <div className="text-[10px] text-slate-500">Summaries & Charts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Challenges and Learning */}
          <div className="pt-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              9. Challenges and Learning
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Editable team contribution section for submission:
            </p>
            <textarea
              value={learningNotes}
              onChange={(e) => setLearningNotes(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-sans leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Deliverables Checklist */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">13. Project Deliverables</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Source code: main.py and src/</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Input dataset: data/raw/</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Requirements: docs/REQUIREMENTS_AND_RULES.md</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Flowchart: docs/workflow_flowchart.png</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Test cases: tests/test_pipeline.py</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Generated outputs: data/output/</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="text-xs text-slate-500">
            DIT Internship 2026 · Task 07 Automation Project
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
