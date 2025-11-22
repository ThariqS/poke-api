/**
 * Team Analyzer - Analyzes a Pokemon team for type coverage and weaknesses
 *
 * Usage: bun run examples/team-analyzer.ts <pokemon1> <pokemon2> ...
 * Example: bun run examples/team-analyzer.ts pikachu charizard blastoise
 */

import { PokeAPI } from '../src/index';
import type { Pokemon, Type } from '../src/types';

interface TeamMember {
  name: string;
  pokemon: Pokemon;
  types: Type[];
}

interface TypeEffectiveness {
  type: string;
  multiplier: number;
}

interface TeamAnalysis {
  members: TeamMember[];
  offensiveCoverage: Set<string>;
  coverageGaps: string[];
  teamWeaknesses: Map<string, string[]>; // type -> pokemon weak to it
  teamResistances: Map<string, string[]>; // type -> pokemon resistant to it
  criticalWeaknesses: string[]; // types that hit 3+ pokemon
}

async function fetchTeamData(api: PokeAPI, pokemonNames: string[]): Promise<TeamMember[]> {
  const members: TeamMember[] = [];

  for (const name of pokemonNames) {
    try {
      console.log(`Fetching ${name}...`);
      const pokemon = await api.pokemon.getPokemon(name.toLowerCase());

      // Fetch type data for each type
      const types: Type[] = [];
      for (const typeSlot of pokemon.types) {
        const typeData = await api.pokemon.getType(typeSlot.type.name);
        types.push(typeData);
      }

      members.push({ name: pokemon.name, pokemon, types });
    } catch (error) {
      console.error(`Error fetching ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return members;
}

function calculateDefensiveMatchup(types: Type[]): Map<string, number> {
  const effectiveness = new Map<string, number>();

  // Initialize all types to 1x
  const allTypes = new Set<string>();
  types.forEach(type => {
    type.damage_relations.double_damage_from.forEach(t => allTypes.add(t.name));
    type.damage_relations.half_damage_from.forEach(t => allTypes.add(t.name));
    type.damage_relations.no_damage_from.forEach(t => allTypes.add(t.name));
  });
  allTypes.forEach(type => effectiveness.set(type, 1));

  // Calculate combined effectiveness for all types
  types.forEach(type => {
    // Double damage from (2x)
    type.damage_relations.double_damage_from.forEach(t => {
      const current = effectiveness.get(t.name) || 1;
      effectiveness.set(t.name, current * 2);
    });

    // Half damage from (0.5x)
    type.damage_relations.half_damage_from.forEach(t => {
      const current = effectiveness.get(t.name) || 1;
      effectiveness.set(t.name, current * 0.5);
    });

    // No damage from (0x)
    type.damage_relations.no_damage_from.forEach(t => {
      effectiveness.set(t.name, 0);
    });
  });

  return effectiveness;
}

function analyzeTeam(members: TeamMember[]): TeamAnalysis {
  const offensiveCoverage = new Set<string>();
  const teamWeaknesses = new Map<string, string[]>();
  const teamResistances = new Map<string, string[]>();

  // Analyze each team member
  members.forEach(member => {
    // Add their types to offensive coverage
    member.pokemon.types.forEach(typeSlot => {
      offensiveCoverage.add(typeSlot.type.name);
    });

    // Calculate defensive matchups
    const defensive = calculateDefensiveMatchup(member.types);

    defensive.forEach((multiplier, attackType) => {
      if (multiplier > 1) {
        // Weakness
        if (!teamWeaknesses.has(attackType)) {
          teamWeaknesses.set(attackType, []);
        }
        teamWeaknesses.get(attackType)!.push(`${member.name} (${multiplier}x)`);
      } else if (multiplier < 1 && multiplier > 0) {
        // Resistance
        if (!teamResistances.has(attackType)) {
          teamResistances.set(attackType, []);
        }
        teamResistances.get(attackType)!.push(`${member.name} (${multiplier}x)`);
      } else if (multiplier === 0) {
        // Immunity
        if (!teamResistances.has(attackType)) {
          teamResistances.set(attackType, []);
        }
        teamResistances.get(attackType)!.push(`${member.name} (immune)`);
      }
    });
  });

  // Find critical weaknesses (types that hit 3+ pokemon)
  const criticalWeaknesses: string[] = [];
  teamWeaknesses.forEach((pokemon, type) => {
    if (pokemon.length >= 3) {
      criticalWeaknesses.push(type);
    }
  });

  // Find coverage gaps (common types not in offensive coverage)
  const commonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];
  const coverageGaps = commonTypes.filter(type => !offensiveCoverage.has(type));

  return {
    members,
    offensiveCoverage,
    coverageGaps,
    teamWeaknesses,
    teamResistances,
    criticalWeaknesses
  };
}

function displayAnalysis(analysis: TeamAnalysis): void {
  console.log('\n=== TEAM ANALYSIS ===\n');

  // Team roster
  console.log('Team Members:');
  analysis.members.forEach((member, index) => {
    const types = member.pokemon.types.map(t => t.type.name).join('/');
    console.log(`${index + 1}. ${member.name.charAt(0).toUpperCase() + member.name.slice(1)} (${types})`);
  });

  // Critical weaknesses
  if (analysis.criticalWeaknesses.length > 0) {
    console.log('\n=== ⚠️  CRITICAL WEAKNESSES ===');
    console.log('(Types that threaten 3+ team members)\n');
    analysis.criticalWeaknesses.forEach(type => {
      const pokemon = analysis.teamWeaknesses.get(type) || [];
      console.log(`  ${type.toUpperCase()}: ${pokemon.join(', ')}`);
    });
  }

  // All weaknesses
  console.log('\n=== DEFENSIVE ANALYSIS ===\n');
  console.log('Team Weaknesses:');
  const weaknessesSorted = Array.from(analysis.teamWeaknesses.entries())
    .sort((a, b) => b[1].length - a[1].length);

  if (weaknessesSorted.length > 0) {
    weaknessesSorted.forEach(([type, pokemon]) => {
      console.log(`  ${type}: ${pokemon.join(', ')}`);
    });
  } else {
    console.log('  None!');
  }

  console.log('\nTeam Resistances:');
  const resistancesSorted = Array.from(analysis.teamResistances.entries())
    .sort((a, b) => b[1].length - a[1].length);

  if (resistancesSorted.length > 0) {
    resistancesSorted.forEach(([type, pokemon]) => {
      console.log(`  ${type}: ${pokemon.join(', ')}`);
    });
  } else {
    console.log('  None!');
  }

  // Offensive coverage
  console.log('\n=== OFFENSIVE COVERAGE ===\n');
  console.log('Types available to your team:');
  const coverageList = Array.from(analysis.offensiveCoverage).sort();
  console.log(`  ✓ ${coverageList.join(', ')}`);

  if (analysis.coverageGaps.length > 0) {
    console.log('\nCoverage Gaps (types not on your team):');
    console.log(`  ✗ ${analysis.coverageGaps.join(', ')}`);
  } else {
    console.log('\nNo coverage gaps - you have all types represented!');
  }

  // Recommendations
  console.log('\n=== RECOMMENDATIONS ===\n');

  if (analysis.criticalWeaknesses.length > 0) {
    console.log('Priority: Address critical weaknesses!');
    analysis.criticalWeaknesses.forEach(type => {
      console.log(`  - Add Pokemon that resist ${type.toUpperCase()} type`);
    });
    console.log();
  }

  if (analysis.coverageGaps.length > 0) {
    console.log('Consider adding these types for better coverage:');
    const topGaps = analysis.coverageGaps.slice(0, 5);
    topGaps.forEach(type => {
      console.log(`  - ${type.charAt(0).toUpperCase() + type.slice(1)} type Pokemon`);
    });
  }

  if (analysis.criticalWeaknesses.length === 0 && analysis.coverageGaps.length <= 3) {
    console.log('Your team looks well-balanced! 🎉');
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: bun run examples/team-analyzer.ts <pokemon1> <pokemon2> ...');
    console.log('Example: bun run examples/team-analyzer.ts pikachu charizard blastoise');
    process.exit(1);
  }

  const api = new PokeAPI();

  console.log('🔍 Analyzing your Pokemon team...\n');

  // Fetch team data
  const members = await fetchTeamData(api, args);

  if (members.length === 0) {
    console.error('No valid Pokemon found. Please check your input.');
    process.exit(1);
  }

  // Analyze the team
  const analysis = analyzeTeam(members);

  // Display results
  displayAnalysis(analysis);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
