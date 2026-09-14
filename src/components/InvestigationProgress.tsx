import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Loader2,
  Circle,
  Terminal,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';
import { InvestigationStage } from '../types';

interface InvestigationProgressProps {
  stages: InvestigationStage[];
  currentStageIndex: number;
  terminalLogs: { timestamp: string; text: string }[];
  onSkip: () => void;
}

const PIPELINE_STEPS = [
  { id: 'data', label: 'YOUR DATA' },
  { id: 'analysis', label: 'WHAT CHANGED' },
  { id: 'anomalies', label: 'IMPORTANT CHANGES' },
  { id: 'root-cause', label: 'WHY' },
  { id: 'market', label: 'OUTSIDE SIGNALS' },
  { id: 'verify', label: 'EVIDENCE' },
  { id: 'decide', label: 'RECOMMENDATION' },
];

/**
 * Cinematic agent execution experience. A horizontal execution pipeline
 * animates stage-by-stage while concise progress summaries stream in.
 * Never exposes chain-of-thought — only verified execution milestones.
 */
export const InvestigationProgress: React.FC<InvestigationProgressProps> = ({
  stages,
  currentStageIndex,
  terminalLogs,
  onSkip,
}) => {
  const [isLogExpanded, setIsLogExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const percent = Math.min(100, Math.round(((currentStageIndex + 1) / stages.length) * 100));
  const activeStage = stages[currentStageIndex] || stages[stages.length - 1];

  // Map stage index to pipeline step (11 stages mapped onto 7 semantic steps)
  const activeStepIndex = Math.min(
    PIPELINE_STEPS.length - 1,
    Math.floor((currentStageIndex / stages.length) * PIPELINE_STEPS.length)
  );

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const handleCopyLogs = () => {
    const textToCopy = terminalLogs.map((l) => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive concise milestone summaries from completed stages
  const completedMilestones = stages.slice(0, Math.max(0, currentStageIndex)).slice(-3, );

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="cb-glass-hero cb-edge relative rounded-xl p-6 sm:p-7 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-amber-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
            </div>
            <div>
              <span className="cb-kicker">CorporateBaddie is investigating</span>
              <h2 className="text-[16px] font-semibold text-white mt-0.5">
                Building your answer
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="text-right">
              <span className="cb-meta block">
                Stage {currentStageIndex + 1} / {stages.length}
              </span>
              <span className="cb-metric text-[20px] text-amber-400">
                {percent}%
              </span>
            </div>
            <button
              onClick={onSkip}
              className="cb-btn px-3 py-1.5 rounded-md border border-slate-800 hover:border-slate-700 text-[12.5px] font-medium text-slate-400 hover:text-slate-200"
              title="Fast-forward to results"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="w-full bg-slate-900/80 h-[3px] rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Horizontal execution pipeline */}
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-1 min-w-[640px]">
            {PIPELINE_STEPS.map((step, idx) => {
              const done = idx < activeStepIndex;
              const current = idx === activeStepIndex;
              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && (
                    <div
                      className={`flex-1 h-[2px] rounded-full transition-colors duration-500 ${
                        idx <= activeStepIndex ? 'bg-amber-500/70' : 'bg-slate-800'
                      }`}
                    />
                  )}
                  <div
                    className={`flex flex-col items-center gap-1.5 px-1 transition-all duration-300 ${
                      current ? 'scale-110' : done ? '' : 'opacity-45'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        current
                          ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_18px_-4px_rgba(245,158,11,0.7)]'
                          : done
                          ? 'bg-emerald-500/15 border-emerald-500/50'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : current ? (
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                    <span
                      className={`cb-meta whitespace-nowrap ${
                        current ? 'text-amber-300' : done ? 'text-emerald-400/80' : 'text-slate-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Current task spotlight */}
        <div className="mt-7 p-4 sm:p-5 rounded-2xl bg-amber-950/15 border border-amber-500/30">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="cb-meta text-amber-400">
              Current task · Step {currentStageIndex + 1} of {stages.length}
            </span>
            <span className="inline-flex items-center gap-1.5 cb-meta text-amber-300/70">
              <Loader2 className="w-3 h-3 animate-spin" />
              ACTIVE
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">{activeStage?.title}</h3>
          {activeStage?.executorName && (
            <p className="text-[11px] text-slate-500 mt-1">
              Assigned to {activeStage.executorName}{activeStage.executorCategory === 'ANALYTICAL_SERVICE' ? ' · deterministic service' : ' · reasoning agent'}
            </p>
          )}
          <p className="text-xs sm:text-sm text-amber-200/80 mt-1.5 italic">
            &ldquo;{activeStage?.dynamicMessage}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {activeStage?.explanation}
          </p>
        </div>

        {/* Recent milestones — concise, never chain-of-thought */}
        {completedMilestones.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {completedMilestones.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-1 duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{s.logMessage}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investigation log */}
      <div className="cb-glass rounded-xl overflow-hidden">
        <div
          onClick={() => setIsLogExpanded(!isLogExpanded)}
          className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Investigation details
                </h4>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  {terminalLogs.length} events
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Streaming
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Concise execution summaries · Zero chain-of-thought exposure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCopyLogs}
              className="cb-btn px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5"
              title="Copy log"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setIsLogExpanded(!isLogExpanded)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              aria-label={isLogExpanded ? 'Collapse log' : 'Expand log'}
            >
              {isLogExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isLogExpanded && (
          <div
            ref={logContainerRef}
            className="p-4 max-h-56 overflow-y-auto space-y-1.5 font-mono text-xs bg-[#090b10]/80"
          >
            {terminalLogs.length === 0 ? (
              <p className="text-slate-500 italic">Awaiting initial task telemetry...</p>
            ) : (
              terminalLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-relaxed animate-in fade-in duration-100">
                  <span className="text-slate-500 font-semibold shrink-0 select-none">[{log.timestamp}]</span>
                  <span className="text-slate-300">{log.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
