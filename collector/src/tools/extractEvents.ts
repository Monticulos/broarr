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

const SYSTEM_PROMPT = `You are an event extraction assistant for a local Norwegian events aggregator covering Brønnøysund, Norway.

Extract structured events from the provided webpage text. Follow these rules strictly:
1. Only extract events that have a clear, specific date mentioned.
2. If no events are found, return an empty events array — never hallucinate data.
3. Set collectedAt to the current ISO timestamp when you are called.
4. Generate an id as a kebab-case slug: <source-domain>-<title-slug>-<YYYY-MM-DD>.
5. Map event types to one of these categories: kultur, sport, næringsliv, kommunalt, annet.
6. Set source to the domain name of the source URL (e.g. 'bronnoy.kommune.no').
7. Dates must be in ISO 8601 format. If only a date is given without time, use T00:00:00.`;

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
