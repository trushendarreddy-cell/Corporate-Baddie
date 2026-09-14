import React, { useState } from 'react';
import { 
  GitPullRequest, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Compass, 
  AlertCircle,
  HelpCircle,
  Clock,
  Ban,
  Database,
  Tag,
  Share2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  ExecutionGraphNode, 
  QuestionClassification, 
  ExecutionNodeStatus, 
  DiscoveredAnomaly, 
  DynamicInvestigationTask 
} from '../types';

interface DynamicInvestigationPlannerProps {
  tasks?: DynamicInvestigationTask[];
  plan?: ExecutionGraphNode[];
  classifiedQuestionTypes?: QuestionClassification[];
  userQuestion?: string;
  anomalies?: DiscoveredAnomaly[];
  onSelectNode?: (nodeId: string) => void;
}

export const DynamicInvestigationPlanner: React.FC<DynamicInvestigationPlannerProps> = ({
  plan = [],
  classifiedQuestionTypes = ['Diagnostic', 'Prescriptive'],
  userQuestion,
  anomalies = [],
  onSelectNode,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(plan[0]?.id || 'plan-4');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const selectedNode = plan.find((n) => n.id === selectedNodeId) || plan[0];

  const getStatusBadge = (status: ExecutionNodeStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" />
            RUNNING
          </span>
        );
      case 'PLANNED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            PLANNED
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800">
            SKIPPED
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Ban className="w-3 h-3" />
            BLOCKED
          </span>
        );
      case 'REQUIRES MORE DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <Database className="w-3 h-3" />
            REQUIRES MORE DATA
          </span>
        );
      default:
        return null;
    }
  };

  const filteredNodes = plan.filter((node) => {
    if (filterStatus === 'ALL') return true;
    return node.status === filterStatus;
  });

  return (
    <div id="dynamic-planner-section" className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                What we're checking
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                Execution path
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dynamically classifies question vectors, profiles source availability, and spawns recursive diagnostic branches upon discovering empirical anomalies
            </p>
          </div>
        </div>

        {/* Question Classification Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1">
            Classification:
          </span>
          {classifiedQuestionTypes.map((type) => (
            <span
              key={type}
              className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Adaptive Anomaly Trigger Alert Banner */}
      <div className="bg-amber-500/5 border-b border-amber-500/20 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">
            {anomalies.length > 0
              ? `Evidence branch available: ${anomalies.length} anomaly signal${anomalies.length === 1 ? '' : 's'} supplied by the current run.`
              : 'No anomaly branch is available from the current evidence.'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {plan.filter((p) => p.isAdaptiveBranch).length} Dynamic Branches Spawned
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Status Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['ALL', 'COMPLETED', 'REQUIRES MORE DATA', 'BLOCKED', 'PLANNED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-slate-400 text-xs font-mono">
            Showing {filteredNodes.length} of {plan.length} Graph Nodes
          </span>
        </div>

        {/* 2-Column Layout: Execution Graph List (Left) + Node Inspector (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Execution Steps Tree */}
          <div className="lg:col-span-7 space-y-2.5">
            {filteredNodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onSelectNode) onSelectNode(node.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-slate-800/80 border-cyan-500/60 shadow-md shadow-cyan-950/20'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">
                          0{index + 1}.
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                          {node.label}
                        </h4>
                        {node.isAdaptiveBranch && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            Adaptive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                        {node.summary}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {getStatusBadge(node.status)}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                    </div>
                  </div>

                  {/* Prerequisites connector indicator */}
                  {node.prerequisiteIds.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>Depends on:</span>
                      <span className="text-slate-400">{node.prerequisiteIds.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Node Inspector */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Investigation Node Inspection
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {selectedNode.label}
                    </h4>
                    <span className="text-xs text-cyan-400 font-medium">
                      Dimension: {selectedNode.dimension}
                    </span>
                  </div>
                  <div>{getStatusBadge(selectedNode.status)}</div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Execution Summary</span>
                    <p className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {selectedNode.summary}
                    </p>
                  </div>

                  {selectedNode.whySelected && (
                    <div>
                      <span className="text-cyan-300 font-bold block mb-1">Why This Tool Was Selected</span>
                      <p className="text-slate-300 bg-cyan-950/20 p-3 rounded-lg border border-cyan-900/50 leading-relaxed">
                        {selectedNode.whySelected}
                      </p>
                    </div>
                  )}

                  {selectedNode.inputRequired && (
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Required Input</span>
                      <p className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {selectedNode.inputRequired.join(', ')}
                      </p>
                    </div>
                  )}

                  {selectedNode.sufficiencyCheck && (
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Output Sufficiency Gate</span>
                      <p className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {selectedNode.sufficiencyCheck}
                      </p>
                    </div>
                  )}

                  {selectedNode.evidenceFound && (
                    <div>
                      <span className="text-emerald-400 font-bold block mb-1">Evidence Discovered</span>
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-200">
                        {selectedNode.evidenceFound}
                      </div>
                    </div>
                  )}

                  {selectedNode.requiresDataSourceId && (
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Required Ingestion Source</span>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                        <span>Connector ID: {selectedNode.requiresDataSourceId}</span>
                        <span className={selectedNode.status === 'REQUIRES MORE DATA' || selectedNode.status === 'BLOCKED' ? 'text-rose-400' : 'text-cyan-300'}>
                          {selectedNode.status === 'REQUIRES MORE DATA' || selectedNode.status === 'BLOCKED' ? 'Unavailable' : 'Required'}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedNode.anomalyDetected && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Empirical Anomaly Confirmed</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Variance exceeded normal portfolio bounds (&gt;15% deviation). The planner spawned a dedicated branch to isolate cross-factor interactions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select an investigation step to inspect execution details
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Deterministic planner execution graph: No private reasoning exposed. All steps grounded in verifiable data artifacts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
