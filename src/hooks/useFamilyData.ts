import { useState, useCallback, useEffect } from 'react';

export interface Person {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  occupation?: string;
  gender?: 'M' | 'F' | 'U';
  parents?: Person[];
  children?: Person[];
  spouse?: Person;
  siblings?: Person[];
  notes?: string;
  sources?: string[];
}

export interface FamilyTreeData {
  people: Person[];
  rootPerson?: Person;
  totalPeople: number;
  generations: number;
}

interface UseFamilyDataOptions {
  personId?: string;
  includeRelatives?: boolean;
  maxDepth?: number;
}

interface UseFamilyDataState {
  data: FamilyTreeData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage family tree data
 *
 * @param options - Configuration options
 * @returns State with data, loading, error, and refetch function
 *
 * @example
 * const { data, loading, error } = useFamilyData({ personId: 'p1' });
 * if (loading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * return <FamilyTree data={data} />;
 */
export function useFamilyData(options: UseFamilyDataOptions = {}): UseFamilyDataState {
  const {
    personId,
    includeRelatives = true,
    maxDepth = 5,
  } = options;

  const [data, setData] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFamilyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (personId) queryParams.append('personId', personId);
      if (includeRelatives) queryParams.append('includeRelatives', 'true');
      queryParams.append('maxDepth', maxDepth.toString());

      const response = await fetch(`/api/family/tree?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch family data: ${response.statusText}`);
      }

      const familyData: FamilyTreeData = await response.json();
      setData(familyData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [personId, includeRelatives, maxDepth]);

  useEffect(() => {
    fetchFamilyData();
  }, [fetchFamilyData]);

  return {
    data,
    loading,
    error,
    refetch: fetchFamilyData,
  };
}

/**
 * Hook to fetch a specific person's details
 *
 * @param personId - The ID of the person to fetch
 * @returns State with person data, loading, error, and refetch function
 */
export function usePerson(personId: string) {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/family/person/${personId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch person: ${response.statusText}`);
      }

      const data: Person = await response.json();
      setPerson(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    if (personId) {
      refetch();
    }
  }, [personId, refetch]);

  return { person, loading, error, refetch };
}

/**
 * Hook to search people by name, place, or occupation
 *
 * @param query - Search query string
 * @returns State with search results, loading, error
 */
export function useSearchPeople(query: string) {
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchPeople = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/family/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data: Person[] = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search error'));
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(searchPeople, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading, error };
}

/**
 * Hook to get ancestors of a person
 *
 * @param personId - The ID of the person
 * @returns State with ancestor list, loading, error
 */
export function useAncestors(personId: string) {
  const [ancestors, setAncestors] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAncestors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/family/person/${personId}/ancestors`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ancestors: ${response.statusText}`);
        }

        const data: Person[] = await response.json();
        setAncestors(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchAncestors();
    }
  }, [personId]);

  return { ancestors, loading, error };
}

/**
 * Hook to get descendants of a person
 *
 * @param personId - The ID of the person
 * @param maxGenerations - Maximum generations to fetch
 * @returns State with descendant list, loading, error
 */
export function useDescendants(personId: string, maxGenerations: number = 3) {
  const [descendants, setDescendants] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDescendants = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/family/person/${personId}/descendants?maxGenerations=${maxGenerations}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch descendants: ${response.statusText}`);
        }

        const data: Person[] = await response.json();
        setDescendants(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchDescendants();
    }
  }, [personId, maxGenerations]);

  return { descendants, loading, error };
}
