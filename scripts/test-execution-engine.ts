// ============================================================================
// Execution engine integration tests A-E (per backend execution contract)
// Run: npx tsx scripts/test-execution-engine.ts
// ============================================================================
import {
  executeInvestigation,
  applyExecutionOutcomeToState,
  type ExecutionOutcome,
} from '../src/state/executionEngine';
import { buildUnifiedInvestigationState } from '../src/state/investigationEngine';
import { DEFAULT_DATA_SOURCES, DEFAULT_BUSINESS_CONTEXT } from '../src/mockData';
import type { DataSource, UnifiedInvestigationState } from '../src/types';

let failures = 0;
const assert = (cond: boolean, label: string) => {
  console.log(`${cond ? '  PASS' : '  FAIL'} — ${label}`);
  if (!cond) failures++;
};

const printOutcome = (name: string, outcome: ExecutionOutcome) => {
  console.log(`\n=== ${name} ===`);
  for (const entry of outcome.log) {
    if (entry.status === 'STARTED') {
      console.log(`[${entry.runId}] ${entry.stage} STARTED`);
    } else {
      const parts = [
        `[${entry.runId}]`,
        entry.stage,
        entry.status,
        entry.durationMs !== undefined ? `${entry.durationMs}ms` : '',
        entry.summary ? `— ${entry.summary}` : '',
      ];
      console.log(parts.filter(Boolean).join(' '));
    }
  }
  console.log(`terminal: ${outcome.terminalStatus}`);
};

const applyToState = (outcome: ExecutionOutcome, question: string, sources: DataSource[]): UnifiedInvestigationState =>
  applyExecutionOutcomeToState(
    buildUnifiedInvestigationState({
      runId: 'RUN-TEST',
      userQuestion: question,
      businessContext: DEFAULT_BUSINESS_CONTEXT,
      dataSources: sources,
    }),
    outcome
  );

// Use a synchronous clock and zero delay for deterministic tests.
const clock = () => steps++;
let steps = 0;
const sleep = async () => {};

// ----------------------------------------------------------------------------
// TEST A — Normal diagnostic question
// ----------------------------------------------------------------------------
{
  console.log('\n########## TEST A — Normal diagnostic question ##########');
  const question = 'Why are sales declining? Find the drivers.';
  const sources = DEFAULT_DATA_SOURCES.map((s) => ({ ...s, selected: s.id === 'src-1' || s.id === 'src-2' || s.id === 'src-3' }));

  const outcome = await executeInvestigation({ runId: 'RUN-A', question, dataSources: sources, clock, sleep });
  printOutcome('TEST A', outcome);

  const byStage = new Map(outcome.results.map((r) => [r.stage, r.status]));
  assert(byStage.get('REQUIREMENT_ANALYSIS') === 'COMPLETED', 'Requirement analysis completed');
  assert(byStage.get('DATA_PROFILER') === 'COMPLETED', 'Profiler completed');
  assert(byStage.get('BUSINESS_ANALYTICS') === 'COMPLETED', 'Analytics completed');
  assert(byStage.get('ANOMALY_DETECTION') === 'COMPLETED', 'Anomaly detection completed');
  assert(byStage.get('ROOT_CAUSE') === 'COMPLETED', 'Root cause completed (the previously-stuck stage)');
  assert(byStage.get('MARKET_INTELLIGENCE') === 'SKIPPED', 'Market skipped (internal-only question)');
  assert(byStage.get('EVIDENCE_VERIFICATION') === 'COMPLETED', 'Verification completed');
  assert(byStage.get('RECOMMENDATION') === 'COMPLETED', 'Recommendation completed');
  assert(outcome.terminalStatus === 'COMPLETED', 'Terminal status COMPLETED');

  const state = applyToState(outcome, question, sources);
  assert(state.claims.length > 0, 'Real claims surfaced (from active evidence base)');
  assert(state.empiricalFindings.length > 0, 'Real findings surfaced');
  assert(state.recommendationConfidence.overallScore > 0, 'Confidence computed from real outputs');
  assert(state.investigationPlan.every((n) => n.status !== 'PLANNED'), 'No plan node left PLANNED');
}

// ----------------------------------------------------------------------------
// TEST B — Market-dependent question
// ----------------------------------------------------------------------------
{
  console.log('\n########## TEST B — Market-dependent question ##########');
  const question = 'Should we change Product A pricing given current competitor pressure?';
  const sources = DEFAULT_DATA_SOURCES.map((s) => ({ ...s, selected: true }));

  const outcome = await executeInvestigation({ runId: 'RUN-B', question, dataSources: sources, clock, sleep });
  printOutcome('TEST B', outcome);

  const byStage = new Map(outcome.results.map((r) => [r.stage, r.status]));
  assert(byStage.get('ROOT_CAUSE') === 'COMPLETED', 'Root cause completed');
  assert(
    byStage.get('MARKET_INTELLIGENCE') === 'COMPLETED' || byStage.get('MARKET_INTELLIGENCE') === 'MARKET INTELLIGENCE UNAVAILABLE',
    'Market stage executed with explicit status'
  );
  assert(byStage.get('EVIDENCE_VERIFICATION') === 'COMPLETED', 'Verification completed');
  assert(byStage.get('RECOMMENDATION') === 'COMPLETED', 'Recommendation completed');
  assert(outcome.terminalStatus === 'COMPLETED', 'Terminal status COMPLETED');
}

// ----------------------------------------------------------------------------
// TEST C — Insufficient data (sales ledger removed)
// ----------------------------------------------------------------------------
{
  console.log('\n########## TEST C — Insufficient data ##########');
  const question = 'Why are sales declining?';
  const sources = DEFAULT_DATA_SOURCES.map((s) => ({ ...s, selected: s.id === 'src-2' })); // no src-1

  const outcome = await executeInvestigation({ runId: 'RUN-C', question, dataSources: sources, clock, sleep });
  printOutcome('TEST C', outcome);

  const byStage = new Map(outcome.results.map((r) => [r.stage, r.status]));
  assert(byStage.get('DATA_PROFILER') === 'COMPLETED', 'Profiler completes (other source present)');
  assert(byStage.get('BUSINESS_ANALYTICS') === 'DATA INSUFFICIENT', 'Analytics explicitly DATA INSUFFICIENT');
  assert(outcome.terminalStatus === 'DATA INSUFFICIENT', 'Pipeline terminates with DATA INSUFFICIENT');

  const state = applyToState(outcome, question, sources);
  assert(state.claims.length === 0, 'No fabricated claims');
  assert(state.empiricalFindings.length === 0, 'No fabricated findings');
  assert(state.recommendationConfidence.overallScore === 0, 'Confidence collapses to 0 (no fake numbers)');
  assert(
    state.recommendation.startsWith('DATA INSUFFICIENT'),
    'Recommendation is the explicit DATA INSUFFICIENT statement'
  );
  const logged = outcome.log.some((l) => l.status === 'FAILED' && l.stage === 'BUSINESS_ANALYTICS');
  assert(logged, 'Failure recorded in structured log');
}

// ----------------------------------------------------------------------------
// TEST D — Market failure (market question, market source unavailable)
// ----------------------------------------------------------------------------
{
  console.log('\n########## TEST D — Market intelligence unavailable ##########');
  const question = 'Should we change pricing given competitor pressure and market trends?';
  const sources = DEFAULT_DATA_SOURCES.map((s) => ({ ...s, selected: s.id === 'src-1' || s.id === 'src-2' || s.id === 'src-3' })); // src-5 off

  const outcome = await executeInvestigation({ runId: 'RUN-D', question, dataSources: sources, clock, sleep });
  printOutcome('TEST D', outcome);

  const byStage = new Map(outcome.results.map((r) => [r.stage, r.status]));
  assert(byStage.get('MARKET_INTELLIGENCE') === 'MARKET INTELLIGENCE UNAVAILABLE', 'Explicit MARKET INTELLIGENCE UNAVAILABLE');
  assert(byStage.get('EVIDENCE_VERIFICATION') === 'COMPLETED', 'Pipeline continues where defensible (verification)');
  assert(byStage.get('RECOMMENDATION') === 'COMPLETED', 'Recommendation still synthesized from internal evidence');

  const state = applyToState(outcome, question, sources);
  assert(state.marketIntelligence.length === 0, 'No fabricated market signals');
  const issue = state.issues.find((i) => i.status === 'MARKET INTELLIGENCE UNAVAILABLE');
  assert(!!issue, 'Unavailability recorded as investigation issue');
  // Confidence must be lower than the same run with market available.
  const sourcesWithMarket = DEFAULT_DATA_SOURCES.map((s) => ({ ...s, selected: true }));
  const withMarket = applyToState(
    await executeInvestigation({ runId: 'RUN-D2', question, dataSources: sourcesWithMarket, clock, sleep }),
    question,
    sourcesWithMarket
  );
  assert(
    withMarket.recommendationConfidence.overallScore > state.recommendationConfidence.overallScore,
    `Confidence appropriately affected (${withMarket.recommendationConfidence.overallScore}% with market > ${state.recommendationConfidence.overallScore}% without)`
  );
}

// ----------------------------------------------------------------------------
// TEST E — Forecast insufficiency (insufficient history)
// ----------------------------------------------------------------------------
{
  console.log('\n########## TEST E — Forecast unreliable ##########');
  const question = 'What will our sales revenue look like next quarter? Predict the future trend.';
  // src-1 with too few records to support forecasting (<1000 rows).
  const sources: DataSource[] = DEFAULT_DATA_SOURCES.map((s) =>
    s.id === 'src-1' ? { ...s, selected: true, recordsCount: 320 } : { ...s, selected: false }
  );

  const outcome = await executeInvestigation({ runId: 'RUN-E', question, dataSources: sources, clock, sleep });
  printOutcome('TEST E', outcome);

  const byStage = new Map(outcome.results.map((r) => [r.stage, r.status]));
  assert(byStage.get('FORECASTING') === 'FORECAST UNRELIABLE', 'Explicit FORECAST UNRELIABLE');
  assert(byStage.get('EVIDENCE_VERIFICATION') === 'COMPLETED', 'Pipeline continues where defensible');
  assert(byStage.get('RECOMMENDATION') === 'COMPLETED', 'Recommendation completed where defensible');

  const state = applyToState(outcome, question, sources);
  assert(state.scenarioResults.length === 0, 'No fabricated scenario/forecast artifacts');
  const issue = state.issues.find((i) => i.status === 'FORECAST UNRELIABLE');
  assert(!!issue, 'Forecast unreliability recorded as investigation issue');
}

// ----------------------------------------------------------------------------
// TEST F (bonus) — TOOL FAILED path via exception injection
// ----------------------------------------------------------------------------
{
  console.log('\n########## TEST F — Tool failure (exception safety) ##########');
  const question = 'Why are sales declining?';
  // Realistic tool crash: a data source whose metadata access throws when the
  // profiler reads it (e.g. corrupted connector descriptor).
  const corruptSource = {
    ...DEFAULT_DATA_SOURCES[0],
    get recordsCount(): number {
      throw new Error('simulated connector crash: descriptor unreadable');
    },
  } as DataSource;
  const sources = [corruptSource];

  const outcome = await executeInvestigation({ runId: 'RUN-F', question, dataSources: sources, clock, sleep });
  printOutcome('TEST F', outcome);

  assert(outcome.results.some((r) => r.status === 'TOOL FAILED'), 'Exception recorded as TOOL FAILED (not swallowed)');
  assert(outcome.terminalStatus === 'TOOL FAILED', 'Terminal status TOOL FAILED');
  assert(outcome.issues.some((i) => i.status === 'TOOL FAILURE'), 'Issue recorded for governance surfaces');
  assert(
    outcome.log.some((l) => l.status === 'FAILED' && l.error && l.error.includes('simulated')),
    'Error message preserved in structured log'
  );
}

console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
