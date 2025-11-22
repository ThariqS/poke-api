/**
 * Tests for APIClient
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { APIClient } from './client';
import { NotFoundError, NetworkError } from './errors';

describe('APIClient', () => {
  let client: APIClient;

  beforeEach(() => {
    client = new APIClient();
  });

  test('should create client with default options', () => {
    expect(client).toBeDefined();
    const stats = client.getCacheStats();
    expect(stats.enabled).toBe(true);
    expect(stats.size).toBe(0);
  });

  test('should create client with custom cache options', () => {
    const customClient = new APIClient({
      cache: {
        enabled: false,
      },
    });
    const stats = customClient.getCacheStats();
    expect(stats.enabled).toBe(false);
  });

  test('should fetch a Pokemon successfully', async () => {
    const pikachu = await client.get('/pokemon/25');
    expect(pikachu).toBeDefined();
    expect(pikachu).toHaveProperty('name');
    expect(pikachu).toHaveProperty('id');
  });

  test('should cache responses', async () => {
    await client.get('/pokemon/1');
    const statsBefore = client.getCacheStats();
    expect(statsBefore.size).toBe(1);

    // Second request should use cache
    await client.get('/pokemon/1');
    const statsAfter = client.getCacheStats();
    expect(statsAfter.size).toBe(1);
  });

  test('should throw NotFoundError for non-existent resource', async () => {
    await expect(client.get('/pokemon/99999')).rejects.toThrow(NotFoundError);
  });

  test('should clear cache', async () => {
    await client.get('/pokemon/1');
    expect(client.getCacheStats().size).toBe(1);

    client.clearCache();
    expect(client.getCacheStats().size).toBe(0);
  });

  test('should handle pagination parameters', async () => {
    const result = await client.getList('/pokemon', {
      limit: 5,
      offset: 10,
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('results');
  });
});
