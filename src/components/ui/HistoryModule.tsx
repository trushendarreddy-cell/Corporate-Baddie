import React from 'react';
import { InvestigationRun, UnifiedInvestigationState } from '../../types';
import { BusinessDecisionMemory } from '../BusinessDecisionMemory';
import { RiskPanel } from '../RiskPanel';
import { PRIMARY_INVESTIGATION } from '../../mockData';

interface HistoryModuleProps {
  runs: InvestigationRun[];
  unifiedState: UnifiedInvestigationState;
  onOpenVersionHistory: () => void;
  onSaveCurrentSnapshot: () => void;
}

/**
 * HISTORY module — version history entry point, decision memory,
 * outcome review, risks & limitations ledger.
 */
export const HistoryModule: React.FC<HistoryModuleProps> = ({
  runs,
  onOpenVersionHistory,
  onSaveCurrentSnapshot,
}) => {
  return (
    <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-10 space-y-10">
      <div className="pb-6 border-b cb-hairline">
        <p className="cb-kicker">Module</p>
        <h1 className="cb-display text-[26px] sm:text-[32px] text-white mt-2">History</h1>
      </div>

      {/* Session runs */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="cb-kicker">Session Version History</h2>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onSaveCurrentSnapshot}
              className="cb-btn px-3.5 py-1.5 rounded-md text-[12.5px] font-medium text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
            >
              Snapshot Current Run
            </button>
            <button
              type="button"
              onClick={onOpenVersionHistory}
              className="cb-btn px-3.5 py-1.5 rounded-md text-[12.5px] font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300"
            >
              Open Version History ({runs.length})
            </button>
          </div>
        </div>

        {/* Run rows — hairline list */}
        <div className="mt-4 divide-y divide-slate-800/70 border-y cb-hairline">
          {runs.slice(0, 5).map((run) => (
            <button
              key={run.id}
              type="button"
              onClick={onOpenVersionHistory}
              className="cb-row w-full flex flex-wrap items-center justify-between gap-3 py-4 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/60 rounded"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono text-[12.5px] font-semibold text-amber-400/90">{run.id}</span>
                <span className="text-[13.5px] text-slate-300 truncate max-w-sm">
                  &ldquo;{run.question}&rdquo;
                </span>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                {run.decisionRecord?.decision ? (
                  <span className="cb-meta text-emerald-400">{run.decisionRecord.decision}</span>
                ) : (
                  <span className="cb-meta text-slate-600">PENDING</span>
                )}
                <span className="cb-metric text-[13px] text-emerald-300">{run.confidenceScore}%</span>
                <span className="cb-meta text-slate-600">{run.timestamp.slice(0, 16)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Organizational decision memory */}
      <section>
        <h2 className="cb-kicker">Organizational Decision Memory</h2>
        <div className="mt-4">
          <BusinessDecisionMemory />
        </div>
      </section>

      {/* Risks & limitations */}
      <section>
        <h2 className="cb-kicker">Risks & Limitations Ledger</h2>
        <div className="mt-4">
          <RiskPanel risks={PRIMARY_INVESTIGATION.risksAndLimitations || []} />
        </div>
      </section>
    </div>
  );
};
