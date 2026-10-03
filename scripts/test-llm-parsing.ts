// ============================================================================
// Automated Unit Tests: LLM Output Parsing
// Run: npx tsx scripts/test-llm-parsing.ts
//
// parseReasoning is the boundary between free-form model text and the typed
// object the UI renders. A model that wraps JSON in prose, emits trailing
// commas, returns a bare array, or lies about its confidence must not be able
// to crash the endpoint or smuggle an out-of-range score into the UI.
// ============================================================================

import { parseReasoning } from '../server/llmParsing';

let failures = 0;
const assert = (cond: boolean, label: string) => {
  console.log(`${cond ? '  PASS' : '  FAIL'} — ${label}`);
  if (!cond) failures++;
};

console.log('=== TEST SUITE: LLM Output Parsing ===\n');

// 1. Well-formed input round-trips.
{
  console.log('Test 1: Clean JSON');
  const r = parseReasoning('{"summary":"Margin fell","why":["a","b"],"recommendation":"Cut cost","alternatives":["Raise price"],"risks":["r"],"assumptions":["x"],"confidence":82,"claimType":"RECOMMENDATION"}');
  assert(r?.summary === 'Margin fell', 'summary parsed');
  assert(r?.why.length === 2, 'why array parsed');
  assert(r?.recommendation === 'Cut cost', 'recommendation parsed');
  assert(r?.confidence === 82, 'confidence parsed');
  assert(r?.claimType === 'RECOMMENDATION', 'claimType parsed');
}

// 2. Markdown fences, which models emit constantly.
{
  console.log('\nTest 2: Fenced and prose-wrapped JSON');
  const fenced = parseReasoning('```json\n{"summary":"ok","confidence":50}\n```');
  assert(fenced?.summary === 'ok', 'Fenced block unwrapped');
  assert(fenced?.confidence === 50, 'Fenced confidence parsed');

  const chatty = parseReasoning('Sure! Here is my analysis:\n{"summary":"buried","confidence":40}\nHope that helps.');
  assert(chatty?.summary === 'buried', 'JSON extracted from surrounding prose');
}

// 3. Confidence must be clamped, not trusted.
{
  console.log('\nTest 3: Confidence clamping');
  assert(parseReasoning('{"confidence":150}')?.confidence === 100, 'Above 100 clamps to 100');
  assert(parseReasoning('{"confidence":-40}')?.confidence === 0, 'Below 0 clamps to 0');
  assert(parseReasoning('{"confidence":"97"}')?.confidence === 97, 'Numeric string coerced');
  assert(parseReasoning('{"confidence":42.7}')?.confidence === 43, 'Float rounded');
  assert(parseReasoning('{"confidence":"high"}')?.confidence === null, 'Non-numeric becomes null');
  assert(parseReasoning('{}')?.confidence === null, 'Missing confidence becomes null');
}

// 4. Wrong shapes must not throw.
{
  console.log('\nTest 4: Malformed and hostile output');
  assert(parseReasoning('') === null, 'Empty string returns null');
  assert(parseReasoning('no json at all') === null, 'Plain prose returns null');
  assert(parseReasoning('{ broken') === null, 'Truncated object returns null');
  assert(parseReasoning('[1,2,3]') === null, 'Top-level array returns null');
  assert(parseReasoning('null') === null, 'Literal null returns null');
  assert(parseReasoning('{"a":1,}') === null, 'Trailing comma returns null rather than throwing');

  const wrongTypes = parseReasoning('{"summary":42,"why":"not-an-array","risks":{},"confidence":10}');
  assert(wrongTypes?.summary === '', 'Numeric summary coerced to empty string');
  assert(Array.isArray(wrongTypes?.why) && wrongTypes!.why.length === 0, 'Non-array why becomes empty array');
  assert(Array.isArray(wrongTypes?.risks) && wrongTypes!.risks.length === 0, 'Object risks becomes empty array');
}

// 5. Mixed-type arrays are filtered rather than rendered as objects.
{
  console.log('\nTest 5: Mixed arrays are filtered to strings');
  const r = parseReasoning('{"why":["ok",42,null,{"a":1},"also ok",false]}');
  assert(r?.why.length === 2, `Only the two strings survive (got ${r?.why.length})`);
  assert(r?.why[0] === 'ok' && r?.why[1] === 'also ok', 'String order preserved');
}

// 6. Oversized fields are truncated so one verbose model cannot blow up the UI.
{
  console.log('\nTest 6: Oversized fields are truncated');
  const huge = 'x'.repeat(5000);
  const r = parseReasoning(JSON.stringify({ summary: huge, why: new Array(50).fill(huge) }));
  assert(r!.summary.length === 2000, `summary truncated to 2000 (got ${r!.summary.length})`);
  assert(r!.why.length === 8, `why capped at 8 entries (got ${r!.why.length})`);
  assert(r!.why[0].length === 2000, 'Long list entries are themselves truncated');
}

// 7. claimType is an allow-list, never passed through.
{
  console.log('\nTest 7: claimType is restricted to the known values');
  assert(parseReasoning('{"claimType":"RECOMMENDATION"}')?.claimType === 'RECOMMENDATION', 'Known value kept');
  assert(parseReasoning('{"claimType":"FACT"}')?.claimType === 'INFERENCE', 'Unknown value becomes INFERENCE');
  assert(parseReasoning('{"claimType":"__proto__"}')?.claimType === 'INFERENCE', 'Suspicious value becomes INFERENCE');
}

// 8. Nested braces inside strings must not break the first-brace heuristic.
{
  console.log('\nTest 8: Braces inside string values');
  const r = parseReasoning('{"summary":"use {braces} here","why":["a {b} c"],"confidence":60}');
  assert(r?.summary === 'use {braces} here', 'Braces inside a string value survive');
  assert(r?.why[0] === 'a {b} c', 'Braces inside list entries survive');
}

console.log('');
if (failures === 0) {
  console.log('ALL LLM PARSING TESTS PASSED');
} else {
  console.log(`${failures} LLM PARSING TEST(S) FAILED`);
  process.exit(1);
}