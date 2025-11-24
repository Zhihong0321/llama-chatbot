// Vault API functions

import { get, post, del } from './client';
import type { Vault, VaultCreateRequest, VaultResponse, DeleteResponse } from './types';

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 30000; // 30 seconds in milliseconds
const cache = new Map<string, CacheEntry<any>>();

/**
 * Get cached data if it exists and is not expired
 */
function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set cached data with current timestamp
 */
function setCached<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate cache entries matching a pattern
 */
function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => cache.delete(key));
}

// ============================================================================
// Vault API Functions
// ============================================================================

/**
 * Create a new vault
 * POST /vaults
 */
export async function createVault(data: VaultCreateRequest): Promise<VaultResponse> {
  const result = await post<any>('/vaults', data);
  
  // Transform backend response (vault_id) to frontend format (id)
  const vault: VaultResponse = {
    id: result.vault_id,
    name: result.name,
    description: result.description,
    created_at: result.created_at
  };
  
  // Invalidate vault list cache after creation
  invalidateCache('vaults');
  
  return vault;
}

/**
 * Get all vaults
 * GET /vaults
 */
export async function getVaults(): Promise<Vault[]> {
  console.log('🔧 getVaults v2024-11-21-16:10 - WITH ARRAY CHECK');
  
  const cacheKey = 'vaults';
  
  // Check cache first
  const cached = getCached<Vault[]>(cacheKey);
  if (cached) {
    console.log('✅ getVaults: Returning cached data', cached);
    return cached;
  }

  // Fetch from API
  const result = await get<any>('/vaults');
  console.log('📥 getVaults: Raw API response:', result);
  
  // Ensure result is an array
  if (!Array.isArray(result)) {
    console.error('❌ getVaults: Expected array but got:', typeof result, result);
    return [];
  }
  
  console.log('✅ getVaults: Result is array, transforming...');
  
  // Transform backend response (vault_id) to frontend format (id)
  const vaults: Vault[] = result.map(v => ({
    id: v.vault_id,
    name: v.name,
    description: v.description,
    created_at: v.created_at
  }));
  
  console.log('✅ getVaults: Transformed vaults:', vaults);
  
  // Cache the result
  setCached(cacheKey, vaults);
  
  return vaults;
}

/**
 * Get a single vault by ID
 * GET /vaults/{vault_id}
 */
export async function getVault(vaultId: string): Promise<VaultResponse> {
  const cacheKey = `vault:${vaultId}`;
  
  // Check cache first
  const cached = getCached<VaultResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const result = await get<any>(`/vaults/${vaultId}`);
  
  // Transform backend response (vault_id) to frontend format (id)
  const vault: VaultResponse = {
    id: result.vault_id,
    name: result.name,
    description: result.description,
    created_at: result.created_at
  };
  
  // Cache the result
  setCached(cacheKey, vault);
  
  return vault;
}

/**
 * Delete a vault
 * DELETE /vaults/{vault_id}
 */
export async function deleteVault(vaultId: string): Promise<DeleteResponse> {
  const result = await del<DeleteResponse>(`/vaults/${vaultId}`);
  
  // Invalidate cache after deletion
  invalidateCache('vault');
  
  return result;
}

// Export cache utilities for testing
export { getCached, setCached, invalidateCache, CACHE_TTL };
