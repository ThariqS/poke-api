/**
 * Comprehensive team report generation
 */

import type {
  PokemonUsageData,
  ComprehensiveReport,
  MetaComparison,
} from '../../types/smogon';
import { calculateTeamSynergy, analyzeTeamComposition } from './team-synergy';
import { analyzeTeamWeaknesses } from './counter-analysis';
import { analyzeCoverage, checkMoveRedundancy } from './coverage';

/**
 * Generate a comprehensive team analysis report
 * @param team Array of Pokemon names
 * @param usageData Usage data map
 */
export function generateTeamReport(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): ComprehensiveReport {
  const normalizedTeam = team.map((name) => name.toLowerCase());

  // Run all analyses
  const synergy = calculateTeamSynergy(normalizedTeam, usageData);
  const weaknesses = analyzeTeamWeaknesses(normalizedTeam, usageData);
  const coverage = analyzeCoverage(normalizedTeam, usageData);
  const redundancy = checkMoveRedundancy(normalizedTeam, usageData);
  const meta = generateMetaComparison(normalizedTeam, usageData);

  // Calculate overall score (0-100)
  const overallScore = calculateOverallScore(synergy, weaknesses, coverage, redundancy, meta);

  // Generate summary
  const summary = generateSummary(normalizedTeam, synergy, weaknesses, coverage, meta);

  // Generate recommendations
  const recommendations = generateRecommendations(synergy, weaknesses, coverage, redundancy);

  return {
    team: normalizedTeam,
    synergy,
    weaknesses,
    coverage,
    meta,
    redundancy,
    overallScore,
    summary,
    recommendations,
  };
}

/**
 * Generate meta comparison data
 */
function generateMetaComparison(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): MetaComparison {
  const composition = analyzeTeamComposition(team, usageData);
  const allPokemon = Array.from(usageData.values()).sort((a, b) => b.rawCount - a.rawCount);

  // Calculate average usage rank
  let totalRank = 0;
  let validCount = 0;

  for (const pokemonName of team) {
    const rank = allPokemon.findIndex((p) => p.name.toLowerCase() === pokemonName) + 1;
    if (rank > 0) {
      totalRank += rank;
      validCount++;
    }
  }

  const avgUsageRank = validCount > 0 ? totalRank / validCount : 0;

  return {
    avgUsageRank,
    avgViability: composition.avgViability,
    offMetaPicks: composition.offMeta,
    topTierPicks: composition.topTier,
    metaAlignmentScore: composition.metaScore,
  };
}

/**
 * Calculate overall team score
 */
function calculateOverallScore(
  synergy: any,
  weaknesses: any,
  coverage: any,
  redundancy: any,
  meta: any
): number {
  // Weighted average of all scores
  const synergyWeight = 0.25;
  const defenseWeight = 0.30;
  const coverageWeight = 0.25;
  const redundancyWeight = 0.10;
  const metaWeight = 0.10;

  const synergyScore = synergy.score;
  const defenseScore = weaknesses.defensiveScore;
  const coverageScore = coverage.coverageScore;
  const redundancyPenalty = Math.max(0, 100 - redundancy.redundancyScore);
  const metaScore = meta.metaAlignmentScore;

  const overall =
    synergyScore * synergyWeight +
    defenseScore * defenseWeight +
    coverageScore * coverageWeight +
    redundancyPenalty * redundancyWeight +
    metaScore * metaWeight;

  return Math.round(overall);
}

/**
 * Generate summary points
 */
function generateSummary(
  team: string[],
  synergy: any,
  weaknesses: any,
  coverage: any,
  meta: any
): string[] {
  const summary: string[] = [];

  // Team size
  summary.push(`Team of ${team.length} Pokemon`);

  // Synergy assessment
  if (synergy.score >= 70) {
    summary.push(`Strong team synergy (${synergy.score.toFixed(0)}/100)`);
  } else if (synergy.score >= 40) {
    summary.push(`Moderate team synergy (${synergy.score.toFixed(0)}/100)`);
  } else {
    summary.push(`Weak team synergy (${synergy.score.toFixed(0)}/100)`);
  }

  // Defensive assessment
  if (weaknesses.blindSpots.length > 0) {
    summary.push(
      `${weaknesses.blindSpots.length} critical blind spot${weaknesses.blindSpots.length > 1 ? 's' : ''}`
    );
  } else {
    summary.push('No major blind spots identified');
  }

  // Coverage assessment
  if (coverage.gaps.length === 0) {
    summary.push('Complete type coverage');
  } else if (coverage.gaps.length <= 3) {
    summary.push(`Minor coverage gaps (${coverage.gaps.length} types)`);
  } else {
    summary.push(`Significant coverage gaps (${coverage.gaps.length} types)`);
  }

  // Meta relevance
  if (meta.topTierPicks.length >= team.length * 0.5) {
    summary.push('Meta-dominant team composition');
  } else if (meta.offMetaPicks.length >= team.length * 0.5) {
    summary.push('Off-meta team composition');
  } else {
    summary.push('Balanced meta alignment');
  }

  return summary;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  synergy: any,
  weaknesses: any,
  coverage: any,
  redundancy: any
): string[] {
  const recommendations: string[] = [];

  // Synergy recommendations
  if (synergy.score < 50) {
    if (synergy.suggestedTeammates.length > 0) {
      const top = synergy.suggestedTeammates[0];
      recommendations.push(`Consider adding ${top.name} for better synergy (${top.score.toFixed(1)}% compatibility)`);
    }
  }

  if (synergy.weakPairs.length > 0) {
    const weakest = synergy.weakPairs[0];
    recommendations.push(
      `Weak synergy between ${weakest.pokemon1} and ${weakest.pokemon2} (${weakest.score.toFixed(1)}%)`
    );
  }

  // Defensive recommendations
  if (weaknesses.suggestions.length > 0) {
    recommendations.push(...weaknesses.suggestions.slice(0, 2));
  }

  // Coverage recommendations
  if (coverage.suggestions.length > 0) {
    const topSuggestion = coverage.suggestions[0];
    recommendations.push(
      `${topSuggestion.pokemon} could run ${topSuggestion.move}: ${topSuggestion.reason}`
    );
  }

  if (coverage.gaps.length > 0) {
    recommendations.push(`Missing coverage for: ${coverage.gaps.slice(0, 3).join(', ')}`);
  }

  // Redundancy recommendations
  if (redundancy.redundancyScore > 30) {
    if (redundancy.duplicateMoves.size > 0) {
      const firstDupe = Array.from(redundancy.duplicateMoves.entries())[0];
      recommendations.push(
        `Multiple Pokemon running ${firstDupe[0]}: ${firstDupe[1].join(', ')}`
      );
    }
  }

  // Limit to top 8 recommendations
  return recommendations.slice(0, 8);
}

/**
 * Format report as readable text
 */
export function formatReport(report: ComprehensiveReport): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('TEAM ANALYSIS REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  // Team composition
  lines.push('TEAM:');
  lines.push(report.team.map((p) => `  • ${p}`).join('\n'));
  lines.push('');

  // Overall score
  lines.push(`OVERALL SCORE: ${report.overallScore}/100`);
  lines.push('');

  // Summary
  lines.push('SUMMARY:');
  for (const point of report.summary) {
    lines.push(`  • ${point}`);
  }
  lines.push('');

  // Synergy
  lines.push(`SYNERGY ANALYSIS (${report.synergy.score.toFixed(0)}/100):`);
  if (report.synergy.strongPairs.length > 0) {
    lines.push('  Strong pairs:');
    for (const pair of report.synergy.strongPairs.slice(0, 3)) {
      lines.push(`    • ${pair.pokemon1} + ${pair.pokemon2} (${pair.score.toFixed(1)}%)`);
    }
  }
  if (report.synergy.suggestedTeammates.length > 0) {
    lines.push('  Suggested teammates:');
    for (const tm of report.synergy.suggestedTeammates.slice(0, 3)) {
      lines.push(`    • ${tm.name} (${tm.score.toFixed(1)}% synergy)`);
    }
  }
  lines.push('');

  // Weaknesses
  lines.push(`DEFENSIVE ANALYSIS (${report.weaknesses.defensiveScore.toFixed(0)}/100):`);
  if (report.weaknesses.blindSpots.length > 0) {
    lines.push('  Blind spots:');
    for (const bs of report.weaknesses.blindSpots.slice(0, 3)) {
      lines.push(`    • ${bs.pokemon} threatens: ${bs.threatens.join(', ')}`);
    }
  }
  if (report.weaknesses.majorThreats.length > 0) {
    lines.push('  Major threats:');
    for (const threat of report.weaknesses.majorThreats.slice(0, 3)) {
      lines.push(`    • ${threat.pokemon} (threat score: ${threat.threatScore.toFixed(1)})`);
    }
  }
  lines.push('');

  // Coverage
  lines.push(`COVERAGE ANALYSIS (${report.coverage.coverageScore.toFixed(0)}/100):`);
  if (report.coverage.gaps.length > 0) {
    lines.push(`  Coverage gaps: ${report.coverage.gaps.join(', ')}`);
  } else {
    lines.push('  Complete type coverage!');
  }
  lines.push('');

  // Meta
  lines.push('META ANALYSIS:');
  lines.push(`  Average usage rank: #${report.meta.avgUsageRank.toFixed(0)}`);
  lines.push(`  Meta alignment: ${report.meta.metaAlignmentScore.toFixed(0)}/100`);
  if (report.meta.topTierPicks.length > 0) {
    lines.push(`  Top tier picks: ${report.meta.topTierPicks.join(', ')}`);
  }
  if (report.meta.offMetaPicks.length > 0) {
    lines.push(`  Off-meta picks: ${report.meta.offMetaPicks.join(', ')}`);
  }
  lines.push('');

  // Recommendations
  if (report.recommendations.length > 0) {
    lines.push('RECOMMENDATIONS:');
    for (const rec of report.recommendations) {
      lines.push(`  • ${rec}`);
    }
    lines.push('');
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}
