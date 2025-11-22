/**
 * Team synergy analysis functions
 */

import type { PokemonUsageData, TeamSynergyAnalysis } from '../../types/smogon';

/**
 * Calculate team synergy based on teammate co-occurrence percentages
 * @param team Array of Pokemon names
 * @param usageData Usage data map
 */
export function calculateTeamSynergy(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): TeamSynergyAnalysis {
  const normalizedTeam = team.map((name) => name.toLowerCase());
  const strongPairs: Array<{ pokemon1: string; pokemon2: string; score: number }> = [];
  const weakPairs: Array<{ pokemon1: string; pokemon2: string; score: number }> = [];

  // Calculate pairwise synergy scores
  const pairScores: Map<string, number> = new Map();

  for (let i = 0; i < normalizedTeam.length; i++) {
    const pokemon1 = normalizedTeam[i];
    const data1 = usageData.get(pokemon1);
    if (!data1) continue;

    for (let j = i + 1; j < normalizedTeam.length; j++) {
      const pokemon2 = normalizedTeam[j];
      const data2 = usageData.get(pokemon2);
      if (!data2) continue;

      // Calculate bidirectional synergy
      const synergy1to2 = data1.teammates.get(pokemon2) || 0;
      const synergy2to1 = data2.teammates.get(pokemon1) || 0;

      // Average the bidirectional synergies
      const avgSynergy = (synergy1to2 + synergy2to1) / 2;

      const pairKey = `${pokemon1}|${pokemon2}`;
      pairScores.set(pairKey, avgSynergy);

      const pair = { pokemon1, pokemon2, score: avgSynergy };

      if (avgSynergy >= 30) {
        strongPairs.push(pair);
      } else if (avgSynergy < 15) {
        weakPairs.push(pair);
      }
    }
  }

  // Sort pairs by score
  strongPairs.sort((a, b) => b.score - a.score);
  weakPairs.sort((a, b) => a.score - b.score);

  // Calculate overall synergy score (0-100)
  const allScores = Array.from(pairScores.values());
  const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
  const overallScore = Math.min(100, avgScore * 2); // Scale to 0-100

  // Get suggested teammates
  const suggestedTeammates = suggestTeammates(normalizedTeam, usageData, 10);

  return {
    score: overallScore,
    strongPairs,
    weakPairs,
    suggestedTeammates,
  };
}

/**
 * Suggest teammates based on synergy with current team
 * @param currentTeam Current team members
 * @param usageData Usage data map
 * @param limit Number of suggestions
 */
export function suggestTeammates(
  currentTeam: string[],
  usageData: Map<string, PokemonUsageData>,
  limit: number = 5
): Array<{ name: string; score: number }> {
  const normalizedTeam = currentTeam.map((name) => name.toLowerCase());
  const candidateScores: Map<string, number> = new Map();

  // For each team member, look at their common teammates
  for (const teamMember of normalizedTeam) {
    const data = usageData.get(teamMember);
    if (!data) continue;

    for (const [teammate, percentage] of data.teammates) {
      const normalizedTeammate = teammate.toLowerCase();

      // Skip if already on team
      if (normalizedTeam.includes(normalizedTeammate)) {
        continue;
      }

      // Accumulate synergy scores
      const currentScore = candidateScores.get(normalizedTeammate) || 0;
      candidateScores.set(normalizedTeammate, currentScore + percentage);
    }
  }

  // Calculate average synergy per candidate
  const candidates = Array.from(candidateScores.entries()).map(([name, totalScore]) => ({
    name,
    score: totalScore / normalizedTeam.length, // Average across team
  }));

  // Sort by score and return top N
  return candidates.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Analyze team composition and meta relevance
 * @param team Array of Pokemon names
 * @param usageData Usage data map
 */
export function analyzeTeamComposition(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): {
  avgUsage: number;
  avgViability: number;
  topTier: string[];
  offMeta: string[];
  metaScore: number;
} {
  const normalizedTeam = team.map((name) => name.toLowerCase());
  let totalUsage = 0;
  let totalViability = 0;
  let validCount = 0;

  const topTier: string[] = [];
  const offMeta: string[] = [];

  // Get all Pokemon sorted by usage for ranking
  const allPokemon = Array.from(usageData.values()).sort((a, b) => b.rawCount - a.rawCount);
  const totalPokemon = allPokemon.length;

  for (const pokemonName of normalizedTeam) {
    const data = usageData.get(pokemonName);
    if (!data) continue;

    validCount++;
    totalUsage += data.rawCount;
    totalViability += data.viabilityCeiling;

    // Determine ranking
    const rank = allPokemon.findIndex((p) => p.name.toLowerCase() === pokemonName) + 1;
    const percentile = (1 - rank / totalPokemon) * 100;

    if (percentile >= 90) {
      topTier.push(pokemonName);
    } else if (percentile < 50) {
      offMeta.push(pokemonName);
    }
  }

  const avgUsage = validCount > 0 ? totalUsage / validCount : 0;
  const avgViability = validCount > 0 ? totalViability / validCount : 0;

  // Calculate meta score (0-100)
  // Higher usage = higher score, but not too penalized for off-meta picks
  const usageScore = Math.min(100, (avgUsage / (allPokemon[0]?.rawCount || 1)) * 100);
  const viabilityScore = Math.min(100, avgViability / 20); // Assuming max viability ~2000
  const metaScore = (usageScore * 0.6 + viabilityScore * 0.4);

  return {
    avgUsage,
    avgViability,
    topTier,
    offMeta,
    metaScore,
  };
}

/**
 * Find common teammates for a specific Pokemon
 * @param pokemonName Pokemon to find teammates for
 * @param usageData Usage data map
 * @param minPercentage Minimum co-occurrence percentage
 */
export function getCommonTeammates(
  pokemonName: string,
  usageData: Map<string, PokemonUsageData>,
  minPercentage: number = 20
): Array<{ name: string; percentage: number }> {
  const data = usageData.get(pokemonName.toLowerCase());
  if (!data) return [];

  return Array.from(data.teammates.entries())
    .filter(([_, percentage]) => percentage >= minPercentage)
    .map(([name, percentage]) => ({ name, percentage }))
    .sort((a, b) => b.percentage - a.percentage);
}
