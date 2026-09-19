# CorporateBaddie Backend API & Agent Bridge

The backend service is the persistent data layer, deterministic analytics engine, and multi-agent reasoning bridge behind the CorporateBaddie executive interface.

---

## 🏛️ System Architecture

```text
Browser Client (React 19)
    │
    ▼ (Vite /api proxy on :3000)
Express REST API (:4000)
    │
    ├── Workspace & Investigation Store (server/store.ts)
    │     ├── Metadata Catalog: server/data/corporatebaddie.json
    │     └── Data Lakehouse: server/data/tables/*.jsonl
    │
    ├── Dataset Ingestion & Profiling (server/ingest.ts)
    │     ├── CSV / XLSX / XLS parsing
    │     └── SHA-256 fingerprinting & schema inference
    │
    ├── Multi-Agent Reasoning Bridge (server/agent_bridge.py)
    │     ├── Subprocess invocation via Python 3.11
    │     └── Planner ➔ Coder ➔ DuckDuckGo Search ➔ Critic ➔ Compiler
    │
    └── Multi-Provider LLM Fallback (server/llm.ts)
          ├── Priority 1: xAI / Grok (with optional live web search)
          ├── Priority 2: Google Gemini 2.5 Flash (@google/genai)
          └── Priority 3: Z.ai GLM-5 (OpenAI-compatible)
```

---

## 🚀 Running the Server

### Requirements
- **Node.js**: v20 or newer
- **Python**: v3.11 or newer (for Analytica-AI agent bridge)

### Setup & Run
From the project root:

```bash
# Install dependencies
npm install

# Setup environment
copy .env.example .env

# Run backend API standalone on :4000
npm run api

# Or run full stack (API + Frontend) concurrently
npm run dev:full
```

- **Frontend URL**: `http://localhost:3000`
- **Backend API URL**: `http://localhost:4000`

---

## ⚙️ Provider Configuration (`.env`)

```env
API_PORT=4000
CORS_ORIGIN=http://localhost:3000
DATA_DIR=./server/data
VITE_API_URL=

# LLM Fallback priority: grok, gemini, or zai
LLM_PRIMARY=grok
LLM_TIMEOUT_MS=30000

# xAI / Grok
XAI_API_KEY=
XAI_MODEL=grok-4.6

# Google Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# Z.ai
ZAI_API_KEY=
ZAI_MODEL=glm-5
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
```

> **Security Note**: Never commit `.env` or paste live API keys into public repositories. `.gitignore` is configured to ignore `.env*` while preserving `.env.example`.

---

## 🤖 Analytica-AI Python Bridge (`agent_bridge.py`)

When an investigation is submitted via `POST /api/investigations`, the server automatically checks if dataset files exist and attempts to invoke `server/agent_bridge.py` via a Python subprocess:

1. **Planner Agent**: Analyzes the business question and workspace context to define quantitative hypotheses.
2. **Coding Agent**: Generates and executes Python/Pandas code against the local JSONL dataset tables to extract empirical metrics and detect anomalies.
3. **DuckDuckGo Research Agent**: Queries live web sources for external market benchmarks and industry comparisons.
4. **Critic Agent**: Cross-verifies code outputs against hypotheses, filtering out ungrounded assertions.
5. **Compiler Agent**: Assembles the findings into structured JSON conforming to CorporateBaddie's investigation schema.

If the Python environment is unavailable or encounters an error, the API automatically falls back to deterministic local metric calculation and the direct TypeScript LLM fallback layer.

---

## 📡 Complete REST API Endpoints

### System & Health
- `GET /api/health` — Returns service status, storage readiness, and active LLM provider configurations.
- `GET /api/ready` — Lightweight readiness probe (returns `{ ready: true }` or `503`).

### Workspaces
- `GET /api/workspaces` — Lists all registered corporate workspaces.
- `POST /api/workspaces` — Creates a workspace (`{ name, industry, country, currency, description, objective, kpis }`).
- `GET /api/workspaces/:workspaceId` — Returns workspace metadata and associated dataset list.
- `PATCH /api/workspaces/:workspaceId` — Updates workspace parameters and objectives.

### Datasets & Ingestion
- `GET /api/workspaces/:workspaceId/datasets` — Retrieves datasets uploaded to a workspace.
- `POST /api/workspaces/:workspaceId/datasets/upload` — Multipart form upload (`file`) accepting CSV, XLSX, or XLS. Profiles columns, types, null counts, and generates a SHA-256 hash.
- `GET /api/workspaces/:workspaceId/relationships` — Analyzes candidate foreign keys and joinable fields across workspace datasets.
- `GET /api/datasets/:datasetId` — Retrieves detailed column profiles, statistics, and sample rows.
- `DELETE /api/datasets/:datasetId` — Deletes dataset metadata and cleans up its stored JSONL records.

### Investigations & Reasoning
- `POST /api/investigations` — Initiates an investigation run for a question. Orchestrates agent bridge, deterministic metric extraction, and LLM reasoning.
- `GET /api/investigations?workspaceId=...` — Returns history of all investigation runs for a workspace.
- `GET /api/investigations/:runId` — Retrieves a specific investigation result including findings, metrics, anomalies, confidence, and audit trail.
- `GET /api/investigations/:runId/evidence` — Returns granular evidence breakdown: claims, anomalies, trends, forecasts, and web sources.
- `GET /api/investigations/:runId/audit` — Returns full audit data: execution traces, data sources, signals, and engine status.
- `POST /api/ask` — Natural language follow-up Q&A grounded strictly in the completed investigation's evidence.

---

## 🔒 Governance & Invariant Rules

1. **No Evidence, No Recommendation**: An investigation with missing or insufficient data returns `data_insufficient` status and withholds definitive recommendations.
2. **Deterministic Data Integrity**: Calculated metrics are computed directly from the source rows before LLM reasoning; models are instructed never to invent numbers.
3. **Transparent Market Status**: If market web search returns no sources, market intelligence is marked `MARKET INTELLIGENCE UNAVAILABLE`.
4. **Failure Resiliency**: Provider outages or timeouts do not crash runs; fallback providers or deterministic summaries are returned safely.
