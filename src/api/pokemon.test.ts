/**
 * Tests for PokemonAPI
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { PokeAPI } from '../index';

describe('PokemonAPI', () => {
  let api: PokeAPI;

  beforeEach(() => {
    api = new PokeAPI();
  });

  test('should get Pokemon by name', async () => {
    const pikachu = await api.pokemon.getPokemon('pikachu');
    expect(pikachu.name).toBe('pikachu');
    expect(pikachu.id).toBe(25);
  });

  test('should get Pokemon by ID', async () => {
    const bulbasaur = await api.pokemon.getPokemon(1);
    expect(bulbasaur.name).toBe('bulbasaur');
    expect(bulbasaur.id).toBe(1);
  });

  test('should list Pokemon with pagination', async () => {
    const result = await api.pokemon.listPokemon({ limit: 10, offset: 0 });
    expect(result.results).toHaveLength(10);
    expect(result.count).toBeGreaterThan(0);
  });

  test('should get Pokemon species', async () => {
    const species = await api.pokemon.getPokemonSpecies('pikachu');
    expect(species.name).toBe('pikachu');
    expect(species.is_legendary).toBe(false);
  });

  test('should get ability', async () => {
    const ability = await api.pokemon.getAbility('static');
    expect(ability.name).toBe('static');
    expect(ability).toHaveProperty('effect_entries');
  });

  test('should get type', async () => {
    const type = await api.pokemon.getType('electric');
    expect(type.name).toBe('electric');
    expect(type).toHaveProperty('damage_relations');
  });

  test('should get Pokemon by Pokedex number', async () => {
    const charizard = await api.pokemon.getPokemonByPokedexNumber(6);
    expect(charizard.name).toBe('charizard');
    expect(charizard.id).toBe(6);
  });

  test('should have correct type structure', async () => {
    const pokemon = await api.pokemon.getPokemon('pikachu');
    expect(pokemon.types).toBeDefined();
    expect(pokemon.types.length).toBeGreaterThan(0);
    expect(pokemon.types[0]).toHaveProperty('type');
    expect(pokemon.types[0].type).toHaveProperty('name');
  });
});
