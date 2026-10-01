// ============================================================================
// Automated Unit Tests: CSV Ingestion
// Run: npx tsx scripts/test-ingest-engine.ts
// ============================================================================

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let failures = 0;
const assert = (cond: boolean, label: string) => {
  console.log(`${cond ? '  PASS' : '  FAIL'} — ${label}`);
  if (!cond) failures++;
};

console.log('=== TEST SUITE: Ingest Engine ===\n');

const dir = await mkdtemp(join(tmpdir(), 'cb-ingest-'));

try {
  const { inferTypeForTest, parseCsvForTest } = await import('../server/ingest');

  // 1. Type inference.
  {
    console.log('Test 1: Column type inference');
    assert(inferTypeForTest(['1', '2', '3.5']) === 'number', 'Numeric strings infer as number');
    assert(inferTypeForTest(['2024-01-01', '2024-02-01']) === 'date', 'ISO dates infer as date');
    assert(inferTypeForTest(['alpha', 'beta']) === 'string', 'Words infer as string');
    assert(
      inferTypeForTest(['1', '2', 'n/a']) === 'string',
      'A single non-numeric cell prevents a false numeric column',
    );
    assert(inferTypeForTest([]) === 'string', 'Empty sample falls back to string');
  }

  // 2. Plain rows, quoted fields containing commas, and escaped quotes.
  {
    console.log('\nTest 2: Quoted fields containing commas and quotes');
    const csv = [
      'name,note',
      'Acme,"blue, large"',
      'Beta,"He said ""hi"""',
    ].join('\n');
    const rows = parseCsvForTest(csv);
    assert(rows.length === 3, `Header plus two rows parsed (got ${rows.length})`);
    assert(rows[1][1] === 'blue, large', 'Comma inside quotes stays in one cell');
    assert(rows[2][1] === 'He said "hi"', 'Doubled quotes unescape to one quote');
  }

  // 3. A quoted field containing a newline is legal CSV. readline-based
  //    splitting mangles it into two broken rows.
  {
    console.log('\nTest 3: Quoted field spanning multiple lines');
    const csv = ['name,note', '"Acme","line one', 'line two"', 'Gamma,plain'].join('\n');
    const rows = parseCsvForTest(csv);
    assert(rows.length === 3, `Three logical rows parsed (got ${rows.length})`);
    assert(rows[1][0] === 'Acme', 'First cell of the multi-line row is intact');
    assert(
      rows[1][1] === 'line one\nline two',
      'Embedded newline preserved inside the quoted cell',
    );
    assert(rows[2][0] === 'Gamma', 'Row after the multi-line row still parses');
  }

  // 4. CRLF line endings.
  {
    console.log('\nTest 4: CRLF line endings');
    const rows = parseCsvForTest('a,b\r\n1,2\r\n3,4');
    assert(rows.length === 3, 'CRLF file parses to three rows');
    assert(rows[1][1] === '2', 'Trailing carriage return is not left in the cell');
  }

  // 5. A full ingest round-trip through the real entry point.
  {
    console.log('\nTest 5: ingestFile round-trip');
    const file = join(dir, 'sales.csv');
    await writeFile(file, 'region,revenue\nAPAC,100\nEMEA,250\n', 'utf8');

    const { ingestFile } = await import('../server/ingest');
    const dataset = await ingestFile(
      { id: 'ws-test', name: 'Test' } as any,
      { originalname: 'sales.csv', path: file } as any,
      'ds-test',
    );

    assert(dataset.rowCount === 2, `Row count excludes the header (got ${dataset.rowCount})`);
    const cols = (dataset.schema as any).columns as Array<{ name: string; type: string }>;
    assert(cols.find((c) => c.name === 'region')?.type === 'string', 'region typed as string');
    assert(cols.find((c) => c.name === 'revenue')?.type === 'number', 'revenue typed as number');
  }
} finally {
  await rm(dir, { recursive: true, force: true }).catch(() => undefined);
}

console.log('');
if (failures === 0) {
  console.log('ALL INGEST ENGINE TESTS PASSED');
} else {
  console.log(`${failures} INGEST ENGINE TEST(S) FAILED`);
  process.exit(1);
}
