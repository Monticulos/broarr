import { formatUpdatedAtDate } from "../../utils/formatDate";
import styles from "./Header.module.css";

interface Props {
  updatedAt: string | null;
}

export default function Header({ updatedAt }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <h1 className={styles.title}>iBrønnøy</h1>
        <p className={styles.tagline}>Arrangementer i Brønnøy</p>
        {updatedAt && (
          <p className={styles.updated}>Oppdatert {formatUpdatedAtDate(updatedAt)}</p>
        )}
      </div>
    </header>
  );
}
