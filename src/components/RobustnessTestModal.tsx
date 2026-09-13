import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Database, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { DataSource, RobustnessTestComparison, UnifiedInvestigationState } from '../types';

interface RobustnessTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSources: DataSource[];
  onRunTest: (sourceId: string) => void;
  currentTestResult?: RobustnessTestComparison;
  onResetTest: () => void;
}

export const RobustnessTestModal: React.FC<RobustnessTestModalProps> = ({
  isOpen,
  onClose,
  dataSources,
  onRunTest,
  currentTestResult,
  onResetTest,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('src-1');

  if (!isOpen) return null;

  const getRatingBadge = (rating: 'ROBUST' | 'SENSITIVE' | 'FRAGILE') => {
    switch (rating) {
      case 'ROBUST':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SENSITIVE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'FRAGILE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Decision Robustness Test"
        className="w-full max-w-3xl bg-[#0e121b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111622] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Decision Robustness & Sensitivity Test
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                  Epistemic Stress-Test
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulate disabling an enterprise data source to recompute investigation validity and determine if recommendations remain stable
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

        {/* Content */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
          {/* Controls: Select Source to Test Drop */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="text-slate-300 font-bold block">
              Select Data Connector to Simulate Removal:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-cyan-400"
              >
                {dataSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.recordsCount.toLocaleString()} records, {s.type})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onRunTest(selectedSourceId)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4" />
                <span>Simulate Removal & Recompute</span>
              </button>

              {currentTestResult && (
                <button
                  type="button"
                  onClick={onResetTest}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Test</span>
                </button>
              )}
            </div>
          </div>

          {/* Test Comparison Results */}
          {currentTestResult ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Stress-Test Outcome: {currentTestResult.sourceName}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getRatingBadge(currentTestResult.rating)}`}>
                    {currentTestResult.rating}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                    currentTestResult.evidenceRole === 'CRITICAL TO DECISION' 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {currentTestResult.evidenceRole}
                  </span>
                </div>
              </div>

              {/* Before vs After Side-by-Side Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400">Baseline (Source Active)</span>
                    <span className="text-slate-400 font-mono text-[11px]">Original State</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data Quality Score:</span>
                      <span className="font-mono font-bold text-white">{currentTestResult.before.dataQuality}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verified Evidence Claims:</span>
                      <span className="font-mono font-bold text-white">{currentTestResult.before.verifiedClaimsCount} / 6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recommendation Confidence:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {currentTestResult.before.overallConfidence} ({currentTestResult.before.confidenceScore}%)
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">Recommended Option:</span>
                      <span className="font-bold text-slate-200">{currentTestResult.before.recommendationTitle}</span>
                    </div>
                  </div>
                </div>

                {/* AFTER */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-400">Post-Removal (Source Disabled)</span>
                    <span className="text-slate-400 font-mono text-[11px]">Recomputed State</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data Quality Score:</span>
                      <span className={`font-mono font-bold ${currentTestResult.after.dataQuality < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {currentTestResult.after.dataQuality}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verified Evidence Claims:</span>
                      <span className="font-mono font-bold text-white">{currentTestResult.after.verifiedClaimsCount} / 6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recommendation Confidence:</span>
                      <span className={`font-mono font-bold ${currentTestResult.after.confidenceScore < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {currentTestResult.after.overallConfidence} ({currentTestResult.after.confidenceScore}%)
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">Recommended Option:</span>
                      <span className={`font-bold ${currentTestResult.recommendationShift ? 'text-rose-300' : 'text-slate-200'}`}>
                        {currentTestResult.after.recommendationTitle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation of Stability / Fragility */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Why Did the Recommendation {currentTestResult.recommendationShift ? 'Change?' : 'Remain Stable?'}</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {currentTestResult.deltaExplanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2 text-slate-500">
              <Scale className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">
                Select a data source above and click &ldquo;Simulate Removal & Recompute&rdquo; to test recommendation sensitivity.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111622] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Audit guarantee: Falsifiable recommendation sensitivity testing
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
