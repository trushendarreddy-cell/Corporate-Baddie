// ============================================================================
// Automated Unit Tests: Workspace Store
// Run: npx tsx scripts/test-store-engine.ts
//
// Covers the persistence layer in server/store.ts, including the concurrency
// behaviour of the read-modify-write cycle.
// ============================================================================

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let failures = 0;
const assert = (cond: boolean, label: string) => {
  console.log(`${cond ? '  PASS' : '  FAIL'} — ${label}`);
  if (!cond) failures++;
};

console.log('=== TEST SUITE: Store Engine ===\n');

// Each run gets its own DATA_DIR so the suite never touches a real database.
const dataDir = await mkdtemp(join(tmpdir(), 'cb-store-'));
process.env.DATA_DIR = dataDir;

// Imported after DATA_DIR is set, because store.ts resolves it at module load.
const store = await import('../server/store');

try {
  // 1. A fresh directory yields the seeded demo workspace rather than nothing.
  {
    console.log('Test 1: Empty store seeds the default demo workspace');
    const workspaces = await store.listWorkspaces();
    assert(workspaces.length === 1, 'Exactly one workspace is present');
    assert(Boolean(workspaces[0]?.id), 'Seeded workspace has an id');
  }

  // 2. Create, read back, update.
  {
    console.log('\nTest 2: Create, read back, and update a workspace');
    const created = await store.createWorkspace({ name: 'Q3 Margin Review', objective: 'protect margin' });
    assert(Boolean(created.id), 'Created workspace receives an id');
    assert(created.name === 'Q3 Margin Review', 'Name round-trips');

    const fetched = await store.getWorkspace(created.id);
    assert(fetched?.id === created.id, 'Workspace is retrievable by id');

    const updated = await store.updateWorkspace(created.id, { objective: 'restore margin' });
    assert(updated?.objective === 'restore margin', 'Patch is applied');
    assert(updated?.id === created.id, 'Patch cannot change the id');

    const missing = await store.updateWorkspace('ws-does-not-exist', { name: 'nope' });
    assert(missing === null, 'Updating an unknown id returns null');
  }

  // 3. Concurrent creates must not lose writes.
  //
  // Every mutation is load() -> modify -> save(). Without serialisation two
  // overlapping calls both read the same snapshot and the second save()
  // overwrites the first, so records vanish. This asserts all of them survive.
  {
    console.log('\nTest 3: Concurrent workspace creation does not drop records');
    const before = (await store.listWorkspaces()).length;

    const created = await Promise.all(
      Array.from({ length: 12 }, (_, i) => store.createWorkspace({ name: `Concurrent ${i}` })),
    );
    assert(created.length === 12, 'All 12 calls resolved');
    assert(new Set(created.map((w) => w.id)).size === 12, 'Each call produced a distinct id');

    const after = await store.listWorkspaces();
    assert(
      after.length === before + 12,
      `All 12 persisted (expected ${before + 12}, found ${after.length})`,
    );

    const names = new Set(after.map((w) => w.name));
    const missing = Array.from({ length: 12 }, (_, i) => `Concurrent ${i}`).filter((n) => !names.has(n));
    assert(missing.length === 0, `No records lost to a race (missing: ${missing.join(', ') || 'none'})`);
  }

  // 4. Datasets are scoped to their workspace.
  {
    console.log('\nTest 4: Dataset listing is scoped by workspace');
    const wsA = await store.createWorkspace({ name: 'Scope A' });
    const wsB = await store.createWorkspace({ name: 'Scope B' });

    const dataset = {
      id: 'ds-scope-test',
      workspaceId: wsA.id,
      name: 'revenue.csv',
      rowCount: 3,
      storagePath: '',
      schema: { columns: [] },
      fingerprint: 'abc',
      createdAt: new Date().toISOString(),
    } as any;

    await store.addDataset(dataset);

    const forA = await store.listDatasets(wsA.id);
    const forB = await store.listDatasets(wsB.id);
    assert(forA.length === 1, 'Workspace A sees its dataset');
    assert(forB.length === 0, 'Workspace B does not see A\'s dataset');

    const missing = await store.getDataset('ds-does-not-exist');
    assert(missing === null, 'Unknown dataset id returns null');
  }
} finally {
  await rm(dataDir, { recursive: true, force: true }).catch(() => undefined);
}

console.log('');
if (failures === 0) {
  console.log('ALL STORE ENGINE TESTS PASSED');
} else {
  console.log(`${failures} STORE ENGINE TEST(S) FAILED`);
  process.exit(1);
}
