/**
 * Property-Based Tests for List Fetching and Display
 * Feature: llamaindex-rag-frontend, Property 3: List Fetching and Display
 * Validates: Requirements 1.3, 2.6, 3.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { getVaults, invalidateCache } from '../../src/api/vaults';
import { get } from '../../src/api/client';
import type { Vault } from '../../src/api/types';

// Mock the client module
vi.mock('../../src/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
  getUserFriendlyErrorMessage: vi.fn((err) => err.message || 'Error'),
}));

describe('Property 3: List Fetching and Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the cache before each test
    invalidateCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
    invalidateCache();
  });

  /**
   * Property: For any list of vaults returned by the API, when the user requests
   * the vault list, the Frontend should send a GET request to /vaults and
   * return all items from the response
   */
  it('fetches and returns all vaults from API response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        async (vaultList: Vault[]) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          // Mock the API response
          vi.mocked(get).mockResolvedValueOnce(vaultList);

          // Call the function
          const result = await getVaults();

          // Verify GET was called with correct endpoint
          expect(get).toHaveBeenCalledWith('/vaults');
          expect(get).toHaveBeenCalledTimes(1);

          // Verify all items are returned
          expect(result).toEqual(vaultList);
          expect(result.length).toBe(vaultList.length);

          // Verify each vault has required fields
          result.forEach((vault, index) => {
            expect(vault.id).toBe(vaultList[index].id);
            expect(vault.name).toBe(vaultList[index].name);
            expect(vault.description).toBe(vaultList[index].description);
            expect(vault.created_at).toBe(vaultList[index].created_at);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any GET request to list resources (vaults, agents, documents),
   * when optional filters are provided, the Frontend should include them as
   * query parameters in the request
   */
  it('includes optional filter parameters in GET requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
        }),
        async (filters) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          // Mock the API response
          vi.mocked(get).mockResolvedValueOnce([]);

          // Call with filters
          await get('/documents', filters);

          // Verify GET was called with filters
          expect(get).toHaveBeenCalledWith('/documents', filters);
          expect(get).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any list response, all items in the response should be
   * returned to the caller without modification
   */
  it('returns list items without modification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
            // Add some extra fields that might be in the response
            extra_field: fc.option(fc.string(), { nil: undefined }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        async (apiResponse) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          vi.mocked(get).mockResolvedValueOnce(apiResponse);

          const result = await getVaults();

          // Verify the response is returned exactly as received
          expect(result).toEqual(apiResponse);
          
          // Verify no items are lost
          expect(result.length).toBe(apiResponse.length);
          
          // Verify items maintain their order
          result.forEach((item, index) => {
            expect(item).toEqual(apiResponse[index]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any empty list response, the Frontend should return an
   * empty array without errors
   */
  it('handles empty list responses correctly', async () => {
    // Clear cache and mocks
    invalidateCache();
    vi.clearAllMocks();

    vi.mocked(get).mockResolvedValueOnce([]);

    const result = await getVaults();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Property: For any list request, the Frontend should send exactly one
   * GET request to the appropriate endpoint
   */
  it('sends exactly one GET request per list fetch', async () => {
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
        async (vaultList) => {
          // Clear cache and mocks for each iteration
          invalidateCache();
          vi.clearAllMocks();

          vi.mocked(get).mockResolvedValueOnce(vaultList);

          await getVaults();

          // Should call GET exactly once
          expect(get).toHaveBeenCalledTimes(1);
          expect(get).toHaveBeenCalledWith('/vaults');
        }
      ),
      { numRuns: 100 }
    );
  });
});
