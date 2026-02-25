import { Dialog, Heading, Paragraph, Link } from '@digdir/designsystemet-react';
import type { Event } from '../../types/event';
import CategoryBadge from '../CategoryBadge/CategoryBadge';
import { formatEventDate } from '../../utils/formatDate';
import styles from './EventModal.module.css';

const LOCATION_ICON = '📍';

interface Props {
  event: Event;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: Props) {
  const mapsUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <Dialog
      open
      closedby="any"
      onClose={() => onClose()}
      className={styles.dialog}
    >
      <Dialog.Block className={styles.header}>
        <CategoryBadge category={event.category} />
        <time className={styles.date} dateTime={event.startDate}>
          {formatEventDate(event.startDate)}
        </time>
      </Dialog.Block>

      <Dialog.Block>
        <Heading level={2} data-size="md">
          {event.title}
        </Heading>

        {event.location && (
          <Paragraph data-size="sm">
            {LOCATION_ICON}{' '}
            {mapsUrl ? (
              <Link href={mapsUrl} target="_blank" rel="noopener noreferrer">
                {event.location}
              </Link>
            ) : (
              event.location
            )}
          </Paragraph>
        )}

        <Paragraph data-size="sm">{event.description}</Paragraph>
      </Dialog.Block>

      <Dialog.Block className={styles.footer}>
        <span className={styles.source}>{event.source}</span>
        {event.url && (
          <Link href={event.url} target="_blank" rel="noopener noreferrer">
            Se original kilde →
          </Link>
        )}
      </Dialog.Block>
    </Dialog>
  );
}
