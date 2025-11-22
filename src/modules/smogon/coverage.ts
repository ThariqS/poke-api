/**
 * Move coverage analysis functions
 */

import type { PokemonUsageData, CoverageReport, RedundancyReport } from '../../types/smogon';

// Gen 2 type chart - mapping move types to their effectiveness
const TYPE_CHART: Record<string, { strong: string[]; weak: string[] }> = {
  Normal: { strong: [], weak: ['Rock', 'Steel'] },
  Fire: { strong: ['Grass', 'Ice', 'Bug', 'Steel'], weak: ['Fire', 'Water', 'Rock', 'Dragon'] },
  Water: { strong: ['Fire', 'Ground', 'Rock'], weak: ['Water', 'Grass', 'Dragon'] },
  Electric: { strong: ['Water', 'Flying'], weak: ['Electric', 'Grass', 'Dragon'] },
  Grass: { strong: ['Water', 'Ground', 'Rock'], weak: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'] },
  Ice: { strong: ['Grass', 'Ground', 'Flying', 'Dragon'], weak: ['Fire', 'Water', 'Ice', 'Steel'] },
  Fighting: { strong: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], weak: ['Poison', 'Flying', 'Psychic', 'Bug'] },
  Poison: { strong: ['Grass'], weak: ['Poison', 'Ground', 'Rock', 'Ghost'] },
  Ground: { strong: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], weak: ['Grass', 'Bug'] },
  Flying: { strong: ['Grass', 'Fighting', 'Bug'], weak: ['Electric', 'Rock', 'Steel'] },
  Psychic: { strong: ['Fighting', 'Poison'], weak: ['Psychic', 'Steel'] },
  Bug: { strong: ['Grass', 'Psychic', 'Dark'], weak: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel'] },
  Rock: { strong: ['Fire', 'Ice', 'Flying', 'Bug'], weak: ['Fighting', 'Ground', 'Steel'] },
  Ghost: { strong: ['Psychic', 'Ghost'], weak: ['Dark', 'Steel'] },
  Dragon: { strong: ['Dragon'], weak: ['Steel'] },
  Dark: { strong: ['Psychic', 'Ghost'], weak: ['Fighting', 'Dark', 'Steel'] },
  Steel: { strong: ['Ice', 'Rock'], weak: ['Fire', 'Water', 'Electric', 'Steel'] },
};

const ALL_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel',
];

/**
 * Extract move type from move name (handles Hidden Power variants)
 */
function getMoveType(moveName: string): string | null {
  // Handle Hidden Power variants
  if (moveName.startsWith('Hidden Power')) {
    const typeMatch = moveName.match(/Hidden Power \[?(\w+)\]?/);
    if (typeMatch) {
      return typeMatch[1];
    }
    return 'Normal'; // Default HP type
  }

  // For other moves, we'd need a move database
  // For now, we'll use heuristics based on common Gen 2 moves
  const moveTypeMap: Record<string, string> = {
    // Common attacking moves
    'Earthquake': 'Ground',
    'Thunderbolt': 'Electric',
    'Thunder': 'Electric',
    'Ice Beam': 'Ice',
    'Fire Blast': 'Fire',
    'Flamethrower': 'Fire',
    'Surf': 'Water',
    'Hydro Pump': 'Water',
    'Psychic': 'Psychic',
    'Shadow Ball': 'Ghost',
    'Sludge Bomb': 'Poison',
    'Rock Slide': 'Rock',
    'Ancient Power': 'Rock',
    'Cross Chop': 'Fighting',
    'Dynamic Punch': 'Fighting',
    'Crunch': 'Dark',
    'Pursuit': 'Dark',
    'Return': 'Normal',
    'Body Slam': 'Normal',
    'Double-Edge': 'Normal',
    'Giga Drain': 'Grass',
    'Solar Beam': 'Grass',
    'Zap Cannon': 'Electric',
    'Outrage': 'Dragon',
    'Dragonbreath': 'Dragon',
  };

  return moveTypeMap[moveName] || null;
}

/**
 * Analyze team's move coverage
 */
export function analyzeCoverage(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): CoverageReport {
  const normalizedTeam = team.map((name) => name.toLowerCase());
  const coverageByType = new Map<string, number>();
  const movesByPokemon = new Map<string, Set<string>>();

  // Initialize coverage map
  for (const type of ALL_TYPES) {
    coverageByType.set(type, 0);
  }

  // Collect moves from each team member
  for (const pokemonName of normalizedTeam) {
    const data = usageData.get(pokemonName);
    if (!data) continue;

    const pokemonMoves = new Set<string>();

    // Get top 4 moves (most common moveset)
    const topMoves = Array.from(data.moves.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    for (const [move, _] of topMoves) {
      if (move === 'Other') continue;

      pokemonMoves.add(move);
      const moveType = getMoveType(move);

      if (moveType && TYPE_CHART[moveType]) {
        // Count coverage for types this move is strong against
        for (const coveredType of TYPE_CHART[moveType].strong) {
          coverageByType.set(coveredType, (coverageByType.get(coveredType) || 0) + 1);
        }
      }
    }

    movesByPokemon.set(pokemonName, pokemonMoves);
  }

  // Identify coverage gaps
  const gaps: string[] = [];
  for (const [type, coverage] of coverageByType) {
    if (coverage === 0) {
      gaps.push(type);
    }
  }

  // Find redundancies
  const redundancies = findMoveRedundancies(movesByPokemon, usageData);

  // Calculate coverage score (0-100)
  const typesWithCoverage = Array.from(coverageByType.values()).filter((c) => c > 0).length;
  const coverageScore = (typesWithCoverage / ALL_TYPES.length) * 100;

  // Generate suggestions
  const suggestions = generateCoverageSuggestions(gaps, movesByPokemon, usageData, normalizedTeam);

  return {
    coverageByType,
    gaps,
    redundancies,
    coverageScore,
    suggestions,
  };
}

/**
 * Find move redundancies in the team
 */
function findMoveRedundancies(
  movesByPokemon: Map<string, Set<string>>,
  usageData: Map<string, PokemonUsageData>
): Array<{ type: string; pokemon: string[] }> {
  const typeUsage = new Map<string, Set<string>>();

  for (const [pokemon, moves] of movesByPokemon) {
    for (const move of moves) {
      const moveType = getMoveType(move);
      if (!moveType) continue;

      if (!typeUsage.has(moveType)) {
        typeUsage.set(moveType, new Set());
      }
      typeUsage.get(moveType)!.add(pokemon);
    }
  }

  const redundancies: Array<{ type: string; pokemon: string[] }> = [];

  for (const [type, pokemon] of typeUsage) {
    if (pokemon.size > 2) {
      // More than 2 Pokemon using the same type is redundant
      redundancies.push({
        type,
        pokemon: Array.from(pokemon),
      });
    }
  }

  return redundancies;
}

/**
 * Generate suggestions to improve coverage
 */
function generateCoverageSuggestions(
  gaps: string[],
  movesByPokemon: Map<string, Set<string>>,
  usageData: Map<string, PokemonUsageData>,
  team: string[]
): Array<{ pokemon: string; move: string; reason: string }> {
  const suggestions: Array<{ pokemon: string; move: string; reason: string }> = [];

  if (gaps.length === 0) return suggestions;

  // Find moves that could fill the gaps
  const moveTypesToConsider = new Set<string>();
  for (const gap of gaps) {
    // Find types that are super effective against the gap
    for (const [type, effectiveness] of Object.entries(TYPE_CHART)) {
      if (effectiveness.strong.includes(gap)) {
        moveTypesToConsider.add(type);
      }
    }
  }

  // Check each team member for alternative moves
  for (const pokemonName of team) {
    const data = usageData.get(pokemonName);
    if (!data) continue;

    const currentMoves = movesByPokemon.get(pokemonName) || new Set();

    // Look at all moves this Pokemon uses
    for (const [move, percentage] of data.moves) {
      if (currentMoves.has(move) || move === 'Other') continue;
      if (percentage < 5) continue; // Only consider reasonably common moves

      const moveType = getMoveType(move);
      if (!moveType || !moveTypesToConsider.has(moveType)) continue;

      // This move could help with coverage
      const coveredGaps = gaps.filter((gap) => TYPE_CHART[moveType].strong.includes(gap));
      if (coveredGaps.length > 0) {
        suggestions.push({
          pokemon: pokemonName,
          move,
          reason: `Covers ${coveredGaps.join(', ')} (${percentage.toFixed(1)}% usage)`,
        });
      }
    }
  }

  return suggestions.slice(0, 5); // Top 5 suggestions
}

/**
 * Check for move redundancy in team
 */
export function checkMoveRedundancy(
  team: string[],
  usageData: Map<string, PokemonUsageData>
): RedundancyReport {
  const normalizedTeam = team.map((name) => name.toLowerCase());
  const duplicateMoves = new Map<string, string[]>();
  const movesByPokemon = new Map<string, string[]>();

  // Collect all moves
  for (const pokemonName of normalizedTeam) {
    const data = usageData.get(pokemonName);
    if (!data) continue;

    // Get top 4 moves
    const topMoves = Array.from(data.moves.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([move, _]) => move)
      .filter((m) => m !== 'Other');

    movesByPokemon.set(pokemonName, topMoves);

    // Track duplicates
    for (const move of topMoves) {
      if (!duplicateMoves.has(move)) {
        duplicateMoves.set(move, []);
      }
      duplicateMoves.get(move)!.push(pokemonName);
    }
  }

  // Filter to only actual duplicates
  const actualDuplicates = new Map<string, string[]>();
  for (const [move, pokemon] of duplicateMoves) {
    if (pokemon.length > 1) {
      actualDuplicates.set(move, pokemon);
    }
  }

  // Find excessive coverage by type
  const excessiveCoverage: Array<{ type: string; count: number; pokemon: string[] }> = [];
  const typeUsage = new Map<string, Set<string>>();

  for (const [pokemon, moves] of movesByPokemon) {
    for (const move of moves) {
      const moveType = getMoveType(move);
      if (!moveType) continue;

      if (!typeUsage.has(moveType)) {
        typeUsage.set(moveType, new Set());
      }
      typeUsage.get(moveType)!.add(pokemon);
    }
  }

  for (const [type, pokemon] of typeUsage) {
    if (pokemon.size > 2) {
      excessiveCoverage.push({
        type,
        count: pokemon.size,
        pokemon: Array.from(pokemon),
      });
    }
  }

  // Calculate redundancy score
  const totalDuplicates = Array.from(actualDuplicates.values()).reduce(
    (sum, arr) => sum + arr.length - 1,
    0
  );
  const redundancyScore = Math.min(100, totalDuplicates * 15 + excessiveCoverage.length * 10);

  return {
    duplicateMoves: actualDuplicates,
    excessiveCoverage,
    redundancyScore,
  };
}

/**
 * Get common movesets for a Pokemon
 */
export function getCommonMovesets(
  pokemon: string,
  usageData: Map<string, PokemonUsageData>,
  minPercentage: number = 30
): Array<{ moves: string[]; percentage: number }> {
  const data = usageData.get(pokemon.toLowerCase());
  if (!data) return [];

  // Get moves above threshold
  const commonMoves = Array.from(data.moves.entries())
    .filter(([move, percentage]) => move !== 'Other' && percentage >= minPercentage)
    .sort((a, b) => b[1] - a[1]);

  // Return as single moveset (in Gen 2, movesets are less varied)
  if (commonMoves.length === 0) return [];

  return [
    {
      moves: commonMoves.slice(0, 4).map(([move, _]) => move),
      percentage: commonMoves[0][1], // Use top move's percentage as proxy
    },
  ];
}
