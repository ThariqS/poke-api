/**
 * Pokemon API module
 */

import { APIClient } from '../client';
import {
  Pokemon,
  PokemonSpecies,
  Ability,
  Type,
  NamedAPIResourceList,
  LocationAreaEncounter,
} from '../types';

/**
 * Pokemon API methods
 */
export class PokemonAPI {
  constructor(private client: APIClient) {}

  /**
   * Get a Pokemon by name or ID
   * @param nameOrId - Pokemon name (e.g., "pikachu") or ID (e.g., 25)
   */
  async getPokemon(nameOrId: string | number): Promise<Pokemon> {
    return this.client.getResource<Pokemon>('pokemon', nameOrId);
  }

  /**
   * Get a paginated list of Pokemon
   * @param options - Pagination options
   */
  async listPokemon(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('pokemon', options);
  }

  /**
   * Get all Pokemon (automatically handles pagination)
   * Warning: This will make multiple requests and may take some time
   */
  async getAllPokemon(): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('pokemon', { limit: 10000 });
  }

  /**
   * Get Pokemon species by name or ID
   * @param nameOrId - Pokemon species name or ID
   */
  async getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
    return this.client.getResource<PokemonSpecies>('pokemon-species', nameOrId);
  }

  /**
   * Get a paginated list of Pokemon species
   * @param options - Pagination options
   */
  async listPokemonSpecies(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('pokemon-species', options);
  }

  /**
   * Get Pokemon ability by name or ID
   * @param nameOrId - Ability name or ID
   */
  async getAbility(nameOrId: string | number): Promise<Ability> {
    return this.client.getResource<Ability>('ability', nameOrId);
  }

  /**
   * Get a paginated list of abilities
   * @param options - Pagination options
   */
  async listAbilities(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('ability', options);
  }

  /**
   * Get Pokemon type by name or ID
   * @param nameOrId - Type name (e.g., "fire") or ID
   */
  async getType(nameOrId: string | number): Promise<Type> {
    return this.client.getResource<Type>('type', nameOrId);
  }

  /**
   * Get a paginated list of types
   * @param options - Pagination options
   */
  async listTypes(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('type', options);
  }

  /**
   * Get location area encounters for a Pokemon
   * @param nameOrId - Pokemon name or ID
   */
  async getPokemonEncounters(
    nameOrId: string | number
  ): Promise<LocationAreaEncounter[]> {
    return this.client.get<LocationAreaEncounter[]>(
      `/pokemon/${nameOrId}/encounters`
    );
  }

  /**
   * Get a Pokemon by its Pokedex number
   * This is a convenience method that calls getPokemon with the ID
   * @param pokedexNumber - National Pokedex number
   */
  async getPokemonByPokedexNumber(pokedexNumber: number): Promise<Pokemon> {
    return this.getPokemon(pokedexNumber);
  }
}
