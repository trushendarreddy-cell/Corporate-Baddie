import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  BrainCircuit, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { HISTORICAL_DECISION_MEMORY, DecisionMemoryRecord } from '../state/decisionMemory';
import { DecisionOutcomeReviewModal } from './DecisionOutcomeReviewModal';

export const BusinessDecisionMemory: React.FC = () => {
  const [decisionMemory, setDecisionMemory] = useState<DecisionMemoryRecord[]>(HISTORICAL_DECISION_MEMORY);
  const [selectedRecord, setSelectedRecord] = useState<DecisionMemoryRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenRecord = (record: DecisionMemoryRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleUpdateRecord = (updatedRecord: DecisionMemoryRecord) => {
    setDecisionMemory(prev => 
      prev.map(r => r.id === updatedRecord.id ? updatedRecord : r)
    );
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: DecisionMemoryRecord['status']) => {
    switch (status) {
      case 'VALIDATED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Validated
          </span>
        );
      case 'DEVIATING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Diverged
          </span>
        );
      case 'TRACKING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Tracking
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section 
      id="decision-memory-section"
      aria-label="Institutional Decision Memory"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Section 10 · Institutional Memory & Epistemic Feedback
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            ORGANIZATIONAL DECISION MEMORY
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit past leadership sign-offs, verify actual vs predicted outcomes, and prevent recurring corporate pitfalls
          </p>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          {decisionMemory.length} Audited Decisions Tracked
        </span>
      </div>

      {/* Decision Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {decisionMemory.map((rec) => (
          <div
            key={rec.id}
            onClick={() => handleOpenRecord(rec)}
            className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-slate-400 font-bold">
                  {rec.id}
                </span>
                {getStatusBadge(rec.status)}
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                {rec.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {rec.decidedOption}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{rec.dateDecided}</span>
              <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Review <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <DecisionOutcomeReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateRecord}
        record={selectedRecord}
      />
    </section>
  );
};
