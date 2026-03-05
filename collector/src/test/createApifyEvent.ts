import type { ApifyEvent } from "../api/fetchApifyEvents.js";

const DEFAULT_APIFY_EVENT: ApifyEvent = {
  id: "1",
  name: "Test Event",
  url: "https://example.com",
  description: "A test event",
  utcStartDate: "2026-03-15T19:00:00Z",
  startTime: "19:00",
  isCanceled: false,
  isPast: false,
  address: "Test Address",
  location: { id: "loc1", name: "Test Venue", latitude: 0, longitude: 0 },
  ticketsInfo: null,
  imageUrl: "https://example.com/image.jpg",
  usersGoing: 0,
  usersInterested: 0,
};

export function createApifyEvent(overrides: Partial<ApifyEvent> = {}): ApifyEvent {
  return { ...DEFAULT_APIFY_EVENT, ...overrides };
}
