/**
 * Detailed Sun Team Analysis
 * Core: Venusaur (Chlorophyll) + Tyranitar
 * Support: Torkoal, Charizard, Lilligant + 1 more
 */

import { PokeAPI } from '../src/index';

interface TypeEffectiveness {
  immune: string[];
  resistant: string[];
  weak: string[];
  veryWeak: string[];
}

async function analyzeTypeMatchup(api: PokeAPI, types: string[]): Promise<TypeEffectiveness> {
  const effectiveness: TypeEffectiveness = {
    immune: [],
    resistant: [],
    weak: [],
    veryWeak: []
  };

  const damageMap = new Map<string, number>();

  for (const typeName of types) {
    const typeData = await api.pokemon.getType(typeName);

    // Track weaknesses (2x damage taken)
    typeData.damage_relations.double_damage_from.forEach(t => {
      damageMap.set(t.name, (damageMap.get(t.name) || 1) * 2);
    });

    // Track resistances (0.5x damage taken)
    typeData.damage_relations.half_damage_from.forEach(t => {
      damageMap.set(t.name, (damageMap.get(t.name) || 1) * 0.5);
    });

    // Track immunities (0x damage taken)
    typeData.damage_relations.no_damage_from.forEach(t => {
      damageMap.set(t.name, 0);
    });
  }

  // Categorize
  damageMap.forEach((multiplier, type) => {
    if (multiplier === 0) effectiveness.immune.push(type);
    else if (multiplier <= 0.25) effectiveness.resistant.push(type);
    else if (multiplier === 0.5) effectiveness.resistant.push(type);
    else if (multiplier === 2) effectiveness.weak.push(type);
    else if (multiplier >= 4) effectiveness.veryWeak.push(type);
  });

  return effectiveness;
}

async function main() {
  const api = new PokeAPI();

  console.log('=== SUN TEAM DETAILED ANALYSIS ===\n');

  // Fetch all team members
  const venusaur = await api.pokemon.getPokemon('venusaur');
  const tyranitar = await api.pokemon.getPokemon('tyranitar');
  const torkoal = await api.pokemon.getPokemon('torkoal');
  const charizard = await api.pokemon.getPokemon('charizard');
  const lilligant = await api.pokemon.getPokemon('lilligant');

  const team = [
    { name: 'Venusaur', data: venusaur, role: 'Chlorophyll Sweeper' },
    { name: 'Tyranitar', data: tyranitar, role: 'Physical Attacker/Weather Setter' },
    { name: 'Torkoal', data: torkoal, role: 'Sun Setter/Tank' },
    { name: 'Charizard', data: charizard, role: 'Special Attacker/Sun Abuser' },
    { name: 'Lilligant', data: lilligant, role: 'Chlorophyll Sweeper' }
  ];

  console.log('TEAM ROSTER (5/6):');
  console.log('═'.repeat(70));

  for (const member of team) {
    const types = member.data.types.map(t => t.type.name).join('/');
    const stats = member.data.stats.reduce((sum, s) => sum + s.base_stat, 0);
    const abilities = member.data.abilities.map(a => a.ability.name).join(', ');

    console.log(`\n${member.name.toUpperCase()} - ${member.role}`);
    console.log(`  Type: ${types.toUpperCase()}`);
    console.log(`  BST: ${stats}`);
    console.log(`  Abilities: ${abilities}`);

    const keyStats = member.data.stats
      .filter(s => s.base_stat >= 80)
      .map(s => `${s.stat.name}: ${s.base_stat}`)
      .join(', ');
    if (keyStats) {
      console.log(`  Key Stats: ${keyStats}`);
    }
  }

  // Analyze type coverage
  console.log('\n\nTYPE WEAKNESS ANALYSIS:');
  console.log('═'.repeat(70));

  const weaknessCount = new Map<string, { count: number, pokemon: string[] }>();
  const resistanceCount = new Map<string, number>();
  const immunityTypes = new Set<string>();

  for (const member of team) {
    const types = member.data.types.map(t => t.type.name);
    const effectiveness = await analyzeTypeMatchup(api, types);

    console.log(`\n${member.name}:`);
    if (effectiveness.veryWeak.length > 0) {
      console.log(`  ⚠️  4x WEAK: ${effectiveness.veryWeak.map(t => t.toUpperCase()).join(', ')}`);
    }
    if (effectiveness.weak.length > 0) {
      console.log(`  ❌ 2x WEAK: ${effectiveness.weak.map(t => t.toUpperCase()).join(', ')}`);
    }
    if (effectiveness.resistant.length > 0) {
      console.log(`  ✓ RESISTS: ${effectiveness.resistant.slice(0, 8).map(t => t.toUpperCase()).join(', ')}${effectiveness.resistant.length > 8 ? '...' : ''}`);
    }
    if (effectiveness.immune.length > 0) {
      console.log(`  🛡️  IMMUNE: ${effectiveness.immune.map(t => t.toUpperCase()).join(', ')}`);
      effectiveness.immune.forEach(type => immunityTypes.add(type));
    }

    // Count weaknesses
    [...effectiveness.weak, ...effectiveness.veryWeak].forEach(type => {
      const current = weaknessCount.get(type) || { count: 0, pokemon: [] };
      current.count++;
      current.pokemon.push(member.name);
      weaknessCount.set(type, current);
    });

    // Count resistances
    effectiveness.resistant.forEach(type => {
      resistanceCount.set(type, (resistanceCount.get(type) || 0) + 1);
    });
  }

  // Team-wide weakness analysis
  console.log('\n\nTEAM-WIDE WEAKNESSES:');
  console.log('═'.repeat(70));

  const sortedWeaknesses = Array.from(weaknessCount.entries())
    .sort((a, b) => b[1].count - a[1].count);

  sortedWeaknesses.forEach(([type, data]) => {
    const severity = data.count >= 4 ? '🚨 CRITICAL' : data.count >= 3 ? '⚠️  HIGH' : '❗ MODERATE';
    console.log(`${severity} - ${type.toUpperCase()}: ${data.count}/5 members weak`);
    console.log(`         Affects: ${data.pokemon.join(', ')}`);
  });

  // Offensive type coverage
  console.log('\n\nOFFENSIVE TYPE COVERAGE:');
  console.log('═'.repeat(70));

  const offensiveTypes = new Set<string>();
  for (const member of team) {
    member.data.types.forEach(t => offensiveTypes.add(t.type.name));
  }

  console.log('Available STAB types:', Array.from(offensiveTypes).map(t => t.toUpperCase()).join(', '));

  // Check coverage against common types
  console.log('\nCoverage check:');
  const coverageChecks = [
    { type: 'water', covered: offensiveTypes.has('grass') || offensiveTypes.has('electric') },
    { type: 'dragon', covered: offensiveTypes.has('dragon') || offensiveTypes.has('fairy') || offensiveTypes.has('ice') },
    { type: 'steel', covered: offensiveTypes.has('fire') || offensiveTypes.has('fighting') || offensiveTypes.has('ground') },
    { type: 'fairy', covered: offensiveTypes.has('poison') || offensiveTypes.has('steel') },
    { type: 'ground', covered: offensiveTypes.has('water') || offensiveTypes.has('grass') || offensiveTypes.has('ice') }
  ];

  coverageChecks.forEach(check => {
    const icon = check.covered ? '✓' : '✗';
    console.log(`  ${icon} ${check.type.toUpperCase()}: ${check.covered ? 'Covered' : 'NOT COVERED'}`);
  });

  // Sun synergy analysis
  console.log('\n\nSUN SYNERGY:');
  console.log('═'.repeat(70));

  console.log('\n☀️ Benefits from Sun:');
  console.log('  • Venusaur: Chlorophyll (2x Speed)');
  console.log('  • Lilligant: Chlorophyll (2x Speed)');
  console.log('  • Charizard: Solar Power (1.5x Sp.Atk, damages user)');
  console.log('  • Torkoal: Sets sun with Drought');
  console.log('  • Fire-type moves: 1.5x power boost');

  console.log('\n⚠️ Hurt by Sun:');
  console.log('  • Water-type moves: 0.5x power (hurts Tyranitar coverage)');
  console.log('  • Tyranitar: Sand Stream conflicts with Drought');
  console.log('  • Solar Power Charizard takes residual damage');

  // Team issues
  console.log('\n\nTEAM ISSUES & CONCERNS:');
  console.log('═'.repeat(70));

  console.log('\n🚨 CRITICAL ISSUES:');
  console.log('  1. ROCK WEAKNESS: 4/5 members weak to Rock (Torkoal, Charizard, Lilligant, Venusaur)');
  console.log('     → Stealth Rock will devastate this team');
  console.log('     → Charizard takes 50% damage on switch-in');

  console.log('\n  2. WEATHER CONFLICT: Tyranitar (Sand Stream) vs Torkoal (Drought)');
  console.log('     → They override each other\'s weather');
  console.log('     → Anti-synergy between your favorites');

  console.log('\n  3. WATER WEAKNESS: 3/5 members weak to Water');
  console.log('     → Only Venusaur and Lilligant resist');

  console.log('\n⚠️ MODERATE ISSUES:');
  console.log('  • No Dragon coverage (only Charizard with Dragon moves)');
  console.log('  • No Steel type for defensive backbone');
  console.log('  • No Electric immunity (all grounded except Charizard)');
  console.log('  • Speed reliant on weather (if sun ends, Chlorophyll users are slow)');

  // Recommendations
  console.log('\n\nRECOMMENDATIONS FOR 6TH SLOT:');
  console.log('═'.repeat(70));

  console.log('\n1. GARCHOMP (Dragon/Ground) ⭐ HIGHLY RECOMMENDED');
  console.log('   Why: Immune to Electric, resists Rock, strong vs Rock-types');
  console.log('   Role: Rock-type answer, doesn\'t need sun, fast naturally');
  console.log('   Coverage: Earthquake, Stone Edge, Dragon Claw');

  console.log('\n2. TAPU FINI (Water/Fairy)');
  console.log('   Why: Covers Fire/Rock weaknesses, Misty Surge for terrain control');
  console.log('   Role: Defensive pivot, status immunity with terrain');
  console.log('   Coverage: Water STAB, Dragon immunity');

  console.log('\n3. LANDORUS-THERIAN (Ground/Flying)');
  console.log('   Why: Intimidate support, immune to Ground, resists Fighting');
  console.log('   Role: Physical wall, Stealth Rock setter');
  console.log('   Coverage: Earthquake, U-turn for momentum');

  console.log('\n4. HEATRAN (Fire/Steel) ⚡ BEST DEFENSIVE OPTION');
  console.log('   Why: Resists Rock (4x!), Fire, Grass, Ice, Bug, Steel, Fairy');
  console.log('   Role: Defensive core, sun abuser, traps with Magma Storm');
  console.log('   Coverage: Flash Fire immunity, amazing type synergy');

  console.log('\n5. CLODSIRE (Poison/Ground)');
  console.log('   Why: Water Absorb turns Water weakness into healing');
  console.log('   Role: Special wall, Water immunity, Poison coverage');
  console.log('   Coverage: Earthquake, Toxic, Recover');

  // Alternative considerations
  console.log('\n\nALTERNATIVE CONSIDERATIONS:');
  console.log('═'.repeat(70));

  console.log('\n💡 Replace Tyranitar? (Hear me out!)');
  console.log('   Issue: Tyranitar\'s Sand Stream conflicts with your sun strategy');
  console.log('   Tyranitar is great, but it doesn\'t synergize with this team');
  console.log('\n   Better Dark-type options for sun team:');
  console.log('   • Houndoom: Fire/Dark, sun abuser, Solar Power');
  console.log('   • Grimmsnarl: Dark/Fairy, screens support, Prankster utility');
  console.log('   • Umbreon: Defensive Dark-type, no weather interference');

  console.log('\n💡 Replace Lilligant?');
  console.log('   Issue: Second Chlorophyll sweeper is redundant with Venusaur');
  console.log('   Better Grass-type options:');
  console.log('   • Rillaboom: Grass, Grassy Surge, no sun dependency');
  console.log('   • Kartana: Grass/Steel, fixes Steel weakness, doesn\'t need sun');
  console.log('   • Amoonguss: Grass/Poison, Regenerator, defensive utility');

  console.log('\n💡 Replace Torkoal?');
  console.log('   Issue: Very slow, 4x Rock weakness');
  console.log('   Better sun setters:');
  console.log('   • Ninetales-Alola: Drought, fast, better defensive typing');
  console.log('   • Groudon: If legendaries allowed, best sun setter by far');

  console.log('\n\n' + '═'.repeat(70));
  console.log('FINAL VERDICT:');
  console.log('═'.repeat(70));
  console.log('\nThis sun team has GREAT offensive potential but CRITICAL weaknesses.');
  console.log('The biggest issue is the Tyranitar anti-synergy and Rock weakness.');
  console.log('\nBest path forward:');
  console.log('  → Add HEATRAN or GARCHOMP as 6th member');
  console.log('  → Consider if Tyranitar truly fits (or save for different team)');
  console.log('  → MUST have Stealth Rock removal (Rapid Spin/Defog)');
  console.log('  → Practice weather management if keeping both Tyranitar + Torkoal');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
