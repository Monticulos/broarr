import { describe, it, expect, beforeEach } from "vitest";
import { pushEvents, flushEvents } from "./eventBuffer.js";
import { createEvent } from "./test/createEvent.js";

describe("eventBuffer", () => {
  beforeEach(() => {
    flushEvents();
  });

  it("stores events retrievable via flushEvents", () => {
    const events = [createEvent({ title: "Concert" })];
    pushEvents(events);

    const flushed = flushEvents();
    expect(flushed).toEqual(events);
  });

  it("accumulates across multiple pushEvents calls", () => {
    pushEvents([createEvent({ title: "Event A" })]);
    pushEvents([createEvent({ title: "Event B" })]);

    const flushed = flushEvents();
    expect(flushed).toHaveLength(2);
    expect(flushed[0].title).toBe("Event A");
    expect(flushed[1].title).toBe("Event B");
  });

  it("clears the buffer after flushing", () => {
    pushEvents([createEvent()]);
    flushEvents();

    const secondFlush = flushEvents();
    expect(secondFlush).toEqual([]);
  });

  it("returns empty array when buffer is empty", () => {
    const flushed = flushEvents();
    expect(flushed).toEqual([]);
  });
});
