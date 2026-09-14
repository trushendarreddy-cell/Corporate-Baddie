// ============================================================================
// CORPORATEBADDIE 2.0 - Agent & Service Orchestrator Matrix
// Grounded architecture: 5 Reasoning Agents + 4 Analytical Deterministic Services
// ============================================================================

export interface AgentDescriptor {
  id: string;
  name: string;
  category: 'REASONING_AGENT' | 'ANALYTICAL_SERVICE';
  role: string;
  modelOrRuntime: string;
  latencyMs: number;
  tokensOrOps: string;
  status: 'ACTIVE' | 'IDLE' | 'COMPLETED';
  capabilities: string[];
  inputContract: string;
  outputContract: string;
}

// Available tools for dynamic orchestration
export const AVAILABLE_TOOLS = {
  DATA_PROFILER: {
    id: 'data-profiler',
    name: 'Data Profiler',
    description: 'Profiles enterprise data hygiene, checks completeness, validates schemas',
    bestFor: ['initial data assessment', 'data quality checks', 'schema validation'],
    inputRequired: ['raw datasets'],
    outputProvides: ['data quality profile', 'schema information', 'validation reports']
  },
  SQL_PANDAS_ANALYTICS: {
    id: 'sql-pandas-analytics',
    name: 'SQL/Pandas Analytics Engine',
    description: 'Performs deterministic metric calculations, aggregations, and mathematical proofs',
    bestFor: ['revenue calculations', 'margin analysis', 'cohort analysis', 'mathematical verification'],
    inputRequired: ['cleaned datasets', 'metric definitions'],
    outputProvides: ['key metrics', 'variance analysis', 'mathematical proofs']
  },
  ANOMALY_DETECTION: {
    id: 'anomaly-detection',
    name: 'Anomaly Detection System',
    description: 'Identifies statistical outliers, unusual patterns, and significant deviations',
    bestFor: ['finding unusual trends', 'spotting outliers', 'detecting data irregularities'],
    inputRequired: ['time series data', 'baseline metrics'],
    outputProvides: ['anomaly alerts', 'deviation reports', 'significance scores']
  },
  ROOT_CAUSE_ANALYSIS: {
    id: 'root-cause-analysis',
    name: 'Root Cause Analysis Engine',
    description: 'Traces causal chains, identifies underlying drivers, establishes causal links',
    bestFor: ['understanding why things happened', 'establishing causality', 'tracing problem origins'],
    inputRequired: ['correlated data points', 'temporal sequences'],
    outputProvides: ['causal chains', 'root cause identification', 'confidence assessments']
  },
  FORECASTING: {
    id: 'forecasting',
    name: 'Forecasting & Simulation Engine',
    description: 'Projects future trends, runs scenario simulations, models outcomes',
    bestFor: ['predicting future performance', 'scenario planning', 'outcome modeling'],
    inputRequired: ['historical trends', 'assumptions', 'market conditions'],
    outputProvides: ['forecasts', 'scenario outcomes', 'confidence intervals']
  },
  MARKET_SEARCH: {
    id: 'market-search',
    name: 'Market Intelligence Search',
    description: 'Gathers external market data, competitor intelligence, industry trends',
    bestFor: ['understanding external pressures', 'competitor analysis', 'market trend identification'],
    inputRequired: ['market segments', 'competitor names', 'time periods'],
    outputProvides: ['market intelligence', 'competitor insights', 'trend analysis']
  },
  EVIDENCE_VERIFICATION: {
    id: 'evidence-verification',
    name: 'Evidence Verification Agent',
    description: 'Validates numerical claims, enforces epistemic boundaries, prevents false causality',
    bestFor: ['fact-checking claims', 'verifying evidence strength', 'establishing epistemic rigor'],
    inputRequired: ['claims to verify', 'supporting data'],
    outputProvides: ['verified claims', 'epistemic labels', 'verification status']
  },
  SCENARIO_SIMULATION: {
    id: 'scenario-simulation',
    name: 'Scenario Simulation System',
    description: 'Models complex interactions, runs what-if analyses, tests boundary conditions',
    bestFor: ['testing complex scenarios', 'evaluating interventions', 'understanding system dynamics'],
    inputRequired: ['system models', 'variables to test', 'boundary conditions'],
    outputProvides: ['simulation results', 'outcome projections', 'sensitivity analysis']
  },
  VISUALIZATION: {
    id: 'visualization',
    name: 'Visualization Engine',
    description: 'Creates interactive charts, graphs, and visual representations of data',
    bestFor: ['data presentation', 'pattern recognition', 'stakeholder communication'],
    inputRequired: ['processed data', 'chart specifications'],
    outputProvides: ['interactive charts', 'visual dashboards', 'data stories']
  }
};

export const ARCHITECTURE_COMPONENTS: AgentDescriptor[] = [
  // 5 REASONING AGENTS
  {
    id: 'agent-orch',
    name: 'CorporateBaddie Orchestrator',
    category: 'REASONING_AGENT',
    role: 'Interprets high-level business goals, coordinates reasoning loops, plans investigation paths, and monitors evidence sufficiency.',
    modelOrRuntime: 'Gemini 2.5 Flash (Interactions API)',
    latencyMs: 420,
    tokensOrOps: '1,420 tokens / turn',
    status: 'ACTIVE',
    capabilities: [
      'Inquiry Intent Decomposition',
      'Dynamic Branch Spawning',
      'Evidence Sufficiency Termination',
      'Executive Brief Synthesis',
      'Dynamic Tool Selection',
      'Investigation Path Optimization'
    ],
    inputContract: 'User prompt + BusinessContext + Active DataSources',
    outputContract: 'ExecutionGraphNode[] + InvestigationPlan',
  },
  {
    id: 'agent-mkt',
    name: 'Market Intelligence Agent',
    category: 'REASONING_AGENT',
    role: 'Analyzes external market indicators, competitor discount signals, industry trends, and trade intelligence.',
    modelOrRuntime: 'Gemini 2.5 Flash + Webhook Scrapers',
    latencyMs: 650,
    tokensOrOps: '980 tokens / turn',
    status: 'COMPLETED',
    capabilities: [
      'Competitor Pricing Webhook Mining',
      'External Correlation Mapping',
      'Category Promo Share Tracking',
    ],
    inputContract: 'Target product category + Geographic zone',
    outputContract: 'MarketSignal[] + CompetitorInfo[]',
  },
  {
    id: 'agent-inv',
    name: 'Investigation Agent',
    category: 'REASONING_AGENT',
    role: 'Formulates and tests empirical hypotheses across dimensions (product, territory, customer cohort, channel).',
    modelOrRuntime: 'LangGraph Reasoning Graph Node',
    latencyMs: 510,
    tokensOrOps: '1,150 tokens / turn',
    status: 'COMPLETED',
    capabilities: [
      'Hypothesis Formulation',
      'Cross-Factor Anomaly Isolation',
      'Root-Cause Attribution Tracing',
    ],
    inputContract: 'Data profile + Metric deviations',
    outputContract: 'DiscoveredAnomaly[] + RootCauseStep[]',
  },
  {
    id: 'agent-ver',
    name: 'Evidence Verification Agent',
    category: 'REASONING_AGENT',
    role: 'Audits every numerical claim against deterministic ledgers, enforces epistemic boundary labels, and prevents false causality.',
    modelOrRuntime: 'Strict Epistemic Guardrail Engine',
    latencyMs: 380,
    tokensOrOps: '820 tokens / turn',
    status: 'COMPLETED',
    capabilities: [
      'Ledger Mathematical Audit',
      'Correlation vs Causation Guardrails',
      'Falsifiability Criteria Bounding',
    ],
    inputContract: 'Raw Claims + Underlying Ledger Aggregates',
    outputContract: 'EvidenceClaim[] with EpistemicLabels',
  },
  {
    id: 'agent-rec',
    name: 'Recommendation Agent',
    category: 'REASONING_AGENT',
    role: 'Evaluates strategic options across capital efficiency, feasibility, risk, and defines minimum safe pilot experiments.',
    modelOrRuntime: 'Multi-Criteria Decision Matrix Model',
    latencyMs: 440,
    tokensOrOps: '1,290 tokens / turn',
    status: 'COMPLETED',
    capabilities: [
      'Option Utility Scoring',
      'Worst-Case Pre-Mortem Bounding',
      'Smallest Safe Validation Pilot Design',
    ],
    inputContract: 'Scored Scenarios + Verified Claims + Governance Limits',
    outputContract: 'DecisionRoomOption[] + CounterfactualAnalysis',
  },

  // 4 ANALYTICAL DETERMINISTIC SERVICES
  {
    id: 'svc-prof',
    name: 'Data Profiler Service',
    category: 'ANALYTICAL_SERVICE',
    role: 'Deterministic schema parsing, column typing, null rate inspection, and relational join key validation.',
    modelOrRuntime: 'TypeScript / Node.js Engine',
    latencyMs: 120,
    tokensOrOps: '349,782 records audited',
    status: 'COMPLETED',
    capabilities: [
      'Null & Duplicate Detection',
      'Cross-Table Primary/Foreign Key Check',
      'Data Completeness Scoring',
    ],
    inputContract: 'CSV, Excel, Database Streams',
    outputContract: 'DataQualityProfile + Relational Integrity Report',
  },
  {
    id: 'svc-biz',
    name: 'Business Analytics Engine',
    category: 'ANALYTICAL_SERVICE',
    role: 'Fast deterministic SQL/Pandas metric processing: top-line revenue, contribution margins, cohort repurchase curves.',
    modelOrRuntime: 'In-Memory Numerical Core',
    latencyMs: 85,
    tokensOrOps: '12 analytical aggregations',
    status: 'COMPLETED',
    capabilities: [
      'Top-Line Contraction Reconciliations',
      'SKU Unit Margin Decomposition',
      'Territory Divergence Calculations',
    ],
    inputContract: 'Audited tables (Sales, Customers, Marketing)',
    outputContract: 'KeyFinding[] + Variance Summaries',
  },
  {
    id: 'svc-fore',
    name: 'Forecasting & Simulation Engine',
    category: 'ANALYTICAL_SERVICE',
    role: 'Computes price elasticity, volume lifts, and gross margin drag across multi-scenario sandbox parameter sweeps.',
    modelOrRuntime: 'Statistical Sensitivity Core',
    latencyMs: 140,
    tokensOrOps: '1,000 Monte Carlo iterations',
    status: 'COMPLETED',
    capabilities: [
      'Price Elasticity Response Modeling',
      'Margin Drag & Breakeven Modeling',
      'Parametric "What If?" Sandbox Calculation',
    ],
    inputContract: 'ScenarioParams (Price, Marketing, Discount, Territory)',
    outputContract: 'ScenarioResult + MultiScenarioItem[]',
  },
  {
    id: 'svc-vis',
    name: 'Visualization Engine',
    category: 'ANALYTICAL_SERVICE',
    role: 'Renders interactive time-series charts, SKU share distributions, and dependency DAG graphs with cryptographic hashes.',
    modelOrRuntime: 'Tailwind + SVG + jsPDF Core',
    latencyMs: 60,
    tokensOrOps: 'Dynamic SVG + PDF Generation',
    status: 'ACTIVE',
    capabilities: [
      'Time-Series Trend Charts',
      'Multi-Tier Evidence Graph Rendering',
      'Executive Brief PDF Export',
    ],
    inputContract: 'ChartDataPoint[] + DependencyGraphNode[]',
    outputContract: 'Interactive Charts + Audit Dossier PDF',
  },
];

/** Runtime ownership map: every planned tool has one accountable executor. */
export const TOOL_EXECUTOR_MAP: Record<string, string> = {
  'data-profiler': 'svc-prof',
  'sql-pandas-analytics': 'svc-biz',
  'anomaly-detection': 'agent-inv',
  'root-cause-analysis': 'agent-inv',
  'market-search': 'agent-mkt',
  forecasting: 'svc-fore',
  'scenario-simulation': 'svc-fore',
  'evidence-verification': 'agent-ver',
  visualization: 'svc-vis',
};

export const getToolExecutor = (toolId: string): AgentDescriptor | undefined => {
  const executorId = TOOL_EXECUTOR_MAP[toolId];
  return ARCHITECTURE_COMPONENTS.find((component) => component.id === executorId);
};

// Investigation intent classifications for dynamic tool selection
export const INTENT_TO_TOOL_MAPPING = {
  'diagnostic': [
    AVAILABLE_TOOLS.DATA_PROFILER,
    AVAILABLE_TOOLS.SQL_PANDAS_ANALYTICS,
    AVAILABLE_TOOLS.ANOMALY_DETECTION,
    AVAILABLE_TOOLS.ROOT_CAUSE_ANALYSIS
  ],
  'prescriptive': [
    AVAILABLE_TOOLS.FORECASTING,
    AVAILABLE_TOOLS.SCENARIO_SIMULATION,
    AVAILABLE_TOOLS.MARKET_SEARCH,
    AVAILABLE_TOOLS.SQL_PANDAS_ANALYTICS
  ],
  'investigative': [
    AVAILABLE_TOOLS.DATA_PROFILER,
    AVAILABLE_TOOLS.ANOMALY_DETECTION,
    AVAILABLE_TOOLS.ROOT_CAUSE_ANALYSIS,
    AVAILABLE_TOOLS.EVIDENCE_VERIFICATION
  ],
  'exploratory': [
    AVAILABLE_TOOLS.MARKET_SEARCH,
    AVAILABLE_TOOLS.VISUALIZATION,
    AVAILABLE_TOOLS.SQL_PANDAS_ANALYTICS,
    AVAILABLE_TOOLS.ANOMALY_DETECTION
  ]
};
