import React from 'react';
import {
  ArrowRight,
  FileSearch,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  History,
  Scale,
  Play,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  UnifiedInvestigationState,
  InvestigationRun,
  DecisionRoomOption,
} from '../../types';
import { DECISION_ROOM_OPTIONS } from '../../mockData';
import { ConfidenceRing } from './ConfidenceRing';
import { DecisionCore, CoreNodeAction } from './DecisionCore';

interface ExecutiveDashboardProps {
  state: UnifiedInvestigationState;
  runs: InvestigationRun[];
  onOpenInvestigation: () => void;
  onViewEvidence: () => void;
  onOpenNode: (action: CoreNodeAction) => void;
  onOpenConfidence: () => void;
  onNavigateDecisions: () => void;
  onOpenSignals: () => void;
  onOpenHistory: () => void;
  onViewFindingEvidence: (findingId: string) => void;
}

/**
 * EXECUTIVE OVERVIEW — answers four questions in ten seconds:
 * What is happening? Why? What should we do? How confident are we?
 * Everything else lives in modules.
 */
export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  state,
  runs,
  onOpenInvestigation,
  onViewEvidence,
  onOpenNode,
  onOpenConfidence,
  onNavigateDecisions,
  onOpenSignals,
  onOpenHistory,
  onViewFindingEvidence,
}) => {
  const hasEvidence = state.empiricalFindings.length > 0;
  const blocked = (state.issues || []).some(
    (i) => i.status === 'DATA INSUFFICIENT' || i.status === 'INVESTIGATION BLOCKED'
  );
  const confidence = state.recommendationConfidence;

  const recommended: DecisionRoomOption =
    DECISION_ROOM_OPTIONS.find((o) => o.id === (state.selectedOptionId || 'opt-1')) ||
    DECISION_ROOM_OPTIONS[0];

  const topFindings = state.empiricalFindings.slice(0, 3);
  const latestRun = runs[0];

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Issues banner (only when something is actually wrong) */}
      {(state.issues || []).map((issue) => (
        <div
          key={`${issue.status}-${issue.failedComponent}`}
          className="cb-rise cb-glass rounded-xl p-4 border-rose-500/30 flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-rose-300">{issue.status}</span>
            <span className="text-slate-400"> · {issue.failedComponent} · </span>
            <span className="text-amber-300">confidence {issue.confidenceDelta}%</span>
            <p className="text-slate-300 mt-1">{issue.impact}</p>
            <p className="text-cyan-300 mt-0.5">Next: {issue.nextAction}</p>
          </div>
        </div>
      ))}

      {/* ===================== EXECUTIVE DECISION HERO ===================== */}
      <section
        className="cb-rise cb-glass-hero cb-edge relative rounded-3xl p-6 sm:p-10 overflow-hidden"
        aria-label="Executive decision"
      >
        <div className="cb-meta text-amber-400/90 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Executive Decision
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">{state.runId}</span>
        </div>

        <h1 className="cb-display text-2xl sm:text-4xl leading-[1.15] text-white max-w-3xl mt-4">
          &ldquo;{hasEvidence && !blocked
            ? 'Target Product A in Region South with a controlled pricing intervention.'
            : 'Hold: reconnect the sales ledger before committing commercial spend.'}&rdquo;
        </h1>

        {/* WHY / ACTION / CONFIDENCE strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
          <div className="cb-glass rounded-xl p-4 cb-lift" style={{ transformStyle: 'preserve-3d' }}>
            <span className="cb-kicker text-indigo-400">Why</span>
            <p className="text-sm text-slate-200 mt-2 leading-snug">
              {hasEvidence && !blocked
                ? '68.2% of revenue decline is concentrated in Product A.'
                : 'No verified internal evidence is currently available.'}
            </p>
          </div>
          <div className="cb-glass rounded-xl p-4 cb-lift" style={{ transformStyle: 'preserve-3d' }}>
            <span className="cb-kicker text-amber-400">Action</span>
            <p className="text-sm text-slate-200 mt-2 leading-snug">
              {hasEvidence && !blocked
                ? '8% targeted bundle + ₹2.8L regional co-op marketing.'
                : 'Reconnect src-1 (Sales Ledger) and re-run verification.'}
            </p>
          </div>
          <div className="cb-glass rounded-xl p-4 cb-lift" style={{ transformStyle: 'preserve-3d' }}>
            <span className="cb-kicker text-emerald-400">Confidence</span>
            <p className="text-sm text-slate-200 mt-2 leading-snug">
              <span className="font-mono font-bold text-emerald-300">{confidence.overallScore}%</span>
              <span className="text-slate-400"> · {confidence.level}</span>
            </p>
          </div>
        </div>

        {/* Primary + secondary actions — only two */}
        <div className="flex flex-wrap items-center gap-3 mt-8">
          <button
            type="button"
            onClick={onOpenInvestigation}
            className="cb-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 group"
          >
            Open Investigation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={onViewEvidence}
            className="cb-btn inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-sm"
          >
            <FileSearch className="w-4 h-4 text-amber-400" />
            View Evidence
          </button>
        </div>
      </section>

      {/* ===================== DECISION CORE ===================== */}
      <div className="cb-rise" style={{ animationDelay: '90ms' }}>
        <DecisionCore state={state} onOpenNode={onOpenNode} onOpenConfidence={onOpenConfidence} />
      </div>

      {/* ===================== 3 KEY FINDINGS ===================== */}
      {topFindings.length > 0 && (
        <section aria-label="Key findings" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="cb-kicker text-slate-400">3 Key Findings</h2>
            <button
              type="button"
              onClick={onOpenInvestigation}
              className="text-xs font-semibold text-slate-500 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
            >
              Full findings <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topFindings.map((f, idx) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onViewFindingEvidence(f.id)}
                className="cb-rise cb-glass cb-lift cb-press rounded-2xl p-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                style={{ animationDelay: `${160 + idx * 70}ms`, transformStyle: 'preserve-3d' }}
                title={`Inspect evidence: ${f.label}`}
              >
                <div className="flex items-center justify-between">
                  <span className="cb-meta text-slate-400">{f.label}</span>
                  <TrendingDown className="w-4 h-4 text-rose-400/70" />
                </div>
                <div className="mt-3 text-3xl font-mono font-extrabold text-rose-400 tabular-nums">
                  {f.change}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-snug">{f.subtext}</p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="cb-meta text-slate-600">{f.evidenceClaimId}</span>
                  <span className="text-[10px] font-bold text-amber-400/90 group-hover:underline">
                    {f.detailedData.confidence}% conf
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ===================== RECOMMENDED ACTION ===================== */}
      {!blocked && (
        <section aria-label="Recommended action" className="cb-rise" style={{ animationDelay: '380ms' }}>
          <div className="cb-glass cb-edge relative rounded-3xl p-6 sm:p-7 overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 tracking-widest">
                    RECOMMENDED
                  </span>
                  <span className="cb-meta text-slate-500">{recommended.confidence}% confidence</span>
                </div>
                <h2 className="cb-display text-xl sm:text-2xl text-white mt-3 leading-snug">
                  {recommended.name}
                </h2>
                <div className="grid grid-cols-3 gap-5 mt-4 text-xs">
                  <div>
                    <span className="cb-meta text-slate-500 block">Expected</span>
                    <span className="text-sm font-bold text-emerald-300 font-mono mt-1 block">+₹18.4L/mo</span>
                  </div>
                  <div>
                    <span className="cb-meta text-slate-500 block">Risk</span>
                    <span className="text-sm font-bold text-emerald-300 font-mono mt-1 block">{recommended.risk}</span>
                  </div>
                  <div>
                    <span className="cb-meta text-slate-500 block">Time</span>
                    <span className="text-sm font-bold text-slate-200 font-mono mt-1 block">{recommended.timeToImpact}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onNavigateDecisions}
                  className="cb-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-amber-500/40 text-slate-200 font-bold text-sm"
                >
                  <Scale className="w-4 h-4 text-amber-400" />
                  Compare Options
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== SIGNALS (3 compact cards) ===================== */}
      <section aria-label="Signals" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="cb-kicker text-slate-400">Signals</h2>
          <button
            type="button"
            onClick={onOpenSignals}
            className="text-xs font-semibold text-slate-500 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
          >
            All radars <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Risk',
              detail: 'Customer retention is the highest-severity vector.',
              meta: '1 HIGH · 2 MEDIUM',
              icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
              accent: 'text-rose-300',
              border: 'border-rose-500/25',
            },
            {
              title: 'Opportunity',
              detail: 'Product B growing +2.1% on just 8% of marketing spend.',
              meta: '4 growth signals',
              icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
              accent: 'text-emerald-300',
              border: 'border-emerald-500/25',
            },
            {
              title: 'Market',
              detail: 'Competitor A running 15–20% localized discounts in South.',
              meta: 'DEMO research source',
              icon: <TrendingDown className="w-4 h-4 text-cyan-400" />,
              accent: 'text-cyan-300',
              border: 'border-cyan-500/25',
            },
          ].map((s, idx) => (
            <button
              key={s.title}
              type="button"
              onClick={onOpenSignals}
              className={`cb-rise cb-glass cb-lift cb-press rounded-2xl p-5 text-left border ${s.border} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60`}
              style={{ animationDelay: `${440 + idx * 70}ms`, transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between">
                <span className="cb-meta text-slate-400">{s.title}</span>
                {s.icon}
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-snug">{s.detail}</p>
              <span className={`cb-meta block mt-3 ${s.accent}`}>{s.meta}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===================== RECENT INVESTIGATION ===================== */}
      {latestRun && (
        <section aria-label="Recent investigation" className="cb-rise" style={{ animationDelay: '640ms' }}>
          <button
            type="button"
            onClick={onOpenHistory}
            className="cb-glass cb-lift cb-press w-full rounded-2xl p-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono font-bold text-amber-400 text-sm">{latestRun.id}</span>
                <span className="cb-meta text-emerald-300">{latestRun.overallConfidence} confidence</span>
                <span className="cb-meta text-slate-500 hidden sm:inline">{latestRun.timestamp.slice(0, 16)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="cb-meta text-indigo-300">6 active datasets</span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-200">
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  Replay
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">
              &ldquo;{latestRun.question}&rdquo;
            </p>
          </button>
        </section>
      )}
    </div>
  );
};
