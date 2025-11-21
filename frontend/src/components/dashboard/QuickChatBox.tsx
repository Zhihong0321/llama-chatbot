/**
 * QuickChatBox Component
 * 
 * Provides quick access to chat with agents or vaults.
 * Requirements: 6.4
 */

import React, { useState } from 'react';
import type { Agent, Vault } from '../../api/types';
import styles from './QuickChatBox.module.css';

export interface QuickChatBoxProps {
  agents: Agent[];
  vaults: Vault[];
  selectedVaultId: string | null;
}

export const QuickChatBox: React.FC<QuickChatBoxProps> = ({
  agents,
  vaults,
  selectedVaultId,
}) => {
  const [chatMode, setChatMode] = useState<'agent' | 'vault'>('agent');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedChatVaultId, setSelectedChatVaultId] = useState<string>(selectedVaultId || '');

  // Update selected vault when filter changes
  React.useEffect(() => {
    if (selectedVaultId) {
      setSelectedChatVaultId(selectedVaultId);
    }
  }, [selectedVaultId]);

  const handleStartChat = () => {
    if (chatMode === 'agent' && selectedAgentId) {
      // Navigate to chat with agent
      window.location.href = `/chat?agent_id=${selectedAgentId}`;
    } else if (chatMode === 'vault' && selectedChatVaultId) {
      // Navigate to chat with vault
      window.location.href = `/chat?vault_id=${selectedChatVaultId}`;
    }
  };

  const canStartChat = 
    (chatMode === 'agent' && selectedAgentId) ||
    (chatMode === 'vault' && selectedChatVaultId);

  return (
    <div className={styles.container}>
      <div className={styles.modeSelector}>
        <button
          type="button"
          className={`${styles.modeButton} ${chatMode === 'agent' ? styles.active : ''}`}
          onClick={() => setChatMode('agent')}
          aria-pressed={chatMode === 'agent'}
        >
          Chat with Agent
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${chatMode === 'vault' ? styles.active : ''}`}
          onClick={() => setChatMode('vault')}
          aria-pressed={chatMode === 'vault'}
        >
          Chat with Vault
        </button>
      </div>

      <div className={styles.form}>
        {chatMode === 'agent' ? (
          <div className={styles.field}>
            <label htmlFor="agent-select" className={styles.label}>
              Select Agent
            </label>
            <select
              id="agent-select"
              className={styles.select}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              disabled={agents.length === 0}
            >
              <option value="">Choose an agent...</option>
              {agents.map((agent) => (
                <option key={agent.agent_id} value={agent.agent_id}>
                  {agent.name}
                </option>
              ))}
            </select>
            {agents.length === 0 && (
              <p className={styles.hint}>No agents available. Create an agent first.</p>
            )}
          </div>
        ) : (
          <div className={styles.field}>
            <label htmlFor="vault-select" className={styles.label}>
              Select Vault
            </label>
            <select
              id="vault-select"
              className={styles.select}
              value={selectedChatVaultId}
              onChange={(e) => setSelectedChatVaultId(e.target.value)}
              disabled={vaults.length === 0}
            >
              <option value="">Choose a vault...</option>
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name}
                </option>
              ))}
            </select>
            {vaults.length === 0 && (
              <p className={styles.hint}>No vaults available. Create a vault first.</p>
            )}
          </div>
        )}

        <button
          type="button"
          className={styles.startButton}
          onClick={handleStartChat}
          disabled={!canStartChat}
          aria-label="Start chat"
        >
          Start Chat
        </button>
      </div>

      <div className={styles.info}>
        <p className={styles.infoText}>
          {chatMode === 'agent'
            ? 'Chat with an AI agent that has a custom system prompt and access to a specific vault.'
            : 'Chat directly with a vault to query its knowledge base without a custom agent.'}
        </p>
      </div>
    </div>
  );
};
