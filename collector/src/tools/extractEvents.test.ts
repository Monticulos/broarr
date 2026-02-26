import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEvent } from "../test/createEvent.js";

vi.mock("../eventBuffer.js", () => ({
  pushEvents: vi.fn(),
}));

vi.mock("@langchain/mistralai", () => {
  const mockStructuredLlm = {
    invoke: vi.fn().mockResolvedValue({ events: [] }),
  };
  return {
    ChatMistralAI: vi.fn().mockImplementation(() => ({
      withStructuredOutput: vi.fn().mockReturnValue(mockStructuredLlm),
    })),
  };
});

describe("extractEvents tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function invokeExtractEvents(args: { pageText: string; sourceUrl: string }): Promise<string> {
    const { extractEvents } = await import("./extractEvents.js");
    return extractEvents.invoke(args);
  }

  it("pushes extracted events to buffer", async () => {
    const { ChatMistralAI } = await import("@langchain/mistralai");
    const eventBuffer = await import("../eventBuffer.js");

    const mockEvents = [createEvent({ title: "Festival" })];
    vi.mocked(ChatMistralAI).mockImplementation(() => ({
      withStructuredOutput: vi.fn().mockReturnValue({
        invoke: vi.fn().mockResolvedValue({ events: mockEvents }),
      }),
    }) as any);

    await invokeExtractEvents({
      pageText: "Festival on March 15th",
      sourceUrl: "https://example.com/events",
    });

    expect(eventBuffer.pushEvents).toHaveBeenCalledWith(mockEvents);
  });

  it("returns summary with event count", async () => {
    const { ChatMistralAI } = await import("@langchain/mistralai");

    const mockEvents = [createEvent(), createEvent({ title: "Second" })];
    vi.mocked(ChatMistralAI).mockImplementation(() => ({
      withStructuredOutput: vi.fn().mockReturnValue({
        invoke: vi.fn().mockResolvedValue({ events: mockEvents }),
      }),
    }) as any);

    const result = await invokeExtractEvents({
      pageText: "Some page text",
      sourceUrl: "https://example.com",
    });

    expect(result).toContain("2 event(s)");
    expect(result).toContain("example.com");
  });

  it("handles zero events", async () => {
    const { ChatMistralAI } = await import("@langchain/mistralai");

    vi.mocked(ChatMistralAI).mockImplementation(() => ({
      withStructuredOutput: vi.fn().mockReturnValue({
        invoke: vi.fn().mockResolvedValue({ events: [] }),
      }),
    }) as any);

    const result = await invokeExtractEvents({
      pageText: "No events here",
      sourceUrl: "https://example.com",
    });

    expect(result).toContain("0 event(s)");
  });
});
