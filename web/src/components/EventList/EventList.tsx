import { Spinner, Alert, Heading, Paragraph } from '@digdir/designsystemet-react';
import type { Event } from '../../types/event';
import EventCard from '../EventCard/EventCard';
import { formatMonthHeading } from '../../utils/formatDate';
import styles from './EventList.module.css';

interface Props {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export default function EventList({ events, loading, error }: Props) {
  if (loading) return (
    <div className={styles.statusContainer}>
      <Spinner aria-label="Laster arrangementer" />
    </div>
  );
  if (error) return <Alert data-color="danger">Kunne ikke laste data: {error}</Alert>;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter((event) => new Date(event.startDate) >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const past = events
    .filter((event) => new Date(event.startDate) < now)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const YEAR_MONTH_KEY_LENGTH = 7;

  const groupByMonth = (eventList: Event[]) => {
    const groups: { monthKey: string; events: Event[] }[] = [];
    for (const event of eventList) {
      const monthKey = event.startDate.slice(0, YEAR_MONTH_KEY_LENGTH);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.monthKey === monthKey) {
        lastGroup.events.push(event);
      } else {
        groups.push({ monthKey, events: [event] });
      }
    }
    return groups;
  };

  const renderGroupedList = (eventList: Event[]) => (
    <ul className={styles.list}>
      {groupByMonth(eventList).map(({ monthKey, events: groupEvents }) => (
        <li key={monthKey}>
          <Heading level={2} data-size="sm" className={styles.monthHeading}>
            {formatMonthHeading(groupEvents[0].startDate)}
          </Heading>
          <ul className={styles.list}>
            {groupEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {upcoming.length === 0 ? (
        <Paragraph className={styles.statusContainer}>Ingen kommende arrangementer.</Paragraph>
      ) : (
        renderGroupedList(upcoming)
      )}

      {past.length > 0 && (
        <details className={styles.pastSection}>
          <summary className={styles.pastSummary}>
            Tidligere arrangementer ({past.length})
          </summary>
          {renderGroupedList(past)}
        </details>
      )}
    </div>
  );
}
