import React, { useState } from 'react';
import { 
  HelpCircle, 
  RefreshCw, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  ArrowRight, 
  Sliders, 
  ShieldQuestion,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
  Info
} from 'lucide-react';
import { MultiDimConfidence, CounterfactualAnalysis } from '../types';

interface ConfidencePanelProps {
  conditionShifts?: string[];
  confidenceModel?: MultiDimConfidence;
  counterfactual?: CounterfactualAnalysis;
  onOpenRobustnessModal?: () => void;
}

export const ConfidencePanel: React.FC<ConfidencePanelProps> = ({ 
  conditionShifts = [],
  confidenceModel,
  counterfactual,
  onOpenRobustnessModal,
}) => {
  const [activeSimulation, setActiveSimulation] = useState<number | null>(null);

  const simulationOutcomes = [
    {
      condition: 'Product A recovered without intervention (orders cleared naturally in 30 days)',
      impact: 'Recommendation switches to "Stand Down Intervention" and re-allocates field budget to Product B expansion.',
      newConfidence: 'HIGH',
      newOption: 'Option B / Organic Monitoring',
    },
    {
      condition: 'Region South decline was caused by a temporary event (e.g., regional logistics strike)',
      impact: 'Recommendation shifts to "Logistics Buffer Compensation" rather than discounting or pricing intervention.',
      newConfidence: 'MEDIUM',
      newOption: 'Option D / Operational Buffer',
    },
    {
      condition: 'Competitor pricing returned to normal (promotional blitz terminated)',
      impact: 'Recommendation downgrades price intervention and retains standard price integrity without discounting.',
      newConfidence: 'HIGH',
      newOption: 'Option A / Baseline Stability',
    },
    {
      condition: 'Margin impact from intervention became unacceptable (>25% gross margin erosion)',
      impact: 'Recommendation switches immediately to Option B (marketing-only awareness) to prevent margin collapse.',
      newConfidence: 'MEDIUM-HIGH',
      newOption: 'Option B (Marketing Lift)',
    },
  ];

  const breakdown = confidenceModel?.breakdown || {
    dataQuality: 0,
    evidenceVerification: 0,
    evidenceCoverage: 0,
    claimVerification: 0,
    evidenceConsistency: 0,
    sourceCompleteness: 0,
    analysisReliability: 0,
    missingRequiredInputs: 0,
    conflictingEvidence: 0,
    externalEvidenceReliability: 0,
    forecastReliability: 0,
    assumptionStability: 0,
    contradictionPenalty: 100,
    scenarioRobustness: 0,
  };

  const overallScore = confidenceModel?.overallScore ?? 0;
  const confidenceLevel = confidenceModel?.level ?? 'DATA INSUFFICIENT';

  return (
    <section 
      id="confidence-uncertainty-section"
      aria-label="Confidence and decision limits"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            How confident are we?
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Confidence, limits, and what could change the decision
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A score based on data quality, verified evidence, source coverage, and scenario checks. The detail below shows how it was calculated.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs font-bold">
            <span>{confidenceLevel} · {overallScore}% supported by the current evidence</span>
          </div>
          {onOpenRobustnessModal && (
            <button
              type="button"
              onClick={onOpenRobustnessModal}
              className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Test if a source is removed</span>
            </button>
          )}
        </div>
      </div>

      {/* 8-Dimensional Confidence Breakdown Visualizer */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>What makes up the score</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Every component is calculated from this investigation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Data Quality</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-indigo-300 text-sm">{breakdown.dataQuality}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 16%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${breakdown.dataQuality}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Claim Verification</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-emerald-300 text-sm">{breakdown.claimVerification}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 16%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${breakdown.claimVerification}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Evidence Coverage</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-cyan-300 text-sm">{breakdown.evidenceCoverage}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 16%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${breakdown.evidenceCoverage}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Evidence Consistency</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-amber-300 text-sm">{breakdown.evidenceConsistency}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 14%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${breakdown.evidenceConsistency}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">5. Source Completeness</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-purple-300 text-sm">{breakdown.sourceCompleteness}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 12%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-400 h-full rounded-full" style={{ width: `${breakdown.sourceCompleteness}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">6. Analysis Reliability</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-blue-300 text-sm">{breakdown.analysisReliability}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 12%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-400 h-full rounded-full" style={{ width: `${breakdown.analysisReliability}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">7. Missing Required Inputs</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-teal-300 text-sm">{breakdown.missingRequiredInputs}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 7%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-teal-400 h-full rounded-full" style={{ width: `${breakdown.missingRequiredInputs}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-rose-400 uppercase font-bold block">8. Conflicting Evidence</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-rose-400 text-sm">{breakdown.conflictingEvidence}%</span>
              <span className="text-[10px] text-slate-500 font-mono">wt 7%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-rose-400 h-full rounded-full" style={{ width: `${breakdown.conflictingEvidence}%` }} />
            </div>
          </div>
        </div>

        {/* Boosters vs Reducers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>What supports this score</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              {(confidenceModel?.topBoosters || []).map((b, idx) => <li key={idx}>{b}</li>)}
            </ul>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/30 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>What limits this score</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              {(confidenceModel?.topReducers || []).map((r, idx) => <li key={idx}>{r}</li>)}
            </ul>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
          <span className="font-bold text-cyan-300 uppercase tracking-wide">How the score was calculated</span>
          {Object.entries(confidenceModel?.explanations || {}).map(([dimension, explanation]) => (
            <p key={dimension} className="text-slate-300"><strong className="text-slate-400">{dimension}:</strong> {explanation}</p>
          ))}
        </div>

        {/* Epistemic Caveat Banner */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {confidenceModel?.epistemicCaveat || 'DATA INSUFFICIENT: no calculated evidence-based decision confidence is available.'}
          </span>
        </div>
      </div>

      {/* Falsification Conditions Simulation */}
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <ShieldQuestion className="w-4 h-4 text-amber-400" />
          <span>What would change the recommendation?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {conditionShifts.map((condition, idx) => {
            const isSimulated = activeSimulation === idx;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isSimulated
                    ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                      REV-0{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-100">
                      {condition}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveSimulation(isSimulated ? null : idx)}
                    className="shrink-0 text-xs text-amber-400 hover:text-amber-300 font-semibold underline transition-colors"
                  >
                    {isSimulated ? 'Reset' : 'Simulate'}
                  </button>
                </div>

                {isSimulated && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 text-xs text-amber-200/90 space-y-1.5 bg-amber-950/40 p-2.5 rounded-lg">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-amber-300 font-bold">Simulated Policy Reversal:</span>
                      <span className="text-white font-bold">{simulationOutcomes[idx]?.newOption}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {simulationOutcomes[idx]?.impact}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
