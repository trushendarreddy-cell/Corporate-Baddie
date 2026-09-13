import React from 'react';
import { 
  ArrowDown, 
  AlertOctagon, 
  CheckCircle2, 
  GitBranch, 
  ShieldAlert, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { ClaimType } from '../types';

interface RootCauseInvestigationProps {
  chain: {
    step: number;
    title: string;
    description: string;
    type: ClaimType;
    evidenceRef: string;
  }[];
  onSelectClaim?: (claimId: string) => void;
}

export const RootCauseInvestigation: React.FC<RootCauseInvestigationProps> = ({
  chain,
  onSelectClaim,
}) => {
  const getTypeBadge = (type: ClaimType) => {
    switch (type) {
      case 'FACT':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            FACT
          </span>
        );
      case 'INFERENCE':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/70 text-amber-300 border border-amber-800/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            INFERENCE
          </span>
        );
      case 'EXTERNAL FACT':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-950/70 text-purple-300 border border-purple-800/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            EXTERNAL FACT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {type}
          </span>
        );
    }
  };

  return (
    <section 
      id="root-cause-section"
      aria-label="Root Cause Investigation"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Section 4 · Causal Decomposition Chain
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-amber-400" />
            ROOT CAUSE INVESTIGATION
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step diagnostic link from consolidated top-line down to operational drivers
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="text-slate-500 font-medium">Classifications:</span>
          {getTypeBadge('FACT')}
          {getTypeBadge('INFERENCE')}
          {getTypeBadge('EXTERNAL FACT')}
        </div>
      </div>

      {/* Prominent Anti-Slop / Causal Integrity Banner */}
      <div className="mb-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300 block mb-0.5">
            Causal Inference Note: Correlation Does Not Automatically Prove Causation
          </span>
          CorporateBaddie rigorously distinguishes between observed data ledgers (FACTS), statistical deductions (INFERENCES), and third-party benchmark signals (EXTERNAL FACTS). Confounding regional variables were tested to isolate Product A price sensitivity.
        </div>
      </div>

      {/* Investigation Chain */}
      <div className="relative max-w-3xl mx-auto space-y-4 py-2">
        {chain.map((item, index) => {
          const isLast = index === chain.length - 1;

          return (
            <div key={item.step} className="relative">
              {/* Card */}
              <div className="bg-[#121622] hover:bg-[#151b2a] border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all shadow-md relative group">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-amber-400">
                      {item.step}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div>{getTypeBadge(item.type)}</div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate max-w-md">{item.evidenceRef}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Audited
                  </span>
                </div>
              </div>

              {/* Connecting Arrow */}
              {!isLast && (
                <div className="flex justify-center my-2 text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
