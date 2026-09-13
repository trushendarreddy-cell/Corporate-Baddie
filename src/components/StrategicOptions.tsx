import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Sliders,
  DollarSign,
  Scale
} from 'lucide-react';
import { StrategicOption } from '../types';

interface StrategicOptionsProps {
  options: StrategicOption[];
  onSelectOption?: (optionId: 'A' | 'B' | 'C') => void;
}

export const StrategicOptions: React.FC<StrategicOptionsProps> = ({
  options,
  onSelectOption,
}) => {
  const [expandedOption, setExpandedOption] = useState<'A' | 'B' | 'C' | null>('C');

  const toggleExpand = (id: string) => {
    setExpandedOption(expandedOption === id ? null : (id as 'A' | 'B' | 'C'));
  };

  const getScoreBar = (score: number, max = 10, isHighlight = false) => {
    const percent = (score / max) * 100;
    return (
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            isHighlight
              ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
              : 'bg-slate-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  return (
    <section 
      id="strategic-options-section"
      aria-label="Strategic Options"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Section 6 · Prescriptive Decision Matrix
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            STRATEGIC OPTIONS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tradeoff evaluation across impact, capital requirements, evidence strength, and risk bounds
          </p>
        </div>

        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1 rounded-lg">
          Option C Recommended
        </span>
      </div>

      {/* 3 Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {options.map((opt) => {
          const isRec = opt.isRecommended;
          const isExpanded = expandedOption === opt.id;

          return (
            <div
              key={opt.id}
              className={`rounded-xl p-5 flex flex-col justify-between transition-all relative ${
                isRec
                  ? 'bg-gradient-to-b from-[#141d2e] to-[#0f1422] border-2 border-amber-500/80 ring-2 ring-amber-500/20 shadow-2xl shadow-amber-950/30'
                  : 'bg-[#121622] border border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Recommended Badge on Top Right */}
              {isRec && (
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  RECOMMENDED DECISION
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                      isRec
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <h3 className="font-bold text-base text-white">
                    {opt.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {opt.description}
                </p>

                {/* Badges: Impact, Risk, Feasibility */}
                <div className="grid grid-cols-3 gap-1.5 mb-5 text-[11px] text-center">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Impact</span>
                    <span className="font-bold text-white">{opt.impact}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Risk</span>
                    <span className={`font-bold ${opt.risk === 'High' ? 'text-rose-400' : opt.risk.includes('Low') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {opt.risk}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Feasibility</span>
                    <span className="font-bold text-white">{opt.feasibility}</span>
                  </div>
                </div>

                {/* Score Breakdown (1-10) */}
                <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-4 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Multi-Vector Evaluation (Score / 10)
                  </span>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Impact Potential</span>
                      <span className="font-mono font-semibold text-white">{opt.scores.impact}/10</span>
                    </div>
                    {getScoreBar(opt.scores.impact, 10, isRec)}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Evidence Grounding</span>
                      <span className="font-mono font-semibold text-white">{opt.scores.evidenceStrength}/10</span>
                    </div>
                    {getScoreBar(opt.scores.evidenceStrength, 10, isRec)}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Execution Feasibility</span>
                      <span className="font-mono font-semibold text-white">{opt.scores.feasibility}/10</span>
                    </div>
                    {getScoreBar(opt.scores.feasibility, 10, isRec)}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Risk Safety</span>
                      <span className="font-mono font-semibold text-white">{opt.scores.risk}/10</span>
                    </div>
                    {getScoreBar(opt.scores.risk, 10, isRec)}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Capital Efficiency (Cost)</span>
                      <span className="font-mono font-semibold text-white">{opt.scores.cost}/10</span>
                    </div>
                    {getScoreBar(opt.scores.cost, 10, isRec)}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Strategic Fit</span>
                      <span className="font-mono font-semibold text-white">{opt.scores.strategicFit}/10</span>
                    </div>
                    {getScoreBar(opt.scores.strategicFit, 10, isRec)}
                  </div>
                </div>

                {/* Collapsible Pros, Cons, and Projected Outcome */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-emerald-400 font-bold block mb-1">Advantages:</span>
                      <ul className="space-y-1 text-slate-300">
                        {opt.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-rose-400 font-bold block mb-1">Disadvantages / Liabilities:</span>
                      <ul className="space-y-1 text-slate-300">
                        {opt.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">✗</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-amber-300 font-semibold block mb-0.5">Projected Result:</span>
                      <span className="text-[11px]">{opt.projectedOutcome}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Toggle Button */}
              <button
                type="button"
                onClick={() => toggleExpand(opt.id)}
                className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <span>{isExpanded ? 'Hide Pro/Con Details' : 'View Pro/Con & Financial Projections'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
