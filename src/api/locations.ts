/**
 * Location API module
 */

import { APIClient } from '../client';
import { Location, LocationArea, Region, NamedAPIResourceList } from '../types';

/**
 * Location API methods
 */
export class LocationAPI {
  constructor(private client: APIClient) {}

  /**
   * Get a location by name or ID
   * @param nameOrId - Location name or ID
   */
  async getLocation(nameOrId: string | number): Promise<Location> {
    return this.client.getResource<Location>('location', nameOrId);
  }

  /**
   * Get a paginated list of locations
   * @param options - Pagination options
   */
  async listLocations(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('location', options);
  }

  /**
   * Get all locations
   */
  async getAllLocations(): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('location', { limit: 1000 });
  }

  /**
   * Get a location area by name or ID
   * @param nameOrId - Location area name or ID
   */
  async getLocationArea(nameOrId: string | number): Promise<LocationArea> {
    return this.client.getResource<LocationArea>('location-area', nameOrId);
  }

  /**
   * Get a paginated list of location areas
   * @param options - Pagination options
   */
  async listLocationAreas(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('location-area', options);
  }

  /**
   * Get a region by name or ID
   * @param nameOrId - Region name (e.g., "kanto") or ID
   */
  async getRegion(nameOrId: string | number): Promise<Region> {
    return this.client.getResource<Region>('region', nameOrId);
  }

  /**
   * Get a paginated list of regions
   * @param options - Pagination options
   */
  async listRegions(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('region', options);
  }

  /**
   * Get all regions
   */
  async getAllRegions(): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('region', { limit: 100 });
  }
}
