import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deduplicationKey, isExpired } from "./writeEvents.js";
import { createEvent } from "../test/createEvent.js";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  renameSync: vi.fn(),
}));

vi.mock("../eventBuffer.js", () => ({
  flushEvents: vi.fn().mockReturnValue([]),
}));

describe("deduplicationKey", () => {
  it("returns title|startDate|source format", () => {
    const event = createEvent({
      title: "Concert",
      startDate: "2026-03-15T19:00:00",
      source: "example.com",
    });
    expect(deduplicationKey(event)).toBe("Concert|2026-03-15T19:00:00|example.com");
  });
});

describe("isExpired", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for events more than 30 days ago", () => {
    const oldEvent = createEvent({ startDate: "2026-01-01T00:00:00" });
    expect(isExpired(oldEvent)).toBe(true);
  });

  it("returns false for recent events", () => {
    const recentEvent = createEvent({ startDate: "2026-02-20T00:00:00" });
    expect(isExpired(recentEvent)).toBe(false);
  });

  it("returns false for future events", () => {
    const futureEvent = createEvent({ startDate: "2026-06-01T00:00:00" });
    expect(isExpired(futureEvent)).toBe(false);
  });
});

describe("writeEvents tool", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function invokeWriteEvents(): Promise<string> {
    const { writeEvents } = await import("./writeEvents.js");
    return writeEvents.invoke({});
  }

  it("writes new events and returns summary", async () => {
    const fs = await import("fs");
    const eventBuffer = await import("../eventBuffer.js");

    const newEvent = createEvent({ title: "New Event" });
    vi.mocked(eventBuffer.flushEvents).mockReturnValue([newEvent]);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ updatedAt: "2026-02-27T00:00:00Z", events: [] })
    );

    const result = await invokeWriteEvents();

    expect(result).toContain("Added 1");
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.renameSync).toHaveBeenCalled();
  });

  it("deduplicates events with matching keys", async () => {
    const fs = await import("fs");
    const eventBuffer = await import("../eventBuffer.js");

    const existingEvent = createEvent({ title: "Existing" });
    const duplicateEvent = createEvent({ title: "Existing" });

    vi.mocked(eventBuffer.flushEvents).mockReturnValue([duplicateEvent]);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ updatedAt: "2026-02-27T00:00:00Z", events: [existingEvent] })
    );

    const result = await invokeWriteEvents();
    expect(result).toContain("skipped 1");
  });

  it("removes expired events", async () => {
    const fs = await import("fs");
    const eventBuffer = await import("../eventBuffer.js");

    const expiredEvent = createEvent({ title: "Old", startDate: "2025-12-01T00:00:00" });

    vi.mocked(eventBuffer.flushEvents).mockReturnValue([]);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ updatedAt: "2026-02-27T00:00:00Z", events: [expiredEvent] })
    );

    const result = await invokeWriteEvents();
    expect(result).toContain("removed 1");
  });

  it("sorts events by startDate", async () => {
    const fs = await import("fs");
    const eventBuffer = await import("../eventBuffer.js");

    const laterEvent = createEvent({ title: "Later", startDate: "2026-04-01T00:00:00" });
    const earlierEvent = createEvent({ title: "Earlier", startDate: "2026-03-01T00:00:00" });

    vi.mocked(eventBuffer.flushEvents).mockReturnValue([laterEvent, earlierEvent]);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ updatedAt: "2026-02-27T00:00:00Z", events: [] })
    );

    await invokeWriteEvents();

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls.at(-1);
    const writtenData = JSON.parse(writeCall![1] as string);
    expect(writtenData.events[0].title).toBe("Earlier");
    expect(writtenData.events[1].title).toBe("Later");
  });

  it("uses atomic write with tmp file and rename", async () => {
    const fs = await import("fs");
    const eventBuffer = await import("../eventBuffer.js");

    vi.mocked(eventBuffer.flushEvents).mockReturnValue([]);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ updatedAt: "2026-02-27T00:00:00Z", events: [] })
    );

    await invokeWriteEvents();

    const writePath = vi.mocked(fs.writeFileSync).mock.calls.at(-1)?.[0] as string;
    expect(writePath).toMatch(/\.tmp$/);
    expect(fs.renameSync).toHaveBeenCalled();
  });
});
