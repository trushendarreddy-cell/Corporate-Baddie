import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  FileCheck, 
  ArrowRight,
  HelpCircle,
  Zap,
  Terminal
} from 'lucide-react';
import { HOSTILE_AUDIT_CHALLENGES, HostileChallenge } from '../state/hostileAuditData';

interface HostileAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClaim?: (claimId: string) => void;
}

export const HostileAuditModal: React.FC<HostileAuditModalProps> = ({
  isOpen,
  onClose,
  onSelectClaim,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('HA-001');
  const [customChallenge, setCustomChallenge] = useState<string>('');
  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const activeChallenge =
    HOSTILE_AUDIT_CHALLENGES.find((c) => c.id === selectedChallengeId) ||
    HOSTILE_AUDIT_CHALLENGES[0];

  const handleSimulateCustomChallenge = () => {
    if (!customChallenge.trim()) return;
    setCustomResponses((prev) => ({
      ...prev,
      [customChallenge]:
        'CLAIM UNVERIFIED: This challenge has no run-specific evidence mapping yet. The system withheld a verdict and requires a linked dataset, test, and evidence review before continuing.',
    }));
    setCustomChallenge('');
  };

  const getVerdictBadge = (verdict: HostileChallenge['corporateBaddieDefense']['verdict']) => {
    switch (verdict) {
      case 'DEFENDED WITH PROOF':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>DEFENDED WITH PROOF</span>
          </span>
        );
      case 'BOUNDED UNCERTAINTY':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>BOUNDED UNCERTAINTY</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
            {verdict}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Hostile Red-Team Audit"
        className="w-full max-w-5xl max-h-[92vh] bg-[#0c0e15] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-950/40 via-[#141018] to-[#0c0e15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Hostile Red-Team Audit & Adversarial Verification
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Pre-Board Stress Test
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulates aggressive scrutiny from skeptical CFOs, activist investors, and counter-claimants before executive sign-off
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

        {/* 2-Column Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Challenges List (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-[#0a0c12] space-y-3 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Adversarial Challenge Vectors ({HOSTILE_AUDIT_CHALLENGES.length})
            </span>

            <div className="space-y-2">
              {HOSTILE_AUDIT_CHALLENGES.map((ch) => {
                const isSelected = activeChallenge?.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChallengeId(ch.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-rose-500/80 shadow-md shadow-rose-950/30 ring-1 ring-rose-500/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-rose-400">
                        {ch.attackerPersona}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {ch.claimId}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                      &ldquo;{ch.question}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Custom Challenge Box */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Submit Live Hostile Challenge</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Could this be customer return fraud?"
                  value={customChallenge}
                  onChange={(e) => setCustomChallenge(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSimulateCustomChallenge()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
                <button
                  onClick={handleSimulateCustomChallenge}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Test
                </button>
              </div>

              {Object.entries(customResponses).map(([q, ans], idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-rose-300">&ldquo;{q}&rdquo;</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ans}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Defense & Mathematical Proof (7 cols) */}
          <div className="lg:col-span-7 p-6 bg-[#0e121b] flex flex-col justify-between space-y-5 overflow-y-auto">
            {activeChallenge ? (
              <div className="space-y-5 text-xs">
                {/* Challenge Header */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-rose-400 font-bold">
                      Persona: {activeChallenge.attackerPersona}
                    </span>
                    {getVerdictBadge(activeChallenge.corporateBaddieDefense.verdict)}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                    &ldquo;{activeChallenge.question}&rdquo;
                  </h4>
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-200 text-xs">
                    <span className="font-bold text-rose-300 block mb-0.5">Hostile Hypothesis:</span>
                    {activeChallenge.hostileHypothesis}
                  </div>
                </div>

                {/* Proof & Evidentiary Defense */}
                <div className="space-y-4">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>CorporateBaddie Epistemic Proof:</span>
                    </span>
                    <p className="text-slate-200 bg-slate-950/80 p-4 rounded-xl border border-slate-800 leading-relaxed text-xs sm:text-sm">
                      {activeChallenge.corporateBaddieDefense.evidentiaryProof}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                        Supporting Dataset Anchor
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {activeChallenge.corporateBaddieDefense.supportingDatasetRef}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase block">
                        Statistical Verification Test
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {activeChallenge.corporateBaddieDefense.mathematicalTestUsed}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Confidence Calibration Impact:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {activeChallenge.corporateBaddieDefense.confidenceAdjustment}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>CorporateBaddie Principle #1: Evidence over eloquence.</span>
              {onSelectClaim && activeChallenge && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectClaim(activeChallenge.claimId);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  View Claim in Evidence Graph →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
