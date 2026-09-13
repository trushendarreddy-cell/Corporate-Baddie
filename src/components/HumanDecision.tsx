import React, { useState } from 'react';
import { 
  CheckCircle, 
  Edit3, 
  XCircle, 
  ShieldCheck, 
  UserCheck, 
  Send, 
  Clock, 
  FileSignature,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DecisionRecord } from '../types';

interface HumanDecisionProps {
  decision: DecisionRecord;
  onRecordDecision: (record: DecisionRecord) => void;
}

export const HumanDecision: React.FC<HumanDecisionProps> = ({
  decision,
  onRecordDecision,
}) => {
  const [activeModal, setActiveModal] = useState<'APPROVE' | 'MODIFY' | 'REJECT' | null>(null);
  const [notes, setNotes] = useState('');
  const [modifiedScope, setModifiedScope] = useState(
    'Target Product A in Region South with 60-day test window and max $150k promotional spend.'
  );

  const handleAction = (type: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    setActiveModal(type);
  };

  const submitDecision = (type: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    onRecordDecision({
      decision: type,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      executiveNotes: notes.trim() || undefined,
      modifiedScope: type === 'MODIFY' ? modifiedScope : undefined,
      signoffUser: 'Executive Decision Maker (Chief Commercial Officer)',
    });
    setActiveModal(null);
  };

  const handleReset = () => {
    onRecordDecision({ decision: null, timestamp: '' });
    setNotes('');
  };

  return (
    <section 
      id="human-decision-section"
      aria-label="Human Decision"
      className="w-full bg-gradient-to-b from-[#10141f] to-[#0a0d14] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Section 10 · Executive Sign-Off & Governance
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            HUMAN DECISION
          </h2>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl">
            "CorporateBaddie investigates and recommends. Management remains the decision-maker."
          </p>
        </div>

        {decision.decision && (
          <button
            onClick={handleReset}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revise Decision</span>
          </button>
        )}
      </div>

      {/* Decision Status State */}
      {decision.decision ? (
        <div className={`p-6 rounded-xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          decision.decision === 'APPROVE'
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
            : decision.decision === 'MODIFY'
            ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
            : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              decision.decision === 'APPROVE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : decision.decision === 'MODIFY'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {decision.decision === 'APPROVE' && <CheckCircle className="w-6 h-6" />}
              {decision.decision === 'MODIFY' && <Edit3 className="w-6 h-6" />}
              {decision.decision === 'REJECT' && <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recorded Executive Verdict:
                </span>
                <span className="font-extrabold text-base tracking-wider">
                  {decision.decision}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Authorized by {decision.signoffUser} on {decision.timestamp}
              </p>
              {decision.modifiedScope && (
                <p className="text-xs text-amber-300 font-mono mt-1 bg-amber-950/50 p-2 rounded border border-amber-800/40">
                  Modified Scope: {decision.modifiedScope}
                </p>
              )}
              {decision.executiveNotes && (
                <p className="text-xs text-slate-300 italic mt-1">
                  "{decision.executiveNotes}"
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-[10px] text-slate-500 block">Audit Hash</span>
            <span className="font-mono text-xs text-slate-300 font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              #DEC-9982-VERIFIED
            </span>
          </div>
        </div>
      ) : (
        /* Action Buttons */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* APPROVE */}
          <button
            onClick={() => handleAction('APPROVE')}
            className="p-5 rounded-xl bg-[#0e1724] hover:bg-[#122033] border-2 border-emerald-500/60 hover:border-emerald-400 text-left transition-all group shadow-lg shadow-emerald-950/20 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Authorized Action
              </span>
              <CheckCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">
              APPROVE
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adopt Option C without changes. Greenlight Region South targeted intervention for Product A.
            </p>
          </button>

          {/* MODIFY */}
          <button
            onClick={() => handleAction('MODIFY')}
            className="p-5 rounded-xl bg-[#14141d] hover:bg-[#1b1b28] border-2 border-amber-500/60 hover:border-amber-400 text-left transition-all group shadow-lg shadow-amber-950/20 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Parameter Tuning
              </span>
              <Edit3 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">
              MODIFY
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Approve with adjustments. Alter promotional budget ceiling, test window duration, or geographic scope.
            </p>
          </button>

          {/* REJECT */}
          <button
            onClick={() => handleAction('REJECT')}
            className="p-5 rounded-xl bg-[#171014] hover:bg-[#221319] border-2 border-rose-500/60 hover:border-rose-400 text-left transition-all group shadow-lg shadow-rose-950/20 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Override / Decline
              </span>
              <XCircle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">
              REJECT
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Decline recommendation. Provide rationale and commission alternative root-cause hypothesis investigation.
            </p>
          </button>
        </div>
      )}

      {/* Interactive Modal for Submitting Decision */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0e121b] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">
                  Confirm Executive Verdict: {activeModal}
                </h4>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            {activeModal === 'MODIFY' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Adjust Scope / Constraints:
                </label>
                <textarea
                  value={modifiedScope}
                  onChange={(e) => setModifiedScope(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Executive Notes & Audit Remarks (Optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  activeModal === 'REJECT'
                    ? 'State rationale for rejecting recommendation (e.g. conflicting enterprise contract underway)...'
                    : 'Add implementation instructions for regional VPs and commercial operations...'
                }
                rows={3}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => submitDecision(activeModal)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeModal === 'APPROVE'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : activeModal === 'MODIFY'
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                Confirm {activeModal} Signoff
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
