import React, { useState } from 'react';
import { 
  X, 
  Network, 
  ArrowDown, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  AlertTriangle,
  RotateCcw,
  Zap,
  Database,
  Calculator,
  FileText
} from 'lucide-react';
import { DependencyGraphNode, DependencyNodeImpact, EvidenceClaim, ClaimType } from '../types';

interface EvidenceGraphProps {
  claims?: EvidenceClaim[];
  evidenceGraph?: DependencyGraphNode[];
  isOpen: boolean;
  onClose: () => void;
  selectedClaimId?: string | null;
  onSimulateSourceToggle?: (sourceId: string) => void;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({
  claims = [],
  evidenceGraph: initialGraph = [],
  isOpen,
  onClose,
  selectedClaimId: initialClaimId,
  onSimulateSourceToggle,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('node-rec');
  const [filterImpact, setFilterImpact] = useState<string>('ALL');
  const [simulatedDisabledSource, setSimulatedDisabledSource] = useState<string | null>(null);

  if (!isOpen) return null;

  // Derive active graph with live simulated impact propagation
  const nodes: DependencyGraphNode[] = initialGraph.map((node) => {
    if (!simulatedDisabledSource) return node;

    // If simulated disabled source is src-1 (Sales ERP)
    if (simulatedDisabledSource === 'src-1') {
      if (node.id === 'node-src-1' || node.id === 'node-calc-sku' || node.id === 'node-find-2' || node.id === 'node-clm-17') {
        return { ...node, impactStatus: 'DIRECTLY AFFECTED' };
      }
      if (node.id === 'node-clm-27' || node.id === 'node-opt-c' || node.id === 'node-rec' || node.id === 'node-scen-a') {
        return { ...node, impactStatus: 'INDIRECTLY AFFECTED' };
      }
    }
    // If simulated disabled source is src-4 (Regional ERP)
    if (simulatedDisabledSource === 'src-4') {
      if (node.id === 'node-src-4' || node.id === 'node-calc-reg' || node.id === 'node-find-3' || node.id === 'node-clm-24') {
        return { ...node, impactStatus: 'DIRECTLY AFFECTED' };
      }
      if (node.id === 'node-clm-27' || node.id === 'node-opt-c' || node.id === 'node-rec') {
        return { ...node, impactStatus: 'INDIRECTLY AFFECTED' };
      }
    }
    return node;
  });

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const getImpactBadge = (impact: DependencyNodeImpact) => {
    switch (impact) {
      case 'DIRECTLY AFFECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            DIRECTLY AFFECTED
          </span>
        );
      case 'INDIRECTLY AFFECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            INDIRECTLY AFFECTED
          </span>
        );
      case 'UNAFFECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            UNAFFECTED
          </span>
        );
      default:
        return null;
    }
  };

  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case 'RECOMMENDATION':
        return 'bg-amber-400 text-slate-950 font-bold';
      case 'DECISION_OPTION':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      case 'CLAIM':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      case 'EMPIRICAL_FINDING':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      case 'CALCULATION':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
      case 'DATA_SOURCE':
        return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40';
      case 'MARKET_INTEL':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/40';
      case 'SCENARIO_INPUT':
        return 'bg-teal-500/20 text-teal-300 border border-teal-500/40';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  // Group nodes by hierarchy layer
  const recommendationNodes = nodes.filter((n) => n.nodeType === 'RECOMMENDATION');
  const optionNodes = nodes.filter((n) => n.nodeType === 'DECISION_OPTION');
  const scenarioNodes = nodes.filter((n) => n.nodeType === 'SCENARIO_INPUT');
  const claimNodes = nodes.filter((n) => n.nodeType === 'CLAIM');
  const findingNodes = nodes.filter((n) => n.nodeType === 'EMPIRICAL_FINDING');
  const calculationNodes = nodes.filter((n) => n.nodeType === 'CALCULATION');
  const sourceNodes = nodes.filter((n) => n.nodeType === 'DATA_SOURCE' || n.nodeType === 'MARKET_INTEL');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Evidence Graph Inspector"
        className="w-full max-w-7xl max-h-[92vh] cb-glass-raised rounded-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Network className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Evidence Graph & Impact Propagation
                </h3>
                <span className="cb-meta px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  Full End-to-End Traceability
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Traceability: Recommendation → Decision Option → Claims → Findings → Calculations → Data Sources
              </p>
            </div>
          </div>

          {/* Test Sensitivity Removal Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Simulate Source Failure:
            </span>
            <select
              value={simulatedDisabledSource || ''}
              onChange={(e) => setSimulatedDisabledSource(e.target.value || null)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="">All Sources Active (Baseline)</option>
              <option value="src-1">Remove Sales Ledger (src-1)</option>
              <option value="src-4">Remove Regional ERP (src-4)</option>
            </select>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Visual Traceability DAG + Right Node Inspector */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Visual DAG Tree (8 cols) */}
          <div className="lg:col-span-8 p-6 overflow-y-auto bg-[#0a0c12] space-y-6">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>6-Tier Traceability Hierarchy</span>
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-400">● Unaffected</span>
                <span className="text-amber-400">▲ Indirect Impact</span>
                <span className="text-rose-400">■ Direct Impact</span>
              </div>
            </div>

            {/* Layer 1: Recommendation */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Tier 1 · Executive Recommendation
              </span>
              <div className="grid grid-cols-1 gap-2">
                {recommendationNodes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNodeId(n.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      activeNodeId === n.id ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/20' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{n.title}</span>
                      {getImpactBadge(n.impactStatus)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Layer 2: Decision Option & Scenario */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Tier 2 · Decision Option & Scenario Modeling
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[...optionNodes, ...scenarioNodes].map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNodeId(n.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      activeNodeId === n.id ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/20' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-300">{n.nodeType}</span>
                      {getImpactBadge(n.impactStatus)}
                    </div>
                    <span className="text-xs font-bold text-slate-200 block">{n.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Layer 3: Claims */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Tier 3 · Grounded Evidence Claims
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {claimNodes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNodeId(n.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      activeNodeId === n.id ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/20' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-400">{n.id}</span>
                      {getImpactBadge(n.impactStatus)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block">{n.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Layer 4: Findings */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Tier 4 · Empirical Dataset Findings
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {findingNodes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNodeId(n.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activeNodeId === n.id ? 'bg-slate-800 border-blue-400 ring-2 ring-blue-400/20' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold text-blue-300">FINDING</span>
                      {getImpactBadge(n.impactStatus)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Layer 5: Calculations */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                Tier 5 · Mathematical Calculations & Aggregations
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {calculationNodes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNodeId(n.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activeNodeId === n.id ? 'bg-slate-800 border-purple-400 ring-2 ring-purple-400/20' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold text-purple-300">SQL AGG</span>
                      {getImpactBadge(n.impactStatus)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Layer 6: Data Sources */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                Tier 6 · Ingested Enterprise Data Sources & External Intel
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {sourceNodes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNodeId(n.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activeNodeId === n.id ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-400/20' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold text-indigo-300">CONNECTOR</span>
                      {getImpactBadge(n.impactStatus)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Node Inspector (4 cols) */}
          <div className="lg:col-span-4 p-6 bg-[#0e121b] flex flex-col justify-between space-y-6">
            {activeNode ? (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Node Traceability Inspector
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {activeNode.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getNodeTypeBadge(activeNode.nodeType)}`}>
                      {activeNode.nodeType}
                    </span>
                    {getImpactBadge(activeNode.impactStatus)}
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Description</span>
                    <p className="text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {activeNode.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Direct Parent Dependencies</span>
                    {activeNode.dependencies.length > 0 ? (
                      <div className="space-y-1">
                        {activeNode.dependencies.map((depId) => {
                          const depNode = nodes.find((n) => n.id === depId);
                          return (
                            <div
                              key={depId}
                              onClick={() => setActiveNodeId(depId)}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800 text-[11px]"
                            >
                              <span className="text-slate-300 truncate">{depNode ? depNode.title : depId}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Root input node (No parents)</p>
                    )}
                  </div>

                  {activeNode.impactStatus !== 'UNAFFECTED' && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Impact Propagation Active</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        This node is affected by deactivated or degraded upstream data dependencies. Its empirical validity score has been downgraded.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select a node to inspect its parents, dependencies, and impact status
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Traceability guarantee: Every prescriptive claim is mathematically connected to verified data records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
