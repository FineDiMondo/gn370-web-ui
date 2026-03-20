/**
 * API service for family tree data management
 * Centralizes all API calls with error handling and retry logic
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Make an API request with automatic retry and error handling
 *
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @param retries - Number of retries (default: 3)
 * @returns Response data
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || response.statusText,
          details: errorData.details,
        };
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on 4xx errors (except 429)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error('Unknown API error');
}

/**
 * Family API endpoints
 */
export const familyApi = {
  /**
   * Get family tree data
   */
  getFamilyTree: (
    personId?: string,
    options?: { includeRelatives?: boolean; maxDepth?: number }
  ) =>
    apiRequest(
      `/family/tree${personId ? `?personId=${personId}` : ''}${
        options ? `&includeRelatives=${options.includeRelatives}&maxDepth=${options.maxDepth}` : ''
      }`
    ),

  /**
   * Get a specific person's details
   */
  getPerson: (personId: string) =>
    apiRequest(`/family/person/${personId}`),

  /**
   * Search for people
   */
  searchPeople: (query: string, limit: number = 20) =>
    apiRequest(
      `/family/search?q=${encodeURIComponent(query)}&limit=${limit}`
    ),

  /**
   * Get person's ancestors
   */
  getAncestors: (personId: string) =>
    apiRequest(`/family/person/${personId}/ancestors`),

  /**
   * Get person's descendants
   */
  getDescendants: (personId: string, maxGenerations: number = 3) =>
    apiRequest(
      `/family/person/${personId}/descendants?maxGenerations=${maxGenerations}`
    ),

  /**
   * Update person details
   */
  updatePerson: (personId: string, data: Record<string, unknown>) =>
    apiRequest(`/family/person/${personId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Create a new person
   */
  createPerson: (data: Record<string, unknown>) =>
    apiRequest('/family/person', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Delete a person
   */
  deletePerson: (personId: string) =>
    apiRequest(`/family/person/${personId}`, {
      method: 'DELETE',
    }),

  /**
   * Import GEDCOM file
   */
  importGedcom: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${API_BASE_URL}/family/import`, {
      method: 'POST',
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }
      return response.json();
    });
  },

  /**
   * Export family tree as GEDCOM
   */
  exportGedcom: (personId?: string) =>
    fetch(
      `${API_BASE_URL}/family/export${personId ? `?personId=${personId}` : ''}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/octet-stream',
        },
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      return response.blob();
    }),
};

/**
 * Timeline API endpoints
 */
export const timelineApi = {
  /**
   * Get timeline events
   */
  getEvents: (
    personId?: string,
    options?: { includeRelatives?: boolean; startYear?: number; endYear?: number }
  ) => {
    const params = new URLSearchParams();
    if (personId) params.append('personId', personId);
    if (options?.includeRelatives) params.append('includeRelatives', 'true');
    if (options?.startYear) params.append('startYear', options.startYear.toString());
    if (options?.endYear) params.append('endYear', options.endYear.toString());

    return apiRequest(`/timeline/events?${params}`);
  },

  /**
   * Get family milestones
   */
  getMilestones: (personId: string) =>
    apiRequest(`/timeline/milestones?personId=${personId}`),
};

/**
 * Geographic API endpoints
 */
export const geographicApi = {
  /**
   * Get location data
   */
  getLocations: (
    personId?: string,
    options?: { includeRelatives?: boolean; eventType?: string }
  ) => {
    const params = new URLSearchParams();
    if (personId) params.append('personId', personId);
    if (options?.includeRelatives) params.append('includeRelatives', 'true');
    if (options?.eventType) params.append('eventType', options.eventType);

    return apiRequest(`/geographic/locations?${params}`);
  },

  /**
   * Get migration routes
   */
  getMigrationRoutes: (personId: string) =>
    apiRequest(`/geographic/migration-routes?personId=${personId}`),

  /**
   * Get geographic statistics
   */
  getStats: (personId: string) =>
    apiRequest(`/geographic/stats?personId=${personId}`),
};

/**
 * Statistics API endpoints
 */
export const statisticsApi = {
  /**
   * Get family statistics
   */
  getStats: (
    personId?: string,
    includeRelatives: boolean = true
  ) => {
    const params = new URLSearchParams();
    if (personId) params.append('personId', personId);
    params.append('includeRelatives', includeRelatives.toString());

    return apiRequest(`/statistics/family?${params}`);
  },

  /**
   * Get gender distribution
   */
  getGenderDistribution: (personId: string) =>
    apiRequest(`/statistics/gender?personId=${personId}`),

  /**
   * Get occupation statistics
   */
  getOccupations: (personId: string) =>
    apiRequest(`/statistics/occupations?personId=${personId}`),

  /**
   * Get birth rate over time
   */
  getBirthRate: (personId: string) =>
    apiRequest(`/statistics/birth-rate?personId=${personId}`),
};

/**
 * Photo/Album API endpoints
 */
export const albumApi = {
  /**
   * Get photos for a person
   */
  getPhotos: (personId: string) =>
    apiRequest(`/album/photos?personId=${personId}`),

  /**
   * Upload a photo
   */
  uploadPhoto: (
    personId: string,
    file: File,
    metadata?: Record<string, unknown>
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return fetch(`${API_BASE_URL}/album/photos/${personId}`, {
      method: 'POST',
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      return response.json();
    });
  },

  /**
   * Delete a photo
   */
  deletePhoto: (photoId: string) =>
    apiRequest(`/album/photos/${photoId}`, {
      method: 'DELETE',
    }),

  /**
   * Update photo metadata
   */
  updatePhoto: (photoId: string, metadata: Record<string, unknown>) =>
    apiRequest(`/album/photos/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
    }),
};

/**
 * Story API endpoints
 */
export const storyApi = {
  /**
   * Get story for a person
   */
  getStory: (personId: string) =>
    apiRequest(`/stories/${personId}`),

  /**
   * Save story for a person
   */
  saveStory: (personId: string, content: string) =>
    apiRequest(`/stories/${personId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  /**
   * Update story
   */
  updateStory: (personId: string, content: string) =>
    apiRequest(`/stories/${personId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  /**
   * Delete story
   */
  deleteStory: (personId: string) =>
    apiRequest(`/stories/${personId}`, {
      method: 'DELETE',
    }),
};

/**
 * Error handling utility
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }

  return 'An unexpected error occurred';
}
