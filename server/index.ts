import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createWorkspace, getWorkspace, listWorkspaces, updateWorkspace, addDataset, getDataset, listDatasets, deleteDataset, runInvestigation, listInvestigations, getInvestigation, detectRelationships, updateInvestigation } from './store.js';
import { ingestFile } from './ingest.js';
import { askLLM } from './llm.js';

const app = express();
const PORT = Number(process.env.API_PORT || 4000);
const upload = multer({
  dest: path.resolve(process.env.DATA_DIR || './server/data', 'tmp'),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /\.(csv|xlsx|xls)$/i.test(file.originalname)),
});

app.use(express.json({ limit: '2mb' }));
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (res.req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function cleanQuestion(value: unknown) {
  const question = typeof value === 'string' ? value.trim() : '';
  if (!question) throw new Error('question is required');
  if (question.length > 4000) throw new Error('question must be 4000 characters or fewer');
  return question;
}

function parseReasoning(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(cleaned.slice(start, end + 1));
    if (!value || typeof value !== 'object') return null;
    const asStrings = (input: unknown) => Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string').slice(0, 8) : [];
    const confidence = Number(value.confidence);
    return {
      summary: typeof value.summary === 'string' ? value.summary.slice(0, 2000) : '',
      why: asStrings(value.why),
      recommendation: typeof value.recommendation === 'string' ? value.recommendation.slice(0, 2000) : '',
      alternatives: asStrings(value.alternatives),
      risks: asStrings(value.risks),
      assumptions: asStrings(value.assumptions),
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(100, Math.round(confidence))) : null,
      claimType: value.claimType === 'RECOMMENDATION' ? 'RECOMMENDATION' : 'INFERENCE',
    };
  } catch { return null; }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'corporatebaddie-api', timestamp: new Date().toISOString(), providers: { grok: Boolean(process.env.XAI_API_KEY), gemini: Boolean(process.env.GEMINI_API_KEY), primary: process.env.LLM_PRIMARY || 'grok' }, version: 'api-v3' }));
app.get('/api/workspaces', async (_req, res, next) => { try { res.json({ workspaces: await listWorkspaces() }); } catch (error) { next(error); } });
app.post('/api/workspaces', async (req, res, next) => { try { const { name, industry, country, region, currency, description, objective, kpis } = req.body ?? {}; if (!name || !industry || !country || !currency) return res.status(400).json({ error: 'name, industry, country and currency are required' }); res.status(201).json({ workspace: await createWorkspace({ name, industry, country, region, currency, description, objective, kpis }) }); } catch (error) { next(error); } });
app.get('/api/workspaces/:workspaceId', async (req, res, next) => { try { const workspace = await getWorkspace(req.params.workspaceId); if (!workspace) return res.status(404).json({ error: 'Workspace not found' }); res.json({ workspace, datasets: await listDatasets(workspace.id) }); } catch (error) { next(error); } });
app.patch('/api/workspaces/:workspaceId', async (req, res, next) => { try { const workspace = await updateWorkspace(req.params.workspaceId, req.body ?? {}); if (!workspace) return res.status(404).json({ error: 'Workspace not found' }); res.json({ workspace }); } catch (error) { next(error); } });
app.get('/api/workspaces/:workspaceId/datasets', async (req, res, next) => { try { res.json({ datasets: await listDatasets(req.params.workspaceId) }); } catch (error) { next(error); } });
app.post('/api/workspaces/:workspaceId/datasets/upload', upload.single('file'), async (req, res, next) => { try { if (!req.file) return res.status(400).json({ error: 'file is required and must be CSV/XLSX/XLS' }); const workspace = await getWorkspace(req.params.workspaceId); if (!workspace) return res.status(404).json({ error: 'Workspace not found' }); const dataset = await ingestFile(workspace, req.file, randomUUID()); await addDataset(dataset); res.status(201).json({ dataset }); } catch (error) { next(error); } });
app.get('/api/workspaces/:workspaceId/relationships', async (req, res, next) => { try { res.json({ relationships: await detectRelationships(req.params.workspaceId) }); } catch (error) { next(error); } });
app.get('/api/datasets/:datasetId', async (req, res, next) => { try { const dataset = await getDataset(req.params.datasetId); if (!dataset) return res.status(404).json({ error: 'Dataset not found' }); res.json({ dataset }); } catch (error) { next(error); } });
app.delete('/api/datasets/:datasetId', async (req, res, next) => { try { const deleted = await deleteDataset(req.params.datasetId); if (!deleted) return res.status(404).json({ error: 'Dataset not found' }); res.status(204).send(); } catch (error) { next(error); } });

app.post('/api/investigations', async (req, res, next) => {
  try {
    const { workspaceId, datasetIds } = req.body ?? {};
    const question = cleanQuestion(req.body?.question);
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required' });
    const workspace = await getWorkspace(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    const result = await runInvestigation(workspace, question, Array.isArray(datasetIds) ? datasetIds : undefined);
    if (result.status === 'data_insufficient') return res.status(201).json(result);

    const llmPrompt = `You are CorporateBaddie, an evidence-first business decision intelligence agent.\n\nBusiness question:\n${question}\n\nWorkspace context:\n${JSON.stringify(workspace, null, 2)}\n\nVerified internal findings:\n${JSON.stringify(result.findings, null, 2)}\n\nCalculated metrics:\n${JSON.stringify(result.metricSummaries, null, 2)}\n\nAnomalies:\n${JSON.stringify(result.anomalies, null, 2)}\n\nTrends:\n${JSON.stringify(result.trends, null, 2)}\n\nForecasts:\n${JSON.stringify(result.forecasts, null, 2)}\n\nData quality: ${result.dataQualityScore}%\nEvidence coverage: ${result.evidenceCoverage}%\nMarket status: ${result.marketStatus}\nForecast status: ${result.forecastStatus}\n\nRules:\n- Use only supplied internal evidence for internal-data claims.\n- Never invent a number, company fact, cause, market signal, or forecast.\n- Correlation or an outlier is not proof of causation.\n- Treat anomalies as investigation signals, not causes.\n- If the evidence cannot support a recommendation, say that clearly and recommend the next evidence needed.\n- Keep uncertainty visible.\n- A recommendation is decision support, not autonomous execution.\n\nReturn JSON only with this exact shape:\n{"summary":"short answer","why":["evidence-backed reason"],"recommendation":"recommended action or evidence needed","alternatives":["alternative action"],"risks":["important risk"],"assumptions":["important assumption"],"confidence":0,"claimType":"RECOMMENDATION"}`;
    let reasoning: Awaited<ReturnType<typeof askLLM>> | null = null;
    let parsed: ReturnType<typeof parseReasoning> = null;
    try {
      reasoning = await askLLM({ system: 'You are the reasoning layer of CorporateBaddie. Evidence over eloquence. Never fabricate business facts.', prompt: llmPrompt, useWebSearch: Boolean(result.questionSignals?.asksMarket) });
      parsed = parseReasoning(reasoning.text);
    } catch (error) { console.warn('LLM reasoning unavailable:', error instanceof Error ? error.message : error); }

    const marketAvailable = Boolean(reasoning?.sources?.length);
    const ai = reasoning ? { provider: reasoning.provider, model: reasoning.model, response: reasoning.text, parsed, sources: reasoning.sources, grounded: Boolean(parsed && result.findings.length > 0) } : { provider: null, model: null, response: null, parsed: null, sources: [], grounded: false };
    const enriched = {
      ...result,
      ai,
      recommendation: parsed?.recommendation || result.recommendation,
      confidence: parsed?.confidence === null || parsed?.confidence === undefined ? result.confidence : Math.min(result.confidence, parsed.confidence),
      marketStatus: result.questionSignals?.asksMarket ? (marketAvailable ? 'available' : 'MARKET INTELLIGENCE UNAVAILABLE') : result.marketStatus,
      audit: { ...result.audit, llmUsed: Boolean(reasoning), llmProvider: reasoning?.provider || null, llmStructured: Boolean(parsed), externalSources: reasoning?.sources?.length || 0, evidenceCoverage: result.evidenceCoverage, dataQualityScore: result.dataQualityScore },
    };
    await updateInvestigation(result.runId, { ai: enriched.ai, recommendation: enriched.recommendation, confidence: enriched.confidence, marketStatus: enriched.marketStatus, audit: enriched.audit });
    res.status(201).json(enriched);
  } catch (error) { next(error); }
});

app.get('/api/investigations', async (req, res, next) => { try { res.json({ investigations: await listInvestigations(String(req.query.workspaceId || '')) }); } catch (error) { next(error); } });
app.get('/api/investigations/:runId', async (req, res, next) => { try { const result = await getInvestigation(req.params.runId); if (!result) return res.status(404).json({ error: 'Investigation not found' }); res.json({ investigation: result }); } catch (error) { next(error); } });
app.get('/api/investigations/:runId/evidence', async (req, res, next) => { try { const result = await getInvestigation(req.params.runId); if (!result) return res.status(404).json({ error: 'Investigation not found' }); res.json({ runId: result.runId, claims: result.findings || [], anomalies: result.anomalies || [], trends: result.trends || [], forecasts: result.forecasts || [], sources: result.ai?.sources || [], audit: result.audit || {}, dataQualityScore: result.dataQualityScore ?? null, evidenceCoverage: result.evidenceCoverage ?? null }); } catch (error) { next(error); } });
app.get('/api/investigations/:runId/audit', async (req, res, next) => { try { const result = await getInvestigation(req.params.runId); if (!result) return res.status(404).json({ error: 'Investigation not found' }); res.json({ runId: result.runId, audit: result.audit || {}, dataSources: result.dataSources || [], questionSignals: result.questionSignals || {}, status: result.status }); } catch (error) { next(error); } });
app.post('/api/ask', async (req, res, next) => {
  try {
    const { workspaceId, runId } = req.body ?? {};
    const question = cleanQuestion(req.body?.question);
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required' });
    const investigation = runId ? await getInvestigation(runId) : (await listInvestigations(workspaceId))[0];
    if (!investigation) return res.status(404).json({ error: 'No investigation exists for this workspace yet' });
    const response = await askLLM({ system: `You are CorporateBaddie answering a follow-up question about an existing business investigation. Only use the evidence contained in the investigation below. Never invent facts. If the evidence does not answer the question, say that clearly.\n\nInvestigation:\n${JSON.stringify(investigation, null, 2)}`, prompt: question, useWebSearch: false });
    res.json({ answer: response.text, provider: response.provider, model: response.model, sources: response.sources, runId: investigation.runId, grounded: true });
  } catch (error) { next(error); }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Internal server error';
  const status = message.includes('required') || message.includes('4000 characters') || message.includes('Only CSV') || message.includes('File too large') ? 400 : 500;
  res.status(status).json({ error: message });
});

await mkdir(path.resolve(process.env.DATA_DIR || './server/data'), { recursive: true });
app.listen(PORT, () => console.log(`CorporateBaddie API listening on http://localhost:${PORT}`));
