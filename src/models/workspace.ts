// ============================================================================
// WORKSPACE & DATA MODEL TYPES
// CorporateBaddie User-Owned Business Intelligence Platform
// ============================================================================

// ============================================================================ 
// WORKSPACE & USER ENTITY
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  country: string;
  region: string;
  currency: string;
  businessObjective: string;
  currentStrategy: string;
  knownConstraints: string;
  importantKpis: string[];
  managementPriorities: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export type WorkspaceRole = 'owner' | 'admin' | 'analyst' | 'viewer';

export interface WorkspaceUser {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  permissions: string[];
}

// ============================================================================
// DATA SOURCE & DATASET ENTITY
// ============================================================================

export type DataSourceType = 
  | 'CSV' 
  | 'Excel' 
  | 'PostgreSQL' 
  | 'MySQL' 
  | 'SQLite'
  | 'API'
  | 'CRM'
  | 'ERP'
  | 'Webhook'
  | 'DataWarehouse'
  | 'CloudStorage';

export type DataSourceStatus = 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending';

export interface DataSource {
  id: string;
  workspaceId: string;
  type: DataSourceType;
  name: string;
  description: string;
  status: DataSourceStatus;
  
  // For file sources
  filePath?: string;
  fileName?: string;
  fileHash?: string;
  rows?: number;
  columns?: number;
  
  // For database sources
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  table?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSynced?: string;
  nextSync?: string;
  
  // Selection state
  selected: boolean;
  
  // Configuration (never expose credentials in API responses)
  config?: DataSourceConfig;
}

export interface DataSourceConfig {
  // File-specific
  hasHeader?: boolean;
  delimiter?: string;
  encoding?: string;
  
  // Database-specific
  ssl?: boolean;
  connectionPoolSize?: number;
  
  // API-specific
  authType?: 'none' | 'api_key' | 'bearer' | 'oauth';
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  
  // Sync settings
  syncFrequency?: 'manual' | 'hourly' | 'daily' | 'weekly';
}

// ============================================================================
// DATASET & SCHEMA ENTITY
// ============================================================================

export type DatasetStatus = 'uploading' | 'processing' | 'ready' | 'error' | 'deprecated';

export interface Dataset {
  id: string;
  workspaceId: string;
  sourceId: string;
  name: string;
  description: string;
  status: DatasetStatus;
  
  // Schema information
  schema: DatasetSchema;
  
  // Statistics
  rowCount: number;
  lastUpdated: string;
  dataQualityScore: number;
  
  // Content hash for change detection
  contentHash: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
}

export interface DatasetSchema {
  columns: DatasetColumn[];
  primaryKeys?: string[];
  foreignKeys?: DatasetForeignKey[];
}

export interface DatasetColumn {
  name: string;
  type: ColumnType;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  uniqueValues?: number;
  min?: string | number;
  max?: string | number;
  avg?: number;
  nullCount: number;
  sampleValues?: (string | number)[];
}

export type ColumnType = 
  | 'string' 
  | 'integer' 
  | 'float' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'timestamp'
  | 'json';

export interface DatasetForeignKey {
  column: string;
  referencesDatasetId: string;
  referencesColumn: string;
  relationshipType: 'one_to_one' | 'one_to_many' | 'many_to_one';
}

// ============================================================================
// DATASET RELATIONSHIP
// ============================================================================

export type RelationshipStatus = 'detected' | 'approved' | 'rejected' | 'pending';

export interface DatasetRelationship {
  id: string;
  workspaceId: string;
  sourceDatasetId: string;
  targetDatasetId: string;
  fromColumn: string;
  toColumn: string;
  relationshipType: 'one_to_one' | 'one_to_many' | 'many_to_one';
  confidence: number;
  status: RelationshipStatus;
  autoDetected: boolean;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

// ============================================================================
// INVESTIGATION ENTITY
// ============================================================================

export type InvestigationStatus = 
  | 'draft' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface Investigation {
  id: string;
  workspaceId: string;
  userId: string;
  
  question: string;
  classifiedTypes: QuestionClassification[];
  
  // Dataset selection
  selectedDatasetIds: string[];
  datasets: Dataset[]; // Denormalized for quick access
  
  // Execution state
  status: InvestigationStatus;
  runId?: string;
  
  // Results
  findings?: KeyFinding[];
  evidenceClaims?: EvidenceClaim[];
  marketSignals?: MarketSignal[];
  strategicOptions?: StrategicOption[];
  recommendation?: string;
  recommendationConfidence?: MultiDimConfidence;
  
  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  
  // Governance
  decisionRecord?: DecisionRecord;
  isFavorite?: boolean;
  notes?: string;
}

// ============================================================================
// INVESTIGATION RESULTS (shared with existing types)
// ============================================================================

export interface KeyFinding {
  id: string;
  label: string;
  value: string;
  change: string;
  direction: 'up' | 'down' | 'flat';
  subtext: string;
  metricType: string;
  evidenceClaimId: string;
  detailedData: {
    baseline: string;
    current: string;
    variance: string;
    confidence: number;
    dataSource: string;
  };
}

export interface EvidenceClaim {
  id: string;
  title: string;
  type: 'FACT' | 'EXTERNAL FACT' | 'INFERENCE' | 'FORECAST' | 'RECOMMENDATION';
  evidence: string;
  confidence: number;
  source: string;
  verified: boolean;
  dependencies: string[];
}

export interface MarketSignal {
  id: string;
  signal: string;
  explanation: string;
  source: string;
  date: string;
  type: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  confidence: number;
}

export interface StrategicOption {
  id: string;
  title: string;
  description: string;
  isRecommended: boolean;
  impact: string;
  risk: string;
  feasibility: string;
  scores: {
    impact: number;
    evidenceStrength: number;
    feasibility: number;
    risk: number;
    cost: number;
    strategicFit: number;
  };
  pros: string[];
  cons: string[];
  projectedOutcome: string;
}

export interface MultiDimConfidence {
  overallScore: number;
  level: 'DATA INSUFFICIENT' | 'LOW' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH';
  breakdown: {
    dataQuality: number;
    evidenceVerification: number;
    evidenceCoverage: number;
    claimVerification: number;
    evidenceConsistency: number;
    sourceCompleteness: number;
    analysisReliability: number;
  };
  explanations: Record<string, string>;
  topBoosters: string[];
  topReducers: string[];
}

export interface DecisionRecord {
  decision: 'APPROVE' | 'MODIFY' | 'REJECT' | null;
  timestamp: string;
  executiveNotes?: string;
  signoffUser?: string;
}

// ============================================================================
// QUESTION CLASSIFICATION
// ============================================================================

export type QuestionClassification = 
  | 'Diagnostic' 
  | 'Prescriptive' 
  | 'Descriptive' 
  | 'Predictive';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// ============================================================================
// DATA QUALITY & PROFILING
// ============================================================================

export interface DataQualityProfile {
  overallPercent: number;
  completeness: number;
  freshness: number;
  consistency: number;
  validity: number;
}

export interface DatasetProfile {
  rowCount: number;
  columnCount: number;
  dataQuality: DataQualityProfile;
  columns: ColumnProfile[];
  sampleRows: Record<string, any>[];
  dateRange?: {
    min: string;
    max: string;
  };
  duplicateRows: number;
  missingValues: {
    total: number;
    byColumn: Record<string, number>;
  };
}

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  nullCount: number;
  nullPercent: number;
  uniqueValues: number;
  uniquePercent: number;
  min?: string | number;
  max?: string | number;
  avg?: number;
  mode?: string | number;
  topCategories?: { value: string; count: number }[];
  sampleValues: (string | number)[];
}
// ============================================================================
// RE-EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

export type WSDataSource = DataSource;

// Helper to map WSDataSource to legacy DataSource format
export const mapDataSourceToLegacy = (source: WSDataSource): LegacyDataSource => ({
  id: source.id,
  name: source.name,
  type: source.type,
  status: source.status,
  recordsCount: source.rows || 0,
  fieldsCount: source.columns || 0,
  selected: source.selected,
  description: source.description || '',
});
// ============================================================================
// BACKWARD COMPATIBILITY TYPES (imported from types.ts in main code)
// These are aliased for workspace.ts internal use
// ============================================================================

// Legacy DataSource type for backward compatibility with investigationEngine
export interface LegacyDataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  recordsCount: number;
  fieldsCount: number;
  selected: boolean;
  description: string;
}

// Legacy types for investigation engine compatibility
export interface DiscoveredAnomaly {
  id: string;
  type: string;
  severity: string;
  description: string;
  impact: string;
  affectedDimensions: string[];
  detectedAt: string;
}

export interface CounterfactualAnalysis {
  scenarios: {
    id: string;
    title: string;
    description: string;
    projectedOutcome: string;
    confidence: number;
    probability: number;
  }[];
  bestCase: string;
  worstCase: string;
  mostLikely: string;
}

export interface MultiScenarioItem {
  id: string;
  name: string;
  assumptions: string;
  projectedRevenue: string;
  projectedMargin: string;
  confidence: number;
}

export interface ExecutionGraphNode {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  outcome?: string;
}
// ============================================================================
// BACKWARD COMPATIBILITY TYPES (imported from types.ts in main code)
// These are aliased for workspace.ts internal use
// ============================================================================

// Legacy DataSource type for backward compatibility with investigationEngine
export interface LegacyDataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  recordsCount: number;
  fieldsCount: number;
  selected: boolean;
  description: string;
}
