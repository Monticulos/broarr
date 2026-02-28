import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EventCard from "./EventCard";
import type { Event } from "../../types/event";

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "1",
    title: "Test Event",
    description: "A test event description",
    category: "kultur",
    startDate: "2025-06-15T18:00:00Z",
    source: "TestSource",
    scrapedAt: "2025-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("EventCard", () => {
  it("renders title, description and source", () => {
    render(<EventCard event={createEvent()} />);

    expect(screen.getByText("Test Event")).toBeInTheDocument();
    expect(screen.getByText("A test event description")).toBeInTheDocument();
    expect(screen.getByText("TestSource")).toBeInTheDocument();
  });

  it("renders location when provided", () => {
    render(<EventCard event={createEvent({ location: "Brønnøysund" })} />);
    expect(screen.getByText(/Brønnøysund/)).toBeInTheDocument();
  });

  it("does not render location when missing", () => {
    render(<EventCard event={createEvent({ location: undefined })} />);
    expect(screen.queryByText("📍")).not.toBeInTheDocument();
  });

  it("renders link when url is provided", () => {
    render(<EventCard event={createEvent({ url: "https://example.com" })} />);
    const link = screen.getByText("Les mer →");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "https://example.com");
  });

  it("does not render link when url is missing", () => {
    render(<EventCard event={createEvent({ url: undefined })} />);
    expect(screen.queryByText("Les mer →")).not.toBeInTheDocument();
  });
});
