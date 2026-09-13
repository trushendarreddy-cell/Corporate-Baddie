# Development Guide

## Local Setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Start the app with `npm run dev`.
4. Run `npm run lint` before committing.
5. Run `npm run build` before pushing a release or large change.

## Main Flow

The investigation flow is centered in `src/state/investigationEngine.ts`.

- The question is classified first.
- Tools are selected from the investigation requirements.
- Each plan node records its reason, required input, and sufficiency check.
- The run state is recalculated from the selected sources and generated evidence.
- `src/state/confidenceEngine.ts` calculates Decision Confidence from that current state.

Do not use private chain-of-thought in the UI. Show short execution messages, tool status, evidence status, and concise reasons instead.

## Confidence Rules

Decision Confidence is an evidence sufficiency score, not a statistical probability. Its inputs and weights are defined in `src/state/confidenceEngine.ts`.

When required evidence is missing, conflicting, or below the minimum threshold, the result must be `DATA INSUFFICIENT`. Do not replace missing evidence with mock values.

## UI Changes

Keep the existing dark dashboard and amber accent style. When adding a new state value, connect it to the relevant display, export, and version-history paths. Avoid showing a successful tool result when the underlying run did not produce it.

## Validation

Use these commands after changes:

```powershell
npm run lint
npm run build
```

For user-facing changes, also open the local app and test both a normal run and a run with a required data source disabled.