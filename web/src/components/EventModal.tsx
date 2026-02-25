import { useEffect, useRef } from "react";
import type { Event } from "../types/event";
import CategoryBadge from "./CategoryBadge";
import styles from "./EventModal.module.css";

const FOCUSABLE_SELECTORS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Props {
  event: Event;
  onClose: () => void;
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

export default function EventModal({ event, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const mapsUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Lukk">
          ×
        </button>

        <div className={styles.header}>
          <CategoryBadge category={event.category} />
          <time className={styles.date} dateTime={event.startDate}>
            {formatDate(event.startDate)}
          </time>
        </div>

        <h2 id="modal-title" className={styles.title}>
          {event.title}
        </h2>

        {event.location && (
          <p className={styles.location}>
            📍{" "}
            {mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                {event.location}
              </a>
            ) : (
              event.location
            )}
          </p>
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
            >
              Se original kilde →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
