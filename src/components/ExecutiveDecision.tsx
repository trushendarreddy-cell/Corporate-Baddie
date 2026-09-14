import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Info, 
  ArrowRight, 
  SlidersHorizontal,
  Download,
  AlertCircle,
  Database,
  History,
  RotateCcw,
  Scale,
  FlaskConical,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { UnifiedInvestigationState, CitationRef } from '../types';
import { GroundedText } from './GroundedText';

interface ExecutiveDecisionProps {
  state: UnifiedInvestigationState;
  onOpenEvidenceGraph: () => void;
  onExportBrief: () => void;
  onSelectCitation?: (citation: CitationRef) => void;
  onOpenVersionHistory?: () => void;
  onOpenRobustnessModal?: () => void;
}

export const ExecutiveDecision: React.FC<ExecutiveDecisionProps> = ({
  state,
  onOpenEvidenceGraph,
  onExportBrief,
  onSelectCitation,
  onOpenVersionHistory,
  onOpenRobustnessModal,
}) => {
  const [showCounterfactual, setShowCounterfactual] = useState(true);

  // Dynamic grounded text with citations
  const hasDefensibleEvidence = state.recommendationConfidence.level !== 'DATA INSUFFICIENT';
  const recTextWithCitations = 
    hasDefensibleEvidence
      ? "Execute targeted commercial intervention on Product A in Region South [D2, D3], combining an 8% promotional bundle with ₹2.8L in dealer co-op marketing [S3], rather than broad company-wide discounting [D1]."
      : "PAUSE CAPITAL ALLOCATION: Sales Transaction Ledger [S1] is currently deactivated. Re-connect src-1 to re-establish verified empirical baseline before authorizing commercial interventions.";

  const explanationWithCitations = 
    hasDefensibleEvidence
      ? "Our empirical decomposition reveals that 68.2% of the total revenue contraction is concentrated in Product A [D2], with Region South acting as the primary geographical epicenter (58.6% cross-dimensional interaction) [D3]. Competitor A launched an 18% promotional blitz targeting South tier-2 dealers [M1], driving a decline in 90-day repeat customer retention from 48.2% to 39.7% [D4]. Broad discounting would needlessly sacrifice margin across healthy categories [D1]."
      : "Recommendation confidence is severely impaired due to deactivated data sources. Proceeding with commercial spend without transaction ledger parity carries critical financial risk.";

  const counterfactual = state.counterfactual;

  const getRobustnessBadge = (rating: 'ROBUST' | 'SENSITIVE' | 'FRAGILE') => {
    switch (rating) {
      case 'ROBUST':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SENSITIVE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'FRAGILE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section 
      id="executive-decision-summary"
      aria-label="Executive Decision Synthesis"
      className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#16130e] via-[#0f1118] to-[#0b0e14] p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decision-ready banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Decision ready
          </span>
          <span className="text-amber-200/80 hidden sm:inline">
            — We separate facts from assumptions before recommending a move.
          </span>
        </div>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
          EVIDENCE-BASED
        </span>
      </div>

      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Decision ready
            </span>
            <h2 className="text-sm font-semibold text-slate-300">
              WHAT WE RECOMMEND
            </h2>
          </div>
        </div>

        {/* Confidence & Evidence Calibration Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Data quality</span>
            <span className="font-mono font-bold text-indigo-300">{state.dataQuality.overallPercent}%</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">How confident we are</span>
            <span className="text-xs font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {state.recommendationConfidence.level} ({state.recommendationConfidence.overallScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* Large Recommendation Box with Clickable Reference Badges */}
      <div className="p-5 sm:p-6 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner space-y-4">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
          &ldquo;
          <GroundedText 
            text={recTextWithCitations} 
            onSelectCitation={onSelectCitation} 
          />
          &rdquo;
        </h3>

        {/* Explanation with Grounded Reference Badges */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
          <GroundedText 
            text={explanationWithCitations} 
            onSelectCitation={onSelectCitation} 
          />
        </p>

        {/* Reference Badges Legend Bar */}
        <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Evidence references:</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-indigo-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> [S#] Data Ingestion
            </span>
            <span className="inline-flex items-center gap-1 text-amber-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> [D#] Dataset Finding
            </span>
            <span className="inline-flex items-center gap-1 text-cyan-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> [M#] Market Intel
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> [C#] Verified Claim
            </span>
          </div>
        </div>
      </div>

      {/* Counterfactual Recommendation Agent: "WHAT WOULD CHANGE MY RECOMMENDATION?" */}
      <div className="rounded-xl border border-slate-800 bg-[#0c1018] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCounterfactual(!showCounterfactual)}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Counterfactual Analysis: What Would Change This Recommendation?
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRobustnessBadge(counterfactual.robustnessRating)}`}>
                  {counterfactual.robustnessRating}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Explicit falsifiability criteria, reversal triggers, and smallest safe validation experiment
              </p>
            </div>
          </div>

          <div className="text-slate-400">
            {showCounterfactual ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showCounterfactual && (
          <div className="p-4 sm:p-5 border-t border-slate-800/80 space-y-4 text-xs bg-slate-950/40">
            {/* Grid of Counterfactual Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Why Preferred & Evidence Advantage */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="font-bold text-cyan-300 block">
                  Why is this option preferred over alternatives?
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {counterfactual.whyPreferred}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Evidence advantage: </span>
                  {counterfactual.evidenceAdvantageOverAlternatives}
                </div>
              </div>

              {/* 2. Critical Assumptions */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="font-bold text-amber-300 block">
                  What core assumptions does it depend on?
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {counterfactual.dependentAssumptions.map((assump, idx) => (
                    <li key={idx}>{assump}</li>
                  ))}
                </ul>
              </div>

              {/* 3. Reversal Triggers */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="font-bold text-rose-400 block">
                  What evidence would cause CorporateBaddie to choose another option?
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {counterfactual.reversalTriggers.map((trig, idx) => (
                    <li key={idx}>{trig}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Inaction Downside & Safe Experiment */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-300 block">
                    Downside of doing nothing:
                  </span>
                  <p className="text-rose-300 text-[11px] leading-relaxed">
                    {counterfactual.inactionDownside}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Smallest Safe Experiment (Validation Pilot):</span>
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {counterfactual.smallestSafeExperiment}
                  </p>
                </div>
              </div>
            </div>

            {/* Robustness Assessment Status Bar */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Current Recommendation Sensitivity: <strong className="text-white">Holds firmly under verified 78k row transaction facts.</strong>
              </span>
              {onOpenRobustnessModal && (
                <button
                  type="button"
                  onClick={onOpenRobustnessModal}
                  className="px-3 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Run Decision Robustness Test (Drop Source)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Synthesized from {state.claims.length} audited evidence claims across ERP, CRM, and category competitor telemetry.</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenVersionHistory && (
            <button
              type="button"
              onClick={onOpenVersionHistory}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Version History</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenEvidenceGraph}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Evidence Graph</span>
          </button>

          <button
            type="button"
            onClick={onExportBrief}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary (PDF)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
