/**
 * Family Tree API Service
 *
 * Handles all communication with backend API for genealogy data.
 * Provides type-safe methods with comprehensive error handling.
 *
 * Endpoints:
 * - GET /api/v1/person/{id}/family-tree - Fetch family tree for a person
 */

export interface FamilyTreeNode {
  id: string;
  label: string;
  title: string;
  color: string;
  size: number;
  generation: number;
  gender: 'M' | 'F' | 'U';
  isRoot?: boolean;
  relationship?: string;
}

export interface FamilyTreeEdge {
  from: string;
  to: string;
  label: string;
  color: string;
  relationship: string;
}

export interface FamilyTreeData {
  root: {
    id: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    birthPlace?: string;
    gender: 'M' | 'F' | 'U';
  };
  nodes: FamilyTreeNode[];
  edges: FamilyTreeEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    generations: number;
    renderTime: number;
  };
}

export interface FamilyTreeQueryParams {
  generations?: number;
  depth?: number;
  format?: 'graph' | 'list' | 'both';
  includeStats?: boolean;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
}

class FamilyTreeApiService {
  private baseUrl: string;
  private timeout: number = 30000; // 30 seconds

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch family tree data for a specific person
   *
   * @param personId - The ID of the person
   * @param params - Query parameters (generations, depth, etc.)
   * @returns Promise<FamilyTreeData>
   * @throws Error if the request fails
   */
  async getFamilyTree(
    personId: string,
    params?: FamilyTreeQueryParams
  ): Promise<FamilyTreeData> {
    if (!personId || personId.trim() === '') {
      throw new Error('Person ID is required');
    }

    try {
      const queryParams = new URLSearchParams();

      if (params?.generations) {
        queryParams.append('generations', String(params.generations));
      }
      if (params?.depth) {
        queryParams.append('depth', String(params.depth));
      }
      if (params?.format) {
        queryParams.append('format', params.format);
      }
      if (params?.includeStats !== undefined) {
        queryParams.append('includeStats', String(params.includeStats));
      }

      const url = `${this.baseUrl}/person/${encodeURIComponent(personId)}/family-tree${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new FamilyTreeApiError(
          `Failed to fetch family tree: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!this.isValidFamilyTreeData(data)) {
        throw new Error('Invalid family tree data structure from API');
      }

      return data as FamilyTreeData;
    } catch (error) {
      if (error instanceof FamilyTreeApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to API');
      }

      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Check if API is healthy
   *
   * @returns Promise<boolean>
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch with timeout protection
   *
   * @private
   */
  private async fetchWithTimeout(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Validate family tree data structure
   *
   * @private
   */
  private isValidFamilyTreeData(data: unknown): data is FamilyTreeData {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const tree = data as Record<string, unknown>;

    // Check root object
    if (
      !tree.root ||
      typeof tree.root !== 'object' ||
      !('id' in tree.root) ||
      !('name' in tree.root) ||
      !('gender' in tree.root)
    ) {
      return false;
    }

    // Check arrays
    if (!Array.isArray(tree.nodes) || !Array.isArray(tree.edges)) {
      return false;
    }

    // Check stats
    if (!tree.stats || typeof tree.stats !== 'object') {
      return false;
    }

    const stats = tree.stats as Record<string, unknown>;
    if (
      typeof stats.totalNodes !== 'number' ||
      typeof stats.totalEdges !== 'number' ||
      typeof stats.generations !== 'number'
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Custom error class for API-specific errors
 */
export class FamilyTreeApiError extends Error {
  statusCode: number;
  responseData?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    responseData?: unknown
  ) {
    super(message);
    this.name = 'FamilyTreeApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

// Export singleton instance
export const familyTreeApi = new FamilyTreeApiService();

export default FamilyTreeApiService;
