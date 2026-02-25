import type { Event } from "../../types/event";
import EventCard from "../EventCard/EventCard";
import styles from "./EventList.module.css";

interface Props {
  events: Event[];
  loading: boolean;
  error: string | null;
  onEventClick: (event: Event) => void;
}

export default function EventList({ events, loading, error, onEventClick }: Props) {
  if (loading) return <p className={styles.status}>Laster arrangementer…</p>;
  if (error) return <p className={styles.status}>Kunne ikke laste data: {error}</p>;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter((e) => new Date(e.startDate) >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const past = events
    .filter((e) => new Date(e.startDate) < now)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div>
      {upcoming.length === 0 ? (
        <p className={styles.status}>Ingen kommende arrangementer.</p>
      ) : (
        <ul className={styles.list}>
          {upcoming.map((event) => (
            <li key={event.id}>
              <EventCard event={event} onClick={() => onEventClick(event)} />
            </li>
          ))}
        </ul>
      )}

      {past.length > 0 && (
        <details className={styles.pastSection}>
          <summary className={styles.pastSummary}>
            Tidligere arrangementer ({past.length})
          </summary>
          <ul className={styles.list}>
            {past.map((event) => (
              <li key={event.id}>
                <EventCard event={event} onClick={() => onEventClick(event)} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
