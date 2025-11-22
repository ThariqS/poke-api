# Smogon Usage Statistics API

A comprehensive API for analyzing Pokemon teams using Smogon usage statistics data.

## Features

### 1. **Data Parsing**
- Parses Smogon usage statistics files (e.g., `gen2ou-1760.txt`)
- Extracts Pokemon metadata, movesets, items, teammates, and checks/counters
- Multi-format support for different generations and tiers

### 2. **Team Synergy Analysis**
- Calculate team synergy based on teammate co-occurrence percentages
- Identify strong and weak Pokemon pairs on your team
- Get suggested teammates that work well with your current team
- Analyze overall meta relevance and composition

### 3. **Defensive Analysis**
- Identify team blind spots (Pokemon that threaten multiple team members)
- Calculate threat scores for opponent Pokemon against your team
- Find major threats and which team members can handle them
- Get defensive suggestions to improve team coverage

### 4. **Move Coverage Analysis**
- Analyze type coverage across your team's moves
- Identify coverage gaps (types you can't hit effectively)
- Detect move redundancy (too many Pokemon with same moves)
- Get suggestions for moves to fill coverage gaps

### 5. **Comprehensive Team Reports**
- Generate full team analysis with all metrics
- Overall team score (0-100)
- Summary of key findings
- Actionable recommendations

## Usage

### Basic Example

```typescript
import { PokeAPI } from './src/index';

const api = new PokeAPI();

// Load Gen 2 OU data
api.smogon.loadFormat('gen2ou-1760');

// Get Pokemon data
const snorlax = api.smogon.getPokemon('Snorlax');
console.log(snorlax.rawCount, snorlax.viabilityCeiling);

// Get top Pokemon in the meta
const top10 = api.smogon.getTopPokemon(10);

// Analyze a team
const team = ['Snorlax', 'Zapdos', 'Cloyster'];
const synergy = api.smogon.calculateTeamSynergy(team);
const weaknesses = api.smogon.analyzeTeamWeaknesses(team);
const coverage = api.smogon.analyzeCoverage(team);

// Generate comprehensive report
const report = api.smogon.generateTeamReport(team);
```

### Running the Example

```bash
bun run examples/analyze-gen2-team.ts
```

This will analyze a Gen 2 OU team and display:
- Top Pokemon in the metagame
- Team member details (usage, moves, items)
- Team synergy analysis
- Defensive analysis and threats
- Move coverage analysis
- Move redundancy check
- Comprehensive team report
- Additional queries

## API Methods

### Data Loading & Queries

- `loadFormat(format: string)` - Load usage data for a format
- `getPokemon(name: string, format?: string)` - Get Pokemon usage data
- `getAllPokemon(format?: string)` - Get all Pokemon in format
- `getTopPokemon(limit: number, format?: string)` - Get top N Pokemon by usage
- `findPokemonWithMove(move: string, minPct?: number, format?: string)` - Find Pokemon using a move
- `findCounters(pokemon: string, minScore?: number, format?: string)` - Find counters to a Pokemon

### Team Analysis

- `calculateTeamSynergy(team: string[], format?: string)` - Calculate team synergy
- `suggestTeammates(team: string[], limit?: number, format?: string)` - Suggest teammates
- `analyzeTeamWeaknesses(team: string[], format?: string)` - Analyze weaknesses
- `findBlindSpots(team: string[], format?: string)` - Find Pokemon that threaten multiple members
- `analyzeCoverage(team: string[], format?: string)` - Analyze move coverage
- `checkMoveRedundancy(team: string[], format?: string)` - Check for redundant moves
- `generateTeamReport(team: string[], format?: string)` - Generate comprehensive report

### Utility

- `clearCache(format?: string)` - Clear cached data
- `getLoadedFormats()` - Get list of loaded formats

## Data Structure

### PokemonUsageData
```typescript
{
  name: string;
  rawCount: number;
  avgWeight: number;
  viabilityCeiling: number;
  abilities: Map<string, number>;
  items: Map<string, number>;
  spreads: StatSpread[];
  moves: Map<string, number>;
  teraTypes: Map<string, number>;
  teammates: Map<string, number>;
  checksAndCounters: CheckCounter[];
}
```

### ComprehensiveReport
```typescript
{
  team: string[];
  synergy: TeamSynergyAnalysis;
  weaknesses: WeaknessReport;
  coverage: CoverageReport;
  meta: MetaComparison;
  redundancy: RedundancyReport;
  overallScore: number;
  summary: string[];
  recommendations: string[];
}
```

## Testing

Run the test suite:
```bash
bun test tests/smogon.test.ts
```

All 19 tests pass, covering:
- Data loading and parsing
- Usage queries
- Team synergy analysis
- Weakness analysis
- Coverage analysis
- Comprehensive reports
- Cache management

## Multi-Format Support

The API is designed to support multiple generations and formats:

```typescript
// Load different formats
api.smogon.loadFormat('gen2ou-1760');
api.smogon.loadFormat('gen3ou-1825');
api.smogon.loadFormat('gen4uu-1500');

// Query specific format
const pokemon = api.smogon.getPokemon('Snorlax', 'gen2ou-1760');
```

## Integration

The Smogon module is integrated into the main PokeAPI SDK:

```typescript
import { PokeAPI } from 'poke-api-sdk';

const api = new PokeAPI();

// Use alongside regular PokeAPI methods
const pokemon = await api.pokemon.getPokemon('snorlax');
const usageData = api.smogon.getPokemon('snorlax', 'gen2ou-1760');
```

## Files Created

- `src/types/smogon.ts` - Type definitions
- `src/modules/smogon/parser.ts` - Usage statistics parser
- `src/modules/smogon/index.ts` - Main Smogon module
- `src/modules/smogon/team-synergy.ts` - Team synergy analysis
- `src/modules/smogon/counter-analysis.ts` - Counter/threat analysis
- `src/modules/smogon/coverage.ts` - Move coverage analysis
- `src/modules/smogon/reports.ts` - Report generation
- `examples/analyze-gen2-team.ts` - Comprehensive example
- `tests/smogon.test.ts` - Test suite

## Example Output

```
TEAM ANALYSIS REPORT
OVERALL SCORE: 72/100

SYNERGY ANALYSIS (72/100):
  Strong pairs:
    • snorlax + zapdos (72.6%)
    • snorlax + cloyster (73.6%)

DEFENSIVE ANALYSIS (98/100):
  Major threats:
    • raikou (threat score: 581.3)

COVERAGE ANALYSIS (88/100):
  Coverage gaps: Psychic, Ghost

RECOMMENDATIONS:
  • Consider adding: Gengar for better synergy
  • Tyranitar could run Pursuit to cover Psychic, Ghost
```
