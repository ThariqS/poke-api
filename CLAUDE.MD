# Claude Instructions for PokeAPI SDK

## Project Overview

This is a TypeScript SDK for PokeAPI built with Bun. It provides a type-safe, easy-to-use interface for accessing Pokemon data including Pokemon, moves, abilities, berries, locations, and evolution chains.

## API Structure

The SDK is organized into logical modules accessible via the `PokeAPI` class:

- **pokemon**: Pokemon, species, abilities, types, and encounters
- **moves**: Moves, damage classes, learn methods, and targets
- **berries**: Berries, firmness, and flavors
- **evolution**: Evolution chains and triggers
- **locations**: Locations, areas, and regions

## Key Features

- Fully typed with TypeScript definitions
- Built-in caching (configurable TTL and max size)
- Custom error classes (NotFoundError, NetworkError, RateLimitError, etc.)
- Pagination support for list endpoints
- Fast execution with Bun runtime

## Using the Examples Directory

**IMPORTANT**: When users request Pokemon data or ask you to demonstrate API functionality, you should:

1. **Create temporary scripts in the `examples/` directory**
2. **Name them descriptively** (e.g., `examples/find-legendary-pokemon.ts`, `examples/compare-starters.ts`)
3. **Run them with Bun**: `bun run examples/<script-name>.ts`
4. **Show the results to the user**
5. **Clean up** the temporary script after use (if the user doesn't want to keep it)

### Script Template

All example scripts should follow this structure:

```typescript
/**
 * Brief description of what this script does
 */

import { PokeAPI } from '../src/index';

async function main() {
  const api = new PokeAPI();

  // Your code here
  console.log('Results:');
  // Display results
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
```

## Common Use Cases

### Fetching Pokemon Data
```typescript
const pokemon = await api.pokemon.getPokemon('pikachu'); // by name
const pokemon = await api.pokemon.getPokemon(25);        // by ID
```

### Listing Resources with Pagination
```typescript
const list = await api.pokemon.listPokemon({ limit: 20, offset: 0 });
```

### Getting Related Data
```typescript
// Get species then evolution chain
const species = await api.pokemon.getPokemonSpecies('eevee');
const evolution = await api.evolution.getEvolutionChainFromUrl(
  species.evolution_chain.url
);
```

### Type Information
```typescript
const fireType = await api.pokemon.getType('fire');
// Access type effectiveness
console.log(fireType.damage_relations);
```

## Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const pokemon = await api.pokemon.getPokemon('unknown');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Pokemon not found');
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  }
}
```

## Performance Tips

1. The SDK has built-in caching - repeated requests are automatically cached
2. Use pagination for large lists to avoid overwhelming responses
3. Check cache stats with `api.getCacheStats()`
4. Clear cache if needed with `api.clearCache()`

## Workflow for User Requests

When a user asks for Pokemon data or analysis:

1. **Understand the request**: What Pokemon data do they need?
2. **Create a script**: Write a focused script in `examples/` directory
3. **Use appropriate API methods**: Leverage the correct module (pokemon, moves, etc.)
4. **Run the script**: Execute with `bun run examples/<script-name>.ts`
5. **Present results**: Show the output clearly to the user
6. **Offer to save**: Ask if they want to keep the script or if you should remove it

## Examples Already Available

- `basic-usage.ts`: Basic SDK usage examples
- `type-effectiveness.ts`: Calculate type effectiveness
- `pokemon-team.ts`: Build and analyze a Pokemon team
- `gen2-water-pokemon.ts`: Find Gen 2 water type Pokemon

You can reference these for patterns and best practices.

## Testing

Run the test suite with:
```bash
bun test
```

## Building

Build the project with:
```bash
bun run build
```

## Important Notes

- The SDK targets Node.js runtime but is built with Bun
- All API calls are asynchronous and return Promises
- TypeScript definitions are comprehensive - use IDE autocomplete
- The PokeAPI rate limits apply - the SDK includes retry logic for rate limit errors
- All resource names should be lowercase with hyphens (e.g., 'pokemon-species', 'level-up')

## Quick Reference

```typescript
// Initialize
const api = new PokeAPI();

// Pokemon module
await api.pokemon.getPokemon(name | id);
await api.pokemon.getPokemonSpecies(name | id);
await api.pokemon.getAbility(name | id);
await api.pokemon.getType(name | id);
await api.pokemon.getPokemonEncounters(name | id);
await api.pokemon.listPokemon({ limit?, offset? });

// Moves module
await api.moves.getMove(name | id);
await api.moves.getMoveDamageClass(name | id);
await api.moves.getMoveLearnMethod(name | id);
await api.moves.getMoveTarget(name | id);
await api.moves.listMoves({ limit?, offset? });

// Berries module
await api.berries.getBerry(name | id);
await api.berries.getBerryFirmness(name | id);
await api.berries.getBerryFlavor(name | id);
await api.berries.listBerries({ limit?, offset? });

// Evolution module
await api.evolution.getEvolutionChain(id);
await api.evolution.getEvolutionChainFromUrl(url);
await api.evolution.getEvolutionTrigger(name | id);

// Locations module
await api.locations.getLocation(name | id);
await api.locations.getLocationArea(name | id);
await api.locations.getRegion(name | id);
await api.locations.listLocations({ limit?, offset? });

// Utility
api.getCacheStats();
api.clearCache();
```
