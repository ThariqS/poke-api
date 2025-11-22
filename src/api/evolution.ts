/**
 * Evolution API module
 */

import { APIClient } from '../client';
import { EvolutionChain, EvolutionTrigger, NamedAPIResourceList } from '../types';

/**
 * Evolution API methods
 */
export class EvolutionAPI {
  constructor(private client: APIClient) {}

  /**
   * Get an evolution chain by ID
   * @param id - Evolution chain ID
   */
  async getEvolutionChain(id: number): Promise<EvolutionChain> {
    return this.client.getResource<EvolutionChain>('evolution-chain', id);
  }

  /**
   * Get a paginated list of evolution chains
   * @param options - Pagination options
   */
  async listEvolutionChains(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('evolution-chain', options);
  }

  /**
   * Get evolution trigger by name or ID
   * @param nameOrId - Trigger name (e.g., "level-up") or ID
   */
  async getEvolutionTrigger(nameOrId: string | number): Promise<EvolutionTrigger> {
    return this.client.getResource<EvolutionTrigger>('evolution-trigger', nameOrId);
  }

  /**
   * Get a paginated list of evolution triggers
   * @param options - Pagination options
   */
  async listEvolutionTriggers(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('evolution-trigger', options);
  }

  /**
   * Get evolution chain for a Pokemon species
   * Helper method that extracts the chain ID from a species' evolution_chain URL
   * @param evolutionChainUrl - URL from PokemonSpecies.evolution_chain.url
   */
  async getEvolutionChainFromUrl(evolutionChainUrl: string): Promise<EvolutionChain> {
    return this.client.get<EvolutionChain>(evolutionChainUrl);
  }
}
