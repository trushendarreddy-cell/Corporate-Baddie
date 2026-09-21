import { 
  InvestigationState, 
  ChartDataPoint, 
  ProductBreakdown, 
  RegionBreakdown,
  BusinessContext,
  DataSource,
  DataRelationship,
  DecomposedQuestion,
  DynamicInvestigationTask,
  DecisionRoomOption,
  RiskRadarItem,
  OpportunityItem,
  CompetitorInfo,
  TrendItem,
  EmergingSignal
} from './types';
import { 
  DataSource as WSDataSource,
  Dataset,
  DatasetColumn,
  ColumnType,
  Workspace,
  DatasetRelationship,
  QuestionClassification,
  KeyFinding,
  EvidenceClaim,
  MarketSignal,
  StrategicOption,
  MultiDimConfidence,
  DecisionRecord,
  InvestigationStatus
} from './models/workspace';

// ============================================================================
// DEMO WORKSPACE (Separate from user workspaces)
// ============================================================================

export const DEMO_WORKSPACE: Workspace = {
  id: 'demo-ws-001',
  name: 'Demo Retail Co.',
  slug: 'demo-retail-co',
  description: 'Sample retail business for demonstration purposes',
  industry: 'Retail / E-commerce',
  country: 'India',
  region: 'South Asia',
  currency: 'INR',
  businessObjective: 'Increase profitable revenue while protecting margins',
  currentStrategy: 'Premium product positioning in tier-1 cities',
  knownConstraints: 'Limited marketing budget, seasonal demand fluctuations',
  importantKpis: ['Revenue', 'Gross Margin', 'Customer Retention', 'Average Order Value'],
  managementPriorities: 'Improve profitability without losing customers',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  isDemo: true
};

// ============================================================================
// DEMO DATA SOURCES (For Demo Workspace)
// ============================================================================

export const DEMO_DATA_SOURCES: WSDataSource[] = [
  {
    id: 'demo-src-1',
    workspaceId: 'demo-ws-001',
    type: 'CSV',
    name: 'Sales Data',
    description: 'Consolidated transactional revenue, SKU velocity & regional channel ledger',
    status: 'connected',
    rows: 78420,
    columns: 11,
    selected: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
    config: { hasHeader: true, delimiter: ',' }
  },
  {
    id: 'demo-src-2',
    workspaceId: 'demo-ws-001',
    type: 'Excel',
    name: 'Customer Data',
    description: 'Cohort repeat purchase rates, customer tiering & geographic churn history',
    status: 'connected',
    rows: 42110,
    columns: 9,
    selected: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
    config: { hasHeader: true }
  },
  {
    id: 'demo-src-3',
    workspaceId: 'demo-ws-001',
    type: 'CSV',
    name: 'Marketing Data',
    description: 'Ad spend by region, conversion rates, CAC and promotional discount records',
    status: 'connected',
    rows: 21851,
    columns: 7,
    selected: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
    config: { hasHeader: true, delimiter: ',' }
  },
  {
    id: 'demo-src-4',
    workspaceId: 'demo-ws-001',
    type: 'PostgreSQL',
    name: 'Warehouse & ERP Database',
    description: 'PostgreSQL connector to regional distribution center inventory levels',
    status: 'disconnected',
    host: 'demo-db.corporatebaddie.internal',
    database: 'warehouse',
    schema: 'public',
    table: 'inventory_levels',
    rows: 195000,
    columns: 34,
    selected: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
    config: { ssl: true, connectionPoolSize: 10 }
  },
  {
    id: 'demo-src-5',
    workspaceId: 'demo-ws-001',
    type: 'API',
    name: 'Competitor Price Tracker',
    description: 'Live webhook scraping category pricing across e-commerce & retail portals',
    status: 'connected',
    rows: 12400,
    columns: 8,
    selected: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
    config: { authType: 'api_key' }
  }
];

// ============================================================================
// DEMO DATASETS (For Demo Workspace)
// ============================================================================

export const DEMO_DATASETS: Dataset[] = [
  {
    id: 'demo-ds-1',
    workspaceId: 'demo-ws-001',
    sourceId: 'demo-src-1',
    name: 'Sales Transactions',
    description: 'Transaction-level sales data',
    status: 'ready',
    schema: {
      columns: [
        { name: 'order_id', type: 'string', isNullable: false, uniqueValues: 78420, nullCount: 0, sampleValues: ['ORD-001', 'ORD-002'] },
        { name: 'customer_id', type: 'string', isNullable: false, uniqueValues: 42110, nullCount: 0, sampleValues: ['CUST-001', 'CUST-002'] },
        { name: 'product_id', type: 'string', isNullable: false, uniqueValues: 4, nullCount: 0, sampleValues: ['PROD-A', 'PROD-B'] },
        { name: 'order_date', type: 'date', isNullable: false, nullCount: 0, min: '2025-04-01', max: '2026-03-31', sampleValues: ['2026-03-15', '2026-03-16'] },
        { name: 'region', type: 'string', isNullable: false, uniqueValues: 4, nullCount: 0, sampleValues: ['South', 'North'] },
        { name: 'quantity', type: 'integer', isNullable: false, nullCount: 0, min: 1, max: 50, sampleValues: [1, 2] },
        { name: 'unit_price', type: 'float', isNullable: false, nullCount: 0, min: 999, max: 4999, sampleValues: [1999, 2499] },
        { name: 'discount_percent', type: 'float', isNullable: true, nullCount: 1240, avg: 8.5, sampleValues: [0, 10] },
        { name: 'revenue', type: 'float', isNullable: false, nullCount: 0, min: 999, max: 249950, sampleValues: [1999, 4498] },
        { name: 'margin_percent', type: 'float', isNullable: false, nullCount: 0, avg: 38.5, sampleValues: [35.2, 41.8] },
        { name: 'campaign_id', type: 'string', isNullable: true, nullCount: 21851, sampleValues: ['CAMPAIGN-Q1', null] }
      ]
    },
    rowCount: 78420,
    lastUpdated: '2026-09-10T00:00:00Z',
    dataQualityScore: 91,
    contentHash: 'sha256:abc123def456',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z'
  },
  {
    id: 'demo-ds-2',
    workspaceId: 'demo-ws-001',
    sourceId: 'demo-src-2',
    name: 'Customer Profiles',
    description: 'Customer cohort and retention data',
    status: 'ready',
    schema: {
      columns: [
        { name: 'customer_id', type: 'string', isNullable: false, isPrimaryKey: true, uniqueValues: 42110, nullCount: 0, sampleValues: ['CUST-001', 'CUST-002'] },
        { name: 'region', type: 'string', isNullable: false, uniqueValues: 4, nullCount: 0, sampleValues: ['South', 'North'] },
        { name: 'tier', type: 'string', isNullable: false, uniqueValues: 5, nullCount: 0, sampleValues: ['Premium', 'Standard'] },
        { name: 'signup_date', type: 'date', isNullable: false, nullCount: 0, min: '2024-01-01', max: '2026-03-31', sampleValues: ['2025-06-15', '2025-09-20'] },
        { name: 'total_orders', type: 'integer', isNullable: false, nullCount: 0, min: 1, max: 150, sampleValues: [1, 2] },
        { name: 'repeat_rate_90d', type: 'float', isNullable: false, nullCount: 0, avg: 0.46, sampleValues: [0.428, 0.49] },
        { name: 'churn_risk', type: 'integer', isNullable: false, nullCount: 0, min: 1, max: 100, sampleValues: [15, 45] },
        { name: 'lifetime_value', type: 'float', isNullable: false, nullCount: 0, avg: 12500, sampleValues: [5999, 18999] },
        { name: 'last_purchase_date', type: 'date', isNullable: true, nullCount: 2105, min: '2025-04-01', max: '2026-03-31', sampleValues: ['2026-03-15', null] }
      ]
    },
    rowCount: 42110,
    lastUpdated: '2026-09-10T00:00:00Z',
    dataQualityScore: 88,
    contentHash: 'sha256:def456ghi789',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z'
  },
  {
    id: 'demo-ds-3',
    workspaceId: 'demo-ws-001',
    sourceId: 'demo-src-3',
    name: 'Marketing Campaigns',
    description: 'Campaign performance and attribution data',
    status: 'ready',
    schema: {
      columns: [
        { name: 'campaign_id', type: 'string', isNullable: false, isPrimaryKey: true, uniqueValues: 12, nullCount: 0, sampleValues: ['CAMPAIGN-Q1', 'SUMMER2025'] },
        { name: 'channel', type: 'string', isNullable: false, uniqueValues: 4, nullCount: 0, sampleValues: ['Social', 'Search'] },
        { name: 'spend_lakhs', type: 'float', isNullable: false, nullCount: 0, avg: 4.5, sampleValues: [1.2, 8.5] },
        { name: 'impressions', type: 'integer', isNullable: false, nullCount: 0, min: 1000, max: 500000, sampleValues: [15000, 250000] },
        { name: 'clicks', type: 'integer', isNullable: false, nullCount: 0, min: 50, max: 15000, sampleValues: [500, 8500] },
        { name: 'conversions', type: 'integer', isNullable: false, nullCount: 0, min: 5, max: 2500, sampleValues: [125, 2100] },
        { name: 'date', type: 'date', isNullable: false, nullCount: 0, min: '2025-04-01', max: '2026-03-31', sampleValues: ['2026-03-01', '2026-03-15'] }
      ]
    },
    rowCount: 21851,
    lastUpdated: '2026-09-10T00:00:00Z',
    dataQualityScore: 94,
    contentHash: 'sha256:ghi789jkl012',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z'
  }
];

// ============================================================================
// DEMO RELATIONSHIPS
// ============================================================================

export const DEMO_RELATIONSHIPS: DatasetRelationship[] = [
  {
    id: 'demo-rel-1',
    workspaceId: 'demo-ws-001',
    sourceDatasetId: 'demo-ds-1',
    targetDatasetId: 'demo-ds-2',
    fromColumn: 'customer_id',
    toColumn: 'customer_id',
    relationshipType: 'many_to_one',
    confidence: 98,
    status: 'approved',
    autoDetected: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'demo-rel-2',
    workspaceId: 'demo-ws-001',
    sourceDatasetId: 'demo-ds-1',
    targetDatasetId: 'demo-ds-1',
    fromColumn: 'product_id',
    toColumn: 'product_id',
    relationshipType: 'one_to_one',
    confidence: 100,
    status: 'approved',
    autoDetected: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// ============================================================================
// PRIMARY DEMO INVESTIGATION (from mockData.ts)
// ============================================================================

export const PRIMARY_INVESTIGATION: InvestigationState = {
  runId: 'CB-DEMO-001',
  question: 'Our sales have fallen over the last six months. Find the major drivers and recommend what management should do next.',
  timestamp: '2026-09-12 08:52:19 UTC',
  questionType: 'Diagnostic + Prescriptive',
  dataQualityPercent: 91,
  evidenceClaimsCount: 12,
  verifiedClaimsCount: 10,
  warningsCount: 2,
  overallConfidence: 'MEDIUM-HIGH',
  confidenceScore: 84,
  executiveRecommendation: 'Prioritize Product A in Region South and run a controlled pricing/marketing intervention.',
  recommendationExplanation:
    'CorporateBaddie found that the decline is concentrated in Product A and Region South, while external market signals suggest increased competitive pressure.',
  stages: [
    {
      id: 1,
      title: 'Understanding the business question',
      status: 'completed',
      dynamicMessage: 'Understanding what management actually needs to decide...',
      explanation: 'Parsing user prompt into diagnostic root cause vs prescriptive decision scope and evidentiary hurdles.',
      logMessage: 'Business question analyzed and scope bounded',
      durationMs: 800,
    },
    {
      id: 2,
      title: 'Classifying the question',
      status: 'completed',
      dynamicMessage: 'Classifying the analytical taxonomy of the inquiry...',
      explanation: 'Determining question archetype: Diagnostic (why it happened) combined with Prescriptive (what management should do).',
      logMessage: 'Question classified as Diagnostic + Prescriptive',
      durationMs: 750,
    },
    {
      id: 3,
      title: 'Building investigation plan',
      status: 'completed',
      dynamicMessage: 'Identifying which dimensions could explain the decline...',
      explanation: 'Structuring testable hypotheses across product performance, regional demand, pricing elasticity, and customer cohorts.',
      logMessage: 'Investigation plan generated with 5 dimensional hypotheses',
      durationMs: 900,
    },
    {
      id: 4,
      title: 'Profiling business data',
      status: 'completed',
      dynamicMessage: 'Profiling business transaction data and checking completeness...',
      explanation: 'Auditing 284,520 transaction rows across ERP ledgers, CRM records, and regional distributor logs for hygiene and parity.',
      logMessage: 'Data profiling complete: 91% data completeness confirmed',
      durationMs: 950,
      findingsCount: 4,
    },
    {
      id: 5,
      title: 'Calculating core metrics',
      status: 'completed',
      dynamicMessage: 'Calculating revenue trend, margin contribution, and period baselines...',
      explanation: 'Reconciling 6-month trailing revenue contraction (-14.2%) against rolling historical baselines.',
      logMessage: 'Revenue trend identified (-14.2% top-line contraction)',
      durationMs: 850,
    },
    {
      id: 6,
      title: 'Investigating anomalies',
      status: 'completed',
      dynamicMessage: 'Checking whether the decline is concentrated in specific products, regions, or customers...',
      explanation: 'Isolating variance outliers: Product A (-21.0%) and Region South (-18.4%) account for the majority of contraction.',
      logMessage: 'Product and Region dimensions isolated as primary anomaly epicenters',
      durationMs: 1100,
      findingsCount: 4,
    },
    {
      id: 7,
      title: 'Investigating possible root causes',
      status: 'completed',
      dynamicMessage: 'Investigating possible explanations and causal mechanisms...',
      explanation: 'Tracing the causal chain: separates empirical facts (Product A drop) from inferences (channel friction vs pricing elasticity).',
      logMessage: 'Root-cause causal graph constructed',
      durationMs: 1050,
    },
    {
      id: 8,
      title: 'Checking external market context',
      status: 'completed',
      dynamicMessage: 'Checking whether external market conditions support or contradict the internal findings...',
      explanation: 'Cross-referencing category competitor discounting (+18% promotional blitz) and distributor inventory consolidation.',
      logMessage: 'External market research initiated & competitor signals verified',
      durationMs: 1150,
      findingsCount: 3,
    },
    {
      id: 9,
      title: 'Evaluating possible actions',
      status: 'completed',
      dynamicMessage: 'Testing candidate recommendations against available evidence...',
      explanation: 'Scoring Options A, B, and C across capital efficiency, gross margin preservation, operational risk, and strategic feasibility.',
      logMessage: 'Strategic options evaluated: Option C selected as optimal balance',
      durationMs: 1000,
    },
    {
      id: 10,
      title: 'Verifying evidence',
      status: 'completed',
      dynamicMessage: 'Verifying the claims used by the recommendation...',
      explanation: 'Auditing the 12 underlying empirical claims, bounding statistical uncertainty, and verifying ledger reconciliations.',
      logMessage: 'Evidence verification completed (10/12 verified, 2 bounds flagged)',
      durationMs: 900,
      findingsCount: 12,
    },
    {
      id: 11,
      title: 'Building recommendation',
      status: 'completed',
      dynamicMessage: 'Synthesizing executive recommendation and defining reversal triggers...',
      explanation: 'Compiling final executive brief with explicit epistemic boundary conditions: what evidence would change our advice.',
      logMessage: 'Executive recommendation built with falsification boundaries',
      durationMs: 800,
    },
  ],
  keyFindings: [
    {
      id: 'kf-1',
      label: 'Revenue',
      value: '$18.4M',
      change: '↓ 14.2%',
      direction: 'down',
      subtext: 'Last 6 months',
      metricType: 'Enterprise Top-Line',
      evidenceClaimId: 'CLAIM-017',
      detailedData: {
        baseline: '$21.45M (6m prior)',
        current: '$18.40M (current period)',
        variance: '-$3.05M total contraction',
        confidence: 98,
        dataSource: 'Internal ERP Sales Ledger (Table: `fct_daily_revenue_v2`)',
      },
    },
    {
      id: 'kf-2',
      label: 'Product A',
      value: '$7.82M',
      change: '↓ 21.0%',
      direction: 'down',
      subtext: 'Largest contributor to decline',
      metricType: 'Flagship SKU Line',
      evidenceClaimId: 'CLAIM-024',
      detailedData: {
        baseline: '$9.90M',
        current: '$7.82M',
        variance: '-$2.08M (represents 68.2% of total top-line decline)',
        confidence: 94,
        dataSource: 'Product SKU Performance Warehouse (`dim_product_sales`)',
      },
    },
    {
      id: 'kf-3',
      label: 'Region South',
      value: '$4.12M',
      change: '↓ 18.4%',
      direction: 'down',
      subtext: 'Highest regional decline',
      metricType: 'Territory Ledger',
      evidenceClaimId: 'CLAIM-028',
      detailedData: {
        baseline: '$5.05M',
        current: '$4.12M',
        variance: '-$0.93M in territory; Product A velocity dropped 31.4% here',
        confidence: 91,
        dataSource: 'Regional Distribution Telemetry (`fct_territory_sales`)',
      },
    },
    {
      id: 'kf-4',
      label: 'Repeat Customers',
      value: '42.8%',
      change: '↓ 12.7%',
      direction: 'down',
      subtext: 'Potential retention issue',
      metricType: 'Cohort Dynamics',
      evidenceClaimId: 'CLAIM-026',
      detailedData: {
        baseline: '49.0% 90-day repurchase rate',
        current: '42.8% 90-day repurchase rate',
        variance: '-6.2 percentage points (-12.7% relative drop)',
        confidence: 89,
        dataSource: 'Customer 360 CDP (`cohort_retention_curves`)',
      },
    },
  ],
  marketSignals: [
    {
      id: 'mkt-1',
      signal: 'Competitor pricing pressure',
      explanation: 'Competitors in the category have increased promotional activity, offering 15-20% introductory volume rebates in southern industrial hubs.',
      source: 'Market Research / Pricing Benchmarks',
      date: '2026',
      type: 'External Fact',
      impactLevel: 'High',
      confidence: 87,
      isDemoSource: true,
    },
    {
      id: 'mkt-2',
      signal: 'Regional buyer consolidation',
      explanation: 'South region distributor groups merged two centralized procurement committees, extending purchase review cycles from 14 to 38 days.',
      source: 'Supply Chain Trade Intelligence',
      date: '2026',
      type: 'External Fact',
      impactLevel: 'Medium',
      confidence: 82,
      isDemoSource: true,
    },
    {
      id: 'mkt-3',
      signal: 'Macro input cost elasticity',
      explanation: 'Enterprise clients are delaying mid-tier SKU replenishment while grandfathering Tier-B software/hardware bundles.',
      source: 'Sector Purchasing Sentiment Survey',
      date: '2026',
      type: 'External Fact',
      impactLevel: 'Medium',
      confidence: 79,
      isDemoSource: true,
    },
  ],
  strategicOptions: [
    {
      id: 'A',
      title: 'Reduce prices company-wide',
      description: 'Implement an across-the-board 8-10% price reduction across all four product families and all operational territories.',
      isRecommended: false,
      impact: 'High',
      risk: 'High',
      feasibility: 'Medium',
      scores: {
        impact: 8,
        evidenceStrength: 6,
        feasibility: 6,
        risk: 3,
        cost: 3,
        strategicFit: 4,
      },
      pros: [
        'Immediately neutralizes competitor promotional pricing',
        'Simple to communicate to sales teams and distributors',
      ],
      cons: [
        'Destroys gross margins across healthy products (Product B & D)',
        'Trains enterprise accounts to hold out for permanent price erosion',
        'No targeting for where the bleeding is actually occurring',
      ],
      projectedOutcome: 'Estimated gross margin compression of $2.4M with only 4% volume recovery outside South.',
    },
    {
      id: 'B',
      title: 'Increase marketing spend',
      description: 'Inject $750,000 into top-of-funnel acquisition campaigns and enterprise executive roadshows nationwide.',
      isRecommended: false,
      impact: 'Medium-High',
      risk: 'Medium',
      feasibility: 'High',
      scores: {
        impact: 6,
        evidenceStrength: 5,
        feasibility: 8,
        risk: 6,
        cost: 5,
        strategicFit: 6,
      },
      pros: [
        'Boosts general brand awareness and outbound pipeline count',
        'Leaves current pricing and margin structures intact',
      ],
      cons: [
        'Does not address repeat customer churn or competitor pricing gap',
        'Long payback lag (4-7 months) while sales are actively sliding',
      ],
      projectedOutcome: 'Generates new inbound leads but fails to reverse Product A retention leakage.',
    },
    {
      id: 'C',
      title: 'Target Product A in Region South',
      description: 'Run a controlled, time-bound intervention combining targeted Product A bundling with localized sales incentives in Region South.',
      isRecommended: true,
      impact: 'High',
      risk: 'Medium-Low',
      feasibility: 'High',
      scores: {
        impact: 9,
        evidenceStrength: 9,
        feasibility: 9,
        risk: 8,
        cost: 8,
        strategicFit: 9,
      },
      pros: [
        'Directly attacks the source of 68% of total enterprise contraction',
        'Preserves full price integrity across all other regions and product lines',
        'Fast implementation with measurable weekly check-ins',
        'High evidence grounding from customer churn interviews in South territory',
      ],
      cons: [
        'Requires field sales team alignment and local distributor cooperation',
        'Requires continuous monitoring to prevent cross-border grey market arbitrage',
      ],
      projectedOutcome: 'Projected to recover $1.3M - $1.8M in annualized run-rate within 90 days with <$220k intervention cost.',
    },
  ],
  evidenceClaims: [
    {
      id: 'CLAIM-017',
      title: 'Revenue declined 14.2%',
      type: 'FACT',
      evidence: 'Audited ERP ledger confirms total consolidated revenue fell from $21.45M in prior 6-month half to $18.40M in current half.',
      confidence: 98,
      source: 'Internal ERP Sales Ledger (Table: fct_daily_revenue_v2)',
      verified: true,
      dependencies: [],
    },
    {
      id: 'CLAIM-024',
      title: 'Product A is the primary contributor',
      type: 'FACT',
      evidence: 'Product A contracted $2.08M (-21.0%), accounting for 68.2% of the net $3.05M drop across the portfolio.',
      confidence: 94,
      source: 'Product SKU Performance Warehouse (dim_product_sales)',
      verified: true,
      dependencies: ['CLAIM-017'],
    },
    {
      id: 'CLAIM-028',
      title: 'Region South shows highest decline',
      type: 'FACT',
      evidence: 'Region South sales contracted 18.4% (-$0.93M). Product A sales in South fell 31.4% vs only 8.2% in other regions combined.',
      confidence: 91,
      source: 'Regional Distribution Telemetry (fct_territory_sales)',
      verified: true,
      dependencies: ['CLAIM-017', 'CLAIM-024'],
    },
    {
      id: 'CLAIM-026',
      title: 'Repeat customer retention deteriorated',
      type: 'FACT',
      evidence: '90-day repurchase rates dropped from 49.0% to 42.8% (-12.7% relative decline). Accounts cited competitor promotion.',
      confidence: 89,
      source: 'Customer 360 CDP (cohort_retention_curves)',
      verified: true,
      dependencies: ['CLAIM-017'],
    },
    {
      id: 'CLAIM-030',
      title: 'Competitive pricing pressure increased',
      type: 'EXTERNAL FACT',
      evidence: 'Competitor NexaCorp launched a 15-20% promotional discount in southern territories targeting Product A enterprise tier.',
      confidence: 82,
      source: 'Demo Market Research / Pricing Benchmarks 2026',
      verified: true,
      notes: 'Sampled from distributor survey and public tender bids.',
      dependencies: [],
    },
    {
      id: 'CLAIM-027',
      title: 'Product A decline concentrated in South drives portfolio drop',
      type: 'INFERENCE',
      evidence: 'Statistical variance decomposition links 54% of Product A decline specifically to Region South customer switches.',
      confidence: 86,
      source: 'CorporateBaddie Causal Inference Engine',
      verified: true,
      dependencies: ['CLAIM-024', 'CLAIM-028', 'CLAIM-026'],
    },
    {
      id: 'CLAIM-031',
      title: 'Target Product A in Region South with controlled intervention',
      type: 'RECOMMENDATION',
      evidence: 'Decision matrix evaluation indicates Option C achieves highest risk-adjusted ROI (9.1/10) with minimal margin contagion.',
      confidence: 88,
      source: 'CorporateBaddie Prescriptive Evaluator',
      verified: true,
      dependencies: ['CLAIM-017', 'CLAIM-024', 'CLAIM-028', 'CLAIM-030', 'CLAIM-027'],
    },
    {
      id: 'CLAIM-032',
      title: 'Post-intervention annualized recovery forecast',
      type: 'FORECAST',
      evidence: 'Targeted intervention will recover $1.3M to $1.8M within 90 days assuming competitor pricing remains stable.',
      confidence: 76,
      source: 'Monte Carlo Decision Simulator (1,000 runs)',
      verified: false,
      notes: 'Contains forecast uncertainty; sensitive to competitor counter-reaction.',
      dependencies: ['CLAIM-031'],
    },
  ],
  rootCauseChain: [
    {
      step: 1,
      title: 'Sales decline',
      description: 'Revenue decreased 14.2% over the selected 6-month period across company operations.',
      type: 'FACT',
      evidenceRef: 'CLAIM-017: Internal ERP ledger audit confirms -$3.05M total contraction.',
    },
    {
      step: 2,
      title: 'Product A decline',
      description: 'Product A contributed the largest share of the decline (68.2% of net loss, -21.0% volume).',
      type: 'FACT',
      evidenceRef: 'CLAIM-024: SKU performance ledger reflects -$2.08M contraction.',
    },
    {
      step: 3,
      title: 'Region South concentration',
      description: 'The concentration of the decline suggests Product A in Region South is the primary failure node.',
      type: 'INFERENCE',
      evidenceRef: 'CLAIM-027: Product A velocity collapsed 31.4% in South, compared to -8.2% in other zones.',
    },
    {
      step: 4,
      title: 'Repeat customer decline',
      description: 'Existing customer cohort repurchase rates plummeted 12.7%, reflecting account churn rather than top-of-funnel drop.',
      type: 'FACT',
      evidenceRef: 'CLAIM-026: 90-day repurchase dropped from 49.0% to 42.8%.',
    },
    {
      step: 5,
      title: 'Possible competitive/pricing pressure',
      description: 'Competitive pricing pressure has increased in the relevant market, offering lower barriers to entry.',
      type: 'EXTERNAL FACT',
      evidenceRef: 'CLAIM-030: External demo research indicates 15-20% competitor promotional incentives.',
    },
  ],
  conditionShifts: [
    'Product A recovered without intervention (e.g. if backlogged orders clear naturally in next 30 days).',
    'Region South decline was caused by a temporary event (e.g. extreme local logistics disruption or warehouse relocation).',
    'Competitor pricing returned to normal (e.g. if rival promotional campaign was a short-lived fiscal year-end blitz).',
    'Margin impact from intervention became unacceptable (e.g. if distributor co-funding exceeds 25% gross margin threshold).',
  ],
  risksAndLimitations: [
    'Demo Dataset: Analysis executed on synthetic enterprise transaction datasets for prototype validation.',
    'External Evidence May Change: Competitor promotional tracking is grounded in demo market sources.',
    'Correlation Does Not Prove Causation: The statistical association between competitor discounts and South churn requires controlled A/B verification.',
    'Forecast Confidence Depends on Historical Data: 90-day recovery projection carries a ±18% standard error band.',
    'Human Review Required: CorporateBaddie provides prescriptive intelligence; management retains sole fiduciary authority.',
  ],
};

// ============================================================================
// EXAMPLE QUESTIONS (No default question)
// ============================================================================

export const EXAMPLE_QUESTIONS = [
  {
    id: 'ex-1',
    title: 'Product margin analysis',
    prompt: 'Which products are driving our margin changes?',
    description: 'Understand which products are contributing most to margin expansion or contraction'
  },
  {
    id: 'ex-2',
    title: 'Customer churn investigation',
    prompt: 'Where are customers dropping off?',
    description: 'Identify where in the customer journey retention is failing'
  },
  {
    id: 'ex-3',
    title: 'Regional performance',
    prompt: 'Which regions need attention?',
    description: 'Compare performance across all territories and identify underperforming areas'
  },
  {
    id: 'ex-4',
    title: 'Marketing effectiveness',
    prompt: 'What should we investigate before increasing marketing spend?',
    description: 'Evaluate current marketing efficiency and identify gaps before scaling'
  },
  {
    id: 'ex-5',
    title: 'Product lifecycle',
    prompt: 'Are our top products aging?',
    description: 'Analyze product performance trends over time to assess lifecycle stage'
  },
  {
    id: 'ex-6',
    title: 'Pricing strategy',
    prompt: 'Should we adjust pricing to compete?',
    description: 'Evaluate pricing elasticity and competitive positioning'
  }
];

// ============================================================================
// DEFAULT BUSINESS CONTEXT (No company, just a template)
// ============================================================================

export const DEFAULT_BUSINESS_CONTEXT: BusinessContext = {
  companyName: '', // User must provide this
  industry: '',
  primaryMarket: '',
  businessObjective: '',
  currentStrategy: '',
  knownConstraints: '',
  importantKpis: [],
  managementPriorities: '',
};

// ============================================================================
// DECISION ROOM OPTIONS
// ============================================================================

export const DECISION_ROOM_OPTIONS: DecisionRoomOption[] = [
  {
    id: 'opt-1',
    name: 'Targeted Pricing & Regional Intervention',
    isRecommended: true,
    expectedImpact: '+₹18.4L / month revenue recovery (+8.2%)',
    evidenceStrength: 'Strong',
    cost: '₹2.8L / month (Targeted promo & co-op marketing)',
    risk: 'Low',
    feasibility: 'High',
    timeToImpact: '30 - 45 days',
    strategicFit: 'High',
    confidence: 84,
    whyThisOption: {
      supportingEvidence: [
        'Isolates Product A in Region South, where 68.2% of total business decline originated [CLM-024, CLM-027].',
        'Directly counters Competitor A localized 15-20% promotional discounts without devaluing other regions [CLM-030].',
        'Preserves company gross margin floor (minimum 38%) and respects limited marketing budget constraints.',
      ],
      potentialUpside: 'Restores South repurchase rates from 42.8% back toward 48% within 60 days, recovering ~₹55L quarterly ARR.',
      risks: [
        'Cross-regional gray market arbitrage if regional discount exceeds 15%.',
        'Distributor margin pushback if co-op marketing incentives are delayed.',
      ],
      dependencies: [
        'Regional distributor sign-off on co-funded incentive structure in Region South.',
        'Marketing team ready with localized South messaging highlighting premium feature superiority.',
      ],
      whatMustBeTrue: [
        'Customer demand elasticity in Region South responds to value bundle vs raw price cut.',
        'Competitor A does not escalate price war into North and West regions.',
        'Product A inventory in Southern distribution hubs can handle +12% volume lift.',
      ],
    },
  },
  {
    id: 'opt-2',
    name: 'Company-wide Price Reduction',
    isRecommended: false,
    expectedImpact: '+₹5.2L / month revenue recovery (+2.4%)',
    evidenceStrength: 'Moderate',
    cost: '₹0 / month (Pure price reduction)',
    risk: 'High',
    feasibility: 'High',
    timeToImpact: '0 - 7 days',
    strategicFit: 'Low',
    confidence: 62,
    whyThisOption: {
      supportingEvidence: [
        'Simple to implement across all products and regions',
        'Immediate effect on price-sensitive customers',
      ],
      potentialUpside: 'Quick revenue recovery if customers respond strongly to lower prices',
      risks: [
        'Across-the-board margin destruction affecting profitable products',
        'Trains customers to expect lower prices permanently',
        'Competitors may not match, causing unfair competitive disadvantage',
      ],
      dependencies: [
        'Legal review of pricing strategy',
        'Sales team alignment on new pricing tiers',
      ],
      whatMustBeTrue: [
        'Price elasticity is high enough to offset margin loss',
        'Competitors will not react with deeper discounts',
        'Current customer base remains price-sensitive',
      ],
    },
  },
  {
    id: 'opt-3',
    name: 'Marketing Blitz Campaign',
    isRecommended: false,
    expectedImpact: '+₹8.6L / month revenue recovery (+4.0%)',
    evidenceStrength: 'Weak',
    cost: '₹8.5L / month (Aggressive acquisition spend)',
    risk: 'Medium',
    feasibility: 'Medium',
    timeToImpact: '60 - 90 days',
    strategicFit: 'Medium',
    confidence: 58,
    whyThisOption: {
      supportingEvidence: [
        'Brand awareness is below category leaders',
        'Top-of-funnel metrics show opportunity for growth',
      ],
      potentialUpside: 'New customer acquisition that could offset churn',
      risks: [
        'Long lead time before ROI is realized',
        'Acquisition costs may exceed customer lifetime value',
        'Does not address root cause of Product A decline',
      ],
      dependencies: [
        'Creative assets ready for multi-channel rollout',
        'Media buying capacity scaled up',
      ],
      whatMustBeTrue: [
        'CAC payback period is under 6 months',
        'New customer quality matches existing high-value segments',
        'Marketing channels can deliver scale quickly',
      ],
    },
  },
];

// ============================================================================
// RISK RADAR ITEMS
// ============================================================================

export const RISK_RADAR_ITEMS: RiskRadarItem[] = [
  {
    category: 'Margin Preservation',
    level: 'MEDIUM',
    evidence: 'Across-the-board price reduction would compress gross margins by 300-400 bps',
    mitigation: 'Use targeted interventions that preserve overall margin structure'
  },
  {
    category: 'Competitive Response',
    level: 'HIGH',
    evidence: 'Competitor has demonstrated willingness to engage in price wars',
    mitigation: 'Build competitive moats through service and product differentiation'
  },
  {
    category: 'Customer Churn',
    level: 'HIGH',
    evidence: '90-day repeat rate dropped 12.7% in affected regions',
    mitigation: 'Implement retention programs before churn becomes permanent'
  },
  {
    category: 'Execution Risk',
    level: 'LOW-MEDIUM',
    evidence: 'Distributor alignment required for regional intervention',
    mitigation: 'Co-funding structure to align incentives with execution partners'
  },
  {
    category: 'Forecast Uncertainty',
    level: 'MEDIUM',
    evidence: 'Projection confidence band spans -2% to +8% recovery range',
    mitigation: 'Pilot program with measurable weekly checkpoints'
  },
  {
    category: 'Data Limitations',
    level: 'LOW',
    evidence: 'Customer 360 CDP has 5% missing data for repeat rate calculation',
    mitigation: 'Data quality monitoring and imputation where appropriate'
  }
];

// ============================================================================
// MOCK DATA (for backward compatibility with existing components)
// ============================================================================

export const MOCK_CHART_SERIES: ChartDataPoint[] = [
  { period: 'Month 1', revenue: 3.65, baseline: 3.60, productA: 1.72, productOthers: 1.93, repeatCustomers: 51.2, newCustomers: 14.8 },
  { period: 'Month 2', revenue: 3.52, baseline: 3.62, productA: 1.64, productOthers: 1.88, repeatCustomers: 49.8, newCustomers: 14.5 },
  { period: 'Month 3', revenue: 3.28, baseline: 3.65, productA: 1.48, productOthers: 1.80, repeatCustomers: 47.4, newCustomers: 14.1 },
  { period: 'Month 4', revenue: 3.05, baseline: 3.68, productA: 1.30, productOthers: 1.75, repeatCustomers: 45.1, newCustomers: 13.9 },
  { period: 'Month 5', revenue: 2.98, baseline: 3.70, productA: 1.22, productOthers: 1.76, repeatCustomers: 43.6, newCustomers: 13.8 },
  { period: 'Month 6', revenue: 2.82, baseline: 3.72, productA: 1.12, productOthers: 1.70, repeatCustomers: 42.8, newCustomers: 13.5 },
];

export const MOCK_PRODUCTS: ProductBreakdown[] = [
  { name: 'Product A', revenue: 7.82, share: 42.5, growth: -21.0, flag: 'Primary Drag (-68% net loss)' },
  { name: 'Product B', revenue: 5.10, share: 27.7, growth: +2.1, flag: 'Resilient / Stable' },
  { name: 'Product C', revenue: 3.42, share: 18.6, growth: -3.4, flag: 'Within normal tolerance' },
  { name: 'Product D', revenue: 2.06, share: 11.2, growth: +0.8, flag: 'Slight positive' },
];

export const MOCK_REGIONS: RegionBreakdown[] = [
  { name: 'Region South', revenue: 4.12, share: 22.4, growth: -18.4, flag: 'Severe Underperformance' },
  { name: 'Region North', revenue: 6.20, share: 33.7, growth: -3.1, flag: 'Minor contraction' },
  { name: 'Region West', revenue: 4.88, share: 26.5, growth: +1.2, flag: 'Positive trajectory' },
  { name: 'Region East', revenue: 3.20, share: 17.4, growth: -2.0, flag: 'Stable' },
];

// ============================================================================
// DATA RELATIONSHIPS (Legacy format for backward compatibility)
// ============================================================================

export const DATA_RELATIONSHIPS: DataRelationship[] = [
  {
    key: 'Customer ID',
    description: 'Joins Sales Data transactions with Customer cohort profiles and retention history',
    sources: ['Sales Data (CSV)', 'Customer Data (Excel)'],
  },
  {
    key: 'Order ID',
    description: 'Links marketing campaign attribution tags directly to checkout basket ledgers',
    sources: ['Sales Data (CSV)', 'Marketing Data (CSV)'],
  },
  {
    key: 'Product ID',
    description: 'Maps SKU item numbers to unit margins, category velocity, and returns',
    sources: ['Sales Data (CSV)', 'Warehouse & ERP Database'],
  },
  {
    key: 'Date',
    description: 'Harmonizes time series across weekly sales, monthly churn, and competitor promo blitzes',
    sources: ['Sales Data (CSV)', 'Customer Data (Excel)', 'Marketing Data (CSV)'],
  },
];

// ============================================================================
// DECOMPOSED QUESTIONS (Legacy format)
// ============================================================================

export const DECOMPOSED_QUESTIONS: DecomposedQuestion[] = [
  {
    id: 1,
    question: 'How large is the decline?',
    status: 'Answered',
    evidenceFound: '-14.2% top-line contraction totaling -$3.05M delta against rolling 12-month baseline.',
    confidence: 'High',
    claimRef: 'CLM-017',
  },
  {
    id: 2,
    question: 'When did the decline begin?',
    status: 'Answered',
    evidenceFound: 'Began in Month 3, accelerating steeply in Months 4-6 following competitor campaigns.',
    confidence: 'High',
    claimRef: 'CLM-017',
  },
  {
    id: 3,
    question: 'Which products are responsible?',
    status: 'Answered',
    evidenceFound: 'Product A accounts for 68.2% of net top-line delta (-21.0% volume contraction).',
    confidence: 'High',
    claimRef: 'CLM-024',
  },
  {
    id: 4,
    question: 'Which regions are affected?',
    status: 'Answered',
    evidenceFound: 'Region South is the geographic epicenter, down -18.4% compared to +1.2% in West.',
    confidence: 'High',
    claimRef: 'CLM-027',
  },
  {
    id: 5,
    question: 'Has customer behavior changed?',
    status: 'Answered',
    evidenceFound: 'Existing customer cohort repeat purchase rate dropped from 49.0% to 42.8% (-12.7%).',
    confidence: 'High',
    claimRef: 'CLM-026',
  },
  {
    id: 6,
    question: 'Has profitability changed?',
    status: 'Answered',
    evidenceFound: 'Gross margin contracted 180 bps as high-margin Product A mix share shrunk by 6.4%.',
    confidence: 'High',
    claimRef: 'CLM-028',
  },
  {
    id: 7,
    question: 'Are there external market signals?',
    status: 'Answered',
    evidenceFound: 'Competitor A launched aggressive 15-20% promotional discounts in South corridors.',
    confidence: 'Medium-High',
    claimRef: 'CLM-030',
  },
  {
    id: 8,
    question: 'What strategic options are available?',
    status: 'Answered',
    evidenceFound: 'Option A (Company-wide price cuts), Option B (Marketing expansion), Option C (Targeted South intervention).',
    confidence: 'High',
    claimRef: 'CLM-031',
  },
  {
    id: 9,
    question: 'Which option has the strongest evidence?',
    status: 'Answered',
    evidenceFound: 'Option C exhibits highest risk-adjusted utility (84/100) protecting premium positioning and budget constraints.',
    confidence: 'High',
    claimRef: 'CLM-031',
  },
];

// ============================================================================
// DYNAMIC PLAN TASKS (Legacy format)
// ============================================================================

export const DYNAMIC_PLAN_TASKS: DynamicInvestigationTask[] = [
  {
    id: 'task-1',
    title: 'Analyze revenue trend',
    isInitial: true,
    status: 'completed',
    evidenceOutcome: 'Identified -14.2% top-line contraction over trailing 6 months',
  },
  {
    id: 'task-2',
    title: 'Analyze product performance',
    isInitial: true,
    status: 'completed',
    evidenceOutcome: 'Isolated Product A as 68.2% contributor to total company variance',
  },
  {
    id: 'task-3',
    title: 'Analyze regional performance',
    isInitial: true,
    status: 'completed',
    evidenceOutcome: 'Region South detected as 54% of regional performance variance',
  },
  {
    id: 'task-4',
    title: 'Analyze customer behavior',
    isInitial: true,
    status: 'completed',
    evidenceOutcome: 'Discovered repeat buyer cohort retention degradation (-12.7%)',
  },
  {
    id: 'task-5',
    title: 'Investigate Product A margin',
    isInitial: false,
    status: 'discovered',
    discoveredReason: 'Triggered by Product A revenue contribution divergence exceeding threshold (>50%)',
    evidenceOutcome: 'Gross margin fell from 44.2% to 41.8% due to un-targeted channel discounting',
  },
  {
    id: 'task-6',
    title: 'Compare Product A pricing',
    isInitial: false,
    status: 'discovered',
    discoveredReason: 'Triggered by external competitor promotion vector detected in target category',
    evidenceOutcome: 'Product A priced 18% above Competitor A promo bundle in target territory',
  },
  {
    id: 'task-7',
    title: 'Investigate Region South customer retention',
    isInitial: false,
    status: 'discovered',
    discoveredReason: 'Triggered by regional variance concentration in Region South cohort ledgers',
    evidenceOutcome: 'South repeat buyers defecting to competitor bundle at 2.4x higher rate',
  },
];
// ============================================================================
// DEFAULTS FOR BACKWARD COMPATIBILITY (Legacy investigation engine)
// ============================================================================

export const DEFAULT_DATA_SOURCES: LegacyDataSource[] = DEMO_DATA_SOURCES.map(mapWSDataSourceToLegacy);

export const DEFAULT_DISCOVERED_ANOMALIES: DiscoveredAnomaly[] = [
  {
    metric: 'Revenue',
    deviation: '-14.2% over 6 months',
    dimension: 'Product A in Region South',
    severity: 'HIGH',
    evidenceRef: 'CLAIM-017: Internal ERP ledger audit confirms -$3.05M total contraction',
  },
];

export const DEFAULT_COUNTERFACTUAL: CounterfactualAnalysis = {
  robustnessRating: 'SENSITIVE',
  whyPreferred: 'Targeted intervention in Region South with Product A bundle shows highest risk-adjusted ROI with minimal margin impact',
  evidenceAdvantageOverAlternatives: 'Strong evidence from regional sales data and customer churn interviews in South territory',
  dependentAssumptions: [
    'Competitor A does not escalate price war into South region',
    'Distributor co-funding agreement is finalized within 14 days',
    'Current product inventory in South distribution hubs can handle +12% volume lift',
  ],
  reversalTriggers: [
    'Product A recovered without intervention (e.g. if backlogged orders clear naturally in next 30 days)',
    'Region South decline was caused by a temporary event (e.g. extreme local logistics disruption)',
    'Competitor pricing returned to normal (e.g. if rival promotional campaign was short-lived fiscal year-end blitz)',
  ],
  inactionDownside: 'Continued decline至 -$4.2M annualized revenue loss with 65% probability',
  smallestSafeExperiment: 'Run 30-day controlled test with 15% budget allocation to validate South region intervention effectiveness',
};

export const DEFAULT_SCENARIOS: MultiScenarioItem[] = [
  {
    id: 'scenario-1',
    name: 'Base Case',
    label: 'MODELLED ESTIMATE',
    isBaseline: true,
    modeledOutputs: {
      revenueDelta: 0,
      grossMarginDelta: 0,
    },
    riskLevel: 'Medium',
    feasibility: 'High',
    timeToPayoffMonths: 60,
    supportingEvidenceRefs: [],
    assumptions: ['Competitor pricing stabilizes, no major economic shocks'],
    downsides: ['No growth if market shifts unexpectedly'],
  },
  {
    id: 'scenario-2',
    name: 'Optimistic Case',
    label: 'MODELLED ESTIMATE',
    isRecommended: true,
    modeledOutputs: {
      revenueDelta: 1400000,
      grossMarginDelta: 170000,
    },
    riskLevel: 'Low',
    feasibility: 'Medium',
    timeToPayoffMonths: 90,
    supportingEvidenceRefs: ['CLM-031', 'CLM-032'],
    assumptions: ['Intervention successful, competitor retreats'],
    downsides: ['Competitor may match discount, reducing net benefit'],
  },
  {
    id: 'scenario-3',
    name: 'Pessimistic Case',
    label: 'STRESS TEST',
    modeledOutputs: {
      revenueDelta: -1300000,
      grossMarginDelta: -320000,
    },
    riskLevel: 'High',
    feasibility: 'Medium',
    timeToPayoffMonths: 120,
    supportingEvidenceRefs: ['CLM-032'],
    assumptions: ['Price war escalates, customer churn accelerates'],
    downsides: ['Margin compression may trigger further customer attrition'],
  },
];

export const DEFAULT_EVIDENCE_GRAPH: ExecutionGraphNode[] = [
  {
    id: 'node-1',
    label: 'Investigation Started',
    dimension: 'orchestration',
    status: 'COMPLETED',
    summary: 'Initial inquiry received and investigation pipeline initiated',
    prerequisiteIds: [],
    evidenceFound: 'Investigation pipeline started with runId CB-DEMO-001',
  },
  {
    id: 'node-2',
    label: 'Business Question Analysis',
    dimension: 'orchestration',
    status: 'COMPLETED',
    summary: 'Question classified as Diagnostic + Prescriptive type',
    prerequisiteIds: ['node-1'],
    evidenceFound: 'Question parsed into diagnostic root cause and prescriptive decision scope',
  },
  {
    id: 'node-3',
    label: 'Data Profiling',
    dimension: 'data_profiling',
    status: 'COMPLETED',
    summary: 'Data quality verified across 284,520 rows',
    prerequisiteIds: ['node-2'],
    evidenceFound: '91% data completeness confirmed across 3 data sources',
  },
  {
    id: 'node-4',
    label: 'Root Cause Analysis',
    dimension: 'diagnostics',
    status: 'COMPLETED',
    summary: 'Product A and Region South isolated as primary failure nodes',
    prerequisiteIds: ['node-3'],
    evidenceFound: 'Product A (-21.0%) and Region South (-18.4%) account for majority of decline',
  },
  {
    id: 'node-5',
    label: 'Evidence Verification',
    dimension: 'evidence',
    status: 'COMPLETED',
    summary: '10/12 claims verified, 2 bounds flagged',
    prerequisiteIds: ['node-4'],
    evidenceFound: 'Evidence audit complete with 88% verification rate',
  },
  {
    id: 'node-6',
    label: 'Recommendation Generated',
    dimension: 'recommendation',
    status: 'COMPLETED',
    summary: 'Option C (Targeted South intervention) selected as optimal',
    prerequisiteIds: ['node-5'],
    evidenceFound: 'Decision matrix evaluation: Option C achieves highest risk-adjusted ROI (9.1/10)',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapWSDataSourceToLegacy(source: WSDataSource): LegacyDataSource {
  const legacyId = source.id.startsWith('demo-') ? source.id.replace('demo-', '') : source.id;
  return {
    id: legacyId,
    name: source.name,
    type: source.type,
    status: source.status,
    recordsCount: source.rows || 0,
    fieldsCount: source.columns || 0,
    selected: source.selected,
    description: source.description || '',
  };
}
// ============================================================================
// ADDITIONAL MOCK DATA FOR BACKWARD COMPATIBILITY
// ============================================================================

export const GROUNDED_QA_PAIRS = [
  {
    question: 'What products are driving our margin changes?',
    answer: 'Product A shows -21.0% decline accounting for 68.2% of total company variance',
    source: 'Product SKU Performance Warehouse (dim_product_sales)',
    confidence: 94,
  },
  {
    question: 'Where are customers dropping off?',
    answer: 'Region South shows 18.4% decline with 42.8% repeat purchase rate (-12.7% drop)',
    source: 'Regional Distribution Telemetry (fct_territory_sales)',
    confidence: 91,
  },
  {
    question: 'Which regions need attention?',
    answer: 'Region South is the geographic epicenter, down -18.4% compared to +1.2% in West',
    source: 'Regional Distribution Telemetry (fct_territory_sales)',
    confidence: 91,
  },
  {
    question: 'What should we investigate before increasing marketing spend?',
    answer: 'Evaluate current marketing efficiency: existing channels show 4.2x ROI, acquisition costs at 38% margin threshold',
    source: 'Marketing Campaign Analytics (fct_marketing_attribution)',
    confidence: 88,
  },
];

export const OPPORTUNITY_RADAR_ITEMS: OpportunityItem[] = [
  {
    id: 'OPP-001',
    category: 'Upsell to Existing Customers',
    title: 'Upsell to Existing Customers',
    description: '42.8% repeat rate indicates strong retention potential',
    potentialImpact: '$2.4M revenue opportunity',
    evidenceStrength: 'High',
    confidence: 85,
    recommendedNextStep: 'Launch targeted upsell campaign to high-value repeat customers',
    filterTags: ['upsell', 'retention', 'high-confidence'],
  },
  {
    id: 'OPP-002',
    category: 'Expand to New Regions',
    title: 'Expand to New Regions',
    description: 'West region shows +1.2% growth, model extrapolates 60% capture potential',
    potentialImpact: '$3.8M revenue opportunity',
    evidenceStrength: 'Medium',
    confidence: 70,
    recommendedNextStep: 'Conduct market analysis and pilot program in West region',
    filterTags: ['expansion', 'regional', 'growth'],
  },
  {
    id: 'OPP-003',
    category: 'Product Bundle Optimization',
    title: 'Product Bundle Optimization',
    description: 'Product A-D bundle shows 23% higher retention than individual SKUs',
    potentialImpact: '$1.6M revenue opportunity',
    evidenceStrength: 'High',
    confidence: 90,
    recommendedNextStep: 'Implement optimized bundle pricing and promotion',
    filterTags: ['product', 'bundle', 'optimization', 'high-confidence'],
  },
  {
    id: 'OPP-004',
    category: 'Pricing Tier Adjustment',
    title: 'Pricing Tier Adjustment',
    description: 'Tier-2 segment shows 18% price elasticity, targeted adjustment recommended',
    potentialImpact: '$2.1M revenue opportunity',
    evidenceStrength: 'Medium',
    confidence: 75,
    recommendedNextStep: 'Test price adjustments in controlled segment',
    filterTags: ['pricing', 'optimization', 'tier-2'],
  },
];

export const COMPETITOR_LANDSCAPE = [
  {
    competitor: 'Competitor A',
    marketShare: 28.4,
    pricingPressure: 'High',
    productStrength: 'Premium features',
    threatLevel: 'Critical',
    evidence: '15-20% promotional discounts in South corridors',
    recentMoves: 'Launched competitive bundle targeting Product A enterprise tier',
  },
  {
    competitor: 'Competitor B',
    marketShare: 19.2,
    pricingPressure: 'Medium',
    productStrength: 'Value segment',
    threatLevel: 'Medium',
    evidence: 'Aggressive channel partner incentives',
    recentMoves: 'Extended distributor margin from 12% to 18%',
  },
  {
    competitor: 'Competitor C',
    marketShare: 12.7,
    pricingPressure: 'Low',
    productStrength: 'Niche enterprise',
    threatLevel: 'Low',
    evidence: 'Stable pricing, focus on service differentiation',
    recentMoves: 'Acquired analytics startup to enhance reporting capabilities',
  },
];

export const TREND_RADAR_ITEMS = [
  {
    category: 'Revenue Trend',
    direction: 'down',
    magnitude: '-14.2%',
    timeframe: 'Last 6 months',
    confidence: 91,
    explanation: 'Consistent contraction across trailing periods',
  },
  {
    category: 'Customer Retention',
    direction: 'down',
    magnitude: '-12.7% relative drop',
    timeframe: 'Last 90 days',
    confidence: 89,
    explanation: 'Repeat buyer cohort showing accelerated churn',
  },
  {
    category: 'Product Mix Shift',
    direction: 'down',
    magnitude: '-6.4% high-margin SKU share',
    timeframe: 'Last 180 days',
    confidence: 85,
    explanation: 'Product A decline driving margin compression',
  },
  {
    category: 'Marketing Efficiency',
    direction: 'flat',
    magnitude: '4.2x ROI (stable)',
    timeframe: 'Last 60 days',
    confidence: 82,
    explanation: 'Acquisition costs stable but volume lagging',
  },
];

export const EMERGING_SIGNALS = [
  {
    id: 'SIG-001',
    title: 'Competitor Price War Initiated',
    category: 'Market',
    severity: 'High',
    timestamp: '2026-09-05T00:00:00Z',
    description: 'Competitor A launched 15-20% promotional discounts in southern industrial hubs targeting Product A enterprise tier',
    source: 'Market Intelligence / Pricing Benchmarks',
    confidence: 87,
    potentialImpact: '-$1.8M annualized revenue at risk if unaddressed',
    recommendedActions: [
      'Implement targeted counter-bundle in Region South',
      'Monitor competitor response to intervention',
      'Prepare contingency pricing tiers',
    ],
  },
  {
    id: 'SIG-002',
    title: 'Regional Buyer Consolidation',
    category: 'Operational',
    severity: 'Medium',
    timestamp: '2026-09-08T00:00:00Z',
    description: 'South region distributor groups merged two centralized procurement committees, extending purchase review cycles from 14 to 38 days',
    source: 'Supply Chain Trade Intelligence',
    confidence: 82,
    potentialImpact: '-$0.9M quarterly revenue due to extended sales cycles',
    recommendedActions: [
      'Engage distributor executives directly',
      'Implement JIT inventory sharing',
      'Prepare temporary sales force incentives',
    ],
  },
  {
    id: 'SIG-003',
    title: 'Macro Input Cost Elasticity',
    category: 'Economic',
    severity: 'Medium',
    timestamp: '2026-09-10T00:00:00Z',
    description: 'Enterprise clients delaying mid-tier SKU replenishment while grandfathering Tier-B software/hardware bundles',
    source: 'Sector Purchasing Sentiment Survey',
    confidence: 79,
    potentialImpact: 'Shift in demand from Product A/B to legacy Tier-B bundles',
    recommendedActions: [
      'Accelerate Product A bundling to retain enterprise clients',
      'Prepare legacy Tier-B inventory clearance campaign',
      'Monitor procurement budget cycles',
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY WITH types.ts
// ============================================================================

export type LegacyDataSource = {
  id: string;
  name: string;
  type: string;
  status: string;
  recordsCount: number;
  fieldsCount: number;
  selected: boolean;
  description: string;
};

export type DiscoveredAnomaly = {
  metric: string;
  deviation: string;
  dimension: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceRef: string;
};

export type CounterfactualAnalysis = {
  robustnessRating: 'ROBUST' | 'SENSITIVE' | 'FRAGILE';
  whyPreferred: string;
  evidenceAdvantageOverAlternatives: string;
  dependentAssumptions: string[];
  reversalTriggers: string[];
  inactionDownside: string;
  smallestSafeExperiment: string;
};

export type MultiScenarioItem = {
  id: string;
  name: string;
  label: 'MODELLED ESTIMATE' | 'STRESS TEST' | string;
  isRecommended?: boolean;
  isBaseline?: boolean;
  modeledOutputs: {
    revenueDelta: number;
    grossMarginDelta: number;
  };
  riskLevel: 'Low' | 'Medium' | 'High' | string;
  feasibility: 'Low' | 'Medium' | 'High' | string;
  timeToPayoffMonths: number;
  supportingEvidenceRefs: string[];
  assumptions: string[];
  downsides: string[];
};

export type ExecutionGraphNode = {
  id: string;
  label: string;
  dimension: string;
  status: 'COMPLETED' | 'RUNNING' | 'PLANNED' | 'SKIPPED' | 'BLOCKED' | 'REQUIRES MORE DATA';
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
  executorId?: string;
  executorName?: string;
  executorCategory?: 'REASONING_AGENT' | 'ANALYTICAL_SERVICE';
};
