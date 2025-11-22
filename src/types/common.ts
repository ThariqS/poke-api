/**
 * Common types used across the PokeAPI
 */

/**
 * Named API resource with name and URL
 */
export interface NamedAPIResource {
  name: string;
  url: string;
}

/**
 * API resource with just URL
 */
export interface APIResource {
  url: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Generic named resource list response
 */
export type NamedAPIResourceList = PaginatedResponse<NamedAPIResource>;

/**
 * Name in different languages
 */
export interface Name {
  name: string;
  language: NamedAPIResource;
}

/**
 * Description in different languages
 */
export interface Description {
  description: string;
  language: NamedAPIResource;
}

/**
 * Effect text in different languages
 */
export interface Effect {
  effect: string;
  language: NamedAPIResource;
}

/**
 * Flavor text in different languages
 */
export interface FlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version?: NamedAPIResource;
}

/**
 * Version group details
 */
export interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
}

/**
 * Generation info
 */
export interface GenerationGameIndex {
  game_index: number;
  generation: NamedAPIResource;
}
