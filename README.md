# BroArr

A local events aggregator for Brønnøysund, Norway. A LangChain + Mistral AI collector gathers upcoming events from local websites and publishes them as a React frontend on GitHub Pages.

---

## Tech stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Digdir Designsystemet |
| Collector | LangChain, LangGraph, Mistral AI, Puppeteer, Cheerio |
| Testing | Vitest, React Testing Library |
| CI/CD | GitHub Actions, GitHub Pages |

---

## Repo structure

```
broarr/
├── types/
│   └── event.ts              # Shared Event + EventsData TypeScript interfaces
├── web/                      # React + Vite frontend (deployed to GitHub Pages)
│   ├── public/data/
│   │   └── events.json       # Generated event data consumed by the frontend
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── EventList.tsx
│           ├── EventCard.tsx
│           ├── EventModal.tsx
│           ├── Header.tsx
│           └── CategoryBadge.tsx
├── collector/                # Node.js LangChain agent
│   ├── src/
│   │   ├── index.ts          # Entry point + CLI arg handling
│   │   ├── agent.ts          # LangChain ReAct agent setup
│   │   ├── sources.ts        # Target URLs with optional CSS selectors
│   │   └── tools/
│   │       ├── fetchPage.ts
│   │       ├── extractEvents.ts
│   │       └── writeEvents.ts
│   └── COLLECTING-GUIDE.md   # Full guide for running and extending the collector
└── .github/workflows/
    └── deploy.yml            # GitHub Actions: build + deploy on push to main
```

---

## Running the frontend locally

```bash
cd web
npm install
npm run dev
```

The site is served at `http://localhost:5173`.

---

## Running the collector

See [collector/COLLECTING-GUIDE.md](collector/COLLECTING-GUIDE.md) for full instructions.

```bash
cd collector
cp .env.example .env   # add your MISTRAL_API_KEY
npx tsx src/index.ts   # collect all sources and update events.json
```

---

## Deployment

Push to `main` — GitHub Actions builds the Vite app and deploys it to GitHub Pages automatically. The live site URL is shown in the repository's **Environments** tab.
