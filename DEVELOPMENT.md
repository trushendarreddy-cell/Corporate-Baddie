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

Run the validation suite before every commit:

```powershell
# 1. Type check
npm run lint

# 2. Production build validation
npm run build

# 3. Test production preview
npm run preview
```

Ensure that:
- [x] TypeScript compiles without errors (`tsc --noEmit`).
- [x] Vite builds the production bundle cleanly.
- [x] No sensitive keys or `.env` files are tracked in git.
- [x] New endpoints or state modifications are documented in `README.md` and `server/README.md`.