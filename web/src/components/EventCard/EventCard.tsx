import { Card, Heading, Paragraph, Link } from '@digdir/designsystemet-react';
import type { Event } from '../../types/event';
import CategoryBadge from '../CategoryBadge/CategoryBadge';
import { formatEventDate } from '../../utils/formatDate';
import styles from './EventCard.module.css';

const LOCATION_ICON = '📍';

interface Props {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: Props) {
  return (
    <Card
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <Card.Block>
        <div className={styles.meta}>
          <CategoryBadge category={event.category} />
          <time className={styles.date} dateTime={event.startDate}>
            {formatEventDate(event.startDate)}
          </time>
        </div>

        <Heading level={2} data-size="sm">
          {event.title}
        </Heading>

        {event.location && (
          <Paragraph data-size="sm">
            {LOCATION_ICON} {event.location}
          </Paragraph>
        )}

        <Paragraph data-size="sm">
          {event.description}
        </Paragraph>
      </Card.Block>

      <Card.Block className={styles.footer}>
        <span className={styles.source}>{event.source}</span>
        {event.url && (
          <Link
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Les mer →
          </Link>
        )}
      </Card.Block>
    </Card>
  );
}
