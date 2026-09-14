import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  BrainCircuit, 
  Calculator, 
  Layers, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { ARCHITECTURE_COMPONENTS, AgentDescriptor } from '../state/orchestratorEngine';

interface OrchestratorToolMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrchestratorToolMatrixModal: React.FC<OrchestratorToolMatrixModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-orch');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'REASONING_AGENT' | 'ANALYTICAL_SERVICE'>('ALL');

  if (!isOpen) return null;

  const reasoningAgents = ARCHITECTURE_COMPONENTS.filter((c) => c.category === 'REASONING_AGENT');
  const analyticalServices = ARCHITECTURE_COMPONENTS.filter((c) => c.category === 'ANALYTICAL_SERVICE');

  const displayedComponents = ARCHITECTURE_COMPONENTS.filter((c) => {
    if (filterCategory === 'ALL') return true;
    return c.category === filterCategory;
  });

  const selectedAgent = ARCHITECTURE_COMPONENTS.find((c) => c.id === selectedAgentId) || ARCHITECTURE_COMPONENTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Agent & Service Architecture Matrix"
        className="w-full max-w-6xl max-h-[92vh] bg-[#0c0e15] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#101626] to-[#0c0e15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Analysis tools used
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  5 Agents + 4 Services
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounded pairing: High-capability reasoning LLMs handle planning and logic; deterministic numerical engines calculate metrics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterCategory === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Components (9)
            </button>
            <button
              onClick={() => setFilterCategory('REASONING_AGENT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                filterCategory === 'REASONING_AGENT'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>5 Reasoning Agents</span>
            </button>
            <button
              onClick={() => setFilterCategory('ANALYTICAL_SERVICE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                filterCategory === 'ANALYTICAL_SERVICE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>4 Analytical Services</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Ingest Active
            </span>
          </div>
        </div>

        {/* Content: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Component List */}
          <div className="lg:col-span-7 p-6 overflow-y-auto bg-[#0a0c12] space-y-3">
            {displayedComponents.map((comp) => {
              const isSelected = selectedAgent?.id === comp.id;
              const isAgent = comp.category === 'REASONING_AGENT';

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedAgentId(comp.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? isAgent
                        ? 'bg-slate-800/90 border-purple-500/80 shadow-md shadow-purple-950/30 ring-1 ring-purple-500/30'
                        : 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${isAgent ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                          {isAgent ? <Cpu className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {comp.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isAgent 
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {isAgent ? 'REASONING AGENT' : 'DETERMINISTIC SERVICE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {comp.role}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                        {comp.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        {comp.latencyMs}ms
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Component Telemetry Inspector */}
          <div className="lg:col-span-5 p-6 bg-[#0e121b] flex flex-col justify-between space-y-5 overflow-y-auto">
            {selectedAgent ? (
              <div className="space-y-5 text-xs">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
                    Telemetry Inspector · {selectedAgent.id}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {selectedAgent.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedAgent.modelOrRuntime}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                      {selectedAgent.latencyMs}ms Latency
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">Architectural Role & Scope:</span>
                    <p className="text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed text-xs">
                      {selectedAgent.role}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 block mb-1">Core Capabilities:</span>
                    <ul className="space-y-1">
                      {selectedAgent.capabilities.map((cap, idx) => (
                        <li key={idx} className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center gap-2 text-slate-200 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Input Contract</span>
                      <p className="text-[11px] text-slate-300 font-mono">{selectedAgent.inputContract}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase block">Output Contract</span>
                      <p className="text-[11px] text-slate-300 font-mono">{selectedAgent.outputContract}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Execution Resource Utilization:</span>
                    <span className="font-mono font-bold text-white">{selectedAgent.tokensOrOps}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              CorporateBaddie Principle #2: Tools calculate; AI reasons. Separation of stochastic planning from deterministic arithmetic.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
