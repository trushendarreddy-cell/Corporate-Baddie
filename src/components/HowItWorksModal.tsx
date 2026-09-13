import React from 'react';
import { 
  X, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  LayoutDashboard, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    { num: '01', title: 'Understand', desc: 'Parses the business question into diagnostic and prescriptive objectives without superficial chatbot fluff.' },
    { num: '02', title: 'Plan Investigation', desc: 'Builds targeted hypotheses across pricing elasticity, customer cohort churn, and territory friction.' },
    { num: '03', title: 'Analyze Internal Data', desc: 'Ingests transaction ledgers, computes contribution deltas, and isolates variance hotspots.' },
    { num: '04', title: 'Investigate Root Causes', desc: 'Traces the causal failure chain. Dissects what is an empirical fact versus statistical inference.' },
    { num: '05', title: 'Research Current Market Context', desc: 'Queries competitor pricing benchmarks and macro territory indicators for external corroboration.' },
    { num: '06', title: 'Verify Evidence', desc: 'Audits every claim with confidence bounds and cryptographic DAG traceability.' },
    { num: '07', title: 'Evaluate Options', desc: 'Scores multi-vector interventions across capital efficiency, feasibility, risk, and strategic fit.' },
    { num: '08', title: 'Recommend a Decision', desc: 'Formulates an unambiguous executive recommendation, stating exactly what would change its mind.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="How CorporateBaddie Works"
        className="w-full max-w-3xl max-h-[90vh] bg-[#0c0e15] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#10141f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                How CorporateBaddie Works
              </h3>
              <p className="text-xs text-amber-300/90 font-medium">
                "Making Sense of Corporate Nonsense" — Agentic Decision Intelligence
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Comparison Cards: Chatbot vs Dashboard vs CorporateBaddie */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 opacity-60">
              <div className="flex items-center gap-2 text-slate-400 font-bold mb-1">
                <Bot className="w-4 h-4" />
                <span>Generic AI Chatbot</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Spits out conversational corporate babble, hallucinates citations, and has no verifiable connection to financial ledgers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 opacity-60">
              <div className="flex items-center gap-2 text-slate-400 font-bold mb-1">
                <LayoutDashboard className="w-4 h-4" />
                <span>Static BI Dashboard</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Shows 40 crowded charts telling you sales dropped 14%, but doesn't tell you why or what management should do next.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/50 text-slate-200 ring-1 ring-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>CORPORATEBADDIE</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                An AI business analyst that investigates internal ledgers, researches markets, verifies facts, and prescribes high-ROI decisions.
              </p>
            </div>
          </div>

          {/* 8-Step Lifecycle */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <span>The 8-Stage Causal Decision Loop</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {steps.map((s) => (
                <div key={s.num} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="font-mono font-bold text-amber-400 text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                    {s.num}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs mb-0.5">{s.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Epistemic Humility Guarantee */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">
                Epistemic Humility & Falsification Principle
              </span>
              CorporateBaddie explicitly communicates uncertainty. It never pretends to know everything, separates correlation from causation, and publishes exact condition triggers that would reverse its recommendation.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0e15] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
