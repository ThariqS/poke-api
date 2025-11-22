/**
 * Comprehensive Gen 2 OU team analysis using Smogon usage statistics
 */

import { PokeAPI } from '../src/index';
import { formatReport } from '../src/modules/smogon/reports';

async function main() {
  const api = new PokeAPI();

  console.log('='.repeat(60));
  console.log('Gen 2 OU Team Analysis');
  console.log('='.repeat(60));
  console.log();

  // Define a Gen 2 OU team
  const team = ['Snorlax', 'Zapdos', 'Tyranitar', 'Exeggutor', 'Steelix', 'Machamp'];

  console.log('Team:');
  team.forEach((pokemon, i) => console.log(`  ${i + 1}. ${pokemon}`));
  console.log();

  // Load Gen 2 OU 1760 data
  console.log('Loading Smogon Gen 2 OU (1760 rating) data...');
  api.smogon.loadFormat('gen2ou-1760');
  console.log('✓ Data loaded\n');

  // 1. Get top Pokemon in the meta
  console.log('TOP 10 POKEMON IN GEN 2 OU:');
  const topPokemon = api.smogon.getTopPokemon(10);
  topPokemon.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} (${p.rawCount} uses, viability: ${p.viabilityCeiling})`);
  });
  console.log();

  // 2. Get Pokemon data
  console.log('TEAM MEMBER DETAILS:');
  for (const pokemonName of team) {
    const data = api.smogon.getPokemon(pokemonName);
    if (data) {
      console.log(`\n${pokemonName}:`);
      console.log(`  Usage: ${data.rawCount} times`);
      console.log(`  Viability Ceiling: ${data.viabilityCeiling}`);

      // Top 4 moves
      const topMoves = Array.from(data.moves.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);
      console.log(`  Common moves: ${topMoves.map(([move, pct]) => `${move} (${pct.toFixed(1)}%)`).join(', ')}`);

      // Top item
      const topItem = Array.from(data.items.entries())
        .sort((a, b) => b[1] - a[1])[0];
      if (topItem) {
        console.log(`  Common item: ${topItem[0]} (${topItem[1].toFixed(1)}%)`);
      }
    }
  }
  console.log('\n' + '='.repeat(60) + '\n');

  // 3. Team synergy analysis
  console.log('TEAM SYNERGY ANALYSIS:');
  const synergy = api.smogon.calculateTeamSynergy(team);
  console.log(`Overall Synergy Score: ${synergy.score.toFixed(1)}/100\n`);

  if (synergy.strongPairs.length > 0) {
    console.log('Strong Pairs:');
    synergy.strongPairs.slice(0, 5).forEach((pair) => {
      console.log(`  • ${pair.pokemon1} + ${pair.pokemon2}: ${pair.score.toFixed(1)}% co-occurrence`);
    });
    console.log();
  }

  if (synergy.weakPairs.length > 0) {
    console.log('Weak Pairs (low synergy):');
    synergy.weakPairs.slice(0, 3).forEach((pair) => {
      console.log(`  • ${pair.pokemon1} + ${pair.pokemon2}: ${pair.score.toFixed(1)}% co-occurrence`);
    });
    console.log();
  }

  console.log('Suggested Teammates:');
  synergy.suggestedTeammates.slice(0, 5).forEach((tm) => {
    console.log(`  • ${tm.name} (${tm.score.toFixed(1)}% avg synergy)`);
  });
  console.log('\n' + '='.repeat(60) + '\n');

  // 4. Weakness analysis
  console.log('DEFENSIVE ANALYSIS:');
  const weaknesses = api.smogon.analyzeTeamWeaknesses(team);
  console.log(`Defensive Score: ${weaknesses.defensiveScore.toFixed(1)}/100\n`);

  if (weaknesses.blindSpots.length > 0) {
    console.log('⚠️  BLIND SPOTS (Pokemon that threaten multiple team members):');
    weaknesses.blindSpots.slice(0, 5).forEach((bs) => {
      console.log(`  • ${bs.pokemon} threatens ${bs.threatens.length} members: ${bs.threatens.join(', ')}`);
      console.log(`    Average counter score: ${bs.avgScore.toFixed(2)}`);
    });
    console.log();
  }

  if (weaknesses.majorThreats.length > 0) {
    console.log('Major Threats:');
    weaknesses.majorThreats.slice(0, 5).forEach((threat) => {
      console.log(`  • ${threat.pokemon} (threat score: ${threat.threatScore.toFixed(1)})`);
      if (threat.threatens.length > 0) {
        console.log(`    Threatens: ${threat.threatens.map((t) => t.name).join(', ')}`);
      }
      if (threat.threatenedBy.length > 0) {
        console.log(`    Checked by: ${threat.threatenedBy.map((t) => t.name).join(', ')}`);
      }
    });
    console.log();
  }

  if (weaknesses.suggestions.length > 0) {
    console.log('Suggestions:');
    weaknesses.suggestions.forEach((suggestion) => {
      console.log(`  • ${suggestion}`);
    });
    console.log();
  }
  console.log('='.repeat(60) + '\n');

  // 5. Coverage analysis
  console.log('COVERAGE ANALYSIS:');
  const coverage = api.smogon.analyzeCoverage(team);
  console.log(`Coverage Score: ${coverage.coverageScore.toFixed(1)}/100\n`);

  if (coverage.gaps.length > 0) {
    console.log(`Coverage Gaps (${coverage.gaps.length} types):`);
    console.log(`  ${coverage.gaps.join(', ')}`);
    console.log();
  } else {
    console.log('✓ Complete type coverage!\n');
  }

  if (coverage.redundancies.length > 0) {
    console.log('Redundant Coverage:');
    coverage.redundancies.forEach((red) => {
      console.log(`  • ${red.type} type used by ${red.pokemon.length} Pokemon: ${red.pokemon.join(', ')}`);
    });
    console.log();
  }

  if (coverage.suggestions.length > 0) {
    console.log('Coverage Suggestions:');
    coverage.suggestions.slice(0, 5).forEach((suggestion) => {
      console.log(`  • ${suggestion.pokemon}: ${suggestion.move} - ${suggestion.reason}`);
    });
    console.log();
  }
  console.log('='.repeat(60) + '\n');

  // 6. Move redundancy check
  console.log('MOVE REDUNDANCY ANALYSIS:');
  const redundancy = api.smogon.checkMoveRedundancy(team);
  console.log(`Redundancy Score: ${redundancy.redundancyScore.toFixed(1)}/100 (lower is better)\n`);

  if (redundancy.duplicateMoves.size > 0) {
    console.log('Duplicate Moves:');
    for (const [move, pokemon] of redundancy.duplicateMoves) {
      console.log(`  • ${move}: ${pokemon.join(', ')}`);
    }
    console.log();
  }

  if (redundancy.excessiveCoverage.length > 0) {
    console.log('Excessive Type Coverage:');
    redundancy.excessiveCoverage.forEach((ec) => {
      console.log(`  • ${ec.type}: ${ec.count} Pokemon (${ec.pokemon.join(', ')})`);
    });
    console.log();
  }
  console.log('='.repeat(60) + '\n');

  // 7. Comprehensive report
  console.log('GENERATING COMPREHENSIVE REPORT...\n');
  const report = api.smogon.generateTeamReport(team);
  const formattedReport = formatReport(report);
  console.log(formattedReport);

  // 8. Additional queries
  console.log('\n' + '='.repeat(60));
  console.log('ADDITIONAL QUERIES');
  console.log('='.repeat(60) + '\n');

  // Find counters to a specific threat
  console.log('Finding counters to Snorlax:');
  const snorlaxCounters = api.smogon.findCounters('Snorlax', 1.0);
  snorlaxCounters.slice(0, 5).forEach((counter) => {
    console.log(`  • ${counter.pokemon} (score: ${counter.score.toFixed(2)})`);
  });
  console.log();

  // Find Pokemon that use a specific move
  console.log('Pokemon that commonly use Earthquake:');
  const earthquakeUsers = api.smogon.findPokemonWithMove('Earthquake', 50);
  earthquakeUsers.slice(0, 5).forEach((user) => {
    console.log(`  • ${user.pokemon} (${user.percentage.toFixed(1)}%)`);
  });
  console.log();

  // Calculate threat score
  const gengarThreat = api.smogon.findBlindSpots(team).find(
    (bs) => bs.pokemon.toLowerCase() === 'gengar'
  );
  if (gengarThreat) {
    console.log(`Gengar as a threat to this team:`);
    console.log(`  Threatens: ${gengarThreat.threatens.join(', ')}`);
    console.log(`  Average score: ${gengarThreat.avgScore.toFixed(2)}`);
  }

  console.log('\n✓ Analysis complete!');
}

main().catch((error) => {
  console.error('Error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
