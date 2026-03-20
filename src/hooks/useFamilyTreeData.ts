/**
 * useFamilyTreeData Hook
 *
 * Custom React hook for fetching and managing family tree data
 * with automatic retry, error handling, and caching.
 *
 * Features:
 * - Automatic retry on network errors
 * - Request debouncing
 * - Data caching
 * - Loading and error states
 * - TypeScript support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  familyTreeApi,
  FamilyTreeData,
  FamilyTreeQueryParams,
  FamilyTreeApiError,
} from '../services/familyTreeApi';

export interface UseFamilyTreeDataOptions {
  /** Number of retry attempts on failure (default: 2) */
  maxRetries?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
  /** Enable caching (default: true) */
  enableCache?: boolean;
  /** Automatic fetch on mount (default: true) */
  autoFetch?: boolean;
}

export interface UseFamilyTreeDataReturn {
  /** The fetched family tree data */
  data: FamilyTreeData | null;
  /** Loading state */
  loading: boolean;
  /** Error message, if any */
  error: string | null;
  /** Whether the data is from cache */
  isFromCache: boolean;
  /** Manual refetch function */
  refetch: () => Promise<void>;
  /** Reset hook state */
  reset: () => void;
}

interface CacheEntry {
  data: FamilyTreeData;
  timestamp: number;
}

// Simple in-memory cache
const dataCache = new Map<string, CacheEntry>();

export const useFamilyTreeData = (
  personId: string | null,
  params?: FamilyTreeQueryParams,
  options?: UseFamilyTreeDataOptions
): UseFamilyTreeDataReturn => {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    enableCache = true,
    autoFetch = true,
  } = options || {};

  const [data, setData] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate cache key from personId and params
  const getCacheKey = useCallback((id: string, p?: FamilyTreeQueryParams): string => {
    return `${id}-${JSON.stringify(p || {})}`;
  }, []);

  // Check cache validity
  const getCachedData = useCallback(
    (id: string, p?: FamilyTreeQueryParams): FamilyTreeData | null => {
      if (!enableCache) return null;

      const key = getCacheKey(id, p);
      const cached = dataCache.get(key);

      if (!cached) return null;

      // Check if cache has expired
      if (Date.now() - cached.timestamp > cacheDuration) {
        dataCache.delete(key);
        return null;
      }

      return cached.data;
    },
    [enableCache, cacheDuration, getCacheKey]
  );

  // Perform fetch with retry logic
  const performFetch = useCallback(async () => {
    if (!personId) {
      setError('Person ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsFromCache(false);
    retryCountRef.current = 0;

    const attemptFetch = async (): Promise<void> => {
      try {
        // Check cache first
        const cached = getCachedData(personId, params);
        if (cached) {
          setData(cached);
          setIsFromCache(true);
          setLoading(false);
          return;
        }

        // Perform actual fetch
        const result = await familyTreeApi.getFamilyTree(personId, params);
        setData(result);
        setError(null);

        // Store in cache
        if (enableCache) {
          const key = getCacheKey(personId, params);
          dataCache.set(key, {
            data: result,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof FamilyTreeApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unknown error occurred';

        // Retry logic for network errors
        if (
          retryCountRef.current < maxRetries &&
          !(err instanceof FamilyTreeApiError && err.statusCode < 500)
        ) {
          retryCountRef.current += 1;
          const delay = retryDelay * Math.pow(2, retryCountRef.current - 1); // Exponential backoff

          return new Promise<void>((resolve) => {
            fetchTimeoutRef.current = setTimeout(async () => {
              try {
                await attemptFetch();
                resolve();
              } catch {
                resolve();
              }
            }, delay);
          });
        }

        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    return attemptFetch();
  }, [personId, params, maxRetries, retryDelay, enableCache, getCacheKey, getCachedData]);

  // Handle fetch when dependencies change
  useEffect(() => {
    if (!autoFetch || !personId) return;

    performFetch();

    // Cleanup
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [personId, params, autoFetch, performFetch]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    // Clear cache for this person
    if (enableCache) {
      const key = getCacheKey(personId || '', params);
      dataCache.delete(key);
    }

    await performFetch();
  }, [personId, params, enableCache, getCacheKey, performFetch]);

  // Reset function
  const reset = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    setData(null);
    setLoading(false);
    setError(null);
    setIsFromCache(false);
    retryCountRef.current = 0;
  }, []);

  return {
    data,
    loading,
    error,
    isFromCache,
    refetch,
    reset,
  };
};

export default useFamilyTreeData;
