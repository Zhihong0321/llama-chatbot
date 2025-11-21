// useIngest hook for document ingestion with polling

import { useState, useCallback, useRef } from 'react';
import { ingestDocument, getIngestStatus } from '../api/ingest';
import type { IngestRequest, IngestResponse, IngestStatusResponse } from '../api/types';
import { getUserFriendlyErrorMessage } from '../api/client';

const POLLING_INTERVAL = 2000; // 2 seconds

interface UseIngestReturn {
  ingesting: boolean;
  error: string | null;
  ingest: (data: IngestRequest) => Promise<IngestResponse>;
  pollStatus: (
    taskId: string,
    onProgress: (status: IngestStatusResponse) => void
  ) => void;
  stopPolling: () => void;
}

/**
 * Custom hook for document ingestion with status polling
 */
export function useIngest(): UseIngestReturn {
  const [ingesting, setIngesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const ingest = useCallback(async (data: IngestRequest): Promise<IngestResponse> => {
    setIngesting(true);
    setError(null);

    try {
      const response = await ingestDocument(data);
      return response;
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      setIngesting(false);
      throw err;
    }
  }, []);

  const pollStatus = useCallback(
    (taskId: string, onProgress: (status: IngestStatusResponse) => void) => {
      // Clear any existing polling interval
      stopPolling();

      const poll = async () => {
        try {
          const status = await getIngestStatus(taskId);
          onProgress(status);

          // Stop polling if done or failed
          if (status.status === 'done' || status.status === 'failed') {
            stopPolling();
            setIngesting(false);

            if (status.status === 'failed') {
              setError(status.error || 'Ingestion failed');
            }
          }
        } catch (err) {
          const errorMessage = getUserFriendlyErrorMessage(err);
          setError(errorMessage);
          stopPolling();
          setIngesting(false);
        }
      };

      // Start polling immediately
      poll();

      // Set up interval for subsequent polls
      pollingIntervalRef.current = setInterval(poll, POLLING_INTERVAL);
    },
    [stopPolling]
  );

  return {
    ingesting,
    error,
    ingest,
    pollStatus,
    stopPolling,
  };
}

// Export polling interval for testing
export { POLLING_INTERVAL };
