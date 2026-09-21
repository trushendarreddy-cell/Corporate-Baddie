// ============================================================================
// Automated Unit Tests: Decision Confidence Engine
// Run: npx tsx scripts/test-confidence-engine.ts
// ============================================================================

import { calculateDecisionConfidence } from '../src/state/confidenceEngine';
import { DEFAULT_DATA_SOURCES } from '../src/mockData';
import type { ExecutionGraphNode, EvidenceClaim, KeyFinding, InvestigationIssue } from '../src/types';

let failures = 0;
const assert = (cond: boolean, label: string) => {
  console.log(`${cond ? '  PASS' : '  FAIL'} — ${label}`);
  if (!cond) failures++;
};

console.log('=== TEST SUITE: Confidence Engine ===\n');

// 1. Minimum Evidence Failure when no claims or findings exist
{
  console.log('Test 1: Zero evidence claims and findings collapses score to 0');
  const result = calculateDecisionConfidence({
    dataQuality: { overallPercent: 90, completeness: 90, freshness: 90, consistency: 90 },
    dataSources: DEFAULT_DATA_SOURCES,
    plan: [{ id: 'data-profiler', label: 'Profiler', dimension: 'Data', status: 'COMPLETED', summary: '', prerequisiteIds: [] }],
    claims: [],
    findings: [],
    issues: [],
  });

  assert(result.overallScore === 0, 'Overall score collapses to 0');
  assert(result.level === 'DATA INSUFFICIENT', 'Level is DATA INSUFFICIENT');
  assert(result.epistemicCaveat.includes('DATA INSUFFICIENT'), 'Epistemic caveat reflects data insufficiency');
}

// 2. High Evidence Confidence with verified claims and matching data sources
{
  console.log('\nTest 2: Verified evidence with high data quality produces HIGH confidence');
  const mockPlan: ExecutionGraphNode[] = [
    { id: 'data-profiler', label: 'Profiler', dimension: 'Data', status: 'COMPLETED', summary: '', prerequisiteIds: [], requiresDataSourceId: 'src-1' },
    { id: 'sql-pandas-analytics', label: 'Analytics', dimension: 'Finance', status: 'COMPLETED', summary: '', prerequisiteIds: [], requiresDataSourceId: 'src-1' },
  ];
  const mockClaims: EvidenceClaim[] = [
    { id: 'c1', title: 'Revenue contraction verified', type: 'FACT', evidence: 'Ledger records', confidence: 95, source: 'ERP', verified: true, dependencies: [], verificationStatus: 'SUPPORTED' },
    { id: 'c2', title: 'Product A margin variance', type: 'FACT', evidence: 'SKU ledger', confidence: 92, source: 'ERP', verified: true, dependencies: [], verificationStatus: 'SUPPORTED' },
  ];
  const mockFindings: KeyFinding[] = [
    {
      id: 'f1',
      label: 'Sales drop',
      value: '-14.2%',
      change: 'Observed',
      direction: 'down',
      subtext: 'ERP ledger',
      metricType: 'Revenue',
      evidenceClaimId: 'c1',
      detailedData: { baseline: '3.6M', current: '2.8M', variance: '-14.2%', confidence: 95, dataSource: 'ERP' },
    },
  ];

  const result = calculateDecisionConfidence({
    dataQuality: { overallPercent: 95, completeness: 96, freshness: 94, consistency: 98 },
    dataSources: DEFAULT_DATA_SOURCES.map((s) => ({ ...s, selected: s.id === 'src-1', recordsCount: 10000 })),
    plan: mockPlan,
    claims: mockClaims,
    findings: mockFindings,
    issues: [],
  });

  assert(result.overallScore >= 70, `Score is high (${result.overallScore}%)`);
  assert(result.level === 'HIGH' || result.level === 'MEDIUM-HIGH', `Level is verified (${result.level})`);
  assert(result.breakdown.claimVerification === 100, 'Claim verification is 100%');
  assert(result.breakdown.evidenceConsistency === 100, 'Evidence consistency is 100%');
}

// 3. Contradiction and Conflict Penalties
{
  console.log('\nTest 3: Conflicting evidence applies penalty to consistency and overall score');
  const mockPlan: ExecutionGraphNode[] = [
    { id: 'data-profiler', label: 'Profiler', dimension: 'Data', status: 'COMPLETED', summary: '', prerequisiteIds: [] },
  ];
  const mockClaims: EvidenceClaim[] = [
    { id: 'c1', title: 'Positive signal', type: 'FACT', evidence: '', confidence: 80, source: 'A', verified: true, dependencies: [], verificationStatus: 'CONFLICTED' },
    { id: 'c2', title: 'Negative signal', type: 'FACT', evidence: '', confidence: 80, source: 'B', verified: true, dependencies: [], verificationStatus: 'CONFLICTED' },
  ];
  const mockFindings: KeyFinding[] = [
    {
      id: 'f1',
      label: 'Variance',
      value: '10%',
      change: 'Observed',
      direction: 'flat',
      subtext: '',
      metricType: 'Ops',
      evidenceClaimId: 'c1',
      detailedData: { baseline: '100', current: '110', variance: '10%', confidence: 80, dataSource: 'A' },
    },
  ];
  const mockIssues: InvestigationIssue[] = [
    { status: 'EVIDENCE CONFLICT', failedComponent: 'Analytics', impact: 'Contradictory findings', confidenceDelta: -25, nextAction: 'Re-audit' },
  ];

  const result = calculateDecisionConfidence({
    dataQuality: { overallPercent: 80, completeness: 80, freshness: 80, consistency: 80 },
    dataSources: DEFAULT_DATA_SOURCES.map((s) => ({ ...s, selected: true, recordsCount: 5000 })),
    plan: mockPlan,
    claims: mockClaims,
    findings: mockFindings,
    issues: mockIssues,
  });

  assert(result.breakdown.evidenceConsistency < 50, `Evidence consistency penalizes conflicts (${result.breakdown.evidenceConsistency}%)`);
  assert(result.breakdown.conflictingEvidence < 50, `Conflicting evidence score penalized (${result.breakdown.conflictingEvidence}%)`);
}

// 4. Defensive handling with missing or partial dataQuality object
{
  console.log('\nTest 4: Graceful fallback when dataQuality object is undefined or empty');
  const result = calculateDecisionConfidence({
    dataQuality: undefined as any,
    dataSources: DEFAULT_DATA_SOURCES,
    plan: [],
    claims: [{ id: 'c1', title: 'Fact', type: 'FACT', evidence: '', confidence: 80, source: 'A', verified: true, dependencies: [] }],
    findings: [{
      id: 'f1',
      label: 'L',
      value: 'V',
      change: 'C',
      direction: 'flat',
      subtext: '',
      metricType: 'M',
      evidenceClaimId: 'c1',
      detailedData: { baseline: '0', current: '0', variance: '0', confidence: 80, dataSource: 'A' },
    }],
    issues: [],
  });

  assert(typeof result.overallScore === 'number', 'Calculated overallScore without crashing');
  assert(result.breakdown.dataQuality > 0, 'Used default fallback data quality score');
}

console.log(`\n${failures === 0 ? 'ALL CONFIDENCE ENGINE TESTS PASSED' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
