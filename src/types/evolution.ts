/**
 * Evolution-related types
 */

import { NamedAPIResource } from './common';

/**
 * Evolution trigger (level-up, trade, use-item, etc.)
 */
export interface EvolutionTrigger {
  id: number;
  name: string;
  names: {
    name: string;
    language: NamedAPIResource;
  }[];
  pokemon_species: NamedAPIResource[];
}

/**
 * Evolution detail requirements
 */
export interface EvolutionDetail {
  item: NamedAPIResource | null;
  trigger: NamedAPIResource;
  gender: number | null;
  held_item: NamedAPIResource | null;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: NamedAPIResource | null;
  party_type: NamedAPIResource | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: NamedAPIResource | null;
  turn_upside_down: boolean;
}

/**
 * Chain link in evolution chain
 */
export interface ChainLink {
  is_baby: boolean;
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

/**
 * Main Evolution Chain resource
 */
export interface EvolutionChain {
  id: number;
  baby_trigger_item: NamedAPIResource | null;
  chain: ChainLink;
}
