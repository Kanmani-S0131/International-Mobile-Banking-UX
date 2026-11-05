import React from 'react';
import { X, FileText, Printer, CheckCircle2, Building, Calendar, Users, Terminal } from 'lucide-react';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 text-slate-900 dark:text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="text-xs font-mono text-slate-500 block">DIT-P06 · FINAL PROJECT REPORT</span>
              <h2 className="text-xl font-bold tracking-tight">CRM Lead Management Automation</h2>
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
            <span className="text-slate-500 block mb-1">Organisation</span>
            <img
              src="/assets/aistudio/DIT_orginal_logo_png_a203d580.png"
              alt="DefineInfoTech"
              className="h-6 object-contain bg-white px-1.5 py-0.5 rounded border border-slate-200 mb-1"
              referrerPolicy="no-referrer"
            />
            <div className="text-[11px] text-slate-400 font-mono">DefineInfoTech Pvt. Ltd. (DIT)</div>
          </div>
          <div>
            <span className="text-slate-500 block">Project & Team</span>
            <strong className="text-slate-900 dark:text-white font-mono">DIT-P06 (Team T06)</strong>
            <div className="text-[11px] text-slate-400">November 2026</div>
          </div>
          <div>
            <span className="text-slate-500 block">Team Members</span>
            <strong className="text-slate-900 dark:text-white">Madhumitha, Kanmani</strong>
            <div className="text-[11px] text-slate-400">Internship Project</div>
          </div>
          <div>
            <span className="text-slate-500 block">Technology Stack</span>
            <strong className="text-slate-900 dark:text-white font-mono">Python 3 · pandas</strong>
            <div className="text-[11px] text-slate-400 font-mono">openpyxl · unittest</div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">1. Introduction & Business Problem</h3>
            <p>
              Sales teams receive leads from many channels such as referrals, webinars, trade shows and websites. These leads arrive with inconsistent or incorrect data, duplicate entries and no clear priority. As a result, high-value leads may be contacted late, work is divided unevenly among sales representatives, and managers have no quick view of lead quality or response delays.
            </p>
            <p className="mt-1">
              <strong>Objective:</strong> Automate the lead-handling cycle with a modular Python program that cleans incoming lead data, removes duplicates, scores and grades each lead, assigns it to a sales representative by region, checks response deadlines (SLAs), and produces management reports.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">2. Functional Requirements (FR1 to FR8)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>FR1:</strong> Read leads from CSV file and validate mandatory fields, email pattern, 10-digit Indian mobile number (+91 removed), dates and numeric values.</li>
              <li><strong>FR2:</strong> Reject invalid rows with reason into <code>rejected_leads.csv</code> without stopping the pipeline.</li>
              <li><strong>FR3:</strong> Detect and remove duplicate leads (same email), keeping earliest record in <code>processed_leads.csv</code> and moving later ones to <code>duplicate_leads.csv</code>.</li>
              <li><strong>FR4:</strong> Score every lead from 0 to 100 across 5 factors and grade it Hot (&ge;70), Warm (40–69), or Cold (&lt;40).</li>
              <li><strong>FR5:</strong> Assign open leads to sales representatives by region using round-robin; Hot leads go to Senior representatives, Warm/Cold to Junior representatives.</li>
              <li><strong>FR6:</strong> Calculate follow-up due dates and flag first-response SLA breaches against reference date (2026-11-02).</li>
              <li><strong>FR7:</strong> Produce CSV outputs and multi-sheet Excel summary report (<code>lead_summary.xlsx</code>).</li>
              <li><strong>FR8:</strong> Log all runs to <code>logs/pipeline.log</code> with command-line interface.</li>
            </ul>
          </div>

          {/* Workflow Diagram */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Workflow Architecture (Figure 1)</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center text-xs font-mono">
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">leads_raw.csv</div>
                  <div className="text-[10px] text-slate-500">126 Records</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">Validate & Clean</div>
                  <div className="text-[10px] text-rose-500">12 Invalid</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">Deduplicate</div>
                  <div className="text-[10px] text-amber-500">6 Duplicates</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">Score & Grade</div>
                  <div className="text-[10px] text-blue-500">Hot/Warm/Cold</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">Assign Owner</div>
                  <div className="text-[10px] text-purple-500">Round-Robin</div>
                </div>
                <span className="text-slate-400">&rarr;</span>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full md:w-auto">
                  <div className="font-bold">SLA Breach Flag</div>
                  <div className="text-[10px] text-rose-500">45 Breaches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: AI Usage */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">8. Use of AI</h3>
            <div className="overflow-x-auto text-xs border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3">Stage</th>
                    <th className="py-2 px-3">How AI was used</th>
                    <th className="py-2 px-3">How the team verified it</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Planning</td>
                    <td className="py-2 px-3">Explained business problem, proposed architecture, modules & rules</td>
                    <td className="py-2 px-3">Compared with project requirements and allocation workbook</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Dataset</td>
                    <td className="py-2 px-3">Generated synthetic dataset with realistic fields & deliberate errors</td>
                    <td className="py-2 px-3">Opened CSV, checked fields and counted injected errors</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Code</td>
                    <td className="py-2 px-3">Generated Python code module by module with explanations</td>
                    <td className="py-2 px-3">Read each module, ran it, and explained within the team</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Testing</td>
                    <td className="py-2 px-3">Suggested test cases and expected values</td>
                    <td className="py-2 px-3">Calculated scores by hand and ran all unit tests</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 10: Team Contributions */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">10. Team Contribution</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong className="block text-slate-900 dark:text-white">Madhumitha</strong>
                <span className="text-slate-500 block mt-1">Lead: Requirements & workflow, Dataset & business rules, Validation and duplicate detection</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">Reviewed: Scoring, assignment, follow-up, reports</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong className="block text-slate-900 dark:text-white">Kanmani</strong>
                <span className="text-slate-500 block mt-1">Lead: Scoring & assignment, Follow-up, SLA & reports, Unit test suite authoring</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">Reviewed: Requirements, dataset calculations, validation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
          <div className="text-slate-500">
            DefineInfoTech Pvt. Ltd. (DIT) · CRM Lead Automation (DIT-P06)
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
