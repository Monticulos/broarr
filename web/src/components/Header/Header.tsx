import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { formatUpdatedAtDate } from '../../utils/formatDate';
import styles from './Header.module.css';

interface Props {
  updatedAt: string | null;
}

export default function Header({ updatedAt }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Heading level={1} data-size="xl" className={styles.title}>
          BroArr
        </Heading>
        <Paragraph className={styles.tagline}>
          Arrangementer i Brønnøy
        </Paragraph>
        {updatedAt && (
          <Paragraph data-size="sm" className={styles.updated}>
            Oppdatert {formatUpdatedAtDate(updatedAt)}
          </Paragraph>
        )}
      </div>
    </header>
  );
}
