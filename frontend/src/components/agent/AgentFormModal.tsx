/**
 * AgentFormModal Component
 * 
 * Modal dialog for creating or editing agents.
 * Requirements: 3.1, 3.2
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Agent, AgentCreateRequest, Vault } from '../../api/types';
import styles from './AgentFormModal.module.css';

export interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agent: AgentCreateRequest) => void | Promise<void>;
  vaults: Vault[];
  initialData?: Partial<Agent>;
  loading?: boolean;
}

const AgentFormModalComponent: React.FC<AgentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vaults,
  initialData,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [vaultId, setVaultId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use ref for input to prevent focus loss
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize form with initial data
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setVaultId(initialData?.vault_id || '');
      setSystemPrompt(initialData?.system_prompt || '');
      setErrors({});
      
      // Focus input after a short delay to avoid conflict with Modal focus trap
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [initialData, isOpen]);

  const validateForm = React.useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Agent name is required';
    }

    if (!vaultId) {
      newErrors.vaultId = 'Please select a vault';
    }

    if (!systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, vaultId, systemPrompt]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const agentData: AgentCreateRequest = {
      name: name.trim(),
      vault_id: vaultId,
      system_prompt: systemPrompt.trim(),
    };

    try {
      await onSubmit(agentData);
      setName('');
      setVaultId('');
      setSystemPrompt('');
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done by parent component
      console.error('Failed to submit agent:', error);
    }
  }, [name, vaultId, systemPrompt, validateForm, onSubmit, onClose]);

  const handleClose = React.useCallback(() => {
    setName('');
    setVaultId('');
    setSystemPrompt('');
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={initialData ? 'Edit Agent' : 'Create Agent'}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="agent-name" className={styles.label}>
            Agent Name <span className={styles.required}>*</span>
          </label>
          <input
            ref={nameInputRef}
            id="agent-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Enter agent name"
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'agent-name-error' : undefined}
          />
          {errors.name && (
            <span id="agent-name-error" className={styles.error} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="agent-vault" className={styles.label}>
            Vault <span className={styles.required}>*</span>
          </label>
          <select
            id="agent-vault"
            value={vaultId}
            onChange={(e) => setVaultId(e.target.value)}
            className={`${styles.select} ${errors.vaultId ? styles.inputError : ''}`}
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.vaultId}
            aria-describedby={errors.vaultId ? 'agent-vault-error' : undefined}
          >
            <option value="">Select a vault</option>
            {vaults.map((vault) => (
              <option key={vault.id} value={vault.id}>
                {vault.name}
              </option>
            ))}
          </select>
          {errors.vaultId && (
            <span id="agent-vault-error" className={styles.error} role="alert">
              {errors.vaultId}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="agent-prompt" className={styles.label}>
            System Prompt <span className={styles.required}>*</span>
          </label>
          <textarea
            id="agent-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className={`${styles.textarea} ${errors.systemPrompt ? styles.inputError : ''}`}
            placeholder="Enter system prompt for the agent"
            rows={6}
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.systemPrompt}
            aria-describedby={errors.systemPrompt ? 'agent-prompt-error' : undefined}
          />
          {errors.systemPrompt && (
            <span id="agent-prompt-error" className={styles.error} role="alert">
              {errors.systemPrompt}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelButton}
            disabled={loading}
            aria-label="Cancel agent creation"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
            aria-label={initialData ? 'Update agent' : 'Create agent'}
          >
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Memo with custom comparison to prevent re-renders when vaults array reference changes
export const AgentFormModal = React.memo(AgentFormModalComponent, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onSubmit === nextProps.onSubmit &&
    prevProps.loading === nextProps.loading &&
    prevProps.initialData === nextProps.initialData &&
    JSON.stringify(prevProps.vaults) === JSON.stringify(nextProps.vaults)
  );
});
