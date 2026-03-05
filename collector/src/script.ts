import "dotenv/config";
import { TARGET_SOURCES } from "./sources.js";
import { deleteSavedEvents } from "./tools/deleteSavedEvents.js";
import { extractEvents } from "./tools/extractEvents.js";
import { formatEvents } from "./llm/formatEvents.js";
import { writeEvents } from "./tools/writeEvents.js";
import { sortEvents } from "./tools/sortEvents.js";
import { deleteExpiredEvents } from "./tools/deleteExpiredEvents.js";
import { readEventsFile } from "./tools/eventsFile.js";
import { getValidApifyEvents } from "./api/fetchApifyEvents.js";
import { mapApifyEventToEvent } from "./api/mapApifyEventToEvent.js";

async function collectManualEvents(): Promise<number> {
  console.log("Starting event collection...");
  let eventCount = 0;

  for (const source of TARGET_SOURCES) {
    console.log(`Processing: ${source.name}...`);

    const rawText = await extractEvents(source);
    if (!rawText) {
      console.log(`  Skipping ${source.name} — no content extracted.`);
      continue;
    }

    console.log(`  Extracted content from ${source.url}.`);

    try {
      const events = await formatEvents(source, rawText);
      await writeEvents(events);
      eventCount += events.length;
      console.log(`  Formatted and saved ${events.length} event(s).`);
    } catch (error) {
      console.warn(`  Failed to format events from ${source.name}:`, error);
    }
  }

  return eventCount;
}

async function collectApifyEvents(): Promise<number> {
  console.log("Fetching Apify events...");
  let eventCount = 0;

  const apifyEvents = await getValidApifyEvents();
  for (const apifyEvent of apifyEvents) {
    try {
      const event = await mapApifyEventToEvent(apifyEvent);
      await writeEvents([event]);
      eventCount++;
      console.log(`  Saved Apify event: ${event.title}`);
    } catch (error) {
      console.warn(`  Failed to map Apify event "${apifyEvent.name}":`, error);
    }
  }

  return eventCount;
}

async function main() {
  deleteSavedEvents();

  const manualEventCount = await collectManualEvents();
  const apifyEventCount = await collectApifyEvents();

  sortEvents();
  deleteExpiredEvents();

  if (manualEventCount === 0 || apifyEventCount === 0) {
    throw new Error(
      `Collection incomplete — manual: ${manualEventCount}, apify: ${apifyEventCount}. Events not updated.`
    );
  }

  const savedEventCount = readEventsFile().events.length;
  console.log(`Done! ${savedEventCount} events saved to file.`);
}

main();
