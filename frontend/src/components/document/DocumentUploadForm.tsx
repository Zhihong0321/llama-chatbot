/**
 * DocumentUploadForm Component
 * 
 * Form for uploading documents to a selected Vault with file validation.
 * Requirements: 2.1, 2.2, 2.5
 */

import React, { useState, useRef } from 'react';
import { useIngest } from '../../hooks/useIngest';
import { IngestProgressBar } from './IngestProgressBar';
import { VaultSelector } from '../vault/VaultSelector';
import type { Vault, IngestRequest } from '../../api/types';
import styles from './DocumentUploadForm.module.css';

export interface DocumentUploadFormProps {
  vaultId?: string;
  vaults: Vault[];
  onUploadComplete: (documentId: string) => void;
  onError?: (error: string) => void;
}

const ACCEPTED_FILE_TYPES = '.pdf,.docx,.txt,.md';
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = React.memo(({
  vaultId: initialVaultId,
  vaults,
  onUploadComplete,
  onError,
}) => {
  const { ingest, ingesting } = useIngest();
  const [selectedVaultId, setSelectedVaultId] = useState<string>(initialVaultId || '');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [metadata, setMetadata] = useState<string>('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = ACCEPTED_FILE_TYPES.split(',');
    
    if (!acceptedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please upload ${ACCEPTED_FILE_TYPES} files only.`);
      return false;
    }

    // Check MIME type if available
    if (file.type && !ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError(`Invalid file type. Please upload ${ACCEPTED_FILE_TYPES} files only.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        // Auto-fill title from filename if empty
        if (!title) {
          const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
          setTitle(nameWithoutExtension);
        }
        // Auto-fill source from filename
        setSource(selectedFile.name);
      } else {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!selectedVaultId) {
      setError('Please select a vault.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for the document.');
      return;
    }

    try {
      // Read file content
      const text = await readFileAsText(file);

      // Parse metadata if provided
      let parsedMetadata: Record<string, any> | undefined;
      if (metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch (err) {
          setError('Invalid JSON in metadata field.');
          return;
        }
      }

      // Create ingest request
      const ingestRequest: IngestRequest = {
        text,
        title: title.trim(),
        source: source.trim() || file.name,
        vault_id: selectedVaultId,
        metadata: parsedMetadata,
      };

      // Start ingestion
      const response = await ingest(ingestRequest);
      setTaskId(response.task_id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleComplete = () => {
    // Reset form
    setFile(null);
    setTitle('');
    setSource('');
    setMetadata('');
    setTaskId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Notify parent
    if (taskId) {
      onUploadComplete(taskId);
    }
  };

  const handleIngestError = (errorMessage: string) => {
    setError(errorMessage);
    setTaskId(null);
    if (onError) {
      onError(errorMessage);
    }
  };

  // Show progress bar if ingestion is in progress
  if (taskId) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Uploading Document</h3>
        <IngestProgressBar
          taskId={taskId}
          onComplete={handleComplete}
          onError={handleIngestError}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Upload Document</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="vault-select" className={styles.label}>
            Vault <span className={styles.required}>*</span>
          </label>
          <VaultSelector
            vaults={Array.isArray(vaults) ? vaults : []}
            selectedVaultId={selectedVaultId}
            onSelect={setSelectedVaultId}
            disabled={ingesting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="file-input" className={styles.label}>
            File <span className={styles.required}>*</span>
          </label>
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileChange}
            disabled={ingesting}
            className={styles.fileInput}
            aria-describedby="file-help"
          />
          <p id="file-help" className={styles.helpText}>
            Accepted formats: PDF, DOCX, TXT, MD
          </p>
          {file && (
            <p className={styles.selectedFile}>
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title-input" className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={ingesting}
            className={styles.textInput}
            placeholder="Enter document title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="source-input" className={styles.label}>
            Source
          </label>
          <input
            id="source-input"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={ingesting}
            className={styles.textInput}
            placeholder="Enter document source (optional)"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="metadata-input" className={styles.label}>
            Metadata (JSON)
          </label>
          <textarea
            id="metadata-input"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            disabled={ingesting}
            className={styles.textarea}
            placeholder='{"key": "value"}'
            rows={3}
            aria-describedby="metadata-help"
          />
          <p id="metadata-help" className={styles.helpText}>
            Optional: Add custom metadata as JSON
          </p>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={ingesting || !file || !selectedVaultId || !title.trim()}
          className={styles.submitButton}
          aria-label="Upload document"
        >
          {ingesting ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
});
