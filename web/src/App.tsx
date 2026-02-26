import { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import EventList from "./components/EventList/EventList";
import type { EventsData } from "./types/event";
import styles from "./App.module.css";

export default function App() {
  const [events, setEvents] = useState<EventsData["events"]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const EVENTS_DATA_URL = "data/events.json";

  useEffect(() => {
    fetch(EVENTS_DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<EventsData>;
      })
      .then((data) => {
        setUpdatedAt(data.updatedAt);
        setEvents(data.events);
      })
      .catch((fetchError: Error) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <EventList
          events={events}
          loading={loading}
          error={error}
        />
      </main>
      <Footer updatedAt={updatedAt} />
    </>
  );
}
