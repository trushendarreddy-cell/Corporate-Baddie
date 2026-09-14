import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DecomposedQuestion } from '../types';

interface QuestionDecompositionProps {
  originalQuestion: string;
  questions: DecomposedQuestion[];
  onSelectClaim?: (claimId: string) => void;
}

export const QuestionDecomposition: React.FC<QuestionDecompositionProps> = ({
  originalQuestion,
  questions,
  onSelectClaim,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(1); // default expand first task
  const [expandAll, setExpandAll] = useState(false);

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const getConfidenceBadge = (confidence: DecomposedQuestion['confidence']) => {
    switch (confidence) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
            High Confidence
          </span>
        );
      case 'Medium-High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800/40 text-amber-300">
            Med-High Confidence
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800/40 text-amber-300">
            Medium Confidence
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                What are we investigating?
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                {questions.length} Sub-Investigations
              </span>
            </div>
            <p className="text-xs text-slate-400">
              CorporateBaddie systematically decomposes complex executive inquiries into verifiable micro-tasks
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpandAll(!expandAll)}
          className="text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All Sub-Tasks'}
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Original prompt mapping pill */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3 text-xs">
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold font-mono uppercase text-[10px] shrink-0 mt-0.5">
            USER QUESTION
          </span>
          <p className="text-slate-200 font-medium italic">
            "{originalQuestion}"
          </p>
        </div>

        {/* 9 Sub-tasks list */}
        <div className="space-y-2.5">
          {questions.map((task) => {
            const isItemExpanded = expandAll || expandedId === task.id;

            return (
              <div
                key={task.id}
                className={`rounded-xl border transition-all ${
                  isItemExpanded 
                    ? 'bg-[#101524] border-slate-700 shadow-md' 
                    : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80'
                }`}
              >
                {/* Task row clickable header */}
                <div
                  onClick={() => toggleExpand(task.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {task.id}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        {task.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {task.status}
                    </span>
                    {getConfidenceBadge(task.confidence)}
                    <span className="text-slate-400 hover:text-white">
                      {isItemExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isItemExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 text-xs space-y-2.5 animate-in fade-in duration-150">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/90">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Evidence Found</span>
                        {task.claimRef && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectClaim && task.claimRef) onSelectClaim(task.claimRef);
                            }}
                            className="font-mono text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <span>Claim [{task.claimRef}]</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-200 leading-relaxed font-medium">
                        {task.evidenceFound}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
