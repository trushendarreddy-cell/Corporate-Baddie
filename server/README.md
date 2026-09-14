# CorporateBaddie API

The backend is the persistent data and investigation layer behind the existing React UI.

## Run locally

```bash
npm install
npm run api
```

Or run frontend and API together:

```bash
npm run dev:full
```

Frontend: `http://localhost:3000`
API: `http://localhost:4000`

## Data flow

```text
Browser
  -> Vite /api proxy
  -> Express API
  -> workspace store
  -> dataset ingestion
  -> persisted JSONL table
  -> deterministic analytics
  -> investigation record
```

Uploaded CSV/XLS/XLSX files are parsed on the server. Their rows are persisted under `server/data/tables/`, while workspace, dataset metadata, hashes, and investigation history are stored in `server/data/corporatebaddie.json`.

## Endpoints

- `GET /api/health`
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
- `POST /api/ask`

## Product rules preserved

- No recommendation without usable evidence.
- Market research is explicitly unavailable when no external connector is active.
- Forecasts are withheld when historical depth is insufficient.
- Uploaded data gets a SHA-256 content signature.
- Investigation history is persisted.
- Dataset relationships are detected as candidates rather than asserted as proven joins.
- The backend performs deterministic calculations; an LLM should reason over those outputs rather than invent calculations.
