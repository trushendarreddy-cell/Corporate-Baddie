import React from 'react';
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
    <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b cb-hairline">
        <div>
          <p className="cb-kicker">Module</p>
          <h1 className="cb-display text-[26px] sm:text-[32px] text-white mt-2">
            Decisions
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenRobustnessModal}
            className="cb-btn px-3 py-1.5 rounded-md text-[12.5px] font-medium text-slate-400 hover:text-cyan-300 border border-transparent hover:border-cyan-500/25 hover:bg-cyan-950/20"
          >
            Robustness Test
          </button>
          <button
            type="button"
            onClick={onExportBrief}
            className="cb-btn px-3 py-1.5 rounded-md text-[12.5px] font-medium text-slate-400 hover:text-amber-300 border border-transparent hover:border-amber-500/25 hover:bg-amber-950/20"
            title="Export executive brief PDF"
          >
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
      <div className="flex items-baseline justify-between pt-2">
        <h2 className="cb-kicker">What-If · Strategy Laboratory</h2>
        <span className="cb-meta">Modelled Estimate</span>
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
