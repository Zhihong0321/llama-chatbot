// Custom hook for vault operations

import { useState, useEffect, useCallback } from 'react';
import { createVault, getVaults, getVault, deleteVault } from '../api/vaults';
import type { Vault, VaultCreateRequest } from '../api/types';
import { getUserFriendlyErrorMessage } from '../api/client';

interface UseVaultsReturn {
  vaults: Vault[];
  loading: boolean;
  error: string | null;
  createVault: (data: VaultCreateRequest) => Promise<Vault>;
  deleteVault: (vaultId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing vault operations
 * 
 * Provides:
 * - Automatic fetching of vaults on mount
 * - Loading and error states
 * - CRUD operations (create, delete)
 * - Manual refetch capability
 * - Automatic cache invalidation
 */
export function useVaults(): UseVaultsReturn {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch vaults from API
   */
  const fetchVaults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getVaults();
      setVaults(data);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch vaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new vault
   */
  const handleCreateVault = useCallback(
    async (data: VaultCreateRequest): Promise<Vault> => {
      try {
        const newVault = await createVault(data);
        
        // Optimistically update local state
        setVaults(prev => [...prev, newVault]);
        
        return newVault;
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Delete a vault
   */
  const handleDeleteVault = useCallback(
    async (vaultId: string): Promise<void> => {
      try {
        await deleteVault(vaultId);
        
        // Optimistically update local state
        setVaults(prev => prev.filter(vault => vault.id !== vaultId));
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Manually refetch vaults
   */
  const refetch = useCallback(async () => {
    await fetchVaults();
  }, [fetchVaults]);

  // Fetch vaults on mount
  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  return {
    vaults,
    loading,
    error,
    createVault: handleCreateVault,
    deleteVault: handleDeleteVault,
    refetch,
  };
}

/**
 * Custom hook for fetching a single vault
 */
export function useVault(vaultId: string | null) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vaultId) {
      setVault(null);
      return;
    }

    const fetchVault = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getVault(vaultId);
        setVault(data);
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        console.error('Failed to fetch vault:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, [vaultId]);

  return { vault, loading, error };
}
