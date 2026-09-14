# CorporateBaddie API

The backend is the persistent data and investigation layer behind the existing React UI.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
copy .env.example .env
npm run dev:full
```

On macOS/Linux, use `cp .env.example .env` instead.

Frontend: `http://localhost:3000`
API: `http://localhost:4000`

The app works in deterministic mode without provider keys. Add your own `XAI_API_KEY`, `GEMINI_API_KEY`, and/or `ZAI_API_KEY` to `.env` to enable the LLM reasoning layer. `.env` is intentionally ignored by Git; never commit provider secrets.

## Provider configuration

```env
LLM_PRIMARY=grok
LLM_TIMEOUT_MS=30000
XAI_API_KEY=
XAI_MODEL=grok-4.6
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
ZAI_API_KEY=
ZAI_MODEL=glm-5
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
```

The API tries the selected primary provider first and falls back to the other configured providers if a request fails. Market questions can use Grok web search when Grok is the provider.

## Data flow

```text
Browser
  -> Vite /api proxy
  -> Express API
  -> workspace store
  -> dataset ingestion
  -> persisted JSONL table
  -> deterministic analytics
  -> LLM reasoning (optional)
  -> evidence-backed investigation record
```

Uploaded CSV/XLS/XLSX files are parsed on the server. Their rows are persisted under `server/data/tables/`, while workspace, dataset metadata, hashes, and investigation history are stored in `server/data/corporatebaddie.json`.

## Endpoints

- `GET /api/health`
- `GET /api/ready`
- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/:workspaceId`
- `PATCH /api/workspaces/:workspaceId`
- `GET /api/workspaces/:workspaceId/datasets`
- `POST /api/workspaces/:workspaceId/datasets/upload`
- `GET /api/workspaces/:workspaceId/relationships`
- `GET /api/datasets/:datasetId`
- `DELETE /api/datasets/:datasetId`
- `POST /api/investigations`
- `GET /api/investigations?workspaceId=...`
- `GET /api/investigations/:runId`
- `GET /api/investigations/:runId/evidence`
- `GET /api/investigations/:runId/audit`
- `POST /api/ask`

## Product rules preserved

- No recommendation without usable evidence.
- Market research is explicitly unavailable when no external connector is active.
- Forecasts are withheld when historical depth is insufficient.
- Uploaded data gets a SHA-256 content signature.
- Investigation history is persisted.
- Dataset relationships are detected as candidates rather than asserted as proven joins.
- The backend performs deterministic calculations; an LLM should reason over those outputs rather than invent calculations.
- Provider failures do not erase deterministic investigation results.
