import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApifyEvent } from "./fetchApifyEvents.js";
import { fetchApifyEvents, getValidApifyEvents } from "./fetchApifyEvents.js";
import { createApifyEvent } from "../test/createApifyEvent.js";

function mockFetchResponse(events: ApifyEvent[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(events) })
  );
}

describe("getValidApifyEvents", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    process.env.APIFY_API_KEY = "test-key";
  });

  it("returns upcoming events", async () => {
    const upcomingEvent = createApifyEvent({ id: "1", isPast: false });
    mockFetchResponse([upcomingEvent]);

    const result = await getValidApifyEvents();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters out past events", async () => {
    const pastEvent = createApifyEvent({ id: "past", isPast: true });
    const upcomingEvent = createApifyEvent({ id: "upcoming", isPast: false });
    mockFetchResponse([pastEvent, upcomingEvent]);

    const result = await getValidApifyEvents();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("upcoming");
  });

  it("returns empty array when all events are past", async () => {
    mockFetchResponse([createApifyEvent({ isPast: true })]);

    const result = await getValidApifyEvents();

    expect(result).toHaveLength(0);
  });
});

describe("fetchApifyEvents", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    process.env.APIFY_API_KEY = "test-key";
  });

  it("throws when APIFY_API_KEY is missing", async () => {
    delete process.env.APIFY_API_KEY;

    await expect(fetchApifyEvents()).rejects.toThrow("APIFY_API_KEY is not set in environment variables.");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, statusText: "Unauthorized" })
    );

    await expect(fetchApifyEvents()).rejects.toThrow("Failed to fetch Apify events: 401 Unauthorized");
  });
});
