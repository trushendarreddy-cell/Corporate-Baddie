import React from 'react';
import {
  UnifiedInvestigationState,
  InvestigationState,
  InvestigationStage,
  BusinessContext,
  DataSource,
  KeyFinding,
  CitationRef,
} from '../../types';
import { QuestionInput } from '../QuestionInput';
import { InvestigationProgress } from '../InvestigationProgress';
import { InvestigationStatus } from '../InvestigationStatus';
import { QuestionDecomposition } from '../QuestionDecomposition';
import { RootCauseInvestigation } from '../RootCauseInvestigation';
import { KeyFindings } from '../KeyFindings';
import { Charts } from '../Charts';
import { DynamicInvestigationPlanner } from '../DynamicInvestigationPlanner';
import { DECOMPOSED_QUESTIONS } from '../../mockData';

interface InvestigateModuleProps {
  unifiedState: UnifiedInvestigationState;
  investigationState: InvestigationState;
  businessContext: BusinessContext;
  dataSources: DataSource[];
  question: string;
  setQuestion: (q: string) => void;
  onAnalyze: () => void;
  onSkipAnalysis: () => void;
  isAnalyzing: boolean;
  hasAnalyzed: boolean;
  terminalLogs: { timestamp: string; text: string }[];
  currentStageIndex: number;
  stages: InvestigationStage[];
  onOpenUploadModal: () => void;
  onOpenContextModal: () => void;
  attachedDataLabel: string;
  hasCustomContext: boolean;
  onUpdateBusinessContext: (ctx: BusinessContext) => void;
  onToggleDataSource: (id: string) => void;
  onAddSimulatedFile: (name: string, type: 'CSV' | 'Excel') => void;
  onOpenEvidenceGraph: () => void;
  onOpenToolMatrixModal: () => void;
  onOpenHostileAuditModal: () => void;
  onOpenFailureModeModal: () => void;
  onOpenRobustnessModal: () => void;
  onExportBrief: () => void;
  onViewEvidence: (finding: KeyFinding) => void;
  onSelectCitation: (citation: CitationRef) => void;
}

/**
 * INVESTIGATE module — question input, cinematic agent execution pipeline,
 * decomposition, root cause, findings, charts, adaptive planner, audit tools.
 */
export const InvestigateModule: React.FC<InvestigateModuleProps> = ({
  unifiedState,
  investigationState,
  businessContext,
  dataSources,
  question,
  setQuestion,
  onAnalyze,
  onSkipAnalysis,
  isAnalyzing,
  hasAnalyzed,
  terminalLogs,
  currentStageIndex,
  stages,
  onOpenUploadModal,
  onOpenContextModal,
  attachedDataLabel,
  hasCustomContext,
  onUpdateBusinessContext,
  onToggleDataSource,
  onAddSimulatedFile,
  onOpenEvidenceGraph,
  onOpenToolMatrixModal,
  onOpenHostileAuditModal,
  onOpenFailureModeModal,
  onOpenRobustnessModal,
  onExportBrief,
  onViewEvidence,
  onSelectCitation,
}) => {
  const hasReliableInternalEvidence =
    unifiedState.empiricalFindings.length > 0 &&
    !(unifiedState.issues || []).some(
      (issue) => issue.status === 'DATA INSUFFICIENT' || issue.status === 'INVESTIGATION BLOCKED'
    );

  return (
    <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Entry header — the question is the product's first action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b cb-hairline">
        <div>
          <p className="cb-kicker text-amber-400/90">New investigation</p>
          <p className="text-[13px] text-slate-400 mt-1">Ask a question. We will show you what changed, why it matters, and what to do next.</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={onOpenHostileAuditModal}
            className="cb-btn text-[11px] font-medium text-slate-500 hover:text-rose-300"
            title="Red-team stress test the recommendations"
          >
            Red-Team Audit
          </button>
          <button
            type="button"
            onClick={onOpenFailureModeModal}
            className="cb-btn text-[11px] font-medium text-slate-500 hover:text-orange-300"
            title="Pre-mortem blind spots and failure modes"
          >
            Failure Modes
          </button>
          <button
            type="button"
            onClick={onOpenToolMatrixModal}
            className="cb-btn text-[11px] font-medium text-slate-500 hover:text-cyan-300"
            title="Inspect 5 Reasoning Agents & 4 Analytical Services"
          >
            Agent Matrix
          </button>
        </div>
      </div>

      {/* Cinematic agent execution */}
      {isAnalyzing ? (
        <InvestigationProgress
          stages={stages}
          currentStageIndex={currentStageIndex}
          terminalLogs={terminalLogs}
          onSkip={onSkipAnalysis}
        />
      ) : (
        <QuestionInput
          question={question}
          setQuestion={setQuestion}
          onAnalyze={onAnalyze}
          isAnalyzing={isAnalyzing}
          onOpenUploadModal={onOpenUploadModal}
          onOpenContextModal={onOpenContextModal}
          attachedDataLabel={attachedDataLabel}
          hasCustomContext={hasCustomContext}
          businessContext={businessContext}
          onUpdateBusinessContext={onUpdateBusinessContext}
          dataSources={dataSources}
          onToggleDataSource={onToggleDataSource}
          onAddSimulatedFile={onAddSimulatedFile}
        />
      )}

      {/* Findings workspace (after analysis) */}
      {hasAnalyzed && !isAnalyzing && (
        <>
          <InvestigationStatus
            state={investigationState}
            decisionConfidence={unifiedState.recommendationConfidence}
            onOpenEvidenceGraph={onOpenEvidenceGraph}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <QuestionDecomposition
                originalQuestion={unifiedState.userQuestion}
                questions={DECOMPOSED_QUESTIONS}
                onSelectClaim={() => onOpenEvidenceGraph()}
              />
            </div>
            <div className="lg:col-span-6">
              <RootCauseInvestigation
                chain={hasReliableInternalEvidence ? investigationState.rootCauseChain || [] : []}
                onSelectClaim={() => onOpenEvidenceGraph()}
              />
            </div>
          </div>

          <KeyFindings
            findings={unifiedState.empiricalFindings}
            onViewEvidence={onViewEvidence}
            onSelectCitation={onSelectCitation}
          />

          <Charts hasEvidence={hasReliableInternalEvidence} />

          <DynamicInvestigationPlanner
            plan={unifiedState.investigationPlan}
            classifiedQuestionTypes={unifiedState.classifiedQuestionTypes}
            userQuestion={unifiedState.userQuestion}
            anomalies={unifiedState.discoveredAnomalies}
            onSelectNode={() => {}}
          />
        </>
      )}
    </div>
  );
};
