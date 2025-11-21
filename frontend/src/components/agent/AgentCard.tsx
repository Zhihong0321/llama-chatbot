/**
 * AgentCard Component
 * 
 * Displays details of a single agent with action buttons.
 * Requirements: 3.2, 3.5
 */

import React from 'react';
import type { Agent } from '../../api/types';
import styles from './AgentCard.module.css';

export interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agentId: string) => void;
  onCopyCurl?: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  onCopyCurl,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{agent.name}</h3>
        <span className={styles.id} title={agent.agent_id}>
          ID: {agent.agent_id.substring(0, 8)}...
        </span>
      </div>
      
      <div className={styles.content}>
        <div className={styles.field}>
          <label className={styles.label}>Vault ID:</label>
          <span className={styles.value} title={agent.vault_id}>
            {agent.vault_id.substring(0, 8)}...
          </span>
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>System Prompt:</label>
          <p className={styles.prompt}>{agent.system_prompt}</p>
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Created:</label>
          <time className={styles.timestamp} dateTime={agent.created_at}>
            {new Date(agent.created_at).toLocaleDateString()}
          </time>
        </div>
      </div>
      
      <div className={styles.actions}>
        {onCopyCurl && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onCopyCurl(agent.agent_id)}
            aria-label={`Copy cURL command for agent ${agent.name}`}
          >
            Copy cURL
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onEdit(agent)}
            aria-label={`Edit agent ${agent.name}`}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => onDelete(agent.agent_id)}
            aria-label={`Delete agent ${agent.name}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
