import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './server/data');
const DB_FILE = path.join(DATA_DIR, 'corporatebaddie.json');

type Workspace = Record<string, unknown> & { id: string; createdAt: string; updatedAt: string };
type Dataset = Record<string, unknown> & { id: string; workspaceId: string; createdAt: string; updatedAt: string };

interface DB { workspaces: Workspace[]; datasets: Dataset[]; investigations: Record<string, unknown>[] }

async function load(): Promise<DB> {
  try { return JSON.parse(await readFile(DB_FILE, 'utf8')) as DB; }
  catch { return { workspaces: [], datasets: [], investigations: [] }; }
}

async function save(db: DB) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

export async function listWorkspaces() { return (await load()).workspaces; }
export async function getWorkspace(id: string) { return (await load()).workspaces.find(w => w.id === id) ?? null; }
export async function createWorkspace(input: Record<string, unknown>) {
  const db = await load(); const now = new Date().toISOString();
  const workspace = { ...input, id: `ws-${randomUUID()}`, createdAt: now, updatedAt: now } as Workspace;
  db.workspaces.push(workspace); await save(db); return workspace;
}
export async function updateWorkspace(id: string, patch: Record<string, unknown>) {
  const db = await load(); const index = db.workspaces.findIndex(w => w.id === id); if (index < 0) return null;
  db.workspaces[index] = { ...db.workspaces[index], ...patch, id, updatedAt: new Date().toISOString() };
  await save(db); return db.workspaces[index];
}
export async function listDatasets(workspaceId: string) { return (await load()).datasets.filter(d => d.workspaceId === workspaceId); }
export async function getDataset(id: string) { return (await load()).datasets.find(d => d.id === id) ?? null; }
export async function addDataset(dataset: Dataset) { const db = await load(); db.datasets.push(dataset); await save(db); return dataset; }
export async function deleteDataset(id: string) { const db = await load(); const before = db.datasets.length; db.datasets = db.datasets.filter(d => d.id !== id); if (db.datasets.length === before) return false; await save(db); return true; }

export async function runInvestigation(workspace: Workspace, question: string, datasetIds?: string[]) {
  const datasets = await listDatasets(workspace.id);
  const selected = datasetIds?.length ? datasets.filter(d => datasetIds.includes(d.id)) : datasets;
  const usable = selected.filter(d => d.status === 'ready');
  const runId = `RUN-${Date.now().toString(36).toUpperCase()}`;
  const result = {
    runId,
    workspaceId: workspace.id,
    question,
    status: usable.length ? 'completed' : 'data_insufficient',
    startedAt: new Date().toISOString(),
    dataSources: usable.map(d => ({ id: d.id, name: d.name, rows: d.rowCount, columns: (d.schema as { columns?: unknown[] })?.columns?.length ?? 0 })),
    findings: usable.map(d => ({ id: `claim-${d.id}`, type: 'FACT', claim: `${d.name} contains ${d.rowCount.toLocaleString()} records`, source: d.name, verified: true })),
    recommendation: usable.length ? 'Data is connected and ready for evidence-backed investigation.' : 'DATA INSUFFICIENT: connect a usable dataset before making a recommendation.',
    confidence: usable.length ? 60 : 0,
  };
  const db = await load(); db.investigations.push(result); await save(db); return result;
}
