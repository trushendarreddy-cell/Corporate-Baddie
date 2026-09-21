import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Clock,
  Eye,
  Activity,
  Flame,
  Compass,
} from 'lucide-react';
import { FAILURE_PROFILES, OptionFailureProfile, FailureMode, getFailureProfileForOption } from '../state/failureEngine';

interface FailureModeInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOptionId?: string;
}

export const FailureModeInspector: React.FC<FailureModeInspectorProps> = ({
  isOpen,
  onClose,
  selectedOptionId = 'opt-1',
}) => {
  const [activeOptionId, setActiveOptionId] = useState<string>(selectedOptionId);
  const [selectedFailureId, setSelectedFailureId] = useState<string | null>(null);

  if (!isOpen) return null;

  const profile: OptionFailureProfile = getFailureProfileForOption(activeOptionId);

  const activeFailure =
    profile.failureModes.find((f) => f.id === selectedFailureId) ||
    profile.failureModes[0];

  const getSeverityBadge = (severity: FailureMode['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Failure Mode & Pre-Mortem Inspector"
        className="w-full max-w-5xl max-h-[92vh] bg-[#0c0e15] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-950/30 via-[#14121a] to-[#0c0e15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Failure Mode & Pre-Mortem Stress Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Epistemic Blind Spots
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Identifies how a decision could fail before execution: grey-market contagion, competitor escalation, and margin drag
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {Object.values(FAILURE_PROFILES).map((p) => (
              <button
                key={p.optionId}
                onClick={() => {
                  setActiveOptionId(p.optionId);
                  setSelectedFailureId(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeOptionId === p.optionId
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p.optionName.split('(')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">Vulnerability Index:</span>
            <span className={`font-bold ${profile.overallVulnerabilityScore < 40 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {profile.overallVulnerabilityScore}/100 {profile.overallVulnerabilityScore < 40 ? '(Low Risk)' : '(Elevated Risk)'}
            </span>
          </div>
        </div>

        {/* 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Failure Modes List */}
          <div className="lg:col-span-5 p-5 bg-[#0a0c12] space-y-3 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Anticipated Failure Modes ({profile.failureModes.length})
            </span>

            <div className="space-y-2">
              {profile.failureModes.map((fm) => {
                const isSelected = activeFailure?.id === fm.id;
                return (
                  <div
                    key={fm.id}
                    onClick={() => setSelectedFailureId(fm.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-orange-500/80 shadow-md shadow-orange-950/30 ring-1 ring-orange-500/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getSeverityBadge(fm.severity)}`}>
                        {fm.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {fm.probabilityPercent}% probability
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                      {fm.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {fm.triggerCondition}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Worst Case Card */}
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1 text-xs">
              <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Worst-Case Downside Model</span>
              </span>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                {profile.worstCaseDownside}
              </p>
            </div>
          </div>

          {/* Right Column: Pre-Mortem Deep Dive */}
          <div className="lg:col-span-7 p-6 bg-[#0e121b] flex flex-col justify-between space-y-5 overflow-y-auto">
            {activeFailure ? (
              <div className="space-y-5 text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-orange-400 font-bold">
                      Category: {activeFailure.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(activeFailure.severity)}`}>
                      {activeFailure.severity} · {activeFailure.probabilityPercent}% Probability
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {activeFailure.title}
                  </h4>
                  <div className="mt-2 text-slate-300 text-xs">
                    <strong className="text-slate-400">Trigger Threshold: </strong>
                    {activeFailure.triggerCondition}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Pre-Mortem Scenario */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pre-Mortem Simulation: &ldquo;How We Failed&rdquo;</span>
                    </span>
                    <p className="text-slate-200 text-xs leading-relaxed italic">
                      &ldquo;{activeFailure.preMortemNarrative}&rdquo;
                    </p>
                  </div>

                  {/* Early Warning Signal */}
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Early Warning Indicator (Tripwire):</span>
                    </span>
                    <p className="text-slate-300 text-xs">
                      {activeFailure.earlyWarningSignal}
                    </p>
                  </div>

                  {/* Mitigation Protocol */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mitigation Protocol (Enforced Guardrail):</span>
                    </span>
                    <p className="text-emerald-200/90 text-xs leading-relaxed">
                      {activeFailure.mitigationProtocol}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              CorporateBaddie Principle #5: Uncertainty is information. Quantify and bound downside before execution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
