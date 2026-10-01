# CorporateBaddie Onboarding & 3D Experience: User Guide

Welcome to **CorporateBaddie**. This guide explains how to navigate the 3D onboarding experience, understand the six dimensions of decision intelligence, and transition seamlessly into your executive workspace.

---

## 1. What You Are Seeing

When you first open CorporateBaddie, you are greeted by an interactive visualization of the platform's decision engine:

- **Central Decision Core**: A multi-layered geodesic sphere representing the analytical engine. The vertex colors transition from sage green at the top (verified decisions) through sky blue (objective data calculations) to terracotta at the base (risk and failure boundaries).
- **Six Orbiting Satellites**: Each satellite node represents a mandatory stage in formulating evidence-backed corporate strategy.
- **Orbital Tracks**: The elliptical rings illustrate continuous, independent data streams feeding into the decision core.

---

## 2. The Six Intelligence Nodes

Rather than producing ungrounded narrative summaries, CorporateBaddie processes corporate questions through six rigorous stages:

1. **DATA**: Your internal business records, transactions, and uploaded datasets (CSV, XLSX, XLS). This is the factual bedrock of every investigation.
2. **ANALYSIS**: Deterministic statistical operations—mean variances, distribution skews, baseline anomalies, and seasonal trends.
3. **MARKET**: Real-time external intelligence gathered from web research connectors, providing macro trends, competitor signals, and industry benchmarks.
4. **EVIDENCE**: Quantitative claims backed by strict mathematical verification and source citations.
5. **RISK**: Pre-mortem failure analysis, downside sensitivity tests, and regulatory compliance constraints.
6. **DECISION**: Defensible executive recommendations complete with trade-offs, resource allocations, and falsification boundaries.

---

## 3. How to Interact

### Mouse & Trackpad
- **Rotate the Core**: Click and drag anywhere in the 3D viewport to inspect the sphere and orbital rings from any angle. When released, rotation continues with natural momentum.
- **Inspect Nodes**: Hover your cursor over any orbiting satellite node to highlight its path, enlarge its badge, and open its detailed investigative scope card.
- **Lock Selection**: Click a node to keep its summary open. Click anywhere outside or press `Escape` to dismiss.

### Touchscreens (Mobile & Tablet)
- **Swipe**: Drag with one finger to rotate the 3D core.
- **Tap**: Tap any node badge to display its information card below the canvas.

### Keyboard Shortcuts & Accessibility
- **Tab**: Cycles focus through interactive elements (`Skip Intro`, example prompt, node badges, and `Enter Decision Intelligence`).
- **Enter / Space**: Activates the currently focused button or node.
- **Escape**: Clears any active node selection card.
- **Reduced Motion**: If your operating system has *Reduce Motion* enabled, all continuous spinning and orbital rotations pause automatically, and transitions use a gentle fade.

---

## 4. Entering the Workspace

When you are ready to explore your datasets and launch strategic investigations:

- **"ENTER DECISION INTELLIGENCE"**: Launches a cinematic 1.2-second convergence sequence where the six orbital streams consolidate into the decision core before opening your workspace.
- **"SKIP INTRO"**: Immediately opens the executive dashboard with a fast 300ms transition.

Your completion status is remembered in your browser session, so you will proceed directly to your workspace on future visits.

---

## 5. What Happens Next

Inside the main CorporateBaddie workspace, you can:
- **Create Workspaces**: Organize investigations by company, business unit, or strategic initiative.
- **Upload Datasets**: Ingest operational tables with automated schema profiling and SHA-256 fingerprinting.
- **Launch Investigations**: Pose complex strategic questions and watch the multi-agent pipeline decompose, analyze, and synthesize evidence.
- **Consult AskCorporateBaddie**: Ask follow-up questions strictly confined to verified findings.
- **Export Executive Briefs**: Download publication-ready PDFs or structured CSV/JSON audit logs for board presentations and governance records.

---

## 6. How to Replay the Intro

If you want to view the 3D onboarding experience again:
1. Open your browser's Developer Tools (`F12` or `Cmd+Option+I`).
2. Navigate to the **Console** tab.
3. Execute:
   ```javascript
   sessionStorage.removeItem('corporatebaddie:intro-completed');
   ```
4. Refresh the page.
