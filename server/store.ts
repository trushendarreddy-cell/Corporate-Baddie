import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './server/data');
const DB_FILE = path.join(DATA_DIR, 'corporatebaddie.json');

type Workspace = Record<string, unknown> & { id: string; createdAt: string; updatedAt: string };
type Dataset = Record<string, any> & { id: string; workspaceId: string; createdAt: string; updatedAt: string };
interface DB { workspaces: Workspace[]; datasets: Dataset[]; investigations: Record<string, any>[] }

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
  const db = await load(); const dataset = db.datasets.find(d => d.id === id);
  if (!dataset) return false;
  db.datasets = db.datasets.filter(d => d.id !== id);
  if (dataset.storagePath) await unlink(dataset.storagePath).catch(() => undefined);
  await save(db); return true;
}

async function readRows(dataset: Dataset): Promise<Record<string, unknown>[]> {
  if (!dataset.storagePath) return [];
  try { return (await readFile(dataset.storagePath, 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line)); }
  catch { return []; }
}
function columns(dataset: Dataset) { return ((dataset.schema as any)?.columns || []) as Array<{ name: string; type: string }>; }
function numericColumns(dataset: Dataset) { return columns(dataset).filter(column => column.type === 'number').map(column => column.name); }
function dateColumn(dataset: Dataset) { return columns(dataset).find(column => column.type === 'date')?.name ?? null; }

function summarizeDataset(dataset: Dataset, rows: Record<string, unknown>[]) {
  const numeric = numericColumns(dataset);
  const metrics = numeric.map(name => {
    const values = rows.map(row => Number(row[name])).filter(Number.isFinite);
    if (!values.length) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return { column: name, count: values.length, sum, average: sum / values.length, min: Math.min(...values), max: Math.max(...values) };
  }).filter(Boolean);
  return { rows: rows.length, numericMetrics: metrics };
}

function analyzeAnomalies(dataset: Dataset, rows: Record<string, unknown>[]) {
  const anomalies: any[] = [];
  for (const column of numericColumns(dataset).slice(0, 8)) {
    const values = rows.map(row => Number(row[column])).filter(Number.isFinite);
    if (values.length < 12) continue;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const sd = Math.sqrt(variance);
    if (!sd) continue;
    const extreme = values.map((value, index) => ({ value, index, z: Math.abs((value - mean) / sd) })).filter(item => item.z >= 3).sort((a, b) => b.z - a.z).slice(0, 3);
    for (const item of extreme) anomalies.push({ dataset: dataset.name, column, rowIndex: item.index, value: item.value, zScore: Number(item.z.toFixed(2)), type: 'OUTLIER', evidence: 'Absolute z-score >= 3 from persisted dataset values.' });
  }
  return anomalies;
}

function analyzeTrend(dataset: Dataset, rows: Record<string, unknown>[]) {
  const dcol = dateColumn(dataset);
  const ncol = numericColumns(dataset)[0];
  if (!dcol || !ncol || rows.length < 12) return { status: 'insufficient_history', reason: 'A date field and numeric measure with at least 12 observations are required.' };
  const points = rows.map(row => ({ date: Date.parse(String(row[dcol])), value: Number(row[ncol]) })).filter(point => Number.isFinite(point.date) && Number.isFinite(point.value)).sort((a, b) => a.date - b.date);
  if (points.length < 12) return { status: 'insufficient_history', reason: 'Fewer than 12 valid dated observations were found.' };
  const first = points.slice(0, Math.max(1, Math.floor(points.length * 0.25)));
  const last = points.slice(Math.floor(points.length * 0.75));
  const firstMean = first.reduce((sum, point) => sum + point.value, 0) / first.length;
  const lastMean = last.reduce((sum, point) => sum + point.value, 0) / last.length;
  const change = firstMean ? ((lastMean - firstMean) / Math.abs(firstMean)) * 100 : null;
  return { status: 'available', dateColumn: dcol, measure: ncol, observations: points.length, firstPeriodMean: firstMean, lastPeriodMean: lastMean, changePercent: change === null ? null : Number(change.toFixed(2)), direction: change === null ? 'unknown' : change > 5 ? 'up' : change < -5 ? 'down' : 'stable' };
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
  const summaries: any[] = [];
  const anomalies: any[] = [];
  const trends: any[] = [];

  for (const dataset of usable) {
    const rows = await readRows(dataset);
    summaries.push({ datasetId: dataset.id, dataset: dataset.name, summary: summarizeDataset(dataset, rows) });
    anomalies.push(...analyzeAnomalies(dataset, rows));
    trends.push({ datasetId: dataset.id, dataset: dataset.name, trend: analyzeTrend(dataset, rows) });
  }

  const metrics = summaries.flatMap(item => item.summary.numericMetrics.map((metric: any) => ({ ...metric, dataset: item.dataset })));
  const strongestMetric = [...metrics].sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum))[0];
  const findings: any[] = usable.map(dataset => ({ id: `claim-${dataset.id}`, type: 'FACT', claim: `${dataset.name} contains ${dataset.rowCount.toLocaleString()} records across ${columns(dataset).length} fields.`, source: dataset.name, verified: true, evidence: `Ingested dataset with ${dataset.contentHash || 'no recorded hash'}.` }));
  if (strongestMetric) findings.push({ id: `metric-${strongestMetric.dataset}-${strongestMetric.column}`, type: 'FACT', claim: `${strongestMetric.column} has ${strongestMetric.count.toLocaleString()} numeric observations with an average of ${strongestMetric.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`, source: strongestMetric.dataset, verified: true, evidence: 'Calculated directly from the persisted dataset rows.' });
  if (anomalies.length && signals.asksWhy) findings.push({ id: `anomaly-${runId}`, type: 'FACT', claim: `${anomalies.length} statistical outlier(s) were detected across the selected data.`, source: 'Deterministic anomaly analysis', verified: true, evidence: 'Outliers use absolute z-score >= 3; inspect row-level evidence before treating them as business causes.' });

  const status = usable.length ? 'completed' : 'data_insufficient';
  let recommendation = 'DATA INSUFFICIENT: connect a usable dataset before making a recommendation.';
  if (usable.length) recommendation = signals.asksRecommendation && strongestMetric
    ? `Start with ${strongestMetric.column} in ${strongestMetric.dataset}: validate the observed pattern against business context before changing strategy.`
    : `Investigation ready: ${usable.length} dataset(s) were profiled and deterministic metrics were calculated from persisted rows.`;

  const forecastEligible = trends.find(item => item.trend.status === 'available');
  const result = {
    runId, workspaceId: workspace.id, question, status, startedAt: new Date().toISOString(), questionSignals: signals,
    dataSources: usable.map(d => ({ id: d.id, name: d.name, rows: d.rowCount, columns: columns(d).length })),
    findings, metricSummaries: summaries, anomalies, trends,
    marketStatus: signals.asksMarket ? 'MARKET INTELLIGENCE PENDING_EXTERNAL_SEARCH' : 'NOT REQUIRED',
    forecastStatus: signals.asksForecast ? (forecastEligible ? 'FORECAST_ELIGIBLE_FOR_MODELING' : 'FORECAST UNRELIABLE') : 'NOT REQUIRED',
    recommendation,
    confidence: usable.length ? Math.min(95, 45 + Math.round((usable.length / Math.max(1, selected.length)) * 35) + (strongestMetric ? 10 : 0) + (signals.asksWhy && anomalies.length ? 5 : 0)) : 0,
    audit: { evidenceBacked: usable.length > 0, persistedDataUsed: usable.length > 0, deterministicAnalysis: true, generatedAt: new Date().toISOString() },
  };
  const db = await load(); db.investigations.push(result); await save(db); return result;
}

export async function updateInvestigation(runId: string, patch: Record<string, unknown>) {
  const db = await load(); const index = db.investigations.findIndex(item => item.runId === runId); if (index < 0) return null;
  db.investigations[index] = { ...db.investigations[index], ...patch }; await save(db); return db.investigations[index];
}
export async function listInvestigations(workspaceId: string) { return (await load()).investigations.filter(item => !workspaceId || item.workspaceId === workspaceId).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt))); }
export async function getInvestigation(runId: string) { return (await load()).investigations.find(item => item.runId === runId) ?? null; }
export async function detectRelationships(workspaceId: string) {
  const datasets = await listDatasets(workspaceId); const relationships: any[] = [];
  for (let i = 0; i < datasets.length; i++) for (let j = i + 1; j < datasets.length; j++) {
    const left = columns(datasets[i]).map(c => c.name); const right = new Set(columns(datasets[j]).map(c => c.name));
    for (const column of left) if (right.has(column)) relationships.push({ id: `rel-${datasets[i].id}-${datasets[j].id}-${column}`, sourceDatasetId: datasets[i].id, targetDatasetId: datasets[j].id, fromColumn: column, toColumn: column, relationshipType: 'candidate', confidence: 75, status: 'detected', autoDetected: true });
  }
  return relationships;
}
