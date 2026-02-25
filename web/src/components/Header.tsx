import styles from "./Header.module.css";

interface Props {
  updatedAt: string | null;
}

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function Header({ updatedAt }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <h1 className={styles.title}>iBrønnøy</h1>
        <p className={styles.tagline}>Arrangementer i Brønnøy</p>
        {updatedAt && (
          <p className={styles.updated}>Oppdatert {formatUpdatedAt(updatedAt)}</p>
        )}
      </div>
    </header>
  );
}
