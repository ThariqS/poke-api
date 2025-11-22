/**
 * Counter and threat analysis functions
 */

import type { PokemonUsageData, WeaknessReport, ThreatAssessment } from '../../types/smogon';

/**
 * Analyze team weaknesses and major threats
 * @param team Array of Pokemon names
 * @param usageData Usage data map
 */
export function analyzeTeamWeaknesses(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): WeaknessReport {
  const normalizedTeam = team.map((name) => name.toLowerCase());
  const allThreats: Map<string, { threatens: Set<string>; scores: number[] }> = new Map();

  // Collect all checks and counters for each team member
  for (const teamMember of normalizedTeam) {
    const data = usageData.get(teamMember);
    if (!data) continue;

    for (const counter of data.checksAndCounters) {
      const threatName = counter.name.toLowerCase();

      if (!allThreats.has(threatName)) {
        allThreats.set(threatName, { threatens: new Set(), scores: [] });
      }

      const threat = allThreats.get(threatName)!;
      threat.threatens.add(teamMember);
      threat.scores.push(counter.score);
    }
  }

  // Identify blind spots (Pokemon that threaten multiple team members)
  const blindSpots = findBlindSpotsFromThreats(allThreats, normalizedTeam.length);

  // Calculate major threats
  const majorThreats = calculateMajorThreats(Array.from(allThreats.entries()), usageData, normalizedTeam);

  // Calculate defensive score (0-100)
  // Lower score = more vulnerabilities
  const avgThreatsPerMember = Array.from(allThreats.values()).length / Math.max(1, normalizedTeam.length);
  const blindSpotPenalty = blindSpots.length * 10;
  const defensiveScore = Math.max(0, 100 - avgThreatsPerMember * 5 - blindSpotPenalty);

  // Generate suggestions
  const suggestions = generateDefensiveSuggestions(blindSpots, majorThreats, normalizedTeam, usageData);

  return {
    blindSpots,
    defensiveScore,
    majorThreats: majorThreats.slice(0, 10), // Top 10 threats
    suggestions,
  };
}

/**
 * Find blind spots from collected threat data
 */
function findBlindSpotsFromThreats(
  allThreats: Map<string, { threatens: Set<string>; scores: number[] }>,
  teamSize: number
): Array<{ pokemon: string; threatens: string[]; avgScore: number }> {
  const blindSpots: Array<{ pokemon: string; threatens: string[]; avgScore: number }> = [];

  for (const [pokemon, data] of allThreats) {
    // A blind spot threatens at least 2 team members (or 33% of team if larger)
    const threshold = Math.max(2, Math.ceil(teamSize * 0.33));

    if (data.threatens.size >= threshold) {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      blindSpots.push({
        pokemon,
        threatens: Array.from(data.threatens),
        avgScore,
      });
    }
  }

  // Sort by number of threats, then by score
  return blindSpots.sort((a, b) => {
    if (b.threatens.length !== a.threatens.length) {
      return b.threatens.length - a.threatens.length;
    }
    return b.avgScore - a.avgScore;
  });
}

/**
 * Calculate major threats with full assessment
 */
function calculateMajorThreats(
  threats: Array<[string, { threatens: Set<string>; scores: number[] }]>,
  usageData: Map<string, PokemonUsageData>,
  team: string[]
): ThreatAssessment[] {
  const assessments: ThreatAssessment[] = [];

  for (const [pokemon, data] of threats) {
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const threatenCount = data.threatens.size;

    // Calculate overall threat score
    // Factors: counter score, number of team members threatened, usage
    const pokemonData = usageData.get(pokemon);
    const usageFactor = pokemonData ? Math.min(1, pokemonData.rawCount / 5000) : 0.5;
    const threatScore = (avgScore * 10 + threatenCount * 20) * usageFactor;

    const threatens = Array.from(data.threatens).map((name) => ({
      name,
      score: data.scores[0] || 0, // Simplified, could be more precise
    }));

    // Find what checks this threat
    const threatenedBy = findTeamMembersCheckingThreat(pokemon, team, usageData);

    assessments.push({
      pokemon,
      threatScore,
      threatens,
      threatenedBy,
    });
  }

  return assessments.sort((a, b) => b.threatScore - a.threatScore);
}

/**
 * Find team members that can check a specific threat
 */
function findTeamMembersCheckingThreat(
  threat: string,
  team: string[],
  usageData: Map<string, PokemonUsageData>
): Array<{ name: string; score: number }> {
  const checkers: Array<{ name: string; score: number }> = [];

  for (const teamMember of team) {
    const data = usageData.get(teamMember);
    if (!data) continue;

    // Check if this team member appears in the threat's checks and counters
    for (const counter of data.checksAndCounters) {
      if (counter.name.toLowerCase() === threat) {
        // This means the threat checks the team member, not the other way around
        continue;
      }
    }

    // Check the reverse: does the threat have this team member as a counter?
    const threatData = usageData.get(threat);
    if (threatData) {
      const counter = threatData.checksAndCounters.find(
        (c) => c.name.toLowerCase() === teamMember
      );
      if (counter) {
        checkers.push({ name: teamMember, score: counter.score });
      }
    }
  }

  return checkers.sort((a, b) => b.score - a.score);
}

/**
 * Generate defensive suggestions based on weaknesses
 */
function generateDefensiveSuggestions(
  blindSpots: Array<{ pokemon: string; threatens: string[]; avgScore: number }>,
  majorThreats: ThreatAssessment[],
  team: string[],
  usageData: Map<string, PokemonUsageData>
): string[] {
  const suggestions: string[] = [];

  // Suggest counters for major blind spots
  if (blindSpots.length > 0) {
    const topBlindSpot = blindSpots[0];
    suggestions.push(
      `Critical blind spot: ${topBlindSpot.pokemon} threatens ${topBlindSpot.threatens.length} team members`
    );

    // Find counters to this blind spot
    const counters = findCountersForPokemon(topBlindSpot.pokemon, usageData, 3);
    if (counters.length > 0) {
      suggestions.push(
        `Consider adding: ${counters.map((c) => c.pokemon).join(', ')} to check ${topBlindSpot.pokemon}`
      );
    }
  }

  // Suggest defensive core improvements
  if (majorThreats.length > 5) {
    suggestions.push(`Team faces ${majorThreats.length} significant threats - consider defensive backbone`);
  }

  // Check for specific Pokemon lacking counters
  const uncoveredThreats = majorThreats.filter((t) => t.threatenedBy.length === 0);
  if (uncoveredThreats.length > 0) {
    suggestions.push(
      `No answers for: ${uncoveredThreats
        .slice(0, 3)
        .map((t) => t.pokemon)
        .join(', ')}`
    );
  }

  return suggestions;
}

/**
 * Find Pokemon that counter a specific threat
 */
function findCountersForPokemon(
  pokemon: string,
  usageData: Map<string, PokemonUsageData>,
  limit: number = 5
): Array<{ pokemon: string; score: number }> {
  const data = usageData.get(pokemon);
  if (!data) return [];

  return data.checksAndCounters
    .slice(0, limit)
    .map((c) => ({ pokemon: c.name, score: c.score }));
}

/**
 * Find blind spots (Pokemon that threaten multiple team members)
 * @param team Array of Pokemon names
 * @param usageData Usage data map
 */
export function findBlindSpots(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): Array<{ pokemon: string; threatens: string[]; avgScore: number }> {
  const normalizedTeam = team.map((name) => name.toLowerCase());
  const allThreats: Map<string, { threatens: Set<string>; scores: number[] }> = new Map();

  for (const teamMember of normalizedTeam) {
    const data = usageData.get(teamMember);
    if (!data) continue;

    for (const counter of data.checksAndCounters) {
      const threatName = counter.name.toLowerCase();

      if (!allThreats.has(threatName)) {
        allThreats.set(threatName, { threatens: new Set(), scores: [] });
      }

      const threat = allThreats.get(threatName)!;
      threat.threatens.add(teamMember);
      threat.scores.push(counter.score);
    }
  }

  return findBlindSpotsFromThreats(allThreats, normalizedTeam.length);
}

/**
 * Calculate threat score for a Pokemon against a team
 * @param pokemon Pokemon to assess
 * @param team Team to check against
 * @param usageData Usage data map
 */
export function calculateThreatScore(
  pokemon: string,
  team: string[],
  usageData: Map<string, PokemonUsageData>
): number {
  const normalizedPokemon = pokemon.toLowerCase();
  const normalizedTeam = team.map((name) => name.toLowerCase());

  let totalScore = 0;
  let membersThreated = 0;

  for (const teamMember of normalizedTeam) {
    const data = usageData.get(teamMember);
    if (!data) continue;

    const counter = data.checksAndCounters.find(
      (c) => c.name.toLowerCase() === normalizedPokemon
    );

    if (counter) {
      totalScore += counter.score;
      membersThreated++;
    }
  }

  // Calculate overall threat (0-100 scale)
  if (membersThreated === 0) return 0;

  const avgCounterScore = totalScore / membersThreated;
  const coverageBonus = (membersThreated / normalizedTeam.length) * 50;

  return Math.min(100, avgCounterScore * 5 + coverageBonus);
}
