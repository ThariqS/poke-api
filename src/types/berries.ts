/**
 * Berry-related types
 */

import { NamedAPIResource, Name } from './common';

/**
 * Berry firmness
 */
export interface BerryFirmness {
  id: number;
  name: string;
  berries: NamedAPIResource[];
  names: Name[];
}

/**
 * Berry flavor map
 */
export interface BerryFlavorMap {
  potency: number;
  flavor: NamedAPIResource;
}

/**
 * Main Berry resource
 */
export interface Berry {
  id: number;
  name: string;
  growth_time: number;
  max_harvest: number;
  natural_gift_power: number;
  size: number;
  smoothness: number;
  soil_dryness: number;
  firmness: NamedAPIResource;
  flavors: BerryFlavorMap[];
  item: NamedAPIResource;
  natural_gift_type: NamedAPIResource;
}

/**
 * Berry flavor
 */
export interface BerryFlavor {
  id: number;
  name: string;
  berries: {
    potency: number;
    berry: NamedAPIResource;
  }[];
  contest_type: NamedAPIResource;
  names: Name[];
}
