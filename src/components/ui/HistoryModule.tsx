import React from 'react';
import { History, Bookmark, BrainCircuit, Scale } from 'lucide-react';
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <span className="cb-kicker text-amber-400/90 flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          Module · History
        </span>
        <h1 className="cb-display text-2xl sm:text-3xl text-white mt-1.5">
          Version History & Decision Memory
        </h1>
      </div>

      {/* Session runs launcher */}
      <section className="cb-glass cb-edge relative rounded-3xl p-6 sm:p-8 overflow-hidden" aria-label="Session runs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="cb-kicker text-slate-400">Session Version History</span>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
              Audit, compare, restore, or replay past investigations — every run stores its
              full evidence state and leadership sign-off.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onSaveCurrentSnapshot}
              className="cb-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              Snapshot Current Run
            </button>
            <button
              type="button"
              onClick={onOpenVersionHistory}
              className="cb-btn inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25"
            >
              <History className="w-3.5 h-3.5" />
              Open Version History ({runs.length})
            </button>
          </div>
        </div>

        {/* Run strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {runs.slice(0, 4).map((run) => (
            <button
              key={run.id}
              type="button"
              onClick={onOpenVersionHistory}
              className="cb-glass cb-lift cb-press rounded-xl p-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-400">{run.id}</span>
                <span className="cb-meta text-emerald-300">{run.confidenceScore}%</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-snug">
                &ldquo;{run.question}&rdquo;
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="cb-meta text-slate-600">{run.timestamp.slice(0, 16)}</span>
                {run.decisionRecord?.decision ? (
                  <span className="cb-meta text-emerald-400">{run.decisionRecord.decision}</span>
                ) : (
                  <span className="cb-meta text-slate-600">PENDING</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Organizational decision memory */}
      <div className="flex items-center gap-2 pt-2">
        <BrainCircuit className="w-4 h-4 text-amber-400" />
        <h2 className="cb-kicker text-slate-400">Organizational Decision Memory</h2>
      </div>
      <BusinessDecisionMemory />

      {/* Risks & limitations */}
      <div className="flex items-center gap-2 pt-2">
        <Scale className="w-4 h-4 text-rose-400" />
        <h2 className="cb-kicker text-slate-400">Risks & Limitations Ledger</h2>
      </div>
      <RiskPanel risks={PRIMARY_INVESTIGATION.risksAndLimitations || []} />
    </div>
  );
};
