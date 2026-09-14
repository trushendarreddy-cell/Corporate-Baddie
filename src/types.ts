// ============================================================================
// CORPORATEBADDIE 2.0 - Core Types & Epistemic Contracts
// ============================================================================

export type CitationType =
  | 'DATA_SOURCE'
  | 'DATASET_FINDING'
  | 'MARKET_INTEL'
  | 'CLAIM'
  | 'DOCUMENT';

export interface CitationRef {
  badge: string;
  label: string;
  type: CitationType;
  title: string;
  sourceName: string;
  metric: string;
  details: string;
  verified: boolean;
  auditHash: string;
  targetId?: string;
  url?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventName: string;
  component: string;
  inputTrigger: string;
  outputSummary: string;
  confidenceImpact?: string;
  dataSourcesQueried?: string[];
  claimsGenerated?: string[];
  /** Optional explicit list of claims affected by this event; falls back to claimsGenerated. */
  affectedClaimIds?: string[];
}

export interface BusinessContext {
  companyName: string;
  industry: string;
  primaryMarket: string;
  businessObjective: string;
  currentStrategy: string;
  knownConstraints: string;
  importantKpis: string[];
  managementPriorities: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'CSV' | 'Excel' | 'Database' | 'API' | 'Previous Analysis' | string;
  status: 'Connected' | 'Ready' | 'Disabled' | string;
  recordsCount: number;
  fieldsCount: number;
  selected: boolean;
  description: string;
}

export interface DataRelationship {
  key: string;
  description: string;
  sources: string[];
}

export interface ChartDataPoint {
  period: string;
  revenue: number;
  baseline: number;
  productA: number;
  productOthers: number;
  repeatCustomers: number;
  newCustomers: number;
}

export interface ProductBreakdown {
  name: string;
  revenue: number;
  share: number;
  growth: number;
  flag: string;
}

export interface RegionBreakdown {
  name: string;
  revenue: number;
  share: number;
  growth: number;
  flag: string;
}

export interface DecomposedQuestion {
  id: number;
  question: string;
  status: 'Answered' | 'In Progress' | 'Pending' | string;
  evidenceFound: string;
  confidence: 'High' | 'Medium-High' | 'Medium' | 'Low' | string;
  claimRef?: string;
}

export interface DynamicInvestigationTask {
  id: string;
  title: string;
  isInitial: boolean;
  status: 'completed' | 'discovered' | 'in_progress' | 'pending' | string;
  evidenceOutcome: string;
  discoveredReason?: string;
}

export interface RiskRadarItem {
  category: string;
  level: 'LOW' | 'LOW-MEDIUM' | 'MEDIUM' | 'HIGH' | string;
  evidence: string;
  mitigation: string;
}

export interface OpportunityItem {
  id: string;
  category: string;
  title: string;
  description: string;
  potentialImpact: string;
  evidenceStrength: string;
  confidence: number;
  recommendedNextStep: string;
  filterTags: string[];
}

export interface CompetitorInfo {
  name: string;
  pricing: string;
  promotion: string;
  productPosition: string;
  marketSignal: string;
  correlatedInternalFinding: string;
}

export interface MarketSignal {
  id: string;
  signal: string;
  explanation: string;
  source: string;
  date: string;
  type: string;
  impactLevel: 'High' | 'Medium' | 'Low' | string;
  confidence: number;
  isDemoSource?: boolean;
}

export interface TrendItem {
  metric: string;
  status: 'Declining' | 'Emerging' | 'Increasing' | 'Stable' | string;
  detail: string;
}

export interface EmergingSignal {
  id: string;
  title: string;
  signalType: string;
  evidence: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  recommendedInvestigation: string;
}

export interface StrategicOptionScores {
  impact: number;
  evidenceStrength: number;
  feasibility: number;
  risk: number;
  cost: number;
  strategicFit: number;
}

export interface StrategicOption {
  id: string;
  title: string;
  description: string;
  isRecommended: boolean;
  impact: string;
  risk: string;
  feasibility: string;
  scores: StrategicOptionScores;
  pros: string[];
  cons: string[];
  projectedOutcome: string;
}

export interface DecisionRoomOptionWhy {
  supportingEvidence: string[];
  potentialUpside: string;
  risks: string[];
  dependencies: string[];
  whatMustBeTrue: string[];
}

export interface DecisionRoomOption {
  id: string;
  name: string;
  isRecommended: boolean;
  expectedImpact: string;
  evidenceStrength: 'Strong' | 'Moderate' | 'Weak' | string;
  cost: string;
  risk: 'Low' | 'Medium' | 'High' | string;
  feasibility: 'Low' | 'Medium' | 'High' | string;
  timeToImpact: string;
  strategicFit: 'Low' | 'Medium' | 'High' | string;
  confidence: number;
  whyThisOption: DecisionRoomOptionWhy;
}

export interface ScenarioParams {
  priceChangePercent: number;
  marketingBudgetLakhs: number;
  discountPercent: number;
  inventoryLevel: string;
  targetRegion: string;
  customerSegment: string;
}

export interface ScenarioResult {
  revenueDelta: number;
  grossMarginDelta: number;
  customerVolumeDelta: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface MultiScenarioItemOutputs {
  revenueDelta: number;
  grossMarginDelta: number;
  customerVolumeDelta?: number;
  customerRetentionDelta?: number;
  riskScore?: number;
  executionRisk?: 'Low' | 'Medium' | 'High' | string;
  capitalRequiredLakhs?: number;
}

export interface MultiScenarioItem {
  id: string;
  name: string;
  label: 'MODELLED ESTIMATE' | 'STRESS TEST' | string;
  isRecommended?: boolean;
  isBaseline?: boolean;
  modeledOutputs: MultiScenarioItemOutputs;
  riskLevel: 'Low' | 'Medium' | 'High' | string;
  feasibility: 'Low' | 'Medium' | 'High' | string;
  timeToPayoffMonths: number;
  supportingEvidenceRefs: string[];
  assumptions: string[];
  downsides: string[];
}

export type ClaimType =
  | 'FACT'
  | 'EXTERNAL FACT'
  | 'INFERENCE'
  | 'FORECAST'
  | 'RECOMMENDATION';

export type EpistemicStatus =
  | 'CAUSAL EVIDENCE'
  | 'CORRELATION'
  | 'ASSOCIATION'
  | 'DESCRIPTIVE AGGREGATE'
  | 'OBSERVATIONAL';

export type EpistemicLabel =
  | 'CAUSAL EVIDENCE'
  | 'CORRELATION'
  | 'ASSOCIATION'
  | 'INFERENCE'
  | 'HYPOTHESIS'
  | 'FACT';

export type VerificationStatus =
  | 'SUPPORTED'
  | 'PARTIALLY SUPPORTED'
  | 'CONFLICTED'
  | 'INSUFFICIENT EVIDENCE'
  | 'UNVERIFIED';

export interface EvidenceClaimAdversarial {
  supportingEvidence?: string[];
  contradictingEvidence?: string[];
  evidenceRecency?: string;
  reproducibility?: string;
  sampleSizeAdequacy?: string;
  alternativeExplanations?: string[];
  conclusionStrengthEvaluation?: string;
}

export interface EvidenceClaim {
  id: string;
  title: string;
  type: ClaimType;
  evidence: string;
  confidence: number;
  source: string;
  verified: boolean;
  dependencies: string[];
  notes?: string;
  epistemicLabel?: EpistemicLabel;
  verificationStatus?: VerificationStatus;
  adversarialCheck?: EvidenceClaimAdversarial;
}

export interface KeyFindingDetailed {
  baseline: string;
  current: string;
  variance: string;
  confidence: number;
  dataSource: string;
}

export interface KeyFinding {
  id: string;
  label: string;
  value: string;
  change: string;
  direction: 'up' | 'down' | 'flat';
  subtext: string;
  metricType: string;
  evidenceClaimId: string;
  detailedData: KeyFindingDetailed;
  epistemicStatus?: EpistemicStatus;
  epistemicLabel?: EpistemicLabel;
}

export type DependencyNodeImpact =
  | 'DIRECTLY AFFECTED'
  | 'INDIRECTLY AFFECTED'
  | 'UNAFFECTED';

export type DependencyNodeType =
  | 'RECOMMENDATION'
  | 'DECISION_OPTION'
  | 'SCENARIO_INPUT'
  | 'CLAIM'
  | 'EMPIRICAL_FINDING'
  | 'CALCULATION'
  | 'DATA_SOURCE'
  | 'MARKET_INTEL';

export interface DependencyGraphNode {
  id: string;
  title: string;
  nodeType: DependencyNodeType;
  description: string;
  dependencies: string[];
  impactStatus: DependencyNodeImpact;
}

export type QuestionClassification =
  | 'Diagnostic'
  | 'Prescriptive'
  | 'Descriptive'
  | 'Predictive'
  | string;

export type ExecutionNodeStatus =
  | 'COMPLETED'
  | 'RUNNING'
  | 'PLANNED'
  | 'SKIPPED'
  | 'BLOCKED'
  | 'REQUIRES MORE DATA';

export type InvestigationStatus =
  | 'DATA INSUFFICIENT'
  | 'EVIDENCE CONFLICT'
  | 'TOOL FAILURE'
  | 'FORECAST UNRELIABLE'
  | 'CLAIM UNVERIFIED'
  | 'INVESTIGATION BLOCKED'
  | 'MARKET INTELLIGENCE UNAVAILABLE';

export interface InvestigationIssue {
  status: InvestigationStatus;
  failedComponent: string;
  impact: string;
  confidenceDelta: number;
  nextAction: string;
}

export interface ExecutionGraphNode {
  id: string;
  label: string;
  dimension: string;
  status: ExecutionNodeStatus;
  summary: string;
  prerequisiteIds: string[];
  isAdaptiveBranch?: boolean;
  evidenceFound?: string;
  requiresDataSourceId?: string;
  anomalyDetected?: boolean;
  whySelected?: string;
  inputRequired?: string[];
  sufficiencyCheck?: string;
  nextToolIfInsufficient?: string;
}

export interface DiscoveredAnomaly {
  metric: string;
  deviation: string;
  dimension: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceRef: string;
}

export interface MultiDimConfidenceBreakdown {
  dataQuality: number;
  evidenceVerification: number;
  evidenceCoverage: number;
  claimVerification: number;
  evidenceConsistency: number;
  sourceCompleteness: number;
  analysisReliability: number;
  missingRequiredInputs: number;
  conflictingEvidence: number;
  externalEvidenceReliability: number;
  forecastReliability: number;
  assumptionStability: number;
  contradictionPenalty: number;
  scenarioRobustness: number;
}

export interface MultiDimConfidence {
  overallScore: number;
  level: 'DATA INSUFFICIENT' | 'LOW' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH';
  breakdown: MultiDimConfidenceBreakdown;
  explanations: Partial<Record<keyof MultiDimConfidenceBreakdown, string>>;
  topBoosters: string[];
  topReducers: string[];
  epistemicCaveat: string;
}

export interface CounterfactualAnalysis {
  robustnessRating: 'ROBUST' | 'SENSITIVE' | 'FRAGILE';
  whyPreferred: string;
  evidenceAdvantageOverAlternatives: string;
  dependentAssumptions: string[];
  reversalTriggers: string[];
  inactionDownside: string;
  smallestSafeExperiment: string;
}

export interface RobustnessStateSnapshot {
  dataQuality: number;
  verifiedClaimsCount: number;
  overallConfidence: string;
  confidenceScore: number;
  recommendationTitle: string;
}

export interface RobustnessTestComparison {
  sourceId: string;
  sourceName: string;
  rating: 'ROBUST' | 'SENSITIVE' | 'FRAGILE';
  evidenceRole: 'CRITICAL TO DECISION' | 'SUPPORTING' | string;
  before: RobustnessStateSnapshot;
  after: RobustnessStateSnapshot;
  deltaExplanation: string;
  recommendationShift: boolean;
  recommendedActionIfSourceLost: string;
}

export interface DecisionRecord {
  decision: 'APPROVE' | 'MODIFY' | 'REJECT' | null;
  timestamp: string;
  executiveNotes?: string;
  modifiedScope?: string;
  rejectionReason?: string;
  signoffUser?: string;
  deciderName?: string;
  deciderRole?: string;
}

export interface DataQualityProfile {
  overallPercent: number;
  completeness: number;
  freshness: number;
  consistency: number;
}

export interface UnifiedInvestigationState {
  investigationId: string;
  runId: string;
  userQuestion: string;
  classifiedQuestionTypes: QuestionClassification[];
  timestamp: string;
  dataQuality: DataQualityProfile;
  activeDataSources: DataSource[];
  investigationPlan: ExecutionGraphNode[];
  claims: EvidenceClaim[];
  empiricalFindings: KeyFinding[];
  discoveredAnomalies: DiscoveredAnomaly[];
  marketIntelligence: MarketSignal[];
  scenarioResults: MultiScenarioItem[];
  recommendation: string;
  recommendationExplanation: string;
  recommendationConfidence: MultiDimConfidence;
  counterfactual: CounterfactualAnalysis;
  auditEvents: AuditEvent[];
  selectedOptionId?: string;
  governanceDecision?: DecisionRecord;
  issues?: InvestigationIssue[];
}

export interface InvestigationRun {
  id: string;
  question: string;
  timestamp: string;
  dataQualityPercent: number;
  overallConfidence: string;
  confidenceScore: number;
  executiveRecommendation: string;
  businessContext: BusinessContext;
  investigationState: InvestigationState | UnifiedInvestigationState;
  decisionRecord: DecisionRecord | null;
  selectedOptionId?: string;
  scenarioState?: ScenarioParams;
  scenarioResult?: ScenarioResult;
}

export interface InvestigationStage {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'running';
  dynamicMessage: string;
  explanation: string;
  logMessage: string;
  durationMs: number;
  findingsCount?: number;
}

export interface RootCauseStep {
  step: number;
  title: string;
  description: string;
  type: ClaimType;
  evidenceRef: string;
}

export interface InvestigationState {
  runId: string;
  question: string;
  timestamp: string;
  questionType: string;
  dataQualityPercent: number;
  evidenceClaimsCount: number;
  verifiedClaimsCount: number;
  warningsCount: number;
  overallConfidence: string;
  confidenceScore: number;
  executiveRecommendation: string;
  recommendationExplanation?: string;
  stages?: InvestigationStage[];
  keyFindings?: KeyFinding[];
  marketSignals?: MarketSignal[];
  strategicOptions?: StrategicOption[];
  evidenceClaims?: EvidenceClaim[];
  rootCauseChain?: RootCauseStep[];
  conditionShifts?: string[];
  risksAndLimitations?: string[];
  risks?: string[];
  auditEvents?: AuditEvent[];
}
