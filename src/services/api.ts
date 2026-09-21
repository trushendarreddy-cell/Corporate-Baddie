function resolveApiBase(): string {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) {
      // @ts-ignore
      return String(import.meta.env.VITE_API_URL);
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process?.env?.VITE_API_URL) {
      return String(process.env.VITE_API_URL);
    }
  } catch {}
  return '';
}

const API_BASE = resolveApiBase();
const REQUEST_TIMEOUT_MS = 45000;

const setTimer = (fn: () => void, ms: number) => {
  if (typeof globalThis.setTimeout === 'function') {
    return globalThis.setTimeout(fn, ms);
  }
  return setTimeout(fn, ms);
};

const clearTimer = (id: ReturnType<typeof setTimeout> | number | undefined) => {
  if (id === undefined) return;
  if (typeof globalThis.clearTimeout === 'function') {
    globalThis.clearTimeout(id as any);
  } else {
    clearTimeout(id as any);
  }
};

type ApiErrorBody = { error?: string; requestId?: string };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimer(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: { Accept: 'application/json', ...(init.headers || {}) },
    });
    const text = await response.text();
    const body = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() as ApiErrorBody & T : {} as ApiErrorBody & T;
    if (!response.ok) {
      const detail = body.error || `API request failed: ${response.status}`;
      throw new Error(body.requestId ? `${detail} (request ${body.requestId})` : detail);
    }
    return body as T;
  } catch (error: any) {
    if ((error instanceof DOMException && error.name === 'AbortError') || error?.name === 'AbortError') {
      throw new Error('The API request timed out. Check that the CorporateBaddie backend is running.');
    }
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the CorporateBaddie API. Start the backend with npm run api.');
    }
    throw error;
  } finally {
    clearTimer(timeout);
  }
}

export type ApiWorkspace = {
  id: string; name: string; industry: string; country: string; region?: string; currency: string;
  description?: string; objective?: string; kpis?: string[]; createdAt: string; updatedAt: string;
};

export type ApiDataset = {
  id: string; workspaceId: string; name: string; status: string; rowCount: number;
  schema?: { columns?: Array<Record<string, unknown>> }; dataQualityScore?: number; contentHash?: string;
  source?: { type?: string; size?: number; hash?: string }; createdAt: string; updatedAt: string;
};

export type ApiInvestigation = {
  runId: string; workspaceId: string; question: string; status: string;
  dataSources: Array<{ id: string; name: string; rows: number; columns: number; contentHash?: string | null }>;
  findings: Array<Record<string, unknown>>; metricSummaries: Array<Record<string, unknown>>;
  anomalies?: Array<Record<string, unknown>>; trends?: Array<Record<string, unknown>>; forecasts?: Array<Record<string, unknown>>;
  marketStatus: string; forecastStatus: string; recommendation: string; confidence: number;
  evidenceCoverage?: number; dataQualityScore?: number;
  ai?: { provider: string | null; model: string | null; response: string | null; parsed?: Record<string, unknown> | null; sources: Array<Record<string, unknown>>; grounded: boolean };
  audit: Record<string, unknown>;
};

export const api = {
  health: () => request<{ ok: boolean; service: string; timestamp: string; providers?: Record<string, unknown>; version?: string }>('/api/health'),
  workspaces: () => request<{ workspaces: ApiWorkspace[] }>('/api/workspaces'),
  createWorkspace: (input: Record<string, unknown>) => request<{ workspace: ApiWorkspace }>('/api/workspaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
  workspace: (id: string) => request<{ workspace: ApiWorkspace; datasets: ApiDataset[] }>(`/api/workspaces/${encodeURIComponent(id)}`),
  updateWorkspace: (id: string, input: Record<string, unknown>) => request<{ workspace: ApiWorkspace }>(`/api/workspaces/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
  datasets: (workspaceId: string) => request<{ datasets: ApiDataset[] }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/datasets`),
  uploadDataset: (workspaceId: string, file: File) => {
    const form = new FormData(); form.append('file', file);
    return request<{ dataset: ApiDataset }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/datasets/upload`, { method: 'POST', body: form });
  },
  deleteDataset: (datasetId: string) => request<undefined>(`/api/datasets/${encodeURIComponent(datasetId)}`, { method: 'DELETE' }),
  relationships: (workspaceId: string) => request<{ relationships: Array<Record<string, unknown>> }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/relationships`),
  investigate: (workspaceId: string, question: string, datasetIds?: string[]) => request<ApiInvestigation>('/api/investigations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, question, datasetIds }) }),
  investigations: (workspaceId: string) => request<{ investigations: ApiInvestigation[] }>(`/api/investigations?workspaceId=${encodeURIComponent(workspaceId)}`),
  investigation: (runId: string) => request<{ investigation: ApiInvestigation }>(`/api/investigations/${encodeURIComponent(runId)}`),
  evidence: (runId: string) => request<{ runId: string; claims: Array<Record<string, unknown>>; anomalies: Array<Record<string, unknown>>; trends: Array<Record<string, unknown>>; forecasts: Array<Record<string, unknown>>; sources: Array<Record<string, unknown>>; audit: Record<string, unknown>; dataQualityScore: number | null; evidenceCoverage: number | null }>(`/api/investigations/${encodeURIComponent(runId)}/evidence`),
  audit: (runId: string) => request<{ runId: string; audit: Record<string, unknown>; dataSources: Array<Record<string, unknown>>; questionSignals: Record<string, unknown>; status: string }>(`/api/investigations/${encodeURIComponent(runId)}/audit`),
  ask: (workspaceId: string, question: string, runId?: string) => request<{ answer: string; provider: string; model: string; sources: Array<Record<string, unknown>>; runId: string; grounded: boolean }>('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, question, runId }) }),
};
