/**
 * RecentIngests Component
 * 
 * Displays the latest document ingestion jobs.
 * Requirements: 6.3
 */

import React from 'react';
import type { Document } from '../../api/types';
import styles from './RecentIngests.module.css';

export interface RecentIngestsProps {
  documents: Document[];
  loading: boolean;
  selectedVaultId: string | null;
  maxItems?: number;
}

export const RecentIngests: React.FC<RecentIngestsProps> = ({
  documents,
  loading,
  selectedVaultId,
  maxItems = 10,
}) => {
  // Defensive: ensure documents is always an array
  const safeDocuments = Array.isArray(documents) ? documents : [];

  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        Loading documents...
      </div>
    );
  }

  if (safeDocuments.length === 0) {
    return (
      <div className={styles.empty}>
        {selectedVaultId
          ? 'No documents found for this vault.'
          : 'No documents uploaded yet. Upload your first document to get started.'}
      </div>
    );
  }

  // Sort by created_at descending and take the most recent
  const recentDocuments = [...safeDocuments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, maxItems);

  return (
    <div className={styles.list}>
      {recentDocuments.map((doc) => (
        <div key={doc.document_id} className={styles.item}>
          <div className={styles.header}>
            <h3 className={styles.title}>{doc.title}</h3>
            <span className={styles.id} title={doc.document_id}>
              {doc.document_id.substring(0, 8)}...
            </span>
          </div>
          
          <div className={styles.details}>
            <div className={styles.field}>
              <span className={styles.label}>Source:</span>
              <span className={styles.value}>{doc.source}</span>
            </div>
            
            <div className={styles.field}>
              <span className={styles.label}>Vault:</span>
              <span className={styles.value} title={doc.vault_id}>
                {doc.vault_id.substring(0, 8)}...
              </span>
            </div>
            
            <div className={styles.field}>
              <span className={styles.label}>Created:</span>
              <time className={styles.timestamp} dateTime={doc.created_at}>
                {new Date(doc.created_at).toLocaleString()}
              </time>
            </div>
          </div>
          
          {doc.metadata && Object.keys(doc.metadata).length > 0 && (
            <div className={styles.metadata}>
              <span className={styles.label}>Metadata:</span>
              <pre className={styles.metadataContent}>
                {JSON.stringify(doc.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
