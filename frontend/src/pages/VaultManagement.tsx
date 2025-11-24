import { useState, useCallback } from 'react';
import { VaultList, VaultFormModal } from '../components/vault';
import { Button } from '../components/common';
import { useVaults } from '../hooks/useVaults';
import styles from './VaultManagement.module.css';

export function VaultManagement() {
  const { vaults, loading, error, createVault, deleteVault, refetch } = useVaults();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateVault = useCallback(async (data: { name: string; description: string }) => {
    try {
      await createVault(data);
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to create vault:', err);
      // Error will be shown by useVaults hook
    }
  }, [createVault, refetch]);

  const handleDeleteVault = useCallback(async (vaultId: string) => {
    try {
      await deleteVault(vaultId);
      refetch();
    } catch (err) {
      console.error('Failed to delete vault:', err);
      // Error will be shown by useVaults hook
    }
  }, [deleteVault, refetch]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Vault Management</h1>
        <Button onClick={() => setIsModalOpen(true)} aria-label="Create new vault">
          Create Vault
        </Button>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading vaults...</div>
      ) : (
        <VaultList
          vaults={vaults || []}
          onVaultDelete={handleDeleteVault}
        />
      )}

      <VaultFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateVault}
      />
    </div>
  );
}
