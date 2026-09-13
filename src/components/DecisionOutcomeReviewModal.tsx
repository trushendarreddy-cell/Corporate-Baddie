import React, { useState } from 'react';
import { 
  X, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BrainCircuit, 
  Bookmark,
  Calendar,
  UserCheck,
  Save,
  Loader2
} from 'lucide-react';
import { DecisionMemoryRecord } from '../state/decisionMemory';

interface DecisionOutcomeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (record: DecisionMemoryRecord) => void;
  record: DecisionMemoryRecord | null;
}

export const DecisionOutcomeReviewModal: React.FC<DecisionOutcomeReviewModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  record,
}) => {
  if (!isOpen || !record) return null;

  const [isUpdating, setIsUpdating] = useState(false);
  const [actualMetrics, setActualMetrics] = useState({
    revenueDeltaPercent: record.actualMetrics.revenueDeltaPercent,
    grossMarginDeltaPercent: record.actualMetrics.grossMarginDeltaPercent ?? 0,
    customerRetentionDeltaPercent: record.actualMetrics.customerRetentionDeltaPercent,
    customerVolumeDeltaPercent: record.actualMetrics.customerVolumeDeltaPercent ?? 0,
    averageOrderValueDeltaPercent: record.actualMetrics.averageOrderValueDeltaPercent ?? 0,
    riskLevel: record.actualMetrics.riskLevel ?? 'MEDIUM',
  });

  const [divergenceAnalysis, setDivergenceAnalysis] = useState(record.divergenceAnalysis);
  const [institutionalLearnings, setInstitutionalLearnings] = useState(record.institutionalLearnings ?? []);
  const [learningInput, setLearningInput] = useState('');

  const getStatusBadge = (status: DecisionMemoryRecord['status']) => {
    switch (status) {
      case 'VALIDATED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'DEVIATING':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'TRACKING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const handleSubmit = () => {
    setIsUpdating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const updatedRecord: DecisionMemoryRecord = {
        ...record,
        actualMetrics: {
          ...record.actualMetrics,
          ...actualMetrics,
        },
        divergenceAnalysis,
        institutionalLearnings: [...institutionalLearnings],
        status: record.status === 'TRACKING' ? 'VALIDATED' : record.status,
      };
      
      onUpdate(updatedRecord);
      setIsUpdating(false);
      onClose();
    }, 1000);
  };

  const handleAddLearning = () => {
    if (learningInput.trim()) {
      setInstitutionalLearnings([...institutionalLearnings, learningInput.trim()]);
      setLearningInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Decision Outcome Review"
        className="w-full max-w-3xl max-h-[92vh] bg-[#0c0e15] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#101524]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Decision Outcome & Institutional Learning
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(record.status)}`}>
                  {record.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audit ID: {record.id} · Signed off on {record.dateDecided}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">{record.title}</h4>
            <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800 leading-relaxed">
              &ldquo;{record.question}&rdquo;
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Executive Sign-Off:</span>
              <span className="font-semibold text-slate-200">{record.executiveSignoff}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Selected Action:</span>
              <span className="font-semibold text-amber-300">{record.decidedOption}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Review Horizon:</span>
              <span className="font-mono text-slate-300">{record.reviewDate}</span>
            </div>
          </div>

          {/* Predicted vs Actual Metrics Comparison */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Predicted vs Actual Performance Metrics:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Revenue */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Revenue Delta</span>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Predicted:</span>
                  <span className="font-mono text-slate-300 font-bold">+{record.predictedMetrics.revenueDeltaPercent}%</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Actual:</span>
                  <input
                    type="number"
                    value={actualMetrics.revenueDeltaPercent}
                    onChange={(e) => setActualMetrics(prev => ({...prev, revenueDeltaPercent: parseFloat(e.target.value) || 0}))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="e.g. 7.2"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>

              {/* Margin */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Gross Margin Delta</span>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Predicted:</span>
                  <span className="font-mono text-slate-300 font-bold">{record.predictedMetrics.grossMarginDeltaPercent}%</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Actual:</span>
                  <input
                    type="number"
                    value={actualMetrics.grossMarginDeltaPercent}
                    onChange={(e) => setActualMetrics(prev => ({...prev, grossMarginDeltaPercent: parseFloat(e.target.value) || 0}))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="e.g. -2.4"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>

              {/* Retention */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Repeat Retention</span>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Predicted:</span>
                  <span className="font-mono text-slate-300 font-bold">+{record.predictedMetrics.customerRetentionDeltaPercent}%</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Actual:</span>
                  <input
                    type="number"
                    value={actualMetrics.customerRetentionDeltaPercent}
                    onChange={(e) => setActualMetrics(prev => ({...prev, customerRetentionDeltaPercent: parseFloat(e.target.value) || 0}))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="e.g. 5.1"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>

              {/* Customer Volume */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Customer Volume</span>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Predicted:</span>
                  <span className="font-mono text-slate-300 font-bold">+{record.predictedMetrics.customerVolumeDeltaPercent ?? 0}%</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Actual:</span>
                  <input
                    type="number"
                    value={actualMetrics.customerVolumeDeltaPercent}
                    onChange={(e) => setActualMetrics(prev => ({...prev, customerVolumeDeltaPercent: parseFloat(e.target.value) || 0}))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="e.g. 10.5"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>

              {/* Average Order Value */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Average Order Value</span>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Predicted:</span>
                  <span className="font-mono text-slate-300 font-bold">+{record.predictedMetrics.averageOrderValueDeltaPercent ?? 0}%</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Actual:</span>
                  <input
                    type="number"
                    value={actualMetrics.averageOrderValueDeltaPercent}
                    onChange={(e) => setActualMetrics(prev => ({...prev, averageOrderValueDeltaPercent: parseFloat(e.target.value) || 0}))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="e.g. 3.2"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Risk Level</span>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Predicted:</span>
                  <span className="font-mono text-slate-300 font-bold">{record.predictedMetrics.riskLevel ?? 'MEDIUM'}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Actual:</span>
                  <select
                    value={actualMetrics.riskLevel}
                    onChange={(e) => setActualMetrics(prev => ({...prev, riskLevel: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH'}))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Divergence Analysis */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Divergence Analysis:</span>
            </span>
            <textarea
              value={divergenceAnalysis}
              onChange={(e) => setDivergenceAnalysis(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 h-24 resize-none"
              placeholder="Describe what caused differences between predicted and actual outcomes..."
            />
          </div>

          {/* Institutional Learnings */}
          <div className="space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Institutional Learnings:</span>
            </span>
            <div className="flex flex-col space-y-1.5">
              {institutionalLearnings.map((learning, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{learning}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={learningInput}
                  onChange={(e) => setLearningInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLearning()}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  placeholder="Add a learning point..."
                />
                <button
                  onClick={handleAddLearning}
                  disabled={!learningInput.trim()}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e121b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors mr-2"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-lg ${isUpdating ? 'bg-slate-600 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400'} text-xs font-semibold text-white transition-colors`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Record Outcome
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
