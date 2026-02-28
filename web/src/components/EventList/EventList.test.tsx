import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import EventList from "./EventList";
import type { Event } from "../../types/event";

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "1",
    title: "Test Event",
    description: "Description",
    category: "kultur",
    startDate: "2025-06-15T18:00:00Z",
    source: "Source",
    collectedAt: "2025-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("EventList", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows spinner when loading", () => {
    render(<EventList events={[]} loading={true} error={null} />);
    expect(screen.getByLabelText("Laster arrangementer")).toBeInTheDocument();
  });

  it("shows error alert when error is set", () => {
    render(<EventList events={[]} loading={false} error="Network error" />);
    expect(screen.getByText(/Kunne ikke laste data/)).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it("shows upcoming events", () => {
    const upcomingEvent = createEvent({
      id: "1",
      title: "Future Event",
      startDate: "2025-06-20T10:00:00Z",
    });

    render(<EventList events={[upcomingEvent]} loading={false} error={null} />);
    expect(screen.getByText("Future Event")).toBeInTheDocument();
  });

  it("shows 'Ingen kommende arrangementer' when no upcoming events", () => {
    const pastEvent = createEvent({
      id: "1",
      title: "Past Event",
      startDate: "2025-05-01T10:00:00Z",
    });

    render(<EventList events={[pastEvent]} loading={false} error={null} />);
    expect(screen.getByText(/Ingen kommende arrangementer/)).toBeInTheDocument();
  });

  it("does not show past events", () => {
    const events = [
      createEvent({ id: "1", title: "Past Event", startDate: "2025-05-01T10:00:00Z" }),
      createEvent({ id: "2", title: "Future Event", startDate: "2025-07-01T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);
    expect(screen.getByText("Future Event")).toBeInTheDocument();
    expect(screen.queryByText("Past Event")).not.toBeInTheDocument();
  });
});
