# PokeAPI SDK

A comprehensive TypeScript SDK for [PokeAPI](https://pokeapi.co/) built with Bun. This library provides a type-safe, easy-to-use interface for accessing Pokemon data including Pokemon, moves, abilities, berries, locations, and evolution chains.

## Features

- **Fully Typed**: Complete TypeScript definitions for all PokeAPI resources
- **Built-in Caching**: Automatic response caching to reduce API calls
- **Fast**: Built with Bun for optimal performance
- **Error Handling**: Custom error classes for better error management
- **Comprehensive**: Covers all major PokeAPI endpoints
- **Easy to Use**: Intuitive API design with helpful methods

## Installation

```bash
bun add poke-api-sdk
```

## Quick Start

```typescript
import { PokeAPI } from 'poke-api-sdk';

const api = new PokeAPI();

// Get a Pokemon
const pikachu = await api.pokemon.getPokemon('pikachu');
console.log(pikachu.name, pikachu.types);

// Get a move
const thunderbolt = await api.moves.getMove('thunderbolt');
console.log(thunderbolt.name, thunderbolt.power);
```

## Usage

### Pokemon

```typescript
// Get Pokemon by name or ID
const charizard = await api.pokemon.getPokemon('charizard');
const bulbasaur = await api.pokemon.getPokemon(1);

// List Pokemon with pagination
const pokemonList = await api.pokemon.listPokemon({ limit: 20, offset: 0 });

// Get Pokemon species
const species = await api.pokemon.getPokemonSpecies('pikachu');

// Get Pokemon abilities
const ability = await api.pokemon.getAbility('static');

// Get Pokemon types
const fireType = await api.pokemon.getType('fire');

// Get Pokemon encounters
const encounters = await api.pokemon.getPokemonEncounters('pikachu');
```

### Moves

```typescript
// Get move by name or ID
const move = await api.moves.getMove('thunderbolt');

// List moves with pagination
const moveList = await api.moves.listMoves({ limit: 20, offset: 0 });

// Get move damage class
const damageClass = await api.moves.getMoveDamageClass('physical');

// Get move learn method
const learnMethod = await api.moves.getMoveLearnMethod('level-up');

// Get move target
const target = await api.moves.getMoveTarget('selected-pokemon');
```

### Berries

```typescript
// Get berry by name or ID
const berry = await api.berries.getBerry('oran');

// List berries
const berryList = await api.berries.listBerries({ limit: 10 });

// Get berry firmness
const firmness = await api.berries.getBerryFirmness('very-soft');

// Get berry flavor
const flavor = await api.berries.getBerryFlavor('spicy');
```

### Evolution

```typescript
// Get evolution chain by ID
const evolutionChain = await api.evolution.getEvolutionChain(1);

// Get evolution chain from Pokemon species
const eeveeSpecies = await api.pokemon.getPokemonSpecies('eevee');
const eeveeEvolutions = await api.evolution.getEvolutionChainFromUrl(
  eeveeSpecies.evolution_chain.url
);

// Get evolution trigger
const trigger = await api.evolution.getEvolutionTrigger('level-up');
```

### Locations

```typescript
// Get location by name or ID
const location = await api.locations.getLocation('kanto');

// List locations
const locationList = await api.locations.listLocations({ limit: 20 });

// Get location area
const area = await api.locations.getLocationArea('canalave-city-area');

// Get region
const region = await api.locations.getRegion('kanto');
```

## Configuration

You can configure the SDK with custom options:

```typescript
const api = new PokeAPI({
  // Custom base URL (optional)
  baseURL: 'https://pokeapi.co/api/v2',

  // Cache configuration
  cache: {
    enabled: true,        // Enable/disable caching
    ttl: 900000,         // Cache time-to-live in ms (default: 15 min)
    maxSize: 500,        // Maximum cache entries (default: 500)
  },

  // Request timeout in ms (default: 10000)
  timeout: 10000,
});
```

## Cache Management

```typescript
// Get cache statistics
const stats = api.getCacheStats();
console.log(`Cached items: ${stats.size}/${stats.maxSize}`);

// Clear cache
api.clearCache();
```

## Error Handling

The SDK provides custom error classes for better error handling:

```typescript
import { NotFoundError, NetworkError, RateLimitError } from 'poke-api-sdk';

try {
  const pokemon = await api.pokemon.getPokemon('invalid-name');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Pokemon not found');
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  }
}
```

### Available Error Types

- `PokeAPIError`: Base error class
- `NotFoundError`: Resource not found (404)
- `NetworkError`: Network-related errors
- `RateLimitError`: Rate limit exceeded
- `ParseError`: Response parsing failed
- `ValidationError`: Invalid parameters

## Examples

Check out the `examples/` directory for more detailed examples:

- `basic-usage.ts`: Basic SDK usage examples
- `type-effectiveness.ts`: Calculate type effectiveness
- `pokemon-team.ts`: Build and analyze a Pokemon team

Run examples:

```bash
bun run examples/basic-usage.ts
bun run examples/type-effectiveness.ts
bun run examples/pokemon-team.ts
```

## Testing

Run the test suite:

```bash
bun test
```

## Type Definitions

This SDK includes comprehensive TypeScript definitions for all PokeAPI resources:

- `Pokemon`, `PokemonSpecies`, `PokemonAbility`, `PokemonType`, `PokemonStat`
- `Move`, `MoveCategory`, `MoveDamageClass`, `MoveLearnMethod`
- `Ability`, `Type`
- `Berry`, `BerryFirmness`, `BerryFlavor`
- `EvolutionChain`, `EvolutionTrigger`
- `Location`, `LocationArea`, `Region`
- And many more...

## API Modules

The SDK is organized into logical modules:

- **pokemon**: Pokemon, species, abilities, and types
- **moves**: Moves and move-related data
- **berries**: Berries and flavors
- **evolution**: Evolution chains and triggers
- **locations**: Locations, areas, and regions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

This SDK is a wrapper for [PokeAPI](https://pokeapi.co/). PokeAPI is a free and open API providing Pokemon data.

## Resources

- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Bun Documentation](https://bun.sh/)
