import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createWorkspace, getWorkspace, listWorkspaces, updateWorkspace, addDataset, getDataset, listDatasets, deleteDataset, runInvestigation, listInvestigations, getInvestigation, detectRelationships } from './store.js';
import { ingestFile } from './ingest.js';
import { askLLM } from './llm.js';

const app = express();
const PORT = Number(process.env.API_PORT || 4000);
const upload = multer({
  dest: path.resolve(process.env.DATA_DIR || './server/data', 'tmp'),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(csv|xlsx|xls)$/i.test(file.originalname);
    cb(null, allowed);
  },
});

app.use(express.json({ limit: '2mb' }));
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (res.req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'corporatebaddie-api', timestamp: new Date().toISOString(), providers: { grok: Boolean(process.env.XAI_API_KEY), gemini: Boolean(process.env.GEMINI_API_KEY), primary: process.env.LLM_PRIMARY || 'grok' } }));

app.get('/api/workspaces', async (_req, res, next) => { try { res.json({ workspaces: await listWorkspaces() }); } catch (error) { next(error); } });
app.post('/api/workspaces', async (req, res, next) => {
  try {
    const { name, industry, country, region, currency, description, objective, kpis } = req.body ?? {};
    if (!name || !industry || !country || !currency) return res.status(400).json({ error: 'name, industry, country and currency are required' });
    res.status(201).json({ workspace: await createWorkspace({ name, industry, country, region, currency, description, objective, kpis }) });
  } catch (error) { next(error); }
});
app.get('/api/workspaces/:workspaceId', async (req, res, next) => {
  try {
    const workspace = await getWorkspace(req.params.workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ workspace, datasets: await listDatasets(workspace.id) });
  } catch (error) { next(error); }
});
app.patch('/api/workspaces/:workspaceId', async (req, res, next) => {
  try {
    const workspace = await updateWorkspace(req.params.workspaceId, req.body ?? {});
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ workspace });
  } catch (error) { next(error); }
});

app.get('/api/workspaces/:workspaceId/datasets', async (req, res, next) => { try { res.json({ datasets: await listDatasets(req.params.workspaceId) }); } catch (error) { next(error); } });
app.post('/api/workspaces/:workspaceId/datasets/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required and must be CSV/XLSX/XLS' });
    const workspace = await getWorkspace(req.params.workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    const dataset = await ingestFile(workspace, req.file, randomUUID());
    await addDataset(dataset);
    res.status(201).json({ dataset });
  } catch (error) { next(error); }
});
app.get('/api/workspaces/:workspaceId/relationships', async (req, res, next) => { try { res.json({ relationships: await detectRelationships(req.params.workspaceId) }); } catch (error) { next(error); } });
app.get('/api/datasets/:datasetId', async (req, res, next) => {
  try { const dataset = await getDataset(req.params.datasetId); if (!dataset) return res.status(404).json({ error: 'Dataset not found' }); res.json({ dataset }); } catch (error) { next(error); }
});
app.delete('/api/datasets/:datasetId', async (req, res, next) => {
  try { const deleted = await deleteDataset(req.params.datasetId); if (!deleted) return res.status(404).json({ error: 'Dataset not found' }); res.status(204).send(); } catch (error) { next(error); }
});

app.post('/api/investigations', async (req, res, next) => {
  try {
    const { workspaceId, question, datasetIds } = req.body ?? {};
    if (!workspaceId || !question?.trim()) return res.status(400).json({ error: 'workspaceId and question are required' });
    const workspace = await getWorkspace(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    const result = await runInvestigation(workspace, question.trim(), datasetIds);
    if (result.status === 'data_insufficient') return res.status(201).json(result);

    const llmPrompt = `You are CorporateBaddie, an evidence-first business decision intelligence agent.\n\nYou must NOT invent facts. Distinguish FACT, INFERENCE, FORECAST, and RECOMMENDATION.\n\nBusiness question:\n${question.trim()}\n\nWorkspace:\n${JSON.stringify(workspace, null, 2)}\n\nVerified internal-data findings:\n${JSON.stringify(result.findings, null, 2)}\n\nCalculated metrics:\n${JSON.stringify(result.metricSummaries, null, 2)}\n\nCurrent investigation status: ${result.status}\nMarket status: ${result.marketStatus}\nForecast status: ${result.forecastStatus}\n\nRules:\n1. Use only supplied internal evidence for internal-data claims.\n2. Do not claim causation unless established.\n3. Do not invent missing metrics.\n4. If evidence is insufficient, say so.\n5. Give a practical recommendation only when evidence supports one.\n6. Mention important uncertainty.\n7. Keep the recommendation concise and executive-friendly.\n\nReturn JSON only: {\"summary\":\"short answer\",\"why\":[\"evidence-backed reason\"],\"recommendation\":\"recommended action\",\"alternatives\":[\"alternative action\"],\"risks\":[\"important risk\"],\"assumptions\":[\"important assumption\"],\"confidence\":0,\"claimType\":\"RECOMMENDATION\"}`;
    let reasoning: Awaited<ReturnType<typeof askLLM>> | null = null;
    try { reasoning = await askLLM({ system: 'You are the reasoning layer of CorporateBaddie. Evidence over eloquence. Never fabricate business facts.', prompt: llmPrompt, useWebSearch: Boolean(result.questionSignals?.asksMarket) }); }
    catch (error) { console.warn('LLM reasoning unavailable:', error); }

    const enriched = {
      ...result,
      ai: reasoning ? { provider: reasoning.provider, model: reasoning.model, response: reasoning.text, sources: reasoning.sources, grounded: true } : { provider: null, model: null, response: null, sources: [], grounded: false },
      audit: { ...result.audit, llmUsed: Boolean(reasoning), llmProvider: reasoning?.provider || null, externalSources: reasoning?.sources?.length || 0 },
    };
    res.status(201).json(enriched);
  } catch (error) { next(error); }
});

app.get('/api/investigations', async (req, res, next) => { try { res.json({ investigations: await listInvestigations(String(req.query.workspaceId || '')) }); } catch (error) { next(error); } });
app.get('/api/investigations/:runId', async (req, res, next) => { try { const result = await getInvestigation(req.params.runId); if (!result) return res.status(404).json({ error: 'Investigation not found' }); res.json({ investigation: result }); } catch (error) { next(error); } });

app.post('/api/ask', async (req, res, next) => {
  try {
    const { workspaceId, question, runId } = req.body ?? {};
    if (!workspaceId || !question?.trim()) return res.status(400).json({ error: 'workspaceId and question are required' });
    const investigation = runId ? await getInvestigation(runId) : (await listInvestigations(workspaceId))[0];
    if (!investigation) return res.status(404).json({ error: 'No investigation exists for this workspace yet' });
    const response = await askLLM({ system: `You are CorporateBaddie answering a follow-up question about an existing business investigation. Only use the evidence contained in the investigation below. Never invent facts. If the evidence does not answer the question, say that clearly.\n\nInvestigation:\n${JSON.stringify(investigation, null, 2)}`, prompt: question.trim(), useWebSearch: false });
    res.json({ answer: response.text, provider: response.provider, model: response.model, sources: response.sources, runId: investigation.runId });
  } catch (error) { next(error); }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Internal server error';
  const status = message.includes('Only CSV') || message.includes('File too large') ? 400 : 500;
  res.status(status).json({ error: message });
});

await mkdir(path.resolve(process.env.DATA_DIR || './server/data'), { recursive: true });
app.listen(PORT, () => console.log(`CorporateBaddie API listening on http://localhost:${PORT}`));
