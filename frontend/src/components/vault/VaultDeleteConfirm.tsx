/**
 * VaultDeleteConfirm Component
 * 
 * Confirmation dialog for deleting vaults.
 * Requirements: 1.4, 1.5
 */

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Vault } from '../../api/types';
import styles from './VaultDeleteConfirm.module.css';

export interface VaultDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  vault: Vault | null;
}

export const VaultDeleteConfirm: React.FC<VaultDeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vault,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vault');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  if (!vault) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Delete Vault"
      size="sm"
      closeOnBackdropClick={!isDeleting}
      closeOnEscape={!isDeleting}
    >
      <div className={styles.content}>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.warning}>
          <svg
            className={styles.warningIcon}
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <p className={styles.message}>
          Are you sure you want to delete the vault <strong>"{vault.name}"</strong>?
        </p>

        <p className={styles.submessage}>
          This action cannot be undone. All documents and data associated with this vault will be permanently removed.
        </p>

        <div className={styles.vaultInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Vault ID:</span>
            <span className={styles.infoValue}>{vault.id}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Description:</span>
            <span className={styles.infoValue}>{vault.description}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isDeleting}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            loading={isDeleting}
            disabled={isDeleting}
            fullWidth
            aria-label={`Confirm delete vault ${vault.name}`}
          >
            Delete Vault
          </Button>
        </div>
      </div>
    </Modal>
  );
};
