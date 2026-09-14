import React, { useEffect, useState, Suspense, lazy } from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { ScenarioResult, UnifiedInvestigationState, InvestigationRun } from '../../types';
import type { CoreNodeAction } from './DecisionCore3D';

// Three.js payload is code-split: only fetched when the overview renders.
const DecisionCore3D = lazy(() =>
  import('./DecisionCore3D').then((m) => ({ default: m.DecisionCore3D }))
);

/** Reactive, SSR-safe reduced-motion detection. */
const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
};

interface ExecutiveDashboardProps {
  state: UnifiedInvestigationState;
  runs: InvestigationRun[];
  onOpenInvestigation: () => void;
  onViewEvidence: () => void;
  onOpenNode: (action: CoreNodeAction) => void;
  onNavigateDecisions: () => void;
  onOpenSignals: () => void;
  onOpenHistory: () => void;
  onViewFindingEvidence: (findingId: string) => void;
  scenarioOverride?: ScenarioResult;
}

/**
 * EXECUTIVE OVERVIEW — answers four questions in ten seconds.
 * Typography and whitespace carry the hierarchy; the 3D Decision Core is
 * the only spatial element. Everything else stays quiet.
 */
export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  state,
  runs,
  onOpenInvestigation,
  onViewEvidence,
  onOpenNode,
  onNavigateDecisions,
  onOpenSignals,
  onOpenHistory,
  onViewFindingEvidence,
  scenarioOverride,
}) => {
  const blocked = (state.issues || []).some(
    (i) => i.status === 'DATA INSUFFICIENT' || i.status === 'INVESTIGATION BLOCKED'
  );
  const hasEvidence = state.empiricalFindings.length > 0;
  const confidence = state.recommendationConfidence;
  const verifiedClaims = state.claims.filter((c) => c.verified).length;
  const selectedSources = state.activeDataSources.filter((s) => s.selected).length;
  const totalRecords = state.activeDataSources
    .filter((s) => s.selected)
    .reduce((a, s) => a + s.recordsCount, 0);

  const findings = state.empiricalFindings.slice(0, 3);
  const latestRun = runs[0];
  const summaryMetrics = [
    { label: 'Revenue', value: findings[0]?.change || '—' },
    { label: 'Product', value: findings[1]?.change || '—' },
    { label: 'Region', value: findings[2]?.change || '—' },
    { label: 'Confidence', value: `${confidence.overallScore}%` },
    { label: 'Evidence', value: `${verifiedClaims} verified` },
  ];

  /** Plain-English one-liner for a finding — technical ids stay in Evidence. */
  const findingExplanation = (f: (typeof findings)[number]): string => {
    const t = f.subtext.toLowerCase();
    if (t.includes('contributor') || t.includes('largest'))
      return 'Sales have fallen sharply over the last period.';
    if (t.includes('region') || t.includes('retention'))
      return 'Customer retention is weakening fastest here.';
    if (t.includes('margin') || t.includes('profit'))
      return 'Discounting is reducing profitability.';
    return f.detailedData.variance;
  };

  /** Human-readable explanation for any failure status. */
  const issueCopy = (status: string): { title: string; detail: string; action: string } => {
    switch (status) {
      case 'DATA INSUFFICIENT':
        return {
          title: "We can't answer this yet.",
          detail: 'We need more complete business data to investigate this question.',
          action: 'Connect or select the missing dataset, then run the investigation again.',
        };
      case 'INVESTIGATION BLOCKED':
        return {
          title: 'This investigation is on hold.',
          detail: 'No usable data source is currently selected.',
          action: 'Connect at least one dataset with real records to begin.',
        };
      case 'MARKET INTELLIGENCE UNAVAILABLE':
        return {
          title: "We couldn't check current market conditions.",
          detail: 'The recommendation is based on internal business data only.',
          action: 'Select the market research source to include external checks.',
        };
      case 'FORECAST UNRELIABLE':
        return {
          title: "We don't have enough history to make a reliable forecast.",
          detail: 'We can still analyze what has already happened.',
          action: 'Connect more historical records to enable projections.',
        };
      case 'TOOL FAILURE':
        return {
          title: 'One analysis step failed.',
          detail: 'The investigation continued using the evidence that was available.',
          action: 'Review the failed step in the investigation log and rerun.',
        };
      case 'EVIDENCE CONFLICT':
        return {
          title: 'Two sources disagree.',
          detail: 'Conflicting evidence reduces how much we trust this conclusion.',
          action: 'Review the conflicting claims in the Evidence workspace.',
        };
      default:
        return {
          title: status,
          detail: 'The investigation could not complete this step.',
          action: 'See the investigation log for details.',
        };
    }
  };

  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="cb-noise relative min-h-screen">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 py-6 sm:py-8">
        {/* Failure / degraded-state banner — human language first, status as metadata */}
        {(state.issues || []).map((issue) => {
          const copy = issueCopy(issue.status);
          return (
            <div
              key={`${issue.status}-${issue.failedComponent}`}
              className="cb-rise mb-8 rounded-lg border border-rose-500/25 bg-rose-950/20 px-4 py-3.5"
            >
              <div className="flex items-start gap-3 min-w-0">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-100 leading-snug">{copy.title}</p>
                  <p className="text-[13px] text-slate-300 mt-1 leading-relaxed">{issue.impact}</p>
                  <p className="text-[12.5px] text-slate-400 mt-1.5 leading-relaxed">
                    <span className="text-slate-300 font-medium">What you can do — </span>
                    {copy.action}
                  </p>
                  <p className="cb-meta mt-2 text-slate-600">{issue.status}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* ============ WHAT SHOULD WE DO ============ */}
        <section
          className="cb-rise grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-10 items-start border-b cb-hairline pb-8"
          aria-label="What should we do"
        >
          <div className="min-w-0 max-w-2xl">
            <p className="cb-kicker text-[#9aa39b]">Business analysis</p>
            <p className="text-[12px] text-slate-500 mt-2 truncate">{state.userQuestion}</p>

            <h1 className="cb-display text-[26px] sm:text-[32px] text-white mt-4 leading-[1.15] break-words">
              {hasEvidence && !blocked
                ? state.recommendation
                : 'Hold spend until evidence is reconnected'}
            </h1>

            <p className="text-[15px] sm:text-[16px] text-slate-400 leading-relaxed mt-4 max-w-xl break-words">
              {hasEvidence && !blocked
                ? 'Sales are falling mainly because Product A is losing performance in the region.'
                : "We can't make a reliable recommendation until the sales data is reconnected."}
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 border-y cb-hairline">
              {summaryMetrics.map((metric, index) => (
                <div key={metric.label} className={`py-3.5 pr-4 ${index > 0 ? 'sm:border-l sm:border-slate-800/80 sm:pl-4' : ''}`}>
                  <p className="cb-kicker">{metric.label}</p>
                  <p className={`cb-metric text-[17px] mt-1.5 ${metric.label === 'Confidence' || metric.label === 'Evidence' ? 'text-[#a9c9ae]' : 'text-slate-100'}`}>{metric.value}</p>
                </div>
              ))}
            </div>

            <p className="text-[13px] text-slate-300 mt-4 leading-relaxed max-w-xl">
              {hasEvidence && !blocked ? state.recommendationExplanation : 'The sales ledger is disconnected, so the recommendation is paused until the data can be verified.'}
            </p>

            {/* Basis line — plain-English confidence grounding */}
            <p className="text-[12.5px] text-slate-500 mt-4 leading-relaxed">
              Based on {verifiedClaims} verified claim{verifiedClaims === 1 ? '' : 's'} across{' '}
              {selectedSources} data source{selectedSources === 1 ? '' : 's'}
              {totalRecords > 0 ? ` (${(totalRecords / 1000).toFixed(0)}K records)` : ''}. This is
              decision-support confidence — how well the evidence supports this advice — not a
              probability it is correct.
            </p>

            {/* Actions — exactly two */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                type="button"
                onClick={onOpenInvestigation}
                className="cb-primary-action cb-btn inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold"
              >
                Review recommendation
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <button
                type="button"
                onClick={onViewEvidence}
                className="cb-btn px-5 py-2.5 rounded-md border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-[13.5px] font-medium"
              >
                See the evidence
              </button>
            </div>
          </div>

          {/* 3D Decision Core — the signature (lazy, code-split) */}
          <div className="w-full max-w-[360px] lg:w-[360px] shrink-0 justify-self-center lg:justify-self-end">
            <Suspense
              fallback={
                <div
                  className="flex items-center justify-center"
                  style={{ aspectRatio: '1 / 1', maxWidth: 460, margin: '0 auto' }}
                  aria-label="Loading decision core"
                >
                  <div className="cb-core-breathe w-24 h-24 rounded-full border border-slate-700/60 flex items-center justify-center">
                    <span className="cb-metric text-[22px] text-white">{confidence.overallScore}%</span>
                  </div>
                </div>
              }
            >
              <DecisionCore3D state={state} onOpenNode={onOpenNode} scenarioOverride={scenarioOverride} reducedMotion={reducedMotion} />
            </Suspense>
          </div>
        </section>

        {/* ============ WHY ============ */}
        {findings.length > 0 && (
          <section className="mt-16 sm:mt-20" aria-label="What the data shows">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="cb-kicker">Why this recommendation</h2>
              <button
                type="button"
                onClick={onOpenInvestigation}
                className="text-[12.5px] font-medium text-slate-500 hover:text-amber-300 transition-colors"
              >
                Full findings
              </button>
            </div>
            {/* Whitespace-separated columns; stacks below 640px, no divide lines to collide */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-8 sm:gap-x-8">
              {findings.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onViewFindingEvidence(f.id)}
                  className="cb-row text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/60 rounded"
                  title={`See the evidence for ${f.label}`}
                >
                  <p className="cb-meta">{f.label}</p>
                  <p className="cb-metric text-[26px] sm:text-[28px] text-rose-400 mt-2.5">{f.change}</p>
                  <p className="text-[12.5px] text-slate-400 mt-1.5 leading-snug break-words">
                    {findingExplanation(f)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ============ NEXT MOVE ============ */}
        {!blocked && (
          <section className="mt-16 sm:mt-20" aria-label="What should we do next">
            <div className="flex flex-wrap items-end justify-between gap-5 border-y cb-hairline py-6">
              <div className="min-w-0 max-w-2xl">
                <p className="cb-kicker text-amber-400/90">What should we do next?</p>
                <p className="text-[17px] sm:text-[19px] font-semibold text-white mt-2 leading-snug">
                  Run a targeted pricing intervention in South India, then review the result weekly.
                </p>
                <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
                  Start with a controlled pilot so the team can learn before making a wider change.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onNavigateDecisions}
                  className="cb-primary-action cb-btn inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold"
                >
                  Compare actions <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onViewEvidence}
                  className="cb-btn px-4 py-2 rounded-md border border-slate-700/80 hover:border-amber-500/40 text-slate-300 hover:text-white text-[13px] font-medium"
                >
                  Challenge the evidence
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============ SIGNALS ============ */}
        <section className="mt-16 sm:mt-20" aria-label="What to watch">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="cb-kicker">What to watch</h2>
            <button
              type="button"
              onClick={onOpenSignals}
              className="text-[12.5px] font-medium text-slate-500 hover:text-amber-300 transition-colors"
            >
              All signals
            </button>
          </div>
          <div className="mt-2 divide-y divide-slate-800/70 border-y cb-hairline">
            {[
              {
                kicker: 'Risk',
                title: 'Customer retention in South',
                severity: 'HIGH',
                tone: 'text-rose-400',
                dot: 'bg-rose-400',
              },
              {
                kicker: 'Opportunity',
                title: 'Product B momentum',
                severity: 'HIGH',
                tone: 'text-emerald-300',
                dot: 'bg-emerald-400',
              },
              {
                kicker: 'Market',
                title: 'Competitor pricing',
                severity: 'MEDIUM',
                tone: 'text-amber-300',
                dot: 'bg-cyan-400',
              },
            ].map((s) => (
              <button
                key={s.kicker}
                type="button"
                onClick={onOpenSignals}
                className="cb-row w-full flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-4 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/60 rounded"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1 basis-52">
                  <span className="cb-meta !text-slate-400 shrink-0">{s.kicker}</span>
                  <span className="text-[14px] font-medium text-slate-200 truncate min-w-0">{s.title}</span>
                </div>
                <span className="flex items-center gap-2 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className={`cb-meta ${s.tone}`}>{s.severity}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ============ EXPLORE ============ */}
        <section className="mt-16 sm:mt-20" aria-label="Explore workspaces">
          <h2 className="cb-kicker">Explore</h2>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-[13px]">
            {[
              ['Investigate', onOpenInvestigation, 'Ask a question'],
              ['Decisions', onNavigateDecisions, 'Compare actions'],
              ['Evidence', onViewEvidence, 'Prove the answer'],
              ['Signals', onOpenSignals, "What's changing?"],
              ['History', onOpenHistory, 'Previous investigations'],
            ].map(([label, action, description]) => (
              <button
                key={label as string}
                type="button"
                onClick={action as () => void}
                className="cb-row text-left text-slate-300 hover:text-white py-1"
              >
                <span className="font-semibold">{label as string}</span>
                <span className="text-slate-600 ml-2">{description as string}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ============ LATEST INVESTIGATION ============ */}
        {latestRun && (
          <section className="mt-16 sm:mt-20 pb-4" aria-label="Latest investigation">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="cb-kicker">Latest investigation</h2>
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-[12.5px] font-medium text-slate-500 hover:text-amber-300 transition-colors"
              >
                Previous investigations
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenHistory}
              className="cb-row cb-rise w-full mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-start sm:justify-between gap-x-6 gap-y-2 py-4 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/60 rounded"
            >
              <p className="text-[13.5px] text-slate-300 leading-snug break-words min-w-0 max-w-2xl">
                &ldquo;{latestRun.question}&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 shrink-0">
                <span className="cb-metric text-[13px] text-emerald-300">{latestRun.confidenceScore}% confident</span>
                <span className="cb-meta text-slate-600">{latestRun.timestamp.slice(0, 16)}</span>
                <span className="cb-meta text-slate-600">{latestRun.id}</span>
              </div>
            </button>
          </section>
        )}
      </div>
    </div>
  );
};
