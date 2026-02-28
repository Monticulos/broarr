import type { Event } from '../../../types/event';

export const CATEGORY_LABELS: Record<Event['category'], string> = {
  kultur: 'Kultur',
  sport: 'Sport',
  næringsliv: 'Næringsliv',
  kommunalt: 'Kommunalt',
  annet: 'Annet',
};

export const CATEGORY_COLOR_MAP = {
  kultur: 'accent',
  sport: 'brand1',
  næringsliv: 'brand2',
  kommunalt: 'brand2',
  annet: 'neutral',
} as const satisfies Record<Event['category'], string>;