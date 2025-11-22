/**
 * Move-related types
 */

import { NamedAPIResource, Name, FlavorText, Effect, VersionGroupDetail } from './common';

/**
 * Move damage class (physical, special, status)
 */
export interface MoveDamageClass {
  id: number;
  name: string;
  descriptions: {
    description: string;
    language: NamedAPIResource;
  }[];
  moves: NamedAPIResource[];
  names: Name[];
}

/**
 * Move target (opponent, user, all opponents, etc.)
 */
export interface MoveTarget {
  id: number;
  name: string;
  descriptions: {
    description: string;
    language: NamedAPIResource;
  }[];
  moves: NamedAPIResource[];
  names: Name[];
}

/**
 * Move meta data (additional battle info)
 */
export interface MoveMeta {
  ailment: NamedAPIResource;
  category: NamedAPIResource;
  min_hits: number | null;
  max_hits: number | null;
  min_turns: number | null;
  max_turns: number | null;
  drain: number;
  healing: number;
  crit_rate: number;
  ailment_chance: number;
  flinch_chance: number;
  stat_chance: number;
}

/**
 * Move stat change
 */
export interface MoveStatChange {
  change: number;
  stat: NamedAPIResource;
}

/**
 * Past move stat values
 */
export interface PastMoveStatValues {
  accuracy: number | null;
  effect_chance: number | null;
  power: number | null;
  pp: number | null;
  effect_entries: Effect[];
  type: NamedAPIResource | null;
  version_group: NamedAPIResource;
}

/**
 * Contest combo set
 */
export interface ContestComboSet {
  normal: {
    use_before: NamedAPIResource[] | null;
    use_after: NamedAPIResource[] | null;
  };
  super: {
    use_before: NamedAPIResource[] | null;
    use_after: NamedAPIResource[] | null;
  };
}

/**
 * Main Move resource
 */
export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number;
  priority: number;
  power: number | null;
  contest_combos: ContestComboSet | null;
  contest_type: NamedAPIResource | null;
  contest_effect: {
    url: string;
  } | null;
  damage_class: NamedAPIResource;
  effect_entries: {
    effect: string;
    short_effect: string;
    language: NamedAPIResource;
  }[];
  effect_changes: {
    version_group: NamedAPIResource;
    effect_entries: Effect[];
  }[];
  learned_by_pokemon: NamedAPIResource[];
  flavor_text_entries: FlavorText[];
  generation: NamedAPIResource;
  machines: {
    machine: {
      url: string;
    };
    version_group: NamedAPIResource;
  }[];
  meta: MoveMeta;
  names: Name[];
  past_values: PastMoveStatValues[];
  stat_changes: MoveStatChange[];
  super_contest_effect: {
    url: string;
  } | null;
  target: NamedAPIResource;
  type: NamedAPIResource;
}

/**
 * Move category (damage, ailment, net-good-stats, etc.)
 */
export interface MoveCategory {
  id: number;
  name: string;
  descriptions: {
    description: string;
    language: NamedAPIResource;
  }[];
  moves: NamedAPIResource[];
}

/**
 * Move learn method (level-up, machine, tutor, etc.)
 */
export interface MoveLearnMethod {
  id: number;
  name: string;
  descriptions: {
    description: string;
    language: NamedAPIResource;
  }[];
  names: Name[];
  version_groups: NamedAPIResource[];
}
