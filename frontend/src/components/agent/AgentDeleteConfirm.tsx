/**
 * AgentDeleteConfirm Component
 * 
 * Confirmation dialog for deleting an agent.
 * Requirements: 3.4
 */

import React from 'react';
import { Modal } from '../common/Modal';
import type { Agent } from '../../api/types';
import styles from './AgentDeleteConfirm.module.css';

export interface AgentDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  agent: Agent | null;
  loading?: boolean;
}

export const AgentDeleteConfirm: React.FC<AgentDeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  agent,
  loading = false,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done by parent component
      console.error('Failed to delete agent:', error);
    }
  };

  if (!agent) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Agent">
      <div className={styles.content}>
        <p className={styles.message}>
          Are you sure you want to delete the agent <strong>{agent.name}</strong>?
        </p>
        <p className={styles.warning}>
          This action cannot be undone. The agent will be permanently removed.
        </p>
        
        <div className={styles.agentInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Agent ID:</span>
            <span className={styles.infoValue}>{agent.agent_id}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Vault ID:</span>
            <span className={styles.infoValue}>{agent.vault_id}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={styles.deleteButton}
            disabled={loading}
            aria-label={`Confirm deletion of agent ${agent.name}`}
          >
            {loading ? 'Deleting...' : 'Delete Agent'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
