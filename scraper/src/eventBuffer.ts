import type { Event } from "./types.js";

let buffer: Event[] = [];

export function pushEvents(events: Event[]): void {
  buffer.push(...events);
}

export function flushEvents(): Event[] {
  const flushed = [...buffer];
  buffer = [];
  return flushed;
}
