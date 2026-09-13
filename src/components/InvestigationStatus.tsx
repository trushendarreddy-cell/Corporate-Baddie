import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  Database, 
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { InvestigationState } from '../types';

interface InvestigationStatusProps {
  state: InvestigationState;
  onOpenEvidenceGraph: () => void;
  decisionConfidence?: { overallScore: number; level: string };
  compact?: boolean;
}

export const InvestigationStatus: React.FC<InvestigationStatusProps> = ({
  state,
  onOpenEvidenceGraph,
    decisionConfidence,
  compact = false,
}) => {
  return (
    <section 
      aria-label="Investigation Status Panel"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-xl p-4 shadow-xl shadow-black/40 relative overflow-hidden"
    >
      {/* Subtle analytical gradient border highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/80 via-emerald-500/60 to-indigo-500/40" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Run Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Investigation Status
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Run ID:</span>
            <span className="font-mono font-semibold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
              {state.runId}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Question Type:</span>
            <span className="text-slate-200 font-medium px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/60">
              {state.questionType}
            </span>
          </div>
        </div>

        {/* Quick link to Evidence Graph */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <button
            onClick={onOpenEvidenceGraph}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>Audit Evidence Graph</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400/70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-800/70 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
        {/* Data Quality */}
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">Data Quality</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono text-slate-100">{state.dataQualityPercent}%</span>
            <span className="text-[10px] text-emerald-400 font-medium">Audited</span>
          </div>
        </div>

        {/* Evidence Claims */}
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Evidence Claims</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono text-slate-100">{state.evidenceClaimsCount}</span>
            <span className="text-[10px] text-slate-400">synthesized</span>
          </div>
        </div>

        {/* Verified Claims */}
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Verified Claims</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono text-emerald-400">{state.verifiedClaimsCount}</span>
            <span className="text-[10px] text-slate-400">/ {state.evidenceClaimsCount} grounded</span>
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Warnings</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono text-amber-400">{state.warningsCount}</span>
            <span className="text-[10px] text-amber-400/80">flagged</span>
          </div>
        </div>

        {/* Overall Confidence */}
        <div className="col-span-2 sm:col-span-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">Overall Confidence</span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-300">
              {state.confidenceScore}%
                          {decisionConfidence?.overallScore ?? state.confidenceScore}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {state.overallConfidence}
                          {decisionConfidence?.level ?? state.overallConfidence}
                            width: `${decisionConfidence?.overallScore ?? state.confidenceScore}%`,
            </span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                style={{ width: `${state.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
