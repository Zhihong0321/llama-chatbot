import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../components/chat';
import { VaultSelector } from '../components/vault';
import { useVaults } from '../hooks/useVaults';
import { useAgents } from '../hooks/useAgents';
import { generateSessionId } from '../utils/sessionId';
import styles from './ChatConsole.module.css';

export function ChatConsole() {
  const [searchParams] = useSearchParams();
  const { vaults, loading: vaultsLoading } = useVaults();
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const { agents, loading: agentsLoading } = useAgents(selectedVaultId || undefined);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());

  // Initialize from URL params if provided
  useEffect(() => {
    const agentId = searchParams.get('agent_id');
    const vaultId = searchParams.get('vault_id');
    
    if (agentId) {
      setSelectedAgentId(agentId);
    } else if (vaultId) {
      setSelectedVaultId(vaultId);
    }
  }, [searchParams]);

  const handleVaultSelect = (vaultId: string) => {
    setSelectedVaultId(vaultId);
    setSelectedAgentId(null); // Clear agent selection when vault changes
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Chat Configuration</h2>
        
        <div className={styles.selectorGroup}>
          <label htmlFor="vault-select">Select Vault:</label>
          <VaultSelector
            vaults={vaults}
            selectedVaultId={selectedVaultId}
            onSelect={handleVaultSelect}
            disabled={vaultsLoading}
          />
        </div>

        {selectedVaultId && agents.length > 0 && (
          <div className={styles.selectorGroup}>
            <label htmlFor="agent-select">Select Agent (Optional):</label>
            <select
              id="agent-select"
              value={selectedAgentId || ''}
              onChange={(e) => handleAgentSelect(e.target.value)}
              className={styles.agentSelect}
              disabled={agentsLoading}
            >
              <option value="">Chat with Vault directly</option>
              {agents.map((agent) => (
                <option key={agent.agent_id} value={agent.agent_id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.info}>
          <p className={styles.infoText}>
            {selectedAgentId
              ? `Chatting with agent: ${agents.find(a => a.agent_id === selectedAgentId)?.name}`
              : selectedVaultId
              ? 'Chatting directly with vault'
              : 'Select a vault to start chatting'}
          </p>
          <p className={styles.sessionInfo}>Session ID: {sessionId}</p>
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedVaultId || selectedAgentId ? (
          <ChatWindow
            vaultId={selectedVaultId || undefined}
            agentId={selectedAgentId || undefined}
            sessionId={sessionId}
          />
        ) : (
          <div className={styles.placeholder}>
            <p>Select a vault or agent to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
