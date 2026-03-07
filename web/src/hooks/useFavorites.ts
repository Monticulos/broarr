import { useState, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'broarr-favorites';

function loadFavoriteIds(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored) as string[]);
  } catch {
    return new Set();
  }
}

function saveFavoriteIds(ids: Set<string>): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...ids]));
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(loadFavoriteIds);

  const toggleFavorite = useCallback((eventId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      saveFavoriteIds(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  return { favoriteIds, isFavorite, toggleFavorite };
}
