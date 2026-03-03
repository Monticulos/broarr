import "dotenv/config";
import { TARGET_SOURCES } from "./sources.js";
import { deleteSavedEvents } from "./tools-new/deleteSavedEvents.js";
import { extractEvents } from "./tools-new/extractEvents.js";
import { formatEvents } from "./tools-new/formatEvents.js";
import { writeEvents } from "./tools-new/writeEvents.js";
import { sortEvents } from "./tools-new/sortEvents.js";
import { deleteExpiredEvents } from "./tools-new/deleteExpiredEvents.js";
import { runEditorAgent } from "./tools-new/editorAgent.js";

async function main() {
    
  deleteSavedEvents();
  console.log("Cleared existing events.");
    
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
  console.log("Sorted events by date.");

  const expiredCount = deleteExpiredEvents();
  console.log(expiredCount > 0 ? `Removed ${expiredCount} expired events.` : "No expired events found.");

  console.log("Running editor agent for deduplication...");
  const duplicateCount = await runEditorAgent();
  console.log(duplicateCount > 0 ? `Removed ${duplicateCount} duplicate events.` : "No duplicate events found.");

  console.log("Done!");
}

main().catch((error) => {
  console.error("Collection failed:", error);
  process.exit(1);
});
