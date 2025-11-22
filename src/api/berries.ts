/**
 * Berry API module
 */

import { APIClient } from '../client';
import { Berry, BerryFirmness, BerryFlavor, NamedAPIResourceList } from '../types';

/**
 * Berry API methods
 */
export class BerryAPI {
  constructor(private client: APIClient) {}

  /**
   * Get a berry by name or ID
   * @param nameOrId - Berry name (e.g., "cheri") or ID
   */
  async getBerry(nameOrId: string | number): Promise<Berry> {
    return this.client.getResource<Berry>('berry', nameOrId);
  }

  /**
   * Get a paginated list of berries
   * @param options - Pagination options
   */
  async listBerries(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('berry', options);
  }

  /**
   * Get all berries
   */
  async getAllBerries(): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('berry', { limit: 1000 });
  }

  /**
   * Get berry firmness by name or ID
   * @param nameOrId - Firmness name (e.g., "very-soft") or ID
   */
  async getBerryFirmness(nameOrId: string | number): Promise<BerryFirmness> {
    return this.client.getResource<BerryFirmness>('berry-firmness', nameOrId);
  }

  /**
   * Get a paginated list of berry firmness values
   * @param options - Pagination options
   */
  async listBerryFirmnesses(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('berry-firmness', options);
  }

  /**
   * Get berry flavor by name or ID
   * @param nameOrId - Flavor name (e.g., "spicy") or ID
   */
  async getBerryFlavor(nameOrId: string | number): Promise<BerryFlavor> {
    return this.client.getResource<BerryFlavor>('berry-flavor', nameOrId);
  }

  /**
   * Get a paginated list of berry flavors
   * @param options - Pagination options
   */
  async listBerryFlavors(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('berry-flavor', options);
  }
}
