import { Heading, Paragraph } from '@digdir/designsystemet-react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Heading level={1} data-size="xl" className={styles.title}>
          BroArr
        </Heading>
        <Paragraph className={styles.tagline}>
          Arrangementer i Brønnøy
        </Paragraph>
      </div>
    </header>
  );
}
