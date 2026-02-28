import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("shows all events when no category filter is selected", () => {
    const events = [
      createEvent({ id: "1", title: "Concert", category: "kultur", startDate: "2025-06-20T10:00:00Z" }),
      createEvent({ id: "2", title: "Football", category: "sport", startDate: "2025-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);
    expect(screen.getByText("Concert")).toBeInTheDocument();
    expect(screen.getByText("Football")).toBeInTheDocument();
  });

  it("does not show filter chips in loading state", () => {
    render(<EventList events={[]} loading={true} error={null} />);
    expect(screen.queryByRole("group", { name: "Filter" })).not.toBeInTheDocument();
  });

  it("does not show filter chips when no upcoming events", () => {
    const pastEvent = createEvent({
      id: "1",
      title: "Past Event",
      startDate: "2025-05-01T10:00:00Z",
    });

    render(<EventList events={[pastEvent]} loading={false} error={null} />);
    expect(screen.queryByRole("group", { name: "Filter" })).not.toBeInTheDocument();
  });
});

describe("EventList category filtering", () => {
  function createFutureEvent(overrides: Partial<Event> = {}): Event {
    return createEvent({ startDate: "2099-06-20T10:00:00Z", ...overrides });
  }

  it("filters events when a category chip is clicked", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Concert", category: "kultur" }),
      createFutureEvent({ id: "2", title: "Football", category: "sport", startDate: "2099-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.click(screen.getByRole("checkbox", { name: "Kultur" }));

    expect(screen.getByText("Concert")).toBeInTheDocument();
    expect(screen.queryByText("Football")).not.toBeInTheDocument();
  });

  it("shows only matching events when a different chip is clicked", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Concert", category: "kultur" }),
      createFutureEvent({ id: "2", title: "Football", category: "sport", startDate: "2099-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.click(screen.getByRole("checkbox", { name: "Sport" }));

    expect(screen.getByText("Football")).toBeInTheDocument();
    expect(screen.queryByText("Concert")).not.toBeInTheDocument();
  });

  it("deselecting all chips shows all events again", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Concert", category: "kultur" }),
      createFutureEvent({ id: "2", title: "Football", category: "sport", startDate: "2099-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.click(screen.getByRole("checkbox", { name: "Kultur" }));
    expect(screen.queryByText("Football")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Kultur" }));
    expect(screen.getByText("Concert")).toBeInTheDocument();
    expect(screen.getByText("Football")).toBeInTheDocument();
  });
});

describe("EventList search filtering", () => {
  function createFutureEvent(overrides: Partial<Event> = {}): Event {
    return createEvent({ startDate: "2099-06-20T10:00:00Z", ...overrides });
  }

  it("filters events by title", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Konsert i kulturhuset" }),
      createFutureEvent({ id: "2", title: "Fotballkamp", startDate: "2099-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.type(screen.getByRole("searchbox"), "konsert");

    expect(screen.getByText("Konsert i kulturhuset")).toBeInTheDocument();
    expect(screen.queryByText("Fotballkamp")).not.toBeInTheDocument();
  });

  it("filters events by description", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Event A", description: "Jazz i parken" }),
      createFutureEvent({ id: "2", title: "Event B", description: "Håndball", startDate: "2099-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.type(screen.getByRole("searchbox"), "jazz");

    expect(screen.getByText("Event A")).toBeInTheDocument();
    expect(screen.queryByText("Event B")).not.toBeInTheDocument();
  });

  it("filters events by location", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Event A", location: "Brønnøy kulturhus" }),
      createFutureEvent({ id: "2", title: "Event B", location: "Salhus arena", startDate: "2099-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.type(screen.getByRole("searchbox"), "salhus");

    expect(screen.getByText("Event B")).toBeInTheDocument();
    expect(screen.queryByText("Event A")).not.toBeInTheDocument();
  });

  it("shows no-results message when search matches nothing", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Konsert" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.type(screen.getByRole("searchbox"), "finnes ikke");

    expect(screen.getByText(/Ingen arrangementer funnet/)).toBeInTheDocument();
  });

  it("shows all events when search is cleared", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Konsert" }),
      createFutureEvent({ id: "2", title: "Fotballkamp", startDate: "2099-06-21T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.type(screen.getByRole("searchbox"), "konsert");
    expect(screen.queryByText("Fotballkamp")).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    expect(screen.getByText("Konsert")).toBeInTheDocument();
    expect(screen.getByText("Fotballkamp")).toBeInTheDocument();
  });

  it("combines search with category filter", async () => {
    const user = userEvent.setup();
    const events = [
      createFutureEvent({ id: "1", title: "Jazzkonsert", category: "kultur" }),
      createFutureEvent({ id: "2", title: "Jazzfestival", category: "annet", startDate: "2099-06-21T10:00:00Z" }),
      createFutureEvent({ id: "3", title: "Fotballkamp", category: "sport", startDate: "2099-06-22T10:00:00Z" }),
    ];

    render(<EventList events={events} loading={false} error={null} />);

    await user.click(screen.getByRole("checkbox", { name: "Kultur" }));
    await user.type(screen.getByRole("searchbox"), "jazz");

    expect(screen.getByText("Jazzkonsert")).toBeInTheDocument();
    expect(screen.queryByText("Jazzfestival")).not.toBeInTheDocument();
    expect(screen.queryByText("Fotballkamp")).not.toBeInTheDocument();
  });
});
