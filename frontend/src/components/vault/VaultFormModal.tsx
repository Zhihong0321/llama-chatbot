/**
 * VaultFormModal Component
 * 
 * Modal dialog for creating or editing vaults.
 * Requirements: 1.1, 1.2
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const VaultFormModalComponent: React.FC<VaultFormModalProps> = ({
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
  
  // Use ref for input to prevent focus loss
  const nameInputRef = useRef<HTMLInputElement>(null);

  // FIXED: Use stable IDs that never change
  const nameId = useRef(`vault-name-${Math.random().toString(36).substr(2, 9)}`).current;
  const descriptionId = useRef(`vault-desc-${Math.random().toString(36).substr(2, 9)}`).current;

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setError(null);
      
      // Focus input after a short delay to avoid conflict with Modal focus trap
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [name, description, onSubmit, onClose]);

  const handleCancel = useCallback(() => {
    setName('');
    setDescription('');
    setError(null);
    onClose();
  }, [onClose]);

  // Debug: Log when component renders
  console.log('[VaultFormModal] Render - nameId:', nameId, 'name:', name, 'Build: INPUT-FIX-V5');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={mode === 'create' ? 'Create New Vault' : 'Edit Vault'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* VERSION INDICATOR */}
        <div style={{ background: '#0000ff', color: 'white', padding: '4px 8px', marginBottom: '10px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>
          🔵 BUILD: INPUT-FIX-V5-REF | 2025-11-21-15:15 | ID: {nameId.substring(0, 15)}
        </div>
        
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
            ref={nameInputRef}
            id={nameId}
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter vault name"
            required
            disabled={isSubmitting}
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

// Memo with custom comparison
export const VaultFormModal = React.memo(VaultFormModalComponent, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onSubmit === nextProps.onSubmit &&
    prevProps.mode === nextProps.mode &&
    JSON.stringify(prevProps.initialData) === JSON.stringify(nextProps.initialData)
  );
});
