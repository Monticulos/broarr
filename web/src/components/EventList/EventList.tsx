import { useState } from 'react';
import { Spinner, Alert, Heading, Paragraph } from '@digdir/designsystemet-react';
import type { Event } from '../../types/event';
import { CATEGORY_LABELS } from '../../constants/categories';
import EventCard from '../EventCard/EventCard';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import { formatMonthHeading } from '../../utils/formatDate';
import styles from './EventList.module.css';

interface Props {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as Event['category'][];
const YEAR_MONTH_KEY_LENGTH = 7;

function groupByMonth(eventList: Event[]) {
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
}

export default function EventList({ events, loading, error }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<Set<Event['category']>>(new Set());

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

  if (upcoming.length === 0) {
    return <Paragraph className={styles.statusContainer}>Ingen kommende arrangementer.</Paragraph>;
  }

  const availableCategories = CATEGORY_ORDER.filter((category) =>
    upcoming.some((event) => event.category === category)
  );

  const filteredEvents = selectedCategories.size === 0
    ? upcoming
    : upcoming.filter((event) => selectedCategories.has(event.category));

  const handleToggleCategory = (category: Event['category']) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <>
      <CategoryFilter
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
      />
      {filteredEvents.length === 0 ? (
        <Paragraph className={styles.statusContainer}>
          Ingen arrangementer matcher filteret.
        </Paragraph>
      ) : (
        <ul className={styles.list}>
          {groupByMonth(filteredEvents).map(({ monthKey, events: groupEvents }) => (
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
      )}
    </>
  );
}
