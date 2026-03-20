import { useState, useCallback, useEffect } from 'react';

export interface LocationData {
  id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  births: number;
  deaths: number;
  marriages: number;
  people: string[];
}

export interface GeoclusterPoint {
  lat: number;
  lng: number;
  count: number;
  locations: LocationData[];
}

interface UseGeographicDataOptions {
  personId?: string;
  includeRelatives?: boolean;
  eventType?: 'births' | 'deaths' | 'marriages' | 'all';
}

interface UseGeographicDataState {
  locations: LocationData[];
  clusters: GeoclusterPoint[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch geographic distribution data for a family
 *
 * @param options - Configuration options
 * @returns State with locations, clusters, loading, error, and refetch function
 */
export function useGeographicData(
  options: UseGeographicDataOptions = {}
): UseGeographicDataState {
  const {
    personId,
    includeRelatives = true,
    eventType = 'all',
  } = options;

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [clusters, setClusters] = useState<GeoclusterPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGeographicData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (personId) queryParams.append('personId', personId);
      if (includeRelatives) queryParams.append('includeRelatives', 'true');
      queryParams.append('eventType', eventType);

      const response = await fetch(`/api/geographic/locations?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch geographic data: ${response.statusText}`);
      }

      const geoData = await response.json();
      setLocations(geoData.locations);
      setClusters(geoData.clusters);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [personId, includeRelatives, eventType]);

  useEffect(() => {
    fetchGeographicData();
  }, [fetchGeographicData]);

  return {
    locations,
    clusters,
    loading,
    error,
    refetch: fetchGeographicData,
  };
}

/**
 * Hook to get migration routes within the family
 *
 * @param personId - The ID of the person
 * @returns State with migration routes, loading, error
 */
export function useMigrationRoutes(personId: string) {
  const [routes, setRoutes] = useState<Array<{
    from: string;
    to: string;
    count: number;
    years: number[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/geographic/migration-routes?personId=${personId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch migration routes: ${response.statusText}`);
        }

        const data = await response.json();
        setRoutes(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchRoutes();
    }
  }, [personId]);

  return { routes, loading, error };
}

/**
 * Hook to get geographic statistics
 *
 * @param personId - The ID of the person
 * @returns State with geographic stats, loading, error
 */
export function useGeographicStats(personId: string) {
  const [stats, setStats] = useState<{
    totalLocations: number;
    mostCommon: LocationData | null;
    countries: Array<{ name: string; count: number }>;
    birthLocations: string[];
    deathLocations: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/geographic/stats?personId=${personId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch geographic stats: ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchStats();
    }
  }, [personId]);

  return { stats, loading, error };
}

/**
 * Utility function to calculate distance between two coordinates
 * Using Haversine formula
 *
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
