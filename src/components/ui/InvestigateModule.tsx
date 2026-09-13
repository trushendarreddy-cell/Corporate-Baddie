import React from 'react';
import {
  Search,
  ShieldAlert,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Module header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="cb-kicker text-amber-400/90 flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            Module · Investigate
          </span>
          <h1 className="cb-display text-2xl sm:text-3xl text-white mt-1.5">
            What should I investigate?
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenHostileAuditModal}
            className="cb-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold"
            title="Red-team stress test the recommendations"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hostile Red-Team Audit</span>
            <span className="sm:hidden">Red-Team</span>
          </button>
          <button
            type="button"
            onClick={onOpenFailureModeModal}
            className="cb-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold"
            title="Pre-mortem blind spots and failure modes"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Failure Mode Inspector</span>
            <span className="sm:hidden">Failure Modes</span>
          </button>
          <button
            type="button"
            onClick={onOpenToolMatrixModal}
            className="cb-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
            title="Inspect 5 Reasoning Agents & 4 Analytical Services"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agent & Tool Matrix</span>
            <span className="sm:hidden">Tool Matrix</span>
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
