/**
 * HTTP client for PokeAPI with caching support
 */

import { NotFoundError, NetworkError, ParseError, RateLimitError } from './errors';

/**
 * Cache configuration options
 */
export type CacheOptions = {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
};

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Client configuration options
 */
export type ClientOptions = {
  baseURL?: string;
  cache?: Partial<CacheOptions>;
  timeout?: number;
};

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  enabled: true,
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 500,
};

/**
 * HTTP client for making requests to PokeAPI
 */
export class APIClient {
  private baseURL: string;
  private cache: Map<string, CacheEntry<any>>;
  private cacheOptions: CacheOptions;
  private timeout: number;

  constructor(options: ClientOptions = {}) {
    this.baseURL = options.baseURL || 'https://pokeapi.co/api/v2';
    this.cache = new Map();
    this.cacheOptions = {
      ...DEFAULT_CACHE_OPTIONS,
      ...options.cache,
    };
    this.timeout = options.timeout || 10000; // 10 seconds default
  }

  /**
   * Get data from cache if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.cacheOptions.enabled) {
      return null;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.cacheOptions.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data in cache
   */
  private setCache<T>(key: string, data: T): void {
    if (!this.cacheOptions.enabled) {
      return;
    }

    // Check cache size and remove oldest entry if needed
    if (this.cache.size >= this.cacheOptions.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheOptions.maxSize,
      enabled: this.cacheOptions.enabled,
    };
  }

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    // Check cache first
    const cached = this.getFromCache<T>(url);
    if (cached !== null) {
      return cached;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new NotFoundError(endpoint);
          case 429:
            throw new RateLimitError();
          default:
            throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Parse JSON response
      let data: T;
      try {
        data = await response.json() as T;
      } catch (error) {
        throw new ParseError(error instanceof Error ? error.message : 'Unknown error');
      }

      // Cache the result
      this.setCache(url, data);

      return data;
    } catch (error) {
      // Re-throw our custom errors
      if (
        error instanceof NotFoundError ||
        error instanceof RateLimitError ||
        error instanceof NetworkError ||
        error instanceof ParseError
      ) {
        throw error;
      }

      // Handle fetch abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${this.timeout}ms`);
      }

      // Handle other errors
      throw new NetworkError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get a resource by name or ID
   */
  public async getResource<T>(resource: string, nameOrId: string | number): Promise<T> {
    return this.get<T>(`/${resource}/${nameOrId}`);
  }

  /**
   * Get a paginated list of resources
   */
  public async getList<T>(
    resource: string,
    options?: { limit?: number; offset?: number }
  ): Promise<T> {
    const params = new URLSearchParams();
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }

    const query = params.toString();
    const endpoint = query ? `/${resource}?${query}` : `/${resource}`;

    return this.get<T>(endpoint);
  }
}
