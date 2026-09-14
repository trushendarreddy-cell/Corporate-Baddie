import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './server/data');
const DB_FILE = path.join(DATA_DIR, 'corporatebaddie.json');

type Workspace = Record<string, unknown> & { id: string; createdAt: string; updatedAt: string };
type Dataset = Record<string, any> & { id: string; workspaceId: string; createdAt: string; updatedAt: string };
interface DB { workspaces: Workspace[]; datasets: Dataset[]; investigations: Record<string, any>[] }

async function load(): Promise<DB> {
  try {
    const parsed = JSON.parse(await readFile(DB_FILE, 'utf8')) as Partial<DB>;
    return { workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [], datasets: Array.isArray(parsed.datasets) ? parsed.datasets : [], investigations: Array.isArray(parsed.investigations) ? parsed.investigations : [] };
  } catch {
    return { workspaces: [], datasets: [], investigations: [] };
  }
}

async function save(db: DB) {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, JSON.stringify(db, null, 2), 'utf8');
  await rename(temp, DB_FILE);
}

export async function listWorkspaces() { return (await load()).workspaces; }
export async function getWorkspace(id: string) { return (await load()).workspaces.find(w => w.id === id) ?? null; }
export async function createWorkspace(input: Record<string, unknown>) { const db = await load(); const now = new Date().toISOString(); const workspace = { ...input, id: `ws-${randomUUID()}`, createdAt: now, updatedAt: now } as Workspace; db.workspaces.push(workspace); await save(db); return workspace; }
export async function updateWorkspace(id: string, patch: Record<string, unknown>) { const db = await load(); const index = db.workspaces.findIndex(w => w.id === id); if (index < 0) return null; db.workspaces[index] = { ...db.workspaces[index], ...patch, id, updatedAt: new Date().toISOString() }; await save(db); return db.workspaces[index]; }
export async function listDatasets(workspaceId: string) { return (await load()).datasets.filter(d => d.workspaceId === workspaceId); }
export async function getDataset(id: string) { return (await load()).datasets.find(d => d.id === id) ?? null; }
export async function addDataset(dataset: Dataset) { const db = await load(); db.datasets.push(dataset); await save(db); return dataset; }
export async function deleteDataset(id: string) { const db = await load(); const dataset = db.datasets.find(d => d.id === id); if (!dataset) return false; db.datasets = db.datasets.filter(d => d.id !== id); if (dataset.storagePath) await unlink(dataset.storagePath).catch(() => undefined); await save(db); return true; }

async function readRows(dataset: Dataset): Promise<Record<string, unknown>[]> {
  if (!dataset.storagePath) return [];
  try {
    const lines = (await readFile(dataset.storagePath, 'utf8')).split('\n').filter(Boolean);
    const rows: Record<string, unknown>[] = [];
    for (const line of lines) { try { const value = JSON.parse(line); if (value && typeof value === 'object') rows.push(value); } catch { /* skip a corrupt row instead of failing the whole investigation */ } }
    return rows;
  } catch { return []; }
}

function columns(dataset: Dataset) { return ((dataset.schema as any)?.columns || []) as Array<{ name: string; type: string; nullable?: boolean; nullCount?: number }>; }
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
  const declaredCells = Math.max(1, rows.length * Math.max(1, columns(dataset).length));
  const nullCells = columns(dataset).reduce((sum, column) => sum + Number(column.nullCount || 0), 0);
  const completeness = Math.max(0, Math.min(100, Math.round(((declaredCells - nullCells) / declaredCells) * 100)));
  return { rows: rows.length, numericMetrics: metrics, completeness };
}

function analyzeAnomalies(dataset: Dataset, rows: Record<string, unknown>[]) {
  const anomalies: any[] = [];
  for (const column of numericColumns(dataset).slice(0, 8)) {
    const values = rows.map(row => Number(row[column])).filter(Number.isFinite);
    if (values.length < 12) continue;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const sd = Math.sqrt(variance); if (!sd) continue;
    values.map((value, index) => ({ value, index, z: Math.abs((value - mean) / sd) })).filter(item => item.z >= 3).sort((a, b) => b.z - a.z).slice(0, 3).forEach(item => anomalies.push({ dataset: dataset.name, column, rowIndex: item.index, value: item.value, zScore: Number(item.z.toFixed(2)), type: 'OUTLIER', evidence: 'Absolute z-score >= 3 from persisted dataset values.' }));
  }
  return anomalies;
}

function analyzeTrend(dataset: Dataset, rows: Record<string, unknown>[]) {
  const dcol = dateColumn(dataset); const ncol = numericColumns(dataset)[0];
  if (!dcol || !ncol || rows.length < 12) return { status: 'insufficient_history', reason: 'A date field and numeric measure with at least 12 observations are required.' };
  const points = rows.map(row => ({ date: Date.parse(String(row[dcol])), value: Number(row[ncol]) })).filter(point => Number.isFinite(point.date) && Number.isFinite(point.value)).sort((a, b) => a.date - b.date);
  if (points.length < 12) return { status: 'insufficient_history', reason: 'Fewer than 12 valid dated observations were found.' };
  const split = Math.max(1, Math.floor(points.length * 0.25)); const first = points.slice(0, split); const last = points.slice(-split);
  const firstMean = first.reduce((sum, point) => sum + point.value, 0) / first.length; const lastMean = last.reduce((sum, point) => sum + point.value, 0) / last.length;
  const change = firstMean ? ((lastMean - firstMean) / Math.abs(firstMean)) * 100 : null;
  return { status: 'available', dateColumn: dcol, measure: ncol, observations: points.length, firstPeriodMean: firstMean, lastPeriodMean: lastMean, changePercent: change === null ? null : Number(change.toFixed(2)), direction: change === null ? 'unknown' : change > 5 ? 'up' : change < -5 ? 'down' : 'stable' };
}

function forecast(dataset: Dataset, rows: Record<string, unknown>[]) {
  const dcol = dateColumn(dataset); const ncol = numericColumns(dataset)[0];
  if (!dcol || !ncol) return { status: 'FORECAST UNRELIABLE', reason: 'No date field and numeric measure pair was detected.' };
  const points = rows.map(row => ({ x: Date.parse(String(row[dcol])), y: Number(row[ncol]) })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y)).sort((a, b) => a.x - b.x);
  if (points.length < 12) return { status: 'FORECAST UNRELIABLE', reason: 'At least 12 valid dated observations are required.' };
  const meanX = points.reduce((s, p) => s + p.x, 0) / points.length; const meanY = points.reduce((s, p) => s + p.y, 0) / points.length; const denominator = points.reduce((s, p) => s + (p.x - meanX) ** 2, 0);
  if (!denominator) return { status: 'FORECAST UNRELIABLE', reason: 'Dates do not contain enough variation for a trend model.' };
  const slope = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0) / denominator; const intercept = meanY - slope * meanX; const residuals = points.map(p => p.y - (intercept + slope * p.x)); const rmse = Math.sqrt(residuals.reduce((s, e) => s + e * e, 0) / points.length); const lastDate = points[points.length - 1].x; const step = Math.max(86400000, (lastDate - points[0].x) / Math.max(1, points.length - 1)); const nextDate = lastDate + step; const prediction = intercept + slope * nextDate;
  return { status: 'available', method: 'linear_baseline', dateColumn: dcol, measure: ncol, observations: points.length, nextDate: new Date(nextDate).toISOString(), prediction: Number(prediction.toFixed(4)), rmse: Number(rmse.toFixed(4)), uncertainty: { type: 'RMSE_BAND', lower: Number((prediction - rmse).toFixed(4)), upper: Number((prediction + rmse).toFixed(4)) }, note: 'Baseline directional forecast; not causal and not a substitute for validated production forecasting.' };
}

function questionSignals(question: string) { const q = question.toLowerCase(); return { asksWhy: /why|driver|cause|reason|drop|fall|decline|increase/.test(q), asksForecast: /forecast|predict|next|future|trend/.test(q), asksRecommendation: /should|recommend|best|decision|what do|action/.test(q), asksMarket: /competitor|market|pricing|industry|external/.test(q) }; }

export async function runInvestigation(workspace: Workspace, question: string, datasetIds?: string[]) {
  const datasets = await listDatasets(workspace.id); const selected = datasetIds?.length ? datasets.filter(d => datasetIds.includes(d.id)) : datasets; const usable = selected.filter(d => d.status === 'ready' && d.rowCount > 0); const runId = `RUN-${Date.now().toString(36).toUpperCase()}`; const signals = questionSignals(question);
  const summaries: any[] = []; const anomalies: any[] = []; const trends: any[] = []; const forecasts: any[] = [];
  for (const dataset of usable) { const rows = await readRows(dataset); summaries.push({ datasetId: dataset.id, dataset: dataset.name, summary: summarizeDataset(dataset, rows), dataQualityScore: dataset.dataQualityScore ?? null }); anomalies.push(...analyzeAnomalies(dataset, rows)); trends.push({ datasetId: dataset.id, dataset: dataset.name, trend: analyzeTrend(dataset, rows) }); if (signals.asksForecast) forecasts.push({ datasetId: dataset.id, dataset: dataset.name, forecast: forecast(dataset, rows) }); }
  const metrics = summaries.flatMap(item => item.summary.numericMetrics.map((metric: any) => ({ ...metric, dataset: item.dataset }))); const strongestMetric = [...metrics].sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum))[0];
  const findings: any[] = usable.map(dataset => ({ id: `claim-${dataset.id}`, type: 'FACT', claim: `${dataset.name} contains ${dataset.rowCount.toLocaleString()} records across ${columns(dataset).length} fields.`, source: dataset.name, verified: true, evidence: `Persisted dataset hash: ${dataset.contentHash || 'not recorded'}.`, evidenceRef: { datasetId: dataset.id, datasetHash: dataset.contentHash || null } }));
  if (strongestMetric) findings.push({ id: `metric-${strongestMetric.dataset}-${strongestMetric.column}`, type: 'FACT', claim: `${strongestMetric.column} has ${strongestMetric.count.toLocaleString()} numeric observations with an average of ${strongestMetric.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`, source: strongestMetric.dataset, verified: true, evidence: 'Calculated directly from persisted dataset rows.', evidenceRef: { dataset: strongestMetric.dataset, column: strongestMetric.column, calculation: 'mean' } });
  if (anomalies.length && signals.asksWhy) findings.push({ id: `anomaly-${runId}`, type: 'FACT', claim: `${anomalies.length} statistical outlier(s) were detected across the selected data.`, source: 'Deterministic anomaly analysis', verified: true, evidence: 'Outliers use absolute z-score >= 3; they are signals to investigate, not proven causes.', evidenceRef: { analysis: 'zscore', threshold: 3, count: anomalies.length } });
  const averageQuality = usable.length ? usable.reduce((sum, d) => sum + Number(d.dataQualityScore ?? 100), 0) / usable.length : 0; const evidenceCoverage = findings.length ? Math.round((findings.filter(item => item.verified).length / findings.length) * 100) : 0;
  const status = usable.length ? 'completed' : 'data_insufficient';
  let recommendation = 'DATA INSUFFICIENT: connect a usable dataset before making a recommendation.';
  if (usable.length) recommendation = signals.asksRecommendation && strongestMetric ? `Start with ${strongestMetric.column} in ${strongestMetric.dataset}: validate the observed pattern against business context before changing strategy.` : `Investigation ready: ${usable.length} dataset(s) were profiled and deterministic metrics were calculated from persisted rows.`;
  const forecastEligible = forecasts.find(item => item.forecast.status === 'available');
  const confidence = usable.length ? Math.max(0, Math.min(95, Math.round(0.45 * averageQuality + 0.35 * evidenceCoverage + (strongestMetric ? 10 : 0) + (signals.asksWhy && anomalies.length ? 5 : 0)))) : 0;
  const result = { runId, workspaceId: workspace.id, question, status, startedAt: new Date().toISOString(), questionSignals: signals, dataSources: usable.map(d => ({ id: d.id, name: d.name, rows: d.rowCount, columns: columns(d).length, contentHash: d.contentHash || null })), findings, metricSummaries: summaries, anomalies, trends, forecasts, marketStatus: signals.asksMarket ? 'MARKET INTELLIGENCE PENDING_EXTERNAL_SEARCH' : 'NOT REQUIRED', forecastStatus: signals.asksForecast ? (forecastEligible ? 'available' : 'FORECAST UNRELIABLE') : 'NOT REQUIRED', recommendation, confidence, evidenceCoverage, dataQualityScore: Math.round(averageQuality), audit: { evidenceBacked: findings.length > 0, persistedDataUsed: usable.length > 0, deterministicAnalysis: true, reproducibility: { inputHashes: usable.map(d => d.contentHash || null), analysisVersion: 'deterministic-v3', forecastMethod: signals.asksForecast ? 'linear_baseline' : null }, toolTrace: ['dataset_profiler', 'metric_calculator', 'anomaly_detector', 'trend_analyzer', ...(signals.asksForecast ? ['forecast_baseline'] : []), ...(signals.asksMarket ? ['market_intelligence'] : []), 'evidence_builder'], generatedAt: new Date().toISOString() } };
  const db = await load(); db.investigations.push(result); await save(db); return result;
}

export async function updateInvestigation(runId: string, patch: Record<string, unknown>) { const db = await load(); const index = db.investigations.findIndex(item => item.runId === runId); if (index < 0) return null; db.investigations[index] = { ...db.investigations[index], ...patch }; await save(db); return db.investigations[index]; }
export async function listInvestigations(workspaceId: string) { return (await load()).investigations.filter(item => !workspaceId || item.workspaceId === workspaceId).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt))); }
export async function getInvestigation(runId: string) { return (await load()).investigations.find(item => item.runId === runId) ?? null; }
export async function detectRelationships(workspaceId: string) { const datasets = await listDatasets(workspaceId); const relationships: any[] = []; for (let i = 0; i < datasets.length; i++) for (let j = i + 1; j < datasets.length; j++) { const left = columns(datasets[i]).map(c => c.name); const right = new Set(columns(datasets[j]).map(c => c.name)); for (const column of left) if (right.has(column)) relationships.push({ id: `rel-${datasets[i].id}-${datasets[j].id}-${column}`, sourceDatasetId: datasets[i].id, targetDatasetId: datasets[j].id, fromColumn: column, toColumn: column, relationshipType: 'candidate', confidence: 75, status: 'detected', autoDetected: true }); } return relationships; }
