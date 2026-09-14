const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `API request failed: ${response.status}`);
  return body as T;
}

export type ApiWorkspace = {
  id: string; name: string; industry: string; country: string; region?: string;
  currency: string; description?: string; objective?: string; kpis?: string[];
  createdAt: string; updatedAt: string;
};

export const api = {
  health: () => request<{ ok: boolean; service: string; timestamp: string }>('/api/health'),
  workspaces: () => request<{ workspaces: ApiWorkspace[] }>('/api/workspaces'),
  createWorkspace: (input: Record<string, unknown>) => request<{ workspace: ApiWorkspace }>('/api/workspaces', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  }),
  workspace: (id: string) => request<{ workspace: ApiWorkspace; datasets: unknown[] }>(`/api/workspaces/${id}`),
  updateWorkspace: (id: string, input: Record<string, unknown>) => request<{ workspace: ApiWorkspace }>(`/api/workspaces/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  }),
  datasets: (workspaceId: string) => request<{ datasets: unknown[] }>(`/api/workspaces/${workspaceId}/datasets`),
  uploadDataset: (workspaceId: string, file: File) => {
    const form = new FormData(); form.append('file', file);
    return request<{ dataset: unknown }>(`/api/workspaces/${workspaceId}/datasets/upload`, { method: 'POST', body: form });
  },
  deleteDataset: (datasetId: string) => request<void>(`/api/datasets/${datasetId}`, { method: 'DELETE' }),
  investigate: (workspaceId: string, question: string, datasetIds?: string[]) => request<Record<string, unknown>>('/api/investigations', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, question, datasetIds }),
  }),
};
