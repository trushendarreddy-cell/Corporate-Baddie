import React from 'react';
import { Scale, Sliders, FlaskConical, FileSignature } from 'lucide-react';
import {
  UnifiedInvestigationState,
  InvestigationState,
  BusinessContext,
  DataSource,
  DecisionRecord,
  MultiScenarioItem,
  ScenarioParams,
  ScenarioResult,
  CitationRef,
} from '../../types';
import { DecisionRoom } from '../DecisionRoom';
import { ScenarioSimulator } from '../ScenarioSimulator';
import { WhyThisRecommendation } from '../WhyThisRecommendation';
import { ConfidencePanel } from '../ConfidencePanel';
import { HumanDecision } from '../HumanDecision';
import { ExecutiveDecision } from '../ExecutiveDecision';
import { DECISION_ROOM_OPTIONS } from '../../mockData';

interface DecisionsModuleProps {
  unifiedState: UnifiedInvestigationState;
  investigationState: InvestigationState;
  businessContext: BusinessContext;
  dataSources: DataSource[];
  decisionRecord: DecisionRecord;
  onRecordDecision: (rec: DecisionRecord) => void;
  onOpenEvidenceGraph: () => void;
  onOpenRobustnessModal: () => void;
  onExportBrief: () => void;
  onApplyScenarioToDecision?: (sc: MultiScenarioItem) => void;
  onParamsChange?: (params: ScenarioParams, result: ScenarioResult) => void;
  onSelectCitation: (citation: CitationRef) => void;
}

/**
 * DECISIONS module — decision room, what-if strategy lab, recommendation
 * rationale, confidence model, governance sign-off.
 */
export const DecisionsModule: React.FC<DecisionsModuleProps> = ({
  unifiedState,
  investigationState,
  decisionRecord,
  onRecordDecision,
  onOpenEvidenceGraph,
  onOpenRobustnessModal,
  onExportBrief,
  onApplyScenarioToDecision,
  onParamsChange,
  onSelectCitation,
}) => {
  const hasReliableInternalEvidence =
    unifiedState.empiricalFindings.length > 0 &&
    !(unifiedState.issues || []).some(
      (issue) => issue.status === 'DATA INSUFFICIENT' || issue.status === 'INVESTIGATION BLOCKED'
    );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="cb-kicker text-amber-400/90 flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" />
            Module · Decisions
          </span>
          <h1 className="cb-display text-2xl sm:text-3xl text-white mt-1.5">
            Decision Room & Strategy Lab
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenRobustnessModal}
            className="cb-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
          >
            <Sliders className="w-3.5 h-3.5" />
            Robustness Test
          </button>
          <button
            type="button"
            onClick={onExportBrief}
            className="cb-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
            title="Export executive brief PDF"
          >
            <FileSignature className="w-3.5 h-3.5" />
            Export Brief
          </button>
        </div>
      </div>

      {/* Full executive decision synthesis with citations */}
      <ExecutiveDecision
        state={unifiedState}
        onOpenEvidenceGraph={onOpenEvidenceGraph}
        onExportBrief={onExportBrief}
        onSelectCitation={onSelectCitation}
        onOpenRobustnessModal={onOpenRobustnessModal}
      />

      {/* Decision Room: option cards + progressive disclosure (existing logic) */}
      {hasReliableInternalEvidence ? (
        <DecisionRoom
          options={DECISION_ROOM_OPTIONS}
          decisionConfidence={unifiedState.recommendationConfidence.overallScore}
          decisionConfidenceLabel="Decision Confidence"
          onSelectOption={() => {}}
        />
      ) : (
        <div className="cb-glass rounded-2xl p-5 text-xs text-rose-200">
          <strong>INVESTIGATION BLOCKED:</strong> Decision options remain hidden until the required evidence is validated.
        </div>
      )}

      {/* What-If Strategy Lab */}
      <div className="flex items-center gap-2 pt-2">
        <FlaskConical className="w-4 h-4 text-amber-400" />
        <h2 className="cb-kicker text-slate-400">What-If · Strategy Laboratory</h2>
      </div>
      {hasReliableInternalEvidence ? (
        <ScenarioSimulator
          scenarios={unifiedState.scenarioResults}
          onParamsChange={onParamsChange}
          onApplyScenarioToDecision={onApplyScenarioToDecision}
        />
      ) : (
        <div className="cb-glass rounded-2xl p-5 text-xs text-amber-200">
          <strong>FORECAST UNRELIABLE:</strong> Scenario outputs are withheld because the input ledger is unavailable.
        </div>
      )}

      {/* Why this recommendation */}
      <WhyThisRecommendation onOpenEvidenceGraph={onOpenEvidenceGraph} />

      {/* Transparent confidence + reversal triggers */}
      <ConfidencePanel
        confidenceModel={unifiedState.recommendationConfidence}
        counterfactual={unifiedState.counterfactual}
        conditionShifts={investigationState.conditionShifts || []}
        onOpenRobustnessModal={onOpenRobustnessModal}
      />

      {/* Governance sign-off */}
      <HumanDecision decision={decisionRecord} onRecordDecision={onRecordDecision} />
    </div>
  );
};
