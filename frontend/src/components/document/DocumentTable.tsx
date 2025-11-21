/**
 * DocumentTable Component
 * 
 * Displays a table of documents with vault filtering and delete functionality.
 * Requirements: 2.6, 5.1
 */

import React, { useState } from 'react';
import type { Document } from '../../api/types';
import styles from './DocumentTable.module.css';

export interface DocumentTableProps {
  documents: Document[];
  onDocumentDelete?: (documentId: string) => void;
  loading?: boolean;
  vaultId?: string;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onDocumentDelete,
  loading = false,
  vaultId,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string, title: string) => {
    if (!onDocumentDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );

    if (confirmed) {
      setDeletingId(documentId);
      try {
        await onDocumentDelete(documentId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Filter documents by vault if vaultId is provided
  const filteredDocuments = vaultId
    ? documents.filter((doc) => doc.vault_id === vaultId)
    : documents;

  if (loading) {
    return (
      <div className={styles.container} role="status" aria-live="polite">
        <p className={styles.loadingText}>Loading documents...</p>
      </div>
    );
  }

  if (filteredDocuments.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyText}>
          {vaultId
            ? 'No documents found in this vault. Upload a document to get started.'
            : 'No documents found. Upload a document to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <table className={styles.table} role="table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Source</th>
            <th scope="col">Vault ID</th>
            <th scope="col">Created</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((doc) => (
            <tr key={doc.document_id}>
              <td>
                <div className={styles.titleCell}>
                  <span className={styles.title}>{doc.title}</span>
                  <span className={styles.documentId} title={doc.document_id}>
                    {doc.document_id.substring(0, 8)}...
                  </span>
                </div>
              </td>
              <td>{doc.source}</td>
              <td>
                <span className={styles.vaultId} title={doc.vault_id}>
                  {doc.vault_id.substring(0, 8)}...
                </span>
              </td>
              <td>
                <time dateTime={doc.created_at}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </time>
              </td>
              <td>
                {onDocumentDelete && (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(doc.document_id, doc.title)}
                    disabled={deletingId === doc.document_id}
                    aria-label={`Delete document ${doc.title}`}
                  >
                    {deletingId === doc.document_id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
