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
  // Use useMemo to ensure ID is stable across renders (prevents focus loss)
  const selectId = React.useMemo(() => `vault-select-${Math.random().toString(36).substr(2, 9)}`, []);

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
        {Array.isArray(vaults) && vaults.map((vault) => (
          <option key={vault.id} value={vault.id}>
            {vault.name} - {vault.description}
          </option>
        ))}
      </select>
    </div>
  );
};
