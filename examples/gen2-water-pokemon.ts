/**
 * Find all Water-type Pokemon in Generation 2
 * Generation 2 includes Pokemon #152-251 (Chikorita to Celebi)
 */

import { PokeAPI } from '../src/index';

async function main() {
  const api = new PokeAPI();

  console.log('=== Generation 2 Water Pokemon Finder ===\n');
  console.log('Searching Generation 2 Pokemon (IDs 152-251)...\n');

  // Generation 2 Pokemon IDs range from 152 to 251
  const GEN2_START = 152;
  const GEN2_END = 251;

  const waterPokemon: Array<{
    id: number;
    name: string;
    types: string[];
    sprite?: string;
  }> = [];

  // Fetch all Gen 2 Pokemon and filter for water types
  for (let id = GEN2_START; id <= GEN2_END; id++) {
    try {
      const pokemon = await api.pokemon.getPokemon(id);

      // Check if Pokemon has water type
      const types = pokemon.types.map((t) => t.type.name);
      const isWaterType = types.includes('water');

      if (isWaterType) {
        waterPokemon.push({
          id: pokemon.id,
          name: pokemon.name,
          types: types,
          sprite: pokemon.sprites.front_default || undefined,
        });

        // Show progress
        console.log(`Found: #${pokemon.id} ${pokemon.name} (${types.join('/')})`);
      }
    } catch (error) {
      console.error(`Error fetching Pokemon #${id}:`, error);
    }
  }

  // Display results
  console.log('\n=== Results ===');
  console.log(`\nTotal Water Pokemon in Generation 2: ${waterPokemon.length}\n`);

  if (waterPokemon.length > 0) {
    console.log('Water Pokemon found:');
    waterPokemon.forEach((pokemon) => {
      const typeString = pokemon.types.join('/');
      console.log(`  #${pokemon.id.toString().padStart(3, '0')} - ${pokemon.name.padEnd(12)} [${typeString}]`);
    });

    // Show some additional stats
    console.log('\n=== Statistics ===');
    const pureWater = waterPokemon.filter((p) => p.types.length === 1);
    const dualType = waterPokemon.filter((p) => p.types.length === 2);

    console.log(`Pure Water-type: ${pureWater.length}`);
    console.log(`Dual-type: ${dualType.length}`);

    if (dualType.length > 0) {
      console.log('\nType combinations:');
      const typeCombos = new Map<string, number>();
      dualType.forEach((p) => {
        const otherType = p.types.find((t) => t !== 'water');
        if (otherType) {
          typeCombos.set(otherType, (typeCombos.get(otherType) || 0) + 1);
        }
      });

      Array.from(typeCombos.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          console.log(`  Water/${type}: ${count}`);
        });
    }
  } else {
    console.log('No Water-type Pokemon found in Generation 2.');
  }

  // Cache stats
  console.log('\n=== Cache Statistics ===');
  const cacheStats = api.getCacheStats();
  console.log(`Cached requests: ${cacheStats.size}/${cacheStats.maxSize}`);

  console.log('\n=== Done! ===');
}

// Run the script
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
