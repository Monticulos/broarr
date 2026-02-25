import type { Event } from "../types/event";
import CategoryBadge from "./CategoryBadge";
import styles from "./EventCard.module.css";

interface Props {
  event: Event;
  onClick: () => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function EventCard({ event, onClick }: Props) {
  return (
    <article
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className={styles.meta}>
        <CategoryBadge category={event.category} />
        <time className={styles.date} dateTime={event.startDate}>
          {formatDate(event.startDate)}
        </time>
      </div>

      <h2 className={styles.title}>{event.title}</h2>

      {event.location && (
        <p className={styles.location}>📍 {event.location}</p>
      )}

      <p className={styles.description}>{event.description}</p>

      <div className={styles.footer}>
        <span className={styles.source}>{event.source}</span>
        {event.url && (
          <a
            href={event.url}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Les mer →
          </a>
        )}
      </div>
    </article>
  );
}
