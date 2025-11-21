/**
 * VaultSelector Component
 * 
 * Dropdown component for selecting a Vault with glass-morphism styling.
 * Requirements: 6.1, 11.3
 */

import React from 'react';
import type { Vault } from '../../api/types';
import styles from './VaultSelector.module.css';

export interface VaultSelectorProps {
  vaults: Vault[];
  selectedVaultId: string | null;
  onSelect: (vaultId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const VaultSelector: React.FC<VaultSelectorProps> = ({
  vaults,
  selectedVaultId,
  onSelect,
  disabled = false,
  placeholder = 'Select a vault',
  label = 'Vault',
  required = false,
}) => {
  const selectId = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      onSelect(value);
    }
  };

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={styles.select}
        value={selectedVaultId || ''}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        aria-label={label}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {vaults.map((vault) => (
          <option key={vault.id} value={vault.id}>
            {vault.name} - {vault.description}
          </option>
        ))}
      </select>
    </div>
  );
};
