/**
 * AgentList Component
 * 
 * Displays a list of all agents with optional vault filtering.
 * Requirements: 3.2, 3.3, 6.2
 */

import React from 'react';
import type { Agent } from '../../api/types';
import { AgentCard } from './AgentCard';
import styles from './AgentList.module.css';

export interface AgentListProps {
  agents: Agent[];
  onAgentEdit?: (agent: Agent) => void;
  onAgentDelete?: (agentId: string) => void;
  onCopyCurl?: (agentId: string) => void;
  loading?: boolean;
  vaultId?: string | null;
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  onAgentEdit,
  onAgentDelete,
  onCopyCurl,
  loading = false,
  vaultId = null,
}) => {
  // Filter agents by vault if vaultId is provided
  const filteredAgents = vaultId
    ? agents.filter(agent => agent.vault_id === vaultId)
    : agents;

  if (loading) {
    return (
      <div className={styles.container} role="status" aria-live="polite">
        <p className={styles.loadingText}>Loading agents...</p>
      </div>
    );
  }

  if (filteredAgents.length === 0) {
    const message = vaultId
      ? 'No agents found for this vault. Create your first agent to get started.'
      : 'No agents found. Create your first agent to get started.';
    
    return (
      <div className={styles.container}>
        <p className={styles.emptyText}>{message}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid} role="list">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.agent_id}
            agent={agent}
            onEdit={onAgentEdit}
            onDelete={onAgentDelete}
            onCopyCurl={onCopyCurl}
          />
        ))}
      </div>
    </div>
  );
};
