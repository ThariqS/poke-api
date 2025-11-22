/**
 * PokeAPI SDK - Main entry point
 */

import { APIClient, ClientOptions } from './client';
import { PokemonAPI } from './api/pokemon';
import { MoveAPI } from './api/moves';
import { BerryAPI } from './api/berries';
import { EvolutionAPI } from './api/evolution';
import { LocationAPI } from './api/locations';

// Export types
export * from './types';

// Export errors
export * from './errors';

// Export client
export { APIClient } from './client';
export type { ClientOptions, CacheOptions } from './client';

/**
 * Main PokeAPI SDK class
 *
 * @example
 * ```typescript
 * import { PokeAPI } from 'poke-api-sdk';
 *
 * const api = new PokeAPI();
 *
 * // Get a Pokemon
 * const pikachu = await api.pokemon.getPokemon('pikachu');
 * console.log(pikachu.name, pikachu.types);
 *
 * // Get a move
 * const thunderbolt = await api.moves.getMove('thunderbolt');
 * console.log(thunderbolt.name, thunderbolt.power);
 * ```
 */
export class PokeAPI {
  private client: APIClient;

  public readonly pokemon: PokemonAPI;
  public readonly moves: MoveAPI;
  public readonly berries: BerryAPI;
  public readonly evolution: EvolutionAPI;
  public readonly locations: LocationAPI;

  /**
   * Create a new PokeAPI instance
   * @param options - Client configuration options
   */
  constructor(options?: ClientOptions) {
    this.client = new APIClient(options);

    // Initialize API modules
    this.pokemon = new PokemonAPI(this.client);
    this.moves = new MoveAPI(this.client);
    this.berries = new BerryAPI(this.client);
    this.evolution = new EvolutionAPI(this.client);
    this.locations = new LocationAPI(this.client);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.client.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.client.getCacheStats();
  }

  /**
   * Make a custom GET request to the PokeAPI
   * @param endpoint - The API endpoint (e.g., '/pokemon/1' or full URL)
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.client.get<T>(endpoint);
  }
}

// Default export
export default PokeAPI;
