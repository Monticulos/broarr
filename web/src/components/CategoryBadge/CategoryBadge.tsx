import { Tag } from '@digdir/designsystemet-react';
import type { Event } from '../../types/event';

const LABELS: Record<Event['category'], string> = {
  kultur: 'Kultur',
  sport: 'Sport',
  næringsliv: 'Næringsliv',
  kommunalt: 'Kommunalt',
  annet: 'Annet',
};

const COLOR_MAP = {
  kultur: 'info',
  sport: 'success',
  næringsliv: 'warning',
  kommunalt: 'brand2',
  annet: 'neutral',
} as const;

interface Props {
  category: Event['category'];
}

export default function CategoryBadge({ category }: Props) {
  return (
    <Tag data-color={COLOR_MAP[category]}>
      {LABELS[category]}
    </Tag>
  );
}
