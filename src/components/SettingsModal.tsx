import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Cpu, 
  GitMerge, 
  Sliders
} from 'lucide-react';
import { InvestigationState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: InvestigationState;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'langgraph' | 'stateJson' | 'agentConfig'>('langgraph');

  if (!isOpen) return null;

  const pythonLangGraphCode = `# =====================================================================
# CORPORATEBADDIE: Python + FastAPI + LangGraph Backend Migration Spec
# =====================================================================
from typing import TypedDict, List, Literal, Optional
from langgraph.graph import StateGraph, END
from pydantic import BaseModel

class InvestigationState(TypedDict):
    run_id: str
    question: str
    question_type: str
    data_quality_percent: float
    evidence_claims: List[dict]
    verified_claims_count: int
    overall_confidence: Literal["LOW", "MEDIUM", "MEDIUM-HIGH", "HIGH"]
    confidence_score: int
    executive_recommendation: str
    key_findings: List[dict]
    market_signals: List[dict]
    strategic_options: List[dict]
    condition_shifts: List[str]

# --- LangGraph Nodes (11-Stage Autonomous Investigation Workflow) ---
def understand_business_question(state: InvestigationState):
    # Parses prompt into commercial objectives and evidentiary hurdle
    return state

def classify_question(state: InvestigationState):
    # Classifies question taxonomy (Diagnostic + Prescriptive)
    return {"question_type": "Diagnostic + Prescriptive"}

def build_investigation_plan(state: InvestigationState):
    # Decomposes problem into price, cohort, territory & product hypotheses
    return state

def profile_business_data(state: InvestigationState):
    # Checks completeness and audits 284,520 transaction rows
    return state

def calculate_core_metrics(state: InvestigationState):
    # Calculates revenue trend (-14.2%) and margin delta
    return state

def investigate_anomalies(state: InvestigationState):
    # Slices dimensions to isolate Product A and Region South
    return state

def investigate_root_causes(state: InvestigationState):
    # Structural causal modeling (DoWhy / SCM DAG decomposition)
    return state

def check_external_market(state: InvestigationState):
    # Queries competitor promotional benchmarks (+18% price blitz)
    return state

def evaluate_possible_actions(state: InvestigationState):
    # Multi-attribute utility simulation (Options A, B, C)
    return state

def verify_evidence(state: InvestigationState):
    # Audits claims against cryptographic ledger hashes
    return state

def build_recommendation(state: InvestigationState):
    # Synthesizes executive brief with falsification reversal triggers
    return state

# --- Construct LangGraph Pipeline ---
workflow = StateGraph(InvestigationState)
workflow.add_node("understand", understand_business_question)
workflow.add_node("classify", classify_question)
workflow.add_node("plan", build_investigation_plan)
workflow.add_node("profile_data", profile_business_data)
workflow.add_node("metrics", calculate_core_metrics)
workflow.add_node("anomalies", investigate_anomalies)
workflow.add_node("root_causes", investigate_root_causes)
workflow.add_node("market_context", check_external_market)
workflow.add_node("evaluate_actions", evaluate_possible_actions)
workflow.add_node("verify_evidence", verify_evidence)
workflow.add_node("recommend", build_recommendation)

# Linear execution with audit checkpoints
workflow.set_entry_point("understand")
workflow.add_edge("understand", "classify")
workflow.add_edge("classify", "plan")
workflow.add_edge("plan", "profile_data")
workflow.add_edge("profile_data", "metrics")
workflow.add_edge("metrics", "anomalies")
workflow.add_edge("anomalies", "root_causes")
workflow.add_edge("root_causes", "market_context")
workflow.add_edge("market_context", "evaluate_actions")
workflow.add_edge("evaluate_actions", "verify_evidence")
workflow.add_edge("verify_evidence", "recommend")
workflow.add_edge("recommend", END)

applet_graph = workflow.compile()
`;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `corporatebaddie_run_${state.runId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Settings and Architecture"
        className="w-full max-w-4xl max-h-[90vh] bg-[#0c0e15] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111622]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Decision workflow & data map
              </h3>
              <p className="text-xs text-slate-400">
                A practical view of how the investigation moves from evidence to recommendation
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800 bg-[#0e121b] text-xs">
          <button
            onClick={() => setActiveTab('langgraph')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'langgraph'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>LangGraph StateGraph (Python)</span>
          </button>

          <button
            onClick={() => setActiveTab('stateJson')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'stateJson'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Active Run JSON Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('agentConfig')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'agentConfig'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Agent Governance Knobs</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300">
          {activeTab === 'langgraph' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-400">
                <span>FastAPI + LangGraph Execution Graph</span>
                <button
                  onClick={() => copyCode(pythonLangGraphCode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Python Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                {pythonLangGraphCode}
              </pre>
            </div>
          )}

          {activeTab === 'stateJson' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-400">
                <span>Complete Investigation JSON Payload</span>
                <button
                  onClick={downloadJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Run JSON</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-[11px] leading-relaxed text-emerald-400/90 max-h-96">
                {JSON.stringify(state, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'agentConfig' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white">Evidence Verification Strictness</h5>
                    <p className="text-slate-400 text-[11px]">Enforces cryptographic DAG node grounding before recommendation</p>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    HIGH (Strict)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <h5 className="font-bold text-white">Causal Significance Threshold</h5>
                    <p className="text-slate-400 text-[11px]">Minimum variance contribution to qualify as a primary failure driver</p>
                  </div>
                  <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    p &lt; 0.01 (68% isolated)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <h5 className="font-bold text-white">Reversal Trigger Monitoring</h5>
                    <p className="text-slate-400 text-[11px]">Continuous telemetry listening for falsification shifts</p>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                    ENABLED (4 Triggers)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0e15] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
