import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with no favorites when localStorage is empty', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favoriteIds.size).toBe(0);
  });

  it('toggles event to favorited', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite('event-1'));

    expect(result.current.isFavorite('event-1')).toBe(true);
  });

  it('toggles favorited event back to unfavorited', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite('event-1'));
    act(() => result.current.toggleFavorite('event-1'));

    expect(result.current.isFavorite('event-1')).toBe(false);
  });

  it('persists to localStorage on toggle', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite('event-1'));

    const stored = JSON.parse(localStorage.getItem('broarr-favorites')!);
    expect(stored).toContain('event-1');
  });

  it('loads pre-existing favorites from localStorage on mount', () => {
    localStorage.setItem('broarr-favorites', JSON.stringify(['event-42']));

    const { result } = renderHook(() => useFavorites());

    expect(result.current.isFavorite('event-42')).toBe(true);
  });

  it('handles corrupt localStorage JSON gracefully', () => {
    localStorage.setItem('broarr-favorites', 'not valid json {{');

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favoriteIds.size).toBe(0);
  });
});
