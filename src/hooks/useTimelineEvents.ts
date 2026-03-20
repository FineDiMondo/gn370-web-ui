import { useState, useCallback, useEffect } from 'react';

export type EventType = 'birth' | 'marriage' | 'death' | 'custom';

export interface TimelineEvent {
  id: string;
  personId: string;
  personName: string;
  date: string;
  year: number;
  month: number;
  day: number;
  type: EventType;
  title: string;
  description?: string;
  location?: string;
  sources?: string[];
}

interface UseTimelineEventsOptions {
  personId?: string;
  includeRelatives?: boolean;
  startYear?: number;
  endYear?: number;
}

interface UseTimelineEventsState {
  events: TimelineEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch timeline events for a person or their family
 *
 * @param options - Configuration options
 * @returns State with events, loading, error, and refetch function
 */
export function useTimelineEvents(
  options: UseTimelineEventsOptions = {}
): UseTimelineEventsState {
  const {
    personId,
    includeRelatives = true,
    startYear,
    endYear,
  } = options;

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimelineEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (personId) queryParams.append('personId', personId);
      if (includeRelatives) queryParams.append('includeRelatives', 'true');
      if (startYear) queryParams.append('startYear', startYear.toString());
      if (endYear) queryParams.append('endYear', endYear.toString());

      const response = await fetch(`/api/timeline/events?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch timeline events: ${response.statusText}`);
      }

      const timelineData: TimelineEvent[] = await response.json();
      // Sort by date (earliest first)
      const sorted = timelineData.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
      setEvents(sorted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [personId, includeRelatives, startYear, endYear]);

  useEffect(() => {
    fetchTimelineEvents();
  }, [fetchTimelineEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchTimelineEvents,
  };
}

/**
 * Hook to get events of a specific type
 *
 * @param personId - The ID of the person
 * @param eventType - Type of event to fetch
 * @returns State with filtered events, loading, error
 */
export function useEventsByType(
  personId: string,
  eventType: EventType
) {
  const { events, loading, error, refetch } = useTimelineEvents({ personId });

  const filteredEvents = events.filter((e) => e.type === eventType);

  return { events: filteredEvents, loading, error, refetch };
}

/**
 * Hook to get significant dates in family history
 *
 * @param personId - The ID of the person
 * @returns State with significant dates, loading, error
 */
export function useFamilyMilestones(personId: string) {
  const [milestones, setMilestones] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/timeline/milestones?personId=${personId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch milestones: ${response.statusText}`);
        }

        const data: TimelineEvent[] = await response.json();
        setMilestones(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchMilestones();
    }
  }, [personId]);

  return { milestones, loading, error };
}

/**
 * Utility function to format a TimelineEvent for display
 *
 * @param event - The event to format
 * @returns Formatted event string
 */
export function formatTimelineEvent(event: TimelineEvent): string {
  const dateStr = new Date(event.date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `${event.title} - ${dateStr}${event.location ? ` (${event.location})` : ''}`;
}
