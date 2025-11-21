/**
 * VaultFormModal Component
 * 
 * Modal dialog for creating or editing vaults.
 * Requirements: 1.1, 1.2
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { VaultCreateRequest } from '../../api/types';
import styles from './VaultFormModal.module.css';

export interface VaultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VaultCreateRequest) => Promise<void>;
  initialData?: Partial<VaultCreateRequest>;
  mode?: 'create' | 'edit';
}

export const VaultFormModal: React.FC<VaultFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameId = React.useId();
  const descriptionId = React.useId();

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Vault name is required');
      return;
    }

    if (!description.trim()) {
      setError('Vault description is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
      });
      
      // Reset form and close modal on success
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vault');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={mode === 'create' ? 'Create New Vault' : 'Edit Vault'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor={nameId} className={styles.label}>
            Vault Name <span className={styles.required} aria-label="required">*</span>
          </label>
          <input
            id={nameId}
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter vault name"
            required
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={descriptionId} className={styles.label}>
            Description <span className={styles.required} aria-label="required">*</span>
          </label>
          <textarea
            id={descriptionId}
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter vault description"
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === 'create' ? 'Create Vault' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
