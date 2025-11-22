/**
 * Team builder for Venusaur and Tyranitar
 * Analyzes their types, weaknesses, and suggests team compositions
 */

import { PokeAPI } from '../src/index';

async function main() {
  const api = new PokeAPI();

  console.log('=== VENUSAUR & TYRANITAR TEAM BUILDER ===\n');

  // Fetch both Pokemon
  const venusaur = await api.pokemon.getPokemon('venusaur');
  const tyranitar = await api.pokemon.getPokemon('tyranitar');

  console.log('YOUR CORE POKEMON:');
  console.log('─'.repeat(50));

  // Venusaur analysis
  console.log(`\n1. VENUSAUR (#${venusaur.id})`);
  console.log(`   Types: ${venusaur.types.map(t => t.type.name.toUpperCase()).join(' / ')}`);
  console.log(`   Base Stats Total: ${venusaur.stats.reduce((sum, s) => sum + s.base_stat, 0)}`);
  console.log(`   Notable Stats:`);
  venusaur.stats.forEach(s => {
    if (s.base_stat >= 80) {
      console.log(`   - ${s.stat.name}: ${s.base_stat}`);
    }
  });
  console.log(`   Abilities: ${venusaur.abilities.map(a => a.ability.name).join(', ')}`);

  // Tyranitar analysis
  console.log(`\n2. TYRANITAR (#${tyranitar.id})`);
  console.log(`   Types: ${tyranitar.types.map(t => t.type.name.toUpperCase()).join(' / ')}`);
  console.log(`   Base Stats Total: ${tyranitar.stats.reduce((sum, s) => sum + s.base_stat, 0)}`);
  console.log(`   Notable Stats:`);
  tyranitar.stats.forEach(s => {
    if (s.base_stat >= 95) {
      console.log(`   - ${s.stat.name}: ${s.base_stat}`);
    }
  });
  console.log(`   Abilities: ${tyranitar.abilities.map(a => a.ability.name).join(', ')}`);

  // Analyze type coverage
  console.log('\n\nTYPE ANALYSIS:');
  console.log('─'.repeat(50));

  const grassPoisonType = await api.pokemon.getType('grass');
  const rockDarkType = await api.pokemon.getType('rock');
  const darkType = await api.pokemon.getType('dark');

  console.log('\nVENUSAUR (Grass/Poison) WEAKNESSES:');
  const venusaurWeaknesses = grassPoisonType.damage_relations.double_damage_from;
  console.log(`   2x from: ${venusaurWeaknesses.map(t => t.name.toUpperCase()).join(', ')}`);

  console.log('\nTYRANITAR (Rock/Dark) WEAKNESSES:');
  const tyranitarWeaknesses = [
    ...new Set([
      ...rockDarkType.damage_relations.double_damage_from.map(t => t.name),
      ...darkType.damage_relations.double_damage_from.map(t => t.name)
    ])
  ];
  console.log(`   Weak to: ${tyranitarWeaknesses.map(t => t.toUpperCase()).join(', ')}`);

  // Combined weaknesses to cover
  const allWeaknesses = [...new Set([
    ...venusaurWeaknesses.map(t => t.name),
    ...tyranitarWeaknesses
  ])];

  console.log('\n\nCOMBINED TEAM WEAKNESSES TO COVER:');
  console.log('─'.repeat(50));
  console.log(allWeaknesses.map(t => t.toUpperCase()).join(', '));

  // Suggest complementary types
  console.log('\n\nRECOMMENDED COMPLEMENTARY TYPES:');
  console.log('─'.repeat(50));

  const recommendations = [
    {
      type: 'Steel',
      reason: 'Resists Psychic, Ice, Flying; Strong defensive pivot'
    },
    {
      type: 'Water',
      reason: 'Covers Ground, Fighting, Rock weaknesses; Good special defense'
    },
    {
      type: 'Dragon',
      reason: 'Resists Grass, Fire, Water, Electric; Offensive powerhouse'
    },
    {
      type: 'Electric',
      reason: 'Covers Flying weakness; Fast offensive pressure'
    },
    {
      type: 'Fire',
      reason: 'Covers Bug, Steel, Ice; Offensive synergy with Tyranitar'
    },
    {
      type: 'Ground',
      reason: 'Covers Steel, Fire weaknesses; Strong physical attacker'
    }
  ];

  recommendations.forEach(rec => {
    console.log(`\n${rec.type.toUpperCase()}`);
    console.log(`   → ${rec.reason}`);
  });

  console.log('\n\nTEAM ARCHETYPES:');
  console.log('─'.repeat(50));

  console.log('\n1. SAND STORM TEAM (Weather-based)');
  console.log('   Core: Venusaur + Tyranitar');
  console.log('   Strategy: Tyranitar sets Sand Stream, use Venusaur for special walls');
  console.log('   Add: Excadrill (Ground/Steel), Garchomp (Dragon/Ground)');
  console.log('   Focus: Physical offense + Weather control');

  console.log('\n2. BALANCED CORE (Mixed offense)');
  console.log('   Core: Venusaur + Tyranitar');
  console.log('   Strategy: Balance special (Venusaur) and physical (Tyranitar) attacks');
  console.log('   Add: Rotom-Wash (Electric/Water), Landorus-T (Ground/Flying)');
  console.log('   Focus: Type coverage + Defensive pivots');

  console.log('\n3. HYPER OFFENSE');
  console.log('   Core: Venusaur + Tyranitar');
  console.log('   Strategy: Fast-paced aggressive gameplay');
  console.log('   Add: Dragapult (Dragon/Ghost), Tapu Koko (Electric/Fairy)');
  console.log('   Focus: Speed control + Heavy hitting');

  console.log('\n4. TRICK ROOM TEAM');
  console.log('   Core: Venusaur + Tyranitar');
  console.log('   Strategy: Both are relatively slow, use Trick Room to reverse speed');
  console.log('   Add: Cresselia (Psychic), Conkeldurr (Fighting)');
  console.log('   Focus: Slow, bulky attackers + Speed manipulation');

  console.log('\n5. SUN TEAM (Hybrid Weather)');
  console.log('   Core: Venusaur (Chlorophyll) + Tyranitar');
  console.log('   Strategy: Venusaur with Chlorophyll in Sun, Tyranitar as plan B');
  console.log('   Add: Torkoal (Fire), Charizard (Fire/Flying)');
  console.log('   Focus: Venusaur speed doubling + Fire power');

  console.log('\n');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
