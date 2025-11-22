/**
 * Example: Calculate type effectiveness
 */

import { PokeAPI } from '../src/index';

async function main() {
  const api = new PokeAPI();

  // Get a Pokemon type
  const fireType = await api.pokemon.getType('fire');

  console.log('=== Fire Type Effectiveness ===\n');

  console.log('Super effective against (2x damage to):');
  for (const type of fireType.damage_relations.double_damage_to) {
    console.log(`  - ${type.name}`);
  }
  console.log();

  console.log('Not very effective against (0.5x damage to):');
  for (const type of fireType.damage_relations.half_damage_to) {
    console.log(`  - ${type.name}`);
  }
  console.log();

  console.log('No effect against (0x damage to):');
  for (const type of fireType.damage_relations.no_damage_to) {
    console.log(`  - ${type.name}`);
  }
  console.log();

  console.log('Weak to (takes 2x damage from):');
  for (const type of fireType.damage_relations.double_damage_from) {
    console.log(`  - ${type.name}`);
  }
  console.log();

  console.log('Resists (takes 0.5x damage from):');
  for (const type of fireType.damage_relations.half_damage_from) {
    console.log(`  - ${type.name}`);
  }
  console.log();

  console.log('Immune to (takes 0x damage from):');
  for (const type of fireType.damage_relations.no_damage_from) {
    console.log(`  - ${type.name}`);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
