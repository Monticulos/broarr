import { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import EventList from "./components/EventList/EventList";
import EventModal from "./components/EventModal/EventModal";
import type { Event, EventsData } from "./types/event";
import styles from "./App.module.css";

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch("data/events.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<EventsData>;
      })
      .then((data) => {
        setUpdatedAt(data.updatedAt);
        setEvents(data.events);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header updatedAt={updatedAt} />
      <main className={styles.main}>
        <EventList
          events={events}
          loading={loading}
          error={error}
          onEventClick={setSelectedEvent}
        />
      </main>
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}
