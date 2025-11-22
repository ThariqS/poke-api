/**
 * Tests for Smogon usage statistics module
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { PokeAPI } from '../src/index';
import type { PokemonUsageData } from '../src/types/smogon';

describe('Smogon Module', () => {
  let api: PokeAPI;
  const format = 'gen2ou-1760';

  beforeAll(() => {
    api = new PokeAPI();
    // Load the format once for all tests
    api.smogon.loadFormat(format);
  });

  describe('Data Loading', () => {
    test('should load format data successfully', () => {
      const formats = api.smogon.getLoadedFormats();
      expect(formats).toContain(format);
    });

    test('should get Pokemon data', () => {
      const snorlax = api.smogon.getPokemon('Snorlax', format);
      expect(snorlax).toBeDefined();
      expect(snorlax?.name).toBe('Snorlax');
      expect(snorlax?.rawCount).toBeGreaterThan(0);
    });

    test('should return undefined for non-existent Pokemon', () => {
      const fake = api.smogon.getPokemon('FakePokemon123', format);
      expect(fake).toBeUndefined();
    });

    test('should get all Pokemon', () => {
      const allPokemon = api.smogon.getAllPokemon(format);
      expect(allPokemon.length).toBeGreaterThan(0);
    });
  });

  describe('Usage Queries', () => {
    test('should get top Pokemon', () => {
      const top10 = api.smogon.getTopPokemon(10, format);
      expect(top10).toHaveLength(10);
      expect(top10[0].name).toBe('Snorlax'); // Most used in Gen 2 OU

      // Verify sorted by usage
      for (let i = 1; i < top10.length; i++) {
        expect(top10[i - 1].rawCount).toBeGreaterThanOrEqual(top10[i].rawCount);
      }
    });

    test('should find Pokemon with specific move', () => {
      const earthquakeUsers = api.smogon.findPokemonWithMove('Earthquake', 50, format);
      expect(earthquakeUsers.length).toBeGreaterThan(0);

      // Verify all have Earthquake with >= 50% usage
      for (const user of earthquakeUsers) {
        expect(user.percentage).toBeGreaterThanOrEqual(50);
      }
    });

    test('should find counters to a Pokemon', () => {
      // Use Zapdos instead of Snorlax (Snorlax has no counters in the data)
      const counters = api.smogon.findCounters('Zapdos', 1.0, format);
      expect(counters.length).toBeGreaterThan(0);

      // Verify scores are >= minimum
      for (const counter of counters) {
        expect(counter.score).toBeGreaterThanOrEqual(1.0);
      }
    });
  });

  describe('Team Synergy Analysis', () => {
    const testTeam = ['Snorlax', 'Zapdos', 'Cloyster'];

    test('should calculate team synergy', () => {
      const synergy = api.smogon.calculateTeamSynergy(testTeam, format);

      expect(synergy).toBeDefined();
      expect(synergy.score).toBeGreaterThanOrEqual(0);
      expect(synergy.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(synergy.strongPairs)).toBe(true);
      expect(Array.isArray(synergy.weakPairs)).toBe(true);
      expect(Array.isArray(synergy.suggestedTeammates)).toBe(true);
    });

    test('should have high synergy for common core', () => {
      // Snorlax + Zapdos + Cloyster is a common Gen 2 OU core
      const synergy = api.smogon.calculateTeamSynergy(testTeam, format);
      expect(synergy.score).toBeGreaterThan(50); // Should have decent synergy
    });

    test('should suggest teammates', () => {
      const suggestions = api.smogon.suggestTeammates(['Snorlax'], 5, format);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);

      // Verify structure
      expect(suggestions[0]).toHaveProperty('name');
      expect(suggestions[0]).toHaveProperty('score');
    });
  });

  describe('Weakness Analysis', () => {
    const testTeam = ['Snorlax', 'Zapdos', 'Tyranitar', 'Exeggutor'];

    test('should analyze team weaknesses', () => {
      const weaknesses = api.smogon.analyzeTeamWeaknesses(testTeam, format);

      expect(weaknesses).toBeDefined();
      expect(weaknesses.defensiveScore).toBeGreaterThanOrEqual(0);
      expect(weaknesses.defensiveScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(weaknesses.blindSpots)).toBe(true);
      expect(Array.isArray(weaknesses.majorThreats)).toBe(true);
      expect(Array.isArray(weaknesses.suggestions)).toBe(true);
    });

    test('should find blind spots', () => {
      const blindSpots = api.smogon.findBlindSpots(testTeam, format);
      expect(Array.isArray(blindSpots)).toBe(true);

      // If there are blind spots, verify structure
      if (blindSpots.length > 0) {
        expect(blindSpots[0]).toHaveProperty('pokemon');
        expect(blindSpots[0]).toHaveProperty('threatens');
        expect(blindSpots[0]).toHaveProperty('avgScore');
        expect(blindSpots[0].threatens.length).toBeGreaterThan(1);
      }
    });
  });

  describe('Coverage Analysis', () => {
    const testTeam = ['Snorlax', 'Zapdos', 'Tyranitar'];

    test('should analyze coverage', () => {
      const coverage = api.smogon.analyzeCoverage(testTeam, format);

      expect(coverage).toBeDefined();
      expect(coverage.coverageScore).toBeGreaterThanOrEqual(0);
      expect(coverage.coverageScore).toBeLessThanOrEqual(100);
      expect(coverage.coverageByType).toBeInstanceOf(Map);
      expect(Array.isArray(coverage.gaps)).toBe(true);
      expect(Array.isArray(coverage.redundancies)).toBe(true);
      expect(Array.isArray(coverage.suggestions)).toBe(true);
    });

    test('should check move redundancy', () => {
      const redundancy = api.smogon.checkMoveRedundancy(testTeam, format);

      expect(redundancy).toBeDefined();
      expect(redundancy.redundancyScore).toBeGreaterThanOrEqual(0);
      expect(redundancy.duplicateMoves).toBeInstanceOf(Map);
      expect(Array.isArray(redundancy.excessiveCoverage)).toBe(true);
    });
  });

  describe('Comprehensive Report', () => {
    const testTeam = ['Snorlax', 'Zapdos', 'Tyranitar', 'Exeggutor'];

    test('should generate comprehensive report', () => {
      const report = api.smogon.generateTeamReport(testTeam, format);

      expect(report).toBeDefined();
      expect(report.team).toEqual(testTeam.map((p) => p.toLowerCase()));
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);

      // Verify all sections present
      expect(report).toHaveProperty('synergy');
      expect(report).toHaveProperty('weaknesses');
      expect(report).toHaveProperty('coverage');
      expect(report).toHaveProperty('meta');
      expect(report).toHaveProperty('redundancy');
      expect(Array.isArray(report.summary)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    test('should have valid meta comparison', () => {
      const report = api.smogon.generateTeamReport(testTeam, format);

      expect(report.meta.avgUsageRank).toBeGreaterThan(0);
      expect(report.meta.avgViability).toBeGreaterThan(0);
      expect(report.meta.metaAlignmentScore).toBeGreaterThanOrEqual(0);
      expect(report.meta.metaAlignmentScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(report.meta.topTierPicks)).toBe(true);
      expect(Array.isArray(report.meta.offMetaPicks)).toBe(true);
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', () => {
      api.smogon.clearCache(format);
      const formats = api.smogon.getLoadedFormats();
      expect(formats).not.toContain(format);

      // Reload for other tests
      api.smogon.loadFormat(format);
    });

    test('should clear all caches', () => {
      api.smogon.clearCache();
      const formats = api.smogon.getLoadedFormats();
      expect(formats).toHaveLength(0);

      // Reload for other tests
      api.smogon.loadFormat(format);
    });
  });

  describe('Pokemon Data Structure', () => {
    test('should have complete Pokemon data structure', () => {
      const snorlax = api.smogon.getPokemon('Snorlax', format);
      expect(snorlax).toBeDefined();

      if (snorlax) {
        // Metadata
        expect(typeof snorlax.name).toBe('string');
        expect(typeof snorlax.rawCount).toBe('number');
        expect(typeof snorlax.avgWeight).toBe('number');
        expect(typeof snorlax.viabilityCeiling).toBe('number');

        // Maps
        expect(snorlax.abilities).toBeInstanceOf(Map);
        expect(snorlax.items).toBeInstanceOf(Map);
        expect(snorlax.moves).toBeInstanceOf(Map);
        expect(snorlax.teraTypes).toBeInstanceOf(Map);
        expect(snorlax.teammates).toBeInstanceOf(Map);

        // Arrays
        expect(Array.isArray(snorlax.spreads)).toBe(true);
        expect(Array.isArray(snorlax.checksAndCounters)).toBe(true);

        // Verify some data exists
        expect(snorlax.moves.size).toBeGreaterThan(0);
        expect(snorlax.items.size).toBeGreaterThan(0);
      }
    });
  });
});
