import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Event } from '../../../types/event';
import { useEventFiltering } from './useEventFiltering';

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: '1',
    title: 'Test Event',
    description: 'Description',
    category: 'kultur',
    startDate: '2025-06-15T18:00:00Z',
    source: 'https://example.com',
    collectedAt: '2025-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('useEventFiltering', () => {
  it('returns all events when no filters are active', () => {
    const events = [
      createEvent({ id: '1', title: 'Event A' }),
      createEvent({ id: '2', title: 'Event B' }),
    ];

    const { result } = renderHook(() => useEventFiltering(events));

    expect(result.current.filteredEvents.map((e) => e.title)).toEqual(['Event A', 'Event B']);
  });

  it('filters by selected category', () => {
    const events = [
      createEvent({ id: '1', title: 'Concert', category: 'kultur' }),
      createEvent({ id: '2', title: 'Football', category: 'sport' }),
    ];

    const { result } = renderHook(() => useEventFiltering(events));

    act(() => {
      result.current.handleToggleCategory('kultur');
    });

    expect(result.current.filteredEvents.map((e) => e.title)).toEqual(['Concert']);
  });

  it('searches title, description, and location', () => {
    const events = [
      createEvent({ id: '1', title: 'Jazz night' }),
      createEvent({ id: '2', title: 'Event B', description: 'Jazz i parken' }),
      createEvent({ id: '3', title: 'Event C', location: 'Jazz club' }),
      createEvent({ id: '4', title: 'Football' }),
    ];

    const { result } = renderHook(() => useEventFiltering(events));

    act(() => {
      result.current.setSearchQuery('jazz');
    });

    expect(result.current.filteredEvents.map((e) => e.title)).toEqual([
      'Jazz night',
      'Event B',
      'Event C',
    ]);
  });

  it('does not match against startDate or source', () => {
    const events = [
      createEvent({
        id: '1',
        title: 'Concert',
        startDate: '2025-06-20T10:00:00Z',
        source: 'https://example.com',
      }),
    ];

    const { result } = renderHook(() => useEventFiltering(events));

    act(() => {
      result.current.setSearchQuery('2025-06-20');
    });
    expect(result.current.filteredEvents).toEqual([]);

    act(() => {
      result.current.setSearchQuery('example.com');
    });
    expect(result.current.filteredEvents).toEqual([]);
  });

  it('combines category and search filters', () => {
    const events = [
      createEvent({ id: '1', title: 'Jazz concert', category: 'kultur' }),
      createEvent({ id: '2', title: 'Jazz festival', category: 'kultur' }),
      createEvent({ id: '3', title: 'Jazz match', category: 'sport' }),
    ];

    const { result } = renderHook(() => useEventFiltering(events));

    act(() => {
      result.current.handleToggleCategory('sport');
      result.current.setSearchQuery('jazz');
    });

    expect(result.current.filteredEvents.map((e) => e.title)).toEqual(['Jazz match']);
  });

  it('computes availableCategories from provided events', () => {
    const events = [
      createEvent({ id: '1', category: 'kultur' }),
      createEvent({ id: '2', category: 'sport' }),
    ];

    const { result } = renderHook(() => useEventFiltering(events));

    expect(result.current.availableCategories).toEqual(['kultur', 'sport']);
  });
});
