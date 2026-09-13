import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Download, 
  Sparkles, 
  X, 
  Layers, 
  Scale, 
  Calendar, 
  Building2, 
  Database,
  Bookmark,
  Check,
  Search,
  Eye,
  ArrowLeftRight
} from 'lucide-react';
import { InvestigationRun, InvestigationState, UnifiedInvestigationState, BusinessContext, DecisionRecord } from '../types';
import { exportInvestigationToPDF } from '../utils/pdfExport';
import { DEFAULT_DATA_SOURCES, DECISION_ROOM_OPTIONS, RISK_RADAR_ITEMS } from '../mockData';
import { buildUnifiedInvestigationState } from '../state/investigationEngine';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  runs: InvestigationRun[];
  currentRunId: string;
  onRestoreRun: (run: InvestigationRun) => void;
  onSaveCurrentSnapshot: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  runs,
  currentRunId,
  onRestoreRun,
  onSaveCurrentSnapshot,
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(currentRunId);
  const [compareRunId, setCompareRunId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRuns = runs.filter((r) =>
    r.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.executiveRecommendation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRun = runs.find((r) => r.id === selectedRunId) || runs[0];
  const compareRun = compareRunId ? runs.find((r) => r.id === compareRunId) : null;

  // Derived run diagnostics (kept out of the persisted run record)
  const getRunSourceCounts = (run: InvestigationRun): { sources: number; records: number } => {
    const st = run.investigationState;
    if (st && 'activeDataSources' in st) {
      const sources = (st.activeDataSources || []).filter((s) => s.selected);
      return { sources: sources.length, records: sources.reduce((acc, s) => acc + (s.recordsCount || 0), 0) };
    }
    return { sources: 3, records: 354292 };
  };
  const activeRunMetrics = activeRun ? getRunSourceCounts(activeRun) : { sources: 0, records: 0 };
  const activeRunSourcesCount = activeRunMetrics.sources;
  const activeRunRecordsCount = activeRunMetrics.records;

  const handleDownloadRunPDF = (run: InvestigationRun) => {
    const stateToExport: UnifiedInvestigationState = ('investigationId' in run.investigationState)
      ? (run.investigationState as UnifiedInvestigationState)
      : buildUnifiedInvestigationState({
          runId: run.id,
          userQuestion: run.question,
          businessContext: run.businessContext,
          dataSources: DEFAULT_DATA_SOURCES,
          selectedOptionId: run.selectedOptionId || 'opt-1',
          governanceDecision: run.decisionRecord || undefined,
        });

    exportInvestigationToPDF({
      state: stateToExport,
      businessContext: run.businessContext,
      decisionRecord: run.decisionRecord,
      dataSources: DEFAULT_DATA_SOURCES,
      decisionOptions: DECISION_ROOM_OPTIONS,
      riskRadarItems: RISK_RADAR_ITEMS,
      scenarioParams: run.scenarioState,
      scenarioResult: run.scenarioResult,
      selectedOptionId: run.selectedOptionId || 'opt-1',
    });
  };

  const getDecisionBadge = (rec: DecisionRecord | null) => {
    if (!rec || !rec.decision) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
          Pending Review
        </span>
      );
    }
    switch (rec.decision) {
      case 'APPROVE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" />
            Approved
          </span>
        );
      case 'MODIFY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">
            Modified Scope
          </span>
        );
      case 'REJECT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60">
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl h-[90vh] rounded-2xl bg-[#0c0f17] border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#101524] to-[#0c0f17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Session Version History
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {runs.length} Saved {runs.length === 1 ? 'Run' : 'Runs'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audit, compare, or restore past investigations and leadership sign-offs from this session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveCurrentSnapshot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Snapshot Current Run</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: List of Runs (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-800 flex flex-col h-full bg-[#0a0d14]/70">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter runs by question or recommendation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Run List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredRuns.map((run) => {
                const isSelected = run.id === selectedRunId;
                const isCurrentActive = run.id === currentRunId;
                const isCompare = run.id === compareRunId;

                return (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-400 text-[11px]">
                          {run.id}
                        </span>
                        {isCurrentActive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-950">
                            ACTIVE
                          </span>
                        )}
                        {isCompare && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-400 text-slate-950">
                            COMPARING
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {run.timestamp.slice(11, 19)}
                      </span>
                    </div>

                    <p className="font-bold text-white line-clamp-2 mb-2 leading-snug">
                      "{run.question}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          {run.confidenceScore}% Conf
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {run.dataQualityPercent}% Quality
                        </span>
                      </div>
                      {getDecisionBadge(run.decisionRecord)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Run Details or Side-by-Side Comparison (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-y-auto p-5 space-y-5 bg-[#0b0e15]">
            {compareRun ? (
              /* COMPARISON VIEW */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-white">
                      Comparing: <span className="text-amber-400">{activeRun.id}</span> vs <span className="text-cyan-400">{compareRun.id}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompareRunId(null)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    Close Comparison
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* Left: Active Run */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">{activeRun.id}</span>
                      <span className="text-[10px] text-slate-400">{activeRun.timestamp.slice(0, 16)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Question:</span>
                      <p className="font-medium text-white">{activeRun.question}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Recommendation:</span>
                      <p className="font-bold text-amber-300">"{activeRun.executiveRecommendation}"</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span>Confidence: <strong className="text-emerald-400">{activeRun.confidenceScore}%</strong></span>
                      {getDecisionBadge(activeRun.decisionRecord)}
                    </div>
                  </div>

                  {/* Right: Compare Run */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400">{compareRun.id}</span>
                      <span className="text-[10px] text-slate-400">{compareRun.timestamp.slice(0, 16)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Question:</span>
                      <p className="font-medium text-white">{compareRun.question}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Recommendation:</span>
                      <p className="font-bold text-cyan-300">"{compareRun.executiveRecommendation}"</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span>Confidence: <strong className="text-emerald-400">{compareRun.confidenceScore}%</strong></span>
                      {getDecisionBadge(compareRun.decisionRecord)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE RUN DETAIL VIEW */
              <div className="space-y-5">
                {/* Run Top Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">
                        Run {activeRun.id}
                      </h4>
                      {activeRun.id === currentRunId ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                          Current Active Run
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          Archived Run
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Executed: {activeRun.timestamp}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeRun.id !== currentRunId && (
                      <button
                        type="button"
                        onClick={() => {
                          onRestoreRun(activeRun);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore This Run</span>
                      </button>
                    )}
                    {runs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const other = runs.find((r) => r.id !== activeRun.id);
                          if (other) setCompareRunId(other.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Compare</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadRunPDF(activeRun)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="Download PDF Brief for this run"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Question Box */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Executive Inquiry
                  </span>
                  <p className="text-sm font-bold text-white">
                    "{activeRun.question}"
                  </p>
                </div>

                {/* Recommendation Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Executive Recommendation
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                      {activeRun.overallConfidence} ({activeRun.confidenceScore}%)
                    </span>
                  </div>
                  <h5 className="text-base font-extrabold text-white leading-snug">
                    "{activeRun.executiveRecommendation}"
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeRun.investigationState.recommendationExplanation}
                  </p>
                </div>

                {/* Diagnostic Metrics Row */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Data Quality</span>
                    <span className="text-base font-mono font-extrabold text-amber-400">
                      {activeRun.dataQualityPercent}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sources Active</span>
                    <span className="text-base font-mono font-extrabold text-indigo-400">
                      {activeRunSourcesCount} Sources
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Audited Records</span>
                    <span className="text-base font-mono font-extrabold text-emerald-400">
                      {activeRunRecordsCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Decision Sign-Off Card */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Human Decision Sign-Off
                    </span>
                    {getDecisionBadge(activeRun.decisionRecord)}
                  </div>
                  {activeRun.decisionRecord?.decision ? (
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>
                        <strong className="text-white">Sign-off User:</strong> {activeRun.decisionRecord.signoffUser || 'Leadership Executive'}
                      </p>
                      <p>
                        <strong className="text-white">Timestamp:</strong> {activeRun.decisionRecord.timestamp}
                      </p>
                      {activeRun.decisionRecord.executiveNotes && (
                        <p className="italic text-slate-400 pt-1">
                          "{activeRun.decisionRecord.executiveNotes}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No decision recorded yet for this run. You can restore this run to approve or modify.
                    </p>
                  )}
                </div>

                {/* Business Context Snapshot */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    Business Context Applied
                  </span>
                  <p className="text-slate-300">
                    <strong className="text-white">{activeRun.businessContext.companyName}</strong> ({activeRun.businessContext.industry}) · {activeRun.businessContext.primaryMarket}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Strategy: {activeRun.businessContext.currentStrategy} | Objective: {activeRun.businessContext.businessObjective}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
