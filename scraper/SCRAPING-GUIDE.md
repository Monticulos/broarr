# Scraping Guide

This document is the primary reference for any LLM session that needs to run or extend the iBrønnøy scraper.

---

## Quick start

```bash
cd scraper
cp .env.example .env          # fill in MISTRAL_API_KEY
npx tsx src/index.ts           # scrape all sources
npx tsx src/index.ts --source <url>   # single source
```

---

## How the agent works

The scraper uses a **ReAct loop** (Reason + Act) powered by LangChain LangGraph and Mistral AI. The agent receives a task prompt listing all source URLs and autonomously decides which tools to call and in what order.

### The three tools

| Tool | Purpose |
|---|---|
| `fetchPage(url, selector?)` | Fetches a URL, strips boilerplate (nav, footer, scripts), and returns up to 8 000 characters of plain text. Falls back to a headless Puppeteer browser for JS-rendered pages. Retries up to 3 times with exponential backoff on network errors. If text is truncated, a `[TEXT TRUNCATED AT 8000 CHARACTERS]` marker is appended. |
| `extractEvents(pageText, sourceUrl)` | Sends the cleaned text to a Mistral model with structured output. Returns an array of validated `Event` objects and stages them in an in-memory buffer. |
| `writeEvents()` | Flushes the buffer to `web/public/data/events.json`. Deduplicates by `title + startDate + source` and removes events older than 30 days. Updates `updatedAt` on the file. |

### Typical agent turn sequence for one source

```
fetchPage("https://example.com", "main")
  → extractEvents(pageText, "https://example.com")
    → writeEvents()
```

### Deduplication and expiry logic (`writeEvents`)

- **Deduplication key:** `title|startDate|source` — if this triple already exists in `events.json`, the event is skipped.
- **Expiry:** events whose `startDate` is more than 30 days in the past are removed on every write.
- **Atomic write:** the file is first written to a `.tmp` path, then renamed, to avoid partial writes.

---

## Adding a new source

1. Open `scraper/src/sources.ts`.
2. Add an entry:
   ```ts
   { url: "https://example.com/events", name: "Display Name", selector: "article" }
   ```
3. Run with `--source <url>` to test:
   ```bash
   npx tsx src/index.ts --source https://example.com/events
   ```
4. Check `web/public/data/events.json` for the extracted events.
5. If results are poor, adjust the `selector` to target a more specific container, or add a note in the source entry for the model.

The `selector` field is optional. When present, Cheerio extracts text only from matching elements instead of the full `<body>`. This reduces noise significantly for pages with complex layouts.

---

## Improving extraction quality

- **Switch to a larger model:** change `model: "mistral-small-latest"` to `"mistral-large-latest"` in `scraper/src/agent.ts` and `scraper/src/tools/extractEvents.ts` for better reasoning on complex pages.
- **Tighten the system prompt:** edit `SYSTEM_PROMPT` in `extractEvents.ts` to add source-specific rules (e.g. "this source always lists events under the heading 'Kalender'").
- **Use a selector:** add a `selector` to the source entry in `sources.ts` to filter the page before it reaches the model.
- **Check terminal output:** the agent logs every tool call and result. Look for `extractEvents` returning 0 events or `FETCH_ERROR` entries.

---

## Data schema reference

```ts
interface Event {
  id: string;          // Unique kebab-case slug: <source-domain>-<title-slug>-<YYYY-MM-DD>
  title: string;
  description: string;
  category: "kultur" | "sport" | "næringsliv" | "kommunalt" | "annet";
  startDate: string;   // ISO 8601, e.g. "2026-03-07T19:00:00"
  endDate?: string;    // ISO 8601, optional
  location?: string;   // Free-text venue name or address
  url?: string;        // Link to the original event page
  source: string;      // Domain name, e.g. "bronnoy.kommune.no"
  scrapedAt: string;   // ISO 8601 timestamp of when extraction ran
}

interface EventsData {
  updatedAt: string;   // ISO 8601 timestamp of the last writeEvents call
  events: Event[];
}
```

Category guidelines for the model:
| Category | Examples |
|---|---|
| `kultur` | concerts, theatre, exhibitions, church services |
| `sport` | matches, races, training open days |
| `næringsliv` | business networking, trade fairs |
| `kommunalt` | town hall meetings, public hearings, council events |
| `annet` | anything that does not fit the above |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Empty array from `extractEvents` | Page behind login or JS-rendered without enough wait time | Try a different URL, add a `selector`, or increase the Puppeteer wait in `fetchPage.ts` |
| Duplicate events keep appearing | `title` or `startDate` differs slightly between runs | Normalise title (trim, lowercase) in the dedup key inside `writeEvents.ts` |
| Agent loops without finishing | Model confused by noisy page structure | Add a `selector` to focus on the relevant section |
| `FETCH_ERROR` on every run | Site blocks automated requests | Try adding a `User-Agent` header in `fetchWithRetry`, or seed events manually |
| Events have wrong category | Model mis-classifies event type | Tighten the system prompt in `extractEvents.ts` with explicit examples |
