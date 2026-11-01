import React, { useState } from 'react';
import { ShieldCheck, Calculator, Check, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import {
  APPROVED_AUTH_METHODS,
  APPROVED_CATEGORIES,
  APPROVED_COUNTRIES,
  APPROVED_FEATURES,
  BUSINESS_RULES,
  COUNTRY_ALIASES,
} from '../data/constants';
import { UXGrade } from '../types/pipeline';

export const BusinessRulesView: React.FC = () => {
  // Interactive Score Calculator state
  const [rating, setRating] = useState<number>(4.2);
  const [selectedFeaturesCount, setSelectedFeaturesCount] = useState<number>(3);
  const [hasAccessibility, setHasAccessibility] = useState<boolean>(true);
  const [languagesCount, setLanguagesCount] = useState<number>(2);

  // Compute live score
  const ratingComp = Math.round((rating / 5) * 60 * 10) / 10;
  const featuresComp = Math.min(20, selectedFeaturesCount * 5);
  const accessComp = hasAccessibility ? 10 : 0;
  const langsComp = languagesCount >= 2 ? 10 : languagesCount === 1 ? 5 : 0;
  const totalScore = Math.min(100, Math.round((ratingComp + featuresComp + accessComp + langsComp) * 10) / 10);

  let grade: UXGrade = 'Poor';
  if (totalScore >= 85) grade = 'Excellent';
  else if (totalScore >= 70) grade = 'Good';
  else if (totalScore >= 55) grade = 'Fair';

  const [activeTabTaxonomy, setActiveTabTaxonomy] = useState<'countries' | 'categories' | 'auth' | 'features'>('countries');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Business Rules & Scoring Specifications
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Governed by Section 6 (BR1 to BR8) of the Final Project Report. Configured in config.py and enforced in validator.py / rules.py.
        </p>
      </div>

      {/* Interactive Scoring Formula Playground */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive BR7 UX Scoring & BR8 Grade Calculator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Formula: Rating (max 60) + Features (max 20) + Accessibility (10) + Languages (10) = Total Score (0–100)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Calculated Grade</div>
              <div
                className={`text-sm font-bold ${
                  grade === 'Excellent'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : grade === 'Good'
                    ? 'text-blue-600 dark:text-blue-400'
                    : grade === 'Fair'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {grade}
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-xl font-bold">
              {totalScore.toFixed(1)} / 100
            </div>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Rating Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">UX Rating (1–5)</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{rating.toFixed(1)} / 5.0</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="text-[11px] text-slate-500">
              Contributes: <strong className="font-mono text-slate-900 dark:text-white">{ratingComp} pts</strong> (out of 60)
            </div>
          </div>

          {/* Features Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Features Present</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{selectedFeaturesCount} Features</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={selectedFeaturesCount}
              onChange={(e) => setSelectedFeaturesCount(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
            <div className="text-[11px] text-slate-500">
              Contributes: <strong className="font-mono text-slate-900 dark:text-white">{featuresComp} pts</strong> (out of 20)
            </div>
          </div>

          {/* Accessibility Toggle */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block text-xs">
              Accessibility Supported
            </span>
            <button
              onClick={() => setHasAccessibility(!hasAccessibility)}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-between ${
                hasAccessibility
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{hasAccessibility ? 'Flag: Yes (+10 pts)' : 'Flag: No (0 pts)'}</span>
              {hasAccessibility && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
            <div className="text-[11px] text-slate-500">
              Contributes: <strong className="font-mono text-slate-900 dark:text-white">{accessComp} pts</strong> (out of 10)
            </div>
          </div>

          {/* Languages Supported */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Languages Count</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{languagesCount} Langs</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={languagesCount}
              onChange={(e) => setLanguagesCount(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
            <div className="text-[11px] text-slate-500">
              Contributes: <strong className="font-mono text-slate-900 dark:text-white">{langsComp} pts</strong> (out of 10)
            </div>
          </div>
        </div>
      </div>

      {/* Complete Business Rules Table (BR1 - BR8) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Formal Business Rules Matrix (BR1–BR8)
          </h3>
          <p className="text-xs text-slate-500">
            Defined in Section 6. Passed into pytest test cases TC01 to TC14.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
                <th className="py-2.5 px-4 whitespace-nowrap">Rule ID</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Rule Name</th>
                <th className="py-2.5 px-4">Specification & Logic</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Stage</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Action on Failure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {BUSINESS_RULES.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {rule.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {rule.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                    {rule.description}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{rule.stage}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold text-xs ${
                        rule.on_failure === 'Reject'
                          ? 'text-rose-600 dark:text-rose-400'
                          : rule.on_failure === 'Reject duplicate'
                          ? 'text-amber-600 dark:text-amber-400'
                          : rule.on_failure === 'Auto-fix'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {rule.on_failure}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approved Reference Taxonomy Explorer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Approved Reference Taxonomy (config.py Allowed Values)
            </h3>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTabTaxonomy('countries')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTabTaxonomy === 'countries'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Countries ({APPROVED_COUNTRIES.length})
            </button>
            <button
              onClick={() => setActiveTabTaxonomy('categories')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTabTaxonomy === 'categories'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Categories ({APPROVED_CATEGORIES.length})
            </button>
            <button
              onClick={() => setActiveTabTaxonomy('auth')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTabTaxonomy === 'auth'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Auth Methods ({APPROVED_AUTH_METHODS.length})
            </button>
            <button
              onClick={() => setActiveTabTaxonomy('features')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTabTaxonomy === 'features'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Features ({APPROVED_FEATURES.length})
            </button>
          </div>
        </div>

        <div className="pt-2">
          {activeTabTaxonomy === 'countries' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {APPROVED_COUNTRIES.map((c) => (
                  <div key={c} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white block">{c}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                <strong>Standardised Aliases:</strong> USA &rarr; United States, UK &rarr; United Kingdom, UAE &rarr; United Arab Emirates, RSA &rarr; South Africa, Korea &rarr; South Korea, Brasil &rarr; Brazil.
              </div>
            </div>
          )}

          {activeTabTaxonomy === 'categories' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {APPROVED_CATEGORIES.map((cat) => (
                <div key={cat} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white block">{cat}</span>
                </div>
              ))}
            </div>
          )}

          {activeTabTaxonomy === 'auth' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {APPROVED_AUTH_METHODS.map((m) => (
                <div key={m} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white block">{m}</span>
                </div>
              ))}
            </div>
          )}

          {activeTabTaxonomy === 'features' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {APPROVED_FEATURES.map((f) => (
                <div key={f} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white block">{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
