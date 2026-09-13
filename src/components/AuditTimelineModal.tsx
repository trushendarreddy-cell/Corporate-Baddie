import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  GitCommit, 
  ArrowDown, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Sliders, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditEvents: AuditEvent[];
}

export const AuditTimelineModal: React.FC<AuditTimelineModalProps> = ({
  isOpen,
  onClose,
  auditEvents,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(auditEvents[0]?.id || null);

  if (!isOpen) return null;

  const selectedEvent = auditEvents.find((e) => e.id === selectedEventId) || auditEvents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Investigation Audit Timeline"
        className="w-full max-w-4xl bg-[#0e121b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111622] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Investigation Replay & Audit Timeline
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                  Deterministic State Transitions
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Immutable event stream documenting agents, triggers, empirical conclusions, and confidence impacts
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

        {/* Content Body: Left Timeline (5 cols) + Right Detail Inspector (7 cols) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Timeline */}
          <div className="md:col-span-5 p-5 overflow-y-auto bg-[#0a0c12] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Sequential State Transitions ({auditEvents.length} Events)
            </span>

            <div className="space-y-2">
              {auditEvents.map((evt, idx) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-purple-500/80 shadow-md shadow-purple-950/30 ring-1 ring-purple-500/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-purple-300 font-bold">
                        STEP 0{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {evt.timestamp.split(' ')[1] || evt.timestamp}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-0.5">
                      {evt.eventName}
                    </h4>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {evt.component}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Inspector */}
          <div className="md:col-span-7 p-6 bg-[#0e121b] flex flex-col justify-between space-y-4">
            {selectedEvent ? (
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                    Audit Log · {selectedEvent.id}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {selectedEvent.eventName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 text-slate-400 text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>Agent: {selectedEvent.component}</span>
                    <span className="text-slate-600">•</span>
                    <span>{selectedEvent.timestamp}</span>
                  </div>
                </div>

                {/* Input Trigger */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">Input Trigger</span>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed">
                    {selectedEvent.inputTrigger}
                  </div>
                </div>

                {/* Output Summary */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">Output Produced</span>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 leading-relaxed">
                    {selectedEvent.outputSummary}
                  </div>
                </div>

                {/* Affected Claims & Confidence Impact */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Affected Claims
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.affectedClaimIds.length > 0 ? (
                        selectedEvent.affectedClaimIds.map((c) => (
                          <span key={c} className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Confidence Impact
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs block">
                      {selectedEvent.confidenceImpact}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select an audit event from the left to inspect state transition logs
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Investigation Replay Integrity: 100% Deterministic</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111622] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Every meaningful state transition is recorded for compliance auditability.
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
