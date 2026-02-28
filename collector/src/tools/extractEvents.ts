import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { tool } from "@langchain/core/tools";
import { ChatMistralAI } from "@langchain/mistralai";
import { z } from "zod";
import { pushEvents } from "../eventBuffer.js";

const EventSchema = z.object({
  id: z.string().describe("Unique kebab-case slug: <source-domain>-<title-slug>-<YYYY-MM-DD>"),
  title: z.string(),
  description: z.string(),
  category: z.enum(["kultur", "sport", "næringsliv", "kommunalt", "annet"]),
  startDate: z.string().describe("ISO 8601 datetime, e.g. 2026-03-07T19:00:00"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  url: z.string().optional(),
  source: z.string().describe("Domain name of the source, e.g. 'bronnoy.kommune.no'"),
  collectedAt: z.string().describe("Current ISO 8601 timestamp"),
});

const PROMPTS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "prompts");
const SYSTEM_PROMPT = readFileSync(resolve(PROMPTS_DIR, "extract-events-system.md"), "utf-8");

export const extractEvents = tool(
  async ({ pageText, sourceUrl }) => {
    const llm = new ChatMistralAI({ model: "mistral-small-latest", temperature: 0.1 });
    const structuredLlm = llm.withStructuredOutput(z.object({ events: z.array(EventSchema) }));
    const result = await structuredLlm.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Source URL: ${sourceUrl}\n\nCurrent time: ${new Date().toISOString()}\n\n${pageText}` },
    ]);
    pushEvents(result.events);
    return `Extracted ${result.events.length} event(s) from ${sourceUrl}. Call writeEvents to save them.`;
  },
  {
    name: "extractEvents",
    description:
      "Extract structured events from cleaned webpage text and stage them for saving. Call writeEvents afterwards.",
    schema: z.object({
      pageText: z.string().describe("Cleaned plain text from the webpage"),
      sourceUrl: z.string().describe("The URL the page was fetched from"),
    }),
  }
);
