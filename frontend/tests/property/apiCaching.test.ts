/**
 * Property-Based Tests for API Response Caching
 * Feature: llamaindex-rag-frontend, Property 17: API Response Caching
 * Validates: Requirements 10.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { getVaults, getVault, invalidateCache, CACHE_TTL } from '../../src/api/vaults';
import { get } from '../../src/api/client';
import type { Vault } from '../../src/api/types';

// Mock the client module
vi.mock('../../src/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
  getUserFriendlyErrorMessage: vi.fn((err) => err.message || 'Error'),
}));

describe('Property 17: API Response Caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
    invalidateCache();
  });

  /**
   * Property: For any API request that is repeated within the cache TTL window
   * (30 seconds), the Frontend should return the cached response for the second
   * request without making a new API call
   */
  it('returns cached response for repeated requests within TTL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        async (vaultList: Vault[]) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          // Mock the API response
          vi.mocked(get).mockResolvedValue(vaultList);

          // First request - should hit the API
          const result1 = await getVaults();
          expect(get).toHaveBeenCalledTimes(1);
          expect(result1).toEqual(vaultList);

          // Second request within TTL - should use cache
          const result2 = await getVaults();
          expect(get).toHaveBeenCalledTimes(1); // Still only 1 call
          expect(result2).toEqual(vaultList);

          // Results should be identical
          expect(result1).toEqual(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any API request, when the cache TTL expires, the Frontend
   * should make a new API call instead of using the cached response
   */
  it('makes new API call after cache TTL expires', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 100 }),
              description: fc.string({ maxLength: 500 }),
              created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 100 }),
              description: fc.string({ maxLength: 500 }),
              created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
            }),
            { minLength: 0, maxLength: 10 }
          )
        ),
        async ([firstResponse, secondResponse]) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          // Mock first API response
          vi.mocked(get).mockResolvedValueOnce(firstResponse);

          // First request
          const result1 = await getVaults();
          expect(get).toHaveBeenCalledTimes(1);
          expect(result1).toEqual(firstResponse);

          // Simulate cache expiration by clearing cache
          invalidateCache();

          // Mock second API response
          vi.mocked(get).mockResolvedValueOnce(secondResponse);

          // Second request after cache expiration
          const result2 = await getVaults();
          expect(get).toHaveBeenCalledTimes(2); // Should make a new call
          expect(result2).toEqual(secondResponse);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any single vault request by ID, repeated requests within TTL
   * should use the cached response
   */
  it('caches individual vault requests by ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
        }),
        async (vault: Vault) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          // Mock the API response
          vi.mocked(get).mockResolvedValue(vault);

          // First request - should hit the API
          const result1 = await getVault(vault.id);
          expect(get).toHaveBeenCalledTimes(1);
          expect(get).toHaveBeenCalledWith(`/vaults/${vault.id}`);
          expect(result1).toEqual(vault);

          // Second request within TTL - should use cache
          const result2 = await getVault(vault.id);
          expect(get).toHaveBeenCalledTimes(1); // Still only 1 call
          expect(result2).toEqual(vault);

          // Results should be identical
          expect(result1).toEqual(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any two different vault IDs, requests should be cached
   * independently (requesting vault A should not affect vault B's cache)
   */
  it('caches different vault IDs independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
          }),
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
          })
        ),
        async ([vaultA, vaultB]) => {
          // Ensure different IDs
          if (vaultA.id === vaultB.id) {
            return; // Skip this iteration
          }

          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          // Mock responses for both vaults
          vi.mocked(get).mockImplementation(async (path: string) => {
            if (path === `/vaults/${vaultA.id}`) {
              return vaultA;
            } else if (path === `/vaults/${vaultB.id}`) {
              return vaultB;
            }
            throw new Error('Unexpected path');
          });

          // Request vault A
          const resultA1 = await getVault(vaultA.id);
          expect(resultA1).toEqual(vaultA);
          expect(get).toHaveBeenCalledTimes(1);

          // Request vault B
          const resultB1 = await getVault(vaultB.id);
          expect(resultB1).toEqual(vaultB);
          expect(get).toHaveBeenCalledTimes(2);

          // Request vault A again - should use cache
          const resultA2 = await getVault(vaultA.id);
          expect(resultA2).toEqual(vaultA);
          expect(get).toHaveBeenCalledTimes(2); // No new call

          // Request vault B again - should use cache
          const resultB2 = await getVault(vaultB.id);
          expect(resultB2).toEqual(vaultB);
          expect(get).toHaveBeenCalledTimes(2); // No new call
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any cached response, the data returned should be identical
   * to the original API response (no mutation or corruption)
   */
  it('returns identical data from cache without mutation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (vaultList: Vault[]) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          // Mock the API response
          vi.mocked(get).mockResolvedValue(vaultList);

          // First request
          const result1 = await getVaults();

          // Second request (from cache)
          const result2 = await getVaults();

          // Third request (from cache)
          const result3 = await getVaults();

          // All results should be deeply equal
          expect(result1).toEqual(result2);
          expect(result2).toEqual(result3);
          expect(result1).toEqual(result3);

          // Verify each field in each vault
          result1.forEach((vault, index) => {
            expect(vault.id).toBe(result2[index].id);
            expect(vault.name).toBe(result2[index].name);
            expect(vault.description).toBe(result2[index].description);
            expect(vault.created_at).toBe(result2[index].created_at);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
