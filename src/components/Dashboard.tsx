import React from 'react';
import { 
  SlidersHorizontal, 
  Download, 
  Scale, 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  History, 
  Sparkles,
  Layers,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { 
  UnifiedInvestigationState, 
  InvestigationState, 
  BusinessContext, 
  DataSource, 
  DecisionRecord, 
  KeyFinding, 
  CitationRef,
  MultiScenarioItem,
  ScenarioParams,
  ScenarioResult
} from '../types';
import { ExecutiveDecision } from './ExecutiveDecision';
import { InvestigationStatus } from './InvestigationStatus';
import { KeyFindings } from './KeyFindings';
import { Charts } from './Charts';
import { DynamicInvestigationPlanner } from './DynamicInvestigationPlanner';
import { DecisionRoom } from './DecisionRoom';
import { ScenarioSimulator } from './ScenarioSimulator';
import { ConfidencePanel } from './ConfidencePanel';
import { RiskRadar } from './RiskRadar';
import { RiskPanel } from './RiskPanel';
import { OpportunityRadar } from './OpportunityRadar';
import { MarketIntelligence } from './MarketIntelligence';
import { CompetitorIntelligence } from './CompetitorIntelligence';
import { TrendRadar } from './TrendRadar';
import { QuestionDecomposition } from './QuestionDecomposition';
import { RootCauseInvestigation } from './RootCauseInvestigation';
import { WhyThisRecommendation } from './WhyThisRecommendation';
import { BusinessDecisionMemory } from './BusinessDecisionMemory';
import { HumanDecision } from './HumanDecision';
import { AskCorporateBaddie } from './AskCorporateBaddie';
import { 
  DECISION_ROOM_OPTIONS, 
  RISK_RADAR_ITEMS, 
  OPPORTUNITY_RADAR_ITEMS, 
  COMPETITOR_LANDSCAPE, 
  TREND_RADAR_ITEMS, 
  EMERGING_SIGNALS,
  DECOMPOSED_QUESTIONS
} from '../mockData';

interface DashboardProps {
  unifiedState: UnifiedInvestigationState;
  investigationState: InvestigationState;
  businessContext: BusinessContext;
  dataSources: DataSource[];
  decisionRecord: DecisionRecord;
  onRecordDecision: (rec: DecisionRecord) => void;
  onOpenEvidenceGraph: () => void;
  onExportBrief: () => void;
  onSelectCitation: (citation: CitationRef) => void;
  onOpenVersionHistory: () => void;
  onOpenRobustnessModal: () => void;
  onOpenHostileAuditModal: () => void;
  onOpenFailureModeModal: () => void;
  onOpenToolMatrixModal: () => void;
  onViewEvidence: (finding: KeyFinding) => void;
  onApplyScenarioToDecision?: (sc: MultiScenarioItem) => void;
  onParamsChange?: (params: ScenarioParams, result: ScenarioResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  unifiedState,
  investigationState,
  businessContext,
  dataSources,
  decisionRecord,
  onRecordDecision,
  onOpenEvidenceGraph,
  onExportBrief,
  onSelectCitation,
  onOpenVersionHistory,
  onOpenRobustnessModal,
  onOpenHostileAuditModal,
  onOpenFailureModeModal,
  onOpenToolMatrixModal,
  onViewEvidence,
  onApplyScenarioToDecision,
  onParamsChange,
}) => {
  const hasReliableInternalEvidence = unifiedState.empiricalFindings.length > 0 && !(unifiedState.issues || []).some((issue) =>
    issue.status === 'DATA INSUFFICIENT' || issue.status === 'INVESTIGATION BLOCKED'
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Action Bar for 2.0 Audits & Modal Launchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0f1422] to-[#0c0e15] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">
            CorporateBaddie 2.0 Decision Intelligence Suite
          </span>
          <span className="hidden sm:inline-block text-slate-500">•</span>
          <span className="hidden sm:inline-block text-xs text-slate-400">
            Falsifiable Evidentiary Graph Active
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenHostileAuditModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all shadow-sm"
            title="Red-team stress test the recommendations"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Hostile Red-Team Audit</span>
          </button>

          <button
            type="button"
            onClick={onOpenFailureModeModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all shadow-sm"
            title="Pre-mortem blind spots and failure modes"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>Failure Mode Inspector</span>
          </button>

          <button
            type="button"
            onClick={onOpenToolMatrixModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all shadow-sm"
            title="Inspect 5 Reasoning Agents & 4 Analytical Services"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agent & Tool Matrix</span>
          </button>

          <button
            type="button"
            onClick={onExportBrief}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            title="Export 16-point executive decision dossier PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Brief (PDF)</span>
          </button>
        </div>
      </div>

      {unifiedState.issues && unifiedState.issues.length > 0 && (
        <div className="space-y-2">
          {unifiedState.issues.map((issue) => (
            <div key={`${issue.status}-${issue.failedComponent}`} className="p-3 rounded-xl bg-rose-950/25 border border-rose-900/60 text-xs">
              <div className="flex flex-wrap items-center gap-2 font-bold text-rose-300">
                <span>{issue.status}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">{issue.failedComponent}</span>
                <span className="text-amber-300">Confidence {issue.confidenceDelta}%</span>
              </div>
              <p className="mt-1 text-slate-300">{issue.impact}</p>
              <p className="mt-1 text-cyan-300">Next action: {issue.nextAction}</p>
            </div>
          ))}
        </div>
      )}

      {/* 1. Executive Decision Summary Banner */}
      <ExecutiveDecision
        state={unifiedState}
        onOpenEvidenceGraph={onOpenEvidenceGraph}
        onExportBrief={onExportBrief}
        onSelectCitation={onSelectCitation}
        onOpenVersionHistory={onOpenVersionHistory}
        onOpenRobustnessModal={onOpenRobustnessModal}
      />

      {/* 2. Investigation Status Bar */}
      {hasReliableInternalEvidence ? (
        <InvestigationStatus
          state={investigationState}
          decisionConfidence={unifiedState.recommendationConfidence}
          onOpenEvidenceGraph={onOpenEvidenceGraph}
        />
      ) : (
        <div className="w-full bg-rose-950/20 border border-rose-900/60 rounded-xl p-4 text-xs text-rose-200">
          <strong>INVESTIGATION BLOCKED:</strong> Legacy demo status metrics are withheld because this run has no validated internal evidence.
        </div>
      )}

      {/* 3. Question Decomposition & Root Cause Investigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <QuestionDecomposition
            originalQuestion={unifiedState.userQuestion}
            questions={DECOMPOSED_QUESTIONS}
            onSelectClaim={(claimId) => onOpenEvidenceGraph()}
          />
        </div>
        <div className="lg:col-span-6">
          <RootCauseInvestigation
            chain={hasReliableInternalEvidence ? investigationState.rootCauseChain || [] : []}
            onSelectClaim={(claimId) => onOpenEvidenceGraph()}
          />
        </div>
      </div>

      {/* 4. Empirical Key Findings with Epistemic Badges */}
      <KeyFindings
        findings={unifiedState.empiricalFindings}
        onViewEvidence={onViewEvidence}
        onSelectCitation={onSelectCitation}
      />

      {/* 5. Quantitative Evidence Charts */}
      <Charts hasEvidence={hasReliableInternalEvidence} />

      {/* 6. Adaptive Investigation Planner & Non-Static Execution Graph */}
      <DynamicInvestigationPlanner
        plan={unifiedState.investigationPlan}
        classifiedQuestionTypes={unifiedState.classifiedQuestionTypes}
        userQuestion={unifiedState.userQuestion}
        anomalies={unifiedState.discoveredAnomalies}
        onSelectNode={(nodeId) => {}}
      />

      {/* 7. Decision Room: Strategic Options Appraisal */}
      {hasReliableInternalEvidence ? (
        <DecisionRoom
          options={DECISION_ROOM_OPTIONS}
          decisionConfidence={unifiedState.recommendationConfidence.overallScore}
          decisionConfidenceLabel="Decision Confidence"
          onSelectOption={(optId) => {}}
        />
      ) : (
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-5 text-xs text-rose-200">
          <strong>INVESTIGATION BLOCKED:</strong> Decision options remain hidden until the required evidence is validated.
        </div>
      )}

      {/* 8. "What If?" Multi-Scenario Simulation Engine */}
      {hasReliableInternalEvidence ? (
        <ScenarioSimulator
          scenarios={unifiedState.scenarioResults}
          onParamsChange={onParamsChange}
          onApplyScenarioToDecision={onApplyScenarioToDecision}
        />
      ) : (
        <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5 text-xs text-amber-200">
          <strong>FORECAST UNRELIABLE:</strong> Scenario outputs are withheld because the input ledger is unavailable.
        </div>
      )}

      {/* 9. Transparent Confidence Model & Reversal Triggers */}
      <ConfidencePanel
        confidenceModel={unifiedState.recommendationConfidence}
        counterfactual={unifiedState.counterfactual}
        onOpenRobustnessModal={onOpenRobustnessModal}
      />

      {/* 10. Risk & Opportunity Radars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <RiskRadar risks={RISK_RADAR_ITEMS} decisionConfidence={unifiedState.recommendationConfidence.overallScore} />
        </div>
        <div className="lg:col-span-6">
          <OpportunityRadar opportunities={OPPORTUNITY_RADAR_ITEMS} />
        </div>
      </div>

      {/* 11. Market & Competitor Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          {unifiedState.marketIntelligence.length > 0 ? (
            <CompetitorIntelligence competitors={COMPETITOR_LANDSCAPE} />
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#0b0e15] p-5 text-xs text-slate-400">Market Search was not selected for this question; external claims are withheld.</div>
          )}
        </div>
        <div className="lg:col-span-6">
          <TrendRadar trends={TREND_RADAR_ITEMS} signals={EMERGING_SIGNALS} />
        </div>
      </div>

      {/* 12. Why This Recommendation & Guardrails */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <WhyThisRecommendation onOpenEvidenceGraph={onOpenEvidenceGraph} />
        </div>
        <div className="lg:col-span-4">
          <RiskPanel risks={investigationState.risksAndLimitations || []} />
        </div>
      </div>

      {/* 13. Organizational Decision Memory */}
      <BusinessDecisionMemory />

      {/* 14. Human-In-The-Loop Governance Sign-Off */}
      <HumanDecision
        decision={decisionRecord}
        onRecordDecision={onRecordDecision}
      />

      {/* 15. Grounded Q&A Assistant */}
      <AskCorporateBaddie
        onSelectClaim={() => onOpenEvidenceGraph()}
      />
    </div>
  );
};
