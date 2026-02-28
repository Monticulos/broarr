import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readFileSync, writeFileSync, renameSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import type { Event, EventsData } from "../types.js";
import { flushEvents } from "../eventBuffer.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const eventsJsonPath = resolve(currentDir, "../../../web/public/data/events.json");

export function deduplicationKey(event: Event): string {
  return `${event.title}|${event.startDate}|${event.source}`;
}

export function isExpired(event: Event): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(event.startDate) < thirtyDaysAgo;
}

function readEventsFile(): EventsData {
  try {
    const raw = readFileSync(eventsJsonPath, "utf-8");
    return JSON.parse(raw) as EventsData;
  } catch {
    return { updatedAt: new Date().toISOString(), events: [] };
  }
}

export const writeEvents = tool(
  async () => {
    const newEvents: Event[] = flushEvents();
    const existingData: EventsData = readEventsFile();

    const existingKeys = new Set(existingData.events.map(deduplicationKey));
    let addedCount = 0;
    let skippedCount = 0;

    for (const event of newEvents) {
      const key = deduplicationKey(event);
      if (existingKeys.has(key)) {
        skippedCount++;
      } else {
        existingData.events.push(event);
        existingKeys.add(key);
        addedCount++;
      }
    }

    const removedCount = existingData.events.filter(isExpired).length;
    existingData.events = existingData.events.filter((event) => !isExpired(event));
    existingData.events.sort((a, b) => a.startDate.localeCompare(b.startDate));
    existingData.updatedAt = new Date().toISOString();

    const tempPath = `${eventsJsonPath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(existingData, null, 2), "utf-8");
    renameSync(tempPath, eventsJsonPath);

    return `Added ${addedCount}, skipped ${skippedCount} duplicates, removed ${removedCount} expired.`;
  },
  {
    name: "writeEvents",
    description:
      "Flush all staged events to events.json, deduplicating and removing expired entries. Call after extractEvents.",
    schema: z.object({}),
  }
);
