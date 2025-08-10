# Personal Multi‑Agent Negotiator

Two LLM agents simulate a negotiation in real time (e.g., landlord vs tenant, employer vs employee). Watch the live back‑and‑forth and export a deal summary at the end.

Highlights:
- Two agents with distinct personas and goals
- Real‑time streaming conversation viewer
- Pluggable LLM providers (OpenAI or Anthropic)
- “Deal summary” export when agreement is reached or on stop

## Tech
- Next.js (pages router) + TypeScript
- Server-Sent Events (SSE) for live updates
- Optional OpenAI / Anthropic SDKs

## Getting Started

1) Prereqs
- Node 18+ (nvm recommended)
- pnpm/yarn/npm

2) Install
- pnpm i
  or
- yarn
  or
- npm i

3) Configure API keys (optional for real LLMs; otherwise a local stub runs)
- Create a `.env.local` in the repo root with any of:
  - OPENAI_API_KEY=...
  - ANTHROPIC_API_KEY=...

4) Run dev
- pnpm dev
  or
- yarn dev
  or
- npm run dev

App runs at http://localhost:3000

## How It Works

- Frontend posts a scenario and agent configs to `/api/negotiation`.
- Backend orchestrates turn‑based dialogue between Agent A and Agent B.
- Responses stream back via SSE and render live in the Chat Viewer.
- When an “agreement” is detected (heuristic or LLM-generated), a deal summary is emitted.

## Directory Structure

- src/
  - pages/
    - index.tsx            UI: scenario form, run control, chat viewer
    - api/
      - negotiation.ts     SSE endpoint driving the negotiation
  - components/
    - ChatViewer.tsx       Live-updating conversation UI
  - lib/
    - orchestrator.ts      Core turn-based multi-agent logic
    - agents.ts            LLM provider wrappers (OpenAI/Anthropic) and a local stub

## Notes

- If no API keys are provided, a simple local stub simulates negotiation so you can demo the UI.
- For hackathon speed, agreement detection is heuristic but can be swapped with an LLM “arbiter”.

## Exporting Deal Summary

When negotiation completes, click “Export Summary” to download a JSON file containing:
- scenario
- agent personas
- transcript
- final agreement (if any)

## License

MIT
