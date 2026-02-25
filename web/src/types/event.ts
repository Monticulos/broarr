export interface Event {
  id: string;
  title: string;
  description: string;
  category: "kultur" | "sport" | "næringsliv" | "kommunalt" | "annet";
  startDate: string;   // ISO 8601
  endDate?: string;
  location?: string;
  url?: string;
  source: string;
  scrapedAt: string;   // ISO 8601
}

export interface EventsData {
  updatedAt: string;
  events: Event[];
}
