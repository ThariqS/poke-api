/**
 * Example: Build and analyze a Pokemon team
 */

import { PokeAPI } from '../src/index';

async function main() {
  const api = new PokeAPI();

  // Define a team
  const teamNames = ['charizard', 'blastoise', 'venusaur', 'pikachu', 'gengar', 'dragonite'];

  console.log('=== Pokemon Team Analysis ===\n');

  const team = [];

  for (const name of teamNames) {
    const pokemon = await api.pokemon.getPokemon(name);
    team.push(pokemon);

    console.log(`${pokemon.name.toUpperCase()} (#${pokemon.id})`);
    console.log(`Types: ${pokemon.types.map((t) => t.type.name).join(', ')}`);

    // Calculate total stats
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    console.log(`Total Stats: ${totalStats}`);

    // Show individual stats
    console.log('Stats:');
    for (const stat of pokemon.stats) {
      const statName = stat.stat.name.padEnd(20);
      const bar = '█'.repeat(Math.floor(stat.base_stat / 10));
      console.log(`  ${statName} ${stat.base_stat.toString().padStart(3)} ${bar}`);
    }

    // Show abilities
    console.log('Abilities:');
    for (const abilityInfo of pokemon.abilities) {
      const hidden = abilityInfo.is_hidden ? ' (Hidden)' : '';
      console.log(`  - ${abilityInfo.ability.name}${hidden}`);
    }

    console.log();
  }

  // Type coverage analysis
  console.log('=== Team Type Coverage ===\n');
  const typeCount = new Map<string, number>();

  for (const pokemon of team) {
    for (const typeInfo of pokemon.types) {
      const typeName = typeInfo.type.name;
      typeCount.set(typeName, (typeCount.get(typeName) || 0) + 1);
    }
  }

  console.log('Types in team:');
  for (const [type, count] of Array.from(typeCount.entries()).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${type}: ${count} Pokemon`);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
