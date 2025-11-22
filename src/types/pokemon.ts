/**
 * Pokemon-related types
 */

import { NamedAPIResource, VersionGroupDetail, GenerationGameIndex, Name, FlavorText } from './common';

/**
 * Pokemon abilities
 */
export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

/**
 * Pokemon types
 */
export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

/**
 * Pokemon stats
 */
export interface PokemonStat {
  stat: NamedAPIResource;
  effort: number;
  base_stat: number;
}

/**
 * Pokemon moves
 */
export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: VersionGroupDetail[];
}

/**
 * Pokemon sprites
 */
export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_default: string | null;
  back_shiny: string | null;
  back_female: string | null;
  back_shiny_female: string | null;
  other?: {
    dream_world?: {
      front_default: string | null;
      front_female: string | null;
    };
    home?: {
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
  versions?: any; // Complex nested structure for all game versions
}

/**
 * Pokemon cries (audio)
 */
export interface PokemonCries {
  latest: string;
  legacy: string;
}

/**
 * Pokemon game indices
 */
export interface PokemonGameIndex {
  game_index: number;
  version: NamedAPIResource;
}

/**
 * Held item details
 */
export interface PokemonHeldItemVersion {
  version: NamedAPIResource;
  rarity: number;
}

/**
 * Held items
 */
export interface PokemonHeldItem {
  item: NamedAPIResource;
  version_details: PokemonHeldItemVersion[];
}

/**
 * Main Pokemon resource
 */
export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: PokemonAbility[];
  forms: NamedAPIResource[];
  game_indices: PokemonGameIndex[];
  held_items: PokemonHeldItem[];
  location_area_encounters: string;
  moves: PokemonMove[];
  species: NamedAPIResource;
  sprites: PokemonSprites;
  cries: PokemonCries;
  stats: PokemonStat[];
  types: PokemonType[];
  past_types?: any[];
}

/**
 * Pokemon species details
 */
export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  pokedex_numbers: PokemonSpeciesDexEntry[];
  egg_groups: NamedAPIResource[];
  color: NamedAPIResource;
  shape: NamedAPIResource;
  evolves_from_species: NamedAPIResource | null;
  evolution_chain: {
    url: string;
  };
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  names: Name[];
  flavor_text_entries: FlavorText[];
  form_descriptions: {
    description: string;
    language: NamedAPIResource;
  }[];
  genera: {
    genus: string;
    language: NamedAPIResource;
  }[];
  varieties: PokemonSpeciesVariety[];
}

/**
 * Pokemon species pokedex entry
 */
export interface PokemonSpeciesDexEntry {
  entry_number: number;
  pokedex: NamedAPIResource;
}

/**
 * Pokemon species variety
 */
export interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

/**
 * Ability details
 */
export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedAPIResource;
  names: Name[];
  effect_entries: {
    effect: string;
    short_effect: string;
    language: NamedAPIResource;
  }[];
  effect_changes: {
    version_group: NamedAPIResource;
    effect_entries: {
      effect: string;
      language: NamedAPIResource;
    }[];
  }[];
  flavor_text_entries: FlavorText[];
  pokemon: {
    is_hidden: boolean;
    slot: number;
    pokemon: NamedAPIResource;
  }[];
}

/**
 * Type details
 */
export interface Type {
  id: number;
  name: string;
  damage_relations: {
    no_damage_to: NamedAPIResource[];
    half_damage_to: NamedAPIResource[];
    double_damage_to: NamedAPIResource[];
    no_damage_from: NamedAPIResource[];
    half_damage_from: NamedAPIResource[];
    double_damage_from: NamedAPIResource[];
  };
  past_damage_relations: any[];
  game_indices: GenerationGameIndex[];
  generation: NamedAPIResource;
  move_damage_class: NamedAPIResource | null;
  names: Name[];
  pokemon: {
    slot: number;
    pokemon: NamedAPIResource;
  }[];
  moves: NamedAPIResource[];
}
