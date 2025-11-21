// Custom hook for agent operations

import { useState, useEffect, useCallback } from 'react';
import { createAgent, getAgents, getAgent, deleteAgent } from '../api/agents';
import type { Agent, AgentCreateRequest } from '../api/types';
import { getUserFriendlyErrorMessage } from '../api/client';

interface UseAgentsReturn {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  createAgent: (data: AgentCreateRequest) => Promise<Agent>;
  deleteAgent: (agentId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing agent operations
 * 
 * Provides:
 * - Automatic fetching of agents on mount
 * - Optional vault filtering
 * - Loading and error states
 * - CRUD operations (create, delete)
 * - Manual refetch capability
 * - Automatic cache invalidation
 */
export function useAgents(vaultId?: string): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch agents from API
   */
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAgents(vaultId);
      setAgents(data);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  /**
   * Create a new agent
   */
  const handleCreateAgent = useCallback(
    async (data: AgentCreateRequest): Promise<Agent> => {
      try {
        const newAgent = await createAgent(data);
        
        // Optimistically update local state
        setAgents(prev => [...prev, newAgent]);
        
        return newAgent;
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Delete an agent
   */
  const handleDeleteAgent = useCallback(
    async (agentId: string): Promise<void> => {
      try {
        await deleteAgent(agentId);
        
        // Optimistically update local state
        setAgents(prev => prev.filter(agent => agent.agent_id !== agentId));
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Manually refetch agents
   */
  const refetch = useCallback(async () => {
    await fetchAgents();
  }, [fetchAgents]);

  // Fetch agents on mount or when vaultId changes
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    loading,
    error,
    createAgent: handleCreateAgent,
    deleteAgent: handleDeleteAgent,
    refetch,
  };
}

/**
 * Custom hook for fetching a single agent
 */
export function useAgent(agentId: string | null) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setAgent(null);
      return;
    }

    const fetchAgent = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAgent(agentId);
        setAgent(data);
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        console.error('Failed to fetch agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  return { agent, loading, error };
}
