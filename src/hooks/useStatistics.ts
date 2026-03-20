import { useState, useCallback, useEffect } from 'react';

export interface FamilyStatistics {
  totalPeople: number;
  totalMale: number;
  totalFemale: number;
  totalUnknownGender: number;
  generations: number;
  averageLifespan: number;
  earliestBirth: string;
  latestDeath: string;
  marriages: number;
  children: {
    min: number;
    max: number;
    average: number;
  };
  birthYearRange: {
    start: number;
    end: number;
  };
  deathYearRange?: {
    start: number;
    end: number;
  };
}

export interface AgeDistribution {
  age: number;
  count: number;
  percentage: number;
}

export interface GenerationStats {
  generation: number;
  count: number;
  averageAge: number;
  yearRange: { start: number; end: number };
}

interface UseStatisticsOptions {
  personId?: string;
  includeRelatives?: boolean;
}

interface UseStatisticsState {
  stats: FamilyStatistics | null;
  ageDistribution: AgeDistribution[];
  generationStats: GenerationStats[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch comprehensive family statistics
 *
 * @param options - Configuration options
 * @returns State with statistics, age distribution, generation stats, loading, error, and refetch function
 */
export function useStatistics(
  options: UseStatisticsOptions = {}
): UseStatisticsState {
  const {
    personId,
    includeRelatives = true,
  } = options;

  const [stats, setStats] = useState<FamilyStatistics | null>(null);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistribution[]>([]);
  const [generationStats, setGenerationStats] = useState<GenerationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (personId) queryParams.append('personId', personId);
      if (includeRelatives) queryParams.append('includeRelatives', 'true');

      const response = await fetch(`/api/statistics/family?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data.stats);
      setAgeDistribution(data.ageDistribution);
      setGenerationStats(data.generationStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [personId, includeRelatives]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    stats,
    ageDistribution,
    generationStats,
    loading,
    error,
    refetch: fetchStatistics,
  };
}

/**
 * Hook to get gender distribution statistics
 *
 * @param personId - The ID of the person
 * @returns State with gender stats, loading, error
 */
export function useGenderDistribution(personId: string) {
  const [distribution, setDistribution] = useState<{
    male: number;
    female: number;
    unknown: number;
    malePercent: number;
    femalePercent: number;
    unknownPercent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/statistics/gender?personId=${personId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch gender distribution: ${response.statusText}`);
        }

        const data = await response.json();
        setDistribution(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchDistribution();
    }
  }, [personId]);

  return { distribution, loading, error };
}

/**
 * Hook to get occupational statistics
 *
 * @param personId - The ID of the person
 * @returns State with occupational stats, loading, error
 */
export function useOccupationStats(personId: string) {
  const [occupations, setOccupations] = useState<
    Array<{
      name: string;
      count: number;
      percentage: number;
      people: string[];
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/statistics/occupations?personId=${personId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch occupation stats: ${response.statusText}`);
        }

        const data = await response.json();
        setOccupations(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchOccupations();
    }
  }, [personId]);

  return { occupations, loading, error };
}

/**
 * Hook to get birth rate statistics over time
 *
 * @param personId - The ID of the person
 * @returns State with birth rate data, loading, error
 */
export function useBirthRateOverTime(personId: string) {
  const [birthRates, setBirthRates] = useState<
    Array<{
      year: number;
      births: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBirthRates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/statistics/birth-rate?personId=${personId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch birth rate data: ${response.statusText}`);
        }

        const data = await response.json();
        setBirthRates(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchBirthRates();
    }
  }, [personId]);

  return { birthRates, loading, error };
}

/**
 * Utility function to calculate life expectancy from a list of people
 *
 * @param people - Array of person objects with birthDate and deathDate
 * @returns Average lifespan in years
 */
export function calculateAverageLifespan(
  people: Array<{ birthDate?: string; deathDate?: string }>
): number {
  const lifespans = people
    .filter((p) => p.birthDate && p.deathDate)
    .map((p) => {
      const birth = new Date(p.birthDate!).getFullYear();
      const death = new Date(p.deathDate!).getFullYear();
      return death - birth;
    });

  if (lifespans.length === 0) return 0;
  return Math.round(
    lifespans.reduce((a, b) => a + b, 0) / lifespans.length
  );
}
