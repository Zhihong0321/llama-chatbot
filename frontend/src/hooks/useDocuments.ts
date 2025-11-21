// useDocuments hook for document operations

import { useState, useEffect, useCallback } from 'react';
import { getDocuments, deleteDocument } from '../api/documents';
import type { Document } from '../api/types';
import { getUserFriendlyErrorMessage } from '../api/client';

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  deleteDoc: (documentId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing documents
 */
export function useDocuments(vaultId?: string): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDocuments(vaultId);
      setDocuments(data);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDoc = useCallback(
    async (documentId: string) => {
      try {
        await deleteDocument(documentId);
        // Remove the deleted document from state
        setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const refetch = useCallback(async () => {
    await fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    deleteDoc,
    refetch,
  };
}
