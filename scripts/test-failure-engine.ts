// ============================================================================
// Automated Unit Tests: Pre-Mortem Failure Engine
// Run: npx tsx scripts/test-failure-engine.ts
// ============================================================================

import {
  FAILURE_PROFILES,
  getFailureProfileForOption,
  type OptionFailureProfile,
} from '../src/state/failureEngine';

let failures = 0;
const assert = (cond: boolean, label: string) => {
  console.log(`${cond ? '  PASS' : '  FAIL'} — ${label}`);
  if (!cond) failures++;
};

console.log('=== TEST SUITE: Pre-Mortem Failure Engine ===\n');

// 1. Static profiles coverage
{
  console.log('Test 1: Standard options (opt-1 to opt-4) exist in FAILURE_PROFILES');
  const requiredOptions = ['opt-1', 'opt-2', 'opt-3', 'opt-4'];
  for (const optId of requiredOptions) {
    const profile = FAILURE_PROFILES[optId];
    assert(!!profile, `Profile exists for ${optId}`);
    assert(profile.failureModes.length > 0, `${optId} has at least one failure mode`);
    assert(profile.overallVulnerabilityScore >= 0 && profile.overallVulnerabilityScore <= 100, `${optId} score bounded 0-100`);
    assert(profile.breakEvenProbability >= 0 && profile.breakEvenProbability <= 100, `${optId} break-even bounded 0-100`);
  }
}

// 2. Failure mode data structure integrity
{
  console.log('\nTest 2: Failure modes contain actionable pre-mortem fields');
  const opt1 = FAILURE_PROFILES['opt-1'];
  for (const mode of opt1.failureModes) {
    assert(typeof mode.id === 'string' && mode.id.length > 0, `Mode ${mode.id} has valid ID`);
    assert(typeof mode.triggerCondition === 'string' && mode.triggerCondition.length > 0, `Mode ${mode.id} has trigger condition`);
    assert(typeof mode.preMortemNarrative === 'string' && mode.preMortemNarrative.length > 0, `Mode ${mode.id} has narrative`);
    assert(typeof mode.earlyWarningSignal === 'string' && mode.earlyWarningSignal.length > 0, `Mode ${mode.id} has early warning signal`);
    assert(typeof mode.mitigationProtocol === 'string' && mode.mitigationProtocol.length > 0, `Mode ${mode.id} has mitigation protocol`);
  }
}

// 3. Fallback synthesis for custom or unseen option IDs
{
  console.log('\nTest 3: getFailureProfileForOption provides resilient fallback for unmapped options');
  const customProfile = getFailureProfileForOption('opt-custom-99', 'Pilot Regional SKU Bundle');
  assert(customProfile.optionId === 'opt-custom-99', 'Preserved requested option ID');
  assert(customProfile.optionName === 'Pilot Regional SKU Bundle', 'Preserved requested fallback name');
  assert(customProfile.failureModes.length > 0, 'Synthesized fallback failure modes');
  assert(customProfile.overallVulnerabilityScore === 50, 'Default score set to balanced baseline 50');
  assert(customProfile.failureModes[0].mitigationProtocol.length > 0, 'Synthesized actionable mitigation protocol');
}

// 4. Known profile retrieval via getFailureProfileForOption
{
  console.log('\nTest 4: getFailureProfileForOption retrieves known profile accurately');
  const profile = getFailureProfileForOption('opt-1');
  assert(profile === FAILURE_PROFILES['opt-1'], 'Returned exact profile reference for opt-1');
  assert(profile.primaryFailureMode === 'Cross-Regional Grey Market Arbitrage', 'Correct primary failure mode');
}

console.log(`\n${failures === 0 ? 'ALL FAILURE ENGINE TESTS PASSED' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
