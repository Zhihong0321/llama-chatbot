import { useState, useCallback } from 'react';
import { AgentList, AgentFormModal } from '../components/agent';
import { VaultSelector } from '../components/vault';
import { Button } from '../components/common';
import { useAgents } from '../hooks/useAgents';
import { useVaults } from '../hooks/useVaults';
import type { AgentCreateRequest } from '../api/types';
import styles from './AgentManagement.module.css';

export function AgentManagement() {
  const { vaults, loading: vaultsLoading } = useVaults();
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const { agents, loading: agentsLoading, error, createAgent, deleteAgent, refetch } = useAgents(selectedVaultId || undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateAgent = useCallback(async (data: AgentCreateRequest) => {
    await createAgent(data);
    setIsModalOpen(false);
    refetch();
  }, [createAgent, refetch]);

  const handleDeleteAgent = useCallback(async (agentId: string) => {
    await deleteAgent(agentId);
    refetch();
  }, [deleteAgent, refetch]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Agent Management</h1>
        <div className={styles.headerActions}>
          <div className={styles.vaultSelector}>
            <label htmlFor="vault-filter">Filter by Vault:</label>
            <VaultSelector
              vaults={vaults}
              selectedVaultId={selectedVaultId}
              onSelect={setSelectedVaultId}
              disabled={vaultsLoading}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} aria-label="Create new agent">
            Create Agent
          </Button>
        </div>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      {agentsLoading ? (
        <div className={styles.loading}>Loading agents...</div>
      ) : (
        <AgentList
          agents={agents}
          onAgentDelete={handleDeleteAgent}
        />
      )}

      <AgentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateAgent}
        vaults={vaults}
      />
    </div>
  );
}
