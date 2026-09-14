const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `API request failed: ${response.status}`);
  return body as T;
}

export type ApiWorkspace = {
  id: string;
  name: string;
  industry: string;
  country: string;
  region?: string;
  currency: string;
  description?: string;
  objective?: string;
  kpis?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ApiDataset = {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  rowCount: number;
  schema?: { columns?: Array<Record<string, unknown>> };
  dataQualityScore?: number;
  contentHash?: string;
  source?: { type?: string; size?: number; hash?: string };
  createdAt: string;
  updatedAt: string;
};

export type ApiInvestigation = {
  runId: string;
  workspaceId: string;
  question: string;
  status: string;
  dataSources: Array<{ id: string; name: string; rows: number; columns: number }>;
  findings: Array<Record<string, unknown>>;
  metricSummaries: Array<Record<string, unknown>>;
  marketStatus: string;
  forecastStatus: string;
  recommendation: string;
  confidence: number;
  ai?: { provider: string | null; model: string | null; response: string | null; sources: Array<Record<string, unknown>>; grounded: boolean };
  audit: Record<string, unknown>;
};

export const api = {
  health: () => request<{ ok: boolean; service: string; timestamp: string; providers?: Record<string, unknown> }>('/api/health'),

  workspaces: () => request<{ workspaces: ApiWorkspace[] }>('/api/workspaces'),

  createWorkspace: (input: Record<string, unknown>) => request<{ workspace: ApiWorkspace }>('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }),

  workspace: (id: string) => request<{ workspace: ApiWorkspace; datasets: ApiDataset[] }>(`/api/workspaces/${encodeURIComponent(id)}`),

  updateWorkspace: (id: string, input: Record<string, unknown>) => request<{ workspace: ApiWorkspace }>(`/api/workspaces/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }),

  datasets: (workspaceId: string) => request<{ datasets: ApiDataset[] }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/datasets`),

  uploadDataset: (workspaceId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ dataset: ApiDataset }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/datasets/upload`, {
      method: 'POST',
      body: form,
    });
  },

  deleteDataset: (datasetId: string) => request<void>(`/api/datasets/${encodeURIComponent(datasetId)}`, { method: 'DELETE' }),

  relationships: (workspaceId: string) => request<{ relationships: Array<Record<string, unknown>> }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/relationships`),

  investigate: (workspaceId: string, question: string, datasetIds?: string[]) => request<ApiInvestigation>('/api/investigations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, question, datasetIds }),
  }),

  investigations: (workspaceId: string) => request<{ investigations: ApiInvestigation[] }>(`/api/investigations?workspaceId=${encodeURIComponent(workspaceId)}`),

  investigation: (runId: string) => request<{ investigation: ApiInvestigation }>(`/api/investigations/${encodeURIComponent(runId)}`),

  ask: (workspaceId: string, question: string, runId?: string) => request<{ answer: string; provider: string; model: string; sources: Array<Record<string, unknown>>; runId: string }>('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, question, runId }),
  }),
};
