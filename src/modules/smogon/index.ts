/**
 * Main Smogon usage statistics module
 */

import type {
  PokemonUsageData,
  SmogonFormat,
  ParseOptions,
  TeamSynergyAnalysis,
  WeaknessReport,
  CoverageReport,
  ComprehensiveReport,
} from '../../types/smogon';
import { parseUsageFile, getTopPokemon as parserGetTop } from './parser';
import { calculateTeamSynergy, suggestTeammates, analyzeTeamComposition } from './team-synergy';
import { analyzeTeamWeaknesses, findBlindSpots, calculateThreatScore } from './counter-analysis';
import { analyzeCoverage, checkMoveRedundancy } from './coverage';
import { generateTeamReport } from './reports';
import { join } from 'path';

/**
 * Smogon usage statistics API
 */
export class SmogonModule {
  private dataCache: Map<string, Map<string, PokemonUsageData>> = new Map();
  private dataPath: string;

  constructor(dataPath?: string) {
    // Default to data directory at project root
    this.dataPath = dataPath || join(process.cwd(), 'data');
  }

  /**
   * Load usage data for a specific format
   * @param format Format identifier (e.g., 'gen2ou-1760')
   * @param options Parse options
   */
  loadFormat(format: string, options?: ParseOptions): void {
    if (this.dataCache.has(format)) {
      return; // Already loaded
    }

    const filePath = join(this.dataPath, `${format}.txt`);
    const usageData = parseUsageFile(filePath, options);
    this.dataCache.set(format, usageData);
  }

  /**
   * Get usage data for a specific Pokemon
   * @param pokemonName Pokemon name
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  getPokemon(pokemonName: string, format: string = 'gen2ou-1760'): PokemonUsageData | undefined {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format);
    return data?.get(pokemonName.toLowerCase());
  }

  /**
   * Get all Pokemon in a format
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  getAllPokemon(format: string = 'gen2ou-1760'): PokemonUsageData[] {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format);
    return data ? Array.from(data.values()) : [];
  }

  /**
   * Get top N Pokemon by usage
   * @param limit Number of Pokemon to return
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  getTopPokemon(limit: number = 10, format: string = 'gen2ou-1760'): PokemonUsageData[] {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format);
    return data ? parserGetTop(data, limit) : [];
  }

  /**
   * Get Pokemon that commonly use a specific move
   * @param moveName Move name
   * @param minPercentage Minimum usage percentage (default: 10)
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  findPokemonWithMove(
    moveName: string,
    minPercentage: number = 10,
    format: string = 'gen2ou-1760'
  ): Array<{ pokemon: string; percentage: number }> {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format);
    if (!data) return [];

    const normalizedMove = moveName.toLowerCase();
    const results: Array<{ pokemon: string; percentage: number }> = [];

    for (const [name, pokemonData] of data) {
      const movePercentage = pokemonData.moves.get(normalizedMove);
      if (movePercentage && movePercentage >= minPercentage) {
        results.push({ pokemon: name, percentage: movePercentage });
      }
    }

    return results.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Get Pokemon that counter a specific threat
   * @param threatName Name of the Pokemon to counter
   * @param minScore Minimum counter score (default: 1.0)
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  findCounters(
    threatName: string,
    minScore: number = 1.0,
    format: string = 'gen2ou-1760'
  ): Array<{ pokemon: string; score: number }> {
    this.ensureFormatLoaded(format);
    const threat = this.getPokemon(threatName, format);
    if (!threat) return [];

    return threat.checksAndCounters
      .filter((c) => c.score >= minScore)
      .map((c) => ({ pokemon: c.name, score: c.score }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate team synergy based on teammate percentages
   * @param team Array of Pokemon names
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  calculateTeamSynergy(team: string[], format: string = 'gen2ou-1760'): TeamSynergyAnalysis {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format)!;
    return calculateTeamSynergy(team, data);
  }

  /**
   * Suggest teammates for the current team
   * @param currentTeam Current team members
   * @param limit Number of suggestions (default: 5)
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  suggestTeammates(
    currentTeam: string[],
    limit: number = 5,
    format: string = 'gen2ou-1760'
  ): Array<{ name: string; score: number }> {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format)!;
    return suggestTeammates(currentTeam, data, limit);
  }

  /**
   * Analyze team weaknesses and threats
   * @param team Array of Pokemon names
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  analyzeTeamWeaknesses(team: string[], format: string = 'gen2ou-1760'): WeaknessReport {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format)!;
    return analyzeTeamWeaknesses(team, data);
  }

  /**
   * Find Pokemon that threaten multiple team members (blind spots)
   * @param team Array of Pokemon names
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  findBlindSpots(team: string[], format: string = 'gen2ou-1760') {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format)!;
    return findBlindSpots(team, data);
  }

  /**
   * Analyze team's move coverage
   * @param team Array of Pokemon names
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  analyzeCoverage(team: string[], format: string = 'gen2ou-1760'): CoverageReport {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format)!;
    return analyzeCoverage(team, data);
  }

  /**
   * Check for move redundancy in team
   * @param team Array of Pokemon names
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  checkMoveRedundancy(team: string[], format: string = 'gen2ou-1760') {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format)!;
    return checkMoveRedundancy(team, data);
  }

  /**
   * Generate comprehensive team report
   * @param team Array of Pokemon names
   * @param format Format identifier (default: 'gen2ou-1760')
   */
  generateTeamReport(team: string[], format: string = 'gen2ou-1760'): ComprehensiveReport {
    this.ensureFormatLoaded(format);
    const data = this.dataCache.get(format)!;
    return generateTeamReport(team, data);
  }

  /**
   * Clear cached data for a format (or all formats)
   * @param format Optional format to clear (clears all if not specified)
   */
  clearCache(format?: string): void {
    if (format) {
      this.dataCache.delete(format);
    } else {
      this.dataCache.clear();
    }
  }

  /**
   * Get list of loaded formats
   */
  getLoadedFormats(): string[] {
    return Array.from(this.dataCache.keys());
  }

  /**
   * Ensure a format is loaded, loading it if necessary
   */
  private ensureFormatLoaded(format: string): void {
    if (!this.dataCache.has(format)) {
      this.loadFormat(format);
    }
  }
}
