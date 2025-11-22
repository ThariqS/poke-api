/**
 * Parser for Smogon usage statistics files
 */

import type {
  PokemonUsageData,
  CheckCounter,
  StatSpread,
  ParseOptions,
} from '../../types/smogon';
import { readFileSync } from 'fs';

/**
 * Parse a Smogon usage statistics file
 * @param filePath Path to the usage statistics file
 * @param options Parsing options
 * @returns Map of Pokemon name to usage data
 */
export function parseUsageFile(
  filePath: string,
  options: ParseOptions = {}
): Map<string, PokemonUsageData> {
  const content = readFileSync(filePath, 'utf-8');
  const entries = splitIntoEntries(content);
  const result = new Map<string, PokemonUsageData>();

  for (const entry of entries) {
    try {
      const pokemon = parsePokemonEntry(entry, options);
      if (pokemon) {
        result.set(pokemon.name.toLowerCase(), pokemon);
      }
    } catch (error) {
      console.warn(`Failed to parse Pokemon entry: ${error}`);
    }
  }

  return result;
}

/**
 * Split file content into individual Pokemon entries
 */
function splitIntoEntries(content: string): string[] {
  // Each Pokemon entry has "Raw count:" which appears after the name header
  // We'll split by looking backwards from "Raw count:" to find the start
  const lines = content.split('\n');
  const entries: string[] = [];
  let currentEntry: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line contains "Raw count:" - this marks the start of a new Pokemon's stats
    if (line.includes('Raw count:')) {
      // If we have a current entry, save it
      if (currentEntry.length > 0) {
        entries.push(currentEntry.join('\n'));
      }

      // Start new entry - include the previous 3 lines (box header with name)
      currentEntry = [];
      for (let j = Math.max(0, i - 3); j <= i; j++) {
        currentEntry.push(lines[j]);
      }
    } else if (currentEntry.length > 0) {
      // Add line to current entry
      currentEntry.push(line);
    }
  }

  // Don't forget the last entry
  if (currentEntry.length > 0) {
    entries.push(currentEntry.join('\n'));
  }

  return entries;
}

/**
 * Parse a single Pokemon entry
 */
export function parsePokemonEntry(
  entryText: string,
  options: ParseOptions = {}
): PokemonUsageData | null {
  const lines = entryText.split('\n');

  // Parse Pokemon name from second line (first is box border)
  const nameMatch = lines[1]?.match(/\|\s+(.+?)\s+\|/);
  if (!nameMatch) return null;

  const name = nameMatch[1].trim();

  // Initialize data structure
  const data: PokemonUsageData = {
    name,
    rawCount: 0,
    avgWeight: 0,
    viabilityCeiling: 0,
    abilities: new Map(),
    items: new Map(),
    spreads: [],
    moves: new Map(),
    teraTypes: new Map(),
    teammates: new Map(),
    checksAndCounters: [],
  };

  // Parse metadata first (lines 3-5 typically contain Raw count, Avg weight, Viability)
  const metadataLines = lines.slice(3, 8); // Get lines that might contain metadata
  parseMetadata(metadataLines, data);

  // Parse sections
  let currentSection = '';
  let sectionContent: string[] = [];
  let inSectionContent = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is a section divider
    if (line.includes('+---')) {
      // Process previous section if we have one
      if (currentSection && sectionContent.length > 0) {
        parseSection(currentSection, sectionContent, data, options);
      }

      // Reset for next section
      inSectionContent = false;
      sectionContent = [];

      // Look ahead for section name
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const sectionMatch = nextLine.match(/\|\s+(.+?)\s+\|/);
        if (sectionMatch) {
          const sectionName = sectionMatch[1].trim();
          // Skip metadata-like lines
          if (!sectionName.includes('Raw count') &&
              !sectionName.includes('Avg') &&
              !sectionName.includes('Viability')) {
            currentSection = sectionName;
            inSectionContent = true;
          }
          i++; // Skip the section header line
        }
      }
    } else if (inSectionContent && line.startsWith(' |')) {
      // Add content to current section
      sectionContent.push(line);
    }
  }

  // Process last section
  if (currentSection && sectionContent.length > 0) {
    parseSection(currentSection, sectionContent, data, options);
  }

  return data;
}

/**
 * Parse a specific section of the Pokemon entry
 */
function parseSection(
  sectionName: string,
  lines: string[],
  data: PokemonUsageData,
  options: ParseOptions
): void {
  const lowerSection = sectionName.toLowerCase();

  if (lowerSection === 'abilities') {
    parsePercentageMap(lines, data.abilities);
  } else if (lowerSection === 'items') {
    parsePercentageMap(lines, data.items);
  } else if (lowerSection === 'spreads' && options.includeSpreads !== false) {
    parseSpreads(lines, data);
  } else if (lowerSection === 'moves') {
    parsePercentageMap(lines, data.moves, options.minMovePercentage);
  } else if (lowerSection === 'tera types') {
    parsePercentageMap(lines, data.teraTypes);
  } else if (lowerSection === 'teammates') {
    parsePercentageMap(lines, data.teammates);
  } else if (
    lowerSection === 'checks and counters' &&
    options.includeChecksAndCounters !== false
  ) {
    parseChecksAndCounters(lines, data);
  }
}

/**
 * Parse metadata section (raw count, avg weight, viability ceiling)
 */
function parseMetadata(lines: string[], data: PokemonUsageData): void {
  for (const line of lines) {
    const rawCountMatch = line.match(/Raw count:\s*(\d+)/);
    if (rawCountMatch) {
      data.rawCount = parseInt(rawCountMatch[1], 10);
    }

    const avgWeightMatch = line.match(/Avg\.\s*weight:\s*([\d.]+)/);
    if (avgWeightMatch) {
      data.avgWeight = parseFloat(avgWeightMatch[1]);
    }

    const viabilityMatch = line.match(/Viability Ceiling:\s*(\d+)/);
    if (viabilityMatch) {
      data.viabilityCeiling = parseInt(viabilityMatch[1], 10);
    }
  }
}

/**
 * Parse a section with percentage values into a Map
 */
function parsePercentageMap(
  lines: string[],
  targetMap: Map<string, number>,
  minPercentage: number = 0
): void {
  for (const line of lines) {
    // Match pattern: "| Something 12.345% |" or "| Something 12.345% "
    const match = line.match(/\|\s+(.+?)\s+([\d.]+)%/);
    if (match) {
      const name = match[1].trim().toLowerCase(); // Normalize to lowercase
      const percentage = parseFloat(match[2]);

      if (percentage >= minPercentage) {
        targetMap.set(name, percentage);
      }
    }
  }
}

/**
 * Parse spreads section
 */
function parseSpreads(lines: string[], data: PokemonUsageData): void {
  for (const line of lines) {
    // Match pattern: "| Serious:252/252/252/252/252/252 50.123% |"
    const match = line.match(/\|\s+([^:]+):(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)\s+([\d.]+)%/);
    if (match) {
      const spread: StatSpread = {
        nature: match[1].trim(),
        hp: parseInt(match[2], 10),
        atk: parseInt(match[3], 10),
        def: parseInt(match[4], 10),
        spa: parseInt(match[5], 10),
        spd: parseInt(match[6], 10),
        spe: parseInt(match[7], 10),
        percentage: parseFloat(match[8]),
      };
      data.spreads.push(spread);
    }
  }
}

/**
 * Parse checks and counters section
 */
function parseChecksAndCounters(lines: string[], data: PokemonUsageData): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match pattern: "| Snorlax 123.45 (67.890±1.234) |"
    const match = line.match(/\|\s+(.+?)\s+([\d.]+)\s+\(([\d.]+)±([\d.]+)\)/);
    if (match) {
      const name = match[1].trim().toLowerCase(); // Normalize to lowercase
      const score = parseFloat(match[2]);
      const matchupPercent = parseFloat(match[3]);
      const confidenceMargin = parseFloat(match[4]);

      // Look for next line with KO/switch percentages
      let koPercent = 0;
      let switchPercent = 0;

      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const detailMatch = nextLine.match(/\(([\d.]+)\s+KOed\s+\/\s+([\d.]+)\s+switched\s+out\)/);
        if (detailMatch) {
          koPercent = parseFloat(detailMatch[1]);
          switchPercent = parseFloat(detailMatch[2]);
          i++; // Skip the detail line
        }
      }

      const counter: CheckCounter = {
        name,
        score,
        matchupPercent,
        confidenceMargin,
        koPercent,
        switchPercent,
      };

      data.checksAndCounters.push(counter);
    }
  }
}

/**
 * Get sorted Pokemon by usage
 */
export function sortByUsage(usageData: Map<string, PokemonUsageData>): PokemonUsageData[] {
  return Array.from(usageData.values()).sort((a, b) => b.rawCount - a.rawCount);
}

/**
 * Get top N Pokemon by usage
 */
export function getTopPokemon(
  usageData: Map<string, PokemonUsageData>,
  limit: number
): PokemonUsageData[] {
  return sortByUsage(usageData).slice(0, limit);
}

/**
 * Filter Pokemon by minimum usage count
 */
export function filterByMinUsage(
  usageData: Map<string, PokemonUsageData>,
  minCount: number
): Map<string, PokemonUsageData> {
  const filtered = new Map<string, PokemonUsageData>();

  for (const [name, data] of usageData) {
    if (data.rawCount >= minCount) {
      filtered.set(name, data);
    }
  }

  return filtered;
}
