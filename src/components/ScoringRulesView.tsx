import React, { useState } from 'react';
import { Calculator, Award, Sparkles, Sliders, Layers } from 'lucide-react';
import { LeadGrade, LeadSource, LeadTimeline } from '../types/crm';

export const ScoringRulesView: React.FC = () => {
  // Live Simulator State
  const [source, setSource] = useState<LeadSource>('Referral');
  const [budget, setBudget] = useState<number>(1200000);
  const [companySize, setCompanySize] = useState<number>(250);
  const [websiteVisits, setWebsiteVisits] = useState<number>(5);
  const [emailsOpened, setEmailsOpened] = useState<number>(4);
  const [timeline, setTimeline] = useState<LeadTimeline>('0-1 Months');

  // Compute points
  let sourcePts = 5;
  if (source === 'Referral') sourcePts = 25;
  else if (source === 'Webinar') sourcePts = 20;
  else if (source === 'Website' || source === 'Trade Show') sourcePts = 15;
  else if (source === 'Social Media') sourcePts = 8;
  else if (source === 'Cold Call') sourcePts = 5;

  let budgetPts = 5;
  if (budget >= 1000000) budgetPts = 25;
  else if (budget >= 500000) budgetPts = 20;
  else if (budget >= 100000) budgetPts = 10;
  else budgetPts = 5;

  let sizePts = 3;
  if (companySize >= 200) sizePts = 15;
  else if (companySize >= 50) sizePts = 10;
  else if (companySize >= 11) sizePts = 6;
  else sizePts = 3;

  const engagementPts = Math.min(15, websiteVisits * 2 + emailsOpened);

  let timelinePts = 2;
  if (timeline === '0-1 Months') timelinePts = 20;
  else if (timeline === '1-3 Months') timelinePts = 12;
  else if (timeline === '3-6 Months') timelinePts = 6;
  else timelinePts = 2;

  const totalScore = sourcePts + budgetPts + sizePts + engagementPts + timelinePts;

  let grade: LeadGrade = 'Cold';
  if (totalScore >= 70) grade = 'Hot';
  else if (totalScore >= 40) grade = 'Warm';

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Lead Scoring & Quality Grading Specifications (scoring.py)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configured in config.py and enforced in scoring.py. Calculates a composite 0–100 score across 5 objective factors.
        </p>
      </div>

      {/* Interactive Scoring Simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Lead Score & Grade Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Score = Source (25) + Budget (25) + Company Size (15) + Engagement (15) + Timeline (20)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Quality Tier</div>
              <div
                className={`text-sm font-bold ${
                  grade === 'Hot'
                    ? 'text-rose-600 dark:text-rose-400'
                    : grade === 'Warm'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {grade} Lead
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-xl font-bold">
              {totalScore} / 100
            </div>
          </div>
        </div>

        {/* Simulator Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Source Selection */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Lead Source</label>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{sourcePts} / 25 pts</span>
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Referral">Referral (25 pts)</option>
              <option value="Webinar">Webinar (20 pts)</option>
              <option value="Website">Website (15 pts)</option>
              <option value="Trade Show">Trade Show (15 pts)</option>
              <option value="Social Media">Social Media (8 pts)</option>
              <option value="Cold Call">Cold Call (5 pts)</option>
            </select>
          </div>

          {/* Budget Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Budget (INR)</label>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{budgetPts} / 25 pts</span>
            </div>
            <input
              type="range"
              min="20000"
              max="2000000"
              step="50000"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="text-[11px] text-slate-500 font-mono">{formatINR(budget)}</div>
          </div>

          {/* Company Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Company Size</label>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{sizePts} / 15 pts</span>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              step="10"
              value={companySize}
              onChange={(e) => setCompanySize(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
            <div className="text-[11px] text-slate-500 font-mono">{companySize} Employees</div>
          </div>

          {/* Website Visits */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Website Visits</label>
              <span className="font-mono text-slate-500">{websiteVisits * 2} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={websiteVisits}
              onChange={(e) => setWebsiteVisits(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
            <div className="text-[11px] text-slate-500">{websiteVisits} visits (&times;2 weight)</div>
          </div>

          {/* Emails Opened */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Emails Opened</label>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{engagementPts} / 15 max</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={emailsOpened}
              onChange={(e) => setEmailsOpened(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
            <div className="text-[11px] text-slate-500">{emailsOpened} opened (&times;1 weight)</div>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Purchase Timeline</label>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{timelinePts} / 20 pts</span>
            </div>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value as LeadTimeline)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="0-1 Months">0-1 Months (20 pts)</option>
              <option value="1-3 Months">1-3 Months (12 pts)</option>
              <option value="3-6 Months">3-6 Months (6 pts)</option>
              <option value="6+ Months">6+ Months (2 pts)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Official Scoring Matrix Tables (Section 4.4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Lead Source & Budget Point Weights
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                  <th className="py-2">Dimension</th>
                  <th className="py-2">Rule / Tier</th>
                  <th className="py-2 text-right">Points (Max)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2 font-medium">Source</td>
                  <td className="py-2">Referral 25, Webinar 20, Website 15, Trade Show 15, Social Media 8, Cold Call 5</td>
                  <td className="py-2 text-right font-mono font-bold text-blue-600">25</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Budget (INR)</td>
                  <td className="py-2">₹10,00,000+: 25; ₹5,00,000+: 20; ₹1,00,000+: 10; below: 5</td>
                  <td className="py-2 text-right font-mono font-bold text-blue-600">25</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Company Size</td>
                  <td className="py-2">200+: 15; 50–199: 10; 11–49: 6; 1–10: 3</td>
                  <td className="py-2 text-right font-mono font-bold text-blue-600">15</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Engagement</td>
                  <td className="py-2">min(15, website_visits &times; 2 + emails_opened)</td>
                  <td className="py-2 text-right font-mono font-bold text-blue-600">15</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Timeline</td>
                  <td className="py-2">0-1 Months: 20; 1-3 Months: 12; 3-6 Months: 6; 6+ Months: 2</td>
                  <td className="py-2 text-right font-mono font-bold text-blue-600">20</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Quality Tiers & First-Response SLA Windows
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900/40">
              <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
                <span>HOT LEAD (Score &ge; 70)</span>
                <span>SLA: 1 Day Window</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Assigned strictly to <strong>Senior Representatives</strong> by region. Urgent follow-up required within 24 hours.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                <span>WARM LEAD (Score 40–69)</span>
                <span>SLA: 3 Days Window</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Assigned to <strong>Junior Representatives</strong> by region via round-robin. Follow-up expected within 72 hours.
              </p>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>COLD LEAD (Score &lt; 40)</span>
                <span>SLA: 7 Days Window</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Assigned to <strong>Junior Representatives</strong>. Nurtured with 7-day initial contact window.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
