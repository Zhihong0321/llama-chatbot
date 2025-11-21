// Agent API functions

import { get, post, del } from './client';
import type { Agent, AgentCreateRequest, AgentResponse, DeleteResponse } from './types';

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
// Agent API Functions
// ============================================================================

/**
 * Create a new agent
 * POST /agents
 */
export async function createAgent(data: AgentCreateRequest): Promise<AgentResponse> {
  const result = await post<AgentResponse>('/agents', data);
  
  // Invalidate agent list cache after creation
  invalidateCache('agents');
  
  return result;
}

/**
 * Get all agents with optional vault filter
 * GET /agents?vault_id={vault_id}
 */
export async function getAgents(vaultId?: string): Promise<Agent[]> {
  const cacheKey = vaultId ? `agents:vault:${vaultId}` : 'agents';
  
  // Check cache first
  const cached = getCached<Agent[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Build query params
  const params = vaultId ? { vault_id: vaultId } : undefined;
  
  // Fetch from API
  const result = await get<Agent[]>('/agents', params);
  
  // Cache the result
  setCached(cacheKey, result);
  
  return result;
}

/**
 * Get a single agent by ID
 * GET /agents/{agent_id}
 */
export async function getAgent(agentId: string): Promise<AgentResponse> {
  const cacheKey = `agent:${agentId}`;
  
  // Check cache first
  const cached = getCached<AgentResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const result = await get<AgentResponse>(`/agents/${agentId}`);
  
  // Cache the result
  setCached(cacheKey, result);
  
  return result;
}

/**
 * Delete an agent
 * DELETE /agents/{agent_id}
 */
export async function deleteAgent(agentId: string): Promise<DeleteResponse> {
  const result = await del<DeleteResponse>(`/agents/${agentId}`);
  
  // Invalidate cache after deletion
  invalidateCache('agent');
  
  return result;
}

// Export cache utilities for testing
export { getCached, setCached, invalidateCache, CACHE_TTL };
