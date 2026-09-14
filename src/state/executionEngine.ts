import { UnifiedInvestigationState, DataSource, InvestigationIssue, InvestigationStage } from '../types';
import { api, type ApiInvestigation } from '../services/api';
import { workspaceRepo, datasetRepo } from './workspaceRepository';

export type StageId = 'REQUIREMENT_ANALYSIS' | 'DATA_PROFILER' | 'BUSINESS_ANALYTICS' | 'ANOMALY_DETECTION' | 'ROOT_CAUSE' | 'MARKET_INTELLIGENCE' | 'FORECASTING' | 'EVIDENCE_VERIFICATION' | 'RECOMMENDATION';
export type StageRunStatus = 'COMPLETED' | 'SKIPPED' | 'DATA INSUFFICIENT' | 'INVESTIGATION BLOCKED' | 'MARKET INTELLIGENCE UNAVAILABLE' | 'FORECAST UNRELIABLE' | 'TOOL FAILED';

export interface StageLogEntry {
  runId: string; stage: StageId; status: 'STARTED' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'TERMINATED'; startedAt: string; completedAt?: string; durationMs?: number;
  inputStateKeys: string[]; requiredInputs: string[]; outputKeys?: string[]; outputs?: string[]; error?: string; nextStage?: StageId | 'END'; summary?: string;
  executorId?: string; executorName?: string; executorCategory?: 'REASONING_AGENT' | 'ANALYTICAL_SERVICE';
}
export interface StageResult {
  stage: StageId; status: StageRunStatus; outputKeys: string[]; summary: string; issues?: InvestigationIssue[]; canContinue: boolean; durationMs: number;
  executorId?: string; executorName?: string; executorCategory?: 'REASONING_AGENT' | 'ANALYTICAL_SERVICE';
}
export interface ExecutionOutcome { runId: string; results: StageResult[]; log: StageLogEntry[]; state: Record<string, unknown>; terminalStatus: 'COMPLETED' | StageRunStatus; issues: InvestigationIssue[]; backend: ApiInvestigation; }
export interface ExecuteInvestigationOptions {
  runId: string; question: string; dataSources: DataSource[]; stageDelayMs?: number; sleep?: (ms: number) => Promise<void>; clock?: () => number;
  onStage?: (result: StageResult, entry: StageLogEntry) => void | Promise<void>;
}

const stageMeta: Array<[StageId, string, string, string]> = [
  ['REQUIREMENT_ANALYSIS', 'Understanding the business question', 'orchestrator', 'Orchestrator'],
  ['DATA_PROFILER', 'Profiling business data', 'data-profiler', 'Data Profiler'],
  ['BUSINESS_ANALYTICS', 'Calculating core metrics', 'business-analytics', 'Business Analytics Engine'],
  ['ANOMALY_DETECTION', 'Investigating anomalies', 'anomaly-detection', 'Anomaly Detection Engine'],
  ['ROOT_CAUSE', 'Investigating possible root causes', 'root-cause', 'Root Cause Investigation'],
  ['MARKET_INTELLIGENCE', 'Checking external market context', 'market-intelligence', 'Market Intelligence'],
  ['FORECASTING', 'Projecting future trends', 'forecasting', 'Forecasting Engine'],
  ['EVIDENCE_VERIFICATION', 'Verifying evidence', 'evidence-verification', 'Evidence Verification'],
  ['RECOMMENDATION', 'Building recommendation', 'recommendation', 'Recommendation Engine'],
];
const now = () => new Date().toISOString();
const makeIssue = (status: InvestigationIssue['status'], failedComponent: string, impact: string, nextAction: string): InvestigationIssue => ({ status, failedComponent, impact, confidenceDelta: status === 'DATA INSUFFICIENT' ? -30 : -10, nextAction });

function normalizeRecommendation(result: ApiInvestigation): string {
  const raw = result.ai?.response?.trim();
  if (!raw) return result.recommendation;
  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')) as Record<string, unknown>;
    if (typeof parsed.recommendation === 'string' && parsed.recommendation.trim()) return parsed.recommendation.trim();
    if (typeof parsed.summary === 'string' && parsed.summary.trim()) return parsed.summary.trim();
  } catch { /* provider returned normal prose */ }
  return raw;
}

export const executeInvestigation = async (options: ExecuteInvestigationOptions): Promise<ExecutionOutcome> => {
  const started = Date.now();
  const workspaceId = workspaceRepo.get()?.id || 'demo-ws-001';
  const localDatasets = datasetRepo.getAll();
  const selectedSourceIds = new Set(options.dataSources.filter((s) => s.selected && s.recordsCount > 0).map((s) => s.id));
  const datasetIds = localDatasets.filter((dataset) => selectedSourceIds.has(dataset.sourceId) && dataset.status === 'ready').map((dataset) => dataset.id);
  const logs: StageLogEntry[] = [];
  const results: StageResult[] = [];

  const emit = async (stage: StageId, status: StageRunStatus, summary: string, outputKeys: string[], canContinue: boolean) => {
    const meta = stageMeta.find(([id]) => id === stage)!;
    const durationMs = Math.max(1, Date.now() - started);
    const executorCategory = ['REQUIREMENT_ANALYSIS', 'ROOT_CAUSE', 'MARKET_INTELLIGENCE', 'EVIDENCE_VERIFICATION', 'RECOMMENDATION'].includes(stage) ? 'REASONING_AGENT' : 'ANALYTICAL_SERVICE';
    const result: StageResult = { stage, status, outputKeys, summary, canContinue, durationMs, executorId: meta[2], executorName: meta[3], executorCategory };
    const entry: StageLogEntry = { runId: options.runId, stage, status: status === 'COMPLETED' || status === 'SKIPPED' ? 'COMPLETED' : 'FAILED', startedAt: now(), completedAt: now(), durationMs, inputStateKeys: [], requiredInputs: [], outputKeys, outputs: outputKeys, summary, executorId: result.executorId, executorName: result.executorName, executorCategory };
    logs.push(entry); results.push(result); await options.onStage?.(result, entry);
  };

  try {
    await emit('REQUIREMENT_ANALYSIS', 'COMPLETED', 'Question accepted and routed to the backend investigation API.', ['question', 'workspaceId'], true);
    if (!datasetIds.length) {
      const blocked = makeIssue('DATA INSUFFICIENT', 'Data intake', 'No persisted dataset can support an evidence-backed investigation.', 'Upload and select at least one CSV or Excel dataset.');
      await emit('DATA_PROFILER', 'DATA INSUFFICIENT', blocked.impact, [], false);
      return { runId: options.runId, results, log: logs, state: {}, terminalStatus: 'DATA INSUFFICIENT', issues: [blocked], backend: { runId: options.runId, workspaceId, question: options.question, status: 'data_insufficient', dataSources: [], findings: [], metricSummaries: [], marketStatus: 'NOT RUN', forecastStatus: 'NOT RUN', recommendation: blocked.nextAction, confidence: 0, audit: { backend: true } } };
    }

    await emit('DATA_PROFILER', 'COMPLETED', 'Selected datasets will be profiled from persisted server-side records.', ['dataSources'], true);
    const backend = await api.investigate(workspaceId, options.question, datasetIds);
    backend.recommendation = normalizeRecommendation(backend);

    await emit('BUSINESS_ANALYTICS', backend.findings.length ? 'COMPLETED' : 'DATA INSUFFICIENT', backend.findings.length ? `Calculated ${backend.findings.length} evidence-backed finding(s) from persisted rows.` : 'No deterministic findings were available.', ['analysisResults', 'metricSummaries'], backend.findings.length > 0);
    await emit('ANOMALY_DETECTION', 'SKIPPED', 'No anomaly detector was claimed by the backend run; no anomaly result is fabricated.', [], true);
    await emit('ROOT_CAUSE', 'SKIPPED', 'Root-cause causality is not asserted without a tested driver decomposition.', [], true);
    await emit('MARKET_INTELLIGENCE', backend.marketStatus === 'MARKET INTELLIGENCE UNAVAILABLE' ? 'MARKET INTELLIGENCE UNAVAILABLE' : 'SKIPPED', backend.marketStatus === 'MARKET INTELLIGENCE UNAVAILABLE' ? 'Current market research was not available for this run.' : 'External market research was not required.', [], true);
    await emit('FORECASTING', backend.forecastStatus.includes('REQUIRES') ? 'FORECAST UNRELIABLE' : 'SKIPPED', backend.forecastStatus.includes('REQUIRES') ? 'Historical validation is required before a forecast can be issued.' : 'Forecasting was not required.', [], true);
    await emit('EVIDENCE_VERIFICATION', backend.findings.length ? 'COMPLETED' : 'DATA INSUFFICIENT', backend.findings.length ? 'Backend findings are directly tied to persisted dataset calculations.' : 'There are no findings to verify.', ['claims'], backend.findings.length > 0);
    await emit('RECOMMENDATION', backend.confidence > 0 ? 'COMPLETED' : 'INVESTIGATION BLOCKED', backend.recommendation, ['recommendation', 'confidence'], backend.confidence > 0);

    return { runId: backend.runId, results, log: logs, state: { backend }, terminalStatus: backend.status === 'data_insufficient' ? 'DATA INSUFFICIENT' : 'COMPLETED', issues: backend.status === 'data_insufficient' ? [makeIssue('DATA INSUFFICIENT', 'Backend investigation', 'The server could not establish usable evidence.', 'Upload a usable dataset and rerun the investigation.')] : [], backend };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend investigation failed.';
    const failure = makeIssue('TOOL FAILURE', 'Investigation API', message, 'Check that the API server is running on port 4000, then rerun.');
    await emit('RECOMMENDATION', 'TOOL FAILED', message, [], false);
    const backend: ApiInvestigation = { runId: options.runId, workspaceId, question: options.question, status: 'tool_failure', dataSources: [], findings: [], metricSummaries: [], marketStatus: 'TOOL FAILED', forecastStatus: 'TOOL FAILED', recommendation: 'TOOL FAILED: no recommendation issued.', confidence: 0, audit: { backend: false, error: message } };
    return { runId: options.runId, results, log: logs, state: {}, terminalStatus: 'TOOL FAILED', issues: [failure], backend };
  }
};

function confidenceLevel(score: number): UnifiedInvestigationState['recommendationConfidence']['level'] {
  if (score >= 85) return 'HIGH'; if (score >= 70) return 'MEDIUM-HIGH'; if (score >= 55) return 'MEDIUM'; if (score > 0) return 'LOW'; return 'DATA INSUFFICIENT';
}

export const applyExecutionOutcomeToState = (base: UnifiedInvestigationState, outcome: ExecutionOutcome): UnifiedInvestigationState => {
  const backend = outcome.backend;
  const verified = backend.findings.filter((finding) => finding.verified !== false);
  const claims = verified.map((finding, index) => ({ id: String(finding.id || `claim-${index + 1}`), title: String(finding.claim || 'Backend finding'), type: 'FACT' as const, evidence: String(finding.evidence || 'Calculated from persisted dataset rows.'), confidence: backend.confidence, source: String(finding.source || 'Persisted dataset'), verified: true, dependencies: [String(finding.source || 'dataset')], epistemicLabel: 'FACT' as const, verificationStatus: 'SUPPORTED' as const }));
  const empiricalFindings = verified.slice(0, 8).map((finding, index) => ({
    id: String(finding.id || `finding-${index + 1}`), label: String(finding.source || 'Dataset finding'), value: String(finding.claim || ''), change: 'Observed in persisted data', direction: 'flat' as const, subtext: String(finding.evidence || ''), metricType: 'Backend fact', evidenceClaimId: String(finding.id || `claim-${index + 1}`),
    detailedData: { baseline: 'Not supplied', current: String(finding.claim || ''), variance: 'Not computed', confidence: backend.confidence, dataSource: String(finding.source || 'Persisted dataset') }, epistemicLabel: 'FACT' as const, epistemicStatus: 'DESCRIPTIVE AGGREGATE' as const,
  }));
  const totalRows = backend.dataSources.reduce((sum, source) => sum + source.rows, 0);
  const quality = totalRows > 0 ? Math.min(99, Math.max(60, backend.confidence + 8)) : 0;
  const confidence = backend.confidence;
  const auditEvents = [...(base.auditEvents || []), { id: `backend-${backend.runId}`, timestamp: new Date().toISOString(), type: 'INVESTIGATION_EXECUTED', actor: 'CorporateBaddie backend', description: `Backend run ${backend.runId} used persisted dataset rows and produced ${verified.length} verified fact(s).`, metadata: backend.audit } as any];
  return {
    ...base, investigationId: backend.runId, runId: backend.runId, userQuestion: backend.question, timestamp: new Date().toISOString(), claims, empiricalFindings, discoveredAnomalies: [], marketIntelligence: [], scenarioResults: [], recommendation: backend.recommendation,
    recommendationExplanation: verified.length ? 'Recommendation is grounded in findings calculated from persisted dataset rows. No unsupported causal claim is added.' : 'No defensible recommendation is available from the current dataset.',
    recommendationConfidence: { ...base.recommendationConfidence, overallScore: confidence, level: confidenceLevel(confidence), breakdown: { ...base.recommendationConfidence.breakdown, dataQuality: quality, evidenceVerification: verified.length ? 100 : 0, evidenceCoverage: verified.length ? Math.min(100, verified.length * 20) : 0, claimVerification: verified.length ? 100 : 0 }, topBoosters: verified.length ? ['Persisted rows were used for deterministic calculations.', 'Findings are linked to dataset sources.'] : [], topReducers: backend.marketStatus === 'MARKET INTELLIGENCE UNAVAILABLE' ? ['External market context was unavailable.'] : [], epistemicCaveat: 'Facts are descriptive evidence from the ingested data; causality is not asserted without causal analysis.' },
    auditEvents, issues: outcome.issues,
  };
};

export const deriveDisplayStages = (results: StageResult[]): InvestigationStage[] => results.map((result, index) => ({
  id: index + 1, title: stageMeta.find(([id]) => id === result.stage)?.[1] || result.stage,
  status: result.status === 'COMPLETED' ? 'completed' : result.status === 'SKIPPED' ? 'pending' : 'pending', dynamicMessage: result.summary, explanation: result.summary, logMessage: result.summary, durationMs: result.durationMs, findingsCount: result.outputKeys.length, executorName: result.executorName, executorCategory: result.executorCategory,
}));
