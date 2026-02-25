import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <h1 className={styles.title}>iBrønnøy</h1>
        <p className={styles.tagline}>Arrangementer og nyheter i Brønnøy</p>
      </div>
    </header>
  );
}
