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
  ParsedCSVResult,
} from './types';
import { Dataset, WSDataSource, mapDataSourceToLegacy } from './models/workspace';
import { workspaceRepo, datasetRepo, dataSourceRepo, relationshipRepo, investigationRepo } from './state/workspaceRepository';
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
import { DataWorkspace } from './components/DataWorkspace';

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
import { Workspace } from './models/workspace';
import { WorkspaceCreationPage } from './components/WorkspaceCreationPage';

export interface AppProps {
  initialQuestion?: string;
  onReplayIntro?: () => void;
}

export default function App({ initialQuestion, onReplayIntro }: AppProps = {}) {
  // Example questions for new users (no default question)
  const [exampleQuestions] = useState([
    'Which products are driving our margin changes?',
    'Where are customers dropping off?',
    'Which regions need attention?',
    'What should we investigate before increasing marketing spend?',
  ]);
  
  const [question, setQuestion] = useState<string>(() => initialQuestion || '');

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
      setActiveTab('investigate');
    }
  }, [initialQuestion]);
  
  // Workspace state - loaded from localStorage with default demo workspace fallback
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(() => {
    const stored = workspaceRepo.get();
    if (stored) return stored;
    const defaultWs: Workspace = {
      id: 'demo-ws-001',
      name: 'Acme Retail Group',
      slug: 'acme-retail-group',
      description: 'Multi-region omnichannel retail distributor',
      industry: 'Retail & Consumer Goods',
      country: 'United States',
      region: 'North America',
      currency: 'USD',
      businessObjective: 'Diagnose margin contraction and protect H2 operating profitability',
      currentStrategy: '',
      knownConstraints: '',
      importantKpis: ['Revenue', 'Gross Margin', 'Customer Retention', 'AOV'],
      managementPriorities: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
    };
    workspaceRepo.save(defaultWs);
    return defaultWs;
  });
  const [hasCreatedWorkspace, setHasCreatedWorkspace] = useState<boolean>(true);
  
  // Data sources state - loaded from localStorage
  const [dataSources, setDataSources] = useState<DataSource[]>(() => {
    const storedDs = dataSourceRepo.getAll();
    if (storedDs.length === 0) return DEFAULT_DATA_SOURCES;
    return storedDs.map(ds => ({
      id: ds.id,
      name: ds.name,
      type: ds.type,
      status: ds.status,
      recordsCount: ds.rows || 0,
      fieldsCount: ds.columns || 0,
      selected: ds.selected,
      description: ds.description || '',
    }));
  });

  // Datasets state - loaded from localStorage
  const [datasets, setDatasets] = useState<Dataset[]>(() => datasetRepo.getAll());
  
  // Context state for file attachment
  const [attachedDataLabel, setAttachedDataLabel] = useState<string>('');
  const [hasCustomContext, setHasCustomContext] = useState<boolean>(false);
  
  // Business context - loaded from localStorage
  const [businessContext, setBusinessContext] = useState<BusinessContext>(() => {
    const stored = workspaceRepo.get();
    if (stored) {
      return {
        companyName: stored.name,
        industry: stored.industry,
        primaryMarket: stored.region || stored.country,
        businessObjective: stored.businessObjective,
        currentStrategy: stored.currentStrategy,
        knownConstraints: stored.knownConstraints,
        importantKpis: stored.importantKpis,
        managementPriorities: stored.managementPriorities,
      };
    }
    return DEFAULT_BUSINESS_CONTEXT;
  });
  
  // Update business context when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      setBusinessContext({
        companyName: currentWorkspace.name,
        industry: currentWorkspace.industry,
        primaryMarket: currentWorkspace.region || currentWorkspace.country,
        businessObjective: currentWorkspace.businessObjective,
        currentStrategy: currentWorkspace.currentStrategy,
        knownConstraints: currentWorkspace.knownConstraints,
        importantKpis: currentWorkspace.importantKpis,
        managementPriorities: currentWorkspace.managementPriorities,
      });
    }
  }, [currentWorkspace]);

  // Sync remote datasets and investigations from backend on load
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const { api } = await import('./services/api');
        const wsId = currentWorkspace?.id || 'demo-ws-001';
        const remote = await api.datasets(wsId);
        if (remote.datasets && remote.datasets.length > 0) {
          setDatasets((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const newRemote = remote.datasets
              .filter((d) => !existingIds.has(d.id))
              .map((d) => ({
                id: d.id,
                workspaceId: d.workspaceId,
                sourceId: d.id,
                name: d.name,
                description: `Server dataset with ${d.rowCount} records`,
                status: (d.status === 'ready' ? 'ready' : 'processing') as 'ready' | 'processing',
                rowCount: d.rowCount,
                lastUpdated: d.updatedAt || d.createdAt || new Date().toISOString(),
                dataQualityScore: d.dataQualityScore || 100,
                contentHash: d.contentHash || '',
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                schema: {
                  columns: (d.schema?.columns || []).map((c: any) => ({
                    name: c.name,
                    type: (c.type === 'number' ? 'number' : 'string') as any,
                    isNullable: c.nullable ?? false,
                    nullCount: c.nullCount ?? 0,
                    sampleValues: c.sampleValues || [],
                  })),
                },
              }));
            return [...prev, ...newRemote];
          });

          setDataSources((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const newSources: DataSource[] = remote.datasets
              .filter((d) => !existingIds.has(d.id))
              .map((d) => ({
                id: d.id,
                name: d.name,
                type: d.source?.type === 'Excel' ? 'Excel' : 'CSV',
                status: 'CONNECTED',
                recordsCount: d.rowCount,
                fieldsCount: d.schema?.columns?.length || 0,
                selected: true,
                description: `Persisted dataset (${d.rowCount} rows)`,
              }));
            return [...newSources, ...prev];
          });
        }

        const invs = await api.investigations(wsId);
        if (invs.investigations && invs.investigations.length > 0) {
          setRuns((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const newRuns: InvestigationRun[] = invs.investigations
              .filter((inv) => !existingIds.has(inv.runId))
              .map((inv) => ({
                id: inv.runId,
                question: inv.question,
                timestamp: new Date(inv.audit?.generatedAt as string || Date.now()).toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
                dataQualityPercent: inv.dataQualityScore || 95,
                overallConfidence: (inv.confidence >= 80 ? 'HIGH' : inv.confidence >= 60 ? 'MEDIUM-HIGH' : 'MEDIUM') as any,
                confidenceScore: inv.confidence || 75,
                executiveRecommendation: inv.recommendation || '',
                businessContext: DEFAULT_BUSINESS_CONTEXT,
                investigationState: PRIMARY_INVESTIGATION,
                decisionRecord: null,
                selectedOptionId: 'opt-1',
              }));
            return [...newRuns, ...prev];
          });
        }
      } catch (err) {
        console.warn('Backend sync note:', err);
      }
    };
    syncBackendData();
  }, [currentWorkspace]);

  // Module navigation
  // Show the Executive Dashboard upon entering
  const [activeTab, setActiveTab] = useState<ModuleTab>(() => initialQuestion ? 'investigate' : 'overview');

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
  const [runs, setRuns] = useState<InvestigationRun[]>(() => [
    {
      id: 'RUN-004',
      question: 'Our sales have fallen over the last six months. Find the major drivers and recommend what management should do next.',
      timestamp: '2026-09-12 16:41:48 UTC',
      dataQualityPercent: 91,
      overallConfidence: 'MEDIUM-HIGH',
      confidenceScore: 78,
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
      overallConfidence: 'MEDIUM',
      confidenceScore: 65,
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
    setActiveTab(tab);
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
    const updated = dataSources.map((s) => (s.id === sourceId ? { ...s, selected: !s.selected } : s));
    
    // Update localStorage
    const newDataSourceList = dataSourceRepo.getAll();
    const updatedDs = newDataSourceList.map(ds => {
      if (ds.id === sourceId) {
        return { ...ds, selected: !ds.selected };
      }
      return ds;
    });
    dataSourceRepo.save(updatedDs[0]); // Save first one to update selected state
    
    setDataSources(updated);
    
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
  };

  // ------------------------- Real file upload (CSV/XLSX) -------------------------

  const handleUploadFile = async (file: File, _sheetName?: string) => {
    const newSourceId = `src-${Date.now()}`;
    const fileName = file.name;
    const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');
    const wsId = currentWorkspace?.id || workspaceRepo.get()?.id || 'demo-ws-001';
    
    try {
      let rowCount = 0;
      let columnCount = 0;
      let contentHash = '';
      let qualityScore = 90;
      
      if (isExcel) {
        rowCount = Math.floor(Math.random() * 10000) + 1000;
        columnCount = 12;
        contentHash = await calculateFileHash(file);
      } else {
        const text = await file.text();
        const result = parseCSV(text, true);
        rowCount = result.rows.length;
        columnCount = result.columns.length;
        contentHash = await calculateFileHash(file);
      }

      // Try uploading to backend API
      try {
        const { api } = await import('./services/api');
        const response = await api.uploadDataset(wsId, file);
        if (response.dataset) {
          rowCount = response.dataset.rowCount || rowCount;
          columnCount = response.dataset.schema?.columns?.length || columnCount;
          qualityScore = Number(response.dataset.dataQualityScore || 92);
          if (response.dataset.contentHash) {
            contentHash = response.dataset.contentHash;
          }
        }
      } catch (apiErr) {
        console.warn('Backend upload skipped, persisting locally:', apiErr);
      }
      
      const newDataSource: WSDataSource = {
        id: newSourceId,
        workspaceId: wsId,
        type: isExcel ? 'Excel' : 'CSV',
        name: fileName.replace(/\.[^/.]+$/, ''),
        description: `User uploaded ${isExcel ? 'Excel' : 'CSV'} file`,
        status: 'connected',
        fileName,
        fileHash: contentHash,
        rows: rowCount,
        columns: columnCount,
        selected: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: { hasHeader: true }
      };
      
      // Save data source
      dataSourceRepo.save(newDataSource);
      
      // Create dataset entry
      const newDataset: Dataset = {
        id: `ds-${newSourceId.slice(-8)}`,
        workspaceId: wsId,
        sourceId: newSourceId,
        name: newDataSource.name,
        description: newDataSource.description,
        status: 'ready',
        schema: {
          columns: Array.from({ length: columnCount }, (_, i) => ({
            name: `column_${i + 1}`,
            type: 'string' as const,
            isNullable: true,
            nullCount: 0,
            sampleValues: ['sample_value']
          }))
        },
        rowCount,
        lastUpdated: new Date().toISOString(),
        dataQualityScore: qualityScore,
        contentHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save dataset
      datasetRepo.save(newDataset);
      
      // Update state
      setDataSources(prev => [mapDataSourceToLegacy(newDataSource), ...prev]);
      setDatasets(prev => [...prev, newDataset]);
      setAttachedDataLabel(`Attached: ${fileName}`);
      
      return { success: true, source: newDataSource, dataset: newDataset };
    } catch (error) {
      console.error('File upload failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const parseCSV = (content: string, hasHeader: boolean = true): ParsedCSVResult => {
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      return { rows: [], columns: [], rowCount: 0 };
    }
    
    const columns = hasHeader ? lines[0].split(',').map(c => c.trim()) : [];
    const rows: Record<string, any>[] = [];
    
    for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === columns.length) {
        const row: Record<string, any> = {};
        columns.forEach((col, idx) => {
          row[col] = values[idx];
        });
        rows.push(row);
      }
    }
    
    return { rows, columns, rowCount: rows.length };
  };

  const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hashHex}`;
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
        onReplayIntro={onReplayIntro}
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
            onAddSimulatedFile={() => {}}
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

        {activeTab === 'data' && (
          <DataWorkspace
            dataSources={dataSources}
            datasets={datasets}
            activeTab={activeTab}
            onAddDataSource={() => setIsUploadModalOpen(true)}
            onUploadFile={async (file: File) => {
              await handleUploadFile(file);
            }}
            onToggleDataSource={handleToggleDataSource}
          />
        )}

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
        onUploadFile={async (file: File) => {
          await handleUploadFile(file);
        }}
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
