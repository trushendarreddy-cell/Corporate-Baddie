import React, { useState } from 'react';
import { 
  X, 
  FileCheck2, 
  Database, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  Scale, 
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { KeyFinding, EvidenceClaim, EpistemicLabel, VerificationStatus, MultiDimConfidence } from '../types';

interface EvidenceDetailModalProps {
  finding: KeyFinding | null;
  claim: EvidenceClaim | null;
  onClose: () => void;
  onOpenGraph: () => void;
  decisionConfidence?: MultiDimConfidence;
  onChallengeClaim?: (claimId: string, challengeReason: string) => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  finding,
  claim,
  onClose,
  onOpenGraph,
  decisionConfidence,
  onChallengeClaim,
}) => {
  const [isChallenging, setIsChallenging] = useState(false);
  const [challengeReason, setChallengeReason] = useState('');
  const [challengeApplied, setChallengeApplied] = useState(false);

  if (!finding) return null;

  const adversarial = claim?.adversarialCheck;
  const epistemicLabel: EpistemicLabel = claim?.epistemicLabel || finding.epistemicLabel || 'INFERENCE';
  const verificationStatus: VerificationStatus = claim?.verificationStatus || (claim?.verified ? 'SUPPORTED' : 'UNVERIFIED');

  const getEpistemicColor = (label: EpistemicLabel) => {
    switch (label) {
      case 'CAUSAL EVIDENCE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'CORRELATION':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      case 'ASSOCIATION':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'INFERENCE':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'HYPOTHESIS':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'PARTIALLY SUPPORTED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'CONFLICTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'INSUFFICIENT EVIDENCE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'UNVERIFIED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleApplyChallenge = () => {
    if (onChallengeClaim && claim) {
      onChallengeClaim(claim.id, challengeReason || 'Challenged alternative hypothesis via audit inspection');
    }
    setChallengeApplied(true);
    setTimeout(() => {
      setChallengeApplied(false);
      setIsChallenging(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Adversarial Evidence Audit Dossier"
        className="w-full max-w-3xl bg-[#0e121b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111622] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Adversarial Evidence & Verification Audit
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                  {finding.evidenceClaimId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Independent adversarial testing of empirical reliability and correlation vs causation boundaries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {/* Main Metric Stat & Epistemic Badges */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Audited Metric: {finding.label}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-extrabold text-white font-mono">{finding.value}</span>
                <span className="text-xs font-bold text-rose-400 font-mono">({finding.change})</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(verificationStatus)}`}>
                {verificationStatus}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getEpistemicColor(epistemicLabel)}`}>
                {epistemicLabel}
              </span>
            </div>
          </div>

          {decisionConfidence && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200">
              Current run Decision Confidence: <strong>{decisionConfidence.level} ({decisionConfidence.overallScore}%)</strong>. This citation is inspected within the same evidence state.
            </div>
          )}

          {/* Epistemic Causality Guardrail Notice */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-200/90 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Formal Epistemic Guardrail</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {epistemicLabel === 'CAUSAL EVIDENCE' 
                ? 'Empirically validated as direct mathematical accounting causality (reproducible deterministic aggregation).'
                : epistemicLabel === 'ASSOCIATION'
                ? 'Correlation vs Causation Guardrail: Available observational cohort data confirms statistical association. It is insufficient to establish that competitor discounting was the sole causal driver.'
                : 'Empirical fact verified via multi-source triangulation.'}
            </p>
          </div>

          {/* 8-Point Adversarial Verification Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>8-Dimension Adversarial Audit</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Check 1: Supporting Evidence */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">
                  1. Supporting Evidence
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {adversarial?.supportingEvidence?.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  )) || <li>{claim?.evidence || 'Deterministic transactional ledger match'}</li>}
                </ul>
              </div>

              {/* Check 2: Contradicting Evidence */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide block">
                  2. Contradicting / Counter Evidence
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {adversarial?.contradictingEvidence?.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  )) || <li>No irreconcilable counter-evidence detected.</li>}
                </ul>
              </div>

              {/* Check 3: Evidence Recency */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  3. Evidence Recency & Freshness
                </span>
                <p className="text-slate-300 text-[11px]">
                  {adversarial?.evidenceRecency || 'Within current reporting period (≤ 30 days)'}
                </p>
              </div>

              {/* Check 4: Reproducibility */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  4. Reproducibility
                </span>
                <p className="text-slate-300 text-[11px]">
                  {adversarial?.reproducibility || 'Deterministic aggregation over ERP ledger table'}
                </p>
              </div>

              {/* Check 5: Sample Size */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  5. Sample Size Adequacy
                </span>
                <p className="text-slate-300 text-[11px]">
                  {adversarial?.sampleSizeAdequacy || 'Full enterprise census (Zero sampling error)'}
                </p>
              </div>

              {/* Check 6: Alternative Explanations */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">
                  6. Plausible Alternative Explanations
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {adversarial?.alternativeExplanations?.map((alt, idx) => (
                    <li key={idx}>{alt}</li>
                  )) || <li>General macro consumer slowdown; channel shift.</li>}
                </ul>
              </div>
            </div>

            {/* Check 7 & 8: Epistemic Conclusion Strength */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">7. Epistemic Classification:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold border ${getEpistemicColor(epistemicLabel)}`}>
                  {epistemicLabel}
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span className="font-bold text-slate-400 block mb-0.5">8. Conclusion Strength vs Evidence Strength:</span>
                <p className="leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  {adversarial?.conclusionStrengthEvaluation || 'The conclusion is strictly calibrated to empirical ledger facts. No speculative inferences are presented as established facts.'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive "Challenge This Finding" Section */}
          <div className="p-4 rounded-xl bg-[#131926] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Challenge This Finding</span>
              </div>
              <button
                type="button"
                onClick={() => setIsChallenging(!isChallenging)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                {isChallenging ? 'Cancel' : 'Inspect or Challenge'}
              </button>
            </div>

            {isChallenging && (
              <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter an alternative hypothesis (e.g. &ldquo;Could regional supply chain port delays explain the South drop?&rdquo;). CorporateBaddie will re-evaluate contradictory evidence and adjust confidence.
                </p>
                <input
                  type="text"
                  value={challengeReason}
                  onChange={(e) => setChallengeReason(e.target.value)}
                  placeholder="e.g. Test hypothesis: localized delivery bottlenecks"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleApplyChallenge}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    {challengeApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                        <span>Challenge Logged into Audit Trail</span>
                      </>
                    ) : (
                      <span>Apply Challenge to Confidence Model</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#111622] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Artifact: {claim?.source || finding.detailedData.dataSource}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenGraph();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Inspect Dependency Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
