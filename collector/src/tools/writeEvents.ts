import type { Event } from "../../../types/Event";
import { readEventsFile, writeEventsFile } from "./eventsFile.js";

export async function upsertEvents(newEvents: Event[]): Promise<void> {
  const existingData = readEventsFile();
  const indexById = new Map(existingData.events.map((e, i) => [e.id, i]));

  for (const newEvent of newEvents) {
    const existingIndex = indexById.get(newEvent.id);
    if (existingIndex !== undefined) {
      existingData.events[existingIndex] = newEvent;
    } else {
      existingData.events.push(newEvent);
    }
  }

  existingData.updatedAt = new Date().toISOString();
  writeEventsFile(existingData);
}
