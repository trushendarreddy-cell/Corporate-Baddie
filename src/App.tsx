import React, { useState, useEffect } from 'react';
import {
  UnifiedInvestigationState,
  InvestigationState,
  BusinessContext,
  DataSource,
  DecisionRecord,
  InvestigationRun,
  KeyFinding,
  EvidenceClaim,
  CitationRef,
  MultiScenarioItem,
  ScenarioParams,
  ScenarioResult,
  RobustnessTestComparison,
  InvestigationStage,
} from './types';
import {
  PRIMARY_INVESTIGATION,
  DEFAULT_BUSINESS_CONTEXT,
  DEFAULT_DATA_SOURCES,
  DECISION_ROOM_OPTIONS,
  RISK_RADAR_ITEMS,
} from './mockData';
import {
  buildUnifiedInvestigationState,
  recomputeStateWithRemovedSource,
  DEFAULT_EVIDENCE_GRAPH,
} from './state/investigationEngine';
import {
  executeInvestigation,
  applyExecutionOutcomeToState,
  deriveDisplayStages,
  type ExecutionOutcome,
} from './state/executionEngine';
import { exportInvestigationToPDF } from './utils/pdfExport';
import { calculateDecisionConfidence } from './state/confidenceEngine';

import { CommandHeader, ModuleTab } from './components/ui/CommandHeader';
import type { CoreNodeAction } from './components/ui/DecisionCore3D';
import { ExecutiveDashboard } from './components/ui/ExecutiveDashboard';
import { InvestigateModule } from './components/ui/InvestigateModule';
import { DecisionsModule } from './components/ui/DecisionsModule';
import { EvidenceModule } from './components/ui/EvidenceModule';
import { SignalsModule } from './components/ui/SignalsModule';
import { HistoryModule } from './components/ui/HistoryModule';

import { HowItWorksModal } from './components/HowItWorksModal';
import { SettingsModal } from './components/SettingsModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { EvidenceGraph } from './components/EvidenceGraph';
import { EvidenceDetailModal } from './components/EvidenceDetailModal';
import { RobustnessTestModal } from './components/RobustnessTestModal';
import { HostileAuditModal } from './components/HostileAuditModal';
import { FailureModeInspector } from './components/FailureModeInspector';
import { OrchestratorToolMatrixModal } from './components/OrchestratorToolMatrixModal';
import { UploadDataModal, ContextModal } from './components/ContextUploadModals';
import { AskCorporateBaddie } from './components/AskCorporateBaddie';

export default function App() {
  const [question, setQuestion] = useState<string>(
    'Our sales have fallen over the last six months. Find the major drivers and recommend what management should do next.'
  );
  const [businessContext, setBusinessContext] = useState<BusinessContext>(DEFAULT_BUSINESS_CONTEXT);
  const [dataSources, setDataSources] = useState<DataSource[]>(DEFAULT_DATA_SOURCES);
  const [attachedDataLabel, setAttachedDataLabel] = useState<string>('Connected Datasets (5 Active Sources)');
  const [hasCustomContext, setHasCustomContext] = useState<boolean>(false);

  // Module navigation
  // Start with the product's question, not a pre-filled dashboard.
  const [activeTab, setActiveTab] = useState<ModuleTab>('investigate');

  // Investigation Execution State
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentToolIndex, setCurrentToolIndex] = useState<number>(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [executedTools, setExecutedTools] = useState<string[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<{ timestamp: string; text: string }[]>([]);
  // Real executed stages from the execution engine (falls back to demo stages).
  const [displayStages, setDisplayStages] = useState<InvestigationStage[]>(PRIMARY_INVESTIGATION.stages || []);

  // Active Data State
  const [investigationState, setInvestigationState] = useState<InvestigationState>(PRIMARY_INVESTIGATION);
  const [unifiedState, setUnifiedState] = useState<UnifiedInvestigationState>(() =>
    buildUnifiedInvestigationState({
      runId: 'RUN-004',
      userQuestion: question,
      businessContext: DEFAULT_BUSINESS_CONTEXT,
      dataSources: DEFAULT_DATA_SOURCES,
    })
  );

  const [decisionRecord, setDecisionRecord] = useState<DecisionRecord>({
    decision: null,
    timestamp: '2026-09-12 16:41:48 UTC',
  });

  // Version History Runs
  const [runs, setRuns] = useState<InvestigationRun[]>([
    {
      id: 'RUN-004',
      question: 'Our sales have fallen over the last six months. Find the major drivers and recommend what management should do next.',
      timestamp: '2026-09-12 16:41:48 UTC',
      dataQualityPercent: 91,
      overallConfidence: unifiedState.recommendationConfidence.level,
      confidenceScore: unifiedState.recommendationConfidence.overallScore,
      executiveRecommendation: 'Prioritize Product A in Region South and run a controlled pricing/marketing intervention.',
      businessContext: DEFAULT_BUSINESS_CONTEXT,
      investigationState: PRIMARY_INVESTIGATION,
      decisionRecord: null,
      selectedOptionId: 'opt-1',
    },
    {
      id: 'RUN-003',
      question: 'Evaluate whether increasing marketing spend or adjusting pricing yields higher risk-adjusted return.',
      timestamp: '2026-09-11 14:18:22 UTC',
      dataQualityPercent: 88,
      overallConfidence: unifiedState.recommendationConfidence.level,
      confidenceScore: unifiedState.recommendationConfidence.overallScore,
      executiveRecommendation: 'Reject nationwide marketing expansion; target regional value bundle to protect 38% gross margin hurdle.',
      businessContext: DEFAULT_BUSINESS_CONTEXT,
      investigationState: PRIMARY_INVESTIGATION,
      decisionRecord: {
        decision: 'APPROVE',
        timestamp: '2026-09-11 15:02:10 UTC',
        signoffUser: 'Priya Sharma (VP Commercial Ops)',
        executiveNotes: 'Approved ₹2.8L regional pilot test with weekly review cadence.',
      },
      selectedOptionId: 'opt-1',
    },
  ]);

  // Modals visibility
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isEvidenceGraphOpen, setIsEvidenceGraphOpen] = useState(false);
  const [isRobustnessModalOpen, setIsRobustnessModalOpen] = useState(false);
  const [isHostileAuditModalOpen, setIsHostileAuditModalOpen] = useState(false);
  const [isFailureModeModalOpen, setIsFailureModeModalOpen] = useState(false);
  const [isToolMatrixModalOpen, setIsToolMatrixModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Deep inspection selection
  const [selectedFindingForEvidence, setSelectedFindingForEvidence] = useState<KeyFinding | null>(null);
  const [selectedClaimForEvidence, setSelectedClaimForEvidence] = useState<EvidenceClaim | null>(null);
  const [robustnessComparison, setRobustnessComparison] = useState<RobustnessTestComparison | undefined>(undefined);
  const [scenarioOverride, setScenarioOverride] = useState<ScenarioResult | undefined>(undefined);

  // Stages definition for live simulation
  const stages: InvestigationStage[] = PRIMARY_INVESTIGATION.stages || [];

  // ------------------------- Navigation helpers -------------------------

  const handleNavigate = (tab: ModuleTab) => {
    // Overview is a result workspace. Keep new users in the question-led home
    // until an investigation has actually produced a result.
    setActiveTab(tab === 'overview' && !hasAnalyzed ? 'investigate' : tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCoreNode = (action: CoreNodeAction) => {
    switch (action) {
      case 'data':
        setActiveTab('investigate');
        break;
      case 'evidence':
        setActiveTab('evidence');
        break;
      case 'market':
      case 'risk':
      case 'scenario':
        setActiveTab(action === 'scenario' ? 'decisions' : 'signals');
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewFindingEvidence = (findingId: string) => {
    const finding = unifiedState.empiricalFindings.find((f) => f.id === findingId) || null;
    if (finding) {
      handleViewEvidence(finding);
    }
  };

  // ------------------------- Data management (unchanged logic) -------------------------

  const handleToggleDataSource = (sourceId: string) => {
    setDataSources((prev) => {
      const updated = prev.map((s) => (s.id === sourceId ? { ...s, selected: !s.selected } : s));
      setUnifiedState((curr) =>
        buildUnifiedInvestigationState({
          runId: curr.runId,
          userQuestion: curr.userQuestion,
          businessContext,
          dataSources: updated,
          selectedOptionId: curr.selectedOptionId,
          governanceDecision: decisionRecord,
        })
      );
      return updated;
    });
  };

  const handleAddSimulatedFile = (name: string, type: 'CSV' | 'Excel') => {
    const newSource: DataSource = {
      id: `src-${Date.now()}`,
      name,
      type,
      status: 'Ready',
      recordsCount: 0,
      fieldsCount: 0,
      selected: true,
      description: `Awaiting ingestion and schema validation: ${name}`,
    };
    setDataSources((prev) => [newSource, ...prev]);
    setAttachedDataLabel(`Attached: ${name}`);
  };

  // ------------------------- Investigation execution (real engine) -------------------------

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setHasAnalyzed(false);
    setCurrentToolIndex(0);
    setCurrentStageIndex(0);
    setExecutedTools([]);
    setTerminalLogs([]);
    setActiveTab('investigate');

    const newRunId = `RUN-00${runs.length + 1}`;
    const addLog = (msg: string) => {
      const timeStr = new Date().toISOString().slice(11, 19);
      setTerminalLogs((prev) => [...prev, { timestamp: timeStr, text: msg }]);
    };

    addLog(`[ORCHESTRATOR] Received Inquiry: "${question}"`);

    // Plan is built inside the engine's REQUIREMENT_ANALYSIS stage; run the
    // real execution pipeline end-to-end.
    (async () => {
      // Build the base unified state first (drives artifact gating + plan).
      const plannedState = buildUnifiedInvestigationState({
        runId: newRunId,
        userQuestion: question,
        businessContext,
        dataSources,
        selectedOptionId: unifiedState.selectedOptionId,
        governanceDecision: unifiedState.governanceDecision,
      });

      addLog(
        `[ORCHESTRATOR] Requirement analysis: ${plannedState.classifiedQuestionTypes.join(' + ')} · ${plannedState.investigationPlan.length} tools planned`
      );

      // Execute the real stage pipeline with structured logging.
      const outcome = await executeInvestigation({
        runId: newRunId,
        question,
        dataSources,
        stageDelayMs: 650,
        onStage: (result, entry) => {
          const label = entry.stage;
          const statusWord =
            result.status === 'COMPLETED'
              ? 'COMPLETED'
              : result.status === 'SKIPPED'
              ? 'SKIPPED'
              : 'FAILED';
          addLog(
            `[${label}] ${statusWord} · ${result.durationMs}ms — ${result.summary}`
          );
          if (result.outputKeys.length > 0) {
            addLog(`[${label}] outputs: ${result.outputKeys.join(', ')}`);
          }
          setCurrentStageIndex((prev) => prev + 1);
        },
      });

      // Log the structured execution record (metadata only).
      for (const entry of outcome.log) {
        if (entry.status === 'TERMINATED') {
          addLog(`[PIPELINE] TERMINATED at ${entry.stage} — ${entry.summary || 'see stage result'}`);
        }
      }

      finishAnalysis(newRunId, plannedState, outcome);
    })().catch((err) => {
      // Engine-level exception: surface as explicit TOOL FAILED, never fake success.
      addLog(`[PIPELINE] TOOL FAILED: ${err instanceof Error ? err.message : String(err)}`);
      finishAnalysis(newRunId, undefined, undefined, err instanceof Error ? err.message : String(err));
    });
  };

  const handleSkipAnalysis = () => {
    const newRunId = `RUN-00${runs.length + 1}`;
    finishAnalysis(newRunId);
  };

  const finishAnalysis = (
    newRunId: string,
    completedState?: UnifiedInvestigationState,
    outcome?: import('./state/executionEngine').ExecutionOutcome,
    engineError?: string,
  ) => {
    setIsAnalyzing(false);
    setHasAnalyzed(true);
    setCurrentStageIndex(stages.length);

    const baseState = completedState || buildUnifiedInvestigationState({
      runId: newRunId,
      userQuestion: question,
      businessContext,
      dataSources,
    });

    let finalState: UnifiedInvestigationState;

    if (engineError) {
      // Explicit tool failure path: no fabricated artifacts.
      finalState = {
        ...baseState,
        investigationPlan: baseState.investigationPlan.map((node) => ({
          ...node,
          status: 'BLOCKED' as const,
        })),
        claims: [],
        empiricalFindings: [],
        discoveredAnomalies: [],
        marketIntelligence: [],
        scenarioResults: [],
        recommendation: `TOOL FAILED: Investigation could not complete — ${engineError}`,
        recommendationExplanation: 'The execution engine reported a failure. No recommendation is issued.',
        issues: [
          ...baseState.issues || [],
          {
            status: 'TOOL FAILURE',
            failedComponent: 'Execution Engine',
            impact: `The investigation pipeline failed: ${engineError}`,
            confidenceDelta: -100,
            nextAction: 'Review the failed stage in the execution log and rerun.',
          },
        ],
      };
    } else if (outcome) {
      // Apply real execution outcome: plan statuses, evidence gating, issues.
      finalState = applyExecutionOutcomeToState(baseState, outcome);
      // Derive display stages from the REAL executed stages.
      const displayStages = deriveDisplayStages(outcome.results);
      setDisplayStages(displayStages.length > 0 ? displayStages : stages);
      setCurrentStageIndex(displayStages.length);
    } else {
      // Skipped analysis: fall back to static stages, mark plan from base.
      finalState = {
        ...baseState,
        investigationPlan: baseState.investigationPlan.map((node) => ({
          ...node,
          status: node.status === 'BLOCKED' || node.status === 'REQUIRES MORE DATA'
            ? node.status
            : 'SKIPPED',
        })),
      };
      setDisplayStages(stages);
    }

    finalState.recommendationConfidence = calculateDecisionConfidence({
      dataQuality: finalState.dataQuality,
      dataSources: finalState.activeDataSources,
      plan: finalState.investigationPlan,
      claims: finalState.claims,
      findings: finalState.empiricalFindings,
      issues: finalState.issues || [],
    });
    if (finalState.recommendationConfidence.level === 'DATA INSUFFICIENT') {
      finalState.recommendation = 'DATA INSUFFICIENT: Do not issue a defensible management recommendation.';
      finalState.recommendationExplanation = finalState.recommendationConfidence.epistemicCaveat;
    }

    setUnifiedState(finalState);

    const newRun: InvestigationRun = {
      id: newRunId,
      question,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      dataQualityPercent: finalState.dataQuality.overallPercent,
      overallConfidence: finalState.recommendationConfidence.level,
      confidenceScore: finalState.recommendationConfidence.overallScore,
      executiveRecommendation: finalState.recommendation,
      businessContext,
      investigationState: finalState,
      decisionRecord: null,
      selectedOptionId: finalState.selectedOptionId,
    };

    setRuns((prev) => [newRun, ...prev]);
  };

  const handleResetToHome = () => {
    setHasAnalyzed(false);
    setIsAnalyzing(false);
    setActiveTab('investigate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ------------------------- Governance (unchanged) -------------------------

  const handleRecordDecision = (record: DecisionRecord) => {
    setDecisionRecord(record);
    setUnifiedState((prev) => ({
      ...prev,
      governanceDecision: record,
    }));
    setRuns((prev) =>
      prev.map((r, idx) => (idx === 0 ? { ...r, decisionRecord: record } : r))
    );
  };

  const handleSelectDecisionOption = (optionId: string) => {
    setUnifiedState((previous) => ({ ...previous, selectedOptionId: optionId }));
  };

  // ------------------------- Export (unchanged) -------------------------

  const handleExportBrief = () => {
    exportInvestigationToPDF({
      state: unifiedState,
      businessContext,
      decisionRecord,
      dataSources,
      decisionOptions: DECISION_ROOM_OPTIONS,
      riskRadarItems: RISK_RADAR_ITEMS,
      selectedOptionId: unifiedState.selectedOptionId || 'opt-1',
    });
  };

  // ------------------------- Evidence (unchanged) -------------------------

  const handleViewEvidence = (finding: KeyFinding) => {
    setSelectedFindingForEvidence(finding);
    const matchedClaim =
      unifiedState.claims.find((c) => c.id === finding.evidenceClaimId) || null;
    setSelectedClaimForEvidence(matchedClaim);
  };

  const handleSelectCitation = (citation: CitationRef) => {
    setIsEvidenceGraphOpen(true);
  };

  // ------------------------- Robustness (unchanged) -------------------------

  const handleRunRobustnessTest = (sourceId: string) => {
    const comparison = recomputeStateWithRemovedSource(unifiedState, sourceId);
    setRobustnessComparison(comparison);
  };

  const handleResetRobustnessTest = () => {
    setRobustnessComparison(undefined);
  };

  // ------------------------- Version history (unchanged) -------------------------

  const handleRestoreRun = (run: InvestigationRun) => {
    setQuestion(run.question);
    setBusinessContext(run.businessContext);
    setDecisionRecord(run.decisionRecord || { decision: null, timestamp: run.timestamp });
    setUnifiedState(
      'investigationId' in run.investigationState
        ? (run.investigationState as UnifiedInvestigationState)
        : buildUnifiedInvestigationState({
            runId: run.id,
            userQuestion: run.question,
            businessContext: run.businessContext,
            dataSources,
            governanceDecision: run.decisionRecord || undefined,
          })
    );
    setHasAnalyzed(true);
    setIsVersionHistoryOpen(false);
    setActiveTab('overview');
  };

  const handleSaveCurrentSnapshot = () => {
    const snapshotRun: InvestigationRun = {
      id: `SNAP-${Date.now().toString().slice(-4)}`,
      question,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      dataQualityPercent: unifiedState.dataQuality.overallPercent,
      overallConfidence: unifiedState.recommendationConfidence.level,
      confidenceScore: unifiedState.recommendationConfidence.overallScore,
      executiveRecommendation: unifiedState.recommendation,
      businessContext,
      investigationState: unifiedState,
      decisionRecord,
      selectedOptionId: unifiedState.selectedOptionId || 'opt-1',
    };
    setRuns((prev) => [snapshotRun, ...prev]);
  };

  const activeSourcesCount = dataSources.filter((s) => s.selected).length;

  return (
    <div className="min-h-screen cb-ambient text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Command Header — global navigation */}
      <CommandHeader
        activeTab={activeTab}
        onNavigate={handleNavigate}
        runId={unifiedState.runId}
        dataQuality={unifiedState.dataQuality.overallPercent}
        activeSources={activeSourcesCount}
        totalSources={dataSources.length}
        onAsk={() => setIsAskModalOpen(true)}
        onExport={handleExportBrief}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewInvestigation={handleResetToHome}
      />

      {/* Main Content Area — module workspaces */}
      <main className="flex-1" key={activeTab}>
        {activeTab === 'overview' && (
          <ExecutiveDashboard
            state={unifiedState}
            runs={runs}
            scenarioOverride={scenarioOverride}
            onOpenInvestigation={() => handleNavigate('investigate')}
            onViewEvidence={() => setIsEvidenceGraphOpen(true)}
            onOpenNode={handleCoreNode}
            onNavigateDecisions={() => handleNavigate('decisions')}
            onOpenSignals={() => handleNavigate('signals')}
            onOpenHistory={() => handleNavigate('history')}
            onViewFindingEvidence={handleViewFindingEvidence}
          />
        )}

        {activeTab === 'investigate' && (
          <InvestigateModule
            unifiedState={unifiedState}
            investigationState={investigationState}
            businessContext={businessContext}
            dataSources={dataSources}
            question={question}
            setQuestion={setQuestion}
            onAnalyze={handleStartAnalysis}
            onSkipAnalysis={handleSkipAnalysis}
            isAnalyzing={isAnalyzing}
            hasAnalyzed={hasAnalyzed}
            terminalLogs={terminalLogs}
            currentStageIndex={currentStageIndex}
            stages={displayStages.length > 0 ? displayStages : stages}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenContextModal={() => setIsContextModalOpen(true)}
            attachedDataLabel={attachedDataLabel}
            hasCustomContext={hasCustomContext}
            onUpdateBusinessContext={setBusinessContext}
            onToggleDataSource={handleToggleDataSource}
            onAddSimulatedFile={handleAddSimulatedFile}
            onOpenEvidenceGraph={() => setIsEvidenceGraphOpen(true)}
            onOpenToolMatrixModal={() => setIsToolMatrixModalOpen(true)}
            onOpenHostileAuditModal={() => setIsHostileAuditModalOpen(true)}
            onOpenFailureModeModal={() => setIsFailureModeModalOpen(true)}
            onOpenRobustnessModal={() => setIsRobustnessModalOpen(true)}
            onExportBrief={handleExportBrief}
            onViewEvidence={handleViewEvidence}
            onSelectCitation={handleSelectCitation}
            onOpenNode={handleCoreNode}
          />
        )}

        {activeTab === 'decisions' && (
          <DecisionsModule
            unifiedState={unifiedState}
            investigationState={investigationState}
            businessContext={businessContext}
            dataSources={dataSources}
            decisionRecord={decisionRecord}
            onRecordDecision={handleRecordDecision}
            onOpenEvidenceGraph={() => setIsEvidenceGraphOpen(true)}
            onOpenRobustnessModal={() => setIsRobustnessModalOpen(true)}
            onExportBrief={handleExportBrief}
            onApplyScenarioToDecision={undefined}
            onParamsChange={(_params, result) => setScenarioOverride(result)}
            onSelectCitation={handleSelectCitation}
            onSelectOption={handleSelectDecisionOption}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceModule
            unifiedState={unifiedState}
            evidenceGraph={DEFAULT_EVIDENCE_GRAPH}
            onOpenEvidenceGraph={() => setIsEvidenceGraphOpen(true)}
            onViewEvidence={handleViewEvidence}
            onToggleDataSource={handleToggleDataSource}
          />
        )}

        {activeTab === 'signals' && <SignalsModule unifiedState={unifiedState} />}

        {activeTab === 'history' && (
          <HistoryModule
            runs={runs}
            unifiedState={unifiedState}
            onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            onSaveCurrentSnapshot={handleSaveCurrentSnapshot}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t cb-hairline py-6 px-6 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-600">
        <span>CorporateBaddie — Making sense of the signal behind the noise.</span>
        <span className="font-mono">Facts, assumptions, and risk are separated before the decision is made.</span>
      </footer>

      {/* ------------------- Preserved modals (all functionality intact) ------------------- */}

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={investigationState}
      />

      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        runs={runs}
        currentRunId={unifiedState.runId}
        onRestoreRun={handleRestoreRun}
        onSaveCurrentSnapshot={handleSaveCurrentSnapshot}
      />

      <EvidenceGraph
        isOpen={isEvidenceGraphOpen}
        onClose={() => setIsEvidenceGraphOpen(false)}
        claims={unifiedState.claims}
        evidenceGraph={DEFAULT_EVIDENCE_GRAPH}
        onSimulateSourceToggle={handleToggleDataSource}
      />

      <EvidenceDetailModal
        finding={selectedFindingForEvidence}
        claim={selectedClaimForEvidence}
        decisionConfidence={unifiedState.recommendationConfidence}
        onClose={() => {
          setSelectedFindingForEvidence(null);
          setSelectedClaimForEvidence(null);
        }}
        onOpenGraph={() => {
          setSelectedFindingForEvidence(null);
          setSelectedClaimForEvidence(null);
          setIsEvidenceGraphOpen(true);
        }}
      />

      <RobustnessTestModal
        isOpen={isRobustnessModalOpen}
        onClose={() => setIsRobustnessModalOpen(false)}
        dataSources={dataSources}
        onRunTest={handleRunRobustnessTest}
        currentTestResult={robustnessComparison}
        onResetTest={handleResetRobustnessTest}
      />

      <HostileAuditModal
        isOpen={isHostileAuditModalOpen}
        onClose={() => setIsHostileAuditModalOpen(false)}
        onSelectClaim={(claimId) => setIsEvidenceGraphOpen(true)}
      />

      <FailureModeInspector
        isOpen={isFailureModeModalOpen}
        onClose={() => setIsFailureModeModalOpen(false)}
        selectedOptionId={unifiedState.selectedOptionId || 'opt-1'}
      />

      <OrchestratorToolMatrixModal
        isOpen={isToolMatrixModalOpen}
        onClose={() => setIsToolMatrixModalOpen(false)}
      />

      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        selectedDataset={attachedDataLabel}
        onSelectDataset={(name) => setAttachedDataLabel(`Attached: ${name}`)}
      />

      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        onSaveContext={(ctx) => {
          setBusinessContext((prev) => ({
            ...prev,
            knownConstraints: ctx.marginTarget,
            managementPriorities: ctx.regionPriority,
          }));
          setHasCustomContext(true);
        }}
      />

      {/* Ask CorporateBaddie — presented as a focused modal workspace */}
      {isAskModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Ask CorporateBaddie"
          onClick={() => setIsAskModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[86vh] overflow-y-auto cb-glass-raised rounded-xl animate-in fade-in zoom-in-[0.98] duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6">
              <AskCorporateBaddie onSelectClaim={() => setIsEvidenceGraphOpen(true)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
