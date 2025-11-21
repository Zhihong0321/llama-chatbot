/**
 * AgentCardList Component
 * 
 * Displays a list of agent cards on the dashboard.
 * Requirements: 6.2
 */

import React from 'react';
import { AgentCard } from '../agent/AgentCard';
import type { Agent } from '../../api/types';
import styles from './AgentCardList.module.css';

export interface AgentCardListProps {
  agents: Agent[];
  loading: boolean;
  selectedVaultId: string | null;
}

export const AgentCardList: React.FC<AgentCardListProps> = ({
  agents,
  loading,
  selectedVaultId,
}) => {
  // Defensive: ensure agents is always an array
  const safeAgents = Array.isArray(agents) ? agents : [];

  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        Loading agents...
      </div>
    );
  }

  if (safeAgents.length === 0) {
    return (
      <div className={styles.empty}>
        {selectedVaultId
          ? 'No agents found for this vault.'
          : 'No agents created yet. Create your first agent to get started.'}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {safeAgents.map((agent) => (
        <AgentCard
          key={agent.agent_id}
          agent={agent}
        />
      ))}
    </div>
  );
};
