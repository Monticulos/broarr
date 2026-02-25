import { useEffect, useState } from "react";
import type { Event, EventsData } from "../types/event";
import EventCard from "./EventCard";
import styles from "./EventList.module.css";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("data/events.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<EventsData>;
      })
      .then((data) => {
        const sorted = [...data.events].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setEvents(sorted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.status}>Laster arrangementer…</p>;
  if (error)   return <p className={styles.status}>Kunne ikke laste data: {error}</p>;
  if (events.length === 0) return <p className={styles.status}>Ingen arrangementer funnet.</p>;

  return (
    <ul className={styles.list}>
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}
