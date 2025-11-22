/**
 * Location-related types
 */

import { NamedAPIResource, Name } from './common';

/**
 * Location area encounter
 */
export interface LocationAreaEncounter {
  location_area: NamedAPIResource;
  version_details: {
    max_chance: number;
    encounter_details: {
      min_level: number;
      max_level: number;
      condition_values: NamedAPIResource[];
      chance: number;
      method: NamedAPIResource;
    }[];
    version: NamedAPIResource;
  }[];
}

/**
 * Location area
 */
export interface LocationArea {
  id: number;
  name: string;
  game_index: number;
  encounter_method_rates: {
    encounter_method: NamedAPIResource;
    version_details: {
      rate: number;
      version: NamedAPIResource;
    }[];
  }[];
  location: NamedAPIResource;
  names: Name[];
  pokemon_encounters: {
    pokemon: NamedAPIResource;
    version_details: {
      max_chance: number;
      encounter_details: {
        min_level: number;
        max_level: number;
        condition_values: NamedAPIResource[];
        chance: number;
        method: NamedAPIResource;
      }[];
      version: NamedAPIResource;
    }[];
  }[];
}

/**
 * Main Location resource
 */
export interface Location {
  id: number;
  name: string;
  region: NamedAPIResource | null;
  names: Name[];
  game_indices: {
    game_index: number;
    generation: NamedAPIResource;
  }[];
  areas: NamedAPIResource[];
}

/**
 * Region
 */
export interface Region {
  id: number;
  name: string;
  locations: NamedAPIResource[];
  main_generation: NamedAPIResource;
  names: Name[];
  pokedexes: NamedAPIResource[];
  version_groups: NamedAPIResource[];
}
