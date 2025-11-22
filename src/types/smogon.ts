/**
 * Type definitions for Smogon usage statistics
 */

/**
 * Represents a check or counter relationship between Pokemon
 */
export interface CheckCounter {
  /** Name of the Pokemon that checks/counters */
  name: string;
  /** Effectiveness score */
  score: number;
  /** Win rate percentage in matchup */
  matchupPercent: number;
  /** Statistical confidence margin */
  confidenceMargin: number;
  /** Percentage of times this Pokemon KOed the target */
  koPercent: number;
  /** Percentage of times switched out */
  switchPercent: number;
}

/**
 * Represents a stat spread with nature and EV distribution
 */
export interface StatSpread {
  /** Nature (e.g., 'Serious', 'Jolly') */
  nature: string;
  /** HP EVs */
  hp: number;
  /** Attack EVs */
  atk: number;
  /** Defense EVs */
  def: number;
  /** Special Attack EVs */
  spa: number;
  /** Special Defense EVs */
  spd: number;
  /** Speed EVs */
  spe: number;
  /** Usage percentage */
  percentage: number;
}

/**
 * Complete usage data for a single Pokemon
 */
export interface PokemonUsageData {
  /** Pokemon name */
  name: string;
  /** Raw number of times used */
  rawCount: number;
  /** Average weight (related to team strength/ELO) */
  avgWeight: number;
  /** Maximum ELO rating where this Pokemon is viable */
  viabilityCeiling: number;
  /** Abilities and their usage percentages */
  abilities: Map<string, number>;
  /** Items and their usage percentages */
  items: Map<string, number>;
  /** Stat spreads and their usage percentages */
  spreads: StatSpread[];
  /** Moves and their usage percentages */
  moves: Map<string, number>;
  /** Tera types and their usage percentages */
  teraTypes: Map<string, number>;
  /** Common teammates and co-occurrence percentages */
  teammates: Map<string, number>;
  /** Pokemon that check or counter this one */
  checksAndCounters: CheckCounter[];
}

/**
 * Represents a moveset configuration
 */
export interface Moveset {
  /** Array of move names */
  moves: string[];
  /** Combined usage percentage */
  percentage: number;
}

/**
 * Analysis of team synergy
 */
export interface TeamSynergyAnalysis {
  /** Overall synergy score (0-100) */
  score: number;
  /** Pairs of Pokemon with high synergy */
  strongPairs: Array<{ pokemon1: string; pokemon2: string; score: number }>;
  /** Pairs with low synergy */
  weakPairs: Array<{ pokemon1: string; pokemon2: string; score: number }>;
  /** Pokemon that fit well with the current team */
  suggestedTeammates: Array<{ name: string; score: number }>;
}

/**
 * Threat assessment for a Pokemon against a team
 */
export interface ThreatAssessment {
  /** Pokemon being assessed */
  pokemon: string;
  /** Overall threat score (0-100) */
  threatScore: number;
  /** Team members threatened by this Pokemon */
  threatens: Array<{ name: string; score: number }>;
  /** Team members that can check/counter this Pokemon */
  threatenedBy: Array<{ name: string; score: number }>;
}

/**
 * Team weakness analysis
 */
export interface WeaknessReport {
  /** Pokemon that threaten multiple team members (blind spots) */
  blindSpots: Array<{ pokemon: string; threatens: string[]; avgScore: number }>;
  /** Overall defensive coverage score */
  defensiveScore: number;
  /** Individual threat assessments */
  majorThreats: ThreatAssessment[];
  /** Suggested defensive improvements */
  suggestions: string[];
}

/**
 * Move coverage analysis
 */
export interface CoverageReport {
  /** Types covered by the team's moves */
  coverageByType: Map<string, number>;
  /** Gaps in coverage */
  gaps: string[];
  /** Redundant move types */
  redundancies: Array<{ type: string; pokemon: string[] }>;
  /** Overall coverage score (0-100) */
  coverageScore: number;
  /** Suggested moves to improve coverage */
  suggestions: Array<{ pokemon: string; move: string; reason: string }>;
}

/**
 * Comparison to meta statistics
 */
export interface MetaComparison {
  /** Average usage rank of team Pokemon */
  avgUsageRank: number;
  /** Average viability ceiling */
  avgViability: number;
  /** Off-meta picks (below certain usage threshold) */
  offMetaPicks: string[];
  /** Meta-defining picks (top tier) */
  topTierPicks: string[];
  /** How the team compares to average (0-100) */
  metaAlignmentScore: number;
}

/**
 * Move redundancy analysis
 */
export interface RedundancyReport {
  /** Moves used by multiple team members */
  duplicateMoves: Map<string, string[]>;
  /** Move types with excessive coverage */
  excessiveCoverage: Array<{ type: string; count: number; pokemon: string[] }>;
  /** Redundancy score (higher = more redundant) */
  redundancyScore: number;
}

/**
 * Comprehensive team analysis report
 */
export interface ComprehensiveReport {
  /** The team being analyzed */
  team: string[];
  /** Synergy analysis */
  synergy: TeamSynergyAnalysis;
  /** Weakness analysis */
  weaknesses: WeaknessReport;
  /** Coverage analysis */
  coverage: CoverageReport;
  /** Meta comparison */
  meta: MetaComparison;
  /** Move redundancy */
  redundancy: RedundancyReport;
  /** Overall team score (0-100) */
  overallScore: number;
  /** Summary of key findings */
  summary: string[];
  /** Actionable recommendations */
  recommendations: string[];
}

/**
 * Format identifier for Smogon data
 */
export interface SmogonFormat {
  /** Generation (e.g., 'gen2', 'gen3') */
  generation: string;
  /** Format/tier (e.g., 'ou', 'uu', 'ubers') */
  format: string;
  /** ELO rating threshold */
  rating: number;
}

/**
 * Options for parsing usage files
 */
export interface ParseOptions {
  /** Whether to parse spreads section */
  includeSpreads?: boolean;
  /** Whether to parse checks and counters */
  includeChecksAndCounters?: boolean;
  /** Minimum usage percentage to include moves */
  minMovePercentage?: number;
}
