import "dotenv/config";
import { TARGET_SOURCES } from "./sources.js";
import { deleteSavedEvents } from "./tools/deleteSavedEvents.js";
import { extractEvents } from "./tools/extractEvents.js";
import { formatEvents } from "./tools/formatEvents.js";
import { writeEvents } from "./tools/writeEvents.js";
import { sortEvents } from "./tools/sortEvents.js";
import { deleteExpiredEvents } from "./tools/deleteExpiredEvents.js";
import { readEventsFile } from "./tools/eventsFile.js";

async function main() {
  deleteSavedEvents();
    
  console.log("Starting event collection...");

  for (const source of TARGET_SOURCES) {
    console.log(`Processing: ${source.name}...`);

    const rawText = await extractEvents(source);
    if (!rawText) {
      console.log(`  Skipping ${source.name} — no content extracted.`);
      continue;
    }

    console.log(`  Extracted content from ${source.url}.`)

    const events = await formatEvents(source, rawText);
    await writeEvents(events);

    console.log(`  Formatted and saved ${events.length} event(s).`);
  }

  sortEvents();
  deleteExpiredEvents();

  console.log(`Done! ${readEventsFile().events.length} events saved to file.`);
}

main().catch((error) => {
  console.error("Collection failed:", error);
  process.exit(1);
});
