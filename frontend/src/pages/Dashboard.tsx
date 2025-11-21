/**
 * Dashboard Page
 * 
 * Main dashboard showing vaults, agents, recent ingests, and quick chat access.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React, { useState } from 'react';
import { VaultSelector } from '../components/vault/VaultSelector';
import { useVaults } from '../hooks/useVaults';
import { useAgents } from '../hooks/useAgents';
import { useDocuments } from '../hooks/useDocuments';
import styles from './Dashboard.module.css';

// Import sub-components
import { AgentCardList } from '../components/dashboard/AgentCardList';
import { RecentIngests } from '../components/dashboard/RecentIngests';
import { QuickChatBox } from '../components/dashboard/QuickChatBox';

export const Dashboard: React.FC = () => {
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  
  // Fetch all vaults
  const { vaults, loading: vaultsLoading, error: vaultsError } = useVaults();
  
  // Fetch agents (filtered by vault if selected)
  const { agents, loading: agentsLoading, error: agentsError } = useAgents(selectedVaultId || undefined);
  
  // Fetch documents (filtered by vault if selected)
  const { documents, loading: documentsLoading, error: documentsError } = useDocuments(selectedVaultId || undefined);

  const handleVaultSelect = (vaultId: string) => {
    setSelectedVaultId(vaultId);
  };

  const handleClearFilter = () => {
    setSelectedVaultId(null);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Manage your knowledge bases and AI agents</p>
      </header>

      {/* Vault Selector */}
      <section className={styles.vaultSection}>
        <div className={styles.vaultSelectorWrapper}>
          <VaultSelector
            vaults={vaults}
            selectedVaultId={selectedVaultId}
            onSelect={handleVaultSelect}
            disabled={vaultsLoading}
            placeholder="All Vaults"
            label="Filter by Vault"
          />
          {selectedVaultId && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearFilter}
              aria-label="Clear vault filter"
            >
              Clear Filter
            </button>
          )}
        </div>
        {vaultsError && (
          <div className={styles.error} role="alert">
            {vaultsError}
          </div>
        )}
      </section>

      {/* Main Content Grid */}
      <div className={styles.grid}>
        {/* Agent Card List */}
        <section className={styles.agentsSection}>
          <h2 className={styles.sectionTitle}>AI Agents</h2>
          {agentsError && (
            <div className={styles.error} role="alert">
              {agentsError}
            </div>
          )}
          <AgentCardList
            agents={agents}
            loading={agentsLoading}
            selectedVaultId={selectedVaultId}
          />
        </section>

        {/* Recent Ingests */}
        <section className={styles.ingestsSection}>
          <h2 className={styles.sectionTitle}>Recent Documents</h2>
          {documentsError && (
            <div className={styles.error} role="alert">
              {documentsError}
            </div>
          )}
          <RecentIngests
            documents={documents}
            loading={documentsLoading}
            selectedVaultId={selectedVaultId}
          />
        </section>

        {/* Quick Chat Box */}
        <section className={styles.chatSection}>
          <h2 className={styles.sectionTitle}>Quick Chat</h2>
          <QuickChatBox
            agents={agents}
            vaults={vaults}
            selectedVaultId={selectedVaultId}
          />
        </section>
      </div>
    </div>
  );
};
