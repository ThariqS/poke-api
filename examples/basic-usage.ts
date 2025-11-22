/**
 * Basic usage examples for PokeAPI SDK
 */

import { PokeAPI } from '../src/index';

async function main() {
  // Create a new API instance
  const api = new PokeAPI();

  console.log('=== PokeAPI SDK Examples ===\n');

  // Example 1: Get a Pokemon by name
  console.log('1. Getting Pikachu...');
  const pikachu = await api.pokemon.getPokemon('pikachu');
  console.log(`   Name: ${pikachu.name}`);
  console.log(`   ID: ${pikachu.id}`);
  console.log(`   Height: ${pikachu.height}`);
  console.log(`   Weight: ${pikachu.weight}`);
  console.log(`   Types: ${pikachu.types.map((t) => t.type.name).join(', ')}`);
  console.log();

  // Example 2: Get Pokemon abilities
  console.log('2. Getting Pikachu abilities...');
  for (const abilityInfo of pikachu.abilities) {
    const ability = await api.pokemon.getAbility(abilityInfo.ability.name);
    console.log(`   - ${ability.name}${abilityInfo.is_hidden ? ' (hidden)' : ''}`);
    if (ability.effect_entries.length > 0) {
      const effect = ability.effect_entries.find((e) => e.language.name === 'en');
      if (effect) {
        console.log(`     ${effect.short_effect}`);
      }
    }
  }
  console.log();

  // Example 3: Get a move
  console.log('3. Getting Thunderbolt move...');
  const thunderbolt = await api.moves.getMove('thunderbolt');
  console.log(`   Name: ${thunderbolt.name}`);
  console.log(`   Type: ${thunderbolt.type.name}`);
  console.log(`   Power: ${thunderbolt.power}`);
  console.log(`   Accuracy: ${thunderbolt.accuracy}`);
  console.log(`   PP: ${thunderbolt.pp}`);
  console.log();

  // Example 4: Get Pokemon species and evolution chain
  console.log('4. Getting Eevee evolution chain...');
  const eeveeSpecies = await api.pokemon.getPokemonSpecies('eevee');
  const evolutionChain = await api.evolution.getEvolutionChainFromUrl(
    eeveeSpecies.evolution_chain.url
  );

  function printEvolutionChain(chain: any, indent = '   ') {
    console.log(`${indent}→ ${chain.species.name}`);
    for (const evolution of chain.evolves_to) {
      printEvolutionChain(evolution, indent + '  ');
    }
  }

  printEvolutionChain(evolutionChain.chain);
  console.log();

  // Example 5: List Pokemon with pagination
  console.log('5. Listing first 10 Pokemon...');
  const pokemonList = await api.pokemon.listPokemon({ limit: 10, offset: 0 });
  console.log(`   Total Pokemon: ${pokemonList.count}`);
  console.log('   First 10:');
  for (const pokemon of pokemonList.results) {
    console.log(`   - ${pokemon.name}`);
  }
  console.log();

  // Example 6: Get a berry
  console.log('6. Getting Oran Berry...');
  const berry = await api.berries.getBerry('oran');
  console.log(`   Name: ${berry.name}`);
  console.log(`   Size: ${berry.size}mm`);
  console.log(`   Firmness: ${berry.firmness.name}`);
  console.log(
    `   Flavors: ${berry.flavors
      .filter((f) => f.potency > 0)
      .map((f) => `${f.flavor.name}(${f.potency})`)
      .join(', ')}`
  );
  console.log();

  // Example 7: Cache statistics
  console.log('7. Cache statistics:');
  const cacheStats = api.getCacheStats();
  console.log(`   Cached items: ${cacheStats.size}/${cacheStats.maxSize}`);
  console.log(`   Cache enabled: ${cacheStats.enabled}`);
  console.log();

  console.log('=== Done! ===');
}

// Run examples
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
