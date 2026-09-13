import {
  UnifiedInvestigationState,
  BusinessContext,
  DataSource,
  DecisionRecord,
  ExecutionGraphNode,
  EvidenceClaim,
  KeyFinding,
  DiscoveredAnomaly,
  MarketSignal,
  MultiScenarioItem,
  CounterfactualAnalysis,
  AuditEvent,
  RobustnessTestComparison,
  DependencyGraphNode,
  QuestionClassification,
  InvestigationIssue,
} from '../types';
import {
  PRIMARY_INVESTIGATION,
  DEFAULT_BUSINESS_CONTEXT,
  DEFAULT_DATA_SOURCES,
} from '../mockData';
import {
  AVAILABLE_TOOLS,
  INTENT_TO_TOOL_MAPPING,
} from './orchestratorEngine';
import { calculateDecisionConfidence } from './confidenceEngine';

// Helper function to classify question intent
export const classifyQuestionIntent = (question: string): QuestionClassification[] => {
  const lowerQuestion = question.toLowerCase();
  const intents: QuestionClassification[] = [];

  // Diagnostic intent: questions about why something happened, root cause analysis
  if (
    lowerQuestion.includes('why') ||
    lowerQuestion.includes('cause') ||
    lowerQuestion.includes('reason') ||
    lowerQuestion.includes('explain') ||
    lowerQuestion.includes('what happened') ||
    lowerQuestion.includes('driver') ||
    lowerQuestion.includes('factor')
  ) {
    intents.push('Diagnostic');
  }

  // Prescriptive intent: questions about what to do, recommendations, actions
  if (
    lowerQuestion.includes('should') ||
    lowerQuestion.includes('what should') ||
    lowerQuestion.includes('recommend') ||
    lowerQuestion.includes('action') ||
    lowerQuestion.includes('do') ||
    lowerQuestion.includes('intervention') ||
    lowerQuestion.includes('solution') ||
    lowerQuestion.includes('strategy')
  ) {
    intents.push('Prescriptive');
  }

  // Investigative intent: questions about exploring data, finding patterns, anomalies
  if (
    lowerQuestion.includes('analyze') ||
    lowerQuestion.includes('investigate') ||
    lowerQuestion.includes('examine') ||
    lowerQuestion.includes('look into') ||
    lowerQuestion.includes('pattern') ||
    lowerQuestion.includes('trend') ||
    lowerQuestion.includes('anomaly') ||
    lowerQuestion.includes('outlier')
  ) {
    intents.push('Investigative');
  }

  // Exploratory intent: questions about understanding, learning, discovering
  if (
    lowerQuestion.includes('understand') ||
    lowerQuestion.includes('learn') ||
    lowerQuestion.includes('discover') ||
    lowerQuestion.includes('explore') ||
    lowerQuestion.includes('insight') ||
    lowerQuestion.includes('what is') ||
    lowerQuestion.includes('how does')
  ) {
    intents.push('Investigative'); // Exploratory maps to Investigative for tool selection
  }

  // Default to diagnostic if no specific intent detected
  if (intents.length === 0) {
    intents.push('Diagnostic');
  }

  return intents;
};

// Helper function to select tools based on intent and question context
export const selectToolsForInvestigation = (
  intent: QuestionClassification[],
  question: string,
  dataSources: DataSource[]
): Array<{
  id: string;
  label: string;
  dimension: string;
  status: 'PLANNED' | 'COMPLETED' | 'RUNNING' | 'BLOCKED' | 'SKIPPED' | 'REQUIRES MORE DATA';
  summary: string;
  prerequisiteIds: string[];
  evidenceFound?: string;
  requiresDataSourceId?: string;
  anomalyDetected?: boolean;
  isAdaptiveBranch?: boolean;
  whySelected?: string;
  inputRequired?: string[];
  sufficiencyCheck?: string;
  nextToolIfInsufficient?: string;
}> => {
  const normalized = question.toLowerCase();
  const hasData = dataSources.some((source) => source.selected && source.recordsCount > 0);
  const hasSalesLedger = dataSources.some((source) => source.id === 'src-1' && source.selected);
  const isDiagnostic = intent.includes('Diagnostic');
  const isPrescriptive = intent.includes('Prescriptive');
  const wantsTrend = /trend|declin|drop|anomal|outlier|pattern|sales|revenue|metric|driver/.test(normalized);
  const wantsExternal = /market|competitor|external|industry|pricing pressure|rival/.test(normalized);
  const wantsForecast = /future|predict|forecast|project|will /.test(normalized);
  const wantsScenario = /what if|scenario|simulation|option|should|recommend|strategy|intervention/.test(normalized);
  const wantsVisualization = /chart|visual|dashboard|plot|graph/.test(normalized);
  const selected: { tool: typeof AVAILABLE_TOOLS[keyof typeof AVAILABLE_TOOLS]; why: string; status?: 'BLOCKED' | 'REQUIRES MORE DATA' }[] = [];
  const add = (tool: typeof AVAILABLE_TOOLS[keyof typeof AVAILABLE_TOOLS], why: string, status?: 'BLOCKED' | 'REQUIRES MORE DATA') => {
    if (!selected.some((item) => item.tool.id === tool.id)) selected.push({ tool, why, status });
  };

  add(AVAILABLE_TOOLS.DATA_PROFILER, hasData
    ? 'Validate schema, completeness, freshness, and join keys before using evidence.'
    : 'Establish whether usable data exists before making any claim.', hasData ? undefined : 'BLOCKED');
  if (wantsTrend || isDiagnostic || isPrescriptive) {
    add(AVAILABLE_TOOLS.SQL_PANDAS_ANALYTICS, 'Calculate the requested business measure from validated records.', hasSalesLedger ? undefined : 'REQUIRES MORE DATA');
  }
  if (wantsTrend || isDiagnostic) {
    add(AVAILABLE_TOOLS.ANOMALY_DETECTION, 'Test whether the reported movement is materially unusual against a baseline.', hasSalesLedger ? undefined : 'REQUIRES MORE DATA');
  }
  if (isDiagnostic) {
    add(AVAILABLE_TOOLS.ROOT_CAUSE_ANALYSIS, 'Compare temporal and dimensional evidence to separate drivers from correlation.', hasSalesLedger ? undefined : 'REQUIRES MORE DATA');
  }
  if (wantsExternal) add(AVAILABLE_TOOLS.MARKET_SEARCH, 'Check external pressure only because the question names market or competitor factors.');
  if (wantsForecast) add(AVAILABLE_TOOLS.FORECASTING, 'Project the requested future outcome using sufficient historical history.', hasSalesLedger ? undefined : 'REQUIRES MORE DATA');
  if (wantsScenario) add(AVAILABLE_TOOLS.SCENARIO_SIMULATION, 'Compare the requested intervention or options under explicit assumptions.', hasSalesLedger ? undefined : 'REQUIRES MORE DATA');
  if (isPrescriptive || isDiagnostic || wantsExternal || wantsForecast || wantsScenario) {
    add(AVAILABLE_TOOLS.EVIDENCE_VERIFICATION, 'Verify claims and block unsupported causal or predictive conclusions before synthesis.', hasData ? undefined : 'REQUIRES MORE DATA');
  }
  if (wantsVisualization) add(AVAILABLE_TOOLS.VISUALIZATION, 'Render the requested result after the underlying calculation is complete.', hasData ? undefined : 'REQUIRES MORE DATA');

  return selected.map(({ tool, why, status }, index) => {
    const previous = selected[index - 1]?.tool.id;
    const isBlocked = status === 'BLOCKED' || status === 'REQUIRES MORE DATA';
    return {
      id: tool.id,
      label: tool.name,
      dimension: tool.description,
      status: status || 'PLANNED',
      summary: isBlocked ? `${status}: ${tool.name} cannot produce reliable output from the current inputs.` : `Planned because: ${why}`,
      prerequisiteIds: previous ? [previous] : [],
      evidenceFound: undefined,
      requiresDataSourceId: ['sql-pandas-analytics', 'anomaly-detection', 'root-cause-analysis'].includes(tool.id) ? 'src-1' : undefined,
      anomalyDetected: false,
      isAdaptiveBranch: false,
      whySelected: why,
      inputRequired: tool.inputRequired,
      sufficiencyCheck: `Accept output only when ${tool.outputProvides.join(', ')} are present and internally consistent.`,
      nextToolIfInsufficient: tool.id === 'data-profiler' ? 'INVESTIGATION BLOCKED' : 'evidence-verification',
    };
  });
};

// Helper function to generate concise execution messages based on tool and context
export const generateExecutionMessage = (
  toolId: string,
  context: {
    question: string;
    completedTools: string[];
    dataAvailable: boolean;
  }
): string => {
  const toolNameMap: Record<string, string> = {
    'data-profiler': 'Profiling enterprise data hygiene',
    'sql-pandas-analytics': 'Calculating core business metrics',
    'anomaly-detection': 'Detecting significant data anomalies',
    'root-cause-analysis': 'Tracing causal relationships',
    'forecasting': 'Projecting future trends',
    'market-search': 'Gathering market intelligence',
    'evidence-verification': 'Verifying evidence validity',
    'scenario-simulation': 'Running scenario simulations',
    'visualization': 'Generating data visualizations'
  };
  
  const baseMessage = toolNameMap[toolId] || 'Executing analytical tool';
  
  // Add contextual qualifiers based on question and progress
  if (context.completedTools.length > 0) {
    if (context.completedTools.includes('data-profiler') && !context.completedTools.includes('sql-pandas-analytics')) {
      return `Analyzing regional revenue contribution...`;
    }
    
    if (context.completedTools.includes('sql-pandas-analytics') && !context.completedTools.includes('anomaly-detection')) {
      return `Detected significant Product A decline in Region South.`;
    }
    
    if (context.completedTools.includes('anomaly-detection') && !context.completedTools.includes('root-cause-analysis')) {
      return `Investigating whether external market pressure could explain the pattern.`;
    }
    
    if (context.completedTools.includes('root-cause-analysis') && !context.completedTools.includes('evidence-verification')) {
      return `Verifying evidence before generating recommendation.`;
    }
  }
  
  // Default contextual messages based on tool
  switch (toolId) {
    case 'data-profiler':
      return 'Profiling enterprise data hygiene...';
    case 'sql-pandas-analytics':
      return 'Calculating core business metrics...';
    case 'anomaly-detection':
      return 'Detecting significant data anomalies...';
    case 'root-cause-analysis':
      return 'Tracing causal relationships...';
    case 'forecasting':
      return 'Projecting future trends...';
    case 'market-search':
      return 'Gathering market intelligence...';
    case 'evidence-verification':
      return 'Verifying evidence validity...';
    case 'scenario-simulation':
      return 'Running scenario simulations...';
    case 'visualization':
      return 'Generating data visualizations...';
    default:
      return baseMessage + '...';
  }
};

export interface BuildUnifiedInvestigationParams {
  runId?: string;
  userQuestion?: string;
  businessContext?: BusinessContext;
  dataSources?: DataSource[];
  selectedOptionId?: string;
  governanceDecision?: DecisionRecord;
}

export const DEFAULT_PLAN_NODES: ExecutionGraphNode[] = [
  {
    id: 'plan-1',
    label: 'Classify & Scope Inquiry',
    dimension: 'Intent Analysis',
    status: 'COMPLETED',
    summary: 'Deconstructed prompt into Diagnostic (why sales dropped) and Prescriptive (corrective decision options) vectors.',
    prerequisiteIds: [],
    evidenceFound: 'Diagnostic + Prescriptive vector confirmed with high clarity.',
  },
  {
    id: 'plan-2',
    label: 'Profile Enterprise Data Hygiene',
    dimension: 'Data Profiling',
    status: 'COMPLETED',
    summary: 'Cross-audited 78,420 sales rows, 42,110 customer accounts, and 21,851 marketing ledger entries.',
    prerequisiteIds: ['plan-1'],
    evidenceFound: '91% overall data hygiene score; zero critical foreign key breaks.',
    requiresDataSourceId: 'src-1',
  },
  {
    id: 'plan-3',
    label: 'Calculate Macro Performance Baseline',
    dimension: 'Financial Accounting',
    status: 'COMPLETED',
    summary: 'Reconciled 6-month trailing revenue ($18.40M) against baseline ($21.45M), isolating -$3.05M contraction (-14.2%).',
    prerequisiteIds: ['plan-2'],
    evidenceFound: 'Verified -$3.05M total enterprise contraction [CLAIM-017].',
    requiresDataSourceId: 'src-1',
  },
  {
    id: 'plan-4',
    label: 'Isolate SKU Line Variances',
    dimension: 'Product Analytics',
    status: 'COMPLETED',
    summary: 'SKU decomposition reveals Product A volume contracted -21.0% (-$2.08M), accounting for 68.2% of total top-line decline.',
    prerequisiteIds: ['plan-3'],
    evidenceFound: 'Product A isolated as primary contributor to decline [CLAIM-024].',
    requiresDataSourceId: 'src-1',
    anomalyDetected: true,
  },
  {
    id: 'plan-5',
    label: 'Branch: Regional Concentration Anomaly',
    dimension: 'Territory Telemetry',
    status: 'COMPLETED',
    summary: 'Spawned adaptive branch following Product A anomaly: Region South sales dropped -18.4% with Product A velocity down 31.4%.',
    prerequisiteIds: ['plan-4'],
    isAdaptiveBranch: true,
    evidenceFound: 'Region South confirmed as geographic epicenter [CLAIM-028].',
    requiresDataSourceId: 'src-4',
    anomalyDetected: true,
  },
  {
    id: 'plan-6',
    label: 'Branch: Customer Cohort Retention Audit',
    dimension: 'Customer Analytics',
    status: 'COMPLETED',
    summary: 'Audited 90-day repeat purchase rate in Region South: slipped from 49.0% to 42.8% (-12.7% relative deterioration).',
    prerequisiteIds: ['plan-5'],
    isAdaptiveBranch: true,
    evidenceFound: 'Repeat buyer cohort defection isolated in Southern accounts [CLAIM-026].',
    requiresDataSourceId: 'src-2',
  },
  {
    id: 'plan-7',
    label: 'Incorporate Competitor Intelligence',
    dimension: 'Market Telemetry',
    status: 'COMPLETED',
    summary: 'Cross-referenced NexaCorp promotional campaign: 15-20% localized volume rebates in Southern industrial hubs.',
    prerequisiteIds: ['plan-6'],
    evidenceFound: 'Competitor pricing blitz directly overlaps timing of retention drop [CLAIM-030].',
    requiresDataSourceId: 'src-5',
  },
  {
    id: 'plan-8',
    label: 'Synthesize Falsifiable Recommendation',
    dimension: 'Decision Engine',
    status: 'COMPLETED',
    summary: 'Formulated targeted regional intervention for Product A in Region South with bounded pilot experiment and margin floor protection.',
    prerequisiteIds: ['plan-4', 'plan-5', 'plan-7'],
    evidenceFound: 'Recommended Option 1 with 84% multi-dimensional confidence [CLAIM-031].',
  },
];

export const DEFAULT_DISCOVERED_ANOMALIES: DiscoveredAnomaly[] = [
  {
    metric: 'Product A Volume Drop',
    deviation: '-21.0% (68.2% of total top-line contraction)',
    dimension: 'SKU Line',
    severity: 'HIGH',
    evidenceRef: 'CLAIM-024',
  },
  {
    metric: 'Region South Velocity Contraction',
    deviation: '-31.4% velocity collapse for Product A in South territory',
    dimension: 'Geography',
    severity: 'HIGH',
    evidenceRef: 'CLAIM-028',
  },
  {
    metric: 'Southern Customer Repurchase Drop',
    deviation: '90-day cohort retention fell from 49.0% to 42.8%',
    dimension: 'Customer Cohort',
    severity: 'MEDIUM',
    evidenceRef: 'CLAIM-026',
  },
];

export const DEFAULT_COUNTERFACTUAL: CounterfactualAnalysis = {
  robustnessRating: 'ROBUST',
  whyPreferred:
    'Option 1 (Targeted Pricing & Regional Intervention) isolates the exact epicenter of contraction without sacrificing company-wide gross margins.',
  evidenceAdvantageOverAlternatives:
    'Directly targets Product A in Region South where 68.2% of contraction originated. Preserves 89% of gross margins compared to across-the-board discounting.',
  dependentAssumptions: [
    'Regional distributor partnerships in Region South remain cooperative for co-funded promotion.',
    'Product A inventory in Bangalore/South warehouse can support +12% replenishment volume.',
    'Competitor A promotional blitz does not instantly extend into Northern territory.',
  ],
  reversalTriggers: [
    'Product A sales recover organically in next 30 days without price intervention.',
    'Investigation reveals decline was caused by logistics disruption rather than competitor pricing.',
    'Competitor A terminates discounting campaign early.',
    'Distributor co-funding pushes gross margin erosion past the 38% hurdle rate.',
  ],
  inactionDownside:
    'Ongoing erosion of -₹4.2L/month in top-line contribution and permanent customer defection to competitor ecosystems.',
  smallestSafeExperiment:
    'Deploy a 30-day pilot test in top 5 Southern distributor nodes offering an 8% bundle rebate with ₹1.5L co-op spend, tracking weekly repurchase velocity.',
};

export const DEFAULT_SCENARIOS: MultiScenarioItem[] = [
  {
    id: 'scenario-a',
    name: 'Targeted Regional Value Bundle (Recommended)',
    label: 'MODELLED ESTIMATE',
    isRecommended: true,
    modeledOutputs: {
      revenueDelta: 7.8,
      grossMarginDelta: -3.8,
      customerVolumeDelta: 17.1,
      customerRetentionDelta: 5.2,
      riskScore: 24,
      executionRisk: 'Low',
      capitalRequiredLakhs: 2.8,
    },
    riskLevel: 'Low',
    feasibility: 'High',
    timeToPayoffMonths: 2,
    supportingEvidenceRefs: ['CLM-017', 'CLM-024', 'CLM-028'],
    assumptions: ['South customers respond to bundle discount', 'Dealer co-op support active'],
    downsides: ['Requires field distributor coordination'],
  },
  {
    id: 'scenario-b',
    name: 'Company-Wide 10% Price Reduction',
    label: 'STRESS TEST',
    isRecommended: false,
    modeledOutputs: {
      revenueDelta: 2.1,
      grossMarginDelta: -11.4,
      customerVolumeDelta: 9.4,
      customerRetentionDelta: 2.1,
      riskScore: 78,
      executionRisk: 'High',
      capitalRequiredLakhs: 0,
    },
    riskLevel: 'High',
    feasibility: 'Medium',
    timeToPayoffMonths: 6,
    supportingEvidenceRefs: ['CLM-017'],
    assumptions: ['Price elasticity across all lines is high'],
    downsides: ['Severe margin destruction across healthy products', 'Trains accounts to demand discounts'],
  },
  {
    id: 'scenario-c',
    name: 'National Digital Marketing Blitz',
    label: 'MODELLED ESTIMATE',
    isRecommended: false,
    modeledOutputs: {
      revenueDelta: 4.8,
      grossMarginDelta: -1.8,
      customerVolumeDelta: 6.2,
      customerRetentionDelta: 1.1,
      riskScore: 52,
      executionRisk: 'Medium',
      capitalRequiredLakhs: 8.5,
    },
    riskLevel: 'Medium',
    feasibility: 'Medium',
    timeToPayoffMonths: 4,
    supportingEvidenceRefs: ['CLM-026'],
    assumptions: ['CAC remains stable at scale'],
    downsides: ['High capital burn without addressing localized pricing friction'],
  },
  {
    id: 'scenario-d',
    name: 'Do Nothing (Observe Organic Trends)',
    label: 'STRESS TEST',
    isBaseline: true,
    isRecommended: false,
    modeledOutputs: {
      revenueDelta: -4.2,
      grossMarginDelta: -0.5,
      customerVolumeDelta: -8.5,
      customerRetentionDelta: -6.2,
      riskScore: 85,
      executionRisk: 'High',
      capitalRequiredLakhs: 0,
    },
    riskLevel: 'High',
    feasibility: 'High',
    timeToPayoffMonths: 0,
    supportingEvidenceRefs: ['CLM-017', 'CLM-024'],
    assumptions: ['Market dynamics self-correct'],
    downsides: ['Ongoing customer defection and permanent loss of territory shelf space'],
  },
];

export const DEFAULT_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-09-12 08:52:19 UTC',
    eventName: 'Orchestrator: Inquiry Ingestion & Scope Classification',
    component: 'Orchestrator Reasoning Agent',
    inputTrigger: 'User Prompt: "Our sales have fallen over the last six months..."',
    outputSummary: 'Taxonomy mapped to Diagnostic + Prescriptive. Activated 8-stage verification pipeline.',
    confidenceImpact: '+12% baseline initialization',
    claimsGenerated: ['CLAIM-017'],
  },
  {
    id: 'evt-002',
    timestamp: '2026-09-12 08:52:20 UTC',
    eventName: 'Data Profiler: Multi-Source Hygiene Audit',
    component: 'Data Profiler Analytical Service',
    inputTrigger: 'Ingested datasets: Sales CSV, Customer Excel, Marketing CSV, Warehouse DB, Competitor API',
    outputSummary: 'Audited 349,782 records across 5 sources. Verified 91% hygiene; no orphan keys detected.',
    confidenceImpact: '+25% data quality anchor',
    dataSourcesQueried: ['src-1', 'src-2', 'src-3', 'src-4', 'src-5'],
  },
  {
    id: 'evt-003',
    timestamp: '2026-09-12 08:52:21 UTC',
    eventName: 'Business Analytics Engine: Metric Reconciliations',
    component: 'Business Analytics Engine',
    inputTrigger: 'Deterministic ledger queries over fct_daily_revenue_v2',
    outputSummary: 'Confirmed -$3.05M top-line delta (-14.2%). Isolated Product A as 68.2% contributor.',
    confidenceImpact: '+20% empirical verification',
    claimsGenerated: ['CLAIM-017', 'CLAIM-024'],
  },
  {
    id: 'evt-004',
    timestamp: '2026-09-12 08:52:22 UTC',
    eventName: 'Adaptive Planner: Anomaly Trigger & Recursive Branching',
    component: 'Dynamic Investigation Planner',
    inputTrigger: 'Product A variance exceeded threshold (>50% of portfolio delta)',
    outputSummary: 'Spawned recursive child nodes: Region South audit & Customer retention analysis.',
    confidenceImpact: '+15% diagnostic specificity',
    claimsGenerated: ['CLAIM-028', 'CLAIM-026'],
  },
  {
    id: 'evt-005',
    timestamp: '2026-09-12 08:52:23 UTC',
    eventName: 'Market Intelligence: Competitor Telemetry Verification',
    component: 'Market Intelligence Agent',
    inputTrigger: 'Regional distributor feedback and category discount webhooks',
    outputSummary: 'Verified NexaCorp 15-20% promo discounts overlapping South customer churn period.',
    confidenceImpact: '+10% external triangulation',
    claimsGenerated: ['CLAIM-030'],
  },
  {
    id: 'evt-006',
    timestamp: '2026-09-12 08:52:24 UTC',
    eventName: 'Evidence Verifier: Epistemic Boundary Audit',
    component: 'Evidence Verification Agent',
    inputTrigger: 'Claims CLM-017 through CLM-031 submitted for verification',
    outputSummary: 'Audited 12 claims: 10 verified, 2 bounds flagged. Epistemic labels strictly enforced.',
    confidenceImpact: '+12% epistemic safety',
    claimsGenerated: ['CLAIM-031'],
  },
  {
    id: 'evt-007',
    timestamp: '2026-09-12 08:52:25 UTC',
    eventName: 'Recommendation Engine: Synthesis & Falsification Criteria',
    component: 'Recommendation Engine',
    inputTrigger: 'Multi-criteria score across Options A, B, C, and Inaction',
    outputSummary: 'Synthesized Option 1 with explicit reversal triggers and bounded pilot experiment.',
    confidenceImpact: 'Finalized at 84% (HIGH)',
    claimsGenerated: ['CLAIM-031', 'CLAIM-032'],
  },
];

export const buildUnifiedInvestigationState = (
  params?: Partial<BuildUnifiedInvestigationParams>
): UnifiedInvestigationState => {
  const runId = params?.runId || 'RUN-004';
  const userQuestion =
    params?.userQuestion ||
    PRIMARY_INVESTIGATION.question;
  const activeDataSources = params?.dataSources || DEFAULT_DATA_SOURCES;

  // Recalculate data quality based on active sources
  const connectedSources = activeDataSources.filter((s) => s.selected);
  const dataQualityPercent = connectedSources.length > 0
    ? Math.round((connectedSources.length / activeDataSources.length) * 91 + 9)
    : 0;

  const hasSalesLedger = activeDataSources.some((s) => s.id === 'src-1' && s.selected);
  const issues: InvestigationIssue[] = [];

  if (connectedSources.length === 0) {
    issues.push({
      status: 'INVESTIGATION BLOCKED',
      failedComponent: 'Data intake',
      impact: 'No selected source can support profiling, calculations, or evidence-backed recommendations.',
      confidenceDelta: -72,
      nextAction: 'Connect and select at least one source with usable records.',
    });
  } else if (!hasSalesLedger) {
    issues.push({
      status: 'DATA INSUFFICIENT',
      failedComponent: 'SQL/Pandas Analytics Engine',
      impact: 'The sales ledger is unavailable, so revenue movement and driver claims cannot be established.',
      confidenceDelta: -72,
      nextAction: 'Reconnect the sales ledger and verify required revenue and period columns.',
    });
  }

  // Classify question intent and select appropriate tools dynamically
  const questionIntents = classifyQuestionIntent(userQuestion);
  const investigationPlan = selectToolsForInvestigation(
    questionIntents,
    userQuestion,
    activeDataSources
  );

  const claims = hasSalesLedger ? PRIMARY_INVESTIGATION.evidenceClaims || [] : [];
  const empiricalFindings = hasSalesLedger ? PRIMARY_INVESTIGATION.keyFindings || [] : [];
  const dataQuality = {
    overallPercent: dataQualityPercent,
    completeness: hasSalesLedger ? 94 : 32,
    freshness: hasSalesLedger ? 92 : 40,
    consistency: hasSalesLedger ? 96 : 40,
  };
  const preliminaryState: UnifiedInvestigationState = {
    investigationId: `INV-${runId}`,
    runId,
    userQuestion,
    classifiedQuestionTypes: questionIntents,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    dataQuality,
    activeDataSources,
    investigationPlan,
    claims,
    empiricalFindings,
    discoveredAnomalies: hasSalesLedger ? DEFAULT_DISCOVERED_ANOMALIES : [],
    marketIntelligence: hasSalesLedger ? PRIMARY_INVESTIGATION.marketSignals || [] : [],
    scenarioResults: hasSalesLedger ? DEFAULT_SCENARIOS : [],
    recommendation: hasSalesLedger
      ? PRIMARY_INVESTIGATION.executiveRecommendation
      : 'PAUSE INTERVENTION: Sales transaction ledger disconnected. Re-audit data integrity.',
    recommendationExplanation: hasSalesLedger
      ? PRIMARY_INVESTIGATION.recommendationExplanation || ''
      : 'Recommendation confidence is severely impaired due to deactivated transaction ledgers.',
    recommendationConfidence: calculateDecisionConfidence({
      dataQuality,
      dataSources: activeDataSources,
      plan: investigationPlan,
      claims,
      findings: empiricalFindings,
      issues,
    }),
    counterfactual: hasSalesLedger ? DEFAULT_COUNTERFACTUAL : {
      robustnessRating: 'FRAGILE',
      whyPreferred: 'Insufficient data to run meaningful counterfactual analysis.',
      evidenceAdvantageOverAlternatives: 'Cannot compare options without verified data.',
      dependentAssumptions: [],
      reversalTriggers: [],
      inactionDownside: 'Unable to assess risk without reliable data foundation.',
      smallestSafeExperiment: 'Reconnect data sources and verify data integrity before proceeding.'
    },
    auditEvents: [], // Will be populated during execution
    selectedOptionId: params?.selectedOptionId || 'opt-1',
    governanceDecision: params?.governanceDecision,
    issues,
  };

  if (preliminaryState.recommendationConfidence.level === 'DATA INSUFFICIENT') {
    preliminaryState.recommendation = 'DATA INSUFFICIENT: Do not issue a defensible management recommendation.';
    preliminaryState.recommendationExplanation = preliminaryState.recommendationConfidence.epistemicCaveat;
  }

  return preliminaryState;
};

export const recomputeStateWithRemovedSource = (
  currentState: UnifiedInvestigationState,
  removedSourceId: string
): RobustnessTestComparison => {
  const source = currentState.activeDataSources.find((s) => s.id === removedSourceId);
  const sourceName = source ? source.name : removedSourceId;
  const recalculatedSources = currentState.activeDataSources.map((item) =>
    item.id === removedSourceId ? { ...item, selected: false } : item
  );
  const afterState = buildUnifiedInvestigationState({
    runId: `${currentState.runId}-SOURCE-REMOVED`,
    userQuestion: currentState.userQuestion,
    dataSources: recalculatedSources,
    selectedOptionId: currentState.selectedOptionId,
    governanceDecision: currentState.governanceDecision,
  });
  const beforeScore = currentState.recommendationConfidence.overallScore;
  const afterScore = afterState.recommendationConfidence.overallScore;
  const scoreDelta = beforeScore - afterScore;

  return {
    sourceId: removedSourceId,
    sourceName,
    rating: scoreDelta >= 20 || afterState.recommendationConfidence.level === 'DATA INSUFFICIENT' ? 'FRAGILE' : scoreDelta >= 8 ? 'SENSITIVE' : 'ROBUST',
    evidenceRole: removedSourceId === 'src-1' ? 'CRITICAL TO DECISION' : 'SUPPORTING',
    before: {
      dataQuality: currentState.dataQuality.overallPercent,
      verifiedClaimsCount: currentState.claims.filter((claim) => claim.verified).length,
      overallConfidence: currentState.recommendationConfidence.level,
      confidenceScore: beforeScore,
      recommendationTitle: currentState.recommendation,
    },
    after: {
      dataQuality: afterState.dataQuality.overallPercent,
      verifiedClaimsCount: afterState.claims.filter((claim) => claim.verified).length,
      overallConfidence: afterState.recommendationConfidence.level,
      confidenceScore: afterScore,
      recommendationTitle: afterState.recommendation,
    },
    deltaExplanation: afterState.recommendationConfidence.explanations.sourceCompleteness || 'Source completeness was recalculated from the current investigation plan.',
    recommendationShift: currentState.recommendationConfidence.level !== afterState.recommendationConfidence.level || currentState.recommendation !== afterState.recommendation,
    recommendedActionIfSourceLost: afterState.recommendationConfidence.level === 'DATA INSUFFICIENT'
      ? 'Stop recommendation generation. Reconnect the removed source and rerun the investigation.'
      : 'Rerun the investigation and review the recalculated Decision Confidence before proceeding.',
  };

};

export const DEFAULT_EVIDENCE_GRAPH: DependencyGraphNode[] = [
  // Layer 1: Recommendation
  {
    id: 'node-rec',
    title: 'Prioritize Product A in Region South with Value Bundle',
    nodeType: 'RECOMMENDATION',
    description: 'Executive recommendation formulated to reverse 68.2% of total business decline by stabilizing South regional accounts.',
    dependencies: ['node-opt-c', 'node-scen-a'],
    impactStatus: 'UNAFFECTED',
  },
  // Layer 2: Decision Options & Scenarios
  {
    id: 'node-opt-c',
    title: 'Option C: Targeted South Regional Value Bundle',
    nodeType: 'DECISION_OPTION',
    description: 'Deploys localized dealer co-op incentives and value bundling in Region South without broad price deflation.',
    dependencies: ['node-clm-31', 'node-clm-27'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-scen-a',
    title: 'Scenario A: +7.8% Net Revenue Recovery Lift',
    nodeType: 'SCENARIO_INPUT',
    description: 'Directional sensitivity simulation projecting +7.8% revenue recovery lift within 45 days.',
    dependencies: ['node-clm-32', 'node-calc-sku'],
    impactStatus: 'UNAFFECTED',
  },
  // Layer 3: Verified Claims
  {
    id: 'node-clm-17',
    title: 'CLAIM-017: Revenue contracted -14.2% (-$3.05M)',
    nodeType: 'CLAIM',
    description: 'Enterprise top-line contraction verified against consolidated ERP daily sales tables.',
    dependencies: ['node-find-1', 'node-calc-sku'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-clm-24',
    title: 'CLAIM-024: Product A accounts for 68.2% of decline',
    nodeType: 'CLAIM',
    description: 'SKU variance decomposition isolates -$2.08M top-line loss directly in Product A.',
    dependencies: ['node-find-2', 'node-calc-sku'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-clm-27',
    title: 'CLAIM-027: South concentration drives company variance',
    nodeType: 'CLAIM',
    description: 'Causal inference engine connects 54% of Product A drop to Southern distributor switches.',
    dependencies: ['node-clm-24', 'node-find-3', 'node-calc-reg'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-clm-31',
    title: 'CLAIM-031: Option C achieves highest risk-adjusted ROI',
    nodeType: 'CLAIM',
    description: 'Multi-criteria decision appraisal scores Option C at 84/100 utility versus 25/100 for inaction.',
    dependencies: ['node-clm-27', 'node-clm-24', 'node-clm-17'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-clm-32',
    title: 'CLAIM-032: Post-intervention recovery forecast',
    nodeType: 'CLAIM',
    description: 'Monte Carlo simulation of 90-day trajectory with bounded standard error.',
    dependencies: ['node-scen-a'],
    impactStatus: 'UNAFFECTED',
  },
  // Layer 4: Empirical Findings
  {
    id: 'node-find-1',
    title: 'Finding: Total Revenue $18.40M vs $21.45M baseline',
    nodeType: 'EMPIRICAL_FINDING',
    description: 'Audited ERP transaction rows confirming -$3.05M overall contraction.',
    dependencies: ['node-calc-sku'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-find-2',
    title: 'Finding: Product A volume down -21.0% ($2.08M drop)',
    nodeType: 'EMPIRICAL_FINDING',
    description: 'Product SKU Performance ledger showing Product A velocity drop.',
    dependencies: ['node-calc-sku'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-find-3',
    title: 'Finding: Region South down -18.4% ($0.93M drop)',
    nodeType: 'EMPIRICAL_FINDING',
    description: 'Regional distribution telemetry ledger isolating southern territory drop.',
    dependencies: ['node-calc-reg'],
    impactStatus: 'UNAFFECTED',
  },
  // Layer 5: Calculations
  {
    id: 'node-calc-sku',
    title: 'SKU Variance Decomposition (SQL GroupBy)',
    nodeType: 'CALCULATION',
    description: 'SUM(revenue) GROUP BY product_sku, fiscal_month comparing H1 vs H2.',
    dependencies: ['node-src-1'],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-calc-reg',
    title: 'Territory Velocity Divergence Calculation',
    nodeType: 'CALCULATION',
    description: 'SUM(revenue) GROUP BY territory_id, product_sku across distributor channels.',
    dependencies: ['node-src-4'],
    impactStatus: 'UNAFFECTED',
  },
  // Layer 6: Data Sources & Market Intel
  {
    id: 'node-src-1',
    title: 'Sales Data (CSV) · 78,420 ERP Records',
    nodeType: 'DATA_SOURCE',
    description: 'Internal ERP Sales Ledger (Table: fct_daily_revenue_v2) with SHA-256 hash.',
    dependencies: [],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-src-4',
    title: 'Warehouse & ERP Distribution Log (PostgreSQL)',
    nodeType: 'DATA_SOURCE',
    description: 'PostgreSQL inventory and territory fulfillment tables.',
    dependencies: [],
    impactStatus: 'UNAFFECTED',
  },
  {
    id: 'node-mkt-1',
    title: 'Competitor NexaCorp 15-20% Promo Tracking',
    nodeType: 'MARKET_INTEL',
    description: 'External competitive intelligence telemetry and distributor survey feedback.',
    dependencies: [],
    impactStatus: 'UNAFFECTED',
  },
];

