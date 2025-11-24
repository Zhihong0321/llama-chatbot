// import { useState } from 'react';
import { DocumentTable, DocumentUploadForm } from '../components/document';
// import { VaultSelector } from '../components/vault';
// import { useVaults } from '../hooks/useVaults';
import { useDocuments } from '../hooks/useDocuments';
import styles from './DocumentUpload.module.css';

export function DocumentUpload() {
  // VERSION MARKER - Check console to verify latest deployment
  console.log('🚀 DocumentUpload v2024-11-21-16:15 - VAULTS DISABLED');
  
  // TEMPORARILY DISABLE VAULTS - causing map errors
  // const { vaults, loading: vaultsLoading, error: vaultsError } = useVaults();
  const selectedVaultId = null;
  const { documents, loading: documentsLoading, deleteDoc, refetch } = useDocuments(selectedVaultId || undefined);

  const handleUploadComplete = () => {
    refetch();
  };

  const handleDeleteDocument = async (documentId: string) => {
    await deleteDoc(documentId);
    refetch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Document Upload</h1>
      </div>

      <div className={styles.uploadSection}>
        <h2>Upload Document</h2>
        <p style={{color: '#666', marginBottom: '1rem'}}>Note: Vault management temporarily disabled</p>
        <DocumentUploadForm
          vaultId={undefined}
          vaults={[]}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      <div className={styles.documentsSection}>
        <h2>Documents</h2>
        {documentsLoading ? (
          <div className={styles.loading}>Loading documents...</div>
        ) : (
          <DocumentTable
            documents={documents || []}
            onDocumentDelete={handleDeleteDocument}
            vaultId={selectedVaultId || undefined}
          />
        )}
      </div>
    </div>
  );
}
