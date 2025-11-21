import { useState } from 'react';
import { VaultList, VaultFormModal } from '../components/vault';
import { Button } from '../components/common';
import { useVaults } from '../hooks/useVaults';
import styles from './VaultManagement.module.css';

export function VaultManagement() {
  const { vaults, loading, error, createVault, deleteVault, refetch } = useVaults();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateVault = async (data: { name: string; description: string }) => {
    await createVault(data);
    setIsModalOpen(false);
    refetch();
  };

  const handleDeleteVault = async (vaultId: string) => {
    await deleteVault(vaultId);
    refetch();
  };

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
          vaults={vaults}
          onVaultDelete={handleDeleteVault}
        />
      )}

      <VaultFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateVault}
      />
    </div>
  );
}
