import { Spinner, Alert } from '@digdir/designsystemet-react';
import type { Event } from '../../types/event';
import EventCard from '../EventCard/EventCard';
import styles from './EventList.module.css';

interface Props {
  events: Event[];
  loading: boolean;
  error: string | null;
  onEventClick: (event: Event) => void;
}

export default function EventList({ events, loading, error, onEventClick }: Props) {
  if (loading) return (
    <div className={styles.statusContainer}>
      <Spinner aria-label="Laster arrangementer" />
    </div>
  );
  if (error) return <Alert data-color="danger">Kunne ikke laste data: {error}</Alert>;

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
        <p className={styles.statusContainer}>Ingen kommende arrangementer.</p>
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
