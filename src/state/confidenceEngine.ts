import {
  DataSource,
  EvidenceClaim,
  ExecutionGraphNode,
  InvestigationIssue,
  KeyFinding,
  MultiDimConfidence,
} from '../types';

export interface ConfidenceCalculationInput {
  dataQuality: { overallPercent: number; completeness: number; freshness: number; consistency: number };
  dataSources: DataSource[];
  plan: ExecutionGraphNode[];
  claims: EvidenceClaim[];
  findings: KeyFinding[];
  issues: InvestigationIssue[];
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const calculateDecisionConfidence = (input: ConfidenceCalculationInput): MultiDimConfidence => {
  const relevantNodes = input.plan.filter((node) => node.id !== 'visualization');
  const requiredSourceIds = [...new Set(relevantNodes.map((node) => node.requiresDataSourceId).filter(Boolean) as string[])];
  const selectedSources = input.dataSources.filter((source) => source.selected && source.recordsCount > 0);
  const missingSourceIds = requiredSourceIds.filter((id) => !selectedSources.some((source) => source.id === id));
  const blockedNodes = relevantNodes.filter((node) => node.status === 'BLOCKED' || node.status === 'REQUIRES MORE DATA');
  const completedNodes = relevantNodes.filter((node) => node.status === 'COMPLETED');
  const conflictedClaims = input.claims.filter((claim) => claim.verificationStatus === 'CONFLICTED').length;
  const unverifiedClaims = input.claims.filter((claim) => !claim.verified || claim.verificationStatus === 'UNVERIFIED' || claim.verificationStatus === 'INSUFFICIENT EVIDENCE').length;
  const conflictIssues = input.issues.filter((issue) => issue.status === 'EVIDENCE CONFLICT').length;
  const missingEvidence = input.issues.filter((issue) => issue.status === 'DATA INSUFFICIENT' || issue.status === 'INVESTIGATION BLOCKED').length;
  const hasEvidence = input.claims.length > 0 || input.findings.length > 0;

  const dq = input.dataQuality || { overallPercent: 85, completeness: 85, freshness: 85, consistency: 85 };
  const dataQuality = clamp(((dq.overallPercent ?? 85) + (dq.completeness ?? 85) + (dq.freshness ?? 85) + (dq.consistency ?? 85)) / 4);
  const sourceCompleteness = requiredSourceIds.length === 0
    ? (selectedSources.length > 0 ? 100 : 0)
    : clamp(((requiredSourceIds.length - missingSourceIds.length) / requiredSourceIds.length) * 100);
  const claimVerification = input.claims.length === 0
    ? 0
    : clamp(((input.claims.length - unverifiedClaims) / input.claims.length) * 100);
  const evidenceConsistency = clamp(100 - ((conflictedClaims + conflictIssues) * 25));
  const evidenceCoverage = !hasEvidence
    ? 0
    : relevantNodes.length === 0
      ? 100
      : clamp((Math.max(completedNodes.length, input.findings.length > 0 ? 1 : 0) / relevantNodes.length) * 100);
  const analysisReliability = !hasEvidence
    ? 0
    : relevantNodes.length === 0
      ? 100
      : clamp((Math.max(completedNodes.length, input.findings.length > 0 ? relevantNodes.length : 0) / relevantNodes.length) * 100);
  const missingRequiredInputs = clamp(100 - ((missingSourceIds.length + blockedNodes.length) * 50));
  const conflictingEvidence = clamp(100 - ((conflictedClaims + conflictIssues) * 30));
  const externalEvidenceReliability = input.plan.some((node) => node.id === 'market-search')
    ? (input.claims.some((claim) => claim.type === 'EXTERNAL FACT' && claim.verified) ? 100 : 0)
    : 100;
  const forecastReliability = input.plan.some((node) => node.id === 'forecasting')
    ? (input.findings.length > 0 && blockedNodes.length === 0 ? 100 : 0)
    : 100;
  const assumptionStability = input.plan.some((node) => node.id === 'scenario-simulation')
    ? (input.findings.length > 0 && blockedNodes.length === 0 ? 100 : 0)
    : 100;
  const scenarioRobustness = assumptionStability;

  const breakdown = {
    dataQuality,
    evidenceVerification: claimVerification,
    evidenceCoverage,
    claimVerification,
    evidenceConsistency,
    sourceCompleteness,
    analysisReliability,
    missingRequiredInputs,
    conflictingEvidence,
    externalEvidenceReliability,
    forecastReliability,
    assumptionStability,
    contradictionPenalty: 100 - conflictingEvidence,
    scenarioRobustness,
  };

  const explanations = {
    dataQuality: `Average of current overall quality, completeness, freshness, and consistency: ${dataQuality}%.`,
    evidenceCoverage: `${completedNodes.length} of ${relevantNodes.length || 0} relevant planned outputs completed; ${input.findings.length} findings and ${input.claims.length} claims available.`,
    claimVerification: `${input.claims.length - unverifiedClaims} of ${input.claims.length} claims are verified.`,
    evidenceConsistency: `${conflictedClaims + conflictIssues} evidence conflict signals detected; each applies a 25-point deduction.`,
    sourceCompleteness: requiredSourceIds.length === 0
      ? `${selectedSources.length} usable selected source(s); no tool-specific source requirement was declared.`
      : `${requiredSourceIds.length - missingSourceIds.length} of ${requiredSourceIds.length} required source(s) are selected with records.`,
    analysisReliability: `${input.findings.length > 0 ? 'Evidence artifacts exist for the current run.' : 'No analysis evidence artifacts exist for the current run.'}`,
    missingRequiredInputs: `${missingSourceIds.length} required source(s) and ${blockedNodes.length} blocked tool node(s) reduce this score.`,
    conflictingEvidence: `${conflictedClaims + conflictIssues} conflict signal(s) reduce the score by 30 points each, capped at zero.`,
  };

  const minimumEvidenceFailure = !hasEvidence || missingEvidence > 0 || sourceCompleteness < 50 || claimVerification < 50;
  const weights = {
    dataQuality: 0.16,
    evidenceCoverage: 0.16,
    claimVerification: 0.16,
    evidenceConsistency: 0.14,
    sourceCompleteness: 0.12,
    analysisReliability: 0.12,
    missingRequiredInputs: 0.07,
    conflictingEvidence: 0.07,
  } as const;
  const overallScore = minimumEvidenceFailure
    ? 0
    : clamp(Object.entries(weights).reduce((sum, [key, weight]) => sum + breakdown[key as keyof typeof weights] * weight, 0));
  const level = minimumEvidenceFailure
    ? 'DATA INSUFFICIENT'
    : overallScore >= 85 ? 'HIGH' : overallScore >= 70 ? 'MEDIUM-HIGH' : overallScore >= 50 ? 'MEDIUM' : 'LOW';
  const boosters = Object.entries(breakdown)
    .filter(([key]) => key in weights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}%`);
  const reducers = Object.entries(breakdown)
    .filter(([key]) => key in weights)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}%`);

  return {
    overallScore,
    level,
    breakdown,
    explanations,
    topBoosters: boosters,
    topReducers: reducers,
    epistemicCaveat: level === 'DATA INSUFFICIENT'
      ? 'DATA INSUFFICIENT: evidence is below the minimum required for a defensible conclusion. This is not a probability.'
      : 'Decision Confidence is a deterministic evidence sufficiency score, not a statistical probability.',
  };
};