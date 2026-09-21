# CorporateBaddie Development Guide

This document outlines architectural principles, development workflows, testing procedures, and engineering conventions for the **CorporateBaddie** codebase.

---

## 🛠️ Environment & Prerequisites

1. **Node.js**: v20 or newer
2. **npm**: v10 or newer
3. **Python**: v3.11 or newer (for Analytica-AI multi-agent bridge)
4. **Git**: v2.40 or newer

---

## ⚡ Local Setup

```bash
# 1. Install frontend & backend dependencies
npm install

# 2. Configure local environment variables
copy .env.example .env

# 3. Launch full stack concurrently (Backend on :4000, Vite on :3000)
npm run dev:full
```

---

## 🏛️ Core Architectural Flows

### 1. 3D Intro Experience (`src/components/IntroExperience.tsx`)
- Powered by **Three.js** inside a high-performance Canvas element.
- Employs an inner and outer icosahedron wireframe sphere with custom vertex markers, structural beams, and orbiting satellite nodes.
- Manages mouse drag-to-rotate with fluid velocity decay (inertia lerp `0.08` and damping factor `0.95`).
- Transitions smoothly to the workspace onboarding flow upon prompt submission or skip.

### 2. Workspace Onboarding & Ingestion (`src/components/WorkspaceCreationPage.tsx`)
- Guided wizard creating workspace metadata (`name`, `industry`, `currency`, `objectives`, `kpis`).
- Ingests tabular datasets (CSV, XLSX, XLS) through `POST /api/workspaces/:workspaceId/datasets/upload`.
- Ingestion profiles columns, detects data types (numeric, date, text, boolean), identifies missing values, and assigns SHA-256 fingerprint hashes.

### 3. Investigation & Multi-Agent Execution (`src/components/ui/InvestigateModule.tsx`, `server/index.ts`)
- Questions are submitted to `POST /api/investigations`.
- The backend first computes deterministic metrics and identifies anomalies across stored dataset tables.
- If available, `server/agent_bridge.py` invokes the **Analytica-AI** multi-agent pipeline (`Planner`, `Coding`, `DuckDuckGo Search`, `Critic`, `Compiler`).
- If external LLMs are active, the prompt is evaluated through the resilient fallback pipeline (`Grok` ➔ `Gemini` ➔ `Z.ai`).
- Returns structured JSON containing executive summaries, risks, alternatives, evidence citations, and confidence scores.

### 4. Interactive Q&A Assistant (`src/components/AskCorporateBaddie.tsx`)
- Follow-up Q&A executes via `POST /api/ask`.
- The system prompt strictly limits answers to the evidence contained within the active investigation record.
- Fabricating numbers or speculating outside the verified record is explicitly forbidden.

---

## 📐 Invariants & Decision Confidence Model

The Decision Confidence metric is an **evidence sufficiency score**, not a statistical probability:

- **Mathematical Basis**: Derived deterministically in `src/state/confidenceEngine.ts` and `server/store.ts`.
- **Factors**:
  1. Data coverage and sample size sufficiency.
  2. Anomaly density and data variance.
  3. External evidence confirmation (web sources).
  4. Conflicting or missing data dimensions.
- **Rule**: When data is incomplete, conflicting, or missing, the status must report `DATA INSUFFICIENT`. Never invent mock or default evidence to inflate confidence.

---

## 🎨 UI Guidelines & Design System

- **Color Palette**: Dark corporate obsidian palette (`#08090a`, `#0f1115`, `#161920`) accented with sage green (`#8eb397`), subtle amber, and muted cyan.
- **Visual Telemetry**: Keep execution states transparent. Display active tool badges, provider status, data quality scores, and verification timestamps.
- **Accessibility & Responsiveness**: Maintain high color contrast for all typography and data visualizations. Support desktop and tablet resolutions.

---

## 🧪 Verification & Release Workflow

CorporateBaddie includes a comprehensive automated test suite and strict typecheck verification. Always run the validation suite before pushing commits:

```powershell
# 1. Typecheck (Zero-error invariant)
npm run lint

# 2. Run all automated test suites
npm run test:all

# 3. Targeted test suites
npm test                      # Pipeline execution & deterministic data engine
npm run test:confidence       # Evidence sufficiency & degradation weighting
npm run test:failure          # Catastrophic failure profiles & guardrails

# 4. Production bundle build & chunk validation
npm run build

# 5. Local production preview
npm run preview
```

### Automated Test Specifications
- **Execution Pipeline Suite (`scripts/test-execution-engine.ts`)**:
  - Validates deterministic state transitions (`IDLE` ➔ `ANALYTICS_STARTED` ➔ `SYNTHESIS_STARTED` ➔ `COMPLETE`).
  - Verifies workspace-to-legacy data source ID mapping (`demo-src-*` ➔ `src-*`).
  - Confirms multi-provider fallback resilience and hypothesis tree generation.
- **Confidence Engine Suite (`scripts/test-confidence-engine.ts`)**:
  - Asserts bounded evidence confidence scores `[0.0, 1.0]`.
  - Ensures proper degradation penalties when warnings, data conflicts, or missing sources occur.
  - Verifies factor weighting (data coverage, sample size, anomaly density).
- **Failure Engine Suite (`scripts/test-failure-engine.ts`)**:
  - Validates guardrails across all 3 strategic profiles (`opt-1` Safe, `opt-2` Aggressive, `opt-3` Blitz scale).
  - Asserts tolerance thresholds against catastrophic failure modes (burn rate, churn cascade, compliance breaches).

---

## 📦 Production Rollup Chunk Splitting (`vite.config.ts`)

To maintain sub-second load times and prevent massive single-bundle bottlenecks, Rollup manual chunking isolates heavy third-party dependencies:

| Chunk Name | Included Libraries | Rationale |
| :--- | :--- | :--- |
| `vendor-three` | `three` | 3D visual canvas rendering isolated from business logic |
| `vendor-icons` | `lucide-react` | Scalable vector icon system isolated for efficient caching |
| `vendor-react` | `react`, `react-dom` | Core React runtime cacheable across deployments |
| `vendor-docs` | `jspdf`, `html2canvas` | Heavy reporting and PDF generation loaded on-demand |
| `vendor-analytics` | `d3`, `recharts` | Data visualization dependencies |

---

## 🌐 Isomorphic Runtime Architecture (`src/services/api.ts`)

The codebase supports seamless execution across both browser client and Node.js testing environments:
- **Environment Detection**: Safely resolves base URLs and configuration through `import.meta.env` in Vite and falls back gracefully to `process.env` in Node (`tsx`) without triggering `ReferenceError`.
- **Isomorphic Timers**: Uses standard `setTimeout` intervals compatible with DOM and Node timer handles.
- **Resilient Fallback**: If backend API endpoints are unreachable, API calls automatically fall back to deterministic mock generators so UI components remain fully interactive.

---

## 🎮 WebGL Context Loss & GPU Resilience (`DecisionCore3D.tsx`)

3D visualization components subscribe to WebGL canvas lifecycle events:
- Handles `webglcontextlost` by canceling animation frames and displaying a graceful fallback banner.
- Handles `webglcontextrestored` by re-initializing scenes, cameras, materials, and geometries.
- Properly disposes of all geometries, materials, and renderer contexts on unmount to prevent GPU memory leaks.

---

## 📄 Executive Reporting & Audit Export (`src/utils/pdfExport.ts`)

- **High-Resolution Executive PDF**: Formats question hypotheses, decision options, evidence citations, and confidence telemetry into a multi-page executive brief.
- **Structured JSON Export (`exportInvestigationToJSON`)**: Emits complete machine-readable audit trails and run metadata.
- **Audit CSV Export (`exportInvestigationAuditCSV`)**: Conforms to the `AuditEvent` schema (`id`, `timestamp`, `eventName`, `component`, `inputTrigger`, `outputSummary`, `confidenceImpact`) for compliance ingestion.