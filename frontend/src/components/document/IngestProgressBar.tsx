/**
 * IngestProgressBar Component
 * 
 * Displays real-time progress of document ingestion with polling.
 * Requirements: 2.2, 2.3, 2.4
 */

import React, { useEffect, useState } from 'react';
import { useIngest } from '../../hooks/useIngest';
import { ProgressBar } from '../common/ProgressBar';
import type { IngestStatusResponse } from '../../api/types';
import styles from './IngestProgressBar.module.css';

export interface IngestProgressBarProps {
  taskId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export const IngestProgressBar: React.FC<IngestProgressBarProps> = ({
  taskId,
  onComplete,
  onError,
}) => {
  const { pollStatus, stopPolling } = useIngest();
  const [status, setStatus] = useState<IngestStatusResponse | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!taskId || hasCompleted) return;

    const handleProgress = (statusUpdate: IngestStatusResponse) => {
      setStatus(statusUpdate);

      if (statusUpdate.status === 'done') {
        setHasCompleted(true);
        onComplete();
      } else if (statusUpdate.status === 'failed') {
        setHasCompleted(true);
        onError(statusUpdate.error || 'Ingestion failed');
      }
    };

    pollStatus(taskId, handleProgress);

    // Cleanup: stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [taskId, pollStatus, stopPolling, onComplete, onError, hasCompleted]);

  if (!status) {
    return (
      <div className={styles.container}>
        <p className={styles.statusText}>Initializing ingestion...</p>
      </div>
    );
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'queued':
        return 'Queued for processing...';
      case 'processing':
        return 'Processing document...';
      case 'done':
        return 'Ingestion complete!';
      case 'failed':
        return 'Ingestion failed';
      default:
        return 'Unknown status';
    }
  };

  const getVariant = () => {
    switch (status.status) {
      case 'done':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.statusText}>{getStatusText()}</p>
        <span className={styles.percentage}>{Math.round(status.progress)}%</span>
      </div>
      <ProgressBar
        value={status.progress}
        max={100}
        variant={getVariant()}
        aria-label={`Ingestion progress: ${Math.round(status.progress)}%`}
      />
      {status.status === 'failed' && status.error && (
        <p className={styles.errorText} role="alert">
          Error: {status.error}
        </p>
      )}
    </div>
  );
};
