# CorporateBaddie

CorporateBaddie is a React and TypeScript decision intelligence dashboard. It turns a business question into a focused investigation plan, shows the tools selected, checks evidence, and presents a recommendation with audit information.

The current application is a front-end prototype. Its demo datasets and deterministic engines are included for local evaluation. External services and production data connectors are not configured by default.

## Features

- Requirement-based investigation tool selection
- Data quality and evidence status reporting
- Deterministic Decision Confidence calculation
- Evidence and citation inspection
- Scenario and risk review surfaces
- Version history and PDF brief export
- Explicit handling for insufficient or conflicting evidence

## Requirements

- Node.js 20 or newer
- npm

## Run Locally

From the project directory:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## Useful Commands

```powershell
npm run lint    # TypeScript validation
npm run build   # Production build
npm run preview # Preview the production build
```

## Project Structure

- `src/components/` contains the dashboard and modal components.
- `src/state/` contains orchestration, confidence, failure, and investigation logic.
- `src/mockData.ts` contains the local demo data used by the prototype.
- `src/types.ts` contains shared application contracts.
- `src/utils/` contains supporting utilities such as PDF export.

## Development Notes

Read [DEVELOPMENT.md](DEVELOPMENT.md) before changing the investigation flow or confidence model. The confidence value must always be reproducible from the current investigation state. Do not add invented evidence when data is missing.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the change and validation process. See [SECURITY.md](SECURITY.md) for handling credentials and data.

## Author

T. Rushendar Reddy

AI/ML, Hyderabad

Contact: trrushendarreddy
