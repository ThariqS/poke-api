/**
 * Custom error classes for PokeAPI SDK
 */

/**
 * Base error class for all PokeAPI errors
 */
export class PokeAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PokeAPIError';
    Object.setPrototypeOf(this, PokeAPIError.prototype);
  }
}

/**
 * Error thrown when a resource is not found (404)
 */
export class NotFoundError extends PokeAPIError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when the API rate limit is exceeded
 */
export class RateLimitError extends PokeAPIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error thrown when a network request fails
 */
export class NetworkError extends PokeAPIError {
  constructor(message: string) {
    super(`Network error: ${message}`);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when response parsing fails
 */
export class ParseError extends PokeAPIError {
  constructor(message: string) {
    super(`Failed to parse response: ${message}`);
    this.name = 'ParseError';
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

/**
 * Error thrown for invalid parameters
 */
export class ValidationError extends PokeAPIError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
