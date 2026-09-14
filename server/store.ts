import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './server/data');
const DB_FILE = path.join(DATA_DIR, 'corporatebaddie.json');

type Workspace = Record<string, unknown> & { id: string; createdAt: string; updatedAt: string };
type Dataset = Record<string, any> & { id: string; workspaceId: string; createdAt: string; updatedAt: string };
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
export async function deleteDataset(id: string) {
  const db = await load(); const before = db.datasets.length;
  db.datasets = db.datasets.filter(d => d.id !== id);
  if (db.datasets.length === before) return false;
  await save(db); return true;
}

async function readRows(dataset: Dataset): Promise<Record<string, unknown>[]> {
  if (!dataset.storagePath) return [];
  try {
    const text = await readFile(dataset.storagePath, 'utf8');
    return text.split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch { return []; }
}

function numericColumns(dataset: Dataset) {
  return ((dataset.schema as any)?.columns || []).filter((column: any) => column.type === 'number').map((column: any) => column.name);
}

function summarizeDataset(dataset: Dataset, rows: Record<string, unknown>[]) {
  const numeric = numericColumns(dataset);
  const metrics = numeric.map(name => {
    const values = rows.map(row => Number(row[name])).filter(Number.isFinite);
    if (!values.length) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { column: name, count: values.length, sum, average: avg, min, max };
  }).filter(Boolean);
  return { rows: rows.length, numericMetrics: metrics };
}

function questionSignals(question: string) {
  const q = question.toLowerCase();
  return {
    asksWhy: /why|driver|cause|reason|drop|fall|decline|increase/.test(q),
    asksForecast: /forecast|predict|next|future|trend/.test(q),
    asksRecommendation: /should|recommend|best|decision|what do|action/.test(q),
    asksMarket: /competitor|market|pricing|industry|external/.test(q),
  };
}

export async function runInvestigation(workspace: Workspace, question: string, datasetIds?: string[]) {
  const datasets = await listDatasets(workspace.id);
  const selected = datasetIds?.length ? datasets.filter(d => datasetIds.includes(d.id)) : datasets;
  const usable = selected.filter(d => d.status === 'ready' && d.rowCount > 0);
  const runId = `RUN-${Date.now().toString(36).toUpperCase()}`;
  const signals = questionSignals(question);
  const summaries = [];

  for (const dataset of usable) {
    const rows = await readRows(dataset);
    summaries.push({ datasetId: dataset.id, dataset: dataset.name, summary: summarizeDataset(dataset, rows) });
  }

  const metrics = summaries.flatMap(item => item.summary.numericMetrics.map((metric: any) => ({ ...metric, dataset: item.dataset })));
  const strongestMetric = [...metrics].sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum))[0];
  const findings = usable.map(dataset => ({
    id: `claim-${dataset.id}`,
    type: 'FACT',
    claim: `${dataset.name} contains ${dataset.rowCount.toLocaleString()} records across ${((dataset.schema as any)?.columns || []).length} fields.`,
    source: dataset.name,
    verified: true,
    evidence: `Ingested dataset with SHA-256 ${dataset.contentHash || 'not recorded'}.`,
  }));

  if (strongestMetric) {
    findings.push({
      id: `metric-${strongestMetric.dataset}-${strongestMetric.column}`,
      type: 'FACT',
      claim: `${strongestMetric.column} has ${strongestMetric.count.toLocaleString()} numeric observations with an average of ${strongestMetric.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`,
      source: strongestMetric.dataset,
      verified: true,
      evidence: 'Calculated directly from the persisted dataset rows.',
    });
  }

  const status = usable.length ? 'completed' : 'data_insufficient';
  let recommendation = 'DATA INSUFFICIENT: connect a usable dataset before making a recommendation.';
  if (usable.length) {
    recommendation = signals.asksRecommendation && strongestMetric
      ? `Start with ${strongestMetric.column} in ${strongestMetric.dataset}: validate the observed pattern against business context before changing strategy.`
      : `Investigation ready: ${usable.length} dataset(s) were profiled and deterministic metrics were calculated from persisted rows.`;
  }

  const result = {
    runId,
    workspaceId: workspace.id,
    question,
    status,
    startedAt: new Date().toISOString(),
    questionSignals: signals,
    dataSources: usable.map(d => ({ id: d.id, name: d.name, rows: d.rowCount, columns: ((d.schema as any)?.columns || []).length })),
    findings,
    metricSummaries: summaries,
    marketStatus: signals.asksMarket ? 'MARKET INTELLIGENCE UNAVAILABLE' : 'NOT REQUIRED',
    forecastStatus: signals.asksForecast ? 'FORECAST REQUIRES TIME-SERIES VALIDATION' : 'NOT REQUIRED',
    recommendation,
    confidence: usable.length ? Math.min(95, 45 + Math.round((usable.length / Math.max(1, selected.length)) * 35) + (strongestMetric ? 10 : 0)) : 0,
    audit: { evidenceBacked: usable.length > 0, persistedDataUsed: usable.length > 0, generatedAt: new Date().toISOString() },
  };
  const db = await load(); db.investigations.push(result); await save(db); return result;
}
