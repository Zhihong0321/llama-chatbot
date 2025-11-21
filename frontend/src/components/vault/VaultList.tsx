/**
 * VaultList Component
 * 
 * Displays a list of all vaults with their details.
 * Requirements: 1.2, 1.3, 6.1
 */

import React from 'react';
import type { Vault } from '../../api/types';
import styles from './VaultList.module.css';

export interface VaultListProps {
  vaults: Vault[];
  onVaultSelect?: (vault: Vault) => void;
  onVaultDelete?: (vaultId: string) => void;
  loading?: boolean;
  selectedVaultId?: string | null;
}

export const VaultList: React.FC<VaultListProps> = ({
  vaults,
  onVaultSelect,
  onVaultDelete,
  loading = false,
  selectedVaultId = null,
}) => {
  if (loading) {
    return (
      <div className={styles.container} role="status" aria-live="polite">
        <p className={styles.loadingText}>Loading vaults...</p>
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyText}>No vaults found. Create your first vault to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ul className={styles.list} role="list">
        {vaults.map((vault) => (
          <li
            key={vault.id}
            className={`${styles.item} ${selectedVaultId === vault.id ? styles.selected : ''}`}
          >
            <div className={styles.content}>
              <div className={styles.header}>
                <h3 className={styles.name}>{vault.name}</h3>
                <span className={styles.id} title={vault.id}>
                  ID: {vault.id.substring(0, 8)}...
                </span>
              </div>
              <p className={styles.description}>{vault.description}</p>
              <time className={styles.timestamp} dateTime={vault.created_at}>
                Created: {new Date(vault.created_at).toLocaleDateString()}
              </time>
            </div>
            <div className={styles.actions}>
              {onVaultSelect && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => onVaultSelect(vault)}
                  aria-label={`Select vault ${vault.name}`}
                >
                  Select
                </button>
              )}
              {onVaultDelete && (
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => onVaultDelete(vault.id)}
                  aria-label={`Delete vault ${vault.name}`}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
